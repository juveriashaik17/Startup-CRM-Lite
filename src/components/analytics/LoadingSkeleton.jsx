import React from 'react';

function Pulse({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-zinc-800 rounded-xl ${className}`} />;
}

function StatSkeleton() {
  return (
    <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <Pulse className="h-2.5 w-20 rounded-full" />
        <Pulse className="h-9 w-9 rounded-xl" />
      </div>
      <Pulse className="h-7 w-24 mb-2" />
      <div className="flex items-center gap-2">
        <Pulse className="h-4 w-12 rounded-full" />
        <Pulse className="h-3 w-16 rounded-full" />
      </div>
    </div>
  );
}

function ChartSkeleton({ height = 'h-64', title = true, wide = false }) {
  return (
    <div className={`p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm ${wide ? 'lg:col-span-2' : ''}`}>
      {title && (
        <div className="mb-5">
          <Pulse className="h-4 w-44 mb-2" />
          <Pulse className="h-3 w-60" />
        </div>
      )}
      <Pulse className={`${height} w-full rounded-xl`} />
    </div>
  );
}

/**
 * LoadingSkeleton
 * Full-page loading skeleton for the Analytics dashboard.
 * Mimics the exact grid structure of the real dashboard with pulsing placeholders.
 */
export default function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <Pulse className="h-6 w-48" />
          <Pulse className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Pulse className="h-3 w-3 rounded-full" />
          {[...Array(5)].map((_, i) => (
            <Pulse key={i} className="h-8 w-24 rounded-lg" />
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <StatSkeleton key={i} />)}
      </div>

      {/* Charts: 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height="h-72" />
        <ChartSkeleton height="h-72" />
        <ChartSkeleton height="h-64" />
        <ChartSkeleton height="h-64" />
        <ChartSkeleton height="h-60" />
        <ChartSkeleton height="h-60" />
        <ChartSkeleton height="h-36" wide />
        <ChartSkeleton height="h-56" />
        <ChartSkeleton height="h-56" />
      </div>
    </div>
  );
}
