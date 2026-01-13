// =====================================================
// TIMELINE PROPERTY TESTS
// =====================================================
// Property-based tests using fast-check
// Validates: Requirements 1.3, 8.1, 8.3, 8.5
// Properties 3, 18, 19
// =====================================================

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// =====================================================
// MOCK TYPES FOR TESTING
// =====================================================

type TimelineEventType = 
  | 'weight_change'
  | 'exam_result'
  | 'achievement'
  | 'goal_reached'
  | 'consultation'
  | 'medication_change'
  | 'level_up'
  | 'streak_milestone';

interface TimelineEvent {
  id: string;
  userId: string;
  type: TimelineEventType;
  title: string;
  eventDate: Date;
  isMilestone: boolean;
  metadata: Record<string, unknown>;
}

interface TimelineFilter {
  types?: TimelineEventType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  milestonesOnly?: boolean;
}

// =====================================================
// PURE FUNCTIONS FOR TESTING
// =====================================================

const DEFAULT_DAYS = 30;

/**
 * Checks if events are in chronological order (newest first)
 * Property 3
 */
function isChronologicalOrder(events: TimelineEvent[]): boolean {
  for (let i = 1; i < events.length; i++) {
    if (events[i].eventDate > events[i - 1].eventDate) {
      return false;
    }
  }
  return true;
}

/**
 * Sorts events in chronological order (newest first)
 */
function sortChronologically(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
}

/**
 * Checks if events are within default 30 days
 * Property 3
 */
function eventsWithinDefaultRange(events: TimelineEvent[]): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DEFAULT_DAYS);

  for (const event of events) {
    if (event.eventDate < thirtyDaysAgo) {
      return false;
    }
  }

  return true;
}

/**
 * Filters events within default range
 */
function filterDefaultRange(events: TimelineEvent[]): TimelineEvent[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DEFAULT_DAYS);
  
  return events.filter(e => e.eventDate >= thirtyDaysAgo);
}

/**
 * Detects if an event is a milestone
 * Property 18
 */
function detectMilestone(
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

  return false;
}

/**
 * Checks if all events match filter criteria
 * Property 19
 */
function eventsMatchFilter(
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
 * Applies filter to events
 */
function applyFilter(events: TimelineEvent[], filter: TimelineFilter): TimelineEvent[] {
  return events.filter(event => {
    if (filter.types && filter.types.length > 0) {
      if (!filter.types.includes(event.type)) return false;
    }
    if (filter.dateRange) {
      if (event.eventDate < filter.dateRange.start || event.eventDate > filter.dateRange.end) {
        return false;
      }
    }
    if (filter.milestonesOnly && !event.isMilestone) {
      return false;
    }
    return true;
  });
}

// =====================================================
// ARBITRARIES (Data Generators)
// =====================================================

const userIdArb = fc.uuid();

const eventTypeArb = fc.constantFrom(
  'weight_change',
  'exam_result',
  'achievement',
  'goal_reached',
  'consultation',
  'medication_change',
  'level_up',
  'streak_milestone'
) as fc.Arbitrary<TimelineEventType>;

// Generate date within last 60 days
const recentDateArb = fc.date({
  min: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  max: new Date(),
});

// Generate date within last 30 days (default range)
const defaultRangeDateArb = fc.date({
  min: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  max: new Date(),
});

const metadataArb = fc.record({
  is_first_goal: fc.boolean(),
  is_best_score: fc.boolean(),
  goal_reached: fc.boolean(),
  streak_days: fc.integer({ min: 0, max: 100 }),
  new_level: fc.integer({ min: 1, max: 15 }),
});

const timelineEventArb = fc.record({
  id: fc.uuid(),
  userId: userIdArb,
  type: eventTypeArb,
  title: fc.string({ minLength: 1, maxLength: 50 }),
  eventDate: recentDateArb,
  isMilestone: fc.boolean(),
  metadata: metadataArb,
});

const filterArb = fc.record({
  types: fc.option(fc.uniqueArray(eventTypeArb, { minLength: 1, maxLength: 4 })),
  dateRange: fc.option(
    fc.record({
      start: fc.date({ min: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), max: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }),
      end: fc.date({ min: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), max: new Date() }),
    })
  ),
  milestonesOnly: fc.option(fc.boolean()),
});

