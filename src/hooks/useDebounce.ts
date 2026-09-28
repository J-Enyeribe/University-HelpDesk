'use client';

import { useState, useEffect, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
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

export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
      const id = setTimeout(() => {
        callback(...args);
      }, delay);
      setTimeoutRef(id);
    },
    [callback, delay, timeoutRef]
  );
}