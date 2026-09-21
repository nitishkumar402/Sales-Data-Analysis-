import { useState, useMemo } from 'react';
import {
  Eye,
  Edit2,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Check,
} from 'lucide-react';
import { SaleRecord, SortConfig, SaleStatus } from '../types/sales';
import { formatCurrency, formatDate } from '../utils/formatting';

interface SalesTableProps {
  sales: SaleRecord[];
  sort: SortConfig;
  onSort: (key: keyof SaleRecord) => void;
  onViewSale: (sale: SaleRecord) => void;
  onEditSale: (sale: SaleRecord) => void;
  onDuplicateSale: (sale: SaleRecord) => void;
  onDeleteSale: (sale: SaleRecord) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkUpdateStatus: (ids: string[], status: SaleStatus) => void;
  onExportSelectedExcel: (selectedSales: SaleRecord[]) => void;
  onExportSelectedPDF: (selectedSales: SaleRecord[]) => void;
  currencySymbol: string;
  currencyCode: string;
  defaultRowsPerPage?: number;
}

export function SalesTable({
  sales,
  sort,
  onSort,
  onViewSale,
  onEditSale,
  onDuplicateSale,
  onDeleteSale,
  onBulkDelete,
  onBulkUpdateStatus,
  onExportSelectedExcel,
  onExportSelectedPDF,
  currencySymbol,
  currencyCode,
  defaultRowsPerPage = 10,
}: SalesTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultRowsPerPage);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sales.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedSales = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return sales.slice(startIndex, startIndex + pageSize);
  }, [sales, safePage, pageSize]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allCurrentIds = paginatedSales.map((s) => s.id);
      setSelectedIds(new Set([...selectedIds, ...allCurrentIds]));
    } else {
      const currentPageIds = new Set(paginatedSales.map((s) => s.id));
      const next = new Set<string>();
      selectedIds.forEach((id) => {
        if (!currentPageIds.has(id)) next.add(id);
      });
      setSelectedIds(next);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllCurrentSelected =
    paginatedSales.length > 0 &&
    paginatedSales.every((s) => selectedIds.has(s.id));

  const selectedSalesList = useMemo(() => {
    return sales.filter((s) => selectedIds.has(s.id));
  }, [sales, selectedIds]);

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Status badge helpers
  const getStatusBadge = (status: SaleStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
    }
  };

  // Sort indicator helper
  const renderSortHeader = (label: string, key: keyof SaleRecord, align: 'left' | 'right' = 'left') => {
    const isSorted = sort.key === key;
    return (
      <th
        onClick={() => onSort(key)}
        className={`py-3.5 px-3 cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors group ${
          align === 'right' ? 'text-right' : 'text-left'
        }`}
      >
        <div className={`inline-flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
          <span>{label}</span>
          {isSorted ? (
            sort.direction === 'asc' ? (
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-4">
      {/* Floating Bulk Action Bar if items are selected */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              {selectedIds.size}
            </div>
            <span className="text-sm font-semibold text-white">
              {selectedIds.size} {selectedIds.size === 1 ? 'sale' : 'sales'} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Change Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
              >
                <span>Change Status</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {bulkStatusOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBulkStatusOpen(false)} />
                  <div className="absolute right-0 mt-1 w-40 rounded-xl glass-modal border border-white/15 shadow-2xl z-50 py-1 overflow-hidden">
                    {(['Completed', 'Processing', 'Pending', 'Cancelled'] as SaleStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          onBulkUpdateStatus(Array.from(selectedIds), st);
                          setBulkStatusOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Export Selected to Excel */}
            <button
              onClick={() => onExportSelectedExcel(selectedSalesList)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl transition-colors text-emerald-300"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            {/* Export Selected to PDF */}
            <button
              onClick={() => onExportSelectedPDF(selectedSalesList)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-xl transition-colors text-sky-300"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            {/* Delete Selected */}
            <button
              onClick={() => onBulkDelete(Array.from(selectedIds))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>

            {/* Clear Selection */}
            <button
              onClick={clearSelection}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Table Card */}
      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/30 bg-slate-900 cursor-pointer"
                    aria-label="Select all sales on current page"
                  />
                </th>

                {renderSortHeader('Invoice #', 'invoiceNumber')}
                {renderSortHeader('Date', 'saleDate')}
                {renderSortHeader('Customer', 'customerName')}
                {renderSortHeader('Product', 'productName')}
                {renderSortHeader('Category', 'category')}
                {renderSortHeader('Qty', 'quantity', 'right')}
                {renderSortHeader('Unit Price', 'unitPrice', 'right')}
                {renderSortHeader('Disc', 'discount', 'right')}
                {renderSortHeader('Tax', 'tax', 'right')}
                {renderSortHeader('Total', 'totalAmount', 'right')}
                {renderSortHeader('Payment', 'paymentMethod')}
                {renderSortHeader('Sales Rep', 'salesPerson')}
                {renderSortHeader('Region', 'region')}
                {renderSortHeader('Status', 'status')}
                <th className="py-3.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-200">
              {paginatedSales.map((sale) => {
                const isSelected = selectedIds.has(sale.id);
                return (
                  <tr
                    key={sale.id}
                    id={`sale-row-${sale.id}`}
                    className={`hover:bg-white/[0.04] transition-colors group ${
                      isSelected ? 'bg-cyan-500/[0.07]' : ''
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(sale.id)}
                        className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/30 bg-slate-900 cursor-pointer"
                        aria-label={`Select invoice ${sale.invoiceNumber}`}
                      />
                    </td>

                    {/* Invoice Number */}
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {sale.invoiceNumber}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {formatDate(sale.saleDate)}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-white block truncate max-w-[140px]">
                        {sale.customerName}
                      </span>
                      {sale.customerPhone && (
                        <span className="text-[10px] text-slate-400 block truncate">
                          {sale.customerPhone}
                        </span>
                      )}
                    </td>

                    {/* Product */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-200 block truncate max-w-[160px]">
                        {sale.productName}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[11px]">
                        {sale.category}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-right font-medium text-slate-200">
                      {sale.quantity}
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-3 text-right text-slate-300">
                      {formatCurrency(sale.unitPrice, currencyCode, currencySymbol)}
                    </td>

                    {/* Discount */}
                    <td className="py-3 px-3 text-right text-amber-400/90 font-mono">
                      {sale.discount > 0 ? `${sale.discount}%` : '—'}
                    </td>

                    {/* Tax */}
                    <td className="py-3 px-3 text-right text-slate-400 font-mono">
                      {sale.tax > 0 ? `${sale.tax}%` : '—'}
                    </td>

                    {/* Grand Total */}
                    <td className="py-3 px-3 text-right font-bold text-white whitespace-nowrap">
                      {formatCurrency(sale.totalAmount, currencyCode, currencySymbol)}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      {sale.paymentMethod}
                    </td>

                    {/* Salesperson */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      {sale.salesPerson}
                    </td>

                    {/* Region */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      {sale.region}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(sale.status)}
                    </td>

                    {/* Action Buttons: View, Edit, Duplicate, Delete */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewSale(sale)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditSale(sale)}
                          title="Edit Sale"
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateSale(sale)}
                          title="Duplicate Sale"
                          className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-500/15 rounded-lg transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSale(sale)}
                          title="Delete Sale"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State in Table if 0 rows */}
        {sales.length === 0 && (
          <div className="py-16 px-4 text-center">
            <p className="text-sm font-semibold text-slate-300">No matching sales records found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or filter criteria.
            </p>
          </div>
        )}

        {/* Table Footer: Pagination & Rows Per Page */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-white/10 bg-slate-900/60 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 rounded-lg glass-input bg-slate-900 text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-500">|</span>
            <span>
              Showing {(safePage - 1) * pageSize + (sales.length > 0 ? 1 : 0)} -{' '}
              {Math.min(safePage * pageSize, sales.length)} of {sales.length} records
            </span>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (safePage <= 3) {
                pageNum = i + 1;
              } else if (safePage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = safePage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                    safePage === pageNum
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
