"""
Nirikshak AI — API server.

Connects the React (Antigravity) frontend to the OCR/compliance pipeline.

Run from this folder:
    uvicorn api:app --host 127.0.0.1 --port 8000

Endpoints
    GET  /api/health                              server + OCR model status
    POST /api/scan                                run the full pipeline on uploaded images
    GET  /api/inspections/{id}/report.pdf         PDF report (same as Streamlit)
    GET  /api/inspections/{id}/report.json        compliance JSON
    GET  /api/inspections/{id}/ocr.json           raw OCR detections

If ../frontend/dist exists (after `npm run build`), the UI is also served at /.
"""

import base64
import importlib.util
import json
import os
import random
import tempfile
import threading
import traceback
from collections import OrderedDict
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Optional

import cv2
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles

import pipeline as pl



@asynccontextmanager
async def lifespan(_app):
    # Load PaddleOCR in the background so the first scan doesn't pay for it.
    if os.environ.get("NIRIKSHAK_PRELOAD", "1") == "1":
        threading.Thread(target=_preload_model, daemon=True).start()
    yield


app = FastAPI(title="Nirikshak AI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get(
        "NIRIKSHAK_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

SLOTS = ("front", "back", "side")
MAX_STORED_INSPECTIONS = 30
_STORE: "OrderedDict[str, dict]" = OrderedDict()
_STORE_LOCK = threading.Lock()

_model_state = {"status": "not_loaded", "error": None}


# ============================================================
# Model preloading
# ============================================================
def _preload_model():
    _model_state["status"] = "loading"
    try:
        pl.get_ocr_engine(False)
        _model_state["status"] = "ready"
    except Exception as e:  # surfaced through /api/health
        _model_state["status"] = "error"
        _model_state["error"] = f"{type(e).__name__}: {e}"
        traceback.print_exc()


# ============================================================
# Mapping pipeline output -> frontend `Inspection` type
# ============================================================
UI_STATUS = {"PASS": "Compliant", "FAIL": "Non-Compliant", "WARNING": "Requires Review"}
STATUS_RANK = {"PASS": 0, "WARNING": 1, "FAIL": 2}

RULE_TEXT = {
    "R_MFR_PRESENT": (
        "Manufacturer / Packer / Importer",
        "Name and address of the manufacturer, packer or importer should be declared on the label.",
    ),
    "R_NETQTY_PRESENT": (
        "Net Quantity",
        "Net quantity should be declared with a standard unit (g, kg, ml, l, pieces).",
    ),
    "R_MRP_PRESENT": ("MRP Declaration", "Maximum Retail Price should be declared."),
    "R_DATE_PRESENT": (
        "Month & Year of Manufacture / Packing / Import",
        "Month and year of manufacture, packing or import should be declared.",
    ),
    "R_CARE_PRESENT": (
        "Consumer Care Details",
        "Consumer care contact (phone number, e-mail or complaint address) should be declared.",
    ),
    "R_ORIGIN_PRESENT": ("Country of Origin", "Country of origin should be declared."),
    "R_MRP_TAX": (
        "MRP — Inclusive of All Taxes",
        'MRP declaration should clearly state "inclusive of all taxes".',
    ),
    "R_DATE_FORMAT": ("Date Format", "Date declaration should include the month and a 4-digit year."),
    "R_FONT_HEIGHT": (
        "Font Height",
        "Character height should meet the minimum for the declared net quantity. "
        "Thresholds in the rule engine are illustrative and must be verified against the gazette.",
    ),
}


def _recommended_action(rule):
    if rule["status"] == "PASS":
        return None
    if rule["rule_id"] == "R_FONT_HEIGHT" and rule["status"] == "WARNING":
        return "Re-run the scan with a mm/pixel calibration value, or measure the character height physically."
    if rule["status"] == "WARNING":
        return "Officer to verify this declaration manually."
    return "Automated finding — officer to verify on the physical package before any enforcement action."


def _severity(rule):
    if rule["status"] == "FAIL":
        return "High" if rule["rule_id"].endswith("_PRESENT") else "Medium"
    if rule["status"] == "WARNING":
        return "Low"
    return None


def _bbox_to_percent(bbox, shape):
    h, w = shape[:2]
    xs = [p[0] for p in bbox]
    ys = [p[1] for p in bbox]
    x0, x1 = max(min(xs), 0), min(max(xs), w)
    y0, y1 = max(min(ys), 0), min(max(ys), h)
    return {
        "x": round(100 * x0 / w, 3),
        "y": round(100 * y0 / h, 3),
        "width": round(100 * max(x1 - x0, 1) / w, 3),
        "height": round(100 * max(y1 - y0, 1) / h, 3),
    }


def _encode_jpeg_data_url(image):
    ok, buf = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, 90])
    if not ok:
        return ""
    return "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode("ascii")


