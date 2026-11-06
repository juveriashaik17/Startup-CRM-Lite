import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global style sheet containing our Tailwind CSS directives and utilities
import './index.css';
// The main layout shell orchestrating our navigation frame and viewport routing
import App from './App.jsx';

// Import our newly built centralized state context providers.
// LeadProvider controls the CRM leads database (localStorage + CRUD handlers).
// ThemeProvider controls theme states (prefers-color-scheme media queries + HTML class toggles).
import { LeadProvider } from './context/LeadContext';
import { ThemeProvider } from './context/ThemeContext';

// Mount the React virtual DOM at the root HTML placeholder element.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 
      1. LeadProvider (Outer Wrapper): Coordinates CRM lead database changes,
      exposing addLead, updateLead, deleteLead, and useLeads context states.
    */}
    <LeadProvider>
      
      {/* 
        2. ThemeProvider (Inner Wrapper): Manages CSS class additions to 
        document.documentElement to enable global Tailwind dark: selector styles.
      */}
      <ThemeProvider>
        
        {/* Core Workspace Layout App */}
        <App />
        
      </ThemeProvider>
      
    </LeadProvider>
  </StrictMode>,
);
