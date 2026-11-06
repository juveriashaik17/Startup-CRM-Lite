import React from 'react';

/**
 * @typedef {Object} StatusBadgeProps
 * @property {string} status - The lead status string (e.g., "New", "Won").
 */

/**
 * StatusBadge Component
 * 
 * Renders a pill-shaped, colored badge corresponding to the lead's pipeline stage.
 * Incorporates specific background, text, and border styling to convey status semantic meanings.
 * 
 * @param {StatusBadgeProps} props - The component properties.
 * @returns {React.JSX.Element} The styled badge element.
 */
export default function StatusBadge({ status }) {
  /**
   * Helper utility mapping status stages to their respective premium tailwind classes.
   * Maps status levels to semantic colors: gray, cyan, indigo, amber, emerald, and rose.
   * 
   * @param {string} statusLevel - The lead status stage.
   * @returns {{bg: string, text: string, border: string}} The styling classes.
   */
  const getStyles = (statusLevel) => {
    switch (statusLevel) {
      case 'New':
        return {
          bg: 'bg-stone-100 dark:bg-stone-900/60',
          text: 'text-stone-700 dark:text-stone-300',
          border: 'border-stone-200 dark:border-stone-800'
        };
      case 'Contacted':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/30',
          text: 'text-orange-700 dark:text-orange-300',
          border: 'border-orange-200 dark:border-orange-900/40'
        };
      case 'Meeting Scheduled':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          text: 'text-amber-800 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-900/40'
        };
      case 'Proposal Sent':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/30',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-900/40'
        };
      case 'Won':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-900/40'
        };
      case 'Lost':
        return {
          bg: 'bg-red-50 dark:bg-red-950/30',
          text: 'text-red-700 dark:text-red-400',
          border: 'border-red-200 dark:border-red-900/40'
        };
      default:
        return {
          bg: 'bg-stone-50 dark:bg-stone-900/40',
          text: 'text-stone-600 dark:text-stone-400',
          border: 'border-stone-200/60 dark:border-stone-800'
        };
    }
  };

  const styles = getStyles(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${styles.bg} ${styles.text} ${styles.border} transition-colors duration-150`}>
      {/* Small bullet indicator before text */}
      <span className="w-1 h-1 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
}
