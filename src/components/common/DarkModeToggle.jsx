import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * DarkModeToggle Component
 * 
 * A premium theme toggle switch designed to transition smoothly between dark and light modes.
 * Displays sun/moon icons and the textual representation of the current theme mode on desktop views.
 * 
 * @returns {React.JSX.Element} The styled dark mode toggle switch.
 */
export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex items-center justify-center lg:justify-start gap-2 h-11 w-11 lg:w-auto lg:h-auto p-2.5 lg:px-3 lg:py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 cursor-pointer group shadow-sm focus:outline-none"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Animated Toggle Switch Track */}
      <div className="relative w-8 h-4.5 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out">
        {/* Sliding Toggle Pill containing respective visual icons */}
        <div
          className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-gray-900 transition-transform duration-200 ease-in-out flex items-center justify-center shadow-sm ${
            isDarkMode ? 'translate-x-3.5' : 'translate-x-0'
          }`}
        >
          {isDarkMode ? (
            <Moon className="w-2.5 h-2.5 text-blue-400 fill-blue-400" />
          ) : (
            <Sun className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
          )}
        </div>
      </div>
      
      {/* Current Theme Text Label - Visible on desktop, hidden on mobile */}
      <span className="hidden lg:inline-block text-[10px] font-bold tracking-wide uppercase select-none transition-colors text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white">
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
