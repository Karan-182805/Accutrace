import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  FileEdit, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  MapPin, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Scale, 
  Info,
  ArrowLeft
} from 'lucide-react';
import { ImageSlot, Inspection, OcrRegion } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { downloadReport } from '../api/nirikshak';

interface ComplianceReportViewProps {
  inspection: Inspection;
  onBack: () => void;
}

export const ComplianceReportView: React.FC<ComplianceReportViewProps> = ({ inspection, onBack }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isModel = inspection.source === 'model';
  const violations = inspection.checklist.filter((c) => c.status === 'Non-Compliant');
  const imageCount = Object.values(inspection.images).filter(Boolean).length;
  const statusBox =
    inspection.status === 'Compliant' ? 'bg-emerald-600' : inspection.status === 'Requires Review' ? 'bg-amber-500' : 'bg-rose-600';
  const summaryTone =
    inspection.status === 'Compliant' ? 'text-emerald-300' : inspection.status === 'Requires Review' ? 'text-amber-300' : 'text-rose-300';
  const officerName = inspection.inspectorName.replace(/\s*\(.*\)\s*$/, '');
  const imageSlots = (['front', 'back', 'side'] as ImageSlot[]).filter((slot) => inspection.images[slot]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Controls (Hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Inspection View
        </button>

        <div className="flex items-center gap-2">
          {isModel ? (
            <button
              onClick={() => downloadReport(inspection.id, 'json')}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <FileEdit size={14} />
              Download Compliance JSON
            </button>
          ) : (
            <button
              onClick={() => showToast("Exporting editable DOCX format...")}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <FileEdit size={14} />
              Export Editable (DOCX)
            </button>
          )}
          
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} />
            Print Report
          </button>

          <button
            onClick={() =>
              isModel
                ? downloadReport(inspection.id, 'pdf')
                : showToast("Sample inspection: run a real scan to download its PDF report.")
            }
            disabled={isModel && inspection.reportAvailable?.pdf === false}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            Download PDF Report
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="no-print bg-blue-900 text-white px-4 py-2.5 rounded-lg text-xs font-mono font-bold text-center shadow-lg animate-in fade-in">
          ✓ {toastMessage}
        </div>
      )}

      {/* Official Legal Metrology Inspection Certificate / Report Paper */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl p-8 md:p-12 space-y-8 print:shadow-none print:border-none print:p-0">
        
        {/* Government Emblem / Header Banner */}
        <div className="text-center border-b-2 border-slate-900 pb-6 space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-900 font-extrabold text-sm tracking-widest uppercase font-mono">
            <ShieldCheck size={26} className="text-blue-900" />
            DIRECTORATE OF LEGAL METROLOGY
          </div>
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Ministry of Consumer Affairs, Food & Public Distribution | Government of India
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-mono tracking-tight mt-2 uppercase">
            PACKAGED COMMODITY COMPLIANCE INSPECTION REPORT
          </h1>
          <div className="inline-block px-3 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-800 border border-slate-300">
            OFFICIAL REPORT REFERENCE: {inspection.id}
          </div>
        </div>

        {/* Section 1 & 2: Inspection & Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Section 1: Inspection Info */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold font-mono text-slate-900 text-xs border-b border-slate-200 pb-1.5 uppercase flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-900" /> 1. Inspection Information
            </h3>
            <div className="space-y-1.5 text-slate-700 font-medium">
              <div className="flex justify-between"><span className="text-slate-500">Inspection ID:</span> <span className="font-mono font-bold text-slate-900">{inspection.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Inspection Date:</span> <span className="font-mono font-bold text-slate-900">{inspection.date}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Inspecting Officer:</span> <span className="font-bold text-slate-900">{inspection.inspectorName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Location / Shop:</span> <span className="font-bold text-slate-900">{inspection.location}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Jurisdiction Zone:</span> <span className="font-bold text-slate-900">North Zone - Delhi NCR</span></div>
            </div>
          </div>

          {/* Section 2: Product Info */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold font-mono text-slate-900 text-xs border-b border-slate-200 pb-1.5 uppercase flex items-center gap-1.5">
              <Building2 size={14} className="text-blue-900" /> 2. Product & Manufacturer Details
            </h3>
            <div className="space-y-1.5 text-slate-700 font-medium">
              <div className="flex justify-between"><span className="text-slate-500">Product Name:</span> <span className="font-bold text-slate-900">{inspection.productName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Manufacturer / Packer:</span> <span className="font-bold text-slate-900">{inspection.manufacturer}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Commodity Category:</span> <span className="font-bold text-slate-900">{inspection.category}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Batch / Lot No:</span> <span className="font-mono font-bold text-slate-900">{inspection.batchLot}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Label Images Analysed:</span> <span className="font-bold text-slate-900">{imageCount}</span></div>
            </div>
          </div>

        </div>

        {/* Section 3: Package Evidence & Annotated OCR */}
        <div className="space-y-3">
          <h3 className="font-bold font-mono text-slate-900 text-xs uppercase border-b border-slate-200 pb-1.5">
            3. Audited Package Image Evidence & Bounding Boxes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {imageSlots.map((slot, index) => (
              <ReportEvidenceImage
                key={slot}
                src={inspection.images[slot] ?? inspection.images.front}
                alt={`${slot} package panel`}
                figure={index + 1}
                label={reportFigureLabel(slot)}
                ocrRegions={inspection.ocr?.[slot] ?? []}
              />
            ))}
          </div>
          {isModel && (
            <p className="text-[10px] font-mono text-slate-600">
              Green boxes mark every OCR text region used by the automated scan. OCR numbers correspond to the raw OCR output order.
            </p>
          )}
        </div>

        {/* Section 4 & 5: Extracted Declarations & Rule Checklist */}
        <div className="space-y-3">
          <h3 className="font-bold font-mono text-slate-900 text-xs uppercase border-b border-slate-200 pb-1.5">
            4. Legal Metrology Rule-by-Rule Compliance Verification
          </h3>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-900 text-white font-mono text-[11px] uppercase">
              <tr>
                <th className="p-2.5 font-bold border-r border-slate-800">Rule Ref</th>
                <th className="p-2.5 font-bold border-r border-slate-800">Mandatory Declaration</th>
                <th className="p-2.5 font-bold border-r border-slate-800">Detected Value</th>
                <th className="p-2.5 font-bold border-r border-slate-800">Status</th>
                <th className="p-2.5 font-bold">Officer Findings & Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {inspection.checklist.map((item) => (
                <tr key={item.id} className={item.status === 'Non-Compliant' ? 'bg-rose-50' : ''}>
                  <td className="p-2.5 font-mono font-bold text-slate-800 border-r border-slate-200">{item.ruleRef}</td>
                  <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">{item.requirement}</td>
                  <td className="p-2.5 font-mono text-slate-700 border-r border-slate-200">{item.detectedValue}</td>
                  <td className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="p-2.5 text-slate-700 font-medium">
                    {item.observation || 'Satisfies prescribed statutory guidelines.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 6: Identified violations (from the checklist) */}
        {violations.length > 0 ? (
          <div className="space-y-3 bg-rose-50/70 p-5 rounded-xl border border-rose-200">
            <h3 className="font-bold font-mono text-rose-950 text-xs uppercase flex items-center gap-2">
              <Scale size={16} className="text-rose-700" />
              5. Identified Violations & Recommended Actions
            </h3>
            <ul className="space-y-2 text-xs text-rose-900 font-medium list-disc pl-5">
              {violations.map((v) => (
                <li key={v.id}>
                  <strong>{v.requirement}</strong> ({v.ruleRef}): {v.observation}
                  {v.recommendedAction && <span className="block text-rose-800/90 mt-0.5">Action: {v.recommendedAction}</span>}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-2 bg-emerald-50/70 p-5 rounded-xl border border-emerald-200">
            <h3 className="font-bold font-mono text-emerald-950 text-xs uppercase flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700" />
              5. Identified Violations
            </h3>
            <p className="text-xs text-emerald-900 font-medium">No failed checks were recorded for this inspection.</p>
          </div>
        )}

        {/* Section 7: Final Assessment Score Box */}
        <div className="p-6 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">FINAL ENFORCEMENT ASSESSMENT</div>
            <h4 className="text-xl font-extrabold text-white mt-0.5">COMPLIANCE SCORE: {inspection.score}/100</h4>
            <p className={`text-xs font-semibold mt-1 ${summaryTone}`}>
              SUMMARY: {inspection.totalChecks} Checks Conducted · {inspection.compliantCount} Compliant · {inspection.reviewCount} Review · {inspection.violationCount} Non-Compliant
            </p>
          </div>

          <div className={`px-5 py-2.5 text-white font-extrabold text-sm rounded-lg tracking-wider font-mono shadow-lg text-center uppercase ${statusBox}`}>
            {inspection.status}
          </div>
        </div>

        {/* Section 8: Officer Signatures & Remarks */}
        <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div>
            <span className="font-bold font-mono text-slate-900 block mb-1">INSPECTING OFFICER REMARKS:</span>
            <p className="p-3 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800 leading-relaxed">
              {inspection.officerRemarks
                ? `"${inspection.officerRemarks}"`
                : 'No officer remarks recorded yet. Add remarks from the violation detail view.'}
            </p>
          </div>

          <div className="text-center md:text-right space-y-8 pt-4">
            <div>
              <div className="inline-block border-b-2 border-slate-900 w-48 mb-1"></div>
              <div className="font-bold text-slate-900">{officerName}</div>
              <div className="text-[11px] text-slate-600 font-medium">Deputy Controller of Legal Metrology</div>
              <div className="text-[10px] font-mono text-slate-500">Government of NCT of Delhi</div>
            </div>
          </div>
        </div>

        {/* Footer Mandatory Disclaimer */}
        <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium leading-relaxed">
          “Automated analysis generated by Nirikshak AI. Findings should be verified by the authorized enforcement officer.”
          <br />
          Legal Metrology Packaged Commodities Compliance Portal — Ministry of Consumer Affairs, Govt. of India.
        </div>

      </div>

    </div>
  );
};

const reportFigureLabel = (slot: ImageSlot) => {
  switch (slot) {
    case 'back':
      return 'Back Declaration & Consumer Care Panel';
    case 'side':
      return 'Side / MRP Stamp Panel';
    default:
      return 'Principal Display Panel (PDP) Front OCR';
  }
};

interface ReportEvidenceImageProps {
  src: string;
  alt: string;
  figure: number;
  label: string;
  ocrRegions: OcrRegion[];
}

const ReportEvidenceImage: React.FC<ReportEvidenceImageProps> = ({ src, alt, figure, label, ocrRegions }) => {
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <div className="bg-slate-900 p-2 rounded-xl border border-slate-300 text-center">
      <div
        className="relative mx-auto"
        style={{ width: ratio ? `min(100%, ${Math.round(256 * ratio)}px)` : '100%' }}
      >
        <img
          src={src}
          alt={alt}
          className="block w-full max-h-64 object-contain"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            setRatio(w && h ? w / h : null);
          }}
        />
        {ocrRegions.map((region, index) => (
          <div
            key={`${figure}-ocr-${index}`}
            className="absolute border-2 border-emerald-400 pointer-events-none"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
            }}
            title={region.text}
          >
            <span className="absolute left-0 bottom-full mb-0.5 bg-emerald-500 text-slate-950 px-1 py-0.5 text-[8px] font-mono font-black leading-none whitespace-nowrap">
              OCR {index + 1}
            </span>
          </div>
        ))}
      </div>
      <span className="text-[10px] font-mono text-white mt-1 block">
        FIGURE {figure}: {label}
      </span>
    </div>
  );
};