// =====================================================
// PROPERTY 3: Timeline Event Chronological Order
// =====================================================
// For any Health Timeline query, events SHALL be returned in 
// chronological order (newest first by default), and all events 
// SHALL fall within the last 30 days when no filter is applied.
// =====================================================

describe('Property 3: Timeline Event Chronological Order', () => {
  it('should return events in chronological order (newest first)', () => {
    fc.assert(
      fc.property(
        fc.array(timelineEventArb, { minLength: 2, maxLength: 20 }),
        (events) => {
          const sorted = sortChronologically(events);
          expect(isChronologicalOrder(sorted)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have newest event first after sorting', () => {
    fc.assert(
      fc.property(
        fc.array(timelineEventArb, { minLength: 2, maxLength: 20 }),
        (events) => {
          const sorted = sortChronologically(events);
          
          if (sorted.length >= 2) {
            expect(sorted[0].eventDate.getTime())
              .toBeGreaterThanOrEqual(sorted[1].eventDate.getTime());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should filter events within default 30 days when no filter applied', () => {
    fc.assert(
      fc.property(
        fc.array(timelineEventArb, { minLength: 1, maxLength: 20 }),
        (events) => {
          const filtered = filterDefaultRange(events);
          expect(eventsWithinDefaultRange(filtered)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain order after filtering', () => {
    fc.assert(
      fc.property(
        fc.array(timelineEventArb, { minLength: 2, maxLength: 20 }),
        (events) => {
          const sorted = sortChronologically(events);
          const filtered = filterDefaultRange(sorted);
          
          expect(isChronologicalOrder(filtered)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// PROPERTY 18: Timeline Milestone Detection
// =====================================================
// For any timeline event, is_milestone SHALL be true if:
// first goal achieved, best health score, weight goal reached, or 30-day streak.
// =====================================================

describe('Property 18: Timeline Milestone Detection', () => {
  it('should detect first goal achieved as milestone', () => {
    fc.assert(
      fc.property(userIdArb, (userId) => {
        const isMilestone = detectMilestone('goal_reached', { is_first_goal: true });
        expect(isMilestone).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should detect best health score as milestone', () => {
    fc.assert(
      fc.property(userIdArb, (userId) => {
        const isMilestone = detectMilestone('achievement', { is_best_score: true });
        expect(isMilestone).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should detect weight goal reached as milestone', () => {
    fc.assert(
      fc.property(userIdArb, (userId) => {
        const isMilestone = detectMilestone('weight_change', { goal_reached: true });
        expect(isMilestone).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should detect 30+ day streak as milestone', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 30, max: 365 }),
        (streakDays) => {
          const isMilestone = detectMilestone('streak_milestone', { streak_days: streakDays });
          expect(isMilestone).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT detect streak < 30 days as milestone', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 29 }),
        (streakDays) => {
          const isMilestone = detectMilestone('streak_milestone', { streak_days: streakDays });
          expect(isMilestone).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect level 5 and 10 as milestones', () => {
    expect(detectMilestone('level_up', { new_level: 5 })).toBe(true);
    expect(detectMilestone('level_up', { new_level: 10 })).toBe(true);
  });

  it('should NOT detect other levels as milestones', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 15 }).filter(n => n !== 5 && n !== 10),
        (level) => {
          const isMilestone = detectMilestone('level_up', { new_level: level });
          expect(isMilestone).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT detect regular events as milestones', () => {
    expect(detectMilestone('consultation', {})).toBe(false);
    expect(detectMilestone('medication_change', {})).toBe(false);
    expect(detectMilestone('exam_result', {})).toBe(false);
  });
});

// =====================================================
// PROPERTY 19: Timeline Filter Correctness
// =====================================================
// For any timeline filter applied, all returned events SHALL match
// at least one of the specified types AND fall within the specified date range.
// =====================================================

describe('Property 19: Timeline Filter Correctness', () => {
  it('should filter by event types correctly', () => {
    fc.assert(
      fc.property(
        fc.array(timelineEventArb, { minLength: 1, maxLength: 20 }),
        fc.uniqueArray(eventTypeArb, { minLength: 1, maxLength: 3 }),
        (events, types) => {
          const filter: TimelineFilter = { types };
          const filtered = applyFilter(events, filter);
          
          expect(eventsMatchFilter(filtered, filter)).toBe(true);
          
          // All filtered events should have one of the specified types
          for (const event of filtered) {
            expect(types).toContain(event.type);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should filter by date range correctly', () => {
    fc.assert(
      fc.property(
        fc.array(timelineEventArb, { minLength: 1, maxLength: 20 }),
        (events) => {
          // Filter out events with invalid dates
          const validEvents = events.filter(e => !isNaN(e.eventDate.getTime()));
          if (validEvents.length === 0) return true; // Skip if no valid events
          
          const now = new Date();
          const start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days ago
          const end = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
          
          const filter: TimelineFilter = { dateRange: { start, end } };
          const filtered = applyFilter(validEvents, filter);
          
          expect(eventsMatchFilter(filtered, filter)).toBe(true);
          
          // All filtered events should be within date range
          for (const event of filtered) {
            expect(event.eventDate.getTime()).toBeGreaterThanOrEqual(start.getTime());
            expect(event.eventDate.getTime()).toBeLessThanOrEqual(end.getTime());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should filter milestones only correctly', () => {
    fc.assert(
      fc.property(
        fc.array(timelineEventArb, { minLength: 1, maxLength: 20 }),
        (events) => {
          const filter: TimelineFilter = { milestonesOnly: true };
          const filtered = applyFilter(events, filter);
          
          expect(eventsMatchFilter(filtered, filter)).toBe(true);
          
          // All filtered events should be milestones
          for (const event of filtered) {
            expect(event.isMilestone).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply combined filters correctly', () => {
    fc.assert(
      fc.property(
        fc.array(timelineEventArb, { minLength: 1, maxLength: 20 }),
        fc.uniqueArray(eventTypeArb, { minLength: 1, maxLength: 2 }),
        (events, types) => {
          const now = new Date();
          const filter: TimelineFilter = {
            types,
            dateRange: {
              start: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
              end: now,
            },
            milestonesOnly: true,
          };
          
          const filtered = applyFilter(events, filter);
          
          expect(eventsMatchFilter(filtered, filter)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return empty array when no events match filter', () => {
    const events: TimelineEvent[] = [{
      id: '1',
      userId: 'user1',
      type: 'consultation',
      title: 'Test',
      eventDate: new Date(),
      isMilestone: false,
      metadata: {},
    }];
    
    const filter: TimelineFilter = { types: ['achievement'] };
    const filtered = applyFilter(events, filter);
    
    expect(filtered).toHaveLength(0);
  });
});

// =====================================================
// EDGE CASES
// =====================================================

describe('Edge Cases', () => {
  it('should handle empty events array', () => {
    const events: TimelineEvent[] = [];
    
    expect(isChronologicalOrder(events)).toBe(true);
    expect(eventsWithinDefaultRange(events)).toBe(true);
    expect(eventsMatchFilter(events, {})).toBe(true);
  });

  it('should handle single event', () => {
    const event: TimelineEvent = {
      id: '1',
      userId: 'user1',
      type: 'achievement',
      title: 'Test',
      eventDate: new Date(),
      isMilestone: true,
      metadata: {},
    };
    
    expect(isChronologicalOrder([event])).toBe(true);
  });

  it('should handle events with same date', () => {
    const date = new Date();
    const events: TimelineEvent[] = [
      { id: '1', userId: 'u1', type: 'achievement', title: 'A', eventDate: date, isMilestone: false, metadata: {} },
      { id: '2', userId: 'u1', type: 'achievement', title: 'B', eventDate: date, isMilestone: false, metadata: {} },
    ];
    
    expect(isChronologicalOrder(events)).toBe(true);
  });

  it('should handle boundary dates for 30-day filter', () => {
    const exactly30DaysAgo = new Date();
    exactly30DaysAgo.setDate(exactly30DaysAgo.getDate() - 30);
    
    const event: TimelineEvent = {
      id: '1',
      userId: 'user1',
      type: 'achievement',
      title: 'Test',
      eventDate: exactly30DaysAgo,
      isMilestone: false,
      metadata: {},
    };
    
    expect(eventsWithinDefaultRange([event])).toBe(true);
  });

  it('should handle empty filter', () => {
    fc.assert(
      fc.property(
        fc.array(timelineEventArb, { minLength: 1, maxLength: 10 }),
        (events) => {
          const filter: TimelineFilter = {};
          expect(eventsMatchFilter(events, filter)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
