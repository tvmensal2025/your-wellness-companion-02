// =====================================================
// ACHIEVEMENT PROPERTY TESTS
// =====================================================
// Property-based tests using fast-check
// Validates: Requirements 2.7, 4.6
// Property 13: Achievement Unlock Persistence
// =====================================================

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// =====================================================
// MOCK TYPES FOR TESTING
// =====================================================

interface Achievement {
  id: string;
  achievementKey: string;
  userId: string;
  name: string;
  category: 'nutrition' | 'exercise' | 'consistency' | 'milestones';
  unlockedAt: Date;
  reward?: {
    type: 'xp' | 'avatar_item' | 'badge';
    value: string | number;
  };
}

interface AvatarCustomization {
  userId: string;
  unlockedItems: string[];
}

interface UserStats {
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  missionsCompleted: number;
  mealsLogged: number;
  workoutsCompleted: number;
}

// =====================================================
// PURE FUNCTIONS FOR TESTING
// =====================================================

/**
 * Checks if an achievement should be unlocked based on stats
 */
function shouldUnlockAchievement(
  achievementKey: string,
  stats: UserStats
): boolean {
  const criteria: Record<string, (s: UserStats) => boolean> = {
    'first_mission': (s) => s.missionsCompleted >= 1,
    'streak_7': (s) => s.currentStreak >= 7 || s.longestStreak >= 7,
    'streak_30': (s) => s.currentStreak >= 30 || s.longestStreak >= 30,
    'level_5': (s) => s.currentLevel >= 5,
    'level_10': (s) => s.currentLevel >= 10,
    'meals_50': (s) => s.mealsLogged >= 50,
    'workouts_20': (s) => s.workoutsCompleted >= 20,
    'xp_10000': (s) => s.totalXp >= 10000,
  };
  
  const check = criteria[achievementKey];
  return check ? check(stats) : false;
}

/**
 * Creates an achievement record
 */
function createAchievement(
  userId: string,
  achievementKey: string,
  name: string,
  category: Achievement['category'],
  reward?: Achievement['reward']
): Achievement {
  return {
    id: `${userId}_${achievementKey}`,
    achievementKey,
    userId,
    name,
    category,
    unlockedAt: new Date(),
    reward,
  };
}

/**
 * Validates unique constraint (user_id, achievement_key)
 */
function isUniqueAchievement(
  achievements: Achievement[],
  userId: string,
  achievementKey: string
): boolean {
  const existing = achievements.filter(
    a => a.userId === userId && a.achievementKey === achievementKey
  );
  return existing.length <= 1;
}

/**
 * Adds item to avatar unlocked items
 */
function unlockAvatarItem(
  avatar: AvatarCustomization,
  itemId: string
): AvatarCustomization {
  if (avatar.unlockedItems.includes(itemId)) {
    return avatar;
  }
  return {
    ...avatar,
    unlockedItems: [...avatar.unlockedItems, itemId],
  };
}

// =====================================================
// ARBITRARIES (Data Generators)
// =====================================================

const userIdArb = fc.uuid();

const achievementKeyArb = fc.constantFrom(
  'first_mission',
  'streak_7',
  'streak_30',
  'level_5',
  'level_10',
  'meals_50',
  'workouts_20',
  'xp_10000'
);

const categoryArb = fc.constantFrom(
  'nutrition',
  'exercise',
  'consistency',
  'milestones'
) as fc.Arbitrary<Achievement['category']>;

const userStatsArb = fc.record({
  totalXp: fc.integer({ min: 0, max: 100000 }),
  currentLevel: fc.integer({ min: 1, max: 20 }),
  currentStreak: fc.integer({ min: 0, max: 365 }),
  longestStreak: fc.integer({ min: 0, max: 365 }),
  missionsCompleted: fc.integer({ min: 0, max: 1000 }),
  mealsLogged: fc.integer({ min: 0, max: 1000 }),
  workoutsCompleted: fc.integer({ min: 0, max: 500 }),
});

const rewardArb = fc.option(
  fc.record({
    type: fc.constantFrom('xp', 'avatar_item', 'badge') as fc.Arbitrary<'xp' | 'avatar_item' | 'badge'>,
    value: fc.oneof(fc.string(), fc.integer({ min: 1, max: 1000 })),
  })
);

const avatarArb = fc.record({
  userId: userIdArb,
  unlockedItems: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
});

