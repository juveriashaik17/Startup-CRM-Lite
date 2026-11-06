import React, { memo } from 'react';

/**
 * @typedef {Object} StatsCardProps
 * @property {string} title - The title/label of the metric (e.g., "Total Leads").
 * @property {string|number} value - The main quantitative value to show (e.g., "$452,000").
 * @property {React.ComponentType<{className?: string}>} icon - The Lucide icon component to render inside the card.
 * @property {string} change - The percentage change vs last month (e.g., "+12.3%" or "-2.4%").
 * @property {'primary' | 'success' | 'warning' | 'danger'} color - The semantic color token mapping.
 */

/**
 * StatsCard Component
 * 
 * Displays a quantitative workspace metric in a premium card structure.
 * Featuring a dynamic, semantic icon container, bold typography, and a trend percentage indicator.
 * 
 * @param {StatsCardProps} props - The component properties.
 * @returns {React.JSX.Element} The styled metric card.
 */
const StatsCard = memo(function StatsCard({ title, value, icon: Icon, change, color }) {
  // Determine trend direction dynamically from the percentage string.
  // If the percentage starts with '+', it is treated as a positive increase.
  const isPositive = change.startsWith('+');

  // Map the semantic color token to corresponding Tailwind color utility classes.
  // Configured for both light mode and dark mode.
  const colorMap = {
    primary: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-950/40'
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-950/40'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-950/40'
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-950/40'
    }
  };

  // Select the appropriate styling theme, defaulting to primary if the color token is unregistered.
  const theme = colorMap[color] || colorMap.primary;

  return (
    <div className="p-6 bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 flex flex-col justify-between min-h-[148px] group">
      
      {/* Top Section: Metric title and styled icon wrapper */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        {/* Styled container mapping icon to color theme */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${theme.bg} ${theme.text} ${theme.border} group-hover:scale-105 transition-transform duration-200`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      {/* Bottom Section: Quantitative value and trend direction */}
      <div className="mt-3">
        {/* Large, legible numeric read-out */}
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {value}
        </div>
        
        {/* Horizontal layout combining trend badge and comparison label */}
        <div className="flex items-center gap-2 mt-2">
          {/* Trend badge styled dynamically in green (success) or red (danger) */}
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isPositive 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
          }`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
            vs last month
          </span>
        </div>
      </div>

    </div>
  );
});
StatsCard.displayName = 'StatsCard';
export default StatsCard;
