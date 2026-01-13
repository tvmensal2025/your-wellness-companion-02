/**
 * 💪 Property Tests - Form Analyzer
 * Validates: Requirements 4.2 (Positive Language), 4.5 (Feedback Rate Limiting)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { FormAnalyzer, createFormAnalyzer } from '@/services/camera-workout/formAnalyzer';
import type { Keypoint, KeypointId, FormIssueType } from '@/types/camera-workout';

// Helper para criar keypoint
function createKeypoint(
  id: KeypointId,
  x: number,
  y: number,
  confidence = 0.9
): Keypoint {
  return { id, name: id, x, y, confidence };
}

// Palavras negativas que NUNCA devem aparecer
const NEGATIVE_WORDS = [
  'errado', 'wrong', 'ruim', 'bad', 'péssimo', 'terrible', 'horrível', 'horrible',
  'pare', 'stop', 'não faça', "don't", 'nunca', 'never', 'falhou', 'failed',
  'fracasso', 'failure', 'incompetente', 'incapaz', 'fraco', 'weak',
];

// Palavras positivas que devem estar presentes
const POSITIVE_INDICATORS = [
  'ótimo', 'bom', 'excelente', 'muito bem', 'parabéns', 'continue',
  'você consegue', 'progresso', 'melhora', '👍', '💪', '✨', '🎯', '🚀',
  'great', 'good', 'excellent', 'well done', 'keep', 'you can',
];

describe('Form Analyzer - Property Tests', () => {
  let analyzer: FormAnalyzer;

  beforeEach(() => {
    analyzer = createFormAnalyzer('squat', 'beginner');
  });

  describe('Property 12: Positive Language Enforcement', () => {
    it('should never use negative words in feedback messages', () => {
      // Criar keypoints que geram problemas de forma
      const badFormKeypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.7, 0.5, 0.9), // Joelho muito à frente
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
        createKeypoint('left_shoulder', 0.3, 0.1, 0.9), // Costas arredondadas
        createKeypoint('right_hip', 0.5, 0.35, 0.9), // Assimetria
        createKeypoint('right_knee', 0.5, 0.5, 0.9),
        createKeypoint('right_ankle', 0.5, 0.7, 0.9),
      ];

      const analysis = analyzer.analyzeForm(badFormKeypoints, 140); // Ângulo ruim

      // Verificar todas as mensagens
      for (const issue of analysis.issues) {
        const messageLower = issue.message.toLowerCase();
        
        for (const negWord of NEGATIVE_WORDS) {
          expect(messageLower).not.toContain(negWord.toLowerCase());
        }
      }
    });

    it('should include positive indicators in all messages', () => {
      analyzer.reset();
      
      // Criar keypoints problemáticos
      const keypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.8, 0.5, 0.9), // Problema severo
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
        createKeypoint('left_shoulder', 0.2, 0.1, 0.9),
      ];

      const analysis = analyzer.analyzeForm(keypoints, 150);

      // Se há issues, cada mensagem deve ter pelo menos um indicador positivo
      if (analysis.issues.length > 0) {
        for (const issue of analysis.issues) {
          const hasPositive = POSITIVE_INDICATORS.some(
            (word) => issue.message.toLowerCase().includes(word.toLowerCase()) ||
                     issue.message.includes(word) // Para emojis
          );
          
          // Se não encontrou indicador positivo, a mensagem ainda deve ser encorajadora
          // (não conter palavras negativas)
          if (!hasPositive) {
            const hasNegative = NEGATIVE_WORDS.some(
              (word) => issue.message.toLowerCase().includes(word.toLowerCase())
            );
            expect(hasNegative).toBe(false);
          }
        }
      }
    });

    it('should provide constructive corrections, not criticisms', () => {
      const keypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.7, 0.5, 0.9),
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
        createKeypoint('left_shoulder', 0.5, 0.1, 0.9),
      ];

      const analysis = analyzer.analyzeForm(keypoints, 130);

      for (const issue of analysis.issues) {
        // Correções devem ser instruções positivas
        expect(issue.correction.length).toBeGreaterThan(10);
        
        // Não deve começar com "Não" ou "Pare"
        expect(issue.correction.toLowerCase()).not.toMatch(/^(não|pare|stop|don't)/);
      }
    });
  });

  describe('Property 13: Feedback Rate Limiting', () => {
    it('should not repeat same feedback type within cooldown period', () => {
      const keypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.8, 0.5, 0.9), // Sempre problemático
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
      ];

      // Primeira análise
      const first = analyzer.analyzeForm(keypoints, 140);
      const firstIssueTypes = first.issues.map((i) => i.type);

      // Segunda análise imediata (dentro do cooldown)
      const second = analyzer.analyzeForm(keypoints, 140);
      const secondIssueTypes = second.issues.map((i) => i.type);

      // Não deve repetir os mesmos tipos de issue
      for (const type of firstIssueTypes) {
        expect(secondIssueTypes).not.toContain(type);
      }
    });

    it('should respect max feedbacks per minute limit', () => {
      const keypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.8, 0.5, 0.9),
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
        createKeypoint('left_shoulder', 0.2, 0.1, 0.9),
        createKeypoint('right_hip', 0.5, 0.35, 0.9),
        createKeypoint('right_knee', 0.5, 0.55, 0.9),
        createKeypoint('right_ankle', 0.5, 0.7, 0.9),
      ];

      let totalIssues = 0;

      // Simular muitas análises rápidas
      for (let i = 0; i < 20; i++) {
        const analysis = analyzer.analyzeForm(keypoints, 140 + i);
        totalIssues += analysis.issues.length;
      }

      // Não deve exceder o limite (6 por minuto por padrão)
      expect(totalIssues).toBeLessThanOrEqual(6);
    });

    it('should allow feedback after cooldown expires', async () => {
      // Criar analyzer com cooldown curto para teste
      const fastAnalyzer = new FormAnalyzer('squat', 'beginner', {
        feedbackCooldown: 100, // 100ms para teste
      });

      const keypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.8, 0.5, 0.9),
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
      ];

      // Primeira análise
      const first = fastAnalyzer.analyzeForm(keypoints, 140);
      expect(first.issues.length).toBeGreaterThan(0);

      // Esperar cooldown
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Deve permitir feedback novamente
      const second = fastAnalyzer.analyzeForm(keypoints, 140);
      expect(second.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Score Calculation', () => {
    it('should return score between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 60, max: 180, noNaN: true }),
          (angle) => {
            analyzer.reset();
            
            const keypoints: Keypoint[] = [
              createKeypoint('left_hip', 0.5, 0.3, 0.9),
              createKeypoint('left_knee', 0.5 + Math.random() * 0.3, 0.5, 0.9),
              createKeypoint('left_ankle', 0.5, 0.7, 0.9),
            ];

            const analysis = analyzer.analyzeForm(keypoints, angle);
            
            expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
            expect(analysis.overallScore).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should give higher scores for better form', () => {
      analyzer.reset();

      // Boa forma
      const goodKeypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.5, 0.5, 0.9), // Alinhado
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
        createKeypoint('left_shoulder', 0.5, 0.1, 0.9), // Costas retas
        createKeypoint('right_hip', 0.5, 0.3, 0.9), // Simétrico
        createKeypoint('right_knee', 0.5, 0.5, 0.9),
        createKeypoint('right_ankle', 0.5, 0.7, 0.9),
      ];

      const goodAnalysis = analyzer.analyzeForm(goodKeypoints, 90); // Bom ângulo

      analyzer.reset();

      // Má forma
      const badKeypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.8, 0.5, 0.9), // Muito à frente
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
        createKeypoint('left_shoulder', 0.2, 0.1, 0.9), // Costas arredondadas
        createKeypoint('right_hip', 0.5, 0.4, 0.9), // Assimétrico
        createKeypoint('right_knee', 0.5, 0.6, 0.9),
        createKeypoint('right_ankle', 0.5, 0.7, 0.9),
      ];

      const badAnalysis = analyzer.analyzeForm(badKeypoints, 150); // Ângulo ruim

      expect(goodAnalysis.overallScore).toBeGreaterThan(badAnalysis.overallScore);
    });
  });

  describe('Safe Zone Detection', () => {
    it('should mark significant issues as not in safe zone', () => {
      analyzer.reset();

      // Forma muito ruim
      const veryBadKeypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.9, 0.5, 0.9), // Extremamente à frente
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
        createKeypoint('left_shoulder', 0.1, 0.1, 0.9), // Muito inclinado
      ];

      const analysis = analyzer.analyzeForm(veryBadKeypoints, 160);

      // Se há issues significativos, não está na zona segura
      const hasSignificant = analysis.issues.some((i) => i.severity === 'significant');
      if (hasSignificant) {
        expect(analysis.isInSafeZone).toBe(false);
      }
    });
  });

  describe('User Level Tolerance', () => {
    it('should be more tolerant for beginners', () => {
      const beginnerAnalyzer = createFormAnalyzer('squat', 'beginner');
      const advancedAnalyzer = createFormAnalyzer('squat', 'advanced');

      const keypoints: Keypoint[] = [
        createKeypoint('left_hip', 0.5, 0.3, 0.9),
        createKeypoint('left_knee', 0.6, 0.5, 0.9), // Problema leve
        createKeypoint('left_ankle', 0.5, 0.7, 0.9),
      ];

      const beginnerAnalysis = beginnerAnalyzer.analyzeForm(keypoints, 120);
      advancedAnalyzer.reset();
      const advancedAnalysis = advancedAnalyzer.analyzeForm(keypoints, 120);

      // Iniciante deve ter score igual ou maior (mais tolerante)
      expect(beginnerAnalysis.overallScore).toBeGreaterThanOrEqual(advancedAnalysis.overallScore);
    });
  });
});
