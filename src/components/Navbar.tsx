import { useState } from 'react';
import {
  Search,
  Calendar,
  Bell,
  Plus,
  Menu,
  Sparkles,
  Download,
  CheckCircle2,
  Database,
  ExternalLink,
} from 'lucide-react';
import { DateRangePreset, ActiveTab } from '../types/sales';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  dateRange: DateRangePreset;
  onDateRangeChange: (preset: DateRangePreset) => void;
  onOpenAddSale: () => void;
  onOpenMobileSidebar: () => void;
  currencySymbol: string;
  recordCount: number;
  onLoadDemoData: () => void;
  onSelectTab: (tab: ActiveTab) => void;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  onOpenAddSale,
  onOpenMobileSidebar,
  recordCount,
  onLoadDemoData,
  onSelectTab,
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);

  const datePresets: { id: DateRangePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'this_year', label: 'This Year' },
    { id: 'all', label: 'All Time' },
  ];

  const activeDateLabel =
    datePresets.find((p) => p.id === dateRange)?.label ||
    (dateRange === 'custom' ? 'Custom Range' : 'All Time');

  return (
    <header className="sticky top-0 z-30 h-18 glass-panel border-b border-white/10 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search Box */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="navbar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search invoice, customer, product, salesperson..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl glass-input placeholder:text-slate-500 text-slate-100"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Date Range, Notifications, Demo Data, Add Sale, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Data loader if low record count */}
        {recordCount === 0 && (
          <button
            onClick={onLoadDemoData}
            id="nav-load-demo-btn"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 rounded-xl transition-all shadow-sm shadow-cyan-500/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Data</span>
          </button>
        )}

        {/* Date Range Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDateMenu(!showDateMenu)}
            id="date-range-selector-btn"
            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 rounded-xl transition-colors"
          >
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="hidden md:inline">{activeDateLabel}</span>
          </button>

          {showDateMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDateMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-44 rounded-xl glass-modal border border-white/15 shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in duration-100">
                <div className="px-3 py-2 border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Date Range
                </div>
                {datePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onDateRangeChange(preset.id);
                      setShowDateMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                      dateRange === preset.id
                        ? 'text-cyan-300 bg-cyan-500/15 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {dateRange === preset.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-modal border border-white/15 shadow-2xl z-50 p-4 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <span className="font-semibold text-white">System Status</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Offline Ready
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-2 rounded-lg bg-white/5 flex items-start gap-2.5">
                    <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-200">IndexedDB Storage Active</div>
                      <div className="text-[11px] text-slate-400">
                        {recordCount} total transactions securely stored locally in your browser.
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 flex items-start gap-2.5">
                    <Download className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-200">Export Ready</div>
                      <div className="text-[11px] text-slate-400">
                        Excel and PDF report generation work entirely client-side.
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onSelectTab('settings');
                  }}
                  className="w-full mt-3 pt-2 border-t border-white/10 text-center text-cyan-400 hover:text-cyan-300 font-medium flex items-center justify-center gap-1"
                >
                  <span>Manage in Settings</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Add Sale Primary Action Button */}
        <button
          onClick={onOpenAddSale}
          id="navbar-add-sale-btn"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sale</span>
        </button>

        {/* User Profile Badge: Nitish Kumar (no login required) */}
        <div
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-2.5 pl-2 cursor-pointer group"
          title="Account profile: Nitish Kumar"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-sm">
            <div className="w-full h-full rounded-[11px] bg-slate-900 flex items-center justify-center font-bold text-xs text-indigo-300 group-hover:text-white transition-colors">
              NK
            </div>
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-xs font-semibold text-slate-200 leading-none group-hover:text-cyan-300 transition-colors">
              Nitish Kumar
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
