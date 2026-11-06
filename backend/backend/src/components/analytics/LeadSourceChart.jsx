import React, { memo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { source, count, percentage, color } = payload[0].payload;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 shadow-xl text-xs">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="font-bold text-slate-900 dark:text-zinc-100">{source}</span>
      </div>
      <p className="text-slate-500 dark:text-zinc-400">
        <span className="font-semibold" style={{ color }}>{count} Leads</span>
        {' · '}
        <span>{percentage}% of total</span>
      </p>
    </div>
  );
};

// ─── Custom Bar Label ─────────────────────────────────────────────────────────
const CustomLabel = (props) => {
  const { x, y, width, height, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      dominantBaseline="middle"
      fontSize={10}
      fill="#94A3B8"
      fontWeight={600}
    >
      {value}
    </text>
  );
};

// ─── LeadSourceChart ─────────────────────────────────────────────────────────
export default memo(function LeadSourceChart({ data }) {
  if (!data?.length) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center min-h-[300px] text-slate-400 dark:text-zinc-500 text-sm">
        No lead source data yet.
      </div>
    );
  }

  const topSource = data[0];

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Lead Source Analytics</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Which channels drive the most leads</p>
        </div>
        {topSource && (
          <div className="text-right">
            <p className="text-xs text-slate-400 dark:text-zinc-500">Top Source</p>
            <p className="text-sm font-bold" style={{ color: topSource.color }}>
              {topSource.source}
            </p>
          </div>
        )}
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" className="dark:stroke-zinc-800" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="source"
              width={82}
              tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 4 }} />
            <Bar
              dataKey="count"
              radius={[0, 6, 6, 0]}
              animationDuration={700}
              label={<CustomLabel />}
            >
              {data.map((entry) => (
                <Cell key={entry.source} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Source legend chips */}
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
        {data.map((src) => (
          <span
            key={src.source}
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
            style={{
              background: `${src.color}12`,
              borderColor: `${src.color}30`,
              color: src.color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: src.color }}
            />
            {src.source} {src.percentage}%
          </span>
        ))}
      </div>
    </div>
  );
});
