"""
Legal Metrology Compliance Checker — Streamlit interface.

The pipeline itself now lives in pipeline.py so the React frontend (via api.py)
and this Streamlit app run exactly the same code.
"""

import json
from pathlib import Path

import pandas as pd
import streamlit as st

from pipeline import (
    FIELD_LABELS,
    ComplianceRuleEngine,
    build_pdf_report,
    draw_detections,
    get_ocr_engine,
    make_report,
    merge_fields,
    ocr_engine_loaded,
    process_image,
    to_rgb,
)


# ============================================================
# Page configuration
# ============================================================
st.set_page_config(
    page_title="Legal Metrology Compliance Checker",
    page_icon="⚖️",
    layout="wide",
)

st.title("Legal Metrology Compliance Checker")
st.caption("Stage 1: preprocessing  •  Stage 2: OCR  •  Stage 3: declaration extraction  •  Stage 4: compliance rules")

# ============================================================
# Sidebar
# ============================================================
with st.sidebar:
    st.header("Scan Settings")
    product_name = st.text_input("Product name", "Sample Product")

    uploaded_files = st.file_uploader(
        "Upload label image(s)",
        type=["jpg", "jpeg", "png", "webp"],
        accept_multiple_files=True,
        help="Upload one or more photos of the same product label."
    )

    st.subheader("OCR")
    use_gpu = st.checkbox(
        "Use GPU",
        value=False,
        help="Keep OFF for the Windows CPU setup used by the notebook."
    )

    st.subheader("Font-size calibration")
    use_calibration = st.checkbox("I have mm/pixel calibration", value=False)
    mm_per_px = None
    if use_calibration:
        mm_per_px = st.number_input(
            "mm per pixel",
            min_value=0.000001,
            value=0.01,
            format="%.6f"
        )

    run_button = st.button("Run Compliance Check", type="primary", use_container_width=True)

st.info(
    "Prototype scope: the interface uses the same preprocessing, PaddleOCR extraction, "
    "field classification, and rule-engine structure as the supplied notebook. "
    "The notebook itself marks the font-height thresholds as illustrative and says they "
    "must be verified against the actual gazette before real-world use."
)

if not uploaded_files:
    st.markdown("### How to use")
    st.write("1. Upload the front/back/side label photos.")
    st.write("2. Optionally enter a calibrated mm/pixel value.")
    st.write("3. Click **Run Compliance Check**.")
    st.write("4. Review the declaration table, OCR output, and compliance result.")
    st.stop()

if run_button:
    all_results = []

    progress = st.progress(0)
    status = st.empty()

    if not ocr_engine_loaded(use_gpu):
        with st.spinner("Loading PaddleOCR model..."):
            get_ocr_engine(use_gpu)

    for idx, uploaded in enumerate(uploaded_files):
        status.write(f"Processing **{uploaded.name}**...")
        try:
            all_results.append(process_image(
                uploaded.name,
                uploaded.getvalue(),
                mm_per_px=mm_per_px,
                use_gpu=use_gpu,
            ))
        except Exception as e:
            st.error(f"Failed to process {uploaded.name}: {e}")
            st.exception(e)

        progress.progress((idx + 1) / len(uploaded_files))

    status.empty()

    if not all_results:
        st.stop()

    # Merge fields across all uploaded images.
    merged_fields = merge_fields(all_results)

    engine = ComplianceRuleEngine(merged_fields)
    rule_results = engine.run_all()
    report = make_report(product_name, merged_fields, rule_results)

    st.session_state["results"] = all_results
    st.session_state["merged_fields"] = merged_fields
    st.session_state["rule_results"] = rule_results
    st.session_state["report"] = report


# ============================================================
# Results
# ============================================================
if "report" not in st.session_state:
    st.stop()

report = st.session_state["report"]
merged_fields = st.session_state["merged_fields"]
rule_results = st.session_state["rule_results"]
all_results = st.session_state["results"]

