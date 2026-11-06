import React, { memo, useMemo } from 'react';
import {
  Users, TrendingUp, DollarSign, Award, Clock, XCircle,
  TrendingDown,
} from 'lucide-react';
import { formatCurrency } from '../../utils/analyticsHelpers';

// ─── Growth Badge ─────────────────────────────────────────────────────────────
const GrowthBadge = memo(({ value }) => {
  const isPositive = Number(value) >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        isPositive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40'
          : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40'
      }`}
    >
      {isPositive
        ? <TrendingUp className="w-2.5 h-2.5" />
        : <TrendingDown className="w-2.5 h-2.5" />
      }
      {Math.abs(value)}%
    </span>
  );
});
GrowthBadge.displayName = 'GrowthBadge';

// ─── Single KPI Card ─────────────────────────────────────────────────────────
const StatCard = memo(({
  icon: Icon, iconBg, iconColor, accentColor, label, value, growth, subtitle,
}) => (
  <div
    className="relative p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col gap-3 group overflow-hidden cursor-default"
  >
    {/* Subtle accent glow on hover */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at top left, ${accentColor}10 0%, transparent 70%)`,
      }}
    />

    {/* Top row */}
    <div className="flex items-start justify-between relative z-10">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        {label}
      </p>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${iconBg} transition-transform duration-200 group-hover:scale-110`}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
    </div>

    {/* Value */}
    <div className="relative z-10">
      <p className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100 leading-none mb-2 tracking-tight">
        {value}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {growth !== undefined && <GrowthBadge value={growth} />}
        {subtitle && (
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

// ─── StatsCards Grid ─────────────────────────────────────────────────────────
export default memo(function StatsCards({
  totalLeads,
  conversionRate,
  pipelineValue,
  wonRevenue,
  avgSalesCycle,
  lostRate,
  leadsGrowth,
  revenueGrowth,
  conversionGrowth,
  pipelineGrowth,
}) {
  const cards = useMemo(() => [
    {
      label: 'Total Leads',
      value: totalLeads.toLocaleString(),
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      accentColor: '#2563EB',
      growth: leadsGrowth,
      subtitle: 'vs prev period',
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accentColor: '#10B981',
      growth: conversionGrowth,
      subtitle: 'Won / Total',
    },
    {
      label: 'Pipeline Value',
      value: formatCurrency(pipelineValue, false),
      icon: DollarSign,
      iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      accentColor: '#7C3AED',
      growth: pipelineGrowth,
      subtitle: 'Active deals',
    },
    {
      label: 'Won Revenue',
      value: formatCurrency(wonRevenue, false),
      icon: Award,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      accentColor: '#22C55E',
      growth: revenueGrowth,
      subtitle: 'Closed revenue',
    },
    {
      label: 'Avg Sales Cycle',
      value: avgSalesCycle > 0 ? `${avgSalesCycle} Days` : '0 Days',
      icon: Clock,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      accentColor: '#F59E0B',
      subtitle: 'Days to close',
    },
    {
      label: 'Lost Rate',
      value: `${lostRate}%`,
      icon: XCircle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      accentColor: '#EF4444',
      subtitle: 'Lost / Total',
    },
  ], [totalLeads, conversionRate, pipelineValue, wonRevenue, avgSalesCycle, lostRate, leadsGrowth, revenueGrowth, conversionGrowth, pipelineGrowth]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
});
