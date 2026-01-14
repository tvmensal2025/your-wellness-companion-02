/**
 * Property-Based Tests for Trend Analyzer
 * 
 * Feature: real-heart-monitoring
 * Property 3: Trend Classification Consistency
 * Property 11: Sparkline Data Transformation
 * Validates: Requirements 2.2, 2.3, 2.4, 2.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  analyzeTrend,
  normalizeForSparkline,
  generateSparklinePath,
  hasEnoughDataForTrend,
  TrendDirection,
} from '@/services/cardio/trendAnalyzer';

describe('Trend Analyzer - Property Tests', () => {
  /**
   * Property 3: Trend Classification Consistency
   * For any array of 7 daily heart rate averages, if the difference between 
   * the average of the last 3 days and the first 3 days is less than -5 bpm, 
   * the trend SHALL be 'improving'; if greater than +5 bpm, the trend SHALL 
   * be 'declining'; otherwise 'stable'.
   */
  describe('Property 3: Trend Classification', () => {
    it('should classify as improving when HR decreases by more than 5 bpm', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 70, max: 100 }), // base HR
          fc.integer({ min: 6, max: 20 }), // decrease amount
          (baseHR, decrease) => {
            // First 3 days higher, last 3 days lower
            const dailyAverages = [
              baseHR, baseHR + 1, baseHR - 1, // first 3 (avg = baseHR)
              baseHR - decrease, baseHR - decrease - 1, baseHR - decrease + 1, // last 3
              baseHR - decrease, // extra day
            ];
            const result = analyzeTrend(dailyAverages);
            return result.direction === 'improving';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should classify as declining when HR increases by more than 5 bpm', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 60, max: 90 }), // base HR
          fc.integer({ min: 6, max: 20 }), // increase amount
          (baseHR, increase) => {
            // First 3 days lower, last 3 days higher
            const dailyAverages = [
              baseHR, baseHR + 1, baseHR - 1, // first 3 (avg = baseHR)
              baseHR + increase, baseHR + increase - 1, baseHR + increase + 1, // last 3
              baseHR + increase, // extra day
            ];
            const result = analyzeTrend(dailyAverages);
            return result.direction === 'declining';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should classify as stable when HR change is within ±5 bpm', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 60, max: 100 }), // base HR
          fc.integer({ min: -5, max: 5 }), // small change
          (baseHR, change) => {
            const dailyAverages = [
              baseHR, baseHR, baseHR, // first 3
              baseHR + change, baseHR + change, baseHR + change, // last 3
              baseHR + change, // extra
            ];
            const result = analyzeTrend(dailyAverages);
            return result.direction === 'stable';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return insufficient for less than 3 data points', () => {
      expect(analyzeTrend([70, 72]).direction).toBe('insufficient');
      expect(analyzeTrend([70]).direction).toBe('insufficient');
      expect(analyzeTrend([]).direction).toBe('insufficient');
    });
  });

  /**
   * Property 11: Sparkline Data Transformation
   * For any array of daily heart rate averages, the sparkline data transformation 
   * SHALL produce an array of the same length with values normalized to the display range.
   */
  describe('Property 11: Sparkline Normalization', () => {
    it('should produce array of same length as input', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 50, max: 150 }), { minLength: 1, maxLength: 14 }),
          (values) => {
            const normalized = normalizeForSparkline(values);
            return normalized.length === values.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should normalize values to 0-100 range', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 50, max: 150 }), { minLength: 1, maxLength: 14 }),
          (values) => {
            const normalized = normalizeForSparkline(values);
            return normalized.every(p => 
              p.normalizedValue >= 0 && p.normalizedValue <= 100
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve original values in output', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 50, max: 150 }), { minLength: 1, maxLength: 14 }),
          (values) => {
            const normalized = normalizeForSparkline(values);
            return normalized.every((p, i) => p.value === values[i]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty array', () => {
      const result = normalizeForSparkline([]);
      expect(result).toEqual([]);
    });
  });

  describe('Sparkline Path Generation', () => {
    it('should generate valid SVG path for multiple points', () => {
      const points = normalizeForSparkline([70, 72, 68, 75, 71]);
      const path = generateSparklinePath(points, 100, 40);
      
      expect(path).toMatch(/^M /);
      expect(path).toContain(' L ');
    });

    it('should generate horizontal line for single point', () => {
      const points = normalizeForSparkline([70]);
      const path = generateSparklinePath(points, 100, 40);
      
      expect(path).toMatch(/^M 0 \d+ L 100 \d+$/);
    });

    it('should return empty string for empty array', () => {
      const path = generateSparklinePath([]);
      expect(path).toBe('');
    });
  });

  describe('Data Sufficiency Check', () => {
    it('should require at least 3 valid data points', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 50, max: 150 }), { minLength: 3, maxLength: 14 }),
          (values) => {
            return hasEnoughDataForTrend(values) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false for insufficient data', () => {
      expect(hasEnoughDataForTrend([70, 72])).toBe(false);
      expect(hasEnoughDataForTrend([70])).toBe(false);
      expect(hasEnoughDataForTrend([])).toBe(false);
    });
  });
});
