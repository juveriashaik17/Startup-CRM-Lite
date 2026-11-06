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
    className="relative p-6 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between min-h-[145px] group overflow-hidden cursor-default"
  >
    {/* Subtle accent glow on hover */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at top left, ${accentColor}12 0%, transparent 70%)`,
      }}
    />

    {/* Top row */}
    <div className="flex items-center justify-between relative z-10">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
        {label}
      </span>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${iconBg} transition-transform duration-200 group-hover:scale-105`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>

    {/* Value */}
    <div className="relative z-10 mt-2">
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 leading-tight tracking-tight mb-2">
        {value}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {growth !== undefined && <GrowthBadge value={growth} />}
        {subtitle && (
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
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
      iconBg: 'bg-rose-100 dark:bg-rose-950/40',
      iconColor: 'text-rose-600 dark:text-rose-400',
      accentColor: '#E85D5D',
      growth: leadsGrowth,
      subtitle: 'vs prev period',
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accentColor: '#16A34A',
      growth: conversionGrowth,
      subtitle: 'Won / Total',
    },
    {
      label: 'Pipeline Value',
      value: formatCurrency(pipelineValue, false),
      icon: DollarSign,
      iconBg: 'bg-orange-100/80 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      accentColor: '#F28A73',
      growth: pipelineGrowth,
      subtitle: 'Active deals',
    },
    {
      label: 'Won Revenue',
      value: formatCurrency(wonRevenue, false),
      icon: Award,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accentColor: '#2E8B57',
      growth: revenueGrowth,
      subtitle: 'Closed revenue',
    },
    {
      label: 'Avg Sales Cycle',
      value: avgSalesCycle > 0 ? `${avgSalesCycle} Days` : '0 Days',
      icon: Clock,
      iconBg: 'bg-amber-100 dark:bg-amber-950/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      accentColor: '#FFC857',
      subtitle: 'Days to close',
    },
    {
      label: 'Lost Rate',
      value: `${lostRate}%`,
      icon: XCircle,
      iconBg: 'bg-rose-100 dark:bg-rose-950/40',
      iconColor: 'text-rose-600 dark:text-rose-400',
      accentColor: '#D64242',
      subtitle: 'Lost / Total',
    },
  ], [totalLeads, conversionRate, pipelineValue, wonRevenue, avgSalesCycle, lostRate, leadsGrowth, revenueGrowth, conversionGrowth, pipelineGrowth]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
});
