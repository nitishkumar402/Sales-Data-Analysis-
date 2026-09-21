import {
  TrendingUp,
  BarChart3,
  PieChart,
  MapPin,
  Award,
  DollarSign,
  ShoppingCart,
  Percent,
  Receipt,
  Download,
} from 'lucide-react';
import { KPIData, DateRangePreset } from '../types/sales';
import { Charts } from '../components/Charts';
import { formatCurrency } from '../utils/formatting';

interface AnalyticsViewProps {
  kpis: KPIData;
  dateRange: DateRangePreset;
  onDateRangeChange: (preset: DateRangePreset) => void;
  timeTrends: any[];
  categoryData: any[];
  paymentMethodData: any[];
  regionalData: any[];
  topProducts: any[];
  topSalespersons: any[];
  currencySymbol: string;
  currencyCode: string;
  onExportPDF: () => void;
}

export function AnalyticsView({
  kpis,
  dateRange,
  onDateRangeChange,
  timeTrends,
  categoryData,
  paymentMethodData,
  regionalData,
  topProducts,
  topSalespersons,
  currencySymbol,
  currencyCode,
  onExportPDF,
}: AnalyticsViewProps) {
  const dateRangeOptions: { id: DateRangePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'this_year', label: 'This Year' },
    { id: 'all', label: 'All Time' },
  ];

  // Financial margin calculations
  const discountRate =
    kpis.totalSales > 0 ? (kpis.totalDiscount / (kpis.totalSales + kpis.totalDiscount)) * 100 : 0;
  const effectiveTaxRate = kpis.totalSales > 0 ? (kpis.totalTax / kpis.totalSales) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deep-dive multi-dimensional performance analysis and territory metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            {dateRangeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onDateRangeChange(opt.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  dateRange === opt.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Ratios & Velocity Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Effective Discount Rate
          </span>
          <div className="text-xl lg:text-2xl font-bold text-amber-300">
            {discountRate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">of total gross demand</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Effective Tax / GST
          </span>
          <div className="text-xl lg:text-2xl font-bold text-sky-300">
            {effectiveTaxRate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">average statutory rate</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Order Realization
          </span>
          <div className="text-xl lg:text-2xl font-bold text-emerald-300">
            {formatCurrency(kpis.averageOrderValue, currencyCode, currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">ticket size per deal</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Fulfilled Order Rate
          </span>
          <div className="text-xl lg:text-2xl font-bold text-cyan-300">
            {kpis.totalOrders > 0
              ? (((kpis.totalOrders - kpis.pendingOrders) / kpis.totalOrders) * 100).toFixed(1)
              : '100'}
            %
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">dispatched & completed</span>
        </div>
      </div>

      {/* Comprehensive Visual Charts */}
      <Charts
        timeTrends={timeTrends}
        categoryData={categoryData}
        paymentMethodData={paymentMethodData}
        regionalData={regionalData}
        topProducts={topProducts}
        topSalespersons={topSalespersons}
        currencySymbol={currencySymbol}
        currencyCode={currencyCode}
      />
    </div>
  );
}
