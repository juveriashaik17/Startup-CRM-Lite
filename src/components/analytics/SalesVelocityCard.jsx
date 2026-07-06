import React, { memo } from 'react';
import { Zap, TrendingUp, TrendingDown, Users2, Percent, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/analyticsHelpers';

// ─── Metric Row ───────────────────────────────────────────────────────────────
const MetricRow = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-zinc-800 last:border-0 group">
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${color}`}>
        <Icon className="w-3 h-3" />
      </div>
      <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{label}</span>
    </div>
    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{value}</span>
  </div>
);

// ─── SalesVelocityCard ────────────────────────────────────────────────────────
export default memo(function SalesVelocityCard({ velocity }) {
  const { velocity: vel, opportunities, winRate, avgDealSize, avgCycle, growth = 0 } = velocity || {};
  const isPositiveGrowth = growth >= 0;

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Sales Velocity</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Revenue generated per day</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shadow-sm">
          <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      {/* Hero number */}
      <div className="flex items-end gap-3 pb-1">
        <p className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
          {formatCurrency(vel || 0, false)}
        </p>
        <span className="text-sm text-slate-400 dark:text-zinc-500 mb-1 font-medium">/day</span>
        <span
          className={`ml-auto inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
            isPositiveGrowth
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40'
              : 'bg-red-50 text-red-650 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40'
          }`}
        >
          {isPositiveGrowth
            ? <TrendingUp className="w-3 h-3" />
            : <TrendingDown className="w-3 h-3" />
          }
          {isPositiveGrowth ? '+' : ''}{growth}% vs prev
        </span>
      </div>

      {/* Formula breakdown */}
      <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-slate-100 dark:border-zinc-800">
        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
          Formula Breakdown
        </p>
        <MetricRow
          icon={Users2}
          label="Opportunities"
          value={opportunities || 0}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <MetricRow
          icon={Percent}
          label="Win Rate"
          value={`${winRate || 0}%`}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <MetricRow
          icon={DollarSign}
          label="Avg Deal Size"
          value={formatCurrency(avgDealSize || 0, false)}
          color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
        />
        <MetricRow
          icon={Clock}
          label="Avg Sales Cycle"
          value={`${avgCycle || 0} days`}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
      </div>

      {/* Formula note */}
      <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed font-medium">
        (Opportunities × Win Rate × Avg Deal Size) ÷ Avg Sales Cycle
      </p>
    </div>
  );
});