summary = report["summary"]

st.divider()
st.subheader("Compliance Summary")

c1, c2, c3, c4 = st.columns(4)
c1.metric("Overall", report["overall_status"])
c2.metric("PASS", summary["pass"])
c3.metric("FAIL", summary["fail"])
c4.metric("WARNING", summary["warning"])

if report["overall_status"] == "COMPLIANT":
    st.success("Product passed all checks implemented in this prototype.")
else:
    st.error("Product is NON-COMPLIANT under the checks implemented in this prototype.")

# Declaration table
st.subheader("Mandatory Declaration Fields")

rows = []
labels = FIELD_LABELS

for field, label in labels.items():
    data = merged_fields[field]
    rows.append({
        "Declaration": label,
        "Status": "FOUND" if data["found"] else "MISSING",
        "Detected text": data.get("text", ""),
        "Confidence": data.get("confidence", ""),
        "Source image": data.get("source_image", ""),
    })

df_fields = pd.DataFrame(rows)
st.dataframe(df_fields, use_container_width=True, hide_index=True)

# Rule results
st.subheader("Rule Results")
df_rules = pd.DataFrame(rule_results)
st.dataframe(
    df_rules[["rule_id", "field", "status", "message"]],
    use_container_width=True,
    hide_index=True
)

# Images
st.subheader("Image Analysis")
for result in all_results:
    st.markdown(f"#### {result['name']}")
    col1, col2 = st.columns(2)

    with col1:
        st.caption("Preprocessed image")
        st.image(
            to_rgb(result["preprocessed"]),
            use_container_width=True
        )

    with col2:
        st.caption("OCR bounding boxes")
        annotated = draw_detections(
            result["preprocessed"],
            result["detections"]
        )
        st.image(to_rgb(annotated), use_container_width=True)

    with st.expander(f"OCR text ({len(result['detections'])} regions)"):
        ocr_rows = []
        for i, det in enumerate(result["detections"]):
            ocr_rows.append({
                "#": i,
                "Text": det["text"],
                "Confidence": det["confidence"],
                "Height (px)": det["height_px"],
                "Height (mm)": det.get("height_mm", ""),
            })
        st.dataframe(
            pd.DataFrame(ocr_rows),
            use_container_width=True,
            hide_index=True
        )

# Downloads
st.subheader("Export Report")

report_bytes = json.dumps(report, indent=2, ensure_ascii=False).encode("utf-8")
ocr_export = []
for result in all_results:
    ocr_export.append({
        "image": result["name"],
        "detections": result["detections"],
    })
ocr_bytes = json.dumps(ocr_export, indent=2, ensure_ascii=False).encode("utf-8")

# Build the PDF only after a successful scan.
pdf_path = Path("compliance_report.pdf")
try:
    pdf_bytes = build_pdf_report(report, all_results, pdf_path)
except Exception as e:
    pdf_bytes = None
    st.error(f"Could not generate PDF report: {e}")

d1, d2, d3 = st.columns(3)

with d1:
    st.download_button(
        "Download PDF Report",
        data=pdf_bytes if pdf_bytes else b"",
        file_name="compliance_report.pdf",
        mime="application/pdf",
        use_container_width=True,
        disabled=pdf_bytes is None,
    )

with d2:
    st.download_button(
        "Download Compliance JSON",
        data=report_bytes,
        file_name="compliance_report.json",
        mime="application/json",
        use_container_width=True,
    )

with d3:
    st.download_button(
        "Download OCR JSON",
        data=ocr_bytes,
        file_name="ocr_output.json",
        mime="application/json",
        use_container_width=True,
    )

st.caption(
    "Important: this is a prototype. The supplied notebook explicitly describes "
    "the font-height rule values as illustrative; verify the applicable Legal Metrology "
    "requirements and other regulatory rules before using the result for an actual compliance decision."
)
