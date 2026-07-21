import { useEffect, useState } from 'react';

/** Delays reacting to a fast-changing value (e.g. keystrokes) so the
 * PDF preview doesn't re-render / re-request on every character typed. */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}
