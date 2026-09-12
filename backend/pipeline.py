"""
Nirikshak AI — Legal Metrology compliance pipeline.

This module holds the computer-vision / OCR / rule-engine code that used to live
inside the Streamlit app, so that BOTH interfaces share one implementation:

  * app.py  — the original Streamlit interface
  * api.py  — the FastAPI server used by the React (Antigravity) frontend

Stage 1: preprocessing  •  Stage 2: OCR  •  Stage 3: declaration extraction
Stage 4: compliance rules  •  PDF report generation
"""

import os
import re
import tempfile
import threading
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape

import cv2
import numpy as np
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak

# PaddleX defaults to ~/.paddlex for model downloads.  That directory can be
# read-only in sandboxed or managed installations, so use a writable temporary
# cache unless the operator has supplied a project-specific location.
os.environ.setdefault("PADDLE_PDX_CACHE_HOME", os.path.join(tempfile.gettempdir(), "paddlex"))

# Paddle 3 defaults to the PIR runtime.  PaddleOCR/PaddleX 3 can fail while
# creating its first CPU predictor with ``PDX has already been initialized``
# under that runtime, and an in-process retry is then impossible.  Select the
# stable compatibility runtime *before* PaddleOCR imports Paddle/PaddleX.
os.environ.setdefault("FLAGS_enable_pir_api", "0")


# ============================================================
# OCR engine (shared, thread-safe)
# ============================================================
# PaddleOCR is imported lazily so the API server can start (and report its
# health) even before the model has finished loading.
_ENGINES = {}
_ENGINE_LOCK = threading.Lock()
_PREDICT_LOCK = threading.Lock()


def get_ocr_engine(use_gpu=False):
    key = "gpu" if use_gpu else "cpu"
    with _ENGINE_LOCK:
        if key not in _ENGINES:
            from paddleocr import PaddleOCR

            _ENGINES[key] = PaddleOCR(
                use_textline_orientation=True,
                lang="en",
                device="gpu:0" if use_gpu else "cpu",
                enable_mkldnn=False,
            )
        return _ENGINES[key]


def ocr_engine_loaded(use_gpu=False):
    return ("gpu" if use_gpu else "cpu") in _ENGINES


# ============================================================
# Stage 1 — preprocessing
# ============================================================
def deskew(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.bitwise_not(gray)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) < 10:
        return image

    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    if abs(angle) < 0.5 or abs(angle) > 20:
        return image

    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(
        image, M, (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE
    )


def denoise_and_enhance(image):
    denoised = cv2.fastNlMeansDenoisingColored(image, None, 7, 7, 7, 21)
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l)
    enhanced = cv2.merge((l_enhanced, a, b))
    return cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)


def preprocess_image(image_bytes):
    arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode the uploaded image.")
    image = deskew(image)
    image = denoise_and_enhance(image)
    return image


# ============================================================
# Stage 2 — OCR
# ============================================================
def run_ocr(image, mm_per_px=None, use_gpu=False):
    engine = get_ocr_engine(use_gpu)
    # PaddleOCR predictors are not safe to call concurrently.
    with _PREDICT_LOCK:
        results = engine.predict(image)

    detections = []
    if not results:
        return detections

    for res in results:
        texts = res.get("rec_texts", [])
        scores = res.get("rec_scores", [])
        polys = res.get("rec_polys", res.get("rec_boxes", []))

        for text, confidence, poly in zip(texts, scores, polys):
            pts = np.array(poly).reshape(-1, 2)
            ys = pts[:, 1]
            xs = pts[:, 0]
            height_px = float(max(ys) - min(ys))
            width_px = float(max(xs) - min(xs))

            entry = {
                "text": str(text),
                "confidence": round(float(confidence), 3),
                "bbox": [[round(float(x), 1), round(float(y), 1)] for x, y in pts],
                "height_px": round(height_px, 1),
                "width_px": round(width_px, 1),
            }
            if mm_per_px:
                entry["height_mm"] = round(height_px * mm_per_px, 2)

            detections.append(entry)

    return detections


