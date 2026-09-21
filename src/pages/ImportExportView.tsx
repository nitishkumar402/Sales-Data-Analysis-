import { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Download,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileJson,
} from 'lucide-react';
import { SaleRecord, KPIData } from '../types/sales';
import { exportSalesToExcel, downloadSampleExcelTemplate } from '../utils/excel';
import { exportSalesSummaryPDF, exportSalesTablePDF } from '../utils/pdf';

interface ImportExportViewProps {
  sales: SaleRecord[];
  allSales: SaleRecord[];
  kpis: KPIData;
  onOpenImportModal: () => void;
  onImportBackupJSON: (sales: SaleRecord[]) => Promise<void>;
  onClearAllData: () => void;
  onLoadDemoData: () => void;
  currencySymbol: string;
  currencyCode: string;
}

export function ImportExportView({
  sales,
  allSales,
  kpis,
  onOpenImportModal,
  onImportBackupJSON,
  onClearAllData,
  onLoadDemoData,
  currencySymbol,
  currencyCode,
}: ImportExportViewProps) {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [jsonMessage, setJsonMessage] = useState<string | null>(null);

  // Backup JSON export
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(allSales, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SalesFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restore JSON import
  const handleJSONFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        await onImportBackupJSON(parsed);
        setJsonMessage(`Successfully restored ${parsed.length} records from JSON backup.`);
      } else {
        setJsonMessage('Error: JSON file does not contain a valid sales array.');
      }
    } catch (err: any) {
      setJsonMessage(`Error parsing JSON: ${err.message}`);
    } finally {
      if (jsonInputRef.current) jsonInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Data Portability & Migration Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Import Excel spreadsheets, export audit-grade reports, and manage local JSON snapshots
          </p>
        </div>
      </div>

      {jsonMessage && (
        <div className="p-4 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between">
          <span>{jsonMessage}</span>
          <button
            onClick={() => setJsonMessage(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: 2 Columns for Import & Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Import Tools */}
        <div className="space-y-6">
          {/* Excel Import Box */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Import from Spreadsheet</h3>
                <p className="text-xs text-slate-400">Import .xlsx, .xls, or .csv files into local IndexedDB</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Upload existing billing or CRM sales logs. The browser parses rows, maps headers automatically, validates each record against duplicate invoices, and displays an interactive preview before insertion.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenImportModal}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md shadow-emerald-500/20 rounded-xl transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Launch Spreadsheet Importer</span>
              </button>

              <button
                onClick={downloadSampleExcelTemplate}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Sample .XLSX</span>
              </button>
            </div>
          </div>

          {/* JSON Snapshot Restore */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Restore JSON Archive</h3>
                <p className="text-xs text-slate-400">Restore complete backup JSON to browser IndexedDB</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Transfer your entire sales database from another computer or browser profile instantly using an exported JSON snapshot.
            </p>

            <div className="pt-2">
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleJSONFileChange}
                className="hidden"
              />
              <button
                onClick={() => jsonInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors"
              >
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Select JSON Backup File</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Export Tools */}
        <div className="space-y-6">
          {/* Excel Export Box */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Export to Excel (.xlsx)</h3>
                <p className="text-xs text-slate-400">Download formatted multi-column workbook</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Exports full sales data with clean headers, numeric types for quantity and financial values, tax breakdowns, and auto-sized columns compatible with Microsoft Excel, Google Sheets, and LibreOffice.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => exportSalesToExcel(sales, 'SalesFlow_Filtered_Export.xlsx')}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Current View ({sales.length} records)</span>
              </button>

              <button
                onClick={() => exportSalesToExcel(allSales, 'SalesFlow_Full_Ledger.xlsx')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
              >
                <span>Export All ({allSales.length} records)</span>
              </button>
            </div>
          </div>

          {/* PDF Reports Export */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Export Audit PDF Reports</h3>
                <p className="text-xs text-slate-400">Executive summaries and detailed transaction ledgers</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Generate styled PDF reports formatted with page numbers, date stamps, business header, and currency totals using jsPDF and AutoTable.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => exportSalesSummaryPDF(sales, kpis, currencySymbol, currencyCode)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Executive Summary PDF</span>
              </button>

              <button
                onClick={() => exportSalesTablePDF(sales, currencySymbol, currencyCode)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Full Ledger PDF</span>
              </button>
            </div>
          </div>

          {/* JSON Archive Backup */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Full JSON Database Backup</h3>
                <p className="text-xs text-slate-400">Raw portable snapshot of all sales records</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download JSON Backup ({allSales.length} items)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
