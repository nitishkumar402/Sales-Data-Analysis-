import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../utils/formatting';
import { Trophy, Award, Medal, TrendingUp, Sparkles } from 'lucide-react';

interface ChartsProps {
  timeTrends: Array<{
    date: string;
    displayDate: string;
    revenue: number;
    orders: number;
    units: number;
  }>;
  categoryData: Array<{
    category: string;
    revenue: number;
    orders: number;
    units: number;
  }>;
  paymentMethodData: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  regionalData: Array<{
    region: string;
    revenue: number;
    orders: number;
    units: number;
  }>;
  topProducts: Array<{
    name: string;
    category: string;
    revenue: number;
    units: number;
    orders: number;
  }>;
  topSalespersons: Array<{
    name: string;
    revenue: number;
    orders: number;
    units: number;
  }>;
  currencySymbol: string;
  currencyCode: string;
}

// Glassmorphism tooltip component
function CustomTooltip({ active, payload, label, currencySymbol, currencyCode }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl glass-modal border border-white/20 shadow-2xl text-xs">
        <div className="font-semibold text-slate-300 mb-1.5 pb-1 border-b border-white/10">
          {label}
        </div>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color || item.fill }}
              />
              {item.name}:
            </span>
            <span className="font-bold text-white">
              {typeof item.value === 'number' && item.name?.toLowerCase().includes('rev')
                ? formatCurrency(item.value, currencyCode, currencySymbol)
                : item.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function Charts({
  timeTrends,
  categoryData,
  paymentMethodData,
  regionalData,
  topProducts,
  topSalespersons,
  currencySymbol,
  currencyCode,
}: ChartsProps) {
  const PIE_COLORS = ['#06B6D4', '#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Row 1: Revenue Trend (Line) & Sales Trend (Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Revenue Trend</h3>
              <p className="text-xs text-slate-400">Total transaction value generated over time</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Revenue ({currencySymbol})
            </span>
          </div>

          <div className="h-72 w-full">
            {timeTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeTrends} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="displayDate"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                    }
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        currencySymbol={currencySymbol}
                        currencyCode={currencyCode}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#06B6D4"
                    strokeWidth={3}
                    dot={{ fill: '#06B6D4', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 6, fill: '#38BDF8', stroke: '#0F172A', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend data available for current selection
              </div>
            )}
          </div>
        </div>

        {/* Sales / Orders Trend Area Chart */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Sales Volume Trend</h3>
              <p className="text-xs text-slate-400">Number of orders and items dispatched</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Orders & Units
            </span>
          </div>

          <div className="h-72 w-full">
            {timeTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeTrends} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="displayDate"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={
                      <CustomTooltip
                        currencySymbol={currencySymbol}
                        currencyCode={currencyCode}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend data available for current selection
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Category Performance (Bar) & Payment Method (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Category Performance</h3>
              <p className="text-xs text-slate-400">Revenue distribution by product categories</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Ranked by Revenue</span>
          </div>

          <div className="h-72 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                    }
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        currencySymbol={currencySymbol}
                        currencyCode={currencyCode}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#38BDF8"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category data found
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Donut/Pie Chart (1 col) */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Payment Methods</h3>
                <p className="text-xs text-slate-400">Settlement channels</p>
              </div>
            </div>

            <div className="h-56 w-full relative">
              {paymentMethodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke="rgba(15, 23, 42, 0.8)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <CustomTooltip
                          currencySymbol={currencySymbol}
                          currencyCode={currencyCode}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No payment data
                </div>
              )}
            </div>
          </div>

          {/* Clean Legend list at bottom */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
            {paymentMethodData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="text-slate-300 truncate">{item.name}</span>
                <span className="text-slate-400 font-mono ml-auto">({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Regional Sales (Bar) & Top Products (Horizontal Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Sales */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Regional Performance</h3>
              <p className="text-xs text-slate-400">Sales volume by geographic region</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Zones
            </span>
          </div>

          <div className="h-64 w-full">
            {regionalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="region" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                    }
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        currencySymbol={currencySymbol}
                        currencyCode={currencyCode}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No regional records
              </div>
            )}
          </div>
        </div>

        {/* Top Products (Horizontal Bar Chart) */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Top Selling Products</h3>
              <p className="text-xs text-slate-400">Products driving the highest total revenue</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Revenue Leaders
            </span>
          </div>

          <div className="h-64 w-full">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topProducts}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    width={110}
                    tickLine={false}
                    tickFormatter={(name) => (name.length > 14 ? `${name.substring(0, 14)}...` : name)}
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        currencySymbol={currencySymbol}
                        currencyCode={currencyCode}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#8B5CF6"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No product records
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Top Salespersons Leaderboard */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Sales Representatives Leaderboard</h3>
              <p className="text-xs text-slate-400">Ranked by revenue contributed and transaction volume</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-cyan-400">Performance Matrix</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {topSalespersons.map((rep, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            return (
              <div
                key={rep.name}
                className={`p-3.5 rounded-xl border relative transition-all ${
                  isFirst
                    ? 'bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-500/10'
                    : isSecond
                    ? 'bg-slate-800/80 border-slate-600/50'
                    : isThird
                    ? 'bg-amber-900/15 border-amber-800/40'
                    : 'bg-slate-900/60 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isFirst
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : isSecond
                          ? 'bg-slate-300 text-slate-950'
                          : isThird
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-white text-xs truncate max-w-[110px]">
                      {rep.name}
                    </span>
                  </div>
                  {isFirst && <Trophy className="w-4 h-4 text-amber-400 shrink-0" />}
                  {isSecond && <Award className="w-4 h-4 text-slate-300 shrink-0" />}
                  {isThird && <Medal className="w-4 h-4 text-amber-600 shrink-0" />}
                </div>

                <div className="mt-1">
                  <span className="text-[10px] text-slate-400 block">Total Revenue</span>
                  <span className="text-sm font-bold text-white block">
                    {formatCurrency(rep.revenue, currencyCode, currencySymbol)}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{rep.orders} {rep.orders === 1 ? 'Order' : 'Orders'}</span>
                  <span>{rep.units} Units</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
