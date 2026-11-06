/**
 * Centralized color palette for all analytics charts and visualizations.
 * Matches the STATUS values stored in LeadContext exactly.
 */

/** Maps each lead status (DB value) to a hex color */
export const STATUS_COLORS = {
  New: '#94A3B8',
  Contacted: '#2563EB',
  'Meeting Scheduled': '#F59E0B',
  'Proposal Sent': '#7C3AED',
  Won: '#22C55E',
  Lost: '#EF4444',
};

export const KPI_COLORS = {
  totalLeads: '#4F46E5',
  conversionRate: '#10B981',
  pipelineValue: '#3B82F6',
  wonRevenue: '#22C55E',
  avgSalesCycle: '#F59E0B',
  lostRate: '#EF4444',
};

/** Short display labels used in charts (maps from DB status) */
export const STATUS_LABEL_MAP = {
  New: 'New',
  Contacted: 'Contacted',
  'Meeting Scheduled': 'Meeting',
  'Proposal Sent': 'Proposal',
  Won: 'Won',
  Lost: 'Lost',
};

/** Colors keyed by short chart label */
export const STATUS_CHART_COLORS = {
  New: '#94A3B8',
  Contacted: '#2563EB',
  Meeting: '#F59E0B',
  Proposal: '#7C3AED',
  Won: '#22C55E',
  Lost: '#EF4444',
};

/** Funnel stage order for pipeline tracking */
export const FUNNEL_STAGES = [
  { db: 'New', label: 'New', color: '#94A3B8', order: 0 },
  { db: 'Contacted', label: 'Contacted', color: '#2563EB', order: 1 },
  { db: 'Meeting Scheduled', label: 'Meeting', color: '#F59E0B', order: 2 },
  { db: 'Proposal Sent', label: 'Proposal', color: '#7C3AED', order: 3 },
  { db: 'Won', label: 'Won', color: '#22C55E', order: 4 },
];

/** Rotating palette for lead sources */
export const SOURCE_COLORS = [
  '#2563EB', '#22C55E', '#F59E0B', '#7C3AED', '#EF4444', '#06B6D4', '#F97316', '#EC4899',
];

/** Semantic chart colors */
export const CHART_COLORS = {
  primary: '#2563EB',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#7C3AED',
  cyan: '#06B6D4',
  gray: '#94A3B8',
  orange: '#F97316',
};

/** Heatmap intensity levels */
export const HEATMAP_LEVELS = [
  { min: 0, max: 0, light: '#F1F5F9', dark: '#27272A' },
  { min: 1, max: 2, light: '#BFDBFE', dark: '#1E3A5F' },
  { min: 3, max: 4, light: '#60A5FA', dark: '#1D4ED8' },
  { min: 5, max: 7, light: '#2563EB', dark: '#3B82F6' },
  { min: 8, max: Infinity, light: '#1D4ED8', dark: '#60A5FA' },
];
