// =====================================================
// TIMELINE SERVICE
// =====================================================
// Sistema de timeline de eventos de saúde
// Properties 3, 18, 19
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  TimelineEvent,
  TimelineEventType,
  TimelineFilter,
  TimelineComparison,
  TimelineEventRow,
  PaginatedResponse,
} from '@/types/dr-vital-revolution';

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_DAYS = 30;

// Milestone criteria
const MILESTONE_CRITERIA = {
  first_goal_achieved: true,
  best_health_score: true,
  weight_goal_reached: true,
  streak_30: true,
  level_up_5: true,
  level_up_10: true,
  boss_battle_won: true,
} as const;

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Busca eventos da timeline com paginação
 * Property 3: events SHALL be returned in chronological order (newest first)
 */
export async function getTimelineEvents(
  userId: string,
  filter?: TimelineFilter,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<TimelineEvent>> {
  let query = supabase
    .from('health_timeline_events')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('event_date', { ascending: false });

  // Apply type filter
  if (filter?.types && filter.types.length > 0) {
    query = query.in('event_type', filter.types);
  }

  // Apply date range filter
  if (filter?.dateRange) {
    query = query
      .gte('event_date', filter.dateRange.start.toISOString())
      .lte('event_date', filter.dateRange.end.toISOString());
  } else {
    // Default: last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DEFAULT_DAYS);
    query = query.gte('event_date', thirtyDaysAgo.toISOString());
  }

  // Apply milestones filter
  if (filter?.milestonesOnly) {
    query = query.eq('is_milestone', true);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('[TimelineService] Error fetching events:', error);
    throw error;
  }

  const events = (data as TimelineEventRow[]).map(rowToEvent);
  const total = count || 0;

  return {
    data: events,
    total,
    page,
    pageSize,
    hasMore: from + events.length < total,
  };
}

/**
 * Busca todos os eventos sem paginação (para comparações)
 */
export async function getAllTimelineEvents(
  userId: string,
  filter?: TimelineFilter
): Promise<TimelineEvent[]> {
  let query = supabase
    .from('health_timeline_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: false });

  if (filter?.types && filter.types.length > 0) {
    query = query.in('event_type', filter.types);
  }

  if (filter?.dateRange) {
    query = query
      .gte('event_date', filter.dateRange.start.toISOString())
      .lte('event_date', filter.dateRange.end.toISOString());
  }

  if (filter?.milestonesOnly) {
    query = query.eq('is_milestone', true);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data as TimelineEventRow[]).map(rowToEvent);
}

/**
 * Detecta se um evento é um milestone
 * Property 18: is_milestone SHALL be true for specific events
 */
export function detectMilestone(
  eventType: TimelineEventType,
  metadata: Record<string, unknown>
): boolean {
  // First goal achieved
  if (eventType === 'goal_reached' && metadata.is_first_goal) {
    return true;
  }

  // Best health score
  if (eventType === 'achievement' && metadata.is_best_score) {
    return true;
  }

  // Weight goal reached
  if (eventType === 'weight_change' && metadata.goal_reached) {
    return true;
  }

  // 30-day streak
  if (eventType === 'streak_milestone' && (metadata.streak_days as number) >= 30) {
    return true;
  }

  // Level up to 5 or 10
  if (eventType === 'level_up') {
    const level = metadata.new_level as number;
    if (level === 5 || level === 10) {
      return true;
    }
  }

  // Boss battle won
  if (eventType === 'achievement' && metadata.boss_battle_won) {
    return true;
  }

  return false;
}

/**
 * Cria um novo evento na timeline
 */
export async function createTimelineEvent(
  userId: string,
  eventType: TimelineEventType,
  title: string,
  description?: string,
  metadata: Record<string, unknown> = {}
): Promise<TimelineEvent> {
  const isMilestone = detectMilestone(eventType, metadata);
  
  const icon = getEventIcon(eventType);

  const { data, error } = await supabase
    .from('health_timeline_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      title,
      description,
      event_date: new Date().toISOString(),
      is_milestone: isMilestone,
      metadata,
      icon,
    })
    .select()
    .single();

  if (error) throw error;

  return rowToEvent(data as TimelineEventRow);
}

/**
 * Compara dois períodos de tempo
 * Property 19: all returned events SHALL match filter criteria
 */
export async function compareTimePeriods(
  userId: string,
  period1Start: Date,
  period1End: Date,
  period2Start: Date,
  period2End: Date
): Promise<TimelineComparison> {
  // Fetch events for both periods
  const [events1, events2, scores1, scores2] = await Promise.all([
    getAllTimelineEvents(userId, {
      dateRange: { start: period1Start, end: period1End },
    }),
    getAllTimelineEvents(userId, {
      dateRange: { start: period2Start, end: period2End },
    }),
    getAverageHealthScore(userId, period1Start, period1End),
    getAverageHealthScore(userId, period2Start, period2End),
  ]);

  // Calculate summaries
  const summary1 = {
    totalEvents: events1.length,
    achievements: events1.filter(e => e.type === 'achievement').length,
    avgHealthScore: scores1,
  };

  const summary2 = {
    totalEvents: events2.length,
    achievements: events2.filter(e => e.type === 'achievement').length,
    avgHealthScore: scores2,
  };

  // Generate insights
  const insights: string[] = [];

  if (summary2.totalEvents > summary1.totalEvents) {
    insights.push(`Você teve ${summary2.totalEvents - summary1.totalEvents} eventos a mais no período recente`);
  }

  if (summary2.achievements > summary1.achievements) {
    insights.push(`Você conquistou ${summary2.achievements - summary1.achievements} conquistas a mais`);
  }

  if (summary2.avgHealthScore > summary1.avgHealthScore) {
    const diff = Math.round(summary2.avgHealthScore - summary1.avgHealthScore);
    insights.push(`Seu Health Score médio melhorou ${diff} pontos`);
  } else if (summary2.avgHealthScore < summary1.avgHealthScore) {
    const diff = Math.round(summary1.avgHealthScore - summary2.avgHealthScore);
    insights.push(`Seu Health Score médio diminuiu ${diff} pontos`);
  }

  // Calculate improvement percentage
  const improvement = summary1.avgHealthScore > 0
    ? Math.round(((summary2.avgHealthScore - summary1.avgHealthScore) / summary1.avgHealthScore) * 100)
    : 0;

  return {
    period1: {
      start: period1Start,
      end: period1End,
      events: events1,
      summary: summary1,
    },
    period2: {
      start: period2Start,
      end: period2End,
      events: events2,
      summary: summary2,
    },
    insights,
    improvement,
  };
}

/**
 * Busca milestones do usuário
 */
export async function getMilestones(
  userId: string,
  limit: number = 10
): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from('health_timeline_events')
    .select('*')
    .eq('user_id', userId)
    .eq('is_milestone', true)
    .order('event_date', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as TimelineEventRow[]).map(rowToEvent);
}

