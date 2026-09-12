import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Sliders, 
  FileText, 
  Info, 
  Save, 
  ShieldCheck,
  Check
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'analysis' | 'reports' | 'system'>('profile');
  const [savedToast, setSavedToast] = useState(false);

  // Form States
  const [officerName, setOfficerName] = useState('R. K. Sharma');
  const [officerRole, setOfficerRole] = useState('Deputy Controller of Legal Metrology');
  const [ocrConfidenceThreshold, setOcrConfidenceThreshold] = useState(85);
  const [enableAutoRule7, setEnableAutoRule7] = useState(true);
  const [departmentHeader, setDepartmentHeader] = useState('DIRECTORATE OF LEGAL METROLOGY');
  const [watermarkText, setWatermarkText] = useState('GOVERNMENT ENFORCEMENT RECORD');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-900 text-white rounded font-mono">SYSTEM CONFIGURATION</span>
            <span className="text-xs text-slate-500 font-medium">Rule Engine & Department Parameters</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Nirikshak AI System Settings</h1>
          <p className="text-xs text-slate-600 mt-1">
            Configure OCR sensitivity thresholds, legal rule parameters, and official report templates.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'profile' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <User size={15} /> Profile & Designation
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'analysis' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Sliders size={15} /> Analysis & Rule Engine
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'reports' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <FileText size={15} /> Report Certificates
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'notifications' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Bell size={15} /> Notifications
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'system' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Info size={15} /> System Information
        </button>
      </div>

      {savedToast && (
        <div className="bg-emerald-800 text-white px-4 py-2.5 rounded-lg text-xs font-mono font-bold text-center shadow-lg animate-in fade-in flex items-center justify-center gap-2">
          <Check size={16} /> SYSTEM CONFIGURATION PREFERENCES UPDATED SUCCESSFULLY
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-4 max-w-xl text-xs font-semibold">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Officer Profile Configuration</h2>
            
            <div>
              <label className="block text-slate-700 mb-1">Enforcement Officer Name</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Official Designation Title</label>
              <input
                type="text"
                value={officerRole}
                onChange={(e) => setOfficerRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Jurisdiction District / Zone</label>
              <input
                type="text"
                disabled
                value="North Zone - Delhi NCR"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="pt-3">
              <button type="submit" className="px-5 py-2.5 bg-blue-900 text-white font-bold rounded-lg shadow flex items-center gap-2">
                <Save size={14} /> Save Profile Settings
              </button>
            </div>
          </form>
        )}

        {/* Analysis Settings Tab */}
        {activeTab === 'analysis' && (
          <form onSubmit={handleSave} className="space-y-6 max-w-xl text-xs font-semibold">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">AI OCR & Statutory Rule Engine Configuration</h2>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-700">OCR Text Extraction Confidence Threshold</label>
                <span className="font-mono font-bold text-blue-900">{ocrConfidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="98"
                value={ocrConfidenceThreshold}
                onChange={(e) => setOcrConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
              />
              <p className="text-[10px] text-slate-500 mt-1">Detections below {ocrConfidenceThreshold}% confidence are flagged as "Requires Review".</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAutoRule7}
                  onChange={(e) => setEnableAutoRule7(e.target.checked)}
                  className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-800"
                />
                <span className="text-slate-800">Enable Automated Rule 7 Font Size Measurement Check</span>
              </label>
              <p className="text-[10px] text-slate-500 pl-6">Calculates optical character height against package weight class thresholds.</p>
            </div>

            <div className="pt-3">
              <button type="submit" className="px-5 py-2.5 bg-blue-900 text-white font-bold rounded-lg shadow flex items-center gap-2">
                <Save size={14} /> Update Rule Engine Parameters
              </button>
            </div>
          </form>
        )}

        {/* Report Settings Tab */}
        {activeTab === 'reports' && (
          <form onSubmit={handleSave} className="space-y-4 max-w-xl text-xs font-semibold">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Official Certificate Report Header & Watermark</h2>
            
            <div>
              <label className="block text-slate-700 mb-1">Department Header Title</label>
              <input
                type="text"
                value={departmentHeader}
                onChange={(e) => setDepartmentHeader(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Security Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="pt-3">
              <button type="submit" className="px-5 py-2.5 bg-blue-900 text-white font-bold rounded-lg shadow flex items-center gap-2">
                <Save size={14} /> Save Report Template
              </button>
            </div>
          </form>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-xl text-xs font-semibold">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Enforcement Alerts & Notifications</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span>Notify on High Severity Rule Violations</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-900" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span>Daily Inspection Volume Digest Email</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-900" />
              </label>
            </div>
          </div>
        )}

        {/* System Info Tab */}
        {activeTab === 'system' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">System Diagnostic Information</h2>
            <div className="space-y-2 font-mono bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px]">
              <div>System: Nirikshak AI v2.4.0 (Legal Metrology Engine)</div>
              <div>Rule Set: Packaged Commodities Rules 2011 (Amended 2022)</div>
              <div>OCR Pipeline: Embedded Neural Optical Vision</div>
              <div>Database: Standalone Offline Regulatory Node</div>
              <div>Jurisdiction: Govt of India Enforcement Standard</div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
