import { Inspection } from '../types';

/**
 * Base URL of the Python API (backend/api.py).
 * - Dev (`npm run dev`): leave empty — Vite proxies /api to http://127.0.0.1:8000.
 * - Served by FastAPI itself: leave empty — same origin.
 * - Anything else: set VITE_API_BASE_URL, e.g. http://192.168.1.20:8000
 */
const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(/\/$/, '');

export interface ScanFormData {
  productName: string;
  category: string;
  manufacturer: string;
  batchLot: string;
  location: string;
  images: { front: string; back?: string; side?: string };
  mmPerPx?: number | null;
  useGpu?: boolean;
}

export interface HealthStatus {
  online: boolean;
  model: 'not_loaded' | 'loading' | 'ready' | 'error' | 'unknown';
  modelError?: string | null;
  paddleocrInstalled?: boolean;
}

export const INSPECTOR_NAME = 'R. K. Sharma (Dy. Controller)';

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: 'no-store' });
    if (!res.ok) return { online: false, model: 'unknown' };
    const body = await res.json();
    return {
      online: true,
      model: body.model ?? 'unknown',
      modelError: body.modelError,
      paddleocrInstalled: body.paddleocrInstalled,
    };
  } catch {
    return { online: false, model: 'unknown' };
  }
}

export function reportUrl(inspectionId: string, kind: 'pdf' | 'json' | 'ocr'): string {
  const file = kind === 'pdf' ? 'report.pdf' : kind === 'json' ? 'report.json' : 'ocr.json';
  return `${API_BASE}/api/inspections/${encodeURIComponent(inspectionId)}/${file}`;
}

/** Trigger a browser download of a backend report. */
export function downloadReport(inspectionId: string, kind: 'pdf' | 'json' | 'ocr') {
  const a = document.createElement('a');
  a.href = reportUrl(inspectionId, kind);
  a.download = '';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const OPENCV_READABLE = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Turn an <img> source (data URL from an upload, or one of the SVG presets)
 * into a file OpenCV can decode. SVGs and other formats are rasterised to PNG.
 */
async function imageSourceToBlob(src: string): Promise<Blob> {
  const original = await (await fetch(src)).blob();
  if (OPENCV_READABLE.includes(original.type)) return original;

  let drawSrc = src;
  let width = 0;
  let height = 0;

  if (original.type === 'image/svg+xml') {
    // Vector presets: give the <svg> explicit pixel dimensions (Chrome can't rasterise
    // width="100%" SVGs) and render large enough for OCR to read the small print.
    let svg = (await original.text()).replace(/&(?!#?\w+;)/g, '&amp;');
    const vb = svg.match(/viewBox="\s*[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
    const ratio = vb ? parseFloat(vb[2]) / parseFloat(vb[1]) : 1;
    width = 1600;
    height = Math.round(width * ratio);
    svg = svg.replace(/<svg\b[^>]*>/, (tag) =>
      tag.replace(/\s(width|height)="[^"]*"/g, '').replace(/^<svg/, `<svg width="${width}" height="${height}"`),
    );
    drawSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('This image format cannot be read. Please upload a JPG, PNG or WEBP photo.'));
    el.src = drawSrc;
  });

  width = width || img.naturalWidth;
  height = height || img.naturalHeight;
  if (!width || !height) throw new Error('Could not determine the image size. Please upload a JPG, PNG or WEBP photo.');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not convert image.'))), 'image/png'),
  );
}

function extensionFor(blob: Blob) {
  return blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png';
}

export async function runComplianceScan(form: ScanFormData, signal?: AbortSignal): Promise<Inspection> {
  const body = new FormData();

  for (const slot of ['front', 'back', 'side'] as const) {
    const src = form.images[slot];
    if (!src) continue;
    try {
      const blob = await imageSourceToBlob(src);
      body.append(slot, blob, `${slot}.${extensionFor(blob)}`);
    } catch (err) {
      throw new Error(`The ${slot} image could not be prepared: ${(err as Error).message}`);
    }
  }

  body.append('product_name', form.productName || 'Unnamed Product');
  body.append('category', form.category);
  body.append('manufacturer', form.manufacturer);
  body.append('batch_lot', form.batchLot);
  body.append('location', form.location);
  body.append('inspector_name', INSPECTOR_NAME);
  body.append('use_gpu', String(!!form.useGpu));
  if (form.mmPerPx && form.mmPerPx > 0) body.append('mm_per_px', String(form.mmPerPx));

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/scan`, { method: 'POST', body, signal });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new Error(
      'Could not reach the OCR server. Start it with "uvicorn api:app --port 8000" inside the backend folder, then try again.',
    );
  }

  if (!res.ok) {
    let detail = `Server returned ${res.status}.`;
    try {
      const j = await res.json();
      if (typeof j.detail === 'string') detail = j.detail;
      else if (j.detail) detail = JSON.stringify(j.detail);
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }

  return (await res.json()) as Inspection;
}
