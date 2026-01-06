import { useState, useEffect } from 'react';

/**
 * Hook to detect user's preference for reduced motion
 * Respects system settings and provides performance optimization
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check on initial render
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

/**
 * Get optimized animation variants based on reduced motion preference
 */
export const getOptimizedVariants = (
  prefersReducedMotion: boolean,
  variants: {
    initial: object;
    animate: object;
    exit?: object;
  }
) => {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return variants;
};

/**
 * Get optimized transition based on reduced motion preference
 */
export const getOptimizedTransition = (
  prefersReducedMotion: boolean,
  transition: object = {}
) => {
  if (prefersReducedMotion) {
    return { duration: 0.01 };
  }
  return transition;
};

/**
 * Simple fade animation variants
 */
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Slide up animation variants
 */
export const slideUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

/**
 * Scale animation variants
 */
export const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export default useReducedMotion;
