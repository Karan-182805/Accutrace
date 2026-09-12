import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  Building2, 
  Scale, 
  Send, 
  Upload, 
  Check, 
  Info,
  ExternalLink
} from 'lucide-react';
import { ChecklistItem, Inspection, Severity } from '../types';
import { SeverityBadge, StatusBadge } from '../components/common/StatusBadge';

interface ViolationDetailModalProps {
  item: ChecklistItem;
  inspection: Inspection;
  onClose: () => void;
  onMarkReviewed: (remark: string) => void;
}

export const ViolationDetailModal: React.FC<ViolationDetailModalProps> = ({
  item,
  inspection,
  onClose,
  onMarkReviewed,
}) => {
  const [officerRemark, setOfficerRemark] = useState('');
  const [isReviewed, setIsReviewed] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isNonCompliant = item.status === 'Non-Compliant';
  const isCompliant = item.status === 'Compliant';
  const severity: Severity = item.severity || (isNonCompliant ? 'High' : 'Medium');
  const tone = isCompliant
    ? { icon: 'bg-emerald-600', tag: 'text-emerald-300', obs: 'text-emerald-900 bg-emerald-50 border-emerald-200', label: 'bg-emerald-900/90 border-emerald-500' }
    : item.status === 'Requires Review'
      ? { icon: 'bg-amber-500', tag: 'text-amber-300', obs: 'text-amber-900 bg-amber-50 border-amber-200', label: 'bg-amber-900/90 border-amber-500' }
      : { icon: 'bg-rose-600', tag: 'text-rose-300', obs: 'text-rose-900 bg-rose-50 border-rose-200', label: 'bg-rose-900/90 border-rose-500' };

  const handleSaveReview = () => {
    setIsReviewed(true);
    setShowToast(true);
    onMarkReviewed(officerRemark);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white ${tone.icon}`}>
              {isCompliant ? <CheckCircle2 size={22} /> : <ShieldAlert size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded ${tone.tag}`}>
                  {isNonCompliant ? 'VIOLATION AUDIT RECORD' : isCompliant ? 'COMPLIANCE CHECK RECORD' : 'REVIEW RECORD'}
                </span>
                {!isCompliant && <SeverityBadge severity={severity} />}
              </div>
              <h2 className="text-lg font-extrabold tracking-tight mt-0.5">
                {item.requirement} — Statutory Compliance Inspection
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mandatory Disclaimer Banner */}
        <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-amber-700 shrink-0" />
            <span><strong>Automated finding — Requires officer verification.</strong> AI detection must be validated prior to legal notice issuance.</span>
          </div>
          <span className="font-mono font-bold text-[11px] text-amber-800 shrink-0">OCR Conf: {item.confidence > 0 ? `${item.confidence}%` : '—'}</span>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Top Grid: Evidence Crop Preview & Detected Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Package Evidence Highlight */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Cropped Evidence Region</span>
                <span className="text-[10px] font-mono text-slate-500">Inspection: {inspection.id}</span>
              </div>
              <div className="relative h-44 rounded-lg overflow-hidden bg-slate-900 border border-slate-300 flex items-center justify-center p-2">
                <EvidenceCrop item={item} inspection={inspection} />
                <div className={`absolute inset-x-4 bottom-3 text-white p-2 rounded text-[11px] font-mono font-bold text-center border shadow ${tone.label}`}>
                  {item.evidence || inspection.source !== 'model' ? 'HIGHLIGHTED REGION' : 'NOT FOUND ON LABEL'}: {item.requirement}
                </div>
              </div>
            </div>

            {/* Key Value Finding Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">EXTRACTED OCR TEXT</span>
                <div className="p-2.5 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-900 mt-1 shadow-sm">
                  "{item.detectedValue}"
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">LEGAL RULE REFERENCE</span>
                <div className="text-xs font-bold text-blue-900 mt-0.5 flex items-center gap-1.5">
                  <Scale size={14} className="text-blue-700" />
                  {inspection.source === 'model'
                    ? `Rule engine check ${item.ruleRef}`
                    : `Legal Metrology (Packaged Commodities) Rules, 2011 — ${item.ruleRef}`}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">STATUS ASSESSMENT</span>
                <div className="mt-1">
                  <StatusBadge status={item.status} size="md" />
                </div>
              </div>
            </div>

          </div>

          {/* Statutory Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-100/70 border-b border-slate-200 font-bold text-xs text-slate-800 font-mono">
              STATUTORY COMPLIANCE COMPARISON
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Expected Statutory Requirement:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed font-medium">
                  {item.expectedValue || 'Mandatory declaration must strictly comply with Rule 6(1) formatting, position and minimum character height standards under Rule 7.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">
                  {inspection.source === 'model' ? 'Automated Observation:' : 'Actual Enforcement Officer Observation:'}
                </span>
                <p className={`p-2.5 rounded border leading-relaxed font-medium ${tone.obs}`}>
                  {item.observation || 'Non-compliance observed in required text declaration formatting.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Recommended Statutory Enforcement Action:</span>
                <p className="text-blue-950 bg-blue-50 p-2.5 rounded border border-blue-200 leading-relaxed font-medium">
                  {item.recommendedAction || (inspection.source === 'model'
                    ? 'No action needed for this check.'
                    : 'Issue show-cause notice under Section 36 of Legal Metrology Act 2009.')}
                </p>
              </div>
            </div>
          </div>

          {/* Officer Verification & Remark Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-blue-900" />
              Officer Verification & Action Remarks
            </h3>

            <div>
              <textarea
                value={officerRemark}
                onChange={(e) => setOfficerRemark(e.target.value)}
                placeholder="Enter official enforcement officer remarks, physical inspection verification findings, or legal notice file reference..."
                className="w-full h-20 p-2.5 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 rounded text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  Attach Lab Test Certificate
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveReview}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow ${isReviewed ? 'bg-emerald-700 text-white' : 'bg-blue-900 hover:bg-blue-800 text-white'}`}
              >
                {isReviewed ? <Check size={16} /> : <Send size={14} />}
                {isReviewed ? 'Marked as Reviewed' : 'Save Officer Remark & Mark Reviewed'}
              </button>
            </div>
          </div>

        </div>

        {/* Toast Alert */}
        {showToast && (
          <div className="bg-emerald-800 text-white px-4 py-2 font-mono text-xs font-bold text-center">
            ✓ OFFICER VERIFICATION SAVED SUCCESSFULLY TO INSPECTION AUDIT TRAIL
          </div>
        )}

      </div>
    </div>
  );
};

