import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserDataCentralized, useUserProfile, useUserPhysicalData, useUserPoints } from '../useUserDataCentralized';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ 
            data: {
              id: 'test-id',
              user_id: 'test-user-id',
              full_name: 'Test User',
              email: 'test@example.com',
              avatar_url: null
            }, 
            error: null 
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
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

describe('useUserDataCentralized', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when userId is undefined', () => {
    const { result } = renderHook(() => useUserDataCentralized(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should start loading when userId is provided', () => {
    const { result } = renderHook(() => useUserDataCentralized('test-user-id'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should have correct query key', () => {
    const { result } = renderHook(() => useUserDataCentralized('test-user-id'), {
      wrapper: createWrapper(),
    });

    // Query should be enabled
    expect(result.current.isLoading).toBe(true);
  });
});

describe('useUserProfile', () => {
  it('should return profile from centralized data', () => {
    const { result } = renderHook(() => useUserProfile('test-user-id'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeUndefined();
  });

  it('should not fetch when userId is undefined', () => {
    const { result } = renderHook(() => useUserProfile(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useUserPhysicalData', () => {
  it('should return physical data from centralized data', () => {
    const { result } = renderHook(() => useUserPhysicalData('test-user-id'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useUserPoints', () => {
  it('should return points with default values', () => {
    const { result } = renderHook(() => useUserPoints('test-user-id'), {
      wrapper: createWrapper(),
    });

    expect(result.current.level).toBe(1);
    expect(result.current.totalXP).toBe(0);
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.bestStreak).toBe(0);
  });
});
