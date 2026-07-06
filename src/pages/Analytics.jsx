import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

import { useAnalytics } from '../hooks/useAnalytics';

import AnalyticsFilters    from '../components/analytics/AnalyticsFilters';
import StatsCards          from '../components/analytics/StatsCards';
import PieChartCard        from '../components/analytics/PieChartCard';
import FunnelChartCard     from '../components/analytics/FunnelChartCard';
import BarChartCard        from '../components/analytics/BarChartCard';
import LineChartCard       from '../components/analytics/LineChartCard';
import RevenueChartCard    from '../components/analytics/RevenueChartCard';
import LeadSourceChart     from '../components/analytics/LeadSourceChart';
import SalesVelocityCard   from '../components/analytics/SalesVelocityCard';
import ForecastCard        from '../components/analytics/ForecastCard';
import ActivityHeatmap     from '../components/analytics/ActivityHeatmap';
import TopPerformersCard   from '../components/analytics/TopPerformersCard';
import EmptyAnalyticsState from '../components/analytics/EmptyAnalyticsState';
import LoadingSkeleton     from '../components/analytics/LoadingSkeleton';

/**
 * Analytics Page
 *
 * Central hub for all sales analytics & reporting. All data is derived from
 * the live leads store via useAnalytics, with memoized computations for
 * performance at scale (10,000+ leads).
 */
export default function Analytics() {
  const [dateRange, setDateRange] = useState('30');

  const {
    // Raw
    allLeads,
    // KPIs
    totalLeads,
    conversionRate,
    pipelineValue,
    wonRevenue,
    avgSalesCycle,
    lostRate,
    // Growth
    leadsGrowth,
    revenueGrowth,
    conversionGrowth,
    pipelineGrowth,
    // Chart data
    statusDistribution,
    monthlyLeads,
    conversionByMonth,
    revenueByMonth,
    leadSources,
    funnelData,
    topPerformers,
    heatmapData,
    // Advanced
    velocity,
    forecast,
  } = useAnalytics(dateRange);

  // Show skeleton on initial paint if leads not yet available
  const isLoading = allLeads === undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty state when no leads exist at all
  if (allLeads.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyAnalyticsState />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Track sales performance, pipeline health, and growth trends.
          </p>
        </div>

        {/* Date range filters */}
        <AnalyticsFilters dateRange={dateRange} onChange={setDateRange} />
      </div>

      {/* ── KPI Summary ─────────────────────────────────────────────────────── */}
      <StatsCards
        totalLeads={totalLeads}
        conversionRate={conversionRate}
        pipelineValue={pipelineValue}
        wonRevenue={wonRevenue}
        avgSalesCycle={avgSalesCycle}
        lostRate={lostRate}
        leadsGrowth={leadsGrowth}
        revenueGrowth={revenueGrowth}
        conversionGrowth={conversionGrowth}
        pipelineGrowth={pipelineGrowth}
      />

      {/* ── Charts Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Row 1: Status Distribution | Funnel */}
        <PieChartCard data={statusDistribution} />
        <FunnelChartCard data={funnelData} />

        {/* Row 2: Monthly Leads | Conversion Trend */}
        <BarChartCard data={monthlyLeads} />
        <LineChartCard data={conversionByMonth} />

        {/* Row 3: Revenue | Lead Sources */}
        <RevenueChartCard data={revenueByMonth} />
        <LeadSourceChart data={leadSources} />

        {/* Row 4: Heatmap (full-width) */}
        <div className="md:col-span-2">
          <ActivityHeatmap data={heatmapData} />
        </div>

        {/* Row 5: Top Performers | Sales Velocity */}
        <TopPerformersCard data={topPerformers} />
        <div className="flex flex-col gap-6">
          <ForecastCard forecast={forecast} />
          <SalesVelocityCard velocity={velocity} />
        </div>

      </div>
    </div>
  );
}
