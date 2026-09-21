import {
  Plus,
  FileSpreadsheet,
  FileText,
  Download,
  Upload,
  Search,
  RotateCcw,
} from 'lucide-react';
import { SaleRecord, FilterState, SortConfig, SaleStatus } from '../types/sales';
import { SalesTable } from '../components/SalesTable';
import { FilterPanel } from '../components/FilterPanel';

interface SalesViewProps {
  sales: SaleRecord[];
  allSalesCount: number;
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  activeChips: Array<{ key: keyof FilterState; label: string; value: string }>;
  onRemoveChip: (key: keyof FilterState) => void;
  filterOptions: {
    customers: string[];
    products: string[];
    categories: string[];
    salesPersons: string[];
    regions: string[];
    paymentMethods: string[];
    statuses: string[];
  };
  sort: SortConfig;
  onSort: (key: keyof SaleRecord) => void;
  onViewSale: (sale: SaleRecord) => void;
  onEditSale: (sale: SaleRecord) => void;
  onDuplicateSale: (sale: SaleRecord) => void;
  onDeleteSale: (sale: SaleRecord) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkUpdateStatus: (ids: string[], status: SaleStatus) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onExportSelectedExcel: (sales: SaleRecord[]) => void;
  onExportSelectedPDF: (sales: SaleRecord[]) => void;
  onOpenAddSale: () => void;
  onOpenImport: () => void;
  currencySymbol: string;
  currencyCode: string;
}

export function SalesView({
  sales,
  allSalesCount,
  filters,
  onUpdateFilter,
  onResetFilters,
  activeChips,
  onRemoveChip,
  filterOptions,
  sort,
  onSort,
  onViewSale,
  onEditSale,
  onDuplicateSale,
  onDeleteSale,
  onBulkDelete,
  onBulkUpdateStatus,
  onExportExcel,
  onExportPDF,
  onExportSelectedExcel,
  onExportSelectedPDF,
  onOpenAddSale,
  onOpenImport,
  currencySymbol,
  currencyCode,
}: SalesViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Sales Ledger & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, manage, search, and batch-process commercial transactions
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={onOpenAddSale}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sale</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel with Active Chips */}
      <FilterPanel
        filters={filters}
        onUpdateFilter={onUpdateFilter}
        onResetFilters={onResetFilters}
        activeChips={activeChips}
        onRemoveChip={onRemoveChip}
        filterOptions={filterOptions}
        currencySymbol={currencySymbol}
      />

      {/* Sales Table with Bulk Operations & Pagination */}
      <SalesTable
        sales={sales}
        sort={sort}
        onSort={onSort}
        onViewSale={onViewSale}
        onEditSale={onEditSale}
        onDuplicateSale={onDuplicateSale}
        onDeleteSale={onDeleteSale}
        onBulkDelete={onBulkDelete}
        onBulkUpdateStatus={onBulkUpdateStatus}
        onExportSelectedExcel={onExportSelectedExcel}
        onExportSelectedPDF={onExportSelectedPDF}
        currencySymbol={currencySymbol}
        currencyCode={currencyCode}
        defaultRowsPerPage={25}
      />
    </div>
  );
}
