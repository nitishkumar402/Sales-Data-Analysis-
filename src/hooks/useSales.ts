import { useState, useEffect, useCallback } from 'react';
import { SaleRecord } from '../types/sales';
import * as db from '../db/indexedDB';
import { getDemoSalesData } from '../utils/demoData';

export function useSales() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await db.getAllSales();
      setSales(data);
    } catch (err: any) {
      console.error('Failed to read from IndexedDB:', err);
      setError(err?.message || 'Error loading sales from local storage');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const addSale = async (newSale: SaleRecord): Promise<void> => {
    try {
      await db.addSale(newSale);
      setSales((prev) => [newSale, ...prev]);
    } catch (err: any) {
      console.error('Failed to add sale:', err);
      throw err;
    }
  };

  const updateSale = async (updatedSale: SaleRecord): Promise<void> => {
    try {
      await db.updateSale(updatedSale);
      setSales((prev) =>
        prev.map((item) => (item.id === updatedSale.id ? updatedSale : item))
      );
    } catch (err: any) {
      console.error('Failed to update sale:', err);
      throw err;
    }
  };

  const deleteSale = async (id: string): Promise<void> => {
    try {
      await db.deleteSale(id);
      setSales((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error('Failed to delete sale:', err);
      throw err;
    }
  };

  const bulkDeleteSales = async (ids: string[]): Promise<void> => {
    try {
      await db.bulkDeleteSales(ids);
      const set = new Set(ids);
      setSales((prev) => prev.filter((item) => !set.has(item.id)));
    } catch (err: any) {
      console.error('Failed to bulk delete sales:', err);
      throw err;
    }
  };

  const bulkUpdateStatus = async (ids: string[], newStatus: SaleRecord['status']): Promise<void> => {
    try {
      const set = new Set(ids);
      const updatedList: SaleRecord[] = [];
      
      for (const sale of sales) {
        if (set.has(sale.id)) {
          const updated = {
            ...sale,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
          await db.updateSale(updated);
          updatedList.push(updated);
        } else {
          updatedList.push(sale);
        }
      }
      setSales(updatedList);
    } catch (err: any) {
      console.error('Failed to update status in bulk:', err);
      throw err;
    }
  };

  const loadDemoData = async (): Promise<number> => {
    try {
      setLoading(true);
      const demoData = getDemoSalesData();
      await db.bulkAddSales(demoData);
      const refreshed = await db.getAllSales();
      setSales(refreshed);
      return demoData.length;
    } catch (err: any) {
      console.error('Failed to load demo data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async (): Promise<void> => {
    try {
      await db.clearAllSales();
      setSales([]);
    } catch (err: any) {
      console.error('Failed to clear database:', err);
      throw err;
    }
  };

  const importSales = async (records: SaleRecord[]): Promise<number> => {
    try {
      await db.bulkAddSales(records);
      const refreshed = await db.getAllSales();
      setSales(refreshed);
      return records.length;
    } catch (err: any) {
      console.error('Failed to import sales:', err);
      throw err;
    }
  };

  return {
    sales,
    loading,
    error,
    refreshSales: fetchSales,
    addSale,
    updateSale,
    deleteSale,
    bulkDeleteSales,
    bulkUpdateStatus,
    loadDemoData,
    clearAllData,
    importSales,
  };
}
