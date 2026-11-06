/**
 * Centralized color palette for all analytics charts and visualizations.
 * Styled for the Coral Sunset brand identity (Lifestyle / Ecommerce).
 * Matches the STATUS values stored in LeadContext exactly.
 */

/** Maps each lead status (DB value) to a brand hex color */
export const STATUS_COLORS = {
  New: '#A37E7C',
  Contacted: '#F28A73',
  'Meeting Scheduled': '#FFC857',
  'Proposal Sent': '#E85D5D',
  Won: '#16A34A',
  Lost: '#D64242',
};

export const KPI_COLORS = {
  totalLeads: '#E85D5D',
  conversionRate: '#16A34A',
  pipelineValue: '#F28A73',
  wonRevenue: '#2E8B57',
  avgSalesCycle: '#FFC857',
  lostRate: '#D64242',
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
  New: '#A37E7C',
  Contacted: '#F28A73',
  Meeting: '#FFC857',
  Proposal: '#E85D5D',
  Won: '#16A34A',
  Lost: '#D64242',
};

/** Funnel stage order for pipeline tracking */
export const FUNNEL_STAGES = [
  { db: 'New', label: 'New', color: '#A37E7C', order: 0 },
  { db: 'Contacted', label: 'Contacted', color: '#F28A73', order: 1 },
  { db: 'Meeting Scheduled', label: 'Meeting', color: '#FFC857', order: 2 },
  { db: 'Proposal Sent', label: 'Proposal', color: '#E85D5D', order: 3 },
  { db: 'Won', label: 'Won', color: '#16A34A', order: 4 },
];

/** Rotating palette for lead sources in Coral Sunset harmony */
export const SOURCE_COLORS = [
  '#E85D5D', '#F28A73', '#FFC857', '#16A34A', '#E06A55', '#D97706', '#B33030', '#F59E0B',
];

/** Semantic chart colors */
export const CHART_COLORS = {
  primary: '#E85D5D',
  secondary: '#F28A73',
  accent: '#FFC857',
  success: '#16A34A',
  warning: '#FFC857',
  danger: '#D64242',
  purple: '#A855F7',
  cyan: '#F28A73',
  gray: '#A37E7C',
  orange: '#E06A55',
};

/** Heatmap intensity levels (Surface #FFEDE8 / #32201E -> Primary #E85D5D / #FF8B80) */
export const HEATMAP_LEVELS = [
  { min: 0, max: 0, light: '#FFEDE8', dark: '#32201E' },
  { min: 1, max: 2, light: '#FCD8D2', dark: '#472B28' },
  { min: 3, max: 4, light: '#F8B3A8', dark: '#733734' },
  { min: 5, max: 7, light: '#F28A73', dark: '#B34A45' },
  { min: 8, max: Infinity, light: '#E85D5D', dark: '#FF8B80' },
];
