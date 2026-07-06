import React from 'react';
import { LEAD_STATUS_OPTIONS } from '../../constants/leads';

/**
 * @typedef {Object} Lead
 * @property {number|string} id - Unique identifier.
 * @property {string} name - Contact name.
 * @property {string} company - Company name.
 * @property {string} email - Email address.
 * @property {string} status - Current pipeline status stage.
 */

/**
 * @typedef {Object} FilterBarProps
 * @property {string} activeFilter - The currently selected active status stage (e.g. "All", "Won").
 * @property {(status: string) => void} onFilterChange - Callback triggered when a filter button is clicked.
 * @property {Lead[]} leads - The complete list of lead records in the workspace to calculate counts from.
 */

/**
 * FilterBar Component
 * 
 * Renders a premium, horizontal scrolling navigation bar of filter options.
 * Dynamically counts the number of lead records matching each stage in the pipeline
 * and displays these numbers in parentheses. Highlights the active filter option
 * with a high-contrast theme (Primary Blue).
 * 
 * @param {FilterBarProps} props - The component properties.
 * @returns {React.JSX.Element} The visual filtering toolbar.
 */
export default function FilterBar({ activeFilter, onFilterChange, leads = [] }) {
  // Define all filter options matching the core status stages
  const filterOptions = ['All', ...LEAD_STATUS_OPTIONS];

  /**
   * Helper utility to calculate the count of leads matching a specific status stage.
   * If the status stage is 'All', it returns the total size of the leads array.
   * 
   * @param {string} status - The status stage to match.
   * @returns {number} The count of matching records.
   */
  const getLeadCount = (status) => {
    if (status === 'All') {
      return leads.length;
    }
    return leads.filter((lead) => (lead.status || lead.stage) === status).length;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 select-none scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
      {/* Visual Header Label, hidden on tiny screens to optimize whitespace */}
      <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2 whitespace-nowrap">
        Filter Stage:
      </span>
      
      {/* Horizontal row of filter button chips */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        {filterOptions.map((opt) => {
          const count = getLeadCount(opt);
          const isActive = activeFilter === opt;
          
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onFilterChange(opt)}
              className={`
                h-11 md:h-auto px-3.5 md:px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-150 cursor-pointer whitespace-nowrap inline-flex items-center justify-center
                ${isActive
                  ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500 shadow-sm shadow-blue-500/10'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-white'
                }
              `}
            >
              {opt}
              {/* Count bubble in parentheses */}
              <span className={`ml-1.5 text-[10px] font-bold ${
                isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
