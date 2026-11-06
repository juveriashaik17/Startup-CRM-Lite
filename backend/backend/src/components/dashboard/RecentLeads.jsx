import React from 'react';

/**
 * @typedef {Object} Lead
 * @property {string} id - Unique identifier.
 * @property {string} name - Contact person name.
 * @property {string} company - Company name.
 * @property {string} status - Current status stage (e.g. "New", "Won").
 * @property {string} createdAt - ISO date string.
 */

/**
 * @typedef {Object} RecentLeadsProps
 * @property {Lead[]} leads - The complete list of lead records.
 */

/**
 * RecentLeads Component
 * 
 * Extracts and renders the five most recently added leads in a high-density,
 * space-efficient data table. Features dynamic status badging, clean border accents,
 * and high-contrast typography in a premium SaaS design.
 * 
 * Refactored to align with the global LeadContext schema (uses status & createdAt keys).
 * 
 * @param {RecentLeadsProps} props - The component properties.
 * @returns {React.JSX.Element} The Recent Leads table view.
 */
export default function RecentLeads({ leads = [] }) {
  // Sort the leads in descending chronological order using the createdAt ISO date string,
  // then slice the array to get the top 5 most recent lead records.
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  /**
   * Helper utility mapping sales stages to their corresponding premium tailwind classes.
   * Mirrors the coloring established in the global design guidelines.
   * 
   * @param {string} status - The lead status label.
   * @returns {string} The Tailwind CSS classes.
   */
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'New': 
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      case 'Contacted': 
        return 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30';
      case 'Meeting Scheduled': 
        return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'Proposal Sent': 
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Won': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'Lost': 
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      default: 
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  /**
   * Helper utility to extract first characters from name to render
   * a neat Notion-style profile initials avatar.
   * 
   * @param {string} name - The contact's full name.
   * @returns {string} The double-letter initials.
   */
  const getInitials = (name) => {
    if (!name) return 'LD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
      
      {/* Table Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recently Added Leads
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Latest prospects created in the workspace.
          </p>
        </div>
        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
          Showing 5 newest
        </span>
      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="pb-3 pr-4">Lead Info</th>
              <th className="pb-3 px-4">Company</th>
              <th className="pb-3 px-4">Status Stage</th>
              <th className="pb-3 pl-4 text-right">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-xs text-gray-500 dark:text-gray-400">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/30 transition-colors">
                  
                  {/* Lead Info: Profile initials + Contact Name */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {/* Round profile badge containing initials */}
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                        {getInitials(lead.name)}
                      </div>
                      {/* Name label */}
                      <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                        {lead.name}
                      </span>
                    </div>
                  </td>
                  
                  {/* Company Column */}
                  <td className="py-3 px-4 truncate max-w-[100px] sm:max-w-none">
                    {lead.company}
                  </td>
                  
                  {/* Status Stage Badge */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeStyles(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  
                  {/* Date Created Column (Right Aligned) */}
                  <td className="py-3 pl-4 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>

                </tr>
              ))
            ) : (
              /* Table Empty State Fallback */
              <tr>
                <td colSpan="4" className="py-10 text-center text-gray-500 dark:text-gray-400">
                  No lead records found in this workspace.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
