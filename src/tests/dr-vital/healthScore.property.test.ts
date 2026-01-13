// =====================================================
// HEALTH SCORE PROPERTY TESTS
// =====================================================
// Property-based tests using fast-check
// Validates: Requirements 1.1, 1.2
// =====================================================

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateHealthScore,
  getScoreColor,
  isValidBreakdown,
  calculateTrend,
} from '@/services/dr-vital/healthScoreService';
import type { HealthScoreBreakdown, ScoreColor } from '@/types/dr-vital-revolution';

// =====================================================
// ARBITRARIES (Data Generators)
// =====================================================

// Valid breakdown with each component 0-25
const validBreakdownArb = fc.record({
  nutrition: fc.integer({ min: 0, max: 25 }),
  exercise: fc.integer({ min: 0, max: 25 }),
  sleep: fc.integer({ min: 0, max: 25 }),
  mental: fc.integer({ min: 0, max: 25 }),
});

// Invalid breakdown with at least one component out of bounds
const invalidBreakdownArb = fc.oneof(
  fc.record({
    nutrition: fc.integer({ min: -100, max: -1 }),
    exercise: fc.integer({ min: 0, max: 25 }),
    sleep: fc.integer({ min: 0, max: 25 }),
    mental: fc.integer({ min: 0, max: 25 }),
  }),
  fc.record({
    nutrition: fc.integer({ min: 26, max: 100 }),
    exercise: fc.integer({ min: 0, max: 25 }),
    sleep: fc.integer({ min: 0, max: 25 }),
    mental: fc.integer({ min: 0, max: 25 }),
  }),
  fc.record({
    nutrition: fc.integer({ min: 0, max: 25 }),
    exercise: fc.integer({ min: 26, max: 100 }),
    sleep: fc.integer({ min: 0, max: 25 }),
    mental: fc.integer({ min: 0, max: 25 }),
  }),
);

// Valid score 0-100
const validScoreArb = fc.integer({ min: 0, max: 100 });

// Invalid score out of bounds
const invalidScoreArb = fc.oneof(
  fc.integer({ min: -1000, max: -1 }),
  fc.integer({ min: 101, max: 1000 }),
);

// =====================================================
// PROPERTY 1: Health Score Calculation and Color Mapping
// =====================================================
// For any user with health data, the calculated Health Score SHALL be 
// between 0 and 100, and the color mapping SHALL follow: 
// score < 40 → red, 40-69 → yellow, 70+ → green.
// =====================================================

