// =====================================================
// USE HEALTH TIMELINE HOOK
// =====================================================
// Hook para gerenciar a timeline de saúde
// =====================================================

import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useState, useCallback, useMemo } from 'react';
import {
  getTimelineEvents,
  getMilestones,
  getRecentEventsByType,
  compareTimePeriods,
} from '@/services/dr-vital/timelineService';
import type {
  TimelineEvent,
  TimelineEventType,
  TimelineFilter,
  TimelineComparison,
} from '@/types/dr-vital-revolution';

// =====================================================
// QUERY KEYS
// =====================================================

export const timelineKeys = {
  all: ['health-timeline'] as const,
  events: (userId: string, filter?: TimelineFilter) => 
    [...timelineKeys.all, 'events', userId, filter] as const,
  milestones: (userId: string) => [...timelineKeys.all, 'milestones', userId] as const,
  byType: (userId: string, type: TimelineEventType) => 
    [...timelineKeys.all, 'by-type', userId, type] as const,
  comparison: (userId: string) => [...timelineKeys.all, 'comparison', userId] as const,
};

// =====================================================
// MAIN HOOK - INFINITE SCROLL
// =====================================================

export function useHealthTimeline(initialFilter?: TimelineFilter) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const enabled = !!userId;

  // Filter state
  const [filter, setFilter] = useState<TimelineFilter>(initialFilter || {});

  // Infinite query for timeline events
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: timelineKeys.events(userId || '', filter),
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) return { data: [], total: 0, page: 1, pageSize: 20, hasMore: false };
      return getTimelineEvents(userId, filter, pageParam, 20);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Flatten pages into single array
  const events = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const totalEvents = data?.pages[0]?.total || 0;

  // Filter actions
  const setTypeFilter = useCallback((types: TimelineEventType[] | undefined) => {
    setFilter(prev => ({ ...prev, types }));
  }, []);

  const setDateRangeFilter = useCallback((start: Date, end: Date) => {
    setFilter(prev => ({ ...prev, dateRange: { start, end } }));
  }, []);

  const setMilestonesOnly = useCallback((milestonesOnly: boolean) => {
    setFilter(prev => ({ ...prev, milestonesOnly }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilter({});
  }, []);

  // Derived values
  const milestones = useMemo(() => {
    return events.filter(e => e.isMilestone);
  }, [events]);

  const eventsByType = useMemo(() => {
    const grouped: Record<TimelineEventType, TimelineEvent[]> = {
      weight_change: [],
      exam_result: [],
      achievement: [],
      goal_reached: [],
      consultation: [],
      medication_change: [],
      level_up: [],
      streak_milestone: [],
      prediction_improved: [],
    };

    for (const event of events) {
      if (grouped[event.type]) {
        grouped[event.type].push(event);
      }
    }

    return grouped;
  }, [events]);

  return {
    // Data
    events,
    totalEvents,
    milestones,
    eventsByType,
    
    // Filter
    filter,
    setFilter,
    setTypeFilter,
    setDateRangeFilter,
    setMilestonesOnly,
    clearFilters,
    
    // Pagination
    hasNextPage: hasNextPage || false,
    fetchNextPage,
    isFetchingNextPage,
    
    // Loading states
    isLoading,
    
    // Error states
    error,
    
    // Actions
    refetch,
  };
}

// =====================================================
// MILESTONES HOOK
// =====================================================

export function useHealthMilestones(limit: number = 10) {
  const { user } = useAuth();
  const userId = user?.id;
  const enabled = !!userId;

  const {
    data: milestones,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: timelineKeys.milestones(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      return getMilestones(userId, limit);
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  return {
    milestones: milestones || [],
    isLoading,
    error,
    refetch,
  };
}

// =====================================================
// EVENTS BY TYPE HOOK
// =====================================================

export function useTimelineEventsByType(eventType: TimelineEventType, limit: number = 5) {
  const { user } = useAuth();
  const userId = user?.id;
  const enabled = !!userId;

  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: timelineKeys.byType(userId || '', eventType),
    queryFn: async () => {
      if (!userId) return [];
      return getRecentEventsByType(userId, eventType, limit);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    events: events || [],
    isLoading,
    error,
    refetch,
  };
}

// =====================================================
// TIMELINE COMPARISON HOOK
// =====================================================

interface DateRange {
  start: Date;
  end: Date;
}

export function useTimelineComparison(
  period1Range?: DateRange,
  period2Range?: DateRange
) {
  const { user } = useAuth();
  const userId = user?.id;
  const enabled = !!userId && !!period1Range && !!period2Range;

  const {
    data: comparison,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      ...timelineKeys.comparison(userId || ''),
      period1Range?.start.toISOString(),
      period1Range?.end.toISOString(),
      period2Range?.start.toISOString(),
      period2Range?.end.toISOString(),
    ],
    queryFn: async () => {
      if (!userId || !period1Range || !period2Range) return null;
      return compareTimePeriods(
        userId,
        period1Range.start,
        period1Range.end,
        period2Range.start,
        period2Range.end
      );
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  return {
    comparison,
    isLoading,
    error,
    refetch,
  };
}

// Legacy hook for manual comparison
export function useTimelineComparisonManual() {
  const { user } = useAuth();
  const userId = user?.id;

  const [comparison, setComparison] = useState<TimelineComparison | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonError, setComparisonError] = useState<Error | null>(null);

  const compare = useCallback(async (
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date
  ) => {
    if (!userId) return;

    setIsComparing(true);
    setComparisonError(null);

    try {
      const result = await compareTimePeriods(
        userId,
        period1Start,
        period1End,
        period2Start,
        period2End
      );
      setComparison(result);
    } catch (err) {
      setComparisonError(err as Error);
    } finally {
      setIsComparing(false);
    }
  }, [userId]);

  const compareLastWeeks = useCallback(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    compare(twoWeeksAgo, oneWeekAgo, oneWeekAgo, now);
  }, [compare]);

  const compareLastMonths = useCallback(() => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    compare(twoMonthsAgo, oneMonthAgo, oneMonthAgo, now);
  }, [compare]);

  const clearComparison = useCallback(() => {
    setComparison(null);
    setComparisonError(null);
  }, []);

  return {
    comparison,
    isComparing,
    error: comparisonError,
    compare,
    compareLastWeeks,
    compareLastMonths,
    clearComparison,
  };
}

// =====================================================
// TIMELINE STATS HOOK
// =====================================================

export function useTimelineStats() {
  const { events, milestones } = useHealthTimeline();

  const stats = useMemo(() => {
    if (events.length === 0) {
      return {
        totalEvents: 0,
        totalMilestones: 0,
        eventsThisWeek: 0,
        eventsThisMonth: 0,
        mostCommonType: null as TimelineEventType | null,
        recentActivity: 'none' as 'high' | 'medium' | 'low' | 'none',
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const eventsThisWeek = events.filter(e => e.eventDate >= oneWeekAgo).length;
    const eventsThisMonth = events.filter(e => e.eventDate >= oneMonthAgo).length;

    // Find most common type
    const typeCounts: Record<string, number> = {};
    for (const event of events) {
      typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
    }
    const mostCommonType = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as TimelineEventType | null;

    // Determine activity level
    let recentActivity: 'high' | 'medium' | 'low' | 'none' = 'none';
    if (eventsThisWeek >= 10) recentActivity = 'high';
    else if (eventsThisWeek >= 5) recentActivity = 'medium';
    else if (eventsThisWeek >= 1) recentActivity = 'low';

    return {
      totalEvents: events.length,
      totalMilestones: milestones.length,
      eventsThisWeek,
      eventsThisMonth,
      mostCommonType,
      recentActivity,
    };
  }, [events, milestones]);

  return stats;
}

export default useHealthTimeline;
