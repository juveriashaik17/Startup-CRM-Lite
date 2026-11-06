import React, { memo, useMemo } from 'react';
// Import specific, high-fidelity Lucide React icons to provide strong visual indicators
// for each quick action button.
import { Plus, ListFilter, Download } from 'lucide-react';

/**
 * @typedef {Object} QuickActionsProps
 * @property {() => void} [onAddLead] - Callback function triggered when "Add New Lead" is clicked.
 * @property {() => void} [onViewAll] - Callback function triggered when "View All Leads" is clicked.
 * @property {() => void} [onExport] - Callback function triggered when "Export Data" is clicked.
 */

/**
 * QuickActions Component
 * 
 * Provides a dedicated dashboard panel containing primary workspace operations
 * (Create Lead, View Table, Export CSV) with descriptive descriptions and interactive buttons.
 * 
 * @param {QuickActionsProps} props - The component properties.
 * @returns {React.JSX.Element} The Quick Actions panel view.
 */
const QuickActions = memo(function QuickActions({ onAddLead, onViewAll, onExport }) {
  // Memoize the actions config so it is only rebuilt when a callback prop actually changes,
  // not on every parent re-render.
  const actions = useMemo(() => [
    {
      title: 'Add New Lead',
      description: 'Create a new prospect in the CRM pipeline.',
      icon: Plus,
      colorClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/10 dark:shadow-none',
      iconColor: 'text-white',
      onClick: onAddLead || (() => alert('Add Lead trigger - Real implementation comes in Phase 8'))
    },
    {
      title: 'View All Leads',
      description: 'Filter and search the complete database.',
      icon: ListFilter,
      colorClass: 'bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-650 text-gray-900 dark:text-white',
      iconColor: 'text-gray-500 dark:text-gray-400',
      onClick: onViewAll || (() => alert('Navigation trigger - Click "Leads" in the sidebar menu'))
    },
    {
      title: 'Export Workspace Data',
      description: 'Download the leads records as a CSV file.',
      icon: Download,
      colorClass: 'bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 text-gray-900 dark:text-white',
      iconColor: 'text-gray-500 dark:text-gray-400',
      onClick: onExport || (() => alert('Export trigger - CSV generation will run'))
    }
  ], [onAddLead, onViewAll, onExport]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col justify-between h-full">
      
      {/* Widget Title Section */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Quick Operations
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Execute common sales actions instantly from this workspace.
        </p>
      </div>

      {/* Operations List Stack */}
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.title}
              onClick={action.onClick}
              aria-label={action.title}
              className={`w-full flex items-start gap-3.5 p-3 rounded-xl text-left transition-all duration-150 group cursor-pointer ${action.colorClass}`}
            >
              {/* Icon round backdrop wrapper */}
              <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/5 flex-shrink-0 group-hover:scale-105 transition-transform ${action.iconColor}`}>
                <IconComponent className="w-4 h-4" aria-hidden="true" />
              </div>
              
              {/* Text metadata */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-none mb-1">
                  {action.title}
                </span>
                <span className="text-[10px] opacity-80 leading-snug truncate">
                  {action.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer System Diagnostics status tag */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-5 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
        <span>System Status: Online</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-label="System online" />
      </div>

    </div>
  );
});

QuickActions.displayName = 'QuickActions';
export default QuickActions;
