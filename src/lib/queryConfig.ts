import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized React Query configuration for mobile performance
 * Implements stale-while-revalidate pattern
 * 
 * OTIMIZADO: Cache mais agressivo para reduzir requests
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 5 minutes - data considered fresh (aumentado de 2min)
        staleTime: 5 * 60 * 1000,

        // Cache time: 60 minutes - keep in memory (aumentado de 30min)
        gcTime: 60 * 60 * 1000,

        // Retry configuration for mobile networks
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 2 times for network errors (reduzido de 3)
          return failureCount < 2;
        },

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus DESABILITADO para reduzir requests
        refetchOnWindowFocus: false,

        // Refetch on reconnect - mantido para sincronização
        refetchOnReconnect: true,

        // Keep previous data while fetching new
        placeholderData: (previousData: any) => previousData,

        // Network mode for offline support
        networkMode: 'offlineFirst',
        
        // Refetch interval desabilitado por padrão
        refetchInterval: false,
        
        // Não refetch em mount se dados estão no cache
        refetchOnMount: false,
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
