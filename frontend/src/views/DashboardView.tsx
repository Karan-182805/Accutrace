import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Scan, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Eye,
  FileCheck2,
  Building,
  Calendar
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockInspections, mockViolations, analyticsData } from '../data/mockData';
import { NavTab } from '../components/layout/Sidebar';
import { Inspection } from '../types';

interface DashboardViewProps {
  inspections?: Inspection[];
  onNavigate: (tab: NavTab) => void;
  onSelectInspection: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inspections = mockInspections,
  onNavigate,
  onSelectInspection
}) => {
  const stats = [
    {
      title: 'Total Products Scanned',
      value: '1,284',
      change: '+12% this month',
      icon: Scan,
      color: 'bg-blue-900 text-white',
      border: 'border-blue-900/10'
    },
    {
      title: 'Compliant',
      value: '947',
      subtext: '73.7% Compliance Rate',
      icon: CheckCircle2,
      color: 'bg-emerald-600 text-white',
      border: 'border-emerald-600/10'
    },
    {
      title: 'Non-Compliant',
      value: '271',
      subtext: '21.1% Violation Rate',
      icon: XCircle,
      color: 'bg-rose-600 text-white',
      border: 'border-rose-600/10'
    },
    {
      title: 'Requires Review',
      value: '66',
      subtext: '5.1% Pending Verification',
      icon: AlertTriangle,
      color: 'bg-amber-500 text-white',
      border: 'border-amber-500/10'
    }
  ];

  const pieData = [
    { name: 'Compliant', value: 947, color: '#16a34a' },
    { name: 'Non-Compliant', value: 271, color: '#dc2626' },
    { name: 'Requires Review', value: 66, color: '#d97706' },
  ];

  const urgentViolations = mockViolations.filter(v => v.severity === 'High');

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Call to Action */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded font-mono">GOVT ENFORCEMENT PORTAL</span>
            <span className="text-xs text-slate-300 font-medium">Legal Metrology (Packaged Commodities) Rules, 2011</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight mt-1 text-white">Nirikshak AI Compliance Inspection Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Automated image OCR extraction, declaration verification, and violation detection system for Indian packaging compliance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('new-scan')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <Scan size={16} />
            Start New Package Scan
          </button>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.title}</span>
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{item.value}</div>
                <div className="text-[11px] font-medium text-slate-500 mt-1">{item.subtext || item.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Donut Chart: Compliance Overview */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Compliance Overview</h2>
              <p className="text-[11px] text-slate-500">Distribution across 1,284 total inspections</p>
            </div>
          </div>
          
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} packages`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">73.7%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Pass Rate</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 text-center">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 block">COMPLIANT</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">947</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-600 block font-sans">VIOLATIONS</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">271</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-600 block">REVIEW</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">66</span>
            </div>
          </div>
        </div>

        {/* Bar Chart: Violation Trends */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Enforcement Trends (6 Months)</h2>
              <p className="text-[11px] text-slate-500">Monthly breakdown of compliance vs non-compliance</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.monthlyCompliance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="compliant" fill="#16a34a" radius={[4, 4, 0, 0]} name="Compliant" />
                <Bar dataKey="violations" fill="#dc2626" radius={[4, 4, 0, 0]} name="Violations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Bar Chart: Common Violation Types */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Violation Categories</h2>
              <p className="text-[11px] text-slate-500">Most frequent non-compliance rules</p>
            </div>
          </div>
          <div className="space-y-3 pt-1">
            {analyticsData.violationsByType.map((item, idx) => {
              const max = 100;
              const percentage = Math.round((item.count / max) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-mono text-slate-900">{item.count} cases</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%`, backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Inspections Table & Urgent Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Inspections Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Enforcement Inspections</h2>
              <p className="text-[11px] text-slate-500">Latest packaged-commodity OCR & declaration check logs</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1"
            >
              View All History <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Inspection ID</th>
                  <th className="py-2.5 px-4 font-bold">Product</th>
                  <th className="py-2.5 px-4 font-bold">Manufacturer</th>
                  <th className="py-2.5 px-4 font-bold">Date</th>
                  <th className="py-2.5 px-4 font-bold text-center">Score</th>
                  <th className="py-2.5 px-4 font-bold">Status</th>
                  <th className="py-2.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.slice(0, 8).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.productName}</td>
                    <td className="py-3 px-4 text-slate-600">{item.manufacturer}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{item.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-extrabold px-2 py-0.5 rounded text-xs ${item.score >= 90 ? 'bg-emerald-100 text-emerald-800' : item.score >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                        {item.score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectInspection(item.id)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-blue-900 text-white rounded font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Panel for High Severity & Pending Review (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-600" />
              <h2 className="text-sm font-bold text-slate-900">Enforcement Action Alerts</h2>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded font-mono">
              {urgentViolations.length} High Priority
            </span>
          </div>

          <div className="space-y-3 mt-3 flex-1 overflow-y-auto max-h-96 pr-1">
            {urgentViolations.map((v) => (
              <div key={v.id} className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-800 uppercase font-mono">{v.violationType}</span>
                  <span className="text-[10px] font-bold text-slate-500">{v.date}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mt-1">{v.productName}</h3>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{v.actualObservation}</p>
                <div className="mt-2.5 pt-2 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-500">Inspection: {v.inspectionId}</span>
                  <button
                    onClick={() => onSelectInspection(v.inspectionId)}
                    className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline"
                  >
                    Review Evidence →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-center">
            <button
              onClick={() => onNavigate('violations')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors"
            >
              Open Violations Queue
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
