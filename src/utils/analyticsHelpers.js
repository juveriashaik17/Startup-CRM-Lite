/**
 * analyticsHelpers.js
 * Pure, memoization-friendly utility functions for all analytics computations.
 * All functions perform defensive null handling and return sensible defaults.
 * Currency is formatted in Indian Rupees (₹) with lakh/crore compact notation.
 */

import { STATUS_LABEL_MAP, FUNNEL_STAGES, SOURCE_COLORS } from '../constants/analyticsColors';

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_ORDER = {
  New: 0, Contacted: 1, 'Meeting Scheduled': 2, 'Proposal Sent': 3, Won: 4, Lost: 5,
};

/**
 * Returns an array of the last N months with key (YYYY-MM) and display label.
 */
function getLastNMonths(n = 6) {
  const now = new Date();
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

/**
 * Gets YYYY-MM key from a date string.
 */
function getMonthKey(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE RANGE FILTERING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filters leads by date range.
 * @param {Array} leads
 * @param {string|number|object} range - 'all' | 7 | 30 | 90 | 365 | { type: 'custom', start, end }
 */
export function filterByDateRange(leads, range) {
  if (!Array.isArray(leads)) return [];
  if (!range || range === 'all') return leads;

  if (typeof range === 'object' && range.type === 'custom' && range.start && range.end) {
    const start = new Date(range.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(range.end);
    end.setHours(23, 59, 59, 999);
    return leads.filter((l) => {
      if (!l?.createdAt) return false;
      const d = new Date(l.createdAt);
      return d >= start && d <= end;
    });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(range));
  return leads.filter((l) => l?.createdAt && new Date(l.createdAt) >= cutoff);
}

/**
 * Filters leads for the previous period (for comparison growth calculations).
 */
export function filterPreviousPeriod(leads, range) {
  if (!Array.isArray(leads) || !range || range === 'all') return [];

  if (typeof range === 'object' && range.type === 'custom' && range.start && range.end) {
    const start = new Date(range.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(range.end);
    end.setHours(23, 59, 59, 999);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - diffDays);
    const prevEnd = new Date(start);

    return leads.filter((l) => {
      if (!l?.createdAt) return false;
      const d = new Date(l.createdAt);
      return d >= prevStart && d < prevEnd;
    });
  }

  const daysNum = Number(range);
  const now = new Date();
  const prevEnd = new Date(now);
  prevEnd.setDate(prevEnd.getDate() - daysNum);
  const prevStart = new Date(now);
  prevStart.setDate(prevStart.getDate() - daysNum * 2);
  return leads.filter((l) => {
    if (!l?.createdAt) return false;
    const d = new Date(l.createdAt);
    return d >= prevStart && d < prevEnd;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI METRICS
// ─────────────────────────────────────────────────────────────────────────────

export function getTotalLeads(leads) {
  return Array.isArray(leads) ? leads.length : 0;
}

export function getConversionRate(leads) {
  if (!leads?.length) return 0;
  const won = leads.filter((l) => l?.status === 'Won').length;
  return Math.round((won / leads.length) * 100);
}

export function getPipelineValue(leads) {
  if (!leads?.length) return 0;
  return leads
    .filter((l) => l?.status !== 'Won' && l?.status !== 'Lost')
    .reduce((sum, l) => sum + (Number(l?.value) || 0), 0);
}

export function getWonRevenue(leads) {
  if (!leads?.length) return 0;
  return leads
    .filter((l) => l?.status === 'Won')
    .reduce((sum, l) => sum + (Number(l?.value) || 0), 0);
}

export function getAverageSalesCycle(leads) {
  if (!leads?.length) return 0;
  const won = leads.filter((l) => l?.status === 'Won' && l?.wonAt && l?.createdAt);
  if (!won.length) return 0;
  const total = won.reduce((sum, l) => {
    const diff = (new Date(l.wonAt) - new Date(l.createdAt)) / 86400000;
    return sum + Math.max(0, diff);
  }, 0);
  return Math.round(total / won.length);
}

export function getLostRate(leads) {
  if (!leads?.length) return 0;
  const lost = leads.filter((l) => l?.status === 'Lost').length;
  return Math.round((lost / leads.length) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART DATA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns lead count per status for Pie/Doughnut chart.
 * Output: [{ name, value, percentage }]
 */
export function getStatusDistribution(leads) {
  if (!leads?.length) return [];
  const counts = {};
  leads.forEach((l) => {
    if (!l?.status) return;
    const label = STATUS_LABEL_MAP[l.status] || l.status;
    counts[label] = (counts[label] || 0) + 1;
  });
  const total = leads.length;
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / total) * 100),
  }));
}

/**
 * Returns lead counts grouped by month for Bar chart.
 * Output: [{ month, leads, key }]
 */
export function getMonthlyLeads(leads, months = 6) {
  const buckets = getLastNMonths(months);
  return buckets.map(({ key, label }) => ({
    month: label,
    leads: Array.isArray(leads)
      ? leads.filter((l) => getMonthKey(l?.createdAt) === key).length
      : 0,
    key,
  }));
}

/**
 * Returns conversion rate per month for Line chart.
 * Output: [{ month, conversion, won, total }]
 */
export function getConversionByMonth(leads, months = 6) {
  const buckets = getLastNMonths(months);
  return buckets.map(({ key, label }) => {
    const ml = Array.isArray(leads)
      ? leads.filter((l) => getMonthKey(l?.createdAt) === key)
      : [];
    const won = ml.filter((l) => l?.status === 'Won').length;
    return {
      month: label,
      conversion: ml.length ? Math.round((won / ml.length) * 100) : 0,
      won,
      total: ml.length,
    };
  });
}

/**
 * Returns Won revenue grouped by month for Area chart.
 * Output: [{ month, revenue }]
 */
export function getRevenueByMonth(leads, months = 6) {
  const buckets = getLastNMonths(months);
  return buckets.map(({ key, label }) => {
    const won = Array.isArray(leads)
      ? leads.filter((l) => {
          if (l?.status !== 'Won') return false;
          return getMonthKey(l?.wonAt || l?.createdAt) === key;
        })
      : [];
    return {
      month: label,
      revenue: won.reduce((sum, l) => sum + (Number(l?.value) || 0), 0),
    };
  });
}

/**
 * Returns lead counts by source, sorted descending, for Horizontal Bar chart.
 * Output: [{ source, count, percentage, color }]
 */
export function getLeadSourceStats(leads) {
  if (!leads?.length) return [];
  const counts = {};
  leads.forEach((l) => {
    const src = l?.source || 'Unknown';
    counts[src] = (counts[src] || 0) + 1;
  });
  const total = leads.length;
  return Object.entries(counts)
    .map(([source, count], i) => ({
      source,
      count,
      percentage: Math.round((count / total) * 100),
      color: SOURCE_COLORS[i % SOURCE_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Returns funnel stage data. Each stage shows how many leads
 * have progressed through that stage.
 * Output: [{ stage, label, count, percentage, stageConversion, dropoff, color }]
 */
export function getFunnelData(leads) {
  const emptyResult = FUNNEL_STAGES.map((s) => ({
    ...s,
    count: 0,
    percentage: 100,
    stageConversion: 100,
    dropoff: 0,
  }));

  if (!leads?.length) return emptyResult;

  // Count how many leads have reached each stage or beyond
  const stageCounts = FUNNEL_STAGES.map(({ order }) => {
    const count = leads.filter((l) => {
      const lo = STAGE_ORDER[l?.status] ?? -1;
      if (l?.status === 'Lost') return false; // exclude lost from funnel
      return lo >= order;
    }).length;
    return count;
  });

  const top = stageCounts[0] || 1;
  return FUNNEL_STAGES.map(({ db, label, color }, i) => {
    const count = stageCounts[i];
    const prevCount = i > 0 ? stageCounts[i - 1] : count;
    const stageConversion = prevCount > 0 ? Math.round((count / prevCount) * 100) : 100;
    return {
      stage: db,
      label,
      count,
      color,
      percentage: Math.round((count / top) * 100),
      stageConversion,
      dropoff: i > 0 ? 100 - stageConversion : 0,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADVANCED METRICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates Sales Velocity.
 * Formula: (Opportunities × Win Rate × Avg Deal Size) / Avg Sales Cycle
 */
export function getSalesVelocity(leads) {
  const empty = { velocity: 0, opportunities: 0, winRate: 0, avgDealSize: 0, avgCycle: 0 };
  if (!leads?.length) return empty;

  const opportunities = leads.filter((l) => l?.status !== 'Lost').length;
  const winRate = getConversionRate(leads) / 100;
  const totalValue = leads.reduce((sum, l) => sum + (Number(l?.value) || 0), 0);
  const avgDealSize = leads.length > 0 ? totalValue / leads.length : 0;
  const avgCycle = getAverageSalesCycle(leads) || 30;

  const velocity = avgCycle > 0
    ? Math.round((opportunities * winRate * avgDealSize) / avgCycle)
    : 0;

  return {
    velocity,
    opportunities,
    winRate: Math.round(winRate * 100),
    avgDealSize: Math.round(avgDealSize),
    avgCycle,
  };
}

/**
 * Forecasts next month's revenue using last 6 months' average + growth trend.
 */
export function getForecastRevenue(leads) {
  if (!leads?.length) return { predicted: 0, confidence: 0, growth: 0 };

  const monthly = getRevenueByMonth(leads, 6);
  const nonZero = monthly.filter((m) => m.revenue > 0);
  if (!nonZero.length) return { predicted: 0, confidence: 30, growth: 0 };

  const avg = nonZero.reduce((s, m) => s + m.revenue, 0) / nonZero.length;
  const last = nonZero.slice(-3);

  let growth = 0;
  if (last.length >= 2) {
    const recentAvg = last.slice(-2).reduce((s, m) => s + m.revenue, 0) / 2;
    const olderAvg = last.slice(0, -1).reduce((s, m) => s + m.revenue, 0) / (last.length - 1);
    growth = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;
  }

  const confidence = Math.min(92, Math.max(35, 40 + nonZero.length * 8));
  const predicted = Math.round(avg * (1 + Math.max(-0.5, Math.min(0.5, growth / 100))));

  return { predicted, confidence, growth };
}

/**
 * Ranks sales reps (lead owners) by won revenue.
 * Output: [{ owner, won, revenue, total, conversionRate, rank }]
 */
export function getTopPerformers(leads) {
  if (!leads?.length) return [];
  const owners = {};
  leads.forEach((l) => {
    const owner = l?.owner || 'Unassigned';
    if (!owners[owner]) owners[owner] = { owner, won: 0, revenue: 0, total: 0 };
    owners[owner].total++;
    if (l?.status === 'Won') {
      owners[owner].won++;
      owners[owner].revenue += Number(l?.value) || 0;
    }
  });
  return Object.values(owners)
    .sort((a, b) => b.revenue - a.revenue || b.won - a.won)
    .slice(0, 5)
    .map((o, i) => ({
      ...o,
      rank: i + 1,
      conversionRate: o.total > 0 ? Math.round((o.won / o.total) * 100) : 0,
    }));
}

/**
 * Builds activity heatmap data: { 'YYYY-MM-DD': count }
 */
export function getActivityHeatmapData(leads) {
  if (!leads?.length) return {};
  const data = {};
  leads.forEach((l) => {
    if (l?.createdAt) {
      const date = new Date(l.createdAt).toISOString().split('T')[0];
      data[date] = (data[date] || 0) + 1;
    }
    if (l?.meetingAt) {
      const date = new Date(l.meetingAt).toISOString().split('T')[0];
      data[date] = (data[date] || 0) + 1;
    }
    if (l?.contactedAt) {
      const date = new Date(l.contactedAt).toISOString().split('T')[0];
      data[date] = (data[date] || 0) + 1;
    }
  });
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTING UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a number as Indian Rupees (₹).
 * - compact=true: ₹4.2L, ₹1.2Cr
 * - compact=false: ₹4,20,000
 */
export function formatCurrency(value, compact = false) {
  const num = Number(value) || 0;
  if (compact) {
    if (num >= 10_000_000) return `₹${(num / 10_000_000).toFixed(1)}Cr`;
    if (num >= 100_000) return `₹${(num / 100_000).toFixed(1)}L`;
    if (num >= 1_000) return `₹${(num / 1_000).toFixed(0)}K`;
    return `₹${num}`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatGrowth(value) {
  const num = Number(value) || 0;
  return num >= 0 ? `+${num}%` : `${num}%`;
}
