import React, { useState } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertTriangle,
  Scale
} from 'lucide-react';
import { mockViolations } from '../data/mockData';
import { SeverityBadge } from '../components/common/StatusBadge';
import { Violation } from '../types';

interface ViolationsViewProps {
  onSelectInspection: (id: string) => void;
}

export const ViolationsView: React.FC<ViolationsViewProps> = ({ onSelectInspection }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const totalViolations = 271;
  const highSeverityCount = mockViolations.filter(v => v.severity === 'High').length + 112;
  const mediumSeverityCount = 124;
  const pendingReviewCount = mockViolations.filter(v => v.status === 'Pending Officer Review').length + 32;

  const types = Array.from(new Set(mockViolations.map(v => v.violationType)));

  const filteredViolations = mockViolations.filter(v => {
    const matchesSearch = v.productName.toLowerCase().includes(search.toLowerCase()) ||
                          v.id.toLowerCase().includes(search.toLowerCase()) ||
                          v.detectedText.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || v.severity === severityFilter;
    const matchesType = typeFilter === 'all' || v.violationType === typeFilter;
    return matchesSearch && matchesSeverity && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded font-mono">STATUTORY VIOLATION QUEUE</span>
            <span className="text-xs text-slate-500 font-medium">Legal Metrology Act, 2009 Enforcement</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Packaged Commodity Violations Management</h1>
          <p className="text-xs text-slate-600 mt-1">
            Detected breaches requiring officer verification, show-cause notices, or physical lot seizure.
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Total Violations</span>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700"><AlertOctagon size={18} /></div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">{totalViolations}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across all scanned commodities</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">High Severity</span>
            <div className="p-2 rounded-lg bg-red-100 text-red-700"><ShieldAlert size={18} /></div>
          </div>
          <div className="text-2xl font-extrabold text-red-700 font-mono mt-2">{highSeverityCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Requires immediate legal notice</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Medium Severity</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700"><AlertTriangle size={18} /></div>
          </div>
          <div className="text-2xl font-extrabold text-amber-800 font-mono mt-2">{mediumSeverityCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Formatting & consumer care issues</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Pending Review</span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><Clock size={18} /></div>
          </div>
          <div className="text-2xl font-extrabold text-blue-900 font-mono mt-2">{pendingReviewCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Awaiting officer verification</div>
        </div>

      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search violation ID, product, or detected text..."
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 text-slate-900"
          />
        </div>

        <div className="w-full sm:w-44">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
          >
            <option value="all">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>

        <div className="w-full sm:w-56">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
          >
            <option value="all">All Violation Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Violation ID</th>
                <th className="py-3 px-4 font-bold">Product</th>
                <th className="py-3 px-4 font-bold">Violation Type</th>
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold">Severity</th>
                <th className="py-3 px-4 font-bold">Officer Status</th>
                <th className="py-3 px-4 font-bold">Inspector</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredViolations.map((v) => (
                <tr key={v.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-rose-800">{v.id}</td>
                  
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{v.productName}</div>
                    <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">{v.detectedText}</div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-800">{v.violationType}</td>

                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{v.date}</td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <SeverityBadge severity={v.severity} />
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${v.status === 'Notice Issued' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {v.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-medium">{v.inspectorName}</td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectInspection(v.inspectionId)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[11px] inline-flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <Eye size={12} />
                      Review Evidence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
