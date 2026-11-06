import React, { memo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="font-bold text-slate-900 dark:text-zinc-100 mb-1">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
        {value}%
      </p>
      {payload[0].payload?.won != null && (
        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
          {payload[0].payload.won} Won · {payload[0].payload.total} Total Leads
        </p>
      )}
    </div>
  );
};

// ─── Custom dot ──────────────────────────────────────────────────────────────
const CustomDot = (props) => {
  const { cx, cy, value } = props;
  if (value === 0) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#22C55E" fillOpacity={0.2} />
      <circle cx={cx} cy={cy} r={4} fill="#22C55E" stroke="#fff" strokeWidth={2} />
    </g>
  );
};

// ─── LineChartCard ────────────────────────────────────────────────────────────
export default memo(function LineChartCard({ data }) {
  if (!data?.length) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center min-h-[300px] text-slate-400 dark:text-zinc-500 text-sm">
        No conversion data yet.
      </div>
    );
  }

  const maxConv = Math.max(...data.map((d) => d.conversion), 0);
  const avgConv = Math.round(data.reduce((s, d) => s + d.conversion, 0) / data.length);

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Monthly Conversion Trend</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Won / Total leads per month</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-zinc-500">Peak</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{maxConv}%</p>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-zinc-800" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avgConv}
              stroke="#CBD5E1"
              strokeDasharray="4 3"
              label={{ value: `Avg ${avgConv}%`, position: 'right', fontSize: 9, fill: '#94A3B8' }}
            />
            <Line
              type="monotone"
              dataKey="conversion"
              stroke="#22C55E"
              strokeWidth={2.5}
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={700}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
