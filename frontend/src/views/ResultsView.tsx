import React, { useState } from 'react';
import {
  ShieldAlert,
  FileText,
  Download,
  RotateCcw,
  Eye,
  ZoomIn,
  Building2,
  Tag,
  Calendar,
  MapPin,
  Info,
  FileJson,
  ScanText,
} from 'lucide-react';
import { Inspection, BoundingBox, ChecklistItem, ImageSlot, OcrRegion } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { downloadReport } from '../api/nirikshak';

interface ResultsViewProps {
  inspection: Inspection;
  onOpenViolationDetail: (item: ChecklistItem) => void;
  onGenerateReport: () => void;
  onExportPdf: () => void;
  onReScan: () => void;
}

const SLOT_LABEL: Record<ImageSlot, string> = { front: 'FRONT PDP', back: 'BACK LABEL', side: 'SIDE / MRP' };

const statusTheme = (status: Inspection['status']) => {
  switch (status) {
    case 'Compliant':
      return { text: 'text-emerald-700', ring: 'border-emerald-500 bg-emerald-50 text-emerald-700' };
    case 'Requires Review':
      return { text: 'text-amber-700', ring: 'border-amber-500 bg-amber-50 text-amber-700' };
    default:
      return { text: 'text-rose-700', ring: 'border-rose-500 bg-rose-50 text-rose-700' };
  }
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  inspection,
  onOpenViolationDetail,
  onGenerateReport,
  onExportPdf,
  onReScan,
}) => {
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'violations' | 'review'>('all');
  const [activeSlot, setActiveSlot] = useState<ImageSlot>('front');
  const [showAllOcr, setShowAllOcr] = useState(true);

  const isModel = inspection.source === 'model';
  const theme = statusTheme(inspection.status);
  const slots = (['front', 'back', 'side'] as ImageSlot[]).filter((s) => inspection.images[s]);
  const slot = slots.includes(activeSlot) ? activeSlot : 'front';

  const boxes = inspection.boundingBoxes.filter((b) => (b.imageKey ?? 'front') === slot);
  const ocrRegions = inspection.ocr?.[slot] ?? [];

  const filteredChecklist = inspection.checklist.filter((item) => {
    if (activeTab === 'violations') return item.status === 'Non-Compliant';
    if (activeTab === 'review') return item.status === 'Requires Review';
    return true;
  });

  const locate = (item: ChecklistItem) => {
    if (!item.evidence || !item.field) return;
    setActiveSlot(item.evidence.imageKey);
    setSelectedBoxId(`box-${item.field}`);
  };

  return (
    <div className="space-y-6">

      {/* Top Banner: Score & Metadata */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

          {/* Left: Product & Inspection Metadata */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-900 text-white rounded">
                ID: {inspection.id}
              </span>
              <StatusBadge status={inspection.status} size="lg" />
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Calendar size={14} /> {inspection.date}
              </span>
              {isModel ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-900 border border-blue-200">
                  OCR model result
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Sample data
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {inspection.productName}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                  <Building2 size={15} className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-900 truncate">{inspection.manufacturer}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Tag size={15} className="text-slate-400" />
                  <span>Category: <strong>{inspection.category}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                  <MapPin size={15} className="text-slate-400 shrink-0" />
                  <span className="truncate">{inspection.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Big Compliance Score Badge */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">COMPLIANCE SCORE</div>
              <div className="text-4xl font-black font-mono text-slate-900 mt-0.5">
                {inspection.score}<span className="text-lg text-slate-400">/100</span>
              </div>
              <div className={`text-[11px] font-bold mt-0.5 uppercase ${theme.text}`}>
                STATUS: {inspection.status}
              </div>
            </div>

            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-extrabold text-xl shadow-inner ${theme.ring}`}>
              {inspection.score}%
            </div>
          </div>

        </div>

        {isModel && (
          <p className="mt-3 text-[11px] text-slate-500">
            Score = share of rule checks passed ({inspection.compliantCount} of {inspection.totalChecks}).
            {' '}Status is Non-Compliant if any check fails, and Requires Review if any check could not be verified.
          </p>
        )}

        {/* Action Button Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 flex-wrap">
            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">
              {inspection.totalChecks} checks total
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
              {inspection.compliantCount} compliant
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
              {inspection.reviewCount} review
            </span>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
              {inspection.violationCount} violations
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onReScan}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} />
              Re-Scan Package
            </button>
            {isModel && (
              <>
                <button
                  onClick={() => downloadReport(inspection.id, 'json')}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                >
                  <FileJson size={14} />
                  Compliance JSON
                </button>
                <button
                  onClick={() => downloadReport(inspection.id, 'ocr')}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                >
                  <ScanText size={14} />
                  OCR JSON
                </button>
              </>
            )}
            <button
              onClick={onGenerateReport}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-all"
            >
              <FileText size={14} />
              Generate Official Report
            </button>
            <button
              onClick={onExportPdf}
              disabled={isModel && inspection.reportAvailable?.pdf === false}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Package Image with Interactive Bounding Boxes, Right Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Package Evidence Viewer (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ZoomIn size={16} className="text-blue-900" />
                Package OCR Bounding Box Evidence
              </h2>
              <p className="text-[11px] text-slate-500">
                {isModel ? 'Preprocessed image as read by the OCR model' : 'Interactive principal display panel detection'}
              </p>
            </div>
            {slots.length > 1 ? (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSlot(s)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-colors ${slot === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                {SLOT_LABEL[slot]}
              </span>
            )}
          </div>

          <EvidenceImage
            src={inspection.images[slot] ?? inspection.images.front}
            alt={`${inspection.productName} (${slot})`}
            boxes={boxes}
            ocrRegions={showAllOcr ? ocrRegions : []}
            selectedBoxId={selectedBoxId}
            onSelectBox={(id) => setSelectedBoxId(id === selectedBoxId ? null : id)}
          />

          {/* Bounding Box Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold pt-1 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600"></span>
              Valid Declaration
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 border border-amber-600"></span>
              Requires Officer Review
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-600 border border-rose-700"></span>
              Statutory Violation
            </span>
          </div>

          {isModel && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAllOcr}
                  onChange={(e) => setShowAllOcr(e.target.checked)}
                  className="rounded border-slate-300 text-blue-900 focus:ring-blue-800"
                />
                Show green OCR text-region markings ({ocrRegions.length} on this image)
              </label>
              <details className="text-xs border border-slate-200 rounded-lg">
                <summary className="px-3 py-2 font-bold text-slate-700 cursor-pointer select-none">
                  Raw OCR text
                </summary>
                <div className="max-h-56 overflow-y-auto border-t border-slate-100">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 font-mono sticky top-0">
                      <tr>
                        <th className="py-1.5 px-2">Text</th>
                        <th className="py-1.5 px-2 text-right">Conf.</th>
                        <th className="py-1.5 px-2 text-right">Height</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ocrRegions.map((r, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-2 font-mono text-slate-800">{r.text}</td>
                          <td className="py-1.5 px-2 text-right font-mono">{r.confidence}%</td>
                          <td className="py-1.5 px-2 text-right font-mono whitespace-nowrap">
                            {r.heightMm != null ? `${r.heightMm} mm` : `${r.heightPx} px`}
                          </td>
                        </tr>
                      ))}
                      {ocrRegions.length === 0 && (
                        <tr><td colSpan={3} className="py-3 px-2 text-center text-slate-500">No text detected on this image.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          )}

          {/* Notice Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
            <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Automated finding — Requires officer verification.</strong> Click on bounding boxes or checklist rows below to view evidence crops and rule references.
              {isModel && !inspection.calibrated && ' No mm/pixel calibration was given, so font height could not be measured.'}
            </p>
          </div>

        </div>

        {/* Right: Compliance Checklist Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Statutory Compliance Checklist</h2>
              <p className="text-[11px] text-slate-500">
                {isModel ? 'Rule engine checks on declarations extracted by OCR' : 'Legal Metrology (Packaged Commodities) Rules, 2011'}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({inspection.checklist.length})
              </button>
              <button
                onClick={() => setActiveTab('violations')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${activeTab === 'violations' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:bg-rose-100'}`}
              >
                Violations ({inspection.violationCount})
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${activeTab === 'review' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-700 hover:bg-amber-100'}`}
              >
                Review ({inspection.reviewCount})
              </button>
            </div>
          </div>

          {/* Checklist Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Requirement Rule</th>
                  <th className="py-2.5 px-3 font-bold">Detected Value</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold text-center">Confidence</th>
                  <th className="py-2.5 px-3 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChecklist.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition-colors ${item.status === 'Non-Compliant' ? 'bg-rose-50/30' : ''}`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.requirement}</div>
                      <div className="text-[10px] font-mono text-slate-500">{item.ruleRef}</div>
                    </td>

                    <td className="py-3 px-3 max-w-[15rem]">
                      {item.evidence ? (
                        <button
                          onClick={() => locate(item)}
                          className="font-mono text-slate-800 text-[11px] font-medium max-w-full truncate block text-left hover:text-blue-900 hover:underline"
                          title={`${item.detectedValue} — click to highlight on image`}
                        >
                          {item.detectedValue}
                        </button>
                      ) : (
                        <div className="font-mono text-slate-800 text-[11px] font-medium truncate" title={item.detectedValue}>
                          {item.detectedValue}
                        </div>
                      )}
                      {item.observation && (
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1" title={item.observation}>{item.observation}</div>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    <td className="py-3 px-3 text-center">
                      {item.confidence > 0 ? (
                        <span className={`font-mono text-[11px] font-extrabold ${item.confidence >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {item.confidence}%
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {item.status === 'Non-Compliant' ? (
                        <button
                          onClick={() => onOpenViolationDetail(item)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[11px] inline-flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <ShieldAlert size={12} />
                          View Violation
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenViolationDetail(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye size={12} />
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredChecklist.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">Nothing in this category.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};

// ------------------------------------------------------------
// Image with overlay boxes that stay aligned at any aspect ratio
// ------------------------------------------------------------
const MAX_IMAGE_HEIGHT = 500;

const getBoxStyle = (status: BoundingBox['status']) => {
  switch (status) {
    case 'Compliant':
      return 'border-emerald-500 bg-emerald-500/10';
    case 'Non-Compliant':
      return 'border-rose-600 bg-rose-600/20';
    case 'Requires Review':
      return 'border-amber-500 bg-amber-500/20';
  }
};

interface EvidenceImageProps {
  src: string;
  alt: string;
  boxes: BoundingBox[];
  ocrRegions: OcrRegion[];
  selectedBoxId: string | null;
  onSelectBox: (id: string) => void;
}

const EvidenceImage: React.FC<EvidenceImageProps> = ({ src, alt, boxes, ocrRegions, selectedBoxId, onSelectBox }) => {
  const [ratio, setRatio] = useState<number | null>(null); // width / height

  return (
    <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-inner p-2">
      {/* The wrapper is sized to the rendered image, so % boxes line up exactly. */}
      <div
        className="relative mx-auto"
        style={{ width: ratio ? `min(100%, ${Math.round(MAX_IMAGE_HEIGHT * ratio)}px)` : '100%' }}
      >
        <img
          src={src}
          alt={alt}
          className="block w-full h-auto"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            setRatio(w && h ? w / h : null);
          }}
        />

        {ocrRegions.map((r, i) => (
          <div
            key={`ocr-${i}`}
            className="absolute border-2 border-emerald-400 pointer-events-none z-10"
            style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.width}%`, height: `${r.height}%` }}
            title={r.text}
          >
            <span className="absolute left-0 bottom-full mb-0.5 bg-emerald-500 text-slate-950 px-1 py-0.5 text-[8px] font-mono font-black leading-none whitespace-nowrap">
              OCR {i + 1}
            </span>
          </div>
        ))}

        {boxes.map((box) => {
          const isSelected = selectedBoxId === box.id;
          return (
            <button
              type="button"
              key={box.id}
              onClick={() => onSelectBox(box.id)}
              style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.width}%`, height: `${box.height}%` }}
              className={`
                absolute border-2 rounded-sm transition-shadow duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                ${getBoxStyle(box.status)}
                ${isSelected ? 'ring-4 ring-blue-500 z-20' : 'hover:z-10'}
              `}
              title={`${box.label}: ${box.detectedText}`}
            >
              <span
                className={`absolute max-w-[16rem] truncate bg-slate-900/85 text-white px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap ${box.height >= 4.5 ? 'left-1 top-1/2 -translate-y-1/2' : 'left-0 bottom-full mb-0.5'} ${isSelected ? 'block' : 'hidden sm:block'}`}
              >
                {box.label}{isSelected ? ` · ${box.status}` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
