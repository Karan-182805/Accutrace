import React from 'react';
import { 
  LayoutDashboard, 
  Scan, 
  History, 
  Package, 
  AlertOctagon, 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'new-scan'
  | 'history'
  | 'products'
  | 'violations'
  | 'analytics'
  | 'reports'
  | 'users'
  | 'settings';

interface NavItem {
  id: NavTab;
  label: string;
  icon: any;
  badge?: string;
  alertCount?: number;
}

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'INSPECTION',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'new-scan' as NavTab, label: 'New Scan', icon: Scan, badge: 'Workflow' },
        { id: 'history' as NavTab, label: 'Inspection History', icon: History },
      ],
    },
    {
      title: 'PRODUCTS',
      items: [
        { id: 'products' as NavTab, label: 'Product Repository', icon: Package },
      ],
    },
    {
      title: 'COMPLIANCE',
      items: [
        { id: 'violations' as NavTab, label: 'Violations', icon: AlertOctagon, alertCount: 5 },
        { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'REPORTS',
      items: [
        { id: 'reports' as NavTab, label: 'Compliance Reports', icon: FileText },
      ],
    },
    {
      title: 'ADMIN',
      items: [
        { id: 'users' as NavTab, label: 'Users', icon: Users },
        { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-900/30 border border-blue-500/30 shrink-0">
            <ShieldCheck size={24} className="text-blue-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-lg text-white font-mono">NIRIKSHAK AI</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">GOVT</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Packaged Commodity Compliance</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {sections.map((sec) => (
            <div key={sec.title}>
              <h3 className="px-3 text-[11px] font-bold text-slate-400 tracking-wider mb-2 font-mono">
                {sec.title}
              </h3>
              <ul className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          onSelectTab(item.id);
                          onCloseMobile();
                        }}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150
                          ${isActive 
                            ? 'bg-blue-700/90 text-white font-semibold shadow-md shadow-blue-950 border border-blue-500/40' 
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                              {item.badge}
                            </span>
                          )}
                          {item.alertCount && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                              {item.alertCount}
                            </span>
                          )}
                          {isActive && <ChevronRight size={14} className="text-white/70" />}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Department Footer Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
            <span>Department of Legal Metrology</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Ministry of Consumer Affairs, Food & Public Distribution, Govt. of India
          </p>
        </div>
      </aside>
    </>
  );
};
