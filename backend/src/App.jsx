import React, { Suspense } from 'react';
// Import BrowserRouter to enable HTML5 history-based client-side routing,
// allowing our page switches to happen instantly without page refreshes.
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import our premium layout components and routing infrastructure
import Sidebar from './components/layout/Sidebar';
import AppRoutes from './routes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeadProvider } from './context/LeadContext';

/**
 * LoadingFallback Component
 * 
 * Renders a premium, Notion/Stripe-inspired loading skeleton placeholder during
 * route transitions. This prevents cumulative layout shifts (CLS) when chunks
 * are being fetched asynchronously.
 */
function LoadingFallback() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse p-2">
      {/* Skeleton header */}
      <div className="space-y-2">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
      {/* Skeleton KPI grid teaser */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200/60 dark:bg-gray-700/60 rounded-2xl border border-gray-200/20 dark:border-gray-700/20"></div>
        ))}
      </div>
      {/* Skeleton primary visual grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-gray-200/60 dark:bg-gray-700/60 rounded-2xl"></div>
        <div className="h-64 bg-gray-200/60 dark:bg-gray-700/60 rounded-2xl"></div>
      </div>
    </div>
  );
}

/**
 * AppContent Component
 * Separated to safely consume the useAuth state hook inside the AuthProvider.
 */
function AppContent() {
  const { token, isLoading } = useAuth();

  // If loading the bootstrap session, show a full screen premium loading spinner
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-400 dark:text-zinc-500 tracking-wider uppercase animate-pulse">
          Syncing workspace...
        </p>
      </div>
    );
  }

  const isAuthenticated = !!token;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200 font-sans antialiased">
      {/* Global toast notification system */}
      <Toaster position="top-right" />

      {/* Persistent Workspace Sidebar: Render only when user is authenticated */}
      {isAuthenticated && <Sidebar />}

      {/* 
        Main Scrollable Page Container:
        - Fills the remaining space (flex-1).
        - Sets up vertical flex-column structure.
        - Manages overflow to ensure individual scroll controls.
        - Adds padding at bottom on mobile to accommodate the fixed bottom nav bar.
      */}
      <main className={`flex-1 flex flex-col min-h-0 overflow-hidden ${isAuthenticated ? 'pb-16 md:pb-0' : ''}`}>
        
        {/* Scrollable inner viewport containing pages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Suspense fallback={<LoadingFallback />}>
              <AppRoutes />
            </Suspense>
          </div>
        </div>

      </main>
    </div>
  );
}

/**
 * App Component
 * 
 * The main application shell. Integrates:
 * 1. Client-side routing context via <BrowserRouter>
 * 2. Session state authentication context via <AuthProvider>
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LeadProvider>
          <AppContent />
        </LeadProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
