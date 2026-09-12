import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { analyticsData } from '../data/mockData';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-900 text-white rounded font-mono">ENFORCEMENT INTELLIGENCE</span>
            <span className="text-xs text-slate-500 font-medium">State & District Compliance Metrics</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Legal Metrology Compliance Analytics</h1>
          <p className="text-xs text-slate-600 mt-1">
            Aggregate insights into packaged-commodity statutory rule adherence, manufacturer defect rates, and enforcement volume.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase font-mono">
            <span>Compliance Rate</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-2">73.7%</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">↑ +2.4% vs last quarter</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase font-mono">
            <span>Violation Rate</span>
            <XCircle size={18} className="text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-2">21.1%</div>
          <div className="text-[10px] text-rose-700 font-bold mt-1">271 non-compliant packages</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase font-mono">
            <span>Review Rate</span>
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-2">5.1%</div>
          <div className="text-[10px] text-slate-500 mt-1">66 pending officer check</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase font-mono">
            <span>Total Inspections</span>
            <BarChart3 size={18} className="text-blue-900" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-2">1,284</div>
          <div className="text-[10px] text-slate-500 mt-1">Across 14 enforcement zones</div>
        </div>
      </div>

      {/* Grid 1: Compliance Over Time & Violations by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart: Compliance Over Time */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-sm font-bold text-slate-900">Monthly Compliance Trends</h2>
            <p className="text-[11px] text-slate-500">Volume of compliant vs non-compliant packages over time</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.monthlyCompliance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="compliant" stroke="#16a34a" strokeWidth={3} name="Compliant Packages" />
                <Line type="monotone" dataKey="violations" stroke="#dc2626" strokeWidth={3} name="Violations Detected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Compliance by Category */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-sm font-bold text-slate-900">Compliance by Commodity Category</h2>
            <p className="text-[11px] text-slate-500">Breakdown of passed vs failed items per commodity group</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.categoryCompliance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="compliant" fill="#16a34a" stackId="a" name="Compliant" />
                <Bar dataKey="nonCompliant" fill="#dc2626" stackId="a" name="Non-Compliant" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid 2: Top Violating Manufacturers & Rule Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Non-Compliant Manufacturers */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-sm font-bold text-slate-900">Top Non-Compliant Manufacturers</h2>
            <p className="text-[11px] text-slate-500">Manufacturers with highest recorded statutory rule violations</p>
          </div>
          <div className="space-y-3 pt-2">
            {analyticsData.topViolatingManufacturers.map((mfg, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-rose-100 text-rose-800 font-mono font-bold flex items-center justify-center text-xs">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-900">{mfg.name}</span>
                </div>
                <span className="font-mono font-extrabold px-2.5 py-1 bg-rose-600 text-white rounded text-xs">
                  {mfg.count} Violations
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rule 6 vs Rule 7 Enforcement Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-sm font-bold text-slate-900">Legal Rule Violation Distribution</h2>
            <p className="text-[11px] text-slate-500">Rule 6 (Declarations) vs Rule 7 (Font Size) vs Rule 18 (MRP)</p>
          </div>
          <div className="space-y-4 flex-1 justify-center flex flex-col">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex justify-between text-xs font-bold text-rose-900">
                <span>Rule 6(1)(e) - MRP & Unit Sale Price Syntax</span>
                <span>32.5%</span>
              </div>
              <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-600 h-full w-[32.5%]" />
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="flex justify-between text-xs font-bold text-amber-900">
                <span>Rule 7 - Minimum Font & Numeral Height</span>
                <span>23.6%</span>
              </div>
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full w-[23.6%]" />
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <div className="flex justify-between text-xs font-bold text-blue-950">
                <span>Rule 6(1)(a) - Manufacturer Address & Country of Origin</span>
                <span>17.7%</span>
              </div>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-800 h-full w-[17.7%]" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
