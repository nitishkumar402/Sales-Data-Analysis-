import { useState } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Trash2,
  CheckCircle2,
  HardDrive,
  Info,
  DollarSign,
  User,
} from 'lucide-react';
import { Region } from '../types/sales';

interface SettingsViewProps {
  currencySymbol: string;
  onCurrencySymbolChange: (sym: string) => void;
  currencyCode: string;
  onCurrencyCodeChange: (code: string) => void;
  defaultTaxRate: number;
  onDefaultTaxRateChange: (rate: number) => void;
  defaultSalesperson: string;
  onDefaultSalespersonChange: (name: string) => void;
  defaultRegion: Region;
  onDefaultRegionChange: (reg: Region) => void;
  allSalesCount: number;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
}

export function SettingsView({
  currencySymbol,
  onCurrencySymbolChange,
  currencyCode,
  onCurrencyCodeChange,
  defaultTaxRate,
  onDefaultTaxRateChange,
  defaultSalesperson,
  onDefaultSalespersonChange,
  defaultRegion,
  onDefaultRegionChange,
  allSalesCount,
  onLoadDemoData,
  onClearAllData,
}: SettingsViewProps) {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currencyPresets = [
    { symbol: '₹', code: 'INR', label: 'Indian Rupee (₹ INR)' },
    { symbol: '$', code: 'USD', label: 'US Dollar ($ USD)' },
    { symbol: '€', code: 'EUR', label: 'Euro (€ EUR)' },
    { symbol: '£', code: 'GBP', label: 'British Pound (£ GBP)' },
    { symbol: '¥', code: 'JPY', label: 'Japanese Yen (¥ JPY)' },
    { symbol: 'A$', code: 'AUD', label: 'Australian Dollar (A$ AUD)' },
  ];

  const handleSaveNotification = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Settings & Local Storage
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure currency standards, default operational preferences, and local browser persistence
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Preferences Saved
          </span>
        )}
      </div>

      {/* Currency & Financial Standards */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Currency & Tax Standards</h3>
            <p className="text-xs text-slate-400">Default financial unit formatting throughout all views</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Currency Standard
            </label>
            <select
              value={`${currencySymbol}|${currencyCode}`}
              onChange={(e) => {
                const [sym, code] = e.target.value.split('|');
                onCurrencySymbolChange(sym);
                onCurrencyCodeChange(code);
                handleSaveNotification();
              }}
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input bg-slate-900 text-slate-100"
            >
              {currencyPresets.map((curr) => (
                <option key={curr.code} value={`${curr.symbol}|${curr.code}`}>
                  {curr.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Tax / GST Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={defaultTaxRate}
              onChange={(e) => {
                onDefaultTaxRateChange(parseFloat(e.target.value) || 0);
                handleSaveNotification();
              }}
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Default Form Values */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Default Transaction Assignment</h3>
            <p className="text-xs text-slate-400">Pre-fill values for new sales entry forms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Sales Representative
            </label>
            <input
              type="text"
              value={defaultSalesperson}
              onChange={(e) => {
                onDefaultSalespersonChange(e.target.value);
                handleSaveNotification();
              }}
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Region
            </label>
            <select
              value={defaultRegion}
              onChange={(e) => {
                onDefaultRegionChange(e.target.value as Region);
                handleSaveNotification();
              }}
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input bg-slate-900 text-slate-100"
            >
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
            </select>
          </div>
        </div>
      </div>

      {/* IndexedDB Storage Health & Data Tools */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Browser Storage Engine (IndexedDB)</h3>
            <p className="text-xs text-slate-400">Local-first client storage diagnostics</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Database</span>
            <span className="font-mono font-semibold text-cyan-400">SalesFlowDB</span>
          </div>
          <div>
            <span className="text-slate-400 block">Object Store</span>
            <span className="font-mono font-semibold text-slate-200">sales</span>
          </div>
          <div>
            <span className="text-slate-400 block">Total Records</span>
            <span className="font-semibold text-white">{allSalesCount} records</span>
          </div>
          <div>
            <span className="text-slate-400 block">State</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active & Offline
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onLoadDemoData}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load 45+ Realistic Indian Demo Records</span>
          </button>

          <button
            onClick={onClearAllData}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Sales Records</span>
          </button>
        </div>
      </div>

      {/* Offline Assurance Card */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">100% Client-Side & Local-First Architecture</strong>
          All transactions, analytics, and documents are stored and processed entirely inside your browser using IndexedDB. No external database, tracking, or cloud servers are required. Your data remains strictly on your device.
        </div>
      </div>
    </div>
  );
}
