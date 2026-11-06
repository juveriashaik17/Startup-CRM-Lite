import React, { Suspense } from 'react';
// Import BrowserRouter to enable HTML5 history-based client-side routing,
// allowing our page switches to happen instantly without page refreshes.
import { BrowserRouter } from 'react-router-dom';

// Import our premium layout components and routing infrastructure
import Sidebar from './components/layout/Sidebar';
import AppRoutes from './routes';

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
 * App Component
 * 
 * The main application shell. Integrates:
 * 1. Client-side routing context via <BrowserRouter>
 * 2. Layout structure placing the <Sidebar> and dynamic scrollable page frame side-by-side
 * 3. Lazy loading execution wrapped in a smart <Suspense> boundary
 */
function App() {
  return (
    // Wrap the entire application in BrowserRouter to provide routing state.
    <BrowserRouter>
      {/* 
        Unified Workspace Shell Layout:
        - On desktop, places Sidebar and Main Content side-by-side (flex-row, min-h-screen).
        - On mobile, stacks them vertically (flex-col).
        - Smooth transition for theme colors.
      */}
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200 font-sans antialiased">
        
        {/* Persistent Workspace Sidebar */}
        <Sidebar />

        {/* 
          Main Scrollable Page Container:
          - Fills the remaining space (flex-1).
          - Sets up vertical flex-column structure.
          - Manages overflow to ensure individual scroll controls.
          - Adds padding at bottom on mobile to accommodate the fixed bottom nav bar.
        */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden pb-16 md:pb-0">
          
          {/* Scrollable inner viewport containing pages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {/* 
                Suspense Boundary:
                React.lazy components must be wrapped in a <Suspense> container.
                If a user clicks a route and the JS chunk for that page hasn't
                loaded yet, React will display the LoadingFallback component,
                replacing it instantly once the asset completes loading.
              */}
              <Suspense fallback={<LoadingFallback />}>
                <AppRoutes />
              </Suspense>
            </div>
          </div>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;
