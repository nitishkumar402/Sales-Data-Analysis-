import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  BarChart3,
  FileSpreadsheet,
  ArrowUpDown,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab } from '../types/sales';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  recordCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  recordCount,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales' as ActiveTab, label: 'Sales', icon: Receipt },
    { id: 'customers' as ActiveTab, label: 'Customers', icon: Users },
    { id: 'products' as ActiveTab, label: 'Products', icon: Package },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
    { id: 'reports' as ActiveTab, label: 'Reports', icon: FileSpreadsheet },
    { id: 'import-export' as ActiveTab, label: 'Import / Export', icon: ArrowUpDown },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between transition-all duration-300 ease-in-out glass-panel border-r border-white/10
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top: Branding and App Title */}
        <div>
          <div className="flex items-center justify-between h-18 px-4 border-b border-white/10">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-base text-white tracking-tight leading-none truncate">
                    SalesFlow
                  </span>
                  <span className="text-[11px] text-cyan-400 font-medium tracking-wide mt-1 truncate">
                    Track. Analyze. Grow.
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Storage & Local Persistence Status */}
        <div className="p-3 border-t border-white/10">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">IndexedDB Active</span>
                </div>
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Local Storage:</span>
                <span className="font-semibold text-slate-200">
                  {recordCount.toLocaleString()} {recordCount === 1 ? 'Record' : 'Records'}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-white/10"
              title={`IndexedDB Active • ${recordCount} Records`}
            >
              <div className="relative flex h-2 w-2 mb-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <Database className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