describe('Property 1: Health Score Calculation and Color Mapping', () => {
  it('should always produce score between 0-100 for valid breakdown', () => {
    fc.assert(
      fc.property(validBreakdownArb, (breakdown) => {
        const score = calculateHealthScore(breakdown);
        
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }),
      { numRuns: 100 }
    );
  });

  it('should map score < 40 to red color', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 39 }),
        (score) => {
          const color = getScoreColor(score);
          expect(color).toBe('red');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should map score 40-69 to yellow color', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 40, max: 69 }),
        (score) => {
          const color = getScoreColor(score);
          expect(color).toBe('yellow');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should map score 70-100 to green color', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 70, max: 100 }),
        (score) => {
          const color = getScoreColor(score);
          expect(color).toBe('green');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should throw error for invalid scores', () => {
    fc.assert(
      fc.property(invalidScoreArb, (score) => {
        expect(() => getScoreColor(score)).toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should have correct color at boundary values', () => {
    // Exact boundary tests
    expect(getScoreColor(0)).toBe('red');
    expect(getScoreColor(39)).toBe('red');
    expect(getScoreColor(40)).toBe('yellow');
    expect(getScoreColor(69)).toBe('yellow');
    expect(getScoreColor(70)).toBe('green');
    expect(getScoreColor(100)).toBe('green');
  });

  it('should produce consistent color for same score', () => {
    fc.assert(
      fc.property(validScoreArb, (score) => {
        const color1 = getScoreColor(score);
        const color2 = getScoreColor(score);
        expect(color1).toBe(color2);
      }),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// PROPERTY 2: Health Score Component Sum
// =====================================================
// For any Health Score calculation, the sum of 
// nutrition_score + exercise_score + sleep_score + mental_score 
// SHALL equal the total score, with each component between 0-25.
// =====================================================

describe('Property 2: Health Score Component Sum', () => {
  it('should have component sum equal total score', () => {
    fc.assert(
      fc.property(validBreakdownArb, (breakdown) => {
        const score = calculateHealthScore(breakdown);
        const sum = breakdown.nutrition + breakdown.exercise + breakdown.sleep + breakdown.mental;
        
        expect(score).toBe(sum);
      }),
      { numRuns: 100 }
    );
  });

  it('should validate each component is between 0-25', () => {
    fc.assert(
      fc.property(validBreakdownArb, (breakdown) => {
        expect(breakdown.nutrition).toBeGreaterThanOrEqual(0);
        expect(breakdown.nutrition).toBeLessThanOrEqual(25);
        expect(breakdown.exercise).toBeGreaterThanOrEqual(0);
        expect(breakdown.exercise).toBeLessThanOrEqual(25);
        expect(breakdown.sleep).toBeGreaterThanOrEqual(0);
        expect(breakdown.sleep).toBeLessThanOrEqual(25);
        expect(breakdown.mental).toBeGreaterThanOrEqual(0);
        expect(breakdown.mental).toBeLessThanOrEqual(25);
        
        expect(isValidBreakdown(breakdown)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject invalid breakdowns', () => {
    fc.assert(
      fc.property(invalidBreakdownArb, (breakdown) => {
        expect(isValidBreakdown(breakdown)).toBe(false);
        expect(() => calculateHealthScore(breakdown)).toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should produce minimum score of 0 when all components are 0', () => {
    const breakdown: HealthScoreBreakdown = {
      nutrition: 0,
      exercise: 0,
      sleep: 0,
      mental: 0,
    };
    expect(calculateHealthScore(breakdown)).toBe(0);
  });

  it('should produce maximum score of 100 when all components are 25', () => {
    const breakdown: HealthScoreBreakdown = {
      nutrition: 25,
      exercise: 25,
      sleep: 25,
      mental: 25,
    };
    expect(calculateHealthScore(breakdown)).toBe(100);
  });

  it('should be commutative - order of components does not matter', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 25 }),
        fc.integer({ min: 0, max: 25 }),
        fc.integer({ min: 0, max: 25 }),
        fc.integer({ min: 0, max: 25 }),
        (a, b, c, d) => {
          const breakdown1: HealthScoreBreakdown = {
            nutrition: a,
            exercise: b,
            sleep: c,
            mental: d,
          };
          const breakdown2: HealthScoreBreakdown = {
            nutrition: d,
            exercise: c,
            sleep: b,
            mental: a,
          };
          
          // Sum should be the same regardless of which component has which value
          expect(calculateHealthScore(breakdown1)).toBe(calculateHealthScore(breakdown2));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// ADDITIONAL PROPERTIES: Trend Calculation
// =====================================================

describe('Trend Calculation Properties', () => {
  it('should return stable when no previous score', () => {
    fc.assert(
      fc.property(validScoreArb, (score) => {
        const trend = calculateTrend(score, undefined);
        expect(trend).toBe('stable');
      }),
      { numRuns: 100 }
    );
  });

  it('should return up when current > previous + 2', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 97 }),
        fc.integer({ min: 3, max: 100 }),
        (previous, diff) => {
          const current = Math.min(previous + diff, 100);
          if (current - previous > 2) {
            const trend = calculateTrend(current, previous);
            expect(trend).toBe('up');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return down when current < previous - 2', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 100 }),
        fc.integer({ min: 3, max: 100 }),
        (previous, diff) => {
          const current = Math.max(previous - diff, 0);
          if (previous - current > 2) {
            const trend = calculateTrend(current, previous);
            expect(trend).toBe('down');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return stable when difference is within ±2', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 98 }),
        fc.integer({ min: -2, max: 2 }),
        (previous, diff) => {
          const current = previous + diff;
          if (current >= 0 && current <= 100) {
            const trend = calculateTrend(current, previous);
            expect(trend).toBe('stable');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be deterministic - same inputs produce same output', () => {
    fc.assert(
      fc.property(
        validScoreArb,
        validScoreArb,
        (current, previous) => {
          const trend1 = calculateTrend(current, previous);
          const trend2 = calculateTrend(current, previous);
          expect(trend1).toBe(trend2);
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
  it('should handle all zeros', () => {
    const breakdown: HealthScoreBreakdown = {
      nutrition: 0,
      exercise: 0,
      sleep: 0,
      mental: 0,
    };
    const score = calculateHealthScore(breakdown);
    expect(score).toBe(0);
    expect(getScoreColor(score)).toBe('red');
  });

  it('should handle all max values', () => {
    const breakdown: HealthScoreBreakdown = {
      nutrition: 25,
      exercise: 25,
      sleep: 25,
      mental: 25,
    };
    const score = calculateHealthScore(breakdown);
    expect(score).toBe(100);
    expect(getScoreColor(score)).toBe('green');
  });

  it('should handle mixed extreme values', () => {
    const breakdown: HealthScoreBreakdown = {
      nutrition: 0,
      exercise: 25,
      sleep: 0,
      mental: 25,
    };
    const score = calculateHealthScore(breakdown);
    expect(score).toBe(50);
    expect(getScoreColor(score)).toBe('yellow');
  });

  it('should handle boundary score 40 correctly', () => {
    const breakdown: HealthScoreBreakdown = {
      nutrition: 10,
      exercise: 10,
      sleep: 10,
      mental: 10,
    };
    const score = calculateHealthScore(breakdown);
    expect(score).toBe(40);
    expect(getScoreColor(score)).toBe('yellow');
  });

  it('should handle boundary score 70 correctly', () => {
    const breakdown: HealthScoreBreakdown = {
      nutrition: 17,
      exercise: 18,
      sleep: 17,
      mental: 18,
    };
    const score = calculateHealthScore(breakdown);
    expect(score).toBe(70);
    expect(getScoreColor(score)).toBe('green');
  });
});
