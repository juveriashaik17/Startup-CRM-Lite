import React, { memo, useState, useCallback } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector,
} from 'recharts';
import { STATUS_CHART_COLORS } from '../../constants/analyticsColors';

// ─── Active (expanded) slice shape ───────────────────────────────────────────
const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.95}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 5}
        outerRadius={innerRadius - 1}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy - 12} textAnchor="middle" fill={fill} fontSize={26} fontWeight={800}>
        {value}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748B" fontSize={12} fontWeight={600}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#94A3B8" fontSize={11}>
        {(percent * 100).toFixed(0)}%
      </text>
    </g>
  );
};


// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, percentage } = payload[0].payload;
  const color = STATUS_CHART_COLORS[name] || payload[0].fill;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 shadow-xl text-xs">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="font-bold text-slate-900 dark:text-zinc-100">{name}</span>
      </div>
      <p className="text-slate-500 dark:text-zinc-400 font-medium">
        {value} Leads · <span className="text-slate-700 dark:text-zinc-200">{percentage}%</span>
      </p>
    </div>
  );
};

// ─── Legend ───────────────────────────────────────────────────────────────────
const Legend = memo(({ data, total, activeIndex }) => (
  <div className="flex flex-col justify-center gap-1.5 min-w-[150px]">
    {data.map((item, i) => {
      const color = STATUS_CHART_COLORS[item.name] || '#94A3B8';
      const isActive = i === activeIndex;
      return (
        <div
          key={item.name}
          className={`flex items-center justify-between gap-3 px-2 py-1 rounded-lg transition-all duration-150 ${
            isActive ? 'bg-slate-50 dark:bg-zinc-800' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-150"
              style={{ background: color, transform: isActive ? 'scale(1.3)' : 'scale(1)' }}
            />
            <span className={`text-xs font-medium transition-colors ${
              isActive
                ? 'text-slate-900 dark:text-zinc-100'
                : 'text-slate-500 dark:text-zinc-400'
            }`}>
              {item.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{item.value}</span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">({item.percentage}%)</span>
          </div>
        </div>
      );
    })}
    <div className="mt-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-between px-2">
      <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Total</span>
      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{total}</span>
    </div>
  </div>
));
Legend.displayName = 'Legend';

// ─── PieChartCard ─────────────────────────────────────────────────────────────
export default memo(function PieChartCard({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const onMouseEnter = useCallback((_, index) => setActiveIndex(index), []);
  const onMouseLeave = useCallback(() => setActiveIndex(null), []);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (!data.length) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[300px] text-slate-400 dark:text-zinc-500 text-sm">
        No distribution data yet.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
          Lead Status Distribution
        </h3>
        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
          Hover a slice to inspect each stage
        </p>
      </div>

      {/* Chart + Legend */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Doughnut with center label overlay */}
        <div className="w-full sm:w-52 h-52 flex-shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={84}
                dataKey="value"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                animationBegin={0}
                animationDuration={700}
                stroke="none"
              >
                {data.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_CHART_COLORS[entry.name] || '#94A3B8'}
                    opacity={activeIndex === null || activeIndex === idx ? 1 : 0.4}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label — absolute overlay, visible only when no slice is active */}
          {activeIndex === null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100 leading-none">
                {total}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-1">
                Total Leads
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <Legend data={data} total={total} activeIndex={activeIndex} />
      </div>
    </div>
  );
});
