import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized React Query configuration for mobile performance
 * Implements stale-while-revalidate pattern
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 2 minutes - data considered fresh
        staleTime: 2 * 60 * 1000,

        // Cache time: 30 minutes - keep in memory
        gcTime: 30 * 60 * 1000,

        // Retry configuration for mobile networks
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for network errors
          return failureCount < 3;
        },

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus (good for mobile app switching)
        refetchOnWindowFocus: true,

        // Don't refetch on reconnect automatically (we handle this manually)
        refetchOnReconnect: true,

        // Keep previous data while fetching new
        placeholderData: (previousData: any) => previousData,

        // Network mode for offline support
        networkMode: 'offlineFirst',
      },
      mutations: {
        // Retry mutations once on network errors
        retry: 1,
        retryDelay: 1000,
        networkMode: 'offlineFirst',
      },
    },
  });
};

/**
 * Query keys factory for consistent cache keys
 */
export const queryKeys = {
  // User related
  user: {
    all: ['user'] as const,
    profile: (userId: string) => ['user', 'profile', userId] as const,
    stats: (userId: string) => ['user', 'stats', userId] as const,
    achievements: (userId: string) => ['user', 'achievements', userId] as const,
  },

  // Missions related
  missions: {
    all: ['missions'] as const,
    list: () => ['missions', 'list'] as const,
    detail: (id: string) => ['missions', 'detail', id] as const,
    daily: (date: string) => ['missions', 'daily', date] as const,
  },

  // Challenges related
  challenges: {
    all: ['challenges'] as const,
    list: () => ['challenges', 'list'] as const,
    detail: (id: string) => ['challenges', 'detail', id] as const,
    participation: (userId: string, challengeId: string) =>
      ['challenges', 'participation', userId, challengeId] as const,
  },

  // Weight/Progress related
  weight: {
    all: ['weight'] as const,
    history: (userId: string, limit?: number) =>
      ['weight', 'history', userId, limit] as const,
    latest: (userId: string) => ['weight', 'latest', userId] as const,
  },

  // Nutrition related
  nutrition: {
    all: ['nutrition'] as const,
    daily: (userId: string, date: string) =>
      ['nutrition', 'daily', userId, date] as const,
    summary: (userId: string, startDate: string, endDate: string) =>
      ['nutrition', 'summary', userId, startDate, endDate] as const,
  },

  // Chat related
  chat: {
    all: ['chat'] as const,
    conversations: (userId: string) => ['chat', 'conversations', userId] as const,
    messages: (conversationId: string) =>
      ['chat', 'messages', conversationId] as const,
  },
};

/**
 * Prefetch utilities for navigation
 */
export const prefetchQueries = {
  dashboard: async (queryClient: QueryClient, userId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.user.profile(userId),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.missions.daily(new Date().toISOString().split('T')[0]),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  },

  profile: async (queryClient: QueryClient, userId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.user.stats(userId),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.user.achievements(userId),
        staleTime: 10 * 60 * 1000,
      }),
    ]);
  },
};

export default createQueryClient;
