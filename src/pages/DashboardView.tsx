import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Package,
  Percent,
  Receipt,
  Clock,
  Plus,
  FileSpreadsheet,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SaleRecord, KPIData, DateRangePreset, ActiveTab } from '../types/sales';
import { StatCard } from '../components/StatCard';
import { Charts } from '../components/Charts';
import { SalesTable } from '../components/SalesTable';
import { formatCurrency } from '../utils/formatting';

interface DashboardViewProps {
  sales: SaleRecord[];
  allSalesCount: number;
  kpis: KPIData;
  dateRange: DateRangePreset;
  onDateRangeChange: (preset: DateRangePreset) => void;
  onOpenAddSale: () => void;
  onOpenImport: () => void;
  onLoadDemoData: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  timeTrends: any[];
  categoryData: any[];
  paymentMethodData: any[];
  regionalData: any[];
  topProducts: any[];
  topSalespersons: any[];
  currencySymbol: string;
  currencyCode: string;
  onViewSale: (sale: SaleRecord) => void;
  onEditSale: (sale: SaleRecord) => void;
  onDuplicateSale: (sale: SaleRecord) => void;
  onDeleteSale: (sale: SaleRecord) => void;
}

export function DashboardView({
  sales,
  allSalesCount,
  kpis,
  dateRange,
  onDateRangeChange,
  onOpenAddSale,
  onOpenImport,
  onLoadDemoData,
  onExportPDF,
  onExportExcel,
  onSelectTab,
  timeTrends,
  categoryData,
  paymentMethodData,
  regionalData,
  topProducts,
  topSalespersons,
  currencySymbol,
  currencyCode,
  onViewSale,
  onEditSale,
  onDuplicateSale,
  onDeleteSale,
}: DashboardViewProps) {
  const dateRangeOptions: { id: DateRangePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'this_year', label: 'This Year' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header Section: Sales Analytics Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Sales Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time commercial performance, sales velocity, and financial health metrics
          </p>
        </div>

        {/* Action Controls & Date Range Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Quick Date Pills */}
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

          {/* Export PDF Report Button */}
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            title="Download PDF Executive Summary"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export PDF</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            title="Export Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          {/* Add Sale Button */}
          <button
            onClick={onOpenAddSale}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sale</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner if no records exist in database */}
      {allSalesCount === 0 && (
        <div className="p-8 rounded-3xl glass-panel border border-cyan-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">No sales data yet</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            Add your first sale or import an Excel spreadsheet to unlock real-time revenue analytics and automated charts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenAddSale}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sale</span>
            </button>
            <button
              onClick={onOpenImport}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Import Excel</span>
            </button>
            <button
              onClick={onLoadDemoData}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load 45+ Demo Sales</span>
            </button>
          </div>
        </div>
      )}

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Sales (Volume Revenue) */}
        <StatCard
          id="kpi-total-sales"
          icon={TrendingUp}
          label="Total Sales"
          value={formatCurrency(kpis.totalSales, currencyCode, currencySymbol)}
          change={kpis.revenueChange}
          periodText="vs previous half"
          badgeColor="cyan"
        />

        {/* 2. Total Orders */}
        <StatCard
          id="kpi-total-orders"
          icon={ShoppingCart}
          label="Total Orders"
          value={kpis.totalOrders.toLocaleString()}
          change={kpis.ordersChange}
          periodText="orders placed"
          badgeColor="indigo"
        />

        {/* 3. Total Revenue */}
        <StatCard
          id="kpi-total-revenue"
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(kpis.totalSales, currencyCode, currencySymbol)}
          change={kpis.revenueChange}
          periodText="net realization"
          badgeColor="emerald"
        />

        {/* 4. Average Order Value */}
        <StatCard
          id="kpi-aov"
          icon={CreditCard}
          label="Average Order Value"
          value={formatCurrency(kpis.averageOrderValue, currencyCode, currencySymbol)}
          change={kpis.aovChange}
          periodText="per customer invoice"
          badgeColor="amber"
        />

        {/* 5. Total Units Sold */}
        <StatCard
          id="kpi-units-sold"
          icon={Package}
          label="Total Units Sold"
          value={kpis.totalUnitsSold.toLocaleString()}
          change={kpis.unitsChange}
          periodText="items delivered"
          badgeColor="purple"
        />

        {/* 6. Total Discount */}
        <StatCard
          id="kpi-total-discount"
          icon={Percent}
          label="Total Discount"
          value={formatCurrency(kpis.totalDiscount, currencyCode, currencySymbol)}
          periodText="promotional savings"
          badgeColor="rose"
        />

        {/* 7. Total Tax */}
        <StatCard
          id="kpi-total-tax"
          icon={Receipt}
          label="Total Tax (GST)"
          value={formatCurrency(kpis.totalTax, currencyCode, currencySymbol)}
          periodText="statutory remittance"
          badgeColor="sky"
        />

        {/* 8. Pending Orders */}
        <StatCard
          id="kpi-pending-orders"
          icon={Clock}
          label="Pending Orders"
          value={kpis.pendingOrders.toLocaleString()}
          periodText="in pipeline / dispatch"
          badgeColor="amber"
        />
      </div>

      {/* Interactive Charts Section */}
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

      {/* Recent Transactions Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Recent Sales Transactions
            </h2>
            <p className="text-xs text-slate-400">
              Latest recorded invoices across all territories
            </p>
          </div>
          <button
            onClick={() => onSelectTab('sales')}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View Full Sales Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick summary table of top 5 recent sales */}
        <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{sale.saleDate}</td>
                    <td className="py-3 px-3 font-medium text-white">{sale.customerName}</td>
                    <td className="py-3 px-3 text-slate-300">{sale.productName}</td>
                    <td className="py-3 px-3 text-right">{sale.quantity}</td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {formatCurrency(sale.totalAmount, currencyCode, currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{sale.paymentMethod}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewSale(sale)}
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
