/**
 * Property-Based Tests for Zone Classifier
 * 
 * Feature: real-heart-monitoring
 * Property 1: Heart Rate Zone Classification
 * Validates: Requirements 1.4, 1.5, 1.6
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  classifyHeartRateZone, 
  getZoneInfo, 
  getZoneColor,
  HeartRateZone 
} from '@/services/cardio/zoneClassifier';

describe('Zone Classifier - Property Tests', () => {
  /**
   * Property 1: Heart Rate Zone Classification
   * For any heart rate value (bpm), the zone classifier SHALL return exactly one of 
   * the three zones: 'bradycardia' for bpm < 60, 'normal' for 60 ≤ bpm ≤ 100, 
   * and 'elevated' for bpm > 100.
   */
  describe('Property 1: Zone Classification Boundaries', () => {
    it('should classify bpm < 60 as bradycardia', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 59 }),
          (bpm) => {
            const zone = classifyHeartRateZone(bpm);
            return zone === 'bradycardia';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should classify 60 ≤ bpm ≤ 100 as normal', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 60, max: 100 }),
          (bpm) => {
            const zone = classifyHeartRateZone(bpm);
            return zone === 'normal';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should classify bpm > 100 as elevated', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 101, max: 250 }),
          (bpm) => {
            const zone = classifyHeartRateZone(bpm);
            return zone === 'elevated';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return exactly one valid zone for any positive bpm', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 300 }),
          (bpm) => {
            const zone = classifyHeartRateZone(bpm);
            const validZones: HeartRateZone[] = ['bradycardia', 'normal', 'elevated'];
            return validZones.includes(zone);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should return unknown for null/undefined/zero values', () => {
      expect(classifyHeartRateZone(null)).toBe('unknown');
      expect(classifyHeartRateZone(undefined)).toBe('unknown');
      expect(classifyHeartRateZone(0)).toBe('unknown');
      expect(classifyHeartRateZone(-1)).toBe('unknown');
    });

    it('should handle boundary values correctly', () => {
      expect(classifyHeartRateZone(59)).toBe('bradycardia');
      expect(classifyHeartRateZone(60)).toBe('normal');
      expect(classifyHeartRateZone(100)).toBe('normal');
      expect(classifyHeartRateZone(101)).toBe('elevated');
    });
  });

  describe('Zone Info Consistency', () => {
    it('should return consistent zone info for any zone', () => {
      const zones: HeartRateZone[] = ['bradycardia', 'normal', 'elevated', 'unknown'];
      
      zones.forEach(zone => {
        const info = getZoneInfo(zone);
        expect(info.zone).toBe(zone);
        expect(info.label).toBeTruthy();
        expect(info.color).toMatch(/^text-/);
        expect(info.bgColor).toMatch(/^bg-/);
      });
    });

    it('should return color class for any classified zone', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 200 }),
          (bpm) => {
            const zone = classifyHeartRateZone(bpm);
            const color = getZoneColor(zone);
            return color.startsWith('text-');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