/**
 * Busca eventos recentes por tipo
 */
export async function getRecentEventsByType(
  userId: string,
  eventType: TimelineEventType,
  limit: number = 5
): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from('health_timeline_events')
    .select('*')
    .eq('user_id', userId)
    .eq('event_type', eventType)
    .order('event_date', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as TimelineEventRow[]).map(rowToEvent);
}

// =====================================================
// VALIDATION FUNCTIONS (for property tests)
// =====================================================

/**
 * Validates events are in chronological order (newest first)
 * Property 3
 */
export function isChronologicalOrder(events: TimelineEvent[]): boolean {
  for (let i = 1; i < events.length; i++) {
    if (events[i].eventDate > events[i - 1].eventDate) {
      return false;
    }
  }
  return true;
}

/**
 * Validates all events match filter criteria
 * Property 19
 */
export function eventsMatchFilter(
  events: TimelineEvent[],
  filter: TimelineFilter
): boolean {
  for (const event of events) {
    // Check type filter
    if (filter.types && filter.types.length > 0) {
      if (!filter.types.includes(event.type)) {
        return false;
      }
    }

    // Check date range
    if (filter.dateRange) {
      if (event.eventDate < filter.dateRange.start || event.eventDate > filter.dateRange.end) {
        return false;
      }
    }

    // Check milestones only
    if (filter.milestonesOnly && !event.isMilestone) {
      return false;
    }
  }

  return true;
}

/**
 * Validates events are within default 30 days when no filter
 * Property 3
 */
export function eventsWithinDefaultRange(events: TimelineEvent[]): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DEFAULT_DAYS);

  for (const event of events) {
    if (event.eventDate < thirtyDaysAgo) {
      return false;
    }
  }

  return true;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getEventIcon(eventType: TimelineEventType): string {
  const icons: Record<TimelineEventType, string> = {
    weight_change: 'scale',
    exam_result: 'file-text',
    achievement: 'trophy',
    goal_reached: 'target',
    consultation: 'stethoscope',
    medication_change: 'pill',
    level_up: 'arrow-up',
    streak_milestone: 'flame',
    prediction_improved: 'trending-up',
  };

  return icons[eventType] || 'activity';
}

async function getAverageHealthScore(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const { data } = await supabase
    .from('health_scores')
    .select('score')
    .eq('user_id', userId)
    .gte('calculated_at', startDate.toISOString())
    .lte('calculated_at', endDate.toISOString());

  if (!data || data.length === 0) return 0;

  return data.reduce((sum, s) => sum + s.score, 0) / data.length;
}

function rowToEvent(row: TimelineEventRow): TimelineEvent {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.event_type,
    title: row.title,
    description: row.description || undefined,
    eventDate: new Date(row.event_date),
    isMilestone: row.is_milestone,
    metadata: row.metadata,
    icon: row.icon || 'activity',
    createdAt: new Date(row.created_at),
  };
}

// =====================================================
// EXPORTS
// =====================================================

export const timelineService = {
  getTimelineEvents,
  getAllTimelineEvents,
  createTimelineEvent,
  compareTimePeriods,
  getMilestones,
  getRecentEventsByType,
  detectMilestone,
  isChronologicalOrder,
  eventsMatchFilter,
  eventsWithinDefaultRange,
};

export default timelineService;
