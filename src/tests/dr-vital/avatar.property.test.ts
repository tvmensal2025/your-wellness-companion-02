// =====================================================
// AVATAR PROPERTY TESTS
// =====================================================
// Property 12: Avatar Mood Health Score Mapping
// =====================================================

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { AvatarMood } from '@/types/dr-vital-revolution';

// =====================================================
// AVATAR MOOD DERIVATION FUNCTION
// =====================================================

/**
 * Derives avatar mood from health score
 * Property 12: score >= 80 → 'happy', 60-79 → 'neutral', 40-59 → 'concerned', < 40 → 'concerned' with alert
 */
function deriveAvatarMood(healthScore: number | undefined): AvatarMood {
  if (healthScore === undefined) return 'neutral';
  
  if (healthScore >= 80) return 'happy';
  if (healthScore >= 60) return 'neutral';
  return 'concerned';
}

/**
 * Determines if avatar should show alert animation
 */
function shouldShowAlertAnimation(healthScore: number | undefined): boolean {
  if (healthScore === undefined) return false;
  return healthScore < 40;
}

// =====================================================
// PROPERTY 12: Avatar Mood Health Score Mapping
// =====================================================

describe('Property 12: Avatar Mood Health Score Mapping', () => {
  // Property 12a: Score >= 80 should result in 'happy' mood
  it('should return happy mood for scores >= 80', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 80, max: 100 }),
        (score) => {
          const mood = deriveAvatarMood(score);
          expect(mood).toBe('happy');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 12b: Score 60-79 should result in 'neutral' mood
  it('should return neutral mood for scores 60-79', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 60, max: 79 }),
        (score) => {
          const mood = deriveAvatarMood(score);
          expect(mood).toBe('neutral');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 12c: Score 40-59 should result in 'concerned' mood
  it('should return concerned mood for scores 40-59', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 40, max: 59 }),
        (score) => {
          const mood = deriveAvatarMood(score);
          expect(mood).toBe('concerned');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 12d: Score < 40 should result in 'concerned' mood with alert
  it('should return concerned mood with alert for scores < 40', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 39 }),
        (score) => {
          const mood = deriveAvatarMood(score);
          const showAlert = shouldShowAlertAnimation(score);
          
          expect(mood).toBe('concerned');
          expect(showAlert).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 12e: Undefined score should result in 'neutral' mood
  it('should return neutral mood for undefined score', () => {
    const mood = deriveAvatarMood(undefined);
    expect(mood).toBe('neutral');
  });

  // Property 12f: Alert animation should only show for scores < 40
  it('should only show alert animation for scores < 40', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (score) => {
          const showAlert = shouldShowAlertAnimation(score);
          
          if (score < 40) {
            expect(showAlert).toBe(true);
          } else {
            expect(showAlert).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 12g: Mood transitions should be monotonic with score
  it('should have monotonic mood transitions as score increases', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 50 }),
        (baseScore, increment) => {
          const higherScore = Math.min(100, baseScore + increment);
          
          const baseMood = deriveAvatarMood(baseScore);
          const higherMood = deriveAvatarMood(higherScore);
          
          const moodOrder: Record<AvatarMood, number> = {
            concerned: 0,
            neutral: 1,
            happy: 2,
            excited: 3,
          };
          
          // Higher score should never result in worse mood
          expect(moodOrder[higherMood]).toBeGreaterThanOrEqual(moodOrder[baseMood]);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 12h: Boundary conditions should be correct
  it('should handle boundary conditions correctly', () => {
    // Exact boundaries
    expect(deriveAvatarMood(80)).toBe('happy');
    expect(deriveAvatarMood(79)).toBe('neutral');
    expect(deriveAvatarMood(60)).toBe('neutral');
    expect(deriveAvatarMood(59)).toBe('concerned');
    expect(deriveAvatarMood(40)).toBe('concerned');
    expect(deriveAvatarMood(39)).toBe('concerned');
    
    // Alert boundaries
    expect(shouldShowAlertAnimation(40)).toBe(false);
    expect(shouldShowAlertAnimation(39)).toBe(true);
  });

  // Property 12i: All valid scores should produce valid moods
  it('should always produce valid mood values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (score) => {
          const mood = deriveAvatarMood(score);
          const validMoods: AvatarMood[] = ['happy', 'neutral', 'concerned', 'excited'];
          
          expect(validMoods).toContain(mood);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 12j: Mood derivation should be deterministic
  it('should be deterministic - same score always produces same mood', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (score) => {
          const mood1 = deriveAvatarMood(score);
          const mood2 = deriveAvatarMood(score);
          const mood3 = deriveAvatarMood(score);
          
          expect(mood1).toBe(mood2);
          expect(mood2).toBe(mood3);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// AVATAR STATE TESTS
// =====================================================

describe('Avatar State Validation', () => {
  type AvatarState = 'idle' | 'thinking' | 'talking' | 'listening' | 'celebrating' | 'concerned';
  
  const validStates: AvatarState[] = ['idle', 'thinking', 'talking', 'listening', 'celebrating', 'concerned'];

  it('should have all required avatar states defined', () => {
    expect(validStates).toContain('idle');
    expect(validStates).toContain('thinking');
    expect(validStates).toContain('talking');
    expect(validStates).toContain('listening');
    expect(validStates).toContain('celebrating');
    expect(validStates).toContain('concerned');
  });

  it('should have exactly 6 avatar states', () => {
    expect(validStates.length).toBe(6);
  });
});

// =====================================================
// AVATAR CUSTOMIZATION TESTS
// =====================================================

describe('Avatar Customization Validation', () => {
  interface AvatarCustomization {
    currentOutfit: string;
    currentAccessory?: string;
    currentBackground: string;
    unlockedItems: string[];
  }

  function validateCustomization(customization: AvatarCustomization): boolean {
    // Must have current outfit
    if (!customization.currentOutfit) return false;
    
    // Must have current background
    if (!customization.currentBackground) return false;
    
    // Unlocked items must be an array
    if (!Array.isArray(customization.unlockedItems)) return false;
    
    // Current outfit must be in unlocked items
    if (!customization.unlockedItems.includes(customization.currentOutfit)) return false;
    
    // If accessory is set, it must be in unlocked items
    if (customization.currentAccessory && 
        !customization.unlockedItems.includes(customization.currentAccessory)) {
      return false;
    }
    
    return true;
  }

  it('should validate that current outfit is in unlocked items', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        (items) => {
          const customization: AvatarCustomization = {
            currentOutfit: items[0],
            currentBackground: 'clinic',
            unlockedItems: items,
          };
          
          expect(validateCustomization(customization)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject customization with outfit not in unlocked items', () => {
    const customization: AvatarCustomization = {
      currentOutfit: 'premium_outfit',
      currentBackground: 'clinic',
      unlockedItems: ['default'],
    };
    
    expect(validateCustomization(customization)).toBe(false);
  });

  it('should accept customization with valid accessory', () => {
    const customization: AvatarCustomization = {
      currentOutfit: 'default',
      currentAccessory: 'stethoscope',
      currentBackground: 'clinic',
      unlockedItems: ['default', 'stethoscope'],
    };
    
    expect(validateCustomization(customization)).toBe(true);
  });

  it('should reject customization with invalid accessory', () => {
    const customization: AvatarCustomization = {
      currentOutfit: 'default',
      currentAccessory: 'premium_accessory',
      currentBackground: 'clinic',
      unlockedItems: ['default'],
    };
    
    expect(validateCustomization(customization)).toBe(false);
  });
});
