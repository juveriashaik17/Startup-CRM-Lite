import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const RANGE_OPTIONS = [
  { label: 'All Time',     value: 'all' },
  { label: 'Last 7 Days',  value: '7'   },
  { label: 'Last 30 Days', value: '30'  },
  { label: 'Last 90 Days', value: '90'  },
  { label: 'This Year',    value: '365' },
  { label: 'Custom Range', value: 'custom' },
];

/**
 * AnalyticsFilters
 * Date-range selector for the analytics dashboard.
 * Emits onChange(value) where value is '7' | '30' | '90' | '365' | object custom range.
 */
export default function AnalyticsFilters({ dateRange, onChange }) {
  const isCustom = typeof dateRange === 'object' && dateRange?.type === 'custom';
  const activeValue = isCustom ? 'custom' : dateRange;

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);
  const defaultStartStr = defaultStart.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(isCustom ? dateRange.start : defaultStartStr);
  const [endDate, setEndDate] = useState(isCustom ? dateRange.end : todayStr);

  useEffect(() => {
    if (isCustom) {
      setStartDate(dateRange.start);
      setEndDate(dateRange.end);
    }
  }, [dateRange, isCustom]);

  const handleRangeChange = (value) => {
    if (value === 'custom') {
      onChange({ type: 'custom', start: startDate, end: endDate });
    } else {
      onChange(value);
    }
  };

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    onChange({ type: 'custom', start: val, end: endDate });
  };

  const handleEndDateChange = (e) => {
    const val = e.target.value;
    setEndDate(val);
    onChange({ type: 'custom', start: startDate, end: val });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Calendar icon */}
        <span className="text-slate-400 dark:text-zinc-500 mr-0.5">
          <Calendar className="w-4 h-4" />
        </span>

        {/* Range buttons */}
        {RANGE_OPTIONS.map((opt) => {
          const isActive = activeValue === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleRangeChange(opt.value)}
              className={`
                px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 cursor-pointer whitespace-nowrap
                ${isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 dark:bg-blue-500 dark:border-blue-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Inline inputs for Custom Range */}
      {isCustom && (
        <div className="flex items-center gap-2 animate-fadeIn">
          <div className="flex items-center gap-1">
            <label htmlFor="analytics-start-date" className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase cursor-pointer">From</label>
            <input
              id="analytics-start-date"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={endDate}
              className="px-2 py-1 text-xs border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1">
            <label htmlFor="analytics-end-date" className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase cursor-pointer">To</label>
            <input
              id="analytics-end-date"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
              max={todayStr}
              className="px-2 py-1 text-xs border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
