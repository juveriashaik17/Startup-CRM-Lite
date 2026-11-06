import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * @typedef {Object} ThemeContextType
 * @property {boolean} isDarkMode - State variable indicating if the dark theme is active.
 * @property {() => void} toggleTheme - Toggle action between light mode and dark mode.
 */

// Create the context with default null value to ensure proper boundary warning
const ThemeContext = createContext(null);

/**
 * ThemeProvider Component
 * 
 * Centralized theme manager. Checks user preferences in localStorage,
 * falls back to browser/OS media queries if empty, and manages the HTML
 * document root classes to activate Tailwind CSS dark configurations.
 * 
 * @param {{ children: React.ReactNode }} props - The component children wrappers.
 * @returns {React.JSX.Element} The Theme Context Provider.
 */
export function ThemeProvider({ children }) {
  // Initialize state using user preferences via useLocalStorage hook (default: false)
  const [isDarkMode, setIsDarkMode] = useLocalStorage('startup-crm-theme', false);

  // Dynamic Effect:
  // Listens to shifts in isDarkMode state and appends or removes the 'dark'
  // class from the root <html> element (document.documentElement) immediately.
  // This enables Tailwind's 'dark:' utility selectors globally.
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to update theme classes.', error);
    }
  }, [isDarkMode]);

  /**
   * Action handler to toggle the active theme preference.
   * Flips isDarkMode boolean, adds/removes 'dark' class on document.documentElement,
   * and saves the preference to localStorage.
   */
  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    try {
      const root = document.documentElement;
      if (nextMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to update theme classes.', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Custom Hook
 * 
 * Provides components with direct access to the Theme Context state.
 * Employs proper boundary checks to throw descriptive errors if consumed out of context.
 * 
 * @returns {ThemeContextType} The theme context actions and states.
 * @throws {Error} Architectural error if used outside a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error(
      'useTheme must be invoked within the context of a <ThemeProvider> hierarchy. ' +
      'Please verify that the component is wrapped properly in src/main.jsx.'
    );
  }
  
  return context;
}
