import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// ============================================================================
// Lazy-Loaded Page Components
// ============================================================================
// By using React.lazy and dynamic imports, Vite will automatically bundle these
// pages into separate JavaScript chunks. These chunks are only loaded over the
// network when the user navigates to the respective path, significantly reducing
// the initial load time and improving Core Web Vitals (like Largest Contentful Paint).

// Dashboard page lazy loaded from the pages directory
const Dashboard = lazy(() => import('../pages/Dashboard'));

// Lead Management page lazy loaded from the pages directory
const Leads = lazy(() => import('../pages/Leads'));

// Analytics page lazy loaded from the pages directory
const Analytics = lazy(() => import('../pages/Analytics'));

// NotFound (404) fallback page lazy loaded from the pages directory
const NotFound = lazy(() => import('../pages/NotFound'));

/**
 * AppRoutes Component
 * 
 * This component defines the routing architecture of our CRM application.
 * Because these routes are lazy-loaded, they must be rendered inside a parent
 * <Suspense> boundary that displays a loading indicator while the chunk is fetched.
 * 
 * @returns {React.JSX.Element} The router switch configuration
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* 
        1. Dashboard Page: The default home landing page of the CRM dashboard.
        Mapped directly to the root path "/".
      */}
      <Route path="/" element={<Dashboard />} />

      {/* 
        2. Lead Management Page: High-density list/Kanban interface to manage CRM leads.
        Mapped to "/leads".
      */}
      <Route path="/leads" element={<Leads />} />

      {/* 
        3. Analytics Page: Business metrics, conversion rates, and Recharts visualization.
        Mapped to "/analytics".
      */}
      <Route path="/analytics" element={<Analytics />} />

      {/* 
        4. Fallback 404 Page: Matches any path not explicitly defined above.
        Using the wildcard "*" routing pattern, this catches invalid URLs and
        displays our custom NotFound view.
      */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
