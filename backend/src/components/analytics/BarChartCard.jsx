import React, { memo, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, ReferenceLine,
} from 'recharts';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="font-bold text-slate-900 dark:text-zinc-100 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
        <p className="text-slate-500 dark:text-zinc-400">
          <span className="font-semibold text-blue-600 dark:text-blue-400">{payload[0].value}</span> Leads
        </p>
      </div>
    </div>
  );
};

// ─── BarChartCard ─────────────────────────────────────────────────────────────
export default memo(function BarChartCard({ data }) {
  const { maxLeads, average, totalLeads } = useMemo(() => {
    if (!data?.length) {
      return { maxLeads: 1, average: 0, totalLeads: 0 };
    }
    const max = Math.max(...data.map((d) => d.leads), 1);
    const avg = Math.round(data.reduce((s, d) => s + d.leads, 0) / data.length);
    const total = data.reduce((s, d) => s + d.leads, 0);
    return { maxLeads: max, average: avg, totalLeads: total };
  }, [data]);

  if (!data?.length) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center min-h-[300px] text-slate-400 dark:text-zinc-500 text-sm">
        No monthly data yet.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Monthly Leads Trend</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Lead volume over the last 6 months</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-zinc-500">6-Month Total</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{totalLeads} leads</p>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="35%">
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E85D5D" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#F28A73" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="barGradientPeak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D64242" stopOpacity={1} />
                <stop offset="100%" stopColor="#E85D5D" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2D9D5" className="dark:stroke-zinc-800" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#A37E7C' }}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#A37E7C' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(232,93,93,0.08)', radius: 6 }} />
            <ReferenceLine
              y={average}
              stroke="#CBD5E1"
              strokeDasharray="4 3"
              label={{ value: `Avg ${average}`, position: 'right', fontSize: 9, fill: '#94A3B8' }}
            />
            <Bar dataKey="leads" radius={[6, 6, 0, 0]} animationDuration={700}>
              {data.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={entry.leads === maxLeads ? 'url(#barGradientPeak)' : 'url(#barGradient)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
