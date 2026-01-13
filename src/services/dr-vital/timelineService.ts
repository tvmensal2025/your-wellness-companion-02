// =====================================================
// TIMELINE SERVICE - Dr. Vital
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';
import type { TimelineEvent, TimelineEventType, TimelineFilter, TimelineComparison, PaginatedResponse } from '@/types/dr-vital-revolution';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_DAYS = 30;

export async function getTimelineEvents(userId: string, filter?: TimelineFilter, page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE): Promise<PaginatedResponse<TimelineEvent>> {
  let query = fromTable('health_timeline_events').select('*', { count: 'exact' }).eq('user_id', userId).order('event_date', { ascending: false }) as any;

  if (filter?.types?.length) query = query.in('event_type', filter.types);
  if (filter?.dateRange) {
    query = query.gte('event_date', filter.dateRange.start.toISOString()).lte('event_date', filter.dateRange.end.toISOString());
  } else {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DEFAULT_DAYS);
    query = query.gte('event_date', thirtyDaysAgo.toISOString());
  }
  if (filter?.milestonesOnly) query = query.eq('is_milestone', true);

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const events = (data || []).map(rowToEvent);
  return { data: events, total: count || 0, page, pageSize, hasMore: from + events.length < (count || 0) };
}

export async function getAllTimelineEvents(userId: string, filter?: TimelineFilter): Promise<TimelineEvent[]> {
  let query = fromTable('health_timeline_events').select('*').eq('user_id', userId).order('event_date', { ascending: false }) as any;
  if (filter?.types?.length) query = query.in('event_type', filter.types);
  if (filter?.dateRange) query = query.gte('event_date', filter.dateRange.start.toISOString()).lte('event_date', filter.dateRange.end.toISOString());
  if (filter?.milestonesOnly) query = query.eq('is_milestone', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(rowToEvent);
}

export function detectMilestone(eventType: TimelineEventType, metadata: Record<string, unknown>): boolean {
  if (eventType === 'goal_reached' && metadata.is_first_goal) return true;
  if (eventType === 'achievement' && metadata.is_best_score) return true;
  if (eventType === 'weight_change' && metadata.goal_reached) return true;
  if (eventType === 'streak_milestone' && (metadata.streak_days as number) >= 30) return true;
  if (eventType === 'level_up' && [5, 10].includes(metadata.new_level as number)) return true;
  if (eventType === 'achievement' && metadata.boss_battle_won) return true;
  return false;
}

export async function createTimelineEvent(userId: string, eventType: TimelineEventType, title: string, description?: string, metadata: Record<string, unknown> = {}): Promise<TimelineEvent> {
  const isMilestone = detectMilestone(eventType, metadata);
  const icon = getEventIcon(eventType);
  const { data, error } = await fromTable('health_timeline_events')
    .insert({ user_id: userId, event_type: eventType, title, description, event_date: new Date().toISOString(), is_milestone: isMilestone, metadata, icon })
    .select()
    .single() as any;
  if (error) throw error;
  return rowToEvent(data);
}

export async function compareTimePeriods(userId: string, period1Start: Date, period1End: Date, period2Start: Date, period2End: Date): Promise<TimelineComparison> {
  const [events1, events2, scores1, scores2] = await Promise.all([
    getAllTimelineEvents(userId, { dateRange: { start: period1Start, end: period1End } }),
    getAllTimelineEvents(userId, { dateRange: { start: period2Start, end: period2End } }),
    getAverageHealthScore(userId, period1Start, period1End),
    getAverageHealthScore(userId, period2Start, period2End),
  ]);

  const summary1 = { totalEvents: events1.length, achievements: events1.filter(e => e.type === 'achievement').length, avgHealthScore: scores1 };
  const summary2 = { totalEvents: events2.length, achievements: events2.filter(e => e.type === 'achievement').length, avgHealthScore: scores2 };

  const insights: string[] = [];
  if (summary2.totalEvents > summary1.totalEvents) insights.push(`Você teve ${summary2.totalEvents - summary1.totalEvents} eventos a mais`);
  if (summary2.achievements > summary1.achievements) insights.push(`Você conquistou ${summary2.achievements - summary1.achievements} conquistas a mais`);
  if (summary2.avgHealthScore > summary1.avgHealthScore) insights.push(`Seu Health Score melhorou ${Math.round(summary2.avgHealthScore - summary1.avgHealthScore)} pontos`);

  const improvement = summary1.avgHealthScore > 0 ? Math.round(((summary2.avgHealthScore - summary1.avgHealthScore) / summary1.avgHealthScore) * 100) : 0;

  return {
    period1: { start: period1Start, end: period1End, events: events1, summary: summary1 },
    period2: { start: period2Start, end: period2End, events: events2, summary: summary2 },
    insights,
    improvement,
  };
}

export async function getMilestones(userId: string, limit: number = 10): Promise<TimelineEvent[]> {
  const { data, error } = await fromTable('health_timeline_events').select('*').eq('user_id', userId).eq('is_milestone', true).order('event_date', { ascending: false }).limit(limit) as any;
  if (error) throw error;
  return (data || []).map(rowToEvent);
}

export async function getRecentEventsByType(userId: string, eventType: TimelineEventType, limit: number = 5): Promise<TimelineEvent[]> {
  const { data, error } = await fromTable('health_timeline_events').select('*').eq('user_id', userId).eq('event_type', eventType).order('event_date', { ascending: false }).limit(limit) as any;
  if (error) throw error;
  return (data || []).map(rowToEvent);
}

export function isChronologicalOrder(events: TimelineEvent[]): boolean {
  for (let i = 1; i < events.length; i++) if (events[i].eventDate > events[i - 1].eventDate) return false;
  return true;
}

export function eventsMatchFilter(events: TimelineEvent[], filter: TimelineFilter): boolean {
  return events.every(event => {
    if (filter.types?.length && !filter.types.includes(event.type)) return false;
    if (filter.dateRange && (event.eventDate < filter.dateRange.start || event.eventDate > filter.dateRange.end)) return false;
    if (filter.milestonesOnly && !event.isMilestone) return false;
    return true;
  });
}

export function eventsWithinDefaultRange(events: TimelineEvent[]): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DEFAULT_DAYS);
  return events.every(e => e.eventDate >= thirtyDaysAgo);
}

function getEventIcon(eventType: TimelineEventType): string {
  const icons: Record<TimelineEventType, string> = {
    weight_change: 'scale', exam_result: 'file-text', achievement: 'trophy', goal_reached: 'target',
    consultation: 'stethoscope', medication_change: 'pill', level_up: 'arrow-up',
    streak_milestone: 'flame', prediction_improved: 'trending-up',
  };
  return icons[eventType] || 'activity';
}

async function getAverageHealthScore(userId: string, startDate: Date, endDate: Date): Promise<number> {
  const { data } = await fromTable('health_scores').select('score').eq('user_id', userId).gte('calculated_at', startDate.toISOString()).lte('calculated_at', endDate.toISOString()) as any;
  if (!data?.length) return 0;
  return data.reduce((sum: number, s: any) => sum + s.score, 0) / data.length;
}

function rowToEvent(row: any): TimelineEvent {
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

export const timelineService = {
  getTimelineEvents, getAllTimelineEvents, createTimelineEvent, compareTimePeriods,
  getMilestones, getRecentEventsByType, detectMilestone, isChronologicalOrder, eventsMatchFilter, eventsWithinDefaultRange,
};

export default timelineService;
