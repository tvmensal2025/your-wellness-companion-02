/**
 * Testes para logger
 * 
 * Cobertura:
 * - Estrutura do módulo
 * - Métodos disponíveis
 */

import { describe, it, expect } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  describe('estrutura', () => {
    it('deve exportar objeto logger', () => {
      expect(logger).toBeDefined();
      expect(typeof logger).toBe('object');
    });

    it('deve ter método debug', () => {
      expect(typeof logger.debug).toBe('function');
    });

    it('deve ter método info', () => {
      expect(typeof logger.info).toBe('function');
    });

    it('deve ter método warn', () => {
      expect(typeof logger.warn).toBe('function');
    });

    it('deve ter método error', () => {
      expect(typeof logger.error).toBe('function');
    });

    it('deve ter método perf', () => {
      expect(typeof logger.perf).toBe('function');
    });
  });

  describe('execução sem erros', () => {
    it('logger.debug não deve lançar erro', () => {
      expect(() => logger.debug('teste')).not.toThrow();
    });

    it('logger.info não deve lançar erro', () => {
      expect(() => logger.info('teste')).not.toThrow();
    });

    it('logger.warn não deve lançar erro', () => {
      expect(() => logger.warn('teste')).not.toThrow();
    });

    it('logger.error não deve lançar erro', () => {
      expect(() => logger.error('teste')).not.toThrow();
    });

    it('logger.perf não deve lançar erro', () => {
      const start = performance.now();
      expect(() => logger.perf('teste', start)).not.toThrow();
    });

    it('logger.info com dados extras não deve lançar erro', () => {
      expect(() => logger.info('teste', { key: 'value' })).not.toThrow();
    });
  });
});
