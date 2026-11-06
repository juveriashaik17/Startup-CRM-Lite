import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sampleLeads } from '../data/sampleLeads';

// ============================================================================
// TypeScript-style Type Definitions
// ============================================================================
/**
 * Shape of the Lead object in Startup CRM Lite.
 * 
 * @typedef {Object} Lead
 * @property {string} id - The unique identifier of the lead (UUID or timestamp-based string).
 * @property {string} name - The full name of the primary contact person.
 * @property {string} company - The name of the company or organization.
 * @property {string} email - The primary contact email address.
 * @property {string} phone - The contact phone number.
 * @property {number} value - The quantitative financial value of the deal in USD.
 * @property {'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost'} status - Current pipeline status stage.
 * @property {'Website' | 'Referral' | 'LinkedIn' | 'Cold Call' | 'Email Campaign' | 'Other'} source - Marketing acquisition channel.
 * @property {string} createdAt - The creation date and time of the record in ISO 8601 string format.
 */

/**
 * Shape of the Lead Context value.
 * 
 * @typedef {Object} LeadContextType
 * @property {Lead[]} leads - Array of all lead records in the workspace.
 * @property {(lead: Omit<Lead, 'id' | 'createdAt'>) => void} addLead - Adds a new lead record to the state.
 * @property {(id: string, updatedFields: Partial<Omit<Lead, 'id' | 'createdAt'>>) => void} updateLead - Modifies an existing lead record by ID.
 * @property {(id: string) => void} deleteLead - Removes a lead record by ID.
 * @property {(id: string) => Lead | undefined} getLeadById - Helper to retrieve a single lead record by ID.
 */

// Create the context object with a default null value.
// Null is passed to encourage proper provider usage diagnostics.
const LeadContext = createContext(null);

/**
 * LeadProvider Component
 * 
 * Centralized state wrapper managing the leads database in React state, synchronizing
 * updates with localStorage.
 * 
 * @param {{ children: React.ReactNode }} props - The component children wrappers.
 * @returns {React.JSX.Element} The Context Provider wrapper.
 */
export function LeadProvider({ children }) {
  // Initialize state from localStorage. If empty or corrupt, falls back to the sample leads.
  const [leads, setLeads] = useLocalStorage('startup-crm-leads', sampleLeads);

  /**
   * CREATE: Adds a new lead record to the state.
   * Generates a unique UUID and stamps the current time as createdAt automatically.
   * 
   * @param {Omit<Lead, 'id' | 'createdAt'>} leadPayload - The validated lead details.
   */
  const addLead = useCallback((leadPayload) => {
    // Generate a secure UUID or fall back to date timestamp string if crypto context is unavailable
    const uniqueId = typeof crypto?.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Date.now().toString();
    
    const newLead = {
      ...leadPayload,
      id: uniqueId,
      createdAt: new Date().toISOString()
    };

    setLeads((prevLeads) => [newLead, ...prevLeads]);
  }, [setLeads]);

  /**
   * UPDATE: Modifies an existing lead record by ID.
   * Preserves original creation timestamps and ID.
   * 
   * @param {string} id - The identifier of the lead to update.
   * @param {Partial<Omit<Lead, 'id' | 'createdAt'>>} updatedFields - The fields to modify.
   */
  const updateLead = useCallback((id, updatedFields) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id 
          ? { ...lead, ...updatedFields } 
          : lead
      )
    );
  }, [setLeads]);

  /**
   * DELETE: Removes a lead record by ID.
   * 
   * @param {string} id - The identifier of the lead to remove.
   */
  const deleteLead = useCallback((id) => {
    setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id));
  }, [setLeads]);

  /**
   * READ HELPER: Retrieves a single lead record from the current state.
   * 
   * @param {string} id - The identifier of the lead to locate.
   * @returns {Lead|undefined} The lead record, or undefined if not found.
   */
  const getLeadById = useCallback((id) => {
    return leads.find((lead) => lead.id === id);
  }, [leads]);

  // Memoize context value to avoid re-renders on every consumer component
  const contextValue = useMemo(() => ({
    leads,
    addLead,
    updateLead,
    deleteLead,
    getLeadById
  }), [leads, addLead, updateLead, deleteLead, getLeadById]);

  return (
    <LeadContext.Provider value={contextValue}>
      {children}
    </LeadContext.Provider>
  );
}

/**
 * useLeads Custom Hook
 * 
 * Provides components with direct access to the Lead Management state.
 * Employs proper error boundary diagnostics to warn if consumed outside of its Provider.
 * 
 * @returns {LeadContextType} The lead management context methods and states.
 * @throws {Error} Architectural error if used outside a LeadProvider.
 */
export function useLeads() {
  const context = useContext(LeadContext);
  
  if (!context) {
    throw new Error(
      'useLeads must be invoked within the context of a <LeadProvider> hierarchy. ' +
      'Please verify that the component is wrapped properly in src/main.jsx.'
    );
  }
  
  return context;
}
