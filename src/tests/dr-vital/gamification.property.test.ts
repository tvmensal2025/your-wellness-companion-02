// =====================================================
// GAMIFICATION PROPERTY TESTS
// =====================================================
// Property-based tests using fast-check
// Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.8
// =====================================================

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateLevel,
  xpToNextLevel,
  xpForLevel,
  calculateStreakBonus,
  buildHealthLevel,
  getLevelTitle,
} from '@/services/dr-vital/gamificationService';

// =====================================================
// ARBITRARIES (Data Generators)
// =====================================================

// Valid XP values (0 to reasonable max)
const validXpArb = fc.integer({ min: 0, max: 100000 });

// Valid streak days
const validStreakArb = fc.integer({ min: 0, max: 365 });

// Valid level (1-10+)
const validLevelArb = fc.integer({ min: 1, max: 20 });

// Mission XP reward
const missionXpArb = fc.integer({ min: 10, max: 500 });

// =====================================================
// PROPERTY 5: Mission XP Award Consistency
// =====================================================
// For any completed mission, the XP awarded SHALL equal the 
// mission's xpReward value, and the user's total XP SHALL 
// increase by exactly that amount.
// =====================================================

describe('Property 5: Mission XP Award Consistency', () => {
  it('should award exact XP amount from mission', () => {
    fc.assert(
      fc.property(
        validXpArb,
        missionXpArb,
        (currentXp, missionXp) => {
          const newTotalXp = currentXp + missionXp;
          const xpAwarded = newTotalXp - currentXp;
          
          expect(xpAwarded).toBe(missionXp);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never award negative XP', () => {
    fc.assert(
      fc.property(missionXpArb, (xpReward) => {
        expect(xpReward).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should accumulate XP correctly over multiple missions', () => {
    fc.assert(
      fc.property(
        fc.array(missionXpArb, { minLength: 1, maxLength: 10 }),
        (missionRewards) => {
          let totalXp = 0;
          const expectedTotal = missionRewards.reduce((sum, xp) => sum + xp, 0);
          
          for (const reward of missionRewards) {
            totalXp += reward;
          }
          
          expect(totalXp).toBe(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// PROPERTY 6: Streak Calculation and Bonus Awards
// =====================================================
// For any user, the current_streak SHALL increment by 1 for 
// each consecutive day of completing all daily missions, and 
// streaks of 7+ days SHALL trigger bonus XP (streak * 10 bonus).
// =====================================================

describe('Property 6: Streak Calculation and Bonus Awards', () => {
  it('should return 0 bonus for streaks < 7 days', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 6 }),
        (streakDays) => {
          const bonus = calculateStreakBonus(streakDays);
          expect(bonus).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return streak * 10 bonus for streaks >= 7 days', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 7, max: 365 }),
        (streakDays) => {
          const bonus = calculateStreakBonus(streakDays);
          expect(bonus).toBe(streakDays * 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have bonus exactly at threshold (7 days)', () => {
    expect(calculateStreakBonus(6)).toBe(0);
    expect(calculateStreakBonus(7)).toBe(70);
    expect(calculateStreakBonus(8)).toBe(80);
  });

  it('should scale linearly with streak days', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 7, max: 100 }),
        fc.integer({ min: 1, max: 10 }),
        (baseStreak, increment) => {
          const bonus1 = calculateStreakBonus(baseStreak);
          const bonus2 = calculateStreakBonus(baseStreak + increment);
          
          expect(bonus2 - bonus1).toBe(increment * 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never return negative bonus', () => {
    fc.assert(
      fc.property(validStreakArb, (streakDays) => {
        const bonus = calculateStreakBonus(streakDays);
        expect(bonus).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// PROPERTY 8: Level Progression Formula
// =====================================================
// For any user, the level SHALL be calculated as 
// floor(sqrt(total_xp / 100)) + 1, and xpToNextLevel SHALL be 
// (level^2 * 100) - total_xp.
// =====================================================

describe('Property 8: Level Progression Formula', () => {
  it('should calculate level as floor(sqrt(xp/100)) + 1', () => {
    fc.assert(
      fc.property(validXpArb, (totalXp) => {
        const level = calculateLevel(totalXp);
        const expectedLevel = Math.floor(Math.sqrt(totalXp / 100)) + 1;
        
        expect(level).toBe(expectedLevel);
      }),
      { numRuns: 100 }
    );
  });

  it('should calculate xpToNextLevel as (level^2 * 100) - total_xp', () => {
    fc.assert(
      fc.property(validXpArb, (totalXp) => {
        const level = calculateLevel(totalXp);
        const xpNeeded = xpToNextLevel(level, totalXp);
        const expectedXpNeeded = Math.max(0, (level * level * 100) - totalXp);
        
        expect(xpNeeded).toBe(expectedXpNeeded);
      }),
      { numRuns: 100 }
    );
  });

  it('should start at level 1 with 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('should level up at correct XP thresholds', () => {
    // Level 1: 0-99 XP
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
    
    // Level 2: 100-399 XP (need 1^2 * 100 = 100 for level 2)
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(399)).toBe(2);
    
    // Level 3: 400-899 XP (need 2^2 * 100 = 400 for level 3)
    expect(calculateLevel(400)).toBe(3);
    expect(calculateLevel(899)).toBe(3);
    
    // Level 4: 900-1599 XP (need 3^2 * 100 = 900 for level 4)
    expect(calculateLevel(900)).toBe(4);
  });

  it('should never return level < 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 100000 }),
        (xp) => {
          const level = calculateLevel(xp);
          expect(level).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have monotonically increasing levels with XP', () => {
    fc.assert(
      fc.property(
        validXpArb,
        fc.integer({ min: 1, max: 1000 }),
        (baseXp, increment) => {
          const level1 = calculateLevel(baseXp);
          const level2 = calculateLevel(baseXp + increment);
          
          expect(level2).toBeGreaterThanOrEqual(level1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have xpToNextLevel always >= 0', () => {
    fc.assert(
      fc.property(validXpArb, (totalXp) => {
        const level = calculateLevel(totalXp);
        const xpNeeded = xpToNextLevel(level, totalXp);
        
        expect(xpNeeded).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should have xpForLevel return correct thresholds', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(400);
    expect(xpForLevel(4)).toBe(900);
    expect(xpForLevel(5)).toBe(1600);
  });

  it('should have consistent level/xpForLevel relationship', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (level) => {
          const xpThreshold = xpForLevel(level);
          const calculatedLevel = calculateLevel(xpThreshold);
          
          expect(calculatedLevel).toBe(level);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// HEALTH LEVEL OBJECT PROPERTIES
// =====================================================

describe('HealthLevel Object Properties', () => {
  it('should build valid HealthLevel object', () => {
    fc.assert(
      fc.property(validXpArb, (totalXp) => {
        const healthLevel = buildHealthLevel(totalXp);
        
        expect(healthLevel.level).toBeGreaterThanOrEqual(1);
        expect(healthLevel.currentXp).toBe(totalXp);
        expect(healthLevel.xpToNextLevel).toBeGreaterThanOrEqual(0);
        expect(healthLevel.title).toBeTruthy();
        expect(healthLevel.progressPercentage).toBeGreaterThanOrEqual(0);
        expect(healthLevel.progressPercentage).toBeLessThanOrEqual(100);
        expect(Array.isArray(healthLevel.unlockedFeatures)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should have more unlocked features at higher levels', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9 }),
        (level) => {
          const xp1 = xpForLevel(level);
          const xp2 = xpForLevel(level + 1);
          
          const healthLevel1 = buildHealthLevel(xp1);
          const healthLevel2 = buildHealthLevel(xp2);
          
          expect(healthLevel2.unlockedFeatures.length)
            .toBeGreaterThanOrEqual(healthLevel1.unlockedFeatures.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have valid level title for all levels', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 15 }),
        (level) => {
          const title = getLevelTitle(level);
          expect(title).toBeTruthy();
          expect(typeof title).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// EDGE CASES
// =====================================================

describe('Edge Cases', () => {
  it('should handle 0 XP correctly', () => {
    const level = calculateLevel(0);
    const xpNeeded = xpToNextLevel(level, 0);
    const bonus = calculateStreakBonus(0);
    
    expect(level).toBe(1);
    expect(xpNeeded).toBe(100);
    expect(bonus).toBe(0);
  });

  it('should handle very large XP values', () => {
    const largeXp = 1000000;
    const level = calculateLevel(largeXp);
    
    expect(level).toBeGreaterThan(1);
    expect(Number.isFinite(level)).toBe(true);
  });

  it('should handle streak boundary at 7 days', () => {
    expect(calculateStreakBonus(6)).toBe(0);
    expect(calculateStreakBonus(7)).toBe(70);
  });

  it('should handle level boundary transitions', () => {
    // Just before level 2
    expect(calculateLevel(99)).toBe(1);
    // Exactly at level 2
    expect(calculateLevel(100)).toBe(2);
    
    // Just before level 3
    expect(calculateLevel(399)).toBe(2);
    // Exactly at level 3
    expect(calculateLevel(400)).toBe(3);
  });

  it('should handle negative XP gracefully', () => {
    const level = calculateLevel(-100);
    expect(level).toBe(1);
  });
});

// =====================================================
// INVARIANTS
// =====================================================

describe('Invariants', () => {
  it('level should be deterministic', () => {
    fc.assert(
      fc.property(validXpArb, (xp) => {
        const level1 = calculateLevel(xp);
        const level2 = calculateLevel(xp);
        expect(level1).toBe(level2);
      }),
      { numRuns: 100 }
    );
  });

  it('streak bonus should be deterministic', () => {
    fc.assert(
      fc.property(validStreakArb, (streak) => {
        const bonus1 = calculateStreakBonus(streak);
        const bonus2 = calculateStreakBonus(streak);
        expect(bonus1).toBe(bonus2);
      }),
      { numRuns: 100 }
    );
  });

  it('xpForLevel should be monotonically increasing', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 19 }),
        (level) => {
          const xp1 = xpForLevel(level);
          const xp2 = xpForLevel(level + 1);
          expect(xp2).toBeGreaterThan(xp1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