def build_inspection(inspection_id, meta, all_results, merged_fields, rule_results, report):
    slot_of = {r["name"]: r["name"].split(".")[0] for r in all_results}
    shape_of = {slot_of[r["name"]]: r["preprocessed"].shape for r in all_results}

    counts = report["summary"]
    total = len(rule_results)
    if report["overall_status"] == "NON-COMPLIANT":
        status = "Non-Compliant"
    elif counts["warning"]:
        status = "Requires Review"
    else:
        status = "Compliant"

    # Worst status per field, for box colouring.
    field_status = {}
    for r in rule_results:
        cur = field_status.get(r["field"])
        if cur is None or STATUS_RANK[r["status"]] > STATUS_RANK[cur]:
            field_status[r["field"]] = r["status"]

    boxes, evidence_by_field = [], {}
    for field, data in merged_fields.items():
        if not data.get("found"):
            continue
        slot = slot_of.get(data.get("source_image"), "front")
        region = _bbox_to_percent(data["bbox"], shape_of[slot])
        evidence_by_field[field] = {"imageKey": slot, **region}
        boxes.append({
            "id": f"box-{field}",
            "label": pl.FIELD_LABELS[field],
            **region,
            "status": UI_STATUS[field_status.get(field, "PASS")],
            "ruleRef": ", ".join(r["rule_id"] for r in rule_results if r["field"] == field),
            "detectedText": data.get("text", ""),
            "imageKey": slot,
        })

    checklist = []
    for i, r in enumerate(rule_results):
        data = merged_fields.get(r["field"], {"found": False})
        requirement, expected = RULE_TEXT.get(r["rule_id"], (r["rule_id"], None))
        if r["rule_id"] == "R_FONT_HEIGHT":
            requirement = f"Font Height — {pl.FIELD_LABELS[r['field']]}"
        found = data.get("found", False)
        checklist.append({
            "id": f"chk-{i + 1}",
            "requirement": requirement,
            "ruleRef": r["rule_id"],
            "detectedValue": data.get("text") if found else "Not detected",
            "status": UI_STATUS[r["status"]],
            "confidence": round(100 * data["confidence"]) if found else 0,
            "observation": r["message"],
            "expectedValue": expected,
            "severity": _severity(r),
            "recommendedAction": _recommended_action(r),
            "field": r["field"],
            "evidence": evidence_by_field.get(r["field"]),
        })

    ocr = {}
    for result in all_results:
        slot = slot_of[result["name"]]
        ocr[slot] = [
            {
                "text": d["text"],
                "confidence": round(100 * d["confidence"]),
                "heightPx": d["height_px"],
                "heightMm": d.get("height_mm"),
                **_bbox_to_percent(d["bbox"], result["preprocessed"].shape),
            }
            for d in result["detections"]
        ]

    manufacturer = meta["manufacturer"].strip()
    if not manufacturer and merged_fields["manufacturer_address"].get("found"):
        manufacturer = merged_fields["manufacturer_address"]["text"]

    return {
        "id": inspection_id,
        "productId": "SCAN-" + inspection_id.split("-")[-1],
        "productName": meta["product_name"],
        "manufacturer": manufacturer or "Not detected",
        "category": meta["category"] or "Uncategorised",
        "batchLot": meta["batch_lot"] or "—",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "location": meta["location"] or "—",
        "inspectorName": meta["inspector_name"] or "—",
        "score": round(100 * counts["pass"] / total) if total else 0,
        "status": status,
        "totalChecks": total,
        "compliantCount": counts["pass"],
        "reviewCount": counts["warning"],
        "violationCount": counts["fail"],
        "images": {
            slot_of[r["name"]]: _encode_jpeg_data_url(r["preprocessed"]) for r in all_results
        },
        "imageSizes": {
            slot: {"width": int(shape[1]), "height": int(shape[0])} for slot, shape in shape_of.items()
        },
        "boundingBoxes": boxes,
        "checklist": checklist,
        "ocr": ocr,
        "source": "model",
        "calibrated": meta["mm_per_px"] is not None,
        "reportAvailable": {"pdf": True, "json": True},
        "overallStatusRaw": report["overall_status"],
    }


