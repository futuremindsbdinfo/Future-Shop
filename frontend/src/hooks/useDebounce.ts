import { useEffect, useState } from "react";

/**
 * Debounce a rapidly-changing value: returns the latest `value` only after it
 * has stopped changing for `delay` ms. A reusable version of the inline
 * setTimeout pattern used across the admin pages.
 *
 * SSR-safe (initial state is the passed value; no window access). The setState
 * runs inside setTimeout (async), so it does NOT trip the
 * react-hooks/set-state-in-effect rule.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