def draw_detections(image, detections):
    vis = image.copy()
    for index, det in enumerate(detections, start=1):
        pts = np.array(det["bbox"], dtype=np.int32)
        cv2.polylines(vis, [pts], True, (0, 255, 0), 2)
        x, y = pts[0]
        # Number each detection so the package image can be matched directly
        # to the numbered OCR table in the PDF report.  A filled black label
        # keeps the marking readable on both light and colourful packages.
        label = f"OCR {index}"
        (label_w, label_h), baseline = cv2.getTextSize(
            label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1
        )
        label_y = max(int(y) - 5, label_h + baseline + 4)
        cv2.rectangle(
            vis,
            (int(x), label_y - label_h - baseline - 4),
            (int(x) + label_w + 6, label_y + 3),
            (0, 0, 0),
            thickness=-1,
        )
        cv2.putText(
            vis, label, (int(x) + 3, label_y),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA
        )
    return vis


# ============================================================
# Stage 3 — field extraction
# ============================================================
MRP_PATTERN = re.compile(
    r"(?:M\.?R\.?P\.?|MAX(?:IMUM)?\s*RETAIL\s*PRICE)\s*[:\-]?\s*"
    r"(?:Rs\.?|INR|₹)?\s*([0-9]+(?:[.,][0-9]+)?)",
    re.IGNORECASE,
)

MRP_TAX_INCLUSIVE_PATTERN = re.compile(
    r"incl(?:usive|\.)?\s*(?:of)?\s*(?:all\s*)?tax", re.IGNORECASE
)

NET_QTY_PATTERN = re.compile(
    r"(?:NET\s*(?:QTY|QUANTITY|WT|WEIGHT|CONTENTS)?\s*[:\-]?\s*)?"
    r"([0-9]+(?:\.[0-9]+)?)\s*"
    r"(g|gm|gms|grams?|kg|kgs?|ml|mls?|l|litre?s?|ltr|pcs?|pieces?|n|nos?)\b",
    re.IGNORECASE,
)

DATE_PATTERN = re.compile(
    r"\b(0[1-9]|1[0-2])[\/\-\.](\d{4})\b"
    r"|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)"
    r"[a-z]*\.?\s*(\d{4})\b",
    re.IGNORECASE,
)

DATE_KEYWORDS = re.compile(
    r"(?:MFG|MFD|MANUFACTURED?|PACK(?:ED|ING)?|IMPORT(?:ED)?)\s*"
    r"(?:DATE|ON|D\.?O\.?M\.?)?", re.IGNORECASE
)

CONSUMER_CARE_KEYWORDS = re.compile(
    r"customer\s*care|consumer\s*care|toll\s*free|helpline|"
    r"for\s*(?:complaints|queries|feedback)|write\s*to\s*us",
    re.IGNORECASE,
)

PHONE_PATTERN = re.compile(r"(?:\+91[\-\s]?)?[6-9]\d{9}\b")
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")

COUNTRY_OF_ORIGIN_PATTERN = re.compile(
    r"country\s*of\s*origin\s*[:\-]?\s*([A-Za-z ]+)", re.IGNORECASE
)

MANUFACTURER_KEYWORDS = re.compile(
    r"marketed\s*by|manufactured\s*by|packed\s*by|mfg\.?\s*by|"
    r"importe[dr]\s*by|packer|manufacturer",
    re.IGNORECASE,
)


def classify_block(text):
    matches = {}

    mrp_m = MRP_PATTERN.search(text)
    if mrp_m:
        matches["mrp"] = {
            "value": mrp_m.group(1),
            "tax_inclusive_stated": bool(MRP_TAX_INCLUSIVE_PATTERN.search(text)),
        }

    qty_m = NET_QTY_PATTERN.search(text)
    if qty_m:
        matches["net_quantity"] = {
            "value": qty_m.group(1),
            "unit": qty_m.group(2).lower(),
        }

    date_m = DATE_PATTERN.search(text)
    if date_m and DATE_KEYWORDS.search(text):
        matches["mfg_date"] = {"raw": date_m.group(0)}
    elif date_m:
        matches.setdefault("mfg_date_candidate", {"raw": date_m.group(0)})

    if (
        CONSUMER_CARE_KEYWORDS.search(text)
        or PHONE_PATTERN.search(text)
        or EMAIL_PATTERN.search(text)
    ):
        matches["consumer_care"] = {
            "phone": PHONE_PATTERN.findall(text),
            "email": EMAIL_PATTERN.findall(text),
            "has_keyword": bool(CONSUMER_CARE_KEYWORDS.search(text)),
        }

    origin_m = COUNTRY_OF_ORIGIN_PATTERN.search(text)
    if origin_m:
        matches["country_of_origin"] = {"value": origin_m.group(1).strip()}

    if MANUFACTURER_KEYWORDS.search(text):
        matches["manufacturer_address"] = {"raw": text}

    return matches


