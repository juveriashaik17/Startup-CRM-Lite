import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import * as leadService from '../services/leadService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sampleLeads } from '../data/sampleLeads';

export const LeadContext = createContext(null);

/**
 * LeadProvider Component
 * 
 * Manages lead state, pagination, and backend database integration via Axios services.
 * Defensively guards against null values and empty arrays to prevent frontend runtime crashes.
 * Automatically synchronizes with backend when authenticated and falls back to sampleLeads for demo mode.
 */
export function LeadProvider({ children }) {
  const [leads, setLeads] = useLocalStorage('startup-crm-leads', sampleLeads);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: Array.isArray(leads) ? leads.length : 0,
    page: 1,
    limit: 20,
    pages: Math.max(1, Math.ceil((Array.isArray(leads) ? leads.length : 0) / 20)),
  });

  /**
   * Helper function to normalize _id and id for component compatibility.
   */
  const mapLeadId = (lead) => {
    if (!lead || typeof lead !== 'object') return null;
    const rawId = lead._id || lead.id || String(Math.random());
    const id = String(rawId);
    return {
      ...lead,
      _id: id,
      id,
    };
  };

  /**
   * READ: Fetch all leads belonging to authenticated user from database.
   * If user is unauthenticated or backend is offline, retains local sample leads.
   * 
   * @param {Object} params - Query filters (status, search, page, limit)
   */
  const fetchLeads = useCallback(async (params) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crm-token') : null;
    if (!token) {
      // User is viewing the dashboard in local/demo mode with sample leads
      return;
    }

    setIsLoading(true);
    try {
      const res = await leadService.getLeads(params);
      if (res && res.success) {
        const rawList = Array.isArray(res.data) ? res.data : (res.data?.leads || []);
        const mappedLeads = rawList.map(mapLeadId).filter(Boolean);
        setLeads(mappedLeads);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.warn('[LeadContext] Backend fetch unavailable, using local state:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setLeads]);

  // Automatically fetch fresh leads when component mounts with valid auth token
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crm-token') : null;
    if (token) {
      fetchLeads();
    }
  }, [fetchLeads]);

  /**
   * CREATE: Adds a new lead to database (if authenticated) and updates state.
   * Falls back to client-side creation for offline/demo mode.
   * 
   * @param {Object} leadPayload - Lead details (name, company, email, value, status, etc.)
   */
  const addLead = useCallback(async (leadPayload) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crm-token') : null;
    if (token) {
      try {
        const res = await leadService.createLead(leadPayload);
        if (res && res.success && res.data) {
          const newLead = mapLeadId(res.data);
          if (newLead) {
            setLeads((prevLeads) => [newLead, ...(Array.isArray(prevLeads) ? prevLeads : [])]);
          }
          toast.success(res.message || 'Lead created successfully');
          return newLead;
        }
      } catch (error) {
        console.error('[LeadContext] Backend create failed:', error);
        const errMsg = error.response?.data?.message ||
          (error.response?.data?.errors && error.response.data.errors[0]?.message) ||
          'Failed to create lead on server';
        toast.error(errMsg);
        throw error;
      }
    }

    // Local creation fallback (works offline or in demo mode)
    const uniqueId = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `lead-${Date.now()}`;
    const newLead = {
      ...leadPayload,
      id: uniqueId,
      _id: uniqueId,
      createdAt: new Date().toISOString(),
    };
    setLeads((prevLeads) => [newLead, ...(Array.isArray(prevLeads) ? prevLeads : [])]);
    toast.success('Lead created successfully');
    return newLead;
  }, [setLeads]);

  /**
   * UPDATE: Updates an existing lead in database and updates state.
   * 
   * @param {string} id - Lead ID
   * @param {Object} updatedFields - Fields to update
   */
  const updateLead = useCallback(async (id, updatedFields) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crm-token') : null;
    if (token) {
      try {
        const res = await leadService.updateLead(id, updatedFields);
        if (res && res.success && res.data) {
          const updatedLead = mapLeadId(res.data);
          setLeads((prevLeads) =>
            (Array.isArray(prevLeads) ? prevLeads : []).map((lead) =>
              lead._id === id || lead.id === id ? updatedLead : lead
            )
          );
          toast.success(res.message || 'Lead updated successfully');
          return updatedLead;
        }
      } catch (error) {
        console.error('[LeadContext] Backend update failed:', error);
        const errMsg = error.response?.data?.message ||
          (error.response?.data?.errors && error.response.data.errors[0]?.message) ||
          'Failed to update lead on server';
        toast.error(errMsg);
        throw error;
      }
    }

    setLeads((prevLeads) =>
      (Array.isArray(prevLeads) ? prevLeads : []).map((lead) =>
        lead._id === id || lead.id === id ? { ...lead, ...updatedFields } : lead
      )
    );
    toast.success('Lead updated successfully');
  }, [setLeads]);

  /**
   * UPDATE STATUS: Fast patch of pipeline stage.
   * 
   * @param {string} id - Lead ID
   * @param {string} status - New pipeline status stage
   */
  const updateLeadStatus = useCallback(async (id, status) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crm-token') : null;
    if (token) {
      try {
        const res = await leadService.updateLeadStatus(id, status);
        if (res && res.success && res.data) {
          const updatedLead = mapLeadId(res.data);
          setLeads((prevLeads) =>
            (Array.isArray(prevLeads) ? prevLeads : []).map((lead) =>
              lead._id === id || lead.id === id ? updatedLead : lead
            )
          );
          toast.success(res.message || 'Lead status updated');
          return updatedLead;
        }
      } catch (error) {
        console.error('[LeadContext] Backend status update failed:', error);
        const errMsg = error.response?.data?.message || 'Failed to update lead status';
        toast.error(errMsg);
        throw error;
      }
    }

    setLeads((prevLeads) =>
      (Array.isArray(prevLeads) ? prevLeads : []).map((lead) =>
        lead._id === id || lead.id === id ? { ...lead, status } : lead
      )
    );
    toast.success('Lead status updated');
  }, [setLeads]);

  /**
   * DELETE: Removes a lead from database and updates state.
   * 
   * @param {string} id - Lead ID
   */
  const deleteLead = useCallback(async (id) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crm-token') : null;
    if (token) {
      try {
        await leadService.deleteLead(id);
      } catch (error) {
        console.error('[LeadContext] Backend delete failed:', error);
        const errMsg = error.response?.data?.message || 'Failed to delete lead from server';
        toast.error(errMsg);
        throw error;
      }
    }

    setLeads((prevLeads) =>
      (Array.isArray(prevLeads) ? prevLeads : []).filter((lead) => lead._id !== id && lead.id !== id)
    );
    toast.success('Lead deleted successfully');
  }, [setLeads]);

  /**
   * READ SINGLE HELPER: Locate lead by ID from state.
   */
  const getLeadById = useCallback((id) => {
    return (Array.isArray(leads) ? leads : []).find((lead) => lead._id === id || lead.id === id);
  }, [leads]);

  const contextValue = useMemo(() => ({
    leads: Array.isArray(leads) ? leads : [],
    isLoading,
    pagination,
    fetchLeads,
    addLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
    getLeadById,
  }), [leads, isLoading, pagination, fetchLeads, addLead, updateLead, updateLeadStatus, deleteLead, getLeadById]);

  return (
    <LeadContext.Provider value={contextValue}>
      {children}
    </LeadContext.Provider>
  );
}

/**
 * useLeads Hook
 * Custom hook to safely consume leads context.
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be invoked within the context of a <LeadProvider> hierarchy.');
  }
  return context;
}

export default LeadContext;
