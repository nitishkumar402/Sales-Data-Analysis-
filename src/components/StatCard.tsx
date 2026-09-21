import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  id?: string;
  icon: LucideIcon;
  label: string;
  value: string;
  change?: number;
  periodText?: string;
  badgeColor?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose' | 'sky';
}

export function StatCard({
  id,
  icon: Icon,
  label,
  value,
  change,
  periodText = 'vs prior period',
  badgeColor = 'cyan',
}: StatCardProps) {
  const colorStyles = {
    cyan: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    indigo: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
    rose: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
    sky: 'from-sky-500/20 to-cyan-500/20 text-sky-400 border-sky-500/30',
  };

  const isPositive = typeof change === 'number' && change >= 0;

  return (
    <div
      id={id}
      className="p-5 rounded-2xl glass-panel-interactive border border-white/10 flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Subtle background glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />

      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br border ${colorStyles[badgeColor]} shrink-0 shadow-sm`}
        >
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* Middle row: Large formatted Value */}
      <div className="mb-2">
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-white truncate">
          {value}
        </div>
      </div>

      {/* Bottom row: Trend indicator & comparison period */}
      <div className="flex items-center gap-2 text-xs">
        {typeof change === 'number' && (
          <span
            className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
              isPositive
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/20'
                : 'text-rose-400 bg-rose-500/15 border border-rose-500/20'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {change.toFixed(1)}%
            </span>
          </span>
        )}
        <span className="text-slate-400 truncate">{periodText}</span>
      </div>
    </div>
  );
}
