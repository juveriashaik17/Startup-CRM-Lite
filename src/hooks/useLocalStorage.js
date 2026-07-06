import { useState, useCallback } from 'react';

/**
 * Module-level storage availability check.
 * Evaluated once when the module is first imported — not on every hook call.
 * This avoids redundant localStorage probe writes on every render cycle.
 */
const isStorageAvailable = (() => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
})();

/**
 * Custom React hook to manage state synchronized with localStorage.
 * 
 * Provides an API identical to `useState`, but persists the state to
 * localStorage and handles edge cases such as private browsing mode, disabled
 * cookies, serialization errors, and lazy state initialization.
 * 
 * @template T
 * @param {string} key - The key under which the value is stored in localStorage.
 * @param {T | (() => T)} initialValue - The fallback value if no value exists in localStorage, or a function that returns the fallback.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A stateful value and a function to update it.
 */
export function useLocalStorage(key, initialValue) {
  // Initialize storedValue with the item from localStorage if available,
  // otherwise fallback to the initialValue parameter (evaluating if it is a function).
  const [storedValue, setStoredValue] = useState(() => {
    if (isStorageAvailable) {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          return JSON.parse(item);
        }
      } catch (error) {
        console.error(`[useLocalStorage] Error parsing JSON for key "${key}":`, error);
        // Fall back to initial value on parse error
      }
    }
    
    // Evaluate initialValue if it's a function (similar to lazy initialization in useState)
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  // Return a state updater function that persists updates to localStorage.
  // Uses functional updates inside setStoredValue to avoid dependency on storedValue,
  // ensuring the identity of setValue is stable across renders.
  const setValue = useCallback((value) => {
    try {
      setStoredValue((currentVal) => {
        // Resolve value if it is a functional updater
        const valueToStore = value instanceof Function ? value(currentVal) : value;
        
        // Persist to localStorage if available
        if (isStorageAvailable) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.error(`[useLocalStorage] Error setting value for key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}
