import React, { useState, useEffect } from 'react';
// Import specific Lucide React icons for toolbar controls and view toggles
import { Plus, LayoutGrid, Table, X } from 'lucide-react';
// Import toast and Toaster from react-hot-toast for notification alerts
import { Toaster } from 'react-hot-toast';

// Import our custom global useLeads context hook
import { useLeads } from '../context/LeadContext';

// Import our modular leads components
import LeadForm from '../components/leads/LeadForm';
import LeadCard from '../components/leads/LeadCard';
import LeadTable from '../components/leads/LeadTable';

// Import our common components for search, filter, and empty states
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import EmptyState from '../components/common/EmptyState';

/**
 * Leads Page Component
 * 
 * The main control panel for CRM Lead management.
 * Refactored to delegate state management and CRUD operations (Create, Read, Update, Delete)
 * to the global LeadContext via the useLeads hook. Focuses on orchestrating toolbar states,
 * filters, search queries, modals, and notification feedback.
 * 
 * @returns {React.JSX.Element} The operational Lead Management directory.
 */
export default function Leads() {
  // Consume leads array and CRUD transactions from centralized LeadContext
  const { leads, addLead, updateLead, deleteLead, fetchLeads } = useLeads();

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ============================================================================
  // UI Layout & Filtering States (Managed Locally)
  // ============================================================================
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null); // stores lead being edited, or null for create mode

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Keyboard accessibility hook: close modal overlay instantly on hitting "Escape" key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // ============================================================================
  // Derived Variable Filtering Engine (React Best Practice)
  // ============================================================================
  // Filters the global leads array dynamically using memoized logical matches.
  const safeLeads = Array.isArray(leads) ? leads : [];
  const query = (searchQuery || '').toLowerCase();
  const filteredLeads = safeLeads
    .filter((lead) => activeFilter === 'All' || lead?.status === activeFilter)
    .filter((lead) =>
      (lead?.name || '').toLowerCase().includes(query) ||
      (lead?.company || '').toLowerCase().includes(query) ||
      (lead?.email || '').toLowerCase().includes(query)
    );

  /**
   * Action handler to clear all search fields and active filters at once.
   * Linked directly to the EmptyState fallback button.
   */
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilter('All');
  };

  // ============================================================================
  // CRUD Action Handlers (Delegated to LeadContext)
  // ============================================================================

  /**
   * Triggers the Modal in Create Mode
   */
  const handleAddClick = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  /**
   * Triggers the Modal in Edit Mode
   * 
   * @param {Object} lead - The lead item being edited.
   */
  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  /**
   * Closes the Modal and resets selection
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  /**
   * Executes Create or Update transactions by delegating payloads to Context API providers.
   * Renders semantic green success notification banners via react-hot-toast.
   * 
   * @param {Object} formData - The validated payload from LeadForm.
   */
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedLead) {
        // UPDATE FLOW: delegate to context updateLead method by matching selection ID
        await updateLead(selectedLead.id, formData);
      } else {
        // CREATE FLOW: delegate to context addLead method.
        await addLead(formData);
      }
      closeModal();
    } catch (err) {
      console.error('[Leads] Submit failed:', err);
    }
  };

  /**
   * Executes Delete transactions by delegating lead ID to Context API provider.
   * 
   * @param {string} id - The lead identifier to delete.
   */
  const handleDeleteLead = async (id) => {
    const leadToDelete = leads.find((l) => l.id === id || l._id === id);
    if (!leadToDelete) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete the lead "${leadToDelete.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      // Delegate to context deleteLead method
      await deleteLead(id);
    } catch (err) {
      console.error('[Leads] Delete failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* React Hot Toaster component container to render active banners */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Leads Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Manage your sales prospects, update pipeline statuses, and record deal values.
          </p>
        </div>
        
        {/* Add Lead Trigger button - full-width h-11 on mobile, auto-width on desktop/tablet */}
        <button
          onClick={handleAddClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 h-11 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-md shadow-blue-500/10 dark:shadow-none transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Lead
        </button>
      </div>

      {/* Toolbar: Search, Filters, and Layout View Toggles */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-all duration-150">
        
        {/* Left Toolbar side: Controlled, debounced SearchBar */}
        <div className="w-full md:w-80">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Right Toolbar side: Horizontal scrolling FilterBar & mode toggles */}
        <div className="flex w-full md:w-auto items-center gap-3 justify-between md:justify-end overflow-hidden">
          
          {/* Dynamic FilterBar containing stage counts calculated directly from Context leads */}
          <div className="flex-1 md:flex-initial min-w-0">
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              leads={leads}
            />
          </div>

          {/* Vertical divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-zinc-800" />

          {/* Layout View Mode Toggle Buttons - Only visible on Tablet (md:flex lg:hidden), hidden on Mobile (hidden) and Desktop (lg:hidden) */}
          <div className="hidden md:flex lg:hidden items-center bg-slate-50 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 flex-shrink-0">
            {/* Table View controller - touch friendly w-11 h-11 */}
            <button
              onClick={() => setViewMode('table')}
              aria-label="Toggle Table View"
              className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <Table className="w-5 h-5" />
            </button>
            
            {/* Card View controller - touch friendly w-11 h-11 */}
            <button
              onClick={() => setViewMode('card')}
              aria-label="Toggle Card View"
              className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>

      {/* Main Viewport: Conditionally render layouts according to breakpoint requirements */}
      <div className="transition-all duration-200">
        {/* 1. Mobile view container - Card-only view format */}
        <div className="block md:hidden">
          {filteredLeads.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteLead}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              totalLeadsCount={leads.length}
              onClear={handleClearFilters}
            />
          )}
        </div>

        {/* 2. Tablet view container - Hybrid toggle view between table and 2-column cards */}
        <div className="hidden md:block lg:hidden">
          {filteredLeads.length > 0 ? (
            viewMode === 'table' ? (
              <LeadTable
                leads={filteredLeads}
                onEdit={handleEditClick}
                onDelete={handleDeleteLead}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteLead}
                  />
                ))}
              </div>
            )
          ) : (
            <EmptyState
              totalLeadsCount={leads.length}
              onClear={handleClearFilters}
            />
          )}
        </div>

        {/* 3. Desktop view container - Full table view with all columns */}
        <div className="hidden lg:block">
          {filteredLeads.length > 0 ? (
            <LeadTable
              leads={filteredLeads}
              onEdit={handleEditClick}
              onDelete={handleDeleteLead}
            />
          ) : (
            <EmptyState
              totalLeadsCount={leads.length}
              onClear={handleClearFilters}
            />
          )}
        </div>
      </div>

      {/* CRUD Overlay Modal Dialog (Form Modal) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Blur-backdrop overlay backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />
          
          {/* Modal Card container: full screen on mobile, centered max-w-lg on tablet+ */}
          <div className="relative w-full h-full md:h-auto max-h-full md:max-h-[90vh] p-6 bg-white dark:bg-zinc-900 border-0 md:border border-slate-200 dark:border-zinc-800 rounded-none md:rounded-3xl shadow-2xl z-10 transform scale-100 transition-all duration-300 overflow-y-auto md:max-w-lg">
            
            {/* Modal Header bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80 mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  {selectedLead ? `Edit Prospect details` : 'Add New Pipeline Prospect'}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                  {selectedLead ? `Modifying records for ${selectedLead.name}` : 'Fill in the information to register a new lead.'}
                </p>
              </div>
              
              {/* Close Icon button - 44x44px target on mobile */}
              <button 
                onClick={closeModal}
                aria-label="Close modal"
                className="w-11 h-11 flex items-center justify-center md:w-8 md:h-8 md:p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>

            {/* Embed LeadForm component */}
            <LeadForm
              initialData={selectedLead}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />

          </div>
        </div>
      )}

    </div>
  );
}