# ============================================================
# Routes
# ============================================================
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "paddleocrInstalled": importlib.util.find_spec("paddleocr") is not None,
        "model": _model_state["status"] if not pl.ocr_engine_loaded(False) else "ready",
        "modelError": _model_state["error"],
    }


@app.post("/api/scan")
def scan(
    front: UploadFile = File(...),
    back: Optional[UploadFile] = File(None),
    side: Optional[UploadFile] = File(None),
    product_name: str = Form("Unnamed Product"),
    category: str = Form(""),
    manufacturer: str = Form(""),
    batch_lot: str = Form(""),
    location: str = Form(""),
    inspector_name: str = Form(""),
    mm_per_px: Optional[float] = Form(None),
    use_gpu: bool = Form(False),
):
    if mm_per_px is not None and mm_per_px <= 0:
        mm_per_px = None

    uploads = {"front": front, "back": back, "side": side}
    all_results = []

    for slot in SLOTS:
        upload = uploads[slot]
        if upload is None:
            continue
        image_bytes = upload.file.read()
        if not image_bytes:
            continue
        try:
            all_results.append(
                pl.process_image(f"{slot}.png", image_bytes, mm_per_px=mm_per_px, use_gpu=use_gpu)
            )
        except ValueError as e:
            raise HTTPException(400, f"Could not read the {slot} image ({upload.filename}): {e}")
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(
                500,
                f"OCR pipeline failed on the {slot} image: {type(e).__name__}: {e}. "
                "If this is a Paddle/PIR error, set FLAGS_enable_pir_api=0 and restart the server; "
                "if it is a GPU/cuDNN error, turn GPU off.",
            )

    if not all_results:
        raise HTTPException(400, "Upload at least the front label image.")

    merged_fields = pl.merge_fields(all_results)
    rule_results = pl.ComplianceRuleEngine(merged_fields).run_all()
    report = pl.make_report(product_name, merged_fields, rule_results)

    inspection_id = f"LM-{datetime.now():%Y}-{random.randint(20000, 99999)}"
    report["inspection_id"] = inspection_id

    pdf_bytes = None
    try:
        with tempfile.TemporaryDirectory() as tmp:
            pdf_bytes = pl.build_pdf_report(report, all_results, str(Path(tmp) / "report.pdf"))
    except Exception:
        traceback.print_exc()

    meta = {
        "product_name": product_name,
        "category": category,
        "manufacturer": manufacturer,
        "batch_lot": batch_lot,
        "location": location,
        "inspector_name": inspector_name,
        "mm_per_px": mm_per_px,
    }
    inspection = build_inspection(inspection_id, meta, all_results, merged_fields, rule_results, report)
    inspection["reportAvailable"]["pdf"] = pdf_bytes is not None

    ocr_export = [{"image": r["name"], "detections": r["detections"]} for r in all_results]
    with _STORE_LOCK:
        _STORE[inspection_id] = {"report": report, "ocr": ocr_export, "pdf": pdf_bytes}
        while len(_STORE) > MAX_STORED_INSPECTIONS:
            _STORE.popitem(last=False)

    return inspection


def _stored(inspection_id):
    with _STORE_LOCK:
        item = _STORE.get(inspection_id)
    if item is None:
        raise HTTPException(404, "Inspection not found. Reports are kept in memory until the server restarts.")
    return item


def _download(content, media_type, filename):
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/inspections/{inspection_id}/report.pdf")
def report_pdf(inspection_id: str):
    item = _stored(inspection_id)
    if item["pdf"] is None:
        raise HTTPException(500, "PDF generation failed for this inspection — check the server log.")
    return _download(item["pdf"], "application/pdf", f"{inspection_id}_compliance_report.pdf")


@app.get("/api/inspections/{inspection_id}/report.json")
def report_json(inspection_id: str):
    item = _stored(inspection_id)
    body = json.dumps(item["report"], indent=2, ensure_ascii=False).encode("utf-8")
    return _download(body, "application/json", f"{inspection_id}_compliance_report.json")


@app.get("/api/inspections/{inspection_id}/ocr.json")
def ocr_json(inspection_id: str):
    item = _stored(inspection_id)
    body = json.dumps(item["ocr"], indent=2, ensure_ascii=False).encode("utf-8")
    return _download(body, "application/json", f"{inspection_id}_ocr_output.json")


# ============================================================
# Serve the built React app (optional)
# ============================================================
_DIST = Path(os.environ.get("NIRIKSHAK_FRONTEND_DIST", Path(__file__).resolve().parent.parent / "frontend" / "dist"))
if _DIST.is_dir():
    app.mount("/", StaticFiles(directory=_DIST, html=True), name="frontend")
