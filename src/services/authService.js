import api from './api';

/**
 * Register a new user account.
 * 
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} The unwrapped response data containing token and user
 */
export const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data;
};

/**
 * Log in an existing user.
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} The unwrapped response data containing token and user
 */
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

/**
 * Clear the session token from local storage (stateless logout).
 */
export const logout = () => {
  localStorage.removeItem('crm-token');
};

/**
 * Fetch the authenticated user's profile.
 * 
 * @returns {Promise<Object>} The unwrapped profile response data
 */
export const getProfile = async () => {
  const response = await api.get('/api/auth/profile');
  return response.data;
};

/**
 * Update the authenticated user's profile details.
 * 
 * @param {Object} data - Contains fields to update (name, oldPassword, password)
 * @returns {Promise<Object>} The unwrapped update response data
 */
export const updateProfile = async (data) => {
  const response = await api.put('/api/auth/profile', data);
  return response.data;
};
