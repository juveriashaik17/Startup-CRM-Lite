import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global style sheet containing our Tailwind CSS directives and utilities
import './index.css';
// The main layout shell orchestrating our navigation frame and viewport routing
import App from './App.jsx';

// ThemeProvider controls theme states (prefers-color-scheme media queries + HTML class toggles).
import { ThemeProvider } from './context/ThemeContext';

// Mount the React virtual DOM at the root HTML placeholder element.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 
      ThemeProvider: Manages CSS class additions to 
      document.documentElement to enable global Tailwind dark: selector styles.
    */}
    <ThemeProvider>
      {/* Core Workspace Layout App (contains BrowserRouter, AuthProvider, LeadProvider) */}
      <App />
    </ThemeProvider>
  </StrictMode>,
);
