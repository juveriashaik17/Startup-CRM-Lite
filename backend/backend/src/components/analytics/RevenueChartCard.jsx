import React, { memo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';
import { formatCurrency } from '../../utils/analyticsHelpers';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="font-bold text-slate-900 dark:text-zinc-100 mb-1">{label} Revenue</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    </div>
  );
};

// ─── RevenueChartCard ─────────────────────────────────────────────────────────
export default memo(function RevenueChartCard({ data }) {
  if (!data?.length) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center min-h-[300px] text-slate-400 dark:text-zinc-500 text-sm">
        No revenue data yet.
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.revenue, 0);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
  const peakMonth = data.find((d) => d.revenue === maxRevenue)?.month || '—';

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Revenue Analytics</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Won deals revenue by month</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-zinc-500">6-Month Total</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(total, false)}
          </p>
        </div>
      </div>

      {/* Peak month badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Peak Month
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
          {peakMonth} · {formatCurrency(maxRevenue, false)}
        </span>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#22C55E" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-zinc-800" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v, true)}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22C55E"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={{ r: 4, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
