import { useEffect, useState } from 'react';

/**
 * Trails `value` by `delay` milliseconds.
 *
 * List screens type into a search box that drives a server-side query; without
 * this, every keystroke would be its own request. The immediate value still
 * drives the input, so typing stays responsive.
 */
export function useDebouncedValue<TValue>(value: TValue, delay = 300): TValue {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}
