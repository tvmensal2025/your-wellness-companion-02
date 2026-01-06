/**
 * Smart cache utilities for mobile performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const CACHE_PREFIX = 'app_cache_';

/**
 * Set item in cache with expiration
 */
export const setCacheItem = <T>(
  key: string,
  data: T,
  ttlMinutes: number = 5
): void => {
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.warn('Cache set failed:', error);
    // Clear old cache items if storage is full
    clearExpiredCache();
  }
};

/**
 * Get item from cache (returns null if expired or not found)
 */
export const getCacheItem = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;

    const item: CacheItem<T> = JSON.parse(stored);

    // Check if expired
    if (Date.now() > item.expiresAt) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return item.data;
  } catch (error) {
    console.warn('Cache get failed:', error);
    return null;
  }
};

/**
 * Get item from cache even if stale (for stale-while-revalidate pattern)
 */
export const getStaleItem = <T>(key: string): { data: T; isStale: boolean } | null => {
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;

    const item: CacheItem<T> = JSON.parse(stored);
    const isStale = Date.now() > item.expiresAt;

    return { data: item.data, isStale };
  } catch (error) {
    console.warn('Cache get stale failed:', error);
    return null;
  }
};

/**
 * Remove item from cache
 */
export const removeCacheItem = (key: string): void => {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.warn('Cache remove failed:', error);
  }
};

/**
 * Clear all cached items
 */
export const clearAllCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Cache clear failed:', error);
  }
};

/**
 * Clear only expired cache items
 */
export const clearExpiredCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const item = JSON.parse(stored);
            if (now > item.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Remove corrupted items
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn('Cache cleanup failed:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): {
  totalItems: number;
  totalSize: number;
  expiredItems: number;
} => {
  let totalItems = 0;
  let totalSize = 0;
  let expiredItems = 0;
  const now = Date.now();

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        totalItems++;
        const stored = localStorage.getItem(key);
        if (stored) {
          totalSize += stored.length * 2; // UTF-16 encoding
          try {
            const item = JSON.parse(stored);
            if (now > item.expiresAt) {
              expiredItems++;
            }
          } catch {
            expiredItems++;
          }
        }
      }
    });
  } catch (error) {
    console.warn('Cache stats failed:', error);
  }

  return { totalItems, totalSize, expiredItems };
};

/**
 * Wrapper for React Query with cache persistence
 */
export const createCachedQueryFn = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMinutes: number = 5
): (() => Promise<T>) => {
  return async () => {
    // Try to get from cache first (stale-while-revalidate)
    const cached = getStaleItem<T>(key);

    if (cached && !cached.isStale) {
      return cached.data;
    }

    // Fetch fresh data
    const freshData = await fetchFn();

    // Update cache
    setCacheItem(key, freshData, ttlMinutes);

    return freshData;
  };
};

// Clear expired cache on app load
if (typeof window !== 'undefined') {
  setTimeout(clearExpiredCache, 1000);
}
