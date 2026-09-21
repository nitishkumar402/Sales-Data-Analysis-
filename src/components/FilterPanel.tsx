import { useState } from 'react';
import { Filter, RotateCcw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterState } from '../types/sales';

interface FilterPanelProps {
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
  currencySymbol: string;
}

export function FilterPanel({
  filters,
  onUpdateFilter,
  onResetFilters,
  activeChips,
  onRemoveChip,
  filterOptions,
  currencySymbol,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl glass-panel border border-white/10 p-4 mb-6 transition-all">
      {/* Top Header: Toggle Bar & Quick Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            id="filter-panel-toggle-btn"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-slate-200 transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filters</span>
            {activeChips.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-bold">
                {activeChips.length}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-1" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            )}
          </button>

          {activeChips.length > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>

        {/* Removable Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 animate-in fade-in duration-100"
              >
                <span>
                  {chip.label}: <strong className="font-semibold text-white">{chip.value}</strong>
                </span>
                <button
                  onClick={() => onRemoveChip(chip.key)}
                  className="p-0.5 hover:text-white rounded-full hover:bg-cyan-500/20 transition-colors"
                  aria-label={`Remove filter for ${chip.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Filter Form Controls */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 animate-in fade-in duration-150 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => onUpdateFilter('category', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl glass-input bg-slate-900"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Region</label>
            <select
              value={filters.region}
              onChange={(e) => onUpdateFilter('region', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl glass-input bg-slate-900"
            >
              <option value="">All Regions</option>
              {filterOptions.regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Order Status */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onUpdateFilter('status', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl glass-input bg-slate-900"
            >
              <option value="">All Statuses</option>
              {filterOptions.statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => onUpdateFilter('paymentMethod', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl glass-input bg-slate-900"
            >
              <option value="">All Payment Modes</option>
              {filterOptions.paymentMethods.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Salesperson Filter */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Salesperson</label>
            <select
              value={filters.salesPerson}
              onChange={(e) => onUpdateFilter('salesPerson', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl glass-input bg-slate-900"
            >
              <option value="">All Sales Representatives</option>
              {filterOptions.salesPersons.map((rep) => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Filter */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Customer</label>
            <select
              value={filters.customer}
              onChange={(e) => onUpdateFilter('customer', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl glass-input bg-slate-900"
            >
              <option value="">All Customers</option>
              {filterOptions.customers.map((cust) => (
                <option key={cust} value={cust}>
                  {cust}
                </option>
              ))}
            </select>
          </div>

          {/* Min Amount */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Min Total Amount ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 10000"
              value={filters.minAmount ?? ''}
              onChange={(e) =>
                onUpdateFilter('minAmount', e.target.value ? parseFloat(e.target.value) : null)
              }
              className="w-full px-3 py-1.5 rounded-xl glass-input"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Max Total Amount ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 500000"
              value={filters.maxAmount ?? ''}
              onChange={(e) =>
                onUpdateFilter('maxAmount', e.target.value ? parseFloat(e.target.value) : null)
              }
              className="w-full px-3 py-1.5 rounded-xl glass-input"
            />
          </div>
        </div>
      )}
    </div>
  );
}
