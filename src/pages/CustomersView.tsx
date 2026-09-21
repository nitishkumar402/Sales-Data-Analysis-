import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  DollarSign,
  ShoppingCart,
  Calendar,
  Phone,
  Mail,
  ArrowUpDown,
  ExternalLink,
  Receipt,
  Eye,
} from 'lucide-react';
import { SaleRecord } from '../types/sales';
import { formatCurrency, formatDate } from '../utils/formatting';

interface CustomersViewProps {
  sales: SaleRecord[];
  onViewSale: (sale: SaleRecord) => void;
  currencySymbol: string;
  currencyCode: string;
}

export function CustomersView({
  sales,
  onViewSale,
  currencySymbol,
  currencyCode,
}: CustomersViewProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'recent'>('spent');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Group sales by customer
  const customerMap = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        email: string;
        phone: string;
        region: string;
        totalSpent: number;
        totalOrders: number;
        totalUnits: number;
        lastOrderDate: string;
        sales: SaleRecord[];
      }
    >();

    sales.forEach((sale) => {
      const existing = map.get(sale.customerName);
      if (existing) {
        existing.totalSpent += sale.totalAmount;
        existing.totalOrders += 1;
        existing.totalUnits += sale.quantity;
        if (sale.saleDate > existing.lastOrderDate) {
          existing.lastOrderDate = sale.saleDate;
        }
        if (!existing.email && sale.customerEmail) existing.email = sale.customerEmail;
        if (!existing.phone && sale.customerPhone) existing.phone = sale.customerPhone;
        existing.sales.push(sale);
      } else {
        map.set(sale.customerName, {
          name: sale.customerName,
          email: sale.customerEmail || '',
          phone: sale.customerPhone || '',
          region: sale.region,
          totalSpent: sale.totalAmount,
          totalOrders: 1,
          totalUnits: sale.quantity,
          lastOrderDate: sale.saleDate,
          sales: [sale],
        });
      }
    });

    return Array.from(map.values());
  }, [sales]);

  // Filter & sort
  const filteredCustomers = useMemo(() => {
    return customerMap
      .filter((c) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
        if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
        return b.lastOrderDate.localeCompare(a.lastOrderDate);
      });
  }, [customerMap, search, sortBy]);

  // Total summary stats
  const totalRevenue = useMemo(() => customerMap.reduce((s, c) => s + c.totalSpent, 0), [customerMap]);
  const avgCustomerValue = customerMap.length > 0 ? totalRevenue / customerMap.length : 0;

  const activeCustomerSales = useMemo(() => {
    if (!selectedCustomer) return [];
    const found = customerMap.find((c) => c.name === selectedCustomer);
    return found ? found.sales : [];
  }, [customerMap, selectedCustomer]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Customer Directory & LTV
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Accounts, repeat purchase velocity, and client lifetime revenue profiles
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Customers
            </span>
            <span className="text-2xl font-bold text-white">{customerMap.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Avg Lifetime Value (LTV)
            </span>
            <span className="text-2xl font-bold text-white">
              {formatCurrency(avgCustomerValue, currencyCode, currencySymbol)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Top Customer Spend
            </span>
            <span className="text-2xl font-bold text-white">
              {filteredCustomers[0]
                ? formatCurrency(filteredCustomers[0].totalSpent, currencyCode, currencySymbol)
                : '—'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls: Search & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-white/10">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sort by:</span>
          <button
            onClick={() => setSortBy('spent')}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              sortBy === 'spent'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-semibold'
                : 'border-white/10 text-slate-300 hover:bg-white/5'
            }`}
          >
            Total Spend
          </button>
          <button
            onClick={() => setSortBy('orders')}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              sortBy === 'orders'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-semibold'
                : 'border-white/10 text-slate-300 hover:bg-white/5'
            }`}
          >
            Order Count
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              sortBy === 'recent'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-semibold'
                : 'border-white/10 text-slate-300 hover:bg-white/5'
            }`}
          >
            Most Recent
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => (
          <div
            key={c.name}
            className="p-5 rounded-2xl glass-panel-interactive border border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{c.name}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 inline-block mt-1">
                    Region: {c.region}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCustomer(c.name)}
                  className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-xl border border-cyan-500/20 transition-colors"
                  title="View Customer Invoices"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{c.email || 'No email registered'}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{c.phone || 'No phone recorded'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Spend</span>
                <span className="font-bold text-white text-sm">
                  {formatCurrency(c.totalSpent, currencyCode, currencySymbol)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Orders</span>
                <span className="font-semibold text-slate-200">
                  {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                </span>
              </div>
              <div className="col-span-2 pt-1 text-[11px] text-slate-500 flex justify-between">
                <span>Last purchased:</span>
                <span className="text-slate-300">{formatDate(c.lastOrderDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Invoices Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl glass-modal border border-white/15 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Purchase History — {selectedCustomer}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeCustomerSales.length} total transaction(s) recorded
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {activeCustomerSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-white/5">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{sale.saleDate}</td>
                      <td className="py-2.5 px-3 font-medium text-white">{sale.productName}</td>
                      <td className="py-2.5 px-3 text-right">{sale.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {formatCurrency(sale.totalAmount, currencyCode, currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedCustomer(null);
                            onViewSale(sale);
                          }}
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
      )}
    </div>
  );
}
