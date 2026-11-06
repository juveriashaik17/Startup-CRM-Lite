import api from './api';

/**
 * Fetch leads with status, search, and page parameters.
 * 
 * @param {Object} params - Query filters (status, search, page, limit, sortBy, sortOrder)
 * @returns {Promise<Object>} The unwrapped response data containing leads and pagination info
 */
export const getLeads = async (params) => {
  const response = await api.get('/api/leads', { params });
  return response.data;
};

/**
 * Create a new lead.
 * 
 * @param {Object} leadData - Lead attributes
 * @returns {Promise<Object>} The unwrapped response data containing the new lead
 */
export const createLead = async (leadData) => {
  const response = await api.post('/api/leads', leadData);
  return response.data;
};

/**
 * Update an existing lead.
 * 
 * @param {string} id - Lead ID
 * @param {Object} leadData - Updated attributes
 * @returns {Promise<Object>} The unwrapped response data containing the updated lead
 */
export const updateLead = async (id, leadData) => {
  const response = await api.put(`/api/leads/${id}`, leadData);
  return response.data;
};

/**
 * Update the pipeline status of a lead.
 * 
 * @param {string} id - Lead ID
 * @param {string} status - New status stage
 * @returns {Promise<Object>} The unwrapped response data containing the updated lead
 */
export const updateLeadStatus = async (id, status) => {
  const response = await api.patch(`/api/leads/${id}/status`, { status });
  return response.data;
};

/**
 * Delete a lead by ID.
 * 
 * @param {string} id - Lead ID
 * @returns {Promise<Object>} The unwrapped success status response
 */
export const deleteLead = async (id) => {
  const response = await api.delete(`/api/leads/${id}`);
  return response.data;
};

/**
 * Fetch aggregated lead summary stats.
 * 
 * @returns {Promise<Object>} The unwrapped stats overview object
 */
export const getLeadStats = async () => {
  const response = await api.get('/api/leads/stats/summary');
  return response.data;
};

/**
 * Fetch monthly historical leads trend.
 * 
 * @returns {Promise<Object>} The unwrapped monthly stats array
 */
export const getMonthlyStats = async () => {
  const response = await api.get('/api/leads/stats/monthly');
  return response.data;
};

/**
 * Autocomplete search leads by query keyword.
 * 
 * @param {string} q - Search term
 * @param {number} [limit=5] - Maximum number of matching leads to return
 * @returns {Promise<Object>} The unwrapped search results response data
 */
export const searchLeads = async (q, limit = 5) => {
  const response = await api.get('/api/leads/search', { params: { q, limit } });
  return response.data;
};
