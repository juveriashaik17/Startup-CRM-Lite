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
          bg: 'bg-slate-100 dark:bg-zinc-800/80',
          text: 'text-slate-700 dark:text-zinc-300',
          border: 'border-slate-200 dark:border-zinc-700/50'
        };
      case 'Contacted':
        return {
          bg: 'bg-cyan-50 dark:bg-cyan-950/20',
          text: 'text-cyan-700 dark:text-cyan-400',
          border: 'border-cyan-100 dark:border-cyan-950/40'
        };
      case 'Meeting Scheduled':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/20',
          text: 'text-indigo-700 dark:text-indigo-400',
          border: 'border-indigo-100 dark:border-indigo-950/40'
        };
      case 'Proposal Sent':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-100 dark:border-amber-950/40'
        };
      case 'Won':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-100 dark:border-emerald-950/40'
        };
      case 'Lost':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/20',
          text: 'text-rose-700 dark:text-rose-400',
          border: 'border-rose-100 dark:border-rose-950/40'
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-zinc-800/40',
          text: 'text-slate-600 dark:text-zinc-400',
          border: 'border-slate-200/60 dark:border-zinc-800'
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
