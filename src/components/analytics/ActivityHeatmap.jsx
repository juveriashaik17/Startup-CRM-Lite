import React, { memo, useMemo } from 'react';
import { HEATMAP_LEVELS } from '../../constants/analyticsColors';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the last N weeks worth of date cells, starting from Monday. */
function buildWeekGrid(weeks = 15) {
  const cells = [];
  const today = new Date();
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - weeks * 7 + 1);
  // Align to Monday
  const dow = startDay.getDay();
  startDay.setDate(startDay.getDate() - ((dow + 6) % 7));

  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + w * 7 + d);
      week.push(date.toISOString().split('T')[0]);
    }
    cells.push(week);
  }
  return cells;
}

function getCellColor(count) {
  for (let i = HEATMAP_LEVELS.length - 1; i >= 0; i--) {
    const level = HEATMAP_LEVELS[i];
    if (count >= level.min) {
      return level.light;
    }
  }
  return HEATMAP_LEVELS[0].light;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKS = 15;

// ─── Heatmap Cell ─────────────────────────────────────────────────────────────
const HeatCell = memo(({ date, count }) => {
  const label = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    : '';

  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <div className="group relative">
      <div
        className={`w-3.5 h-3.5 rounded-[3px] transition-all duration-150 group-hover:scale-125 cursor-default ${
          isToday ? 'ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-zinc-900' : ''
        }`}
        style={{ backgroundColor: getCellColor(count) }}
      />
      {/* Tooltip */}
      {date && (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 hidden group-hover:flex flex-col items-center">
          <div className="bg-slate-800 dark:bg-zinc-700 text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl font-medium">
            <span className="text-slate-300 dark:text-zinc-400">{label}</span>
            {' · '}
            <span className="text-white font-bold">{count}</span>
            {' '}
            <span className="text-slate-300">{count === 1 ? 'activity' : 'activities'}</span>
          </div>
          <div className="w-1.5 h-1.5 bg-slate-800 dark:bg-zinc-700 rotate-45 -mt-0.5" />
        </div>
      )}
    </div>
  );
});
HeatCell.displayName = 'HeatCell';

// ─── ActivityHeatmap ─────────────────────────────────────────────────────────
export default memo(function ActivityHeatmap({ data }) {
  const grid = useMemo(() => buildWeekGrid(WEEKS), []);

  // Month labels: show month name when week starts a new month
  const monthLabels = useMemo(() => {
    return grid.map((week) => {
      const d = new Date(week[0] + 'T12:00:00');
      return d.getDate() <= 7 ? d.toLocaleString('default', { month: 'short' }) : '';
    });
  }, [grid]);

  const totalActivities = useMemo(() => {
    return data ? Object.values(data).reduce((s, v) => s + v, 0) : 0;
  }, [data]);

  const activeDays = useMemo(() => {
    return data ? Object.values(data).filter((v) => v > 0).length : 0;
  }, [data]);

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Activity Heatmap</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
            Lead creates, contacts & meetings — last {WEEKS} weeks
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {/* Stats chips */}
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Total Activities</p>
            <p className="font-bold text-slate-900 dark:text-zinc-100">{totalActivities}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Active Days</p>
            <p className="font-bold text-slate-900 dark:text-zinc-100">{activeDays}</p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500">
            <span>Less</span>
            {HEATMAP_LEVELS.map((l, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-[3px]"
                style={{ backgroundColor: l.light }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="flex gap-1 ml-8">
            {grid.map((week, wi) => (
              <div key={wi} className="w-3.5 text-[9px] text-slate-400 dark:text-zinc-500 font-medium">
                {monthLabels[wi]}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAY_LABELS.map((day, di) => (
            <div key={day} className="flex items-center gap-1">
              {/* Day label */}
              <div className="w-7 text-[9px] text-slate-400 dark:text-zinc-500 text-right flex-shrink-0 font-medium">
                {di % 2 === 0 ? day : ''}
              </div>
              {/* Cells */}
              {grid.map((week, wi) => {
                const date = week[di];
                const count = data?.[date] || 0;
                return <HeatCell key={`${wi}-${di}`} date={date} count={count} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