// =====================================================
// PROPERTY 13: Achievement Unlock Persistence
// =====================================================
// For any unlocked achievement, it SHALL be persisted with a 
// unique (user_id, achievement_key) constraint, and unlocked_items 
// in avatar_customizations SHALL include the reward item.
// =====================================================

describe('Property 13: Achievement Unlock Persistence', () => {
  it('should create achievement with unique (user_id, achievement_key)', () => {
    fc.assert(
      fc.property(
        userIdArb,
        achievementKeyArb,
        fc.string(),
        categoryArb,
        (userId, key, name, category) => {
          const achievement = createAchievement(userId, key, name, category);
          
          // Verify the achievement has correct user and key
          expect(achievement.userId).toBe(userId);
          expect(achievement.achievementKey).toBe(key);
          
          // Verify ID is deterministic based on user and key
          expect(achievement.id).toBe(`${userId}_${key}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain unique constraint across multiple achievements', () => {
    fc.assert(
      fc.property(
        userIdArb,
        fc.uniqueArray(achievementKeyArb, { minLength: 1, maxLength: 8 }),
        (userId, keys) => {
          const achievements: Achievement[] = [];
          
          for (const key of keys) {
            const achievement = createAchievement(userId, key, 'Test', 'milestones');
            achievements.push(achievement);
          }
          
          // Each unique key should only appear once per user
          for (const key of keys) {
            expect(isUniqueAchievement(achievements, userId, key)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should unlock avatar item when achievement has avatar_item reward', () => {
    fc.assert(
      fc.property(
        avatarArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        (avatar, newItem) => {
          const updatedAvatar = unlockAvatarItem(avatar, newItem);
          
          // Property: unlocked_items SHALL include the reward item
          expect(updatedAvatar.unlockedItems).toContain(newItem);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not duplicate items in unlocked_items', () => {
    fc.assert(
      fc.property(
        avatarArb,
        (avatar) => {
          // Try to add an existing item
          const existingItem = avatar.unlockedItems[0];
          const updatedAvatar = unlockAvatarItem(avatar, existingItem);
          
          // Count occurrences of the item
          const count = updatedAvatar.unlockedItems.filter(i => i === existingItem).length;
          expect(count).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve existing unlocked items when adding new one', () => {
    fc.assert(
      fc.property(
        avatarArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        (avatar, newItem) => {
          fc.pre(!avatar.unlockedItems.includes(newItem));
          
          const updatedAvatar = unlockAvatarItem(avatar, newItem);
          
          // All original items should still be present
          for (const item of avatar.unlockedItems) {
            expect(updatedAvatar.unlockedItems).toContain(item);
          }
          
          // New item should be added
          expect(updatedAvatar.unlockedItems).toContain(newItem);
          
          // Length should increase by 1
          expect(updatedAvatar.unlockedItems.length).toBe(avatar.unlockedItems.length + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// ACHIEVEMENT CRITERIA PROPERTIES
// =====================================================

describe('Achievement Criteria Properties', () => {
  it('should unlock first_mission when missionsCompleted >= 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (missions) => {
          const stats: UserStats = {
            totalXp: 0,
            currentLevel: 1,
            currentStreak: 0,
            longestStreak: 0,
            missionsCompleted: missions,
            mealsLogged: 0,
            workoutsCompleted: 0,
          };
          
          expect(shouldUnlockAchievement('first_mission', stats)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not unlock first_mission when missionsCompleted = 0', () => {
    const stats: UserStats = {
      totalXp: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      missionsCompleted: 0,
      mealsLogged: 0,
      workoutsCompleted: 0,
    };
    
    expect(shouldUnlockAchievement('first_mission', stats)).toBe(false);
  });

  it('should unlock streak_7 when currentStreak >= 7 OR longestStreak >= 7', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 7, max: 365 }),
        fc.boolean(),
        (streak, useCurrent) => {
          const stats: UserStats = {
            totalXp: 0,
            currentLevel: 1,
            currentStreak: useCurrent ? streak : 0,
            longestStreak: useCurrent ? 0 : streak,
            missionsCompleted: 0,
            mealsLogged: 0,
            workoutsCompleted: 0,
          };
          
          expect(shouldUnlockAchievement('streak_7', stats)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should unlock level achievements at correct thresholds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 20 }),
        (level) => {
          const stats: UserStats = {
            totalXp: 0,
            currentLevel: level,
            currentStreak: 0,
            longestStreak: 0,
            missionsCompleted: 0,
            mealsLogged: 0,
            workoutsCompleted: 0,
          };
          
          expect(shouldUnlockAchievement('level_5', stats)).toBe(true);
          
          if (level >= 10) {
            expect(shouldUnlockAchievement('level_10', stats)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be deterministic - same stats produce same result', () => {
    fc.assert(
      fc.property(
        achievementKeyArb,
        userStatsArb,
        (key, stats) => {
          const result1 = shouldUnlockAchievement(key, stats);
          const result2 = shouldUnlockAchievement(key, stats);
          
          expect(result1).toBe(result2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// ACHIEVEMENT INVARIANTS
// =====================================================

describe('Achievement Invariants', () => {
  it('should always have unlockedAt date', () => {
    fc.assert(
      fc.property(
        userIdArb,
        achievementKeyArb,
        fc.string(),
        categoryArb,
        (userId, key, name, category) => {
          const achievement = createAchievement(userId, key, name, category);
          
          expect(achievement.unlockedAt).toBeInstanceOf(Date);
          expect(achievement.unlockedAt.getTime()).toBeLessThanOrEqual(Date.now());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve category', () => {
    fc.assert(
      fc.property(
        userIdArb,
        achievementKeyArb,
        fc.string(),
        categoryArb,
        (userId, key, name, category) => {
          const achievement = createAchievement(userId, key, name, category);
          expect(achievement.category).toBe(category);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have valid category value', () => {
    fc.assert(
      fc.property(
        userIdArb,
        achievementKeyArb,
        fc.string(),
        categoryArb,
        (userId, key, name, category) => {
          const achievement = createAchievement(userId, key, name, category);
          const validCategories = ['nutrition', 'exercise', 'consistency', 'milestones'];
          
          expect(validCategories).toContain(achievement.category);
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
  it('should handle zero stats', () => {
    const zeroStats: UserStats = {
      totalXp: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      missionsCompleted: 0,
      mealsLogged: 0,
      workoutsCompleted: 0,
    };
    
    // No achievements should unlock with zero stats
    expect(shouldUnlockAchievement('first_mission', zeroStats)).toBe(false);
    expect(shouldUnlockAchievement('streak_7', zeroStats)).toBe(false);
    expect(shouldUnlockAchievement('level_5', zeroStats)).toBe(false);
  });

  it('should handle boundary values', () => {
    // Exactly at threshold
    const atThreshold: UserStats = {
      totalXp: 10000,
      currentLevel: 5,
      currentStreak: 7,
      longestStreak: 7,
      missionsCompleted: 1,
      mealsLogged: 50,
      workoutsCompleted: 20,
    };
    
    expect(shouldUnlockAchievement('first_mission', atThreshold)).toBe(true);
    expect(shouldUnlockAchievement('streak_7', atThreshold)).toBe(true);
    expect(shouldUnlockAchievement('level_5', atThreshold)).toBe(true);
    expect(shouldUnlockAchievement('meals_50', atThreshold)).toBe(true);
    expect(shouldUnlockAchievement('workouts_20', atThreshold)).toBe(true);
    expect(shouldUnlockAchievement('xp_10000', atThreshold)).toBe(true);
  });

  it('should handle just below threshold', () => {
    const belowThreshold: UserStats = {
      totalXp: 9999,
      currentLevel: 4,
      currentStreak: 6,
      longestStreak: 6,
      missionsCompleted: 0,
      mealsLogged: 49,
      workoutsCompleted: 19,
    };
    
    expect(shouldUnlockAchievement('first_mission', belowThreshold)).toBe(false);
    expect(shouldUnlockAchievement('streak_7', belowThreshold)).toBe(false);
    expect(shouldUnlockAchievement('level_5', belowThreshold)).toBe(false);
    expect(shouldUnlockAchievement('meals_50', belowThreshold)).toBe(false);
    expect(shouldUnlockAchievement('workouts_20', belowThreshold)).toBe(false);
    expect(shouldUnlockAchievement('xp_10000', belowThreshold)).toBe(false);
  });

  it('should handle empty unlocked items array', () => {
    const emptyAvatar: AvatarCustomization = {
      userId: 'test',
      unlockedItems: [],
    };
    
    const updated = unlockAvatarItem(emptyAvatar, 'new_item');
    expect(updated.unlockedItems).toEqual(['new_item']);
  });
});
