import React, { memo } from 'react';
// Import specific Lucide React icons for the visual actions
import { Pencil, Trash2, Mail, Calendar, User, Briefcase } from 'lucide-react';
// Import the sibling StatusBadge component to display the pipeline stage badge
import StatusBadge from './StatusBadge';

/**
 * @typedef {Object} LeadData
 * @property {string} id - Unique identifier.
 * @property {string} name - Contact person's name.
 * @property {string} company - Company name.
 * @property {string} email - Email address.
 * @property {string} phone - Phone number.
 * @property {number} value - Financial deal value.
 * @property {string} status - Current pipeline status stage (e.g. "New", "Won").
 * @property {string} source - Lead acquisition source.
 * @property {string} createdAt - ISO date string.
 */

/**
 * @typedef {Object} LeadTableProps
 * @property {LeadData[]} leads - The list of lead records to display.
 * @property {(lead: LeadData) => void} onEdit - Callback triggered when the edit button on a row is clicked.
 * @property {(id: string) => void} onDelete - Callback triggered when the delete button on a row is clicked.
 */

/**
 * LeadTable Component
 * 
 * Renders a high-density, space-efficient tabular data grid of all CRM leads.
 * Optimized for desktop viewports. Integrates StatusBadges, deal value cells,
 * and icon action controllers with proper ARIA accessibility cues.
 * 
 * Refactored to align with the global LeadContext schema (uses createdAt key).
 * 
 * @param {LeadTableProps} props - The component properties.
 * @returns {React.JSX.Element} The styled tabular grid of leads.
 */
// ─── Pure module-level helpers (hoisted outside component to avoid re-declaration) ─

/**
 * Formats a raw ISO date string into a readable short-date representation.
 * @param {string} dateString - The ISO date string.
 * @returns {string} Formatted date, or '-' if absent.
 */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Formats a raw number into a USD currency string.
 * @param {number} num - The raw deal value.
 * @returns {string} Formatted currency string.
 */
const formatCurrency = (num) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num || 0);
};

const LeadTable = memo(function LeadTable({ leads = [], onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-200">
      
      {/* Scrollable table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          
          {/* Table Headers */}
          <thead>
            <tr className="bg-slate-50/75 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider select-none">
              <th className="py-3.5 px-4 font-bold">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Contact Name
                </span>
              </th>
              <th className="py-3.5 px-4 font-bold">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Company
                </span>
              </th>
              <th className="py-3.5 px-4 font-bold">Status Stage</th>
              <th className="py-3.5 px-4 font-bold">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Contact Info
                </span>
              </th>
              <th className="py-3.5 px-4 font-bold">Deal Value</th>
              <th className="py-3.5 px-4 font-bold">Source</th>
              <th className="py-3.5 px-4 font-bold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Added
                </span>
              </th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body Rows */}
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-xs text-slate-700 dark:text-zinc-300">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/10 transition-colors group"
                >
                  {/* Column 1: Contact Name (High weight row header) */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-zinc-100">
                    {lead.name}
                  </td>

                  {/* Column 2: Company */}
                  <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-zinc-400">
                    {lead.company}
                  </td>

                  {/* Column 3: Status Badge */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Column 4: Contact Info (Email and optional Phone) */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <a 
                        href={`mailto:${lead.email}`} 
                        className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium"
                      >
                        {lead.email}
                      </a>
                      {lead.phone && (
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 5: Deal Value */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-zinc-200">
                    {formatCurrency(lead.value)}
                  </td>

                  {/* Column 6: Source */}
                  <td className="py-3.5 px-4 font-medium text-slate-500 dark:text-zinc-400">
                    {lead.source}
                  </td>

                  {/* Column 7: Date Added (Uses createdAt key) */}
                  <td className="py-3.5 px-4 text-slate-400 dark:text-zinc-500 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>

                  {/* Column 8: Row Action Controllers (Right Aligned) */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      
                      {/* Pencil Edit button */}
                      <button
                        onClick={() => onEdit(lead)}
                        aria-label={`Edit lead ${lead.name}`}
                        className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Trash Delete button */}
                      <button
                        onClick={() => onDelete(lead.id)}
                        aria-label={`Delete lead ${lead.name}`}
                        className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-rose-950/15 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            ) : (
              /* Table Empty State Row */
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400 dark:text-zinc-500">
                  No lead records found in this workspace.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
});
LeadTable.displayName = 'LeadTable';
export default LeadTable;
