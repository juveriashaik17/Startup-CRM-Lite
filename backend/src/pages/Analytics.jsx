import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  LayoutDashboard,
  Target,
  DollarSign,
  Users,
  Layers,
} from 'lucide-react';

import { useAnalytics } from '../hooks/useAnalytics';
import { useLeads } from '../context/LeadContext';

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

const TABS = [
  { id: 'overview',   label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'pipeline',   label: 'Pipeline & Funnel',  icon: Target },
  { id: 'revenue',    label: 'Revenue & Forecast', icon: DollarSign },
  { id: 'team',       label: 'Team & Channels',    icon: Users },
  { id: 'all',        label: 'All Reports',        icon: Layers },
];

/**
 * Analytics Page
 *
 * Central hub for all sales analytics & reporting. All data is derived from
 * the live leads store via useAnalytics, with memoized computations for
 * performance at scale (10,000+ leads).
 */
export default function Analytics() {
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const { fetchLeads } = useLeads();

  // Sync leads from database when analytics page mounts
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
      <div className="space-y-8">
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty state when no leads exist at all
  if (allLeads.length === 0) {
    return (
      <div className="space-y-8">
        <EmptyAnalyticsState />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Track sales performance, pipeline health, conversion velocity, and growth trends.
          </p>
        </div>

        {/* Date range filters */}
        <AnalyticsFilters dateRange={dateRange} onChange={setDateRange} />
      </div>

      {/* ── Executive KPI Summary ────────────────────────────────────────────── */}
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

      {/* ── Section Navigation Pills (De-clutter & Categorize Views) ─────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-zinc-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 dark:shadow-none'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Executive Overview ────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FunnelChartCard data={funnelData} />
            <PieChartCard data={statusDistribution} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChartCard data={revenueByMonth} />
            <SalesVelocityCard velocity={velocity} />
          </div>
        </div>
      )}

      {/* ── Tab 2: Pipeline & Funnel ─────────────────────────────────────────── */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FunnelChartCard data={funnelData} />
            <PieChartCard data={statusDistribution} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartCard data={monthlyLeads} />
            <LineChartCard data={conversionByMonth} />
          </div>
        </div>
      )}

      {/* ── Tab 3: Revenue & Forecasting ─────────────────────────────────────── */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChartCard data={revenueByMonth} />
            <ForecastCard forecast={forecast} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesVelocityCard velocity={velocity} />
            <BarChartCard data={monthlyLeads} />
          </div>
        </div>
      )}

      {/* ── Tab 4: Team & Channels ───────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeadSourceChart data={leadSources} />
            <TopPerformersCard data={topPerformers} />
          </div>

          <div>
            <ActivityHeatmap data={heatmapData} />
          </div>
        </div>
      )}

      {/* ── Tab 5: All Reports (Spacious Multi-Section Layout) ────────────────── */}
      {activeTab === 'all' && (
        <div className="space-y-10">
          
          {/* Section: Funnel & Stages */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Pipeline Stages & Conversion Funnel
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChartCard data={statusDistribution} />
              <FunnelChartCard data={funnelData} />
            </div>
          </div>

          {/* Section: Monthly Trends */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Lead Volume & Conversion Rate History
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChartCard data={monthlyLeads} />
              <LineChartCard data={conversionByMonth} />
            </div>
          </div>

          {/* Section: Financials & Predictions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Revenue Closed, Forecasting & Velocity
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChartCard data={revenueByMonth} />
              <div className="flex flex-col gap-6">
                <ForecastCard forecast={forecast} />
                <SalesVelocityCard velocity={velocity} />
              </div>
            </div>
          </div>

          {/* Section: Team & Acquisition */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Acquisition Channels & Activity Heatmap
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <LeadSourceChart data={leadSources} />
              <TopPerformersCard data={topPerformers} />
            </div>
            <ActivityHeatmap data={heatmapData} />
          </div>

        </div>
      )}

    </div>
  );
}
