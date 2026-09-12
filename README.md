# Accutrace

Nirikshak AI Compliance Inspection Dashboard - automated image OCR extraction, declaration verification, and violation detection system for Indian packaging compliance.

## Connected Prototype

The React (Antigravity) UI now runs on the real OCR / compliance pipeline.

```
nirikshak-ai/
├── backend/
│   ├── pipeline.py        OCR + compliance pipeline (moved out of app.py, logic unchanged)
│   ├── api.py             FastAPI server used by the React UI
│   ├── app.py             Original Streamlit interface (now imports pipeline.py)
│   └── requirements.txt
└── frontend/              React + Vite UI (dist/ is already built)
```

## Easiest way (Windows)

Extract the zip, then double-click **START_NIRIKSHAK.bat**. It creates a virtual environment,
installs requirements on the first run, starts the server and opens http://127.0.0.1:8000.
Keep that black window open while using the app.

## Manual start (Windows, no Node needed)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn api:app --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000, go to **New Scan**, and wait for the "OCR model ready" badge.
The first start downloads PaddleOCR models, so keep the internet on.

If you see `NotImplementedError: ConvertPirAttribute2RuntimeAttribute`:

```powershell
$env:FLAGS_enable_pir_api="0"
uvicorn api:app --host 127.0.0.1 --port 8000
```

## Working on the UI (hot reload)

Terminal 1 — backend: `cd backend` then `uvicorn api:app --port 8000`

Terminal 2 — frontend:
```powershell
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Vite forwards `/api` requests to port 8000.
Run `npm run build` afterwards so the backend serves your latest UI.

## Streamlit app (still works)

```powershell
cd backend
streamlit run app.py
```

## API

| Method | Path | What it does |
| --- | --- | --- |
| GET  | `/api/health` | Server and OCR model status |
| POST | `/api/scan` | Multipart: `front` (required), `back`, `side`, `product_name`, `category`, `manufacturer`, `batch_lot`, `location`, `mm_per_px`, `use_gpu` |
| GET  | `/api/inspections/{id}/report.pdf` | PDF from `build_pdf_report` |
| GET  | `/api/inspections/{id}/report.json` | Compliance JSON |
| GET  | `/api/inspections/{id}/ocr.json` | Raw OCR detections |

Reports are kept in memory for the last 30 scans and are lost when the server restarts.

## Mapping notes

- Rule status: PASS → Compliant, FAIL → Non-Compliant, WARNING → Requires Review.
- Overall status: Non-Compliant if any FAIL, otherwise Requires Review if any WARNING, otherwise Compliant.
- Score shown in the UI = checks passed ÷ total checks × 100 (the pipeline itself has no score).
- Images shown in results are the preprocessed images the OCR read, so boxes line up exactly.
- Dashboard stats, Analytics, Violations and Products pages still use mock data.

## Known pipeline limitations spotted during testing

- `MANUFACTURER_KEYWORDS` does not match "Mfd. By".
- `MRP_PATTERN` fails if OCR misreads "₹" (for example as "%").
- Missing country of origin fails every product; check whether that should apply only to imported goods.
- Without mm/pixel calibration, font-height checks always return WARNING.

This is a hackathon prototype, not legal certification software. Findings must be verified by an officer.
