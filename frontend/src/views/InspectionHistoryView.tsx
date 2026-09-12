import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Calendar, 
  MapPin, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight,
  Download
} from 'lucide-react';
import { mockInspections } from '../data/mockData';
import { StatusBadge } from '../components/common/StatusBadge';
import { Inspection } from '../types';

interface InspectionHistoryViewProps {
  inspections?: Inspection[];
  onSelectInspection: (id: string) => void;
  onOpenReport: (id: string) => void;
}

export const InspectionHistoryView: React.FC<InspectionHistoryViewProps> = ({
  inspections = mockInspections,
  onSelectInspection,
  onOpenReport,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filtered = inspections.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(search.toLowerCase()) ||
                          item.productName.toLowerCase().includes(search.toLowerCase()) ||
                          item.inspectorName.toLowerCase().includes(search.toLowerCase()) ||
                          item.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-900 text-white rounded font-mono">AUDIT LOG TRAIL</span>
            <span className="text-xs text-slate-500 font-medium">Official Legal Metrology Inspections</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Enforcement Inspection History</h1>
          <p className="text-xs text-slate-600 mt-1">
            Complete chronological record of package declaration extractions, optical measurements & officer reviews.
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Inspection ID, product, inspector, or location..."
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 text-slate-900"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
          >
            <option value="all">All Inspection Statuses</option>
            <option value="Compliant">Compliant Only</option>
            <option value="Non-Compliant">Non-Compliant Only</option>
            <option value="Requires Review">Requires Review Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Inspection ID</th>
                <th className="py-3 px-4 font-bold">Product & Lot</th>
                <th className="py-3 px-4 font-bold">Inspection Date</th>
                <th className="py-3 px-4 font-bold">Location</th>
                <th className="py-3 px-4 font-bold">Enforcement Officer</th>
                <th className="py-3 px-4 font-bold text-center">Score</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-900">{item.id}</td>
                  
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[10px] text-slate-500">{item.manufacturer} ({item.batchLot})</div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{item.date}</td>

                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{item.location}</td>

                  <td className="py-3 px-4 text-slate-700 font-semibold">{item.inspectorName}</td>

                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono font-extrabold px-2 py-0.5 rounded text-xs ${item.score >= 90 ? 'bg-emerald-100 text-emerald-800' : item.score >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                      {item.score}/100
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectInspection(item.id)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-blue-900 text-white rounded font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} />
                        View
                      </button>
                      <button
                        onClick={() => onOpenReport(item.id)}
                        className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <FileText size={12} />
                        Report
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
          <div className="flex items-center gap-1">
            <button disabled className="p-1 rounded border border-slate-300 opacity-50"><ChevronLeft size={16} /></button>
            <span className="px-2.5 py-1 font-mono font-bold bg-blue-900 text-white rounded">1</span>
            <button disabled className="p-1 rounded border border-slate-300 opacity-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

    </div>
  );
};
