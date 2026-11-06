import React, { useState, useEffect } from 'react';
// Import specific Lucide React icons for search visual indicators
import { Search, X } from 'lucide-react';

/**
 * @typedef {Object} SearchBarProps
 * @property {string} value - The parent-managed search query string (used for syncing/clearing).
 * @property {(debouncedVal: string) => void} onChange - Parent callback invoked with the debounced search value.
 */

/**
 * SearchBar Component
 * 
 * An optimized, accessible, and debounced search input component.
 * Maintains a local input state for instantaneous typing response while executing
 * a 300ms debounce timer before pushing the search term up to the parent.
 * This protects rendering performance by preventing filter operations on every keystroke.
 * 
 * @param {SearchBarProps} props - The component properties.
 * @returns {React.JSX.Element} The debounced search bar element.
 */
export default function SearchBar({ value, onChange }) {
  // Local state to hold the immediate keyboard value before the debounce timer fires
  const [inputValue, setInputValue] = useState(value);

  // Synchronize the local input state with the parent value prop.
  // This ensures that when the parent resets the search query externally (e.g. clicking "Clear Filters"),
  // the input box is cleared immediately.
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debouncing Effect:
  // Each time the local inputValue changes, we set a timeout to run onChange after 300ms.
  // If the user types another character before 300ms, the cleanup function runs,
  // clearing the previous timeout and scheduling a new one.
  useEffect(() => {
    const timer = setTimeout(() => {
      // Avoid calling parent update if the value matches the active parent state
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, 300);

    // Cleanup: clear the active timeout when inputValue changes or component unmounts
    return () => clearTimeout(timer);
  }, [inputValue, onChange, value]);

  /**
   * Action handler to clear the search bar immediately.
   * Resets local input state and immediately fires parent callback with an empty string.
   */
  const handleClearClick = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <div className="relative w-full">
      {/* Search Magnifying Glass Icon (Aesthetic visual cue) */}
      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500 dark:text-gray-400">
        <Search className="w-4 h-4" />
      </span>

      {/* Controlled Search Input Field */}
      <input
        type="text"
        aria-label="Search leads by name, company, or email"
        placeholder="Search by name, company, or email..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
      />

      {/* Clear Button (Shown only when there is active text in the field) */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClearClick}
          aria-label="Clear search input"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-150 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
