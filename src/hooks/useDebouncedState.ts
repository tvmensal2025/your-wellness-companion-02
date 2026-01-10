import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para estado com debounce - evita re-renders excessivos
 * Útil para inputs de busca, filtros, etc.
 * 
 * @param initialValue - Valor inicial
 * @param delay - Delay em ms (padrão: 300ms)
 * @returns [debouncedValue, setValue, immediateValue]
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [immediateValue, delay]);

  const setValue = useCallback((value: T) => {
    setImmediateValue(value);
  }, []);

  return [debouncedValue, setValue, immediateValue];
}

/**
 * Hook para callback com debounce
 * Útil para handlers de eventos frequentes
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Atualiza ref quando callback muda
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook para throttle de callback
 * Executa no máximo uma vez a cada X ms
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      }
    },
    [delay]
  ) as T;

  return throttledCallback;
}

export default useDebouncedState;
