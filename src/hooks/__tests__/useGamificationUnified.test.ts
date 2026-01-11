import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGamificationUnified } from '../useGamificationUnified';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } } }))
    }
  }
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useGamificationUnified', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when userId is undefined', async () => {
    const { result } = renderHook(() => useGamificationUnified(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.gamificationData).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useGamificationUnified('test-user-id'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.completeChallenge).toBeDefined();
    expect(result.current.updateChallengeProgress).toBeDefined();
  });

  it('should expose all required methods', () => {
    const { result } = renderHook(() => useGamificationUnified('test-user-id'), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.completeChallenge).toBe('function');
    expect(typeof result.current.updateChallengeProgress).toBe('function');
    expect(typeof result.current.getTrackingProgress).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should not fetch when userId is not provided', () => {
    const { result } = renderHook(() => useGamificationUnified(undefined), {
      wrapper: createWrapper(),
    });

    // Query should not be loading because enabled is false
    expect(result.current.isLoading).toBe(false);
  });
});
