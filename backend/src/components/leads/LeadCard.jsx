import React from 'react';
// Import specific Lucide React icons for the visual elements and operations
import { Pencil, Trash2, Mail, Phone, Building } from 'lucide-react';
// Import the sibling StatusBadge component to display the pipeline stage badge
import StatusBadge from './StatusBadge';

/**
 * @typedef {Object} LeadData
 * @property {number|string} id - Unique identifier.
 * @property {string} name - Contact person's name.
 * @property {string} company - Company name.
 * @property {string} email - Email address.
 * @property {string} phone - Phone number.
 * @property {number} value - Financial deal value.
 * @property {string} status - Current pipeline stage (e.g. "New", "Won").
 * @property {string} source - Lead acquisition source.
 * @property {string} dateAdded - Date created.
 */

/**
 * @typedef {Object} LeadCardProps
 * @property {LeadData} lead - The individual lead data object.
 * @property {(lead: LeadData) => void} onEdit - Callback triggered when the edit button is clicked.
 * @property {(id: number|string) => void} onDelete - Callback triggered when the delete button is clicked.
 */

/**
 * LeadCard Component
 * 
 * Renders a visual representation of a single Lead record in a card layout.
 * Optimized for mobile stacks and grid arrangements. Houses contact detail metadata, 
 * deal value headers, status badges, and action triggers.
 * 
 * @param {LeadCardProps} props - The component properties.
 * @returns {React.JSX.Element} The styled lead card.
 */
export default function LeadCard({ lead, onEdit, onDelete }) {
  
  // Format the deal value as currency for clean display in the card header
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(lead.value || 0);

  /**
   * Helper utility to extract initials from the contact's name.
   * Renders a clean Notion-style avatar circle.
   */
  const getInitials = (fullName) => {
    if (!fullName) return 'LD';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between h-full relative group">
      
      {/* 1. Header Portion: Initials Avatar + Name & Company + Deal Value */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Initials profile badge */}
            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white flex-shrink-0">
              {getInitials(lead.name)}
            </div>
            
            {/* Name and company labels */}
            <div className="flex flex-col min-w-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {lead.name}
              </h4>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                <Building className="w-3 h-3 flex-shrink-0" />
                {lead.company}
              </span>
            </div>
          </div>

          {/* Deal Value label displayed in high-contrast styling */}
          <div className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 whitespace-nowrap">
            {formattedValue}
          </div>
        </div>

        {/* 2. Middle Section: Status badge & Marketing Source */}
        <div className="flex items-center justify-between gap-2 mb-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Sibling StatusBadge component */}
          <StatusBadge status={lead.status} />
          
          {/* Marketing Source Label */}
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
            Source: {lead.source}
          </span>
        </div>

        {/* 3. Details Section: Accessible contact metadata */}
        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
          
          {/* Email Row */}
          <div className="flex items-center gap-2.5 truncate" title={lead.email}>
            <Mail className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <a href={`mailto:${lead.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate">
              {lead.email}
            </a>
          </div>
          
          {/* Phone Row */}
          {lead.phone && (
            <div className="flex items-center gap-2.5 truncate">
              <Phone className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <a href={`tel:${lead.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                {lead.phone}
              </a>
            </div>
          )}

        </div>
      </div>

      {/* 4. Actions Row: Edit and Delete buttons (Visible on hover on desktop, always on mobile) */}
      <div className="flex justify-end items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-5">
        
        {/* Edit Button (Pencil Icon) - 44x44px touch target on mobile */}
        <button
          onClick={() => onEdit(lead)}
          aria-label={`Edit lead ${lead.name}`}
          className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all cursor-pointer"
        >
          <Pencil className="w-4 h-4 md:w-3.5 md:h-3.5" />
        </button>

        {/* Delete Button (Trash Icon) - 44x44px touch target on mobile */}
        <button
          onClick={() => onDelete(lead.id)}
          aria-label={`Delete lead ${lead.name}`}
          className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
        </button>

      </div>

    </div>
  );
}
