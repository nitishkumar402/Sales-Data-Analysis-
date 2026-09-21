import { useState, useEffect } from 'react';
import { useSales } from './hooks/useSales';
import { useFilters } from './hooks/useFilters';
import { useAnalytics } from './hooks/useAnalytics';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastProvider, useToast } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SaleFormModal } from './components/SaleFormModal';
import { SaleDetailsModal } from './components/SaleDetailsModal';
import { ImportModal } from './components/ImportModal';

// Pages
import { DashboardView } from './pages/DashboardView';
import { SalesView } from './pages/SalesView';
import { CustomersView } from './pages/CustomersView';
import { ProductsView } from './pages/ProductsView';
import { AnalyticsView } from './pages/AnalyticsView';
import { ReportsView } from './pages/ReportsView';
import { ImportExportView } from './pages/ImportExportView';
import { SettingsView } from './pages/SettingsView';

import { ActiveTab, SaleRecord, Region, SaleStatus, DateRangePreset } from './types/sales';
import { exportSalesToExcel } from './utils/excel';
import { exportSalesSummaryPDF, exportSalesTablePDF } from './utils/pdf';

function SalesFlowApp() {
  const { showToast } = useToast();

  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User Settings state (persisted in localStorage)
  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    return localStorage.getItem('salesflow_currency_symbol') || '₹';
  });
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    return localStorage.getItem('salesflow_currency_code') || 'INR';
  });
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(() => {
    const saved = localStorage.getItem('salesflow_default_tax');
    return saved !== null ? parseFloat(saved) : 18;
  });
  const [defaultSalesperson, setDefaultSalesperson] = useState<string>(() => {
    return localStorage.getItem('salesflow_default_rep') || 'Nitish Kumar';
  });
  const [defaultRegion, setDefaultRegion] = useState<Region>(() => {
    return (localStorage.getItem('salesflow_default_region') as Region) || 'North';
  });

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('salesflow_currency_symbol', currencySymbol);
    localStorage.setItem('salesflow_currency_code', currencyCode);
    localStorage.setItem('salesflow_default_tax', defaultTaxRate.toString());
    localStorage.setItem('salesflow_default_rep', defaultSalesperson);
    localStorage.setItem('salesflow_default_region', defaultRegion);
  }, [currencySymbol, currencyCode, defaultTaxRate, defaultSalesperson, defaultRegion]);

  // IndexedDB data layer hook
  const {
    sales: allSales,
    loading,
    addSale,
    updateSale,
    deleteSale,
    bulkDeleteSales,
    bulkUpdateStatus,
    importSales,
    clearAllData,
    loadDemoData,
  } = useSales();

  // Filters & sorting hook
  const {
    filteredSales,
    filters,
    sort,
    updateFilter,
    resetFilters,
    handleSort,
    activeChips,
    removeChip,
    filterOptions,
  } = useFilters(allSales);

  // Analytics & aggregation hook
  const {
    kpis,
    timeTrends,
    categoryData,
    paymentMethodData,
    regionalData,
    topProducts,
    topSalespersons,
  } = useAnalytics(filteredSales);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<SaleRecord | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<SaleRecord | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Auto-seed demo data on first launch if empty
  useEffect(() => {
    if (!loading && allSales.length === 0) {
      const hasSeededBefore = localStorage.getItem('salesflow_auto_seeded');
      if (!hasSeededBefore) {
        localStorage.setItem('salesflow_auto_seeded', 'true');
        loadDemoData().then((count) => {
          showToast('Welcome to SalesFlow Analytics', `Loaded ${count} demo records to explore.`, 'success');
        });
      }
    }
  }, [loading, allSales.length, loadDemoData, showToast]);

  // Existing invoice numbers set for fast duplicate detection in importer
  const existingInvoicesSet = new Set(allSales.map((s) => s.invoiceNumber.toUpperCase()));

  // Handlers for Sale operations
  const handleOpenAddSale = () => {
    setSaleToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditSale = (sale: SaleRecord) => {
    setSaleToEdit(sale);
    setIsAddEditModalOpen(true);
  };

  const handleSaveSale = async (sale: SaleRecord) => {
    try {
      if (saleToEdit) {
        await updateSale(sale);
        showToast('Sale Updated', `Invoice ${sale.invoiceNumber} updated successfully.`, 'success');
      } else {
        await addSale(sale);
        showToast('Sale Created', `Invoice ${sale.invoiceNumber} recorded successfully.`, 'success');
      }
    } catch (err: any) {
      showToast('Error Saving Sale', err.message || 'Could not save record.', 'error');
    }
  };

  const handleDuplicateSale = async (sale: SaleRecord) => {
    try {
      const duplicated: SaleRecord = {
        ...sale,
        id: `sale-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(
          allSales.length + 1 + Math.floor(Math.random() * 500)
        ).padStart(4, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addSale(duplicated);
      showToast('Sale Duplicated', `Created duplicate invoice ${duplicated.invoiceNumber}.`, 'success');
    } catch (err: any) {
      showToast('Duplicate Error', err.message, 'error');
    }
  };

  const handleDeleteSingleSale = (sale: SaleRecord) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Sale Record',
      message: `Are you sure you want to delete invoice ${sale.invoiceNumber} (${sale.customerName})? This action cannot be undone.`,
      confirmText: 'Delete Record',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteSale(sale.id);
          showToast('Sale Deleted', `Invoice ${sale.invoiceNumber} has been removed.`, 'info');
        } catch (err: any) {
          showToast('Delete Failed', err.message, 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${ids.length} Selected Records`,
      message: `Are you sure you want to permanently delete these ${ids.length} sales transactions from your local IndexedDB?`,
      confirmText: 'Delete Selected',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await bulkDeleteSales(ids);
          showToast('Bulk Delete Completed', `Removed ${ids.length} records from database.`, 'info');
        } catch (err: any) {
          showToast('Bulk Delete Failed', err.message, 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleBulkUpdateStatus = async (ids: string[], status: SaleStatus) => {
    try {
      await bulkUpdateStatus(ids, status);
      showToast('Status Updated', `Changed status to "${status}" for ${ids.length} transactions.`, 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  const handleClearAllData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Sales Data',
      message:
        'This will permanently delete all sales transactions from your browser. Are you sure you want to proceed?',
      confirmText: 'Clear Entire Database',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await clearAllData();
          showToast('Database Cleared', 'All sales records were removed from local storage.', 'info');
        } catch (err: any) {
          showToast('Clear Failed', err.message, 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleLoadDemoData = async () => {
    try {
      const count = await loadDemoData();
      showToast('Demo Data Loaded', `Loaded ${count} realistic sales records with metrics.`, 'success');
    } catch (err: any) {
      showToast('Error Loading Demo Data', err.message, 'error');
    }
  };

  const handleImportSuccess = async (records: SaleRecord[]): Promise<number> => {
    try {
      const count = await importSales(records);
      showToast('Import Successful', `Imported ${count} sales records into IndexedDB.`, 'success');
      return count;
    } catch (err: any) {
      showToast('Import Failed', err.message, 'error');
      throw err;
    }
  };

  const handleViewSale = (sale: SaleRecord) => {
    setViewingSale(sale);
    setIsDetailsModalOpen(true);
  };

  // Export handlers
  const handleExportAllExcel = () => {
    exportSalesToExcel(filteredSales, `SalesFlow_Export_${filters.dateRange}.xlsx`);
    showToast('Excel Exported', 'Downloaded workbook containing current sales view.', 'success');
  };

  const handleExportExecutivePDF = () => {
    exportSalesSummaryPDF(
      filteredSales,
      kpis,
      currencySymbol,
      currencyCode,
      `Report Period: ${filters.dateRange.toUpperCase()}`
    );
    showToast('PDF Exported', 'Executive Summary PDF downloaded.', 'success');
  };

  const handleExportSelectedExcel = (selectedSales: SaleRecord[]) => {
    exportSalesToExcel(selectedSales, `SalesFlow_Selected_${selectedSales.length}.xlsx`);
    showToast('Excel Exported', `Downloaded ${selectedSales.length} selected records.`, 'success');
  };

  const handleExportSelectedPDF = (selectedSales: SaleRecord[]) => {
    exportSalesTablePDF(
      selectedSales,
      currencySymbol,
      currencyCode,
      `Selected Sales Transactions (${selectedSales.length})`
    );
    showToast('PDF Exported', `Downloaded ${selectedSales.length} records as PDF.`, 'success');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Sale Add / Edit Modal */}
      <SaleFormModal
        isOpen={isAddEditModalOpen}
        saleToEdit={saleToEdit}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveSale}
        existingSalesCount={allSales.length}
        currencySymbol={currencySymbol}
        currencyCode={currencyCode}
      />

      {/* Sale Details Invoice Modal */}
      <SaleDetailsModal
        isOpen={isDetailsModalOpen}
        sale={viewingSale}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={(sale) => {
          setIsDetailsModalOpen(false);
          handleOpenEditSale(sale);
        }}
        currencySymbol={currencySymbol}
        currencyCode={currencyCode}
      />

      {/* Spreadsheet Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportConfirmed={handleImportSuccess}
        existingInvoices={existingInvoicesSet}
        currencySymbol={currencySymbol}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        recordCount={allSales.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          searchQuery={filters.search}
          onSearchChange={(val) => updateFilter('search', val)}
          dateRange={filters.dateRange}
          onDateRangeChange={(preset: DateRangePreset) => updateFilter('dateRange', preset)}
          onOpenAddSale={handleOpenAddSale}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          currencySymbol={currencySymbol}
          recordCount={allSales.length}
          onLoadDemoData={handleLoadDemoData}
          onSelectTab={setActiveTab}
        />

        {/* Dynamic Page Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              sales={filteredSales}
              allSalesCount={allSales.length}
              kpis={kpis}
              dateRange={filters.dateRange}
              onDateRangeChange={(preset: DateRangePreset) => updateFilter('dateRange', preset)}
              onOpenAddSale={handleOpenAddSale}
              onOpenImport={() => setIsImportModalOpen(true)}
              onLoadDemoData={handleLoadDemoData}
              onExportPDF={handleExportExecutivePDF}
              onExportExcel={handleExportAllExcel}
              onSelectTab={setActiveTab}
              timeTrends={timeTrends}
              categoryData={categoryData}
              paymentMethodData={paymentMethodData}
              regionalData={regionalData}
              topProducts={topProducts}
              topSalespersons={topSalespersons}
              currencySymbol={currencySymbol}
              currencyCode={currencyCode}
              onViewSale={handleViewSale}
              onEditSale={handleOpenEditSale}
              onDuplicateSale={handleDuplicateSale}
              onDeleteSale={handleDeleteSingleSale}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              sales={filteredSales}
              allSalesCount={allSales.length}
              filters={filters}
              onUpdateFilter={updateFilter}
              onResetFilters={resetFilters}
              activeChips={activeChips}
              onRemoveChip={removeChip}
              filterOptions={filterOptions}
              sort={sort}
              onSort={handleSort}
              onViewSale={handleViewSale}
              onEditSale={handleOpenEditSale}
              onDuplicateSale={handleDuplicateSale}
              onDeleteSale={handleDeleteSingleSale}
              onBulkDelete={handleBulkDelete}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onExportExcel={handleExportAllExcel}
              onExportPDF={handleExportExecutivePDF}
              onExportSelectedExcel={handleExportSelectedExcel}
              onExportSelectedPDF={handleExportSelectedPDF}
              onOpenAddSale={handleOpenAddSale}
              onOpenImport={() => setIsImportModalOpen(true)}
              currencySymbol={currencySymbol}
              currencyCode={currencyCode}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              sales={filteredSales}
              onViewSale={handleViewSale}
              currencySymbol={currencySymbol}
              currencyCode={currencyCode}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              sales={filteredSales}
              currencySymbol={currencySymbol}
              currencyCode={currencyCode}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              kpis={kpis}
              dateRange={filters.dateRange}
              onDateRangeChange={(preset: DateRangePreset) => updateFilter('dateRange', preset)}
              timeTrends={timeTrends}
              categoryData={categoryData}
              paymentMethodData={paymentMethodData}
              regionalData={regionalData}
              topProducts={topProducts}
              topSalespersons={topSalespersons}
              currencySymbol={currencySymbol}
              currencyCode={currencyCode}
              onExportPDF={handleExportExecutivePDF}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              sales={filteredSales}
              kpis={kpis}
              dateRange={filters.dateRange}
              onDateRangeChange={(preset: DateRangePreset) => updateFilter('dateRange', preset)}
              currencySymbol={currencySymbol}
              currencyCode={currencyCode}
            />
          )}

          {activeTab === 'import-export' && (
            <ImportExportView
              sales={filteredSales}
              allSales={allSales}
              kpis={kpis}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onImportBackupJSON={async (records) => {
                await handleImportSuccess(records);
              }}
              onClearAllData={handleClearAllData}
              onLoadDemoData={handleLoadDemoData}
              currencySymbol={currencySymbol}
              currencyCode={currencyCode}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currencySymbol={currencySymbol}
              onCurrencySymbolChange={setCurrencySymbol}
              currencyCode={currencyCode}
              onCurrencyCodeChange={setCurrencyCode}
              defaultTaxRate={defaultTaxRate}
              onDefaultTaxRateChange={setDefaultTaxRate}
              defaultSalesperson={defaultSalesperson}
              onDefaultSalespersonChange={setDefaultSalesperson}
              defaultRegion={defaultRegion}
              onDefaultRegionChange={setDefaultRegion}
              allSalesCount={allSales.length}
              onLoadDemoData={handleLoadDemoData}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <SalesFlowApp />
    </ToastProvider>
  );
}
