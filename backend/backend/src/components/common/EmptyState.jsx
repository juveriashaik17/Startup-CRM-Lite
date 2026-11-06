import React, { memo } from 'react';
// Import specific Lucide React icons for the visual alerts
import { Search, Inbox, RotateCcw } from 'lucide-react';

/**
 * @typedef {Object} EmptyStateProps
 * @property {number} totalLeadsCount - The total number of lead records in the CRM database.
 * @property {() => void} onClear - Callback function to reset search queries and stage filters.
 */

/**
 * EmptyState Component
 * 
 * Displays a descriptive, accessible fallback screen when no lead records are available to show.
 * Adapts its message dynamically based on two distinct scenarios:
 * 1. The workspace is completely empty (zero total leads). Prompts user to create a lead.
 * 2. Active filters or search terms returned zero matches. Offers a CTA to clear filters.
 * 
 * @param {EmptyStateProps} props - The component properties.
 * @returns {React.JSX.Element} The visual fallback screen.
 */
const EmptyState = memo(function EmptyState({ totalLeadsCount, onClear }) {
  // Scenario A: Completely empty database (zero leads in the workspace)
  const isWorkspaceEmpty = totalLeadsCount === 0;

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm text-center max-w-md mx-auto transition-colors duration-200">
      
      {/* Dynamic Icon Backdrop (pulsing animation for premium feel) */}
      <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/50 flex items-center justify-center mb-5 shadow-inner">
        {isWorkspaceEmpty ? (
          // Inbox icon representing empty vault
          <Inbox className="w-7 h-7 text-gray-500 dark:text-gray-400" />
        ) : (
          // Temporary placeholder image/icon representing unsuccessful search
          <Search className="w-7 h-7 text-gray-500 dark:text-gray-400" />
        )}
      </div>

      {/* Dynamic Main Title */}
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
        {isWorkspaceEmpty ? 'Your lead pipeline is empty' : 'No leads match your search'}
      </h3>

      {/* Dynamic Supporting Subtitle */}
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
        {isWorkspaceEmpty 
          ? 'Get started by registering your first sales prospect using the "Add New Lead" button at the top of the page.' 
          : 'We couldn\'t find any records matching your active keyword or stage filter. Try adjusting your spelling or reset the parameters.'
        }
      </p>

      {/* Dynamic Call-to-Action button */}
      {!isWorkspaceEmpty && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 border border-blue-100 dark:border-blue-950/30 rounded-xl transition-all duration-150 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear All Search Filters
        </button>
      )}

    </div>
  );
});
EmptyState.displayName = 'EmptyState';
export default EmptyState;
