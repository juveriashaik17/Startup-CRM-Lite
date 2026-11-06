import axios from 'axios';
import toast from 'react-hot-toast';

const rawBaseUrl = import.meta.env.VITE_API_URL;
const baseURL = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : '';

// Create an Axios instance
const api = axios.create({
  baseURL,
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm-token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      // Clear token and redirect to /login
      localStorage.removeItem('crm-token');
      
      // Prevent infinite redirect loops if we are already on login/register page
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    } else if (!response) {
      // Network error (no response received from the server)
      toast.error('Cannot connect to server. Check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;