def extract_fields(detections):
    fields = {
        "manufacturer_address": {"found": False},
        "net_quantity": {"found": False},
        "mrp": {"found": False},
        "mfg_date": {"found": False},
        "consumer_care": {"found": False},
        "country_of_origin": {"found": False},
    }

    for det in detections:
        block_matches = classify_block(det["text"])

        for field_name, value in block_matches.items():
            if field_name not in fields:
                continue
            if not fields[field_name]["found"]:
                fields[field_name] = {
                    "found": True,
                    "text": det["text"],
                    "parsed": value,
                    "bbox": det["bbox"],
                    "height_px": det["height_px"],
                    "height_mm": det.get("height_mm"),
                    "confidence": det["confidence"],
                }

    return fields


# ============================================================
# Stage 4 — compliance rules
# ============================================================
FONT_HEIGHT_RULES = [
    {"max_qty_g_or_ml": 200, "min_height_mm": 1.0},
    {"max_qty_g_or_ml": 1000, "min_height_mm": 2.0},
    {"max_qty_g_or_ml": None, "min_height_mm": 4.0},
]


def min_font_height_for_qty(qty_value, unit):
    qty_g_ml = (
        qty_value * 1000
        if unit in ("kg", "kgs", "l", "litre", "litres", "ltr")
        else qty_value
    )
    for rule in FONT_HEIGHT_RULES:
        if rule["max_qty_g_or_ml"] is None or qty_g_ml <= rule["max_qty_g_or_ml"]:
            return rule["min_height_mm"]
    return FONT_HEIGHT_RULES[-1]["min_height_mm"]


class ComplianceRuleEngine:
    def __init__(self, fields):
        self.fields = fields
        self.results = []

    def _add(self, rule_id, field, status, message):
        self.results.append({
            "rule_id": rule_id,
            "field": field,
            "status": status,
            "message": message,
        })

    def check_presence(self, field, rule_id, label):
        data = self.fields.get(field, {"found": False})
        if data["found"]:
            self._add(rule_id, field, "PASS", f"{label} declaration present.")
        else:
            self._add(rule_id, field, "FAIL", f"{label} declaration is missing.")

    def check_mrp_tax_inclusive(self):
        data = self.fields.get("mrp", {"found": False})
        if not data["found"]:
            return
        tax_stated = data.get("parsed", {}).get("tax_inclusive_stated", False)
        if tax_stated:
            self._add("R_MRP_TAX", "mrp", "PASS", "MRP states inclusive of all taxes.")
        else:
            self._add(
                "R_MRP_TAX", "mrp", "FAIL",
                'MRP does not clearly state "inclusive of all taxes".'
            )

    def check_mfg_date_format(self):
        data = self.fields.get("mfg_date", {"found": False})
        if not data["found"]:
            return
        raw = data.get("parsed", {}).get("raw", "")
        if re.search(r"\d{4}", raw):
            self._add(
                "R_DATE_FORMAT", "mfg_date", "PASS",
                f'Date "{raw}" includes a 4-digit year.'
            )
        else:
            self._add(
                "R_DATE_FORMAT", "mfg_date", "FAIL",
                f'Date "{raw}" format looks incomplete.'
            )

    def check_font_height(self):
        qty_data = self.fields.get("net_quantity", {"found": False})
        if not qty_data["found"]:
            return

        try:
            qty_value = float(qty_data["parsed"]["value"])
            unit = qty_data["parsed"]["unit"]
            min_mm = min_font_height_for_qty(qty_value, unit)
        except (KeyError, ValueError):
            self._add(
                "R_FONT_HEIGHT", "net_quantity", "WARNING",
                "Could not parse quantity value/unit for font-height threshold lookup."
            )
            return

        for check_field, label in [
            ("net_quantity", "Net quantity"),
            ("mrp", "MRP"),
        ]:
            data = self.fields.get(check_field, {"found": False})
            if not data["found"]:
                continue

            height_mm = data.get("height_mm")
            if height_mm is None:
                self._add(
                    "R_FONT_HEIGHT", check_field, "WARNING",
                    f"{label} text found but no mm calibration is available — "
                    f"cannot verify the {min_mm}mm minimum height requirement."
                )
            elif height_mm >= min_mm:
                self._add(
                    "R_FONT_HEIGHT", check_field, "PASS",
                    f"{label} font height {height_mm}mm meets {min_mm}mm minimum."
                )
            else:
                self._add(
                    "R_FONT_HEIGHT", check_field, "FAIL",
                    f"{label} font height {height_mm}mm is below the {min_mm}mm "
                    f"minimum required for a {qty_value}{unit} pack."
                )

    def run_all(self):
        self.check_presence(
            "manufacturer_address", "R_MFR_PRESENT",
            "Manufacturer/packer/importer name & address"
        )
        self.check_presence(
            "net_quantity", "R_NETQTY_PRESENT", "Net quantity"
        )
        self.check_presence("mrp", "R_MRP_PRESENT", "MRP")
        self.check_presence(
            "mfg_date", "R_DATE_PRESENT",
            "Month & year of manufacture/packing/import"
        )
        self.check_presence(
            "consumer_care", "R_CARE_PRESENT", "Consumer care details"
        )
        self.check_presence(
            "country_of_origin", "R_ORIGIN_PRESENT", "Country of origin"
        )

        self.check_mrp_tax_inclusive()
        self.check_mfg_date_format()
        self.check_font_height()

        return self.results


