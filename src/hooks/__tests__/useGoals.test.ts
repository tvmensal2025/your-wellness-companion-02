import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGoals } from '../useGoals';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          in: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
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
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return goals and categories', () => {
    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    expect(result.current.categories).toBeDefined();
    expect(result.current.categories.length).toBeGreaterThan(0);
    expect(result.current.createGoal).toBeDefined();
    expect(result.current.updateProgress).toBeDefined();
  });

  it('should have correct categories', () => {
    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    const categoryIds = result.current.categories.map(c => c.id);
    expect(categoryIds).toContain('peso');
    expect(categoryIds).toContain('exercicio');
    expect(categoryIds).toContain('alimentacao');
  });

  it('should expose mutation functions', () => {
    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.createGoal).toBe('function');
    expect(typeof result.current.updateProgress).toBe('function');
    expect(result.current.isCreating).toBe(false);
    expect(result.current.isUpdating).toBe(false);
  });
});
