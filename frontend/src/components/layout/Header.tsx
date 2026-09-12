import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  ChevronRight, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  FileText,
  UserCheck,
  Building2,
  X
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { mockNotifications, mockProducts, mockViolations } from '../../data/mockData';

interface HeaderProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenMobileSidebar: () => void;
  onSelectInspection?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenMobileSidebar,
  onSelectInspection
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(mockNotifications);

  const getBreadcrumbLabel = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'new-scan': return 'New Package Scan';
      case 'history': return 'Inspection History';
      case 'products': return 'Product Repository';
      case 'violations': return 'Violations Management';
      case 'analytics': return 'Compliance Analytics';
      case 'reports': return 'Compliance Reports';
      case 'users': return 'User Directory';
      case 'settings': return 'System Settings';
      default: return 'Dashboard';
    }
  };

  const filteredSearchProducts = searchQuery.trim()
    ? mockProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredSearchViolations = searchQuery.trim()
    ? mockViolations.filter(v => v.productName.toLowerCase().includes(searchQuery.toLowerCase()) || v.violationType.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const markAllAsRead = () => {
    setUnreadNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const hasUnread = unreadNotifications.some(n => !n.read);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenMobileSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
            aria-label="Open Sidebar"
          >
            <Menu size={20} />
          </button>

          <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Building2 size={15} className="text-blue-900" />
              <span className="font-semibold text-slate-900">Legal Metrology Dept</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 font-semibold">{getBreadcrumbLabel(currentTab)}</span>
          </nav>
        </div>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-md mx-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search product, manufacturer, rule, inspection ID..."
              className="w-full pl-9 pr-8 py-1.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Search Dropdown Results */}
          {isSearchFocused && searchQuery.trim() !== '' && (
            <div 
              className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
              onMouseDown={(e) => e.preventDefault()} // Keep focus
            >
              <div className="p-2 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 font-mono">
                SEARCH RESULTS FOR "{searchQuery.toUpperCase()}"
              </div>

              {filteredSearchProducts.length > 0 && (
                <div className="p-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1">PRODUCTS ({filteredSearchProducts.length})</div>
                  {filteredSearchProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onNavigate('products');
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 hover:bg-blue-50 rounded flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-900">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{p.manufacturer}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.status === 'Compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {p.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {filteredSearchViolations.length > 0 && (
                <div className="p-2">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1">VIOLATIONS ({filteredSearchViolations.length})</div>
                  {filteredSearchViolations.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        onNavigate('violations');
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 hover:bg-amber-50 rounded flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{v.violationType} - {v.productName}</div>
                        <div className="text-[11px] text-slate-500">{v.expectedRequirement.slice(0, 55)}...</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                        {v.severity}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {filteredSearchProducts.length === 0 && filteredSearchViolations.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching products or violations found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-600 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-blue-400" />
                    <span className="font-bold text-xs font-mono">ENFORCEMENT ALERTS</span>
                  </div>
                  {hasUnread && (
                    <button 
                      onClick={markAllAsRead} 
                      className="text-[11px] text-blue-300 hover:text-white underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {unreadNotifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        if (n.inspectionId && onSelectInspection) {
                          onSelectInspection(n.inspectionId);
                        }
                        setShowNotifications(false);
                      }}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-amber-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'urgent' && <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />}
                        {n.type === 'warning' && <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />}
                        {n.type === 'info' && <CheckCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <p className="text-slate-600 mt-0.5 text-[11px]">{n.message}</p>
                          <span className="text-[10px] font-medium text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                  <button 
                    onClick={() => {
                      onNavigate('violations');
                      setShowNotifications(false);
                    }}
                    className="text-[11px] font-semibold text-blue-800 hover:text-blue-950"
                  >
                    View All Enforcement Violations →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Profile Card */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs shadow-inner ring-2 ring-blue-100">
              RK
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">R. K. Sharma</div>
              <div className="text-[10px] font-medium text-slate-500">Dy. Controller (Legal Metrology)</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