def make_report(product_name, fields, rule_results):
    return {
        "product_name": product_name,
        "scanned_at": datetime.now().isoformat(timespec="seconds"),
        "overall_status": (
            "COMPLIANT"
            if all(r["status"] != "FAIL" for r in rule_results)
            else "NON-COMPLIANT"
        ),
        "summary": {
            "pass": sum(r["status"] == "PASS" for r in rule_results),
            "fail": sum(r["status"] == "FAIL" for r in rule_results),
            "warning": sum(r["status"] == "WARNING" for r in rule_results),
        },
        "rule_results": rule_results,
        "declarations": {
            field: {
                "found": data["found"],
                "text": data.get("text"),
            }
            for field, data in fields.items()
        },
    }


def to_rgb(bgr):
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)



# ============================================================
# PDF report generation
# ============================================================
def build_pdf_report(report, all_results, output_path):
    """Create a self-contained PDF compliance report."""
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=18,
        leading=22,
        spaceAfter=10,
    )
    heading_style = ParagraphStyle(
        "ReportHeading",
        parent=styles["Heading2"],
        fontSize=13,
        leading=16,
        spaceBefore=8,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["BodyText"],
        fontSize=8.5,
        leading=11,
    )

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    story = []

    story.append(Paragraph("Legal Metrology Compliance Report", title_style))
    story.append(Paragraph(
        f"<b>Product:</b> {escape(str(report.get('product_name', 'Unnamed Product')))}",
        body_style
    ))
    story.append(Paragraph(
        f"<b>Scanned at:</b> {report.get('scanned_at', '')}",
        body_style
    ))
    story.append(Spacer(1, 6))

    overall = report.get("overall_status", "UNKNOWN")
    story.append(Paragraph(f"<b>Overall Status:</b> {overall}", heading_style))

    summary = report.get("summary", {})
    summary_data = [
        ["PASS", "FAIL", "WARNING"],
        [
            str(summary.get("pass", 0)),
            str(summary.get("fail", 0)),
            str(summary.get("warning", 0)),
        ],
    ]
    summary_table = Table(summary_data, colWidths=[45 * mm] * 3)
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EAEAEA")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(summary_table)

    story.append(Paragraph("Mandatory Declaration Fields", heading_style))

    labels = {
        "manufacturer_address": "Manufacturer / packer / importer",
        "net_quantity": "Net quantity",
        "mrp": "MRP",
        "mfg_date": "Manufacturing / packing / import date",
        "consumer_care": "Consumer care",
        "country_of_origin": "Country of origin",
    }

    declaration_data = [["Declaration", "Status", "Detected text"]]
    for field, label in labels.items():
        data = report.get("declarations", {}).get(field, {})
        declaration_data.append([
            label,
            "FOUND" if data.get("found") else "MISSING",
            str(data.get("text") or ""),
        ])

    declaration_table = Table(
        declaration_data,
        colWidths=[48 * mm, 25 * mm, 100 * mm],
        repeatRows=1,
    )
    declaration_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EAEAEA")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(declaration_table)

    story.append(Paragraph("Rule Results", heading_style))

    rule_data = [["Rule", "Field", "Status", "Message"]]
    for rule in report.get("rule_results", []):
        rule_data.append([
            str(rule.get("rule_id", "")),
            str(rule.get("field", "")),
            str(rule.get("status", "")),
            str(rule.get("message", "")),
        ])

    rule_table = Table(
        rule_data,
        colWidths=[27 * mm, 32 * mm, 23 * mm, 91 * mm],
        repeatRows=1,
    )
    rule_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EAEAEA")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(rule_table)

    # Add images and OCR details.
    for result in all_results:
        story.append(PageBreak())
        story.append(Paragraph(
            f"Image Analysis — {escape(str(result['name']))}",
            heading_style
        ))

        annotated = draw_detections(
            result["preprocessed"],
            result["detections"]
        )

        image_path = Path(output_path).parent / (
            Path(result["name"]).stem + "_annotated.png"
        )
        cv2.imwrite(str(image_path), annotated)

        # Scale image to fit A4 width.
        h, w = annotated.shape[:2]
        max_w = 175 * mm
        max_h = 220 * mm
        scale = min(max_w / w, max_h / h)
        story.append(RLImage(str(image_path), width=w * scale, height=h * scale))

        story.append(Spacer(1, 8))
        story.append(Paragraph(
            f"OCR detected {len(result['detections'])} text regions. "
            "The green boxes and OCR numbers on the image correspond to the rows below.",
            body_style
        ))

        ocr_data = [["#", "OCR Text", "Confidence", "Height px", "Height mm"]]
        for i, det in enumerate(result["detections"]):
            ocr_data.append([
                str(i + 1),
                str(det.get("text", "")),
                str(det.get("confidence", "")),
                str(det.get("height_px", "")),
                str(det.get("height_mm", "")),
            ])

        ocr_table = Table(
            ocr_data,
            colWidths=[8 * mm, 105 * mm, 22 * mm, 20 * mm, 20 * mm],
            repeatRows=1,
        )
        ocr_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EAEAEA")),
            ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 6.5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(ocr_table)

    story.append(PageBreak())
    story.append(Paragraph("Prototype Disclaimer", heading_style))
    story.append(Paragraph(
        "This report is generated by the internal prototype. The current notebook "
        "describes some font-height thresholds as illustrative and requiring verification "
        "against the applicable Legal Metrology requirements. This output should not be "
        "treated as legal certification or a final regulatory determination.",
        body_style
    ))

    doc.build(story)

    # Remove temporary annotated images after PDF creation.
    for result in all_results:
        temp = Path(output_path).parent / (
            Path(result["name"]).stem + "_annotated.png"
        )
        try:
            temp.unlink(missing_ok=True)
        except Exception:
            pass

    return Path(output_path).read_bytes()


