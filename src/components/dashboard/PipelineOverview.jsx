import React from 'react';

/**
 * @typedef {Object} Lead
 * @property {string} id - The lead identifier.
 * @property {string} name - The contact's name.
 * @property {string} company - The company name.
 * @property {string} status - The lead's current status stage (e.g. "New", "Won").
 * @property {number} value - The financial value of the deal.
 * @property {string} createdAt - ISO creation date string.
 */

/**
 * @typedef {Object} PipelineOverviewProps
 * @property {Lead[]} leads - The array of lead records.
 */

/**
 * PipelineOverview Component
 * 
 * Aggregates a workspace's leads by their current sales status, computes
 * status percentages, and displays a premium segmented horizontal bar.
 * Includes a detailed legend containing status counts and percentages.
 * 
 * Refactored to align with the global LeadContext schema (uses status key).
 * 
 * @param {PipelineOverviewProps} props - The component properties.
 * @returns {React.JSX.Element} The visual pipeline status widget.
 */
export default function PipelineOverview({ leads = [] }) {
  // Define all valid pipeline statuses in sequence and map them to their corresponding
  // Tailwind color classes (used for the segment bars and legend indicators).
  const stageDefinitions = [
    { key: 'New', label: 'New Capture', colorClass: 'bg-gray-300 dark:bg-gray-600', textClass: 'text-gray-500 dark:text-gray-400' },
    { key: 'Contacted', label: 'Contacted', colorClass: 'bg-cyan-500 dark:bg-cyan-600', textClass: 'text-cyan-500 dark:text-cyan-400' },
    { key: 'Meeting Scheduled', label: 'Meeting Scheduled', colorClass: 'bg-indigo-500 dark:bg-indigo-600', textClass: 'text-indigo-500 dark:text-indigo-400' },
    { key: 'Proposal Sent', label: 'Proposal Sent', colorClass: 'bg-amber-500 dark:bg-amber-600', textClass: 'text-amber-500 dark:text-amber-400' },
    { key: 'Won', label: 'Closed Won', colorClass: 'bg-emerald-500 dark:bg-emerald-600', textClass: 'text-emerald-500 dark:text-emerald-400' },
    { key: 'Lost', label: 'Closed Lost', colorClass: 'bg-rose-500 dark:bg-rose-600', textClass: 'text-rose-500 dark:text-rose-400' }
  ];

  const totalLeadsCount = leads.length;

  // Compute lead distribution metrics per status.
  const stageMetrics = stageDefinitions.map((stageDef) => {
    // Matches the lead.status key from the global Context API
    const count = leads.filter((lead) => lead.status === stageDef.key).length;
    const percentage = totalLeadsCount > 0 ? Math.round((count / totalLeadsCount) * 100) : 0;
    
    return {
      ...stageDef,
      count,
      percentage
    };
  });

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
      
      {/* Widget Header Section */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Pipeline Stage Distribution
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Visual representation of deals currently moving through your sales channels.
        </p>
      </div>

      {/* Segmented Progress Bar */}
      <div className="relative w-full h-3 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden flex mb-6">
        {totalLeadsCount > 0 ? (
          stageMetrics.map((stage) => (
            // Only render segments that have at least one lead (percentage > 0) to avoid rendering artifacts
            stage.percentage > 0 && (
              <div
                key={stage.key}
                className={`h-full ${stage.colorClass} transition-all duration-300`}
                style={{ width: `${stage.percentage}%` }}
                title={`${stage.label}: ${stage.count} leads (${stage.percentage}%)`}
              />
            )
          ))
        ) : (
          // Gray fallback bar indicating an empty state
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
        )}
      </div>

      {/* Legend Grid Section: Displays detailed metrics per stage */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stageMetrics.map((stage) => (
          <div 
            key={stage.key} 
            className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
          >
            {/* Colored circular dot indicator */}
            <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${stage.colorClass}`} />
            
            {/* Label and statistics stack */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {stage.key}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {stage.count} {stage.count === 1 ? 'lead' : 'leads'} ({stage.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
