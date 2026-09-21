import { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  Calendar,
  Sparkles,
  CheckCircle2,
  PieChart,
  Users,
  Package,
} from 'lucide-react';
import { SaleRecord, KPIData, DateRangePreset } from '../types/sales';
import { exportSalesSummaryPDF, exportSalesTablePDF } from '../utils/pdf';
import { exportSalesToExcel } from '../utils/excel';
import { formatCurrency } from '../utils/formatting';

interface ReportsViewProps {
  sales: SaleRecord[];
  kpis: KPIData;
  dateRange: DateRangePreset;
  onDateRangeChange: (preset: DateRangePreset) => void;
  currencySymbol: string;
  currencyCode: string;
}

export function ReportsView({
  sales,
  kpis,
  dateRange,
  onDateRangeChange,
  currencySymbol,
  currencyCode,
}: ReportsViewProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleDownloadExecutiveSummary = async () => {
    setIsGenerating('executive');
    try {
      exportSalesSummaryPDF(sales, kpis, currencySymbol, currencyCode, `Period: ${dateRange}`);
    } finally {
      setTimeout(() => setIsGenerating(null), 500);
    }
  };

  const handleDownloadSalesRegisterPDF = async () => {
    setIsGenerating('register-pdf');
    try {
      exportSalesTablePDF(sales, currencySymbol, currencyCode, 'Sales Ledger Audit Report');
    } finally {
      setTimeout(() => setIsGenerating(null), 500);
    }
  };

  const handleDownloadSalesRegisterExcel = async () => {
    setIsGenerating('register-excel');
    try {
      exportSalesToExcel(sales);
    } finally {
      setTimeout(() => setIsGenerating(null), 500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Financial & Sales Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate publication-ready PDF and Excel documents formatted for audit and executive review
          </p>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report 1: Executive Summary */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-4">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Executive Summary Report</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Consolidated 1-2 page briefing document featuring core financial KPIs, regional performance breakdowns, payment split, and top SKU leaders.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <button
              onClick={handleDownloadExecutiveSummary}
              disabled={isGenerating === 'executive'}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 rounded-xl transition-all disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{isGenerating === 'executive' ? 'Generating PDF...' : 'Download Executive PDF'}</span>
            </button>
          </div>
        </div>

        {/* Report 2: Detailed Sales Register */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Complete Sales Register</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Line-by-line tabular statement containing all invoices, tax/GST schedules, customer names, payment methods, and net totals.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadSalesRegisterPDF}
              disabled={isGenerating === 'register-pdf'}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleDownloadSalesRegisterExcel}
              disabled={isGenerating === 'register-excel'}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Report 3: Tax & Statutory Remittance */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Tax & GST Statement</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Breakdown of taxable supplies, output GST / tax amounts collected, and net transaction basis across regions.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 mb-3 flex justify-between">
              <span>Total Tax Collected:</span>
              <span className="font-bold text-emerald-400">
                {formatCurrency(kpis.totalTax, currencyCode, currencySymbol)}
              </span>
            </div>
            <button
              onClick={handleDownloadExecutiveSummary}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Generate Tax Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
