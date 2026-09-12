import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Scan, Check, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export type AnalysisStatus = 'running' | 'done' | 'error';

interface AnalysisViewProps {
  status: AnalysisStatus;
  error?: string | null;
  imageCount?: number;
  onComplete: () => void;
  onCancel: () => void;
  onRetry?: () => void;
}

// These mirror the stages of backend/pipeline.py.
const steps = [
  { label: 'Uploading package images', sub: 'Sending label photos to the OCR server' },
  { label: 'Preprocessing images', sub: 'Deskew, denoise & CLAHE contrast enhancement' },
  { label: 'Reading label text with PaddleOCR', sub: 'Text line detection & recognition with bounding boxes' },
  { label: 'Identifying mandatory declarations', sub: 'Manufacturer, net quantity, MRP, date, consumer care, country of origin' },
  { label: 'Validating declarations against rules', sub: 'Presence, MRP tax wording, date format & font height checks' },
  { label: 'Generating compliance report', sub: 'Checklist, evidence regions & PDF report' },
];

// OCR is where the time goes, so hold on that stage until the server responds.
const LAST_WAITING_STEP = 2;

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  status,
  error,
  imageCount = 1,
  onComplete,
  onCancel,
  onRetry,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Elapsed timer while the request is in flight.
  useEffect(() => {
    if (status !== 'running') return;
    const started = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 500);
    return () => clearInterval(t);
  }, [status]);

  // Walk through the stages while waiting; hold before the last one until the server answers.
  useEffect(() => {
    if (status === 'error') return;
    const delay = status === 'done' ? 220 : 900;
    const t = setInterval(() => {
      setStepIndex((prev) => {
        const ceiling = status === 'done' ? steps.length : LAST_WAITING_STEP;
        return prev < ceiling ? prev + 1 : prev;
      });
    }, delay);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status === 'done' && stepIndex >= steps.length) {
      const t = setTimeout(() => onCompleteRef.current(), 400);
      return () => clearTimeout(t);
    }
  }, [status, stepIndex]);

  const isError = status === 'error';
  const progressPercentage =
    status === 'done'
      ? Math.round((Math.min(stepIndex, steps.length) / steps.length) * 100)
      : Math.round(90 * (1 - Math.exp(-elapsed / 25)));

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-xl w-full shadow-2xl space-y-6 relative overflow-hidden">

        {/* Top Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${isError ? 'bg-rose-600' : 'bg-gradient-to-r from-blue-900 via-blue-600 to-amber-500'}`} />

        {/* Title */}
        <div className="text-center space-y-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-inner border ${isError ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-900 border-blue-200'}`}>
            {isError ? <XCircle size={30} /> : <Scan size={30} className="animate-pulse" />}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
            {isError ? 'ANALYSIS FAILED' : 'ANALYZING PRODUCT PACKAGE'}
          </h2>
          <p className="text-xs text-slate-500">
            {isError
              ? 'The OCR server could not complete this scan.'
              : `Running OCR & rule validation on ${imageCount} image${imageCount > 1 ? 's' : ''}`}
          </p>
        </div>

        {isError ? (
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 font-medium leading-relaxed break-words">
              {error || 'Unknown error.'}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                Back to scan form
              </button>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  Retry scan
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold font-mono">
                <span className="text-blue-900">{status === 'done' ? 'ANALYSIS COMPLETE' : 'SYSTEM ANALYSIS IN PROGRESS'}</span>
                <span className="text-slate-900">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-blue-900 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Check Steps */}
            <div className="space-y-3 pt-2">
              {steps.map((step, idx) => {
                const isDone = idx < stepIndex;
                const isCurrent = idx === stepIndex;
                const isPending = idx > stepIndex;

                return (
                  <div
                    key={idx}
                    className={`
                      flex items-center gap-3.5 p-3 rounded-xl border transition-all duration-200
                      ${isDone ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : ''}
                      ${isCurrent ? 'bg-blue-50 border-blue-300 text-blue-950 shadow-sm scale-[1.01]' : ''}
                      ${isPending ? 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60' : ''}
                    `}
                  >
                    <div className="shrink-0">
                      {isDone && (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      {isCurrent && (
                        <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center">
                          <Loader2 size={14} className="animate-spin" />
                        </div>
                      )}
                      {isPending && (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400 font-mono">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-xs font-bold leading-tight">{step.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{step.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 font-medium">
              <span>
                {status === 'running' && elapsed >= 12
                  ? 'The first scan can take a minute while the OCR model loads.'
                  : 'Findings are automated and must be verified by an officer.'}
              </span>
              {status === 'running' && (
                <span className="flex items-center gap-3 shrink-0">
                  <span className="font-mono">{elapsed}s</span>
                  <button onClick={onCancel} className="font-bold text-slate-700 hover:text-rose-700">
                    Cancel
                  </button>
                </span>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
