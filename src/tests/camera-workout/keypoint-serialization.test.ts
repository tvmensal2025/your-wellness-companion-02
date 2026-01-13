/**
 * 🧪 Property Test: Keypoint Serialization Round-Trip
 * Feature: camera-workout-pose-estimation
 * Property 21: Keypoint Serialization Round-Trip
 * Validates: Requirements 8.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Keypoint, KeypointId } from '@/types/camera-workout';

// Lista de todos os keypoint IDs válidos
const VALID_KEYPOINT_IDS: KeypointId[] = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
];

// Arbitrary para gerar KeypointId válido
const keypointIdArb = fc.constantFrom(...VALID_KEYPOINT_IDS);

// Arbitrary para gerar um Keypoint válido (sem Infinity)
const keypointArb: fc.Arbitrary<Keypoint> = fc.record({
  id: keypointIdArb,
  name: fc.string({ minLength: 1, maxLength: 50 }),
  x: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
  y: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
  confidence: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
  worldX: fc.option(fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }), { nil: undefined }),
  worldY: fc.option(fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }), { nil: undefined }),
  worldZ: fc.option(fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }), { nil: undefined }),
});

// Arbitrary para gerar array de Keypoints (17 keypoints COCO)
const keypointsArrayArb = fc.array(keypointArb, { minLength: 1, maxLength: 17 });

// Funções de serialização/deserialização
function serializeKeypoints(keypoints: Keypoint[]): string {
  return JSON.stringify(keypoints);
}

function deserializeKeypoints(json: string): Keypoint[] {
  return JSON.parse(json);
}

// Função para comparar keypoints com tolerância de ponto flutuante
function keypointsEqual(a: Keypoint[], b: Keypoint[], tolerance = 1e-10): boolean {
  if (a.length !== b.length) return false;
  
  return a.every((kpA, i) => {
    const kpB = b[i];
    return (
      kpA.id === kpB.id &&
      kpA.name === kpB.name &&
      Math.abs(kpA.x - kpB.x) < tolerance &&
      Math.abs(kpA.y - kpB.y) < tolerance &&
      Math.abs(kpA.confidence - kpB.confidence) < tolerance &&
      (kpA.worldX === undefined ? kpB.worldX === undefined : 
        kpB.worldX !== undefined && Math.abs(kpA.worldX - kpB.worldX) < tolerance) &&
      (kpA.worldY === undefined ? kpB.worldY === undefined : 
        kpB.worldY !== undefined && Math.abs(kpA.worldY - kpB.worldY) < tolerance) &&
      (kpA.worldZ === undefined ? kpB.worldZ === undefined : 
        kpB.worldZ !== undefined && Math.abs(kpA.worldZ - kpB.worldZ) < tolerance)
    );
  });
}

describe('Camera Workout - Keypoint Serialization', () => {
  /**
   * Property 21: Keypoint Serialization Round-Trip
   * For any valid Keypoint array, serializing to JSON and deserializing back
   * should produce an equivalent array with all values preserved within
   * floating-point tolerance.
   */
  it('should preserve keypoints through JSON serialization round-trip', () => {
    fc.assert(
      fc.property(keypointsArrayArb, (keypoints) => {
        // Serialize
        const serialized = serializeKeypoints(keypoints);
        
        // Deserialize
        const deserialized = deserializeKeypoints(serialized);
        
        // Verify round-trip preserves data
        expect(keypointsEqual(keypoints, deserialized)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all 17 COCO keypoints through serialization', () => {
    fc.assert(
      fc.property(
        fc.array(keypointArb, { minLength: 17, maxLength: 17 }),
        (keypoints) => {
          const serialized = serializeKeypoints(keypoints);
          const deserialized = deserializeKeypoints(serialized);
          
          expect(deserialized.length).toBe(17);
          expect(keypointsEqual(keypoints, deserialized)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty keypoints array', () => {
    const empty: Keypoint[] = [];
    const serialized = serializeKeypoints(empty);
    const deserialized = deserializeKeypoints(serialized);
    
    expect(deserialized).toEqual([]);
  });

  it('should preserve normalized coordinates (0-1 range)', () => {
    fc.assert(
      fc.property(keypointsArrayArb, (keypoints) => {
        const serialized = serializeKeypoints(keypoints);
        const deserialized = deserializeKeypoints(serialized);
        
        // All coordinates should remain in 0-1 range
        deserialized.forEach(kp => {
          expect(kp.x).toBeGreaterThanOrEqual(0);
          expect(kp.x).toBeLessThanOrEqual(1);
          expect(kp.y).toBeGreaterThanOrEqual(0);
          expect(kp.y).toBeLessThanOrEqual(1);
          expect(kp.confidence).toBeGreaterThanOrEqual(0);
          expect(kp.confidence).toBeLessThanOrEqual(1);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve optional 3D world coordinates', () => {
    fc.assert(
      fc.property(keypointsArrayArb, (keypoints) => {
        const serialized = serializeKeypoints(keypoints);
        const deserialized = deserializeKeypoints(serialized);
        
        keypoints.forEach((kp, i) => {
          const dkp = deserialized[i];
          
          // Optional fields should be preserved correctly
          if (kp.worldX !== undefined) {
            expect(dkp.worldX).toBeDefined();
            expect(Math.abs(kp.worldX - dkp.worldX!)).toBeLessThan(1e-10);
          } else {
            expect(dkp.worldX).toBeUndefined();
          }
        });
      }),
      { numRuns: 100 }
    );
  });
});
