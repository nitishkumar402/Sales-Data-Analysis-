import { X, Edit, Download, Printer, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { SaleRecord } from '../types/sales';
import { formatCurrency, formatDate } from '../utils/formatting';
import { exportSingleInvoicePDF } from '../utils/pdf';

interface SaleDetailsModalProps {
  sale: SaleRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (sale: SaleRecord) => void;
  currencySymbol: string;
  currencyCode: string;
}

export function SaleDetailsModal({
  sale,
  isOpen,
  onClose,
  onEdit,
  currencySymbol,
  currencyCode,
}: SaleDetailsModalProps) {
  if (!isOpen || !sale) return null;

  const statusIcons = {
    Completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    Processing: <Clock className="w-4 h-4 text-sky-400" />,
    Pending: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    Cancelled: <XCircle className="w-4 h-4 text-rose-400" />,
  };

  const statusBadges = {
    Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Processing: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Cancelled: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };

  const handleDownloadPDF = () => {
    exportSingleInvoicePDF(sale, currencySymbol, currencyCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        id="sale-details-modal"
        className="w-full max-w-2xl my-auto rounded-2xl glass-modal border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-400">Invoice Details</span>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="font-mono text-base font-bold text-white tracking-wide">
              {sale.invoiceNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Card Content */}
        <div className="p-6 space-y-6">
          {/* Top Banner: Status & Date */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-white/10">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Issue Date</span>
              <span className="text-sm font-semibold text-slate-200">
                {formatDate(sale.saleDate)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Payment Method</span>
              <span className="text-sm font-semibold text-slate-200">
                {sale.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Order Status</span>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadges[sale.status]}`}
              >
                {statusIcons[sale.status]}
                <span>{sale.status}</span>
              </div>
            </div>
          </div>

          {/* Customer & Representative Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 block mb-2">
                Customer Information
              </span>
              <h4 className="text-base font-bold text-white mb-1">{sale.customerName}</h4>
              <p className="text-xs text-slate-300">
                Email: {sale.customerEmail || '—'}
              </p>
              <p className="text-xs text-slate-300">
                Phone: {sale.customerPhone || '—'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Region: <span className="text-slate-200 font-medium">{sale.region}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block mb-2">
                Sales Representative
              </span>
              <h4 className="text-base font-bold text-white mb-1">{sale.salesPerson}</h4>
              <p className="text-xs text-slate-400">
                Commission Territory: <span className="text-slate-200">{sale.region}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Recorded: {new Date(sale.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-white/10 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item & Category</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                <tr>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">{sale.productName}</span>
                    <span className="text-[11px] text-slate-400">{sale.category}</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium">{sale.quantity}</td>
                  <td className="py-3.5 px-3 text-right">
                    {formatCurrency(sale.unitPrice, currencyCode, currencySymbol)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-white">
                    {formatCurrency(sale.subtotal, currencyCode, currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Notes & Memos
              </span>
              <p className="text-xs text-slate-300 italic">
                {sale.notes || 'No additional notes entered for this invoice.'}
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-200">
                  {formatCurrency(sale.subtotal, currencyCode, currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Discount ({sale.discount}%):</span>
                <span>-{formatCurrency(sale.discountAmount, currencyCode, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tax / GST ({sale.tax}%):</span>
                <span>+{formatCurrency(sale.taxAmount, currencyCode, currencySymbol)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-white">
                <span>Grand Total:</span>
                <span className="text-cyan-300">
                  {formatCurrency(sale.totalAmount, currencyCode, currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/60">
          <button
            onClick={() => {
              onClose();
              onEdit(sale);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Record</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
