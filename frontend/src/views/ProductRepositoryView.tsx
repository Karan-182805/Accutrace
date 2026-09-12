import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Scan, 
  Building2, 
  Tag, 
  Calendar, 
  AlertTriangle,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { mockProducts } from '../data/mockData';
import { ComplianceStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { NavTab } from '../components/layout/Sidebar';

interface ProductRepositoryViewProps {
  onSelectInspection: (id: string) => void;
  onNavigate: (tab: NavTab) => void;
}

export const ProductRepositoryView: React.FC<ProductRepositoryViewProps> = ({
  onSelectInspection,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');

  const categories = Array.from(new Set(mockProducts.map(p => p.category)));
  const manufacturers = Array.from(new Set(mockProducts.map(p => p.manufacturer)));

  const filteredProducts = mockProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
                          p.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesManufacturer = selectedManufacturer === 'all' || p.manufacturer === selectedManufacturer;
    return matchesSearch && matchesStatus && matchesCategory && matchesManufacturer;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-900 text-white rounded font-mono">NATIONAL COMMODITY REGISTRY</span>
            <span className="text-xs text-slate-500 font-medium">{mockProducts.length} Packaged Commodities Tracked</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Packaged Commodity Product Repository</h1>
          <p className="text-xs text-slate-600 mt-1">
            Central database of audited packaged commodities, statutory declaration history, and violation records.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new-scan')}
          className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow flex items-center gap-2 transition-all shrink-0"
        >
          <Plus size={16} />
          Register & Scan New Product
        </button>
      </div>

      {/* Search & Multi-Filter Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, manufacturer, or product ID..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 text-slate-900"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            >
              <option value="all">All Compliance Statuses</option>
              <option value="Compliant">Compliant Only</option>
              <option value="Non-Compliant">Non-Compliant Only</option>
              <option value="Requires Review">Requires Review Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Manufacturer Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            >
              <option value="all">All Manufacturers</option>
              {manufacturers.map((mfg) => (
                <option key={mfg} value={mfg}>{mfg}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Product Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Product Details</th>
                <th className="py-3 px-4 font-bold">Manufacturer / Packer</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Last Inspection</th>
                <th className="py-3 px-4 font-bold text-center">Score</th>
                <th className="py-3 px-4 font-bold text-center">Violations</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-900 shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain p-0.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">ID: {p.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-700">{p.manufacturer}</td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{p.lastInspectionDate}</td>

                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono font-extrabold px-2 py-0.5 rounded text-xs ${p.score >= 90 ? 'bg-emerald-100 text-emerald-800' : p.score >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                      {p.score}/100
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                    {p.violationsCount > 0 ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-extrabold">
                        {p.violationsCount}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={p.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectInspection(p.lastInspectionId)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-blue-900 text-white rounded font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye size={12} />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No products match the selected search or filter parameters.
          </div>
        )}
      </div>

    </div>
  );
};
