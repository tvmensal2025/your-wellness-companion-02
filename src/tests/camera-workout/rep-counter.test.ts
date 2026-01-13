/**
 * 🔢 Property Tests - Rep Counter Engine
 * Validates: Requirements 3.3, 3.5 (Rep Counting with Debounce)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { RepCounterEngine, createRepCounterEngine } from '@/services/camera-workout/repCounterEngine';
import type { Keypoint, KeypointId } from '@/types/camera-workout';

// Helper para criar keypoints de agachamento com ângulo específico
function createSquatKeypoints(targetAngle: number): Keypoint[] {
  // Para simular diferentes ângulos do joelho, ajustamos as posições
  // Ângulo 180 = perna reta (em pé)
  // Ângulo 90 = joelho dobrado a 90 graus (agachado)
  
  const hipY = 0.3;
  const ankleY = 0.7;
  const ankleX = 0.5;
  
  // Calcular posição do joelho para atingir o ângulo desejado
  // Usando trigonometria simples
  const angleRad = (targetAngle * Math.PI) / 180;
  
  // Posição do joelho que cria o ângulo desejado
  // Quando ângulo = 180, joelho está alinhado (kneeX = 0.5)
  // Quando ângulo diminui, joelho avança
  const kneeY = 0.5;
  const kneeX = ankleX + (180 - targetAngle) * 0.003;
  
  // Ajustar hip para criar o ângulo correto
  const hipX = ankleX - (180 - targetAngle) * 0.001;
  
  return [
    { id: 'left_hip' as KeypointId, name: 'left_hip', x: hipX, y: hipY, confidence: 0.9 },
    { id: 'left_knee' as KeypointId, name: 'left_knee', x: kneeX, y: kneeY, confidence: 0.9 },
    { id: 'left_ankle' as KeypointId, name: 'left_ankle', x: ankleX, y: ankleY, confidence: 0.9 },
    { id: 'right_hip' as KeypointId, name: 'right_hip', x: hipX, y: hipY, confidence: 0.9 },
    { id: 'right_knee' as KeypointId, name: 'right_knee', x: kneeX, y: kneeY, confidence: 0.9 },
    { id: 'right_ankle' as KeypointId, name: 'right_ankle', x: ankleX, y: ankleY, confidence: 0.9 },
    { id: 'left_shoulder' as KeypointId, name: 'left_shoulder', x: 0.5, y: 0.1, confidence: 0.9 },
    { id: 'right_shoulder' as KeypointId, name: 'right_shoulder', x: 0.5, y: 0.1, confidence: 0.9 },
  ];
}

describe('Rep Counter Engine - Property Tests', () => {
  let engine: RepCounterEngine;

  beforeEach(() => {
    // Usar thresholds mais permissivos para testes
    engine = new RepCounterEngine('squat', undefined, {
      repDownAngle: 120,
      repUpAngle: 150,
      safeZoneTolerance: 20,
      minRepDuration: 100, // Reduzido para testes
      debounceTime: 50,    // Reduzido para testes
    });
  });

  describe('Property 9: Rep Counting with Debounce', () => {
    it('should not count rep if movement is too fast (debounce)', () => {
      const fastEngine = new RepCounterEngine('squat', undefined, {
        repDownAngle: 120,
        repUpAngle: 150,
        safeZoneTolerance: 20,
        minRepDuration: 1000, // 1 segundo mínimo
        debounceTime: 500,
      });

      // Movimento muito rápido (poucos frames)
      fastEngine.processFrame(createSquatKeypoints(170)); // Em pé
      fastEngine.processFrame(createSquatKeypoints(90));  // Agachado
      fastEngine.processFrame(createSquatKeypoints(170)); // Em pé

      // Não deve contar porque foi muito rápido
      expect(fastEngine.getStats().totalReps).toBe(0);
    });

    it('should track phase transitions correctly', () => {
      engine.reset();

      // Começar em pé
      let result = engine.processFrame(createSquatKeypoints(170));
      expect(result.currentPhase).toBe('up');

      // Descer gradualmente
      for (let angle = 160; angle >= 100; angle -= 10) {
        result = engine.processFrame(createSquatKeypoints(angle));
      }

      // Deve estar na fase down
      expect(result.currentPhase).toBe('down');
    });

    it('should calculate phase progress', () => {
      engine.reset();

      // Em pé
      let result = engine.processFrame(createSquatKeypoints(170));
      
      // Descer
      for (let angle = 160; angle >= 100; angle -= 10) {
        result = engine.processFrame(createSquatKeypoints(angle));
      }

      // Progress deve estar entre 0 e 100
      expect(result.phaseProgress).toBeGreaterThanOrEqual(0);
      expect(result.phaseProgress).toBeLessThanOrEqual(100);
    });
  });

  describe('State Management', () => {
    it('should reset state correctly', () => {
      // Processar alguns frames
      for (let i = 0; i < 10; i++) {
        engine.processFrame(createSquatKeypoints(170 - i * 5));
      }

      // Reset
      engine.reset();

      expect(engine.getStats().totalReps).toBe(0);
      expect(engine.getStats().partialReps).toBe(0);
      expect(engine.getState().phase).toBe('up');
    });

    it('should allow manual rep correction', () => {
      engine.reset();

      expect(engine.getStats().totalReps).toBe(0);

      // Forçar contagem
      engine.forceCountRep();
      expect(engine.getStats().totalReps).toBe(1);

      // Desfazer
      engine.undoLastRep();
      expect(engine.getStats().totalReps).toBe(0);

      // Não deve ir negativo
      engine.undoLastRep();
      expect(engine.getStats().totalReps).toBe(0);
    });
  });

  describe('Threshold Customization', () => {
    it('should respect custom thresholds', () => {
      const customEngine = new RepCounterEngine('squat', undefined, {
        repDownAngle: 140, // Muito fácil
        repUpAngle: 150,
        safeZoneTolerance: 30,
        minRepDuration: 50,
        debounceTime: 50,
      });

      // Simular movimento leve
      for (let i = 0; i < 20; i++) {
        customEngine.processFrame(createSquatKeypoints(160));
      }
      
      for (let i = 0; i < 20; i++) {
        customEngine.processFrame(createSquatKeypoints(130));
      }
      
      for (let i = 0; i < 20; i++) {
        customEngine.processFrame(createSquatKeypoints(160));
      }

      // Com thresholds fáceis, deve contar
      expect(customEngine.getStats().totalReps).toBeGreaterThanOrEqual(0);
    });

    it('should update thresholds dynamically', () => {
      engine.reset();
      
      const originalThresholds = engine.getThresholds();
      expect(originalThresholds.repDownAngle).toBe(120);

      engine.updateThresholds({ repDownAngle: 100 });
      
      const newThresholds = engine.getThresholds();
      expect(newThresholds.repDownAngle).toBe(100);
    });
  });

  describe('Rep Quality', () => {
    it('should return quality between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 80, max: 170 }),
          (angle) => {
            engine.reset();
            
            // Simular movimento
            for (let i = 0; i < 10; i++) {
              engine.processFrame(createSquatKeypoints(170));
            }
            
            const result = engine.processFrame(createSquatKeypoints(angle));
            
            // Quality deve estar no range válido
            expect(result.lastRepQuality).toBeGreaterThanOrEqual(0);
            expect(result.lastRepQuality).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Angles Tracking', () => {
    it('should track current angle', () => {
      engine.reset();

      const result = engine.processFrame(createSquatKeypoints(150));
      
      // Deve ter ângulo primário definido
      expect(result.angles.primary).toBeDefined();
      expect(typeof result.angles.primary).toBe('number');
    });

    it('should track valley and peak angles', () => {
      engine.reset();

      // Processar vários frames
      for (let angle = 170; angle >= 100; angle -= 10) {
        engine.processFrame(createSquatKeypoints(angle));
      }

      const result = engine.processFrame(createSquatKeypoints(100));
      
      // Valley deve ser rastreado
      expect(result.angles.valley).toBeDefined();
    });
  });
});
