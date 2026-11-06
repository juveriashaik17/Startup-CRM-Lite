import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 
 * Manages global authentication session state (user, token, loading state)
 * and coordinates session bootstrap, login, registration, and logout flows.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('crm-token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On initial mount: inspect localStorage for token and restore user profile session
  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem('crm-token');
      if (storedToken) {
        try {
          const res = await authService.getProfile();
          const userData = res.user || res.data?.user;
          if (res.success && userData) {
            setUser(userData);
            setToken(storedToken);
          } else {
            // Invalid response structure: clear stored credentials
            localStorage.removeItem('crm-token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('[AuthContext] Session restoration failed:', error);
          localStorage.removeItem('crm-token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    bootstrapAuth();
  }, []);

  /**
   * Log in user with credentials, save token to localStorage, and update user state.
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success) {
        const userToken = res.token || res.data?.token;
        const userData = res.user || res.data?.user;
        if (userToken && userData) {
          localStorage.setItem('crm-token', userToken);
          setToken(userToken);
          setUser(userData);
          navigate('/');
          return res;
        }
      }
      throw new Error(res.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Register new user, persist token in localStorage, and update state.
   */
  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, email, password);
      if (res.success) {
        const userToken = res.token || res.data?.token;
        const userData = res.user || res.data?.user;
        if (userToken && userData) {
          localStorage.setItem('crm-token', userToken);
          setToken(userToken);
          setUser(userData);
          navigate('/');
          return res;
        }
      }
      throw new Error(res.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Log out user, purge session states from localStorage, and navigate to /login.
   */
  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('crm-token');
    localStorage.removeItem('startup-crm-leads');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const contextValue = useMemo(() => ({
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    setUser,
  }), [user, token, isLoading, login, register, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Custom hook to safely consume authentication context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be invoked within the context of an <AuthProvider> hierarchy.');
  }
  return context;
}

export default AuthContext;