# ============================================================
# Multi-image merge (shared by Streamlit + API)
# ============================================================
FIELD_NAMES = [
    "manufacturer_address",
    "net_quantity",
    "mrp",
    "mfg_date",
    "consumer_care",
    "country_of_origin",
]

FIELD_LABELS = {
    "manufacturer_address": "Manufacturer / packer / importer",
    "net_quantity": "Net quantity",
    "mrp": "MRP",
    "mfg_date": "Manufacturing / packing / import date",
    "consumer_care": "Consumer care",
    "country_of_origin": "Country of origin",
}


def merge_fields(all_results):
    """Take the first detection of each field across all uploaded images."""
    merged_fields = {name: {"found": False} for name in FIELD_NAMES}

    for result in all_results:
        for field in FIELD_NAMES:
            data = result["fields"].get(field, {"found": False})
            if data["found"] and not merged_fields[field]["found"]:
                merged_fields[field] = {
                    **data,
                    "source_image": result["name"]
                }

    return merged_fields


def process_image(name, image_bytes, mm_per_px=None, use_gpu=False):
    """Stages 1–3 for one image."""
    preprocessed = preprocess_image(image_bytes)
    detections = run_ocr(preprocessed, mm_per_px=mm_per_px, use_gpu=use_gpu)
    fields = extract_fields(detections)
    return {
        "name": name,
        "preprocessed": preprocessed,
        "detections": detections,
        "fields": fields,
    }
