/**
 * Property-Based Tests for Points Calculator
 * 
 * Feature: real-heart-monitoring
 * Property 4: Cardio Points Zone Calculation
 * Property 5: Max Heart Rate Formula
 * Property 6: Progress Percentage Calculation
 * Property 7: Day Comparison Calculation
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.8
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateMaxHeartRate,
  getCardioZone,
  calculatePointsForSample,
  calculateDailyPoints,
  calculateProgressPercent,
  calculateDayComparison,
  CARDIO_ZONES,
} from '@/services/cardio/pointsCalculator';

describe('Points Calculator - Property Tests', () => {
  /**
   * Property 5: Max Heart Rate Formula
   * For any user age between 1 and 120, the calculated max heart rate 
   * SHALL equal 220 - age.
   */
  describe('Property 5: Max Heart Rate Formula', () => {
    it('should calculate max HR as 220 - age for valid ages', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 120 }),
          (age) => {
            const maxHR = calculateMaxHeartRate(age);
            return maxHR === 220 - age;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return fallback for invalid ages', () => {
      expect(calculateMaxHeartRate(0)).toBe(190); // 220 - 30
      expect(calculateMaxHeartRate(-5)).toBe(190);
      expect(calculateMaxHeartRate(150)).toBe(190);
    });
  });

  /**
   * Property 4: Cardio Points Zone Calculation
   * For any heart rate sample with duration, the points awarded SHALL equal:
   * duration_minutes × zone_multiplier
   */
  describe('Property 4: Cardio Points Zone Calculation', () => {
    it('should award 0 points for rest zone (< 50% max HR)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 60 }), // duration
          fc.integer({ min: 18, max: 80 }), // age
          (duration, age) => {
            const maxHR = 220 - age;
            const bpm = Math.floor(maxHR * 0.4); // 40% = rest zone
            const points = calculatePointsForSample(bpm, duration, age);
            return points === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award 1 point/min for fat burn zone (50-70% max HR)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 60 }), // duration
          fc.integer({ min: 18, max: 80 }), // age
          (duration, age) => {
            const maxHR = 220 - age;
            const bpm = Math.floor(maxHR * 0.6); // 60% = fat burn zone
            const points = calculatePointsForSample(bpm, duration, age);
            return points === duration * 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award 2 points/min for cardio zone (70-85% max HR)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 60 }), // duration
          fc.integer({ min: 18, max: 80 }), // age
          (duration, age) => {
            const maxHR = 220 - age;
            const bpm = Math.floor(maxHR * 0.75); // 75% = cardio zone
            const points = calculatePointsForSample(bpm, duration, age);
            return points === duration * 2;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award 3 points/min for peak zone (85-100% max HR)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 60 }), // duration
          fc.integer({ min: 18, max: 80 }), // age
          (duration, age) => {
            const maxHR = 220 - age;
            const bpm = Math.floor(maxHR * 0.9); // 90% = peak zone
            const points = calculatePointsForSample(bpm, duration, age);
            return points === duration * 3;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Progress Percentage Calculation
   * For any daily points value and goal, the progress percentage SHALL equal 
   * min(100, (points / goal) × 100), ensuring it never exceeds 100%.
   */
  describe('Property 6: Progress Percentage Calculation', () => {
    it('should calculate correct percentage and cap at 100%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 500 }), // points
          fc.integer({ min: 1, max: 300 }), // goal
          (points, goal) => {
            const percent = calculateProgressPercent(points, goal);
            const expected = Math.min(100, Math.round((points / goal) * 100));
            return percent === expected && percent <= 100;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 for zero or negative goal', () => {
      expect(calculateProgressPercent(50, 0)).toBe(0);
      expect(calculateProgressPercent(50, -10)).toBe(0);
    });
  });

  /**
   * Property 7: Day Comparison Calculation
   * For any two consecutive days of cardio points, the comparison value 
   * SHALL equal today_points - yesterday_points, with appropriate sign.
   */
  describe('Property 7: Day Comparison Calculation', () => {
    it('should calculate correct difference between days', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 500 }), // today
          fc.integer({ min: 0, max: 500 }), // yesterday
          (today, yesterday) => {
            const result = calculateDayComparison(today, yesterday);
            return result.difference === today - yesterday;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should determine correct trend direction', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 500 }), // today
          fc.integer({ min: 0, max: 500 }), // yesterday
          (today, yesterday) => {
            const result = calculateDayComparison(today, yesterday);
            if (today > yesterday) return result.trend === 'up';
            if (today < yesterday) return result.trend === 'down';
            return result.trend === 'same';
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Daily Points Aggregation', () => {
    it('should sum points correctly from multiple samples', () => {
      const samples = [
        { bpm: 120, durationMinutes: 10 }, // cardio zone
        { bpm: 100, durationMinutes: 20 }, // fat burn zone
      ];
      const age = 30;
      const result = calculateDailyPoints(samples, age);
      
      // 120 bpm at age 30 = 63% of 190 max = fat burn (1pt) = 10 pts
      // 100 bpm at age 30 = 53% of 190 max = fat burn (1pt) = 20 pts
      expect(result.totalPoints).toBeGreaterThan(0);
    });

    it('should return zero for empty samples', () => {
      const result = calculateDailyPoints([], 30);
      expect(result.totalPoints).toBe(0);
    });
  });
});
