/**
 * useAnalytics.js
 * Central analytics hook. Consumes useLeads(), applies date filtering,
 * and runs all computations memoized to prevent redundant re-renders.
 */
import { useMemo } from 'react';
import { useLeads } from '../context/LeadContext';
import {
  filterByDateRange,
  filterPreviousPeriod,
  getStatusDistribution,
  getMonthlyLeads,
  getConversionByMonth,
  getRevenueByMonth,
  getPipelineValue,
  getWonRevenue,
  getAverageSalesCycle,
  getLostRate,
  getConversionRate,
  getLeadSourceStats,
  getFunnelData,
  getSalesVelocity,
  getForecastRevenue,
  getTopPerformers,
  getActivityHeatmapData,
  getTotalLeads,
} from '../utils/analyticsHelpers';

/**
 * @param {string} dateRange - 'all' | '7' | '30' | '90' | '365'
 */
export function useAnalytics(dateRange = '30') {
  const { leads: allLeads } = useLeads();

  // Current period filtered leads
  const leads = useMemo(
    () => filterByDateRange(allLeads, dateRange),
    [allLeads, dateRange],
  );

  // Previous period for growth comparison
  const prevLeads = useMemo(
    () => filterPreviousPeriod(allLeads, dateRange),
    [allLeads, dateRange],
  );

  // ── Chart data ─────────────────────────────────────────────────────────────
  const statusDistribution = useMemo(() => getStatusDistribution(leads), [leads]);
  const monthlyLeads      = useMemo(() => getMonthlyLeads(leads),       [leads]);
  const conversionByMonth = useMemo(() => getConversionByMonth(leads),  [leads]);
  const revenueByMonth    = useMemo(() => getRevenueByMonth(leads),     [leads]);
  const leadSources       = useMemo(() => getLeadSourceStats(leads),    [leads]);
  const funnelData        = useMemo(() => getFunnelData(leads),         [leads]);
  const topPerformers     = useMemo(() => getTopPerformers(leads),      [leads]);
  const heatmapData       = useMemo(() => getActivityHeatmapData(leads),[leads]);

  // ── KPI scalars ────────────────────────────────────────────────────────────
  const totalLeads      = useMemo(() => getTotalLeads(leads),         [leads]);
  const conversionRate  = useMemo(() => getConversionRate(leads),     [leads]);
  const pipelineValue   = useMemo(() => getPipelineValue(leads),      [leads]);
  const wonRevenue      = useMemo(() => getWonRevenue(leads),         [leads]);
  const avgSalesCycle   = useMemo(() => getAverageSalesCycle(leads),  [leads]);
  const lostRate        = useMemo(() => getLostRate(leads),           [leads]);
  const velocityData    = useMemo(() => getSalesVelocity(leads),      [leads]);
  const prevVelocity    = useMemo(() => getSalesVelocity(prevLeads),  [prevLeads]);
  const velocityGrowth  = useMemo(() => {
    const prev = prevVelocity.velocity;
    const curr = velocityData.velocity;
    if (!prev) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }, [velocityData.velocity, prevVelocity.velocity]);

  const velocity = useMemo(() => ({
    ...velocityData,
    growth: velocityGrowth,
  }), [velocityData, velocityGrowth]);

  const forecast        = useMemo(() => getForecastRevenue(leads),    [leads]);

  // ── Growth indicators (current vs previous period) ─────────────────────────
  const leadsGrowth = useMemo(() => {
    const prev = prevLeads.length;
    const curr = leads.length;
    if (!prev) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }, [leads.length, prevLeads.length]);

  const revenueGrowth = useMemo(() => {
    const prev = getWonRevenue(prevLeads);
    if (!prev) return wonRevenue > 0 ? 100 : 0;
    return Math.round(((wonRevenue - prev) / prev) * 100);
  }, [wonRevenue, prevLeads]);

  const conversionGrowth = useMemo(() => {
    return conversionRate - getConversionRate(prevLeads);
  }, [conversionRate, prevLeads]);

  const pipelineGrowth = useMemo(() => {
    const prev = getPipelineValue(prevLeads);
    if (!prev) return pipelineValue > 0 ? 100 : 0;
    return Math.round(((pipelineValue - prev) / prev) * 100);
  }, [pipelineValue, prevLeads]);

  return {
    // Raw data
    leads,
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
  };
}
