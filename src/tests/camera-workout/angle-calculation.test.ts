/**
 * 📐 Property Tests - Angle Calculation
 * Validates: Requirements 3.2 (Angle Calculation Correctness)
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateAngle,
  calculateKneeAngle,
  calculateElbowAngle,
  calculateHipAngle,
  calculateExerciseAngles,
  isInSafeZone,
} from '@/services/camera-workout/angleCalculator';
import type { Keypoint, KeypointId } from '@/types/camera-workout';

// Helper para criar keypoint
function createKeypoint(
  id: KeypointId,
  x: number,
  y: number,
  confidence = 0.9
): Keypoint {
  return { id, name: id, x, y, confidence };
}

// Arbitrary para pontos 2D normalizados (0-1)
const point2D = fc.record({
  x: fc.float({ min: 0, max: 1, noNaN: true }),
  y: fc.float({ min: 0, max: 1, noNaN: true }),
});

// Arbitrary para keypoints com confiança
const keypointArb = (id: KeypointId) =>
  fc.record({
    id: fc.constant(id),
    name: fc.constant(id),
    x: fc.float({ min: 0, max: 1, noNaN: true }),
    y: fc.float({ min: 0, max: 1, noNaN: true }),
    confidence: fc.float({ min: 0, max: 1, noNaN: true }),
  });

describe('Angle Calculation - Property Tests', () => {
  describe('Property 8: Angle Calculation Correctness', () => {
    it('should always return angle between 0 and 180 degrees', () => {
      fc.assert(
        fc.property(point2D, point2D, point2D, (p1, p2, p3) => {
          const angle = calculateAngle(p1, p2, p3);
          expect(angle).toBeGreaterThanOrEqual(0);
          expect(angle).toBeLessThanOrEqual(180);
        }),
        { numRuns: 100 }
      );
    });

    it('should return 180 for collinear points', () => {
      // Pontos em linha reta horizontal
      const p1 = { x: 0, y: 0.5 };
      const p2 = { x: 0.5, y: 0.5 };
      const p3 = { x: 1, y: 0.5 };

      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(180, 1);
    });

    it('should return 90 for perpendicular points', () => {
      // Ângulo reto
      const p1 = { x: 0, y: 0.5 };
      const p2 = { x: 0.5, y: 0.5 };
      const p3 = { x: 0.5, y: 0 };

      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(90, 1);
    });

    it('should be symmetric (order of p1 and p3 does not matter)', () => {
      fc.assert(
        fc.property(point2D, point2D, point2D, (p1, p2, p3) => {
          const angle1 = calculateAngle(p1, p2, p3);
          const angle2 = calculateAngle(p3, p2, p1);
          expect(angle1).toBeCloseTo(angle2, 5);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle coincident points gracefully (return 180)', () => {
      const p = { x: 0.5, y: 0.5 };
      const angle = calculateAngle(p, p, p);
      expect(angle).toBe(180);
    });

    it('should handle vertex coincident with one endpoint', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 0.5, y: 0.5 };
      const angle = calculateAngle(p1, p1, p2);
      expect(angle).toBe(180); // Degenerate case
    });
  });

  describe('Knee Angle Calculation', () => {
    it('should return null for low confidence keypoints', () => {
      const keypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.2), // Low confidence
        createKeypoint('left_knee', 0.5, 0.5, 0.9),
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
      ];

      const angle = calculateKneeAngle(keypoints, 'left');
      expect(angle).toBeNull();
    });

    it('should return valid angle for high confidence keypoints', () => {
      const keypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.5, 0.5, 0.9),
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
      ];

      const angle = calculateKneeAngle(keypoints, 'left');
      expect(angle).not.toBeNull();
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThanOrEqual(180);
    });

    it('should calculate realistic squat angles', () => {
      // Posição em pé (joelho quase reto)
      const standingKeypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.5, 0.5, 0.9),
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
      ];

      const standingAngle = calculateKneeAngle(standingKeypoints, 'left');
      expect(standingAngle).toBeCloseTo(180, 0); // Quase reto

      // Posição agachada (joelho dobrado)
      const squatKeypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.4, 0.9),
        createKeypoint('left_knee', 0.6, 0.5, 0.9),
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
      ];

      const squatAngle = calculateKneeAngle(squatKeypoints, 'left');
      expect(squatAngle).not.toBeNull();
      expect(squatAngle!).toBeLessThan(standingAngle!);
    });
  });

  describe('Exercise Angles Calculation', () => {
    it('should calculate squat angles with both sides', () => {
      const keypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.4, 0.3, 0.9),
        createKeypoint('left_knee', 0.4, 0.5, 0.9),
        createKeypoint('left_ankle', 0.4, 0.7, 0.9),
        createKeypoint('right_hip', 0.6, 0.3, 0.9),
        createKeypoint('right_knee', 0.6, 0.5, 0.9),
        createKeypoint('right_ankle', 0.6, 0.7, 0.9),
        createKeypoint('left_shoulder', 0.4, 0.1, 0.9),
      ];

      const angles = calculateExerciseAngles(keypoints, 'squat');
      expect(angles.primary).toBeGreaterThanOrEqual(0);
      expect(angles.primary).toBeLessThanOrEqual(180);
    });

    it('should calculate pushup angles', () => {
      const keypoints: Keypoint[] = [
        createKeypoint('left_shoulder', 0.3, 0.5, 0.9),
        createKeypoint('left_elbow', 0.5, 0.5, 0.9),
        createKeypoint('left_wrist', 0.7, 0.5, 0.9),
        createKeypoint('right_shoulder', 0.3, 0.6, 0.9),
        createKeypoint('right_elbow', 0.5, 0.6, 0.9),
        createKeypoint('right_wrist', 0.7, 0.6, 0.9),
      ];

      const angles = calculateExerciseAngles(keypoints, 'pushup');
      expect(angles.primary).toBeGreaterThanOrEqual(0);
      expect(angles.primary).toBeLessThanOrEqual(180);
    });
  });

  describe('Safe Zone Detection', () => {
    it('should correctly identify angles within safe zone', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 180, noNaN: true }),
          fc.float({ min: 0, max: 180, noNaN: true }),
          fc.float({ min: 1, max: 30, noNaN: true }),
          (angle, target, tolerance) => {
            const inZone = isInSafeZone(angle, target, tolerance);
            const diff = Math.abs(angle - target);
            
            if (diff <= tolerance) {
              expect(inZone).toBe(true);
            } else {
              expect(inZone).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return true when angle equals target', () => {
      expect(isInSafeZone(90, 90, 15)).toBe(true);
      expect(isInSafeZone(160, 160, 10)).toBe(true);
    });

    it('should return true at boundary', () => {
      expect(isInSafeZone(105, 90, 15)).toBe(true);
      expect(isInSafeZone(75, 90, 15)).toBe(true);
    });

    it('should return false outside boundary', () => {
      expect(isInSafeZone(106, 90, 15)).toBe(false);
      expect(isInSafeZone(74, 90, 15)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing keypoints gracefully', () => {
      const emptyKeypoints: Keypoint[] = [];
      
      expect(calculateKneeAngle(emptyKeypoints, 'left')).toBeNull();
      expect(calculateElbowAngle(emptyKeypoints, 'right')).toBeNull();
      expect(calculateHipAngle(emptyKeypoints, 'left')).toBeNull();
    });

    it('should handle partial keypoints', () => {
      const partialKeypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.5, 0.5, 0.9),
        // Missing ankle
      ];

      expect(calculateKneeAngle(partialKeypoints, 'left')).toBeNull();
    });

    it('should handle extreme coordinate values', () => {
      const extremeKeypoints: Keypoint[] = [
        createKeypoint('left_hip', 0, 0, 0.9),
        createKeypoint('left_knee', 0.5, 0.5, 0.9),
        createKeypoint('left_ankle', 1, 1, 0.9),
      ];

      const angle = calculateKneeAngle(extremeKeypoints, 'left');
      expect(angle).not.toBeNull();
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThanOrEqual(180);
    });
  });
});
