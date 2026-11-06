import React, { memo } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { formatCurrency } from '../../utils/analyticsHelpers';

// ─── Rank badge ───────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-200 dark:shadow-amber-900/30">
      <Crown className="w-4 h-4 text-white" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center flex-shrink-0 shadow-sm">
      <Medal className="w-4 h-4 text-white" />
    </div>
  );
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
      <Medal className="w-4 h-4 text-white" />
    </div>
  );
  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">{rank}</span>
    </div>
  );
};

// ─── Avatar colors per rank ────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-violet-500 to-violet-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
];

// ─── Performer Row ────────────────────────────────────────────────────────────
const PerformerRow = memo(({ performer, maxRevenue }) => {
  const pct = maxRevenue > 0 ? Math.round((performer.revenue / maxRevenue) * 100) : 0;
  const gradient = AVATAR_GRADIENTS[(performer.rank - 1) % AVATAR_GRADIENTS.length];
  const barColors = ['#3B82F6', '#10B981', '#7C3AED', '#F59E0B', '#F43F5E'];
  const barColor = barColors[(performer.rank - 1) % barColors.length];

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-zinc-800 last:border-0 group hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 -mx-2 px-2 rounded-lg transition-colors duration-150">
      {/* Rank */}
      <RankBadge rank={performer.rank} />

      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
      >
        <span className="text-white text-xs font-bold">
          {(performer.owner || 'U').charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
            {performer.owner}
          </span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 ml-2 flex-shrink-0">
            {formatCurrency(performer.revenue, false)}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
            {performer.won} won · {performer.conversionRate}% conv.
          </span>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500">{pct}%</span>
        </div>
      </div>
    </div>
  );
});
PerformerRow.displayName = 'PerformerRow';

// ─── TopPerformersCard ────────────────────────────────────────────────────────
export default memo(function TopPerformersCard({ data }) {
  const maxRevenue = data?.[0]?.revenue || 0;

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Top Performers</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Ranked by won revenue</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-sm">
          <Trophy className="w-4.5 h-4.5 text-amber-500" />
        </div>
      </div>

      {/* List */}
      {data?.length ? (
        <div>
          {data.map((performer) => (
            <PerformerRow
              key={performer.owner}
              performer={performer}
              maxRevenue={maxRevenue}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-10 text-slate-400 dark:text-zinc-500 text-sm">
          No performer data yet.
        </div>
      )}

      {/* Total summary */}
      {data?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 dark:text-zinc-500 font-medium">
            {data.length} reps · {data.reduce((s, d) => s + d.won, 0)} total won
          </span>
          <span className="font-bold text-slate-900 dark:text-zinc-100">
            {formatCurrency(data.reduce((s, d) => s + d.revenue, 0), false)}
          </span>
        </div>
      )}
    </div>
  );
});