// Crops the uploaded image to the detected declaration when the OCR model
// provided its location; otherwise shows the whole front image.
const EvidenceCrop: React.FC<{ item: ChecklistItem; inspection: Inspection }> = ({ item, inspection }) => {
  const ev = item.evidence;
  const size = ev ? inspection.imageSizes?.[ev.imageKey] : undefined;
  const src = ev ? inspection.images[ev.imageKey] : undefined;

  if (!ev || !size || !src) {
    return (
      <img
        src={inspection.images.front}
        alt="Evidence Region"
        className="max-h-full max-w-full object-contain filter drop-shadow"
      />
    );
  }

  const { width: W, height: H } = size;
  const rx = (ev.x / 100) * W;
  const ry = (ev.y / 100) * H;
  const rw = (ev.width / 100) * W;
  const rh = (ev.height / 100) * H;
  const padX = Math.max(rw * 0.08, W * 0.03);
  const padY = Math.max(rh * 1.5, H * 0.04);
  const vx = Math.max(0, rx - padX);
  const vy = Math.max(0, ry - padY);
  const vw = Math.min(W, rx + rw + padX) - vx;
  const vh = Math.min(H, ry + rh + padY) - vy;
  const stroke = item.status === 'Compliant' ? '#10b981' : item.status === 'Requires Review' ? '#f59e0b' : '#e11d48';

  return (
    <svg
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      role="img"
      aria-label={`Evidence: ${item.detectedValue}`}
    >
      <image href={src} x={0} y={0} width={W} height={H} />
      <rect
        x={rx - 3}
        y={ry - 3}
        width={rw + 6}
        height={rh + 6}
        fill="none"
        stroke={stroke}
        strokeWidth={Math.max(2, vw / 200)}
        rx={4}
      />
    </svg>
  );
};
