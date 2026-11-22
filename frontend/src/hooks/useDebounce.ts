import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce rapidly updating values (e.g. mandi search, cargo filters, geocoding)
 *
 * @param value The value to debounce
 * @param delay Milliseconds to wait before updating debounced value (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
