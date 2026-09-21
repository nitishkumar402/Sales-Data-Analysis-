import { useState, useMemo } from 'react';
import {
  Package,
  Search,
  DollarSign,
  TrendingUp,
  Tag,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { SaleRecord } from '../types/sales';
import { formatCurrency } from '../utils/formatting';

interface ProductsViewProps {
  sales: SaleRecord[];
  currencySymbol: string;
  currencyCode: string;
}

export function ProductsView({
  sales,
  currencySymbol,
  currencyCode,
}: ProductsViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'units' | 'price'>('revenue');

  // Group sales by product name
  const productMap = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        category: string;
        totalUnits: number;
        totalRevenue: number;
        orderCount: number;
        avgUnitPrice: number;
      }
    >();

    sales.forEach((sale) => {
      const existing = map.get(sale.productName);
      if (existing) {
        existing.totalUnits += sale.quantity;
        existing.totalRevenue += sale.totalAmount;
        existing.orderCount += 1;
      } else {
        map.set(sale.productName, {
          name: sale.productName,
          category: sale.category,
          totalUnits: sale.quantity,
          totalRevenue: sale.totalAmount,
          orderCount: 1,
          avgUnitPrice: sale.unitPrice,
        });
      }
    });

    return Array.from(map.values()).map((p) => ({
      ...p,
      avgUnitPrice: p.totalUnits > 0 ? p.totalRevenue / p.totalUnits : p.avgUnitPrice,
    }));
  }, [sales]);

  const categories = useMemo(() => {
    return Array.from(new Set(productMap.map((p) => p.category))).sort();
  }, [productMap]);

  const filteredProducts = useMemo(() => {
    return productMap
      .filter((p) => {
        const matchesSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase());
        const matchesCat = !categoryFilter || p.category === categoryFilter;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
        if (sortBy === 'units') return b.totalUnits - a.totalUnits;
        return b.avgUnitPrice - a.avgUnitPrice;
      });
  }, [productMap, search, categoryFilter, sortBy]);

  const totalProducts = productMap.length;
  const totalUnits = useMemo(() => productMap.reduce((s, p) => s + p.totalUnits, 0), [productMap]);
  const totalRevenue = useMemo(() => productMap.reduce((s, p) => s + p.totalRevenue, 0), [productMap]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Product Portfolio & Margins
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            SKU velocity, revenue contribution, and units fulfilled
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Active Catalog Items
            </span>
            <span className="text-2xl font-bold text-white">{totalProducts}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Units Dispatched
            </span>
            <span className="text-2xl font-bold text-white">{totalUnits.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Catalog Revenue
            </span>
            <span className="text-2xl font-bold text-white">
              {formatCurrency(totalRevenue, currencyCode, currencySymbol)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Category Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-white/10">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl glass-input bg-slate-900"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sort by:</span>
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              sortBy === 'revenue'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-semibold'
                : 'border-white/10 text-slate-300 hover:bg-white/5'
            }`}
          >
            Total Revenue
          </button>
          <button
            onClick={() => setSortBy('units')}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              sortBy === 'units'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-semibold'
                : 'border-white/10 text-slate-300 hover:bg-white/5'
            }`}
          >
            Units Sold
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Units Sold</th>
                <th className="py-3 px-3 text-right">Avg Unit Realization</th>
                <th className="py-3 px-3 text-right">Orders</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredProducts.map((prod, idx) => (
                <tr key={prod.name} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                      #{idx + 1}
                    </span>
                    <span>{prod.name}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300 text-[11px]">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-slate-200">
                    {prod.totalUnits.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-300">
                    {formatCurrency(prod.avgUnitPrice, currencyCode, currencySymbol)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-400">
                    {prod.orderCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">
                    {formatCurrency(prod.totalRevenue, currencyCode, currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
