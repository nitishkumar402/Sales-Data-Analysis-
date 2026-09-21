import { useState, useMemo } from 'react';
import { SaleRecord, FilterState, SortConfig, DateRangePreset } from '../types/sales';

const INITIAL_FILTERS: FilterState = {
  search: '',
  dateRange: 'all',
  startDate: '',
  endDate: '',
  customer: '',
  product: '',
  category: '',
  salesPerson: '',
  region: '',
  paymentMethod: '',
  status: '',
  minAmount: null,
  maxAmount: null,
};

export function useFilters(sales: SaleRecord[]) {
  // Load saved preferences from localStorage if available
  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const saved = localStorage.getItem('salesflow_filters');
      if (saved) {
        return { ...INITIAL_FILTERS, ...JSON.parse(saved), search: '' };
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_FILTERS;
  });

  const [sort, setSort] = useState<SortConfig>({
    key: 'saleDate',
    direction: 'desc',
  });

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(
          'salesflow_filters',
          JSON.stringify({
            category: next.category,
            region: next.region,
            status: next.status,
            dateRange: next.dateRange,
          })
        );
      } catch (e) {}
      return next;
    });
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    try {
      localStorage.removeItem('salesflow_filters');
    } catch (e) {}
  };

  const handleSort = (key: keyof SaleRecord) => {
    setSort((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'desc' };
    });
  };

  // Derive unique filter options from the current database
  const filterOptions = useMemo(() => {
    const customers = Array.from(new Set(sales.map((s) => s.customerName).filter(Boolean))).sort();
    const products = Array.from(new Set(sales.map((s) => s.productName).filter(Boolean))).sort();
    const categories = Array.from(new Set(sales.map((s) => s.category).filter(Boolean))).sort();
    const salesPersons = Array.from(new Set(sales.map((s) => s.salesPerson).filter(Boolean))).sort();
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const paymentMethods = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];
    const statuses = ['Completed', 'Pending', 'Processing', 'Cancelled'];

    return {
      customers,
      products,
      categories,
      salesPersons,
      regions,
      paymentMethods,
      statuses,
    };
  }, [sales]);

  // Filter sales based on all active parameters
  const filteredSales = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Helper for date checks
    const getDateWindow = (preset: DateRangePreset): { start: string; end: string } | null => {
      if (preset === 'all') return null;

      const now = new Date();
      if (preset === 'today') {
        return { start: todayStr, end: todayStr };
      }

      if (preset === 'this_week') {
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // standard Mon-Sun week
        const monday = new Date(now);
        monday.setDate(now.getDate() - diffToMonday);
        return {
          start: monday.toISOString().split('T')[0],
          end: todayStr,
        };
      }

      if (preset === 'this_month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          start: start.toISOString().split('T')[0],
          end: todayStr,
        };
      }

      if (preset === 'this_quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), currentQuarter * 3, 1);
        return {
          start: start.toISOString().split('T')[0],
          end: todayStr,
        };
      }

      if (preset === 'this_year') {
        const start = new Date(now.getFullYear(), 0, 1);
        return {
          start: start.toISOString().split('T')[0],
          end: todayStr,
        };
      }

      if (preset === 'custom' && filters.startDate && filters.endDate) {
        return {
          start: filters.startDate,
          end: filters.endDate,
        };
      }

      return null;
    };

    const dateWindow = getDateWindow(filters.dateRange);
    const searchLower = filters.search.trim().toLowerCase();

    return sales.filter((sale) => {
      // Search matching across multiple fields
      if (searchLower) {
        const match =
          sale.invoiceNumber.toLowerCase().includes(searchLower) ||
          sale.customerName.toLowerCase().includes(searchLower) ||
          (sale.customerEmail && sale.customerEmail.toLowerCase().includes(searchLower)) ||
          (sale.customerPhone && sale.customerPhone.toLowerCase().includes(searchLower)) ||
          sale.productName.toLowerCase().includes(searchLower) ||
          sale.category.toLowerCase().includes(searchLower) ||
          sale.salesPerson.toLowerCase().includes(searchLower) ||
          sale.region.toLowerCase().includes(searchLower) ||
          sale.paymentMethod.toLowerCase().includes(searchLower) ||
          sale.status.toLowerCase().includes(searchLower);

        if (!match) return false;
      }

      // Date window filter
      if (dateWindow) {
        if (sale.saleDate < dateWindow.start || sale.saleDate > dateWindow.end) {
          return false;
        }
      }

      // Customer filter
      if (filters.customer && sale.customerName !== filters.customer) {
        return false;
      }

      // Product filter
      if (filters.product && sale.productName !== filters.product) {
        return false;
      }

      // Category filter
      if (filters.category && sale.category !== filters.category) {
        return false;
      }

      // Salesperson filter
      if (filters.salesPerson && sale.salesPerson !== filters.salesPerson) {
        return false;
      }

      // Region filter
      if (filters.region && sale.region !== filters.region) {
        return false;
      }

      // Payment method filter
      if (filters.paymentMethod && sale.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      // Status filter
      if (filters.status && sale.status !== filters.status) {
        return false;
      }

      // Amount filter
      if (filters.minAmount !== null && sale.totalAmount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount !== null && sale.totalAmount > filters.maxAmount) {
        return false;
      }

      return true;
    });
  }, [sales, filters]);

  // Sort filtered sales
  const sortedSales = useMemo(() => {
    const list = [...filteredSales];
    const { key, direction } = sort;

    list.sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      if (strA < strB) return direction === 'asc' ? -1 : 1;
      if (strA > strB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredSales, sort]);

  // Active filter chips list
  const activeChips = useMemo(() => {
    const chips: Array<{ key: keyof FilterState; label: string; value: string }> = [];

    if (filters.search) {
      chips.push({ key: 'search', label: 'Search', value: filters.search });
    }
    if (filters.dateRange !== 'all') {
      const labels: Record<DateRangePreset, string> = {
        today: 'Today',
        this_week: 'This Week',
        this_month: 'This Month',
        this_quarter: 'This Quarter',
        this_year: 'This Year',
        custom: `${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`,
        all: 'All Time',
      };
      chips.push({ key: 'dateRange', label: 'Date', value: labels[filters.dateRange] });
    }
    if (filters.customer) chips.push({ key: 'customer', label: 'Customer', value: filters.customer });
    if (filters.product) chips.push({ key: 'product', label: 'Product', value: filters.product });
    if (filters.category) chips.push({ key: 'category', label: 'Category', value: filters.category });
    if (filters.salesPerson) chips.push({ key: 'salesPerson', label: 'Salesperson', value: filters.salesPerson });
    if (filters.region) chips.push({ key: 'region', label: 'Region', value: filters.region });
    if (filters.paymentMethod) chips.push({ key: 'paymentMethod', label: 'Payment', value: filters.paymentMethod });
    if (filters.status) chips.push({ key: 'status', label: 'Status', value: filters.status });
    if (filters.minAmount !== null) chips.push({ key: 'minAmount', label: 'Min', value: `≥ ${filters.minAmount}` });
    if (filters.maxAmount !== null) chips.push({ key: 'maxAmount', label: 'Max', value: `≤ ${filters.maxAmount}` });

    return chips;
  }, [filters]);

  const removeChip = (key: keyof FilterState) => {
    if (key === 'dateRange') {
      updateFilter('dateRange', 'all');
      updateFilter('startDate', '');
      updateFilter('endDate', '');
    } else if (key === 'minAmount' || key === 'maxAmount') {
      updateFilter(key, null);
    } else {
      updateFilter(key, '' as any);
    }
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    sort,
    handleSort,
    filterOptions,
    filteredSales,
    sortedSales,
    activeChips,
    removeChip,
  };
}
