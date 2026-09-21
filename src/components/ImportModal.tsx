import { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Download,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SaleRecord, ImportValidationRow } from '../types/sales';
import { parseExcelFile, downloadSampleExcelTemplate } from '../utils/excel';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportConfirmed: (validRecords: SaleRecord[]) => Promise<number>;
  existingInvoices: Set<string>;
  currencySymbol: string;
}

export function ImportModal({
  isOpen,
  onClose,
  onImportConfirmed,
  existingInvoices,
  currencySymbol,
}: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    rows: ImportValidationRow[];
    headers: string[];
    totalRows: number;
    validCount: number;
    errorCount: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'preview' | 'errors'>('preview');

  if (!isOpen) return null;

  const handleFile = async (selectedFile: File) => {
    try {
      setIsProcessing(true);
      setParseError(null);
      setFile(selectedFile);

      const buffer = await selectedFile.arrayBuffer();
      const result = parseExcelFile(buffer, existingInvoices);
      setValidationResult(result);
      if (result.errorCount > 0 && result.validCount === 0) {
        setActiveTab('errors');
      } else {
        setActiveTab('preview');
      }
    } catch (err: any) {
      console.error('Import parse error:', err);
      setParseError(err.message || 'Failed to read spreadsheet file.');
      setValidationResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleConfirmImport = async () => {
    if (!validationResult) return;
    const validRecords = validationResult.rows
      .filter((r) => r.isValid)
      .map((r, idx) => ({
        ...(r.data as SaleRecord),
        id: `import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: (r.data as SaleRecord).saleDate || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    if (validRecords.length === 0) return;
    await onImportConfirmed(validRecords);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        id="import-excel-modal"
        className="w-full max-w-4xl my-auto rounded-2xl glass-modal border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Import Sales Spreadsheet</h3>
              <p className="text-xs text-slate-400">Supports .xlsx, .xls, and .csv data spreadsheets</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {!validationResult ? (
            /* Upload State */
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-cyan-400/60 rounded-2xl p-10 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-cyan-500/[0.04] group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Drag and drop your sales file here, or browse
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Excel (.xlsx, .xls) or CSV files with column headers
                </p>
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors inline-block"
                >
                  Select File from Computer
                </button>
              </div>

              {parseError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Sample Template helper */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Need the standard layout? Download pre-formatted Excel template</span>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleExcelTemplate}
                  className="px-3 py-1.5 font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-colors"
                >
                  Download Template
                </button>
              </div>
            </div>
          ) : (
            /* Validation Results & Preview State */
            <div className="space-y-4">
              {/* Summary Scorecards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Total Detected Rows</span>
                  <span className="text-xl font-bold text-white">{validationResult.totalRows}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[11px] text-emerald-400 block font-medium">Valid for Import</span>
                  <span className="text-xl font-bold text-emerald-300">
                    {validationResult.validCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-[11px] text-rose-400 block font-medium">Rows with Errors</span>
                  <span className="text-xl font-bold text-rose-300">
                    {validationResult.errorCount}
                  </span>
                </div>
              </div>

              {/* View Switcher */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Valid Records Preview ({validationResult.validCount})
                  </button>
                  {validationResult.errorCount > 0 && (
                    <button
                      onClick={() => setActiveTab('errors')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        activeTab === 'errors'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Validation Errors ({validationResult.errorCount})
                    </button>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Choose Different File
                </button>
              </div>

              {/* Preview Table */}
              <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10">
                {activeTab === 'preview' ? (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 sticky top-0 uppercase tracking-wider font-semibold border-b border-white/10">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3">Region</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {validationResult.rows
                        .filter((r) => r.isValid)
                        .slice(0, 50)
                        .map((row) => (
                          <tr key={row.rowNumber} className="hover:bg-white/5">
                            <td className="py-2 px-3 font-mono font-semibold text-cyan-400">
                              {row.data.invoiceNumber}
                            </td>
                            <td className="py-2 px-3 text-slate-300">{row.data.saleDate}</td>
                            <td className="py-2 px-3 text-white font-medium">
                              {row.data.customerName}
                            </td>
                            <td className="py-2 px-3 text-slate-300">{row.data.productName}</td>
                            <td className="py-2 px-3 text-right">{row.data.quantity}</td>
                            <td className="py-2 px-3 text-right font-bold text-white">
                              {currencySymbol}
                              {row.data.totalAmount?.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-slate-400">{row.data.region}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 space-y-2.5">
                    {validationResult.rows
                      .filter((r) => !r.isValid)
                      .map((row) => (
                        <div
                          key={row.rowNumber}
                          className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs flex items-start gap-3"
                        >
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-white">
                              Row #{row.rowNumber} — {row.data.customerName || 'Unknown Customer'} (
                              {row.data.invoiceNumber || 'No Invoice'})
                            </div>
                            <ul className="list-disc list-inside text-rose-300 mt-1 space-y-0.5">
                              {row.errors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/60">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {validationResult && (
            <button
              type="button"
              id="import-confirm-btn"
              disabled={validationResult.validCount === 0}
              onClick={handleConfirmImport}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md shadow-emerald-500/20 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import {validationResult.validCount} Valid Records</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
