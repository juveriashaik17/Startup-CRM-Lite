import React, { memo } from 'react';
import {
  ResponsiveContainer, FunnelChart, Funnel, Cell, Tooltip, LabelList
} from 'recharts';
import { GitFork } from 'lucide-react';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, percentage, stageConversion, dropoff, fill } = payload[0].payload;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 shadow-xl text-xs">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: fill }} />
        <span className="font-bold text-slate-900 dark:text-zinc-100">{name}</span>
      </div>
      <p className="text-slate-700 dark:text-zinc-300 font-semibold mb-1">
        Count: <span className="text-slate-900 dark:text-white font-bold">{value} Leads</span>
      </p>
      <p className="text-slate-500 dark:text-zinc-400 font-medium">
        Overall: {percentage}% of top
      </p>
      {stageConversion !== 100 && (
        <p className="text-slate-500 dark:text-zinc-400 font-medium">
          Stage conversion: {stageConversion}%
        </p>
      )}
      {dropoff > 0 && (
        <p className="text-rose-500 font-semibold">
          Drop-off: ↓{dropoff}%
        </p>
      )}
    </div>
  );
};

// ─── FunnelChartCard ──────────────────────────────────────────────────────────
export default memo(function FunnelChartCard({ data }) {
  if (!data?.length) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center min-h-[300px] text-slate-400 dark:text-zinc-500 text-sm">
        No funnel data yet.
      </div>
    );
  }

  // Map data to the formats Recharts expects (using value, name, fill)
  const chartData = data.map((stage) => ({
    value: stage.count,
    name: stage.label,
    fill: stage.color,
    ...stage,
  }));

  const overallConversion = data[0]?.count > 0
    ? Math.round(((data[data.length - 1]?.count || 0) / data[0].count) * 100)
    : 0;

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Sales Funnel</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
            Stage-by-stage pipeline conversion
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-full px-3 py-1">
          <GitFork className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {overallConversion}% overall
          </span>
        </div>
      </div>

      {/* Grid: Chart on Left, Detailed Rows on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Recharts Funnel (downward triangle shape) */}
        <div className="md:col-span-7 h-56 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Tooltip content={<CustomTooltip />} />
              <Funnel
                dataKey="value"
                data={chartData}
                isAnimationActive
              >
                <LabelList
                  position="right"
                  fill="#64748B"
                  stroke="none"
                  dataKey="name"
                  style={{ fontSize: 10, fontWeight: 600 }}
                />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Metric Rows */}
        <div className="md:col-span-5 space-y-2">
          {data.map((stage, i) => {
            return (
              <div
                key={stage.stage}
                className="flex items-center justify-between p-2 rounded-xl border border-slate-50 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: stage.color }}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {stage.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                      {stage.count}
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium">
                      leads
                    </p>
                  </div>

                  <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800" />

                  <div className="min-w-[64px]">
                    {i > 0 ? (
                      <>
                        <p className="text-xs font-bold" style={{ color: stage.color }}>
                          {stage.stageConversion}%
                        </p>
                        <p className="text-[9px] text-rose-500 font-semibold leading-none">
                          {stage.dropoff > 0 ? `↓${stage.dropoff}% drop` : 'no drop'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold">
                          100%
                        </p>
                        <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium leading-none">
                          top stage
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer summary */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-slate-400 dark:text-zinc-500">Top of Funnel</p>
              <p className="font-bold text-slate-900 dark:text-zinc-100">{data[0]?.count || 0} leads</p>
            </div>
            <div className="w-px h-8 bg-slate-100 dark:bg-zinc-800" />
            <div>
              <p className="text-slate-400 dark:text-zinc-500">Won</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                {data[data.length - 1]?.count || 0} leads
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-300 dark:text-zinc-700 font-medium">New → Won</span>
        </div>
      </div>
    </div>
  );
});
