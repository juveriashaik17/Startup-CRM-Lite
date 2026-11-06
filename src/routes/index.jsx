import React, { lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Guards private routes by ensuring the user has a valid authentication session/token.
 * Redirects to /login if unauthenticated.
 */
function ProtectedRoute() {
  const { token, isLoading } = useAuth();
  
  if (isLoading) {
    return null;
  }

  if (!token) {
    // Redirect unauthenticated visitors to login
    return <Navigate to="/login" replace />;
  }

  // Render child routes
  return <Outlet />;
}

// ============================================================================
// Lazy-Loaded Page Components
// ============================================================================
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));

/**
 * AppRoutes Component
 * Sets up routing paths for the application, organizing public vs protected routes.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Authentication Routes ─────────────────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Protected Workspace Routes ────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard index route */}
        <Route path="/" element={<Dashboard />} />
        {/* Leads Kanban/list manager */}
        <Route path="/leads" element={<Leads />} />
        {/* Analytics reports & trends */}
        <Route path="/analytics" element={<Analytics />} />
      </Route>

      {/* ── Wildcard Fallback 404 Route ────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
