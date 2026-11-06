import React, { memo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/analyticsHelpers';

// ─── Confidence Bar ───────────────────────────────────────────────────────────
const ConfidenceBar = ({ confidence }) => {
  const isHigh = confidence >= 75;
  const isMed = confidence >= 50 && confidence < 75;
  const color = isHigh ? '#22C55E' : isMed ? '#F59E0B' : '#EF4444';
  const label = isHigh ? 'High' : isMed ? 'Moderate' : 'Low';

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
          Confidence Score
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{
            background: `${color}15`,
            color,
            borderColor: `${color}30`,
          }}
        >
          {label} · {confidence}%
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${confidence}%`, background: color }}
        />
      </div>
      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1.5">
        Based on {Math.max(0, Math.round((confidence - 40) / 8))} months of data
      </p>
    </div>
  );
};

// ─── ForecastCard ─────────────────────────────────────────────────────────────
export default memo(function ForecastCard({ forecast }) {
  const { predicted = 0, confidence = 0, growth = 0 } = forecast || {};

  const isPositiveGrowth = growth >= 0;

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Revenue Forecast</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Predicted next month</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      {/* Hero number */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
          Predicted Revenue Next Month
        </p>
        <div className="flex items-center gap-3">
          <p className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            {formatCurrency(predicted, false)}
          </p>
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
              isPositiveGrowth
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40'
                : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40'
            }`}
          >
            {isPositiveGrowth
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            }
            {isPositiveGrowth ? '+' : ''}{growth}%
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 font-medium">
          Based on 6-month average + growth trend
        </p>
      </div>

      {/* Confidence */}
      <ConfidenceBar confidence={confidence} />

      {/* Methodology note */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl px-4 py-3 flex gap-2">
        <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
          Forecast uses a rolling 6-month revenue average, adjusted for recent growth momentum.
          Add more Won deals to improve accuracy.
        </p>
      </div>
    </div>
  );
});
