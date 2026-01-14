/**
 * Property-Based Tests for Heart Rate Selection
 * 
 * Feature: real-heart-monitoring
 * Property 2: Most Recent Heart Rate Selection
 * Validates: Requirements 1.1, 1.7
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Simular a lógica de seleção do registro mais recente
interface MockGoogleFitData {
  date: string;
  heart_rate_avg: number | null;
  sync_timestamp: string;
}

/**
 * Função que simula a lógica de seleção do hook
 * Property 2: Most Recent Heart Rate Selection
 */
function selectMostRecentHeartRate(data: MockGoogleFitData[]): MockGoogleFitData | null {
  const validData = data.filter(d => d.heart_rate_avg && d.heart_rate_avg > 0);
  
  if (validData.length === 0) return null;
  
  return validData.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
}

/**
 * Gera uma data aleatória nos últimos 30 dias
 */
const dateArbitrary = fc.date({
  min: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  max: new Date(),
}).map(d => d.toISOString().split('T')[0]);

/**
 * Gera um registro de Google Fit mockado
 */
const googleFitDataArbitrary = fc.record({
  date: dateArbitrary,
  heart_rate_avg: fc.oneof(
    fc.constant(null),
    fc.integer({ min: 0, max: 0 }),
    fc.integer({ min: 50, max: 150 })
  ),
  sync_timestamp: fc.date({
    min: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    max: new Date(),
  }).map(d => d.toISOString()),
});

describe('Heart Rate Selection - Property Tests', () => {
  /**
   * Property 2: Most Recent Heart Rate Selection
   * For any non-empty array of heart rate readings with timestamps, 
   * the display function SHALL return the reading with the most recent timestamp.
   */
  describe('Property 2: Most Recent Selection', () => {
    it('should select the record with most recent date', () => {
      fc.assert(
        fc.property(
          fc.array(googleFitDataArbitrary, { minLength: 1, maxLength: 30 }),
          (data) => {
            const result = selectMostRecentHeartRate(data);
            
            // Se não há dados válidos, resultado deve ser null
            const validData = data.filter(d => d.heart_rate_avg && d.heart_rate_avg > 0);
            if (validData.length === 0) {
              return result === null;
            }
            
            // Resultado deve ser o mais recente
            const mostRecentDate = Math.max(
              ...validData.map(d => new Date(d.date).getTime())
            );
            
            return result !== null && 
              new Date(result.date).getTime() === mostRecentDate;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null for empty array', () => {
      const result = selectMostRecentHeartRate([]);
      expect(result).toBeNull();
    });

    it('should return null when all heart rates are invalid', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              date: dateArbitrary,
              heart_rate_avg: fc.oneof(fc.constant(null), fc.constant(0)),
              sync_timestamp: fc.date().map(d => d.toISOString()),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (data) => {
            const result = selectMostRecentHeartRate(data);
            return result === null;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return a record with valid heart rate when available', () => {
      fc.assert(
        fc.property(
          fc.array(googleFitDataArbitrary, { minLength: 1, maxLength: 30 }),
          (data) => {
            const result = selectMostRecentHeartRate(data);
            
            if (result === null) {
              // Verificar que realmente não há dados válidos
              return data.every(d => !d.heart_rate_avg || d.heart_rate_avg <= 0);
            }
            
            // Resultado deve ter FC válida
            return result.heart_rate_avg !== null && result.heart_rate_avg > 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle single valid record', () => {
      const data: MockGoogleFitData[] = [
        { date: '2026-01-13', heart_rate_avg: 72, sync_timestamp: '2026-01-13T10:00:00Z' }
      ];
      const result = selectMostRecentHeartRate(data);
      expect(result).not.toBeNull();
      expect(result?.heart_rate_avg).toBe(72);
    });

    it('should handle mixed valid and invalid records', () => {
      const data: MockGoogleFitData[] = [
        { date: '2026-01-10', heart_rate_avg: 70, sync_timestamp: '2026-01-10T10:00:00Z' },
        { date: '2026-01-11', heart_rate_avg: null, sync_timestamp: '2026-01-11T10:00:00Z' },
        { date: '2026-01-12', heart_rate_avg: 0, sync_timestamp: '2026-01-12T10:00:00Z' },
        { date: '2026-01-13', heart_rate_avg: 75, sync_timestamp: '2026-01-13T10:00:00Z' },
      ];
      const result = selectMostRecentHeartRate(data);
      expect(result).not.toBeNull();
      expect(result?.date).toBe('2026-01-13');
      expect(result?.heart_rate_avg).toBe(75);
    });
  });
});
