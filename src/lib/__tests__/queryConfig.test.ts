/**
 * Testes para queryConfig
 * 
 * Cobertura:
 * - Configuração do QueryClient
 * - Query keys factory
 * - Retry logic
 */

import { describe, it, expect } from 'vitest';
import { createQueryClient, queryKeys } from '../queryConfig';

describe('queryConfig', () => {
  describe('createQueryClient', () => {
    it('deve criar QueryClient com configurações otimizadas', () => {
      const client = createQueryClient();
      
      expect(client).toBeDefined();
      expect(client.getDefaultOptions()).toBeDefined();
    });

    it('deve ter staleTime de 5 minutos', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();
      
      expect(options.queries?.staleTime).toBe(5 * 60 * 1000);
    });

    it('deve ter gcTime de 60 minutos', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();
      
      expect(options.queries?.gcTime).toBe(60 * 60 * 1000);
    });

    it('deve ter refetchOnWindowFocus desabilitado', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();
      
      expect(options.queries?.refetchOnWindowFocus).toBe(false);
    });

    it('deve ter networkMode offlineFirst', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();
      
      expect(options.queries?.networkMode).toBe('offlineFirst');
    });
  });

  describe('queryKeys', () => {
    describe('user keys', () => {
      it('deve gerar key para all users', () => {
        expect(queryKeys.user.all).toEqual(['user']);
      });

      it('deve gerar key para profile com userId', () => {
        const key = queryKeys.user.profile('user-123');
        expect(key).toEqual(['user', 'profile', 'user-123']);
      });

      it('deve gerar key para stats com userId', () => {
        const key = queryKeys.user.stats('user-123');
        expect(key).toEqual(['user', 'stats', 'user-123']);
      });

      it('deve gerar key para achievements com userId', () => {
        const key = queryKeys.user.achievements('user-123');
        expect(key).toEqual(['user', 'achievements', 'user-123']);
      });
    });

    describe('missions keys', () => {
      it('deve gerar key para all missions', () => {
        expect(queryKeys.missions.all).toEqual(['missions']);
      });

      it('deve gerar key para list', () => {
        expect(queryKeys.missions.list()).toEqual(['missions', 'list']);
      });

      it('deve gerar key para detail com id', () => {
        const key = queryKeys.missions.detail('mission-456');
        expect(key).toEqual(['missions', 'detail', 'mission-456']);
      });

      it('deve gerar key para daily com date', () => {
        const key = queryKeys.missions.daily('2026-01-10');
        expect(key).toEqual(['missions', 'daily', '2026-01-10']);
      });
    });

    describe('challenges keys', () => {
      it('deve gerar key para participation', () => {
        const key = queryKeys.challenges.participation('user-123', 'challenge-789');
        expect(key).toEqual(['challenges', 'participation', 'user-123', 'challenge-789']);
      });
    });

    describe('weight keys', () => {
      it('deve gerar key para history com limit', () => {
        const key = queryKeys.weight.history('user-123', 30);
        expect(key).toEqual(['weight', 'history', 'user-123', 30]);
      });

      it('deve gerar key para latest', () => {
        const key = queryKeys.weight.latest('user-123');
        expect(key).toEqual(['weight', 'latest', 'user-123']);
      });
    });

    describe('nutrition keys', () => {
      it('deve gerar key para daily', () => {
        const key = queryKeys.nutrition.daily('user-123', '2026-01-10');
        expect(key).toEqual(['nutrition', 'daily', 'user-123', '2026-01-10']);
      });

      it('deve gerar key para summary', () => {
        const key = queryKeys.nutrition.summary('user-123', '2026-01-01', '2026-01-10');
        expect(key).toEqual(['nutrition', 'summary', 'user-123', '2026-01-01', '2026-01-10']);
      });
    });

    describe('chat keys', () => {
      it('deve gerar key para conversations', () => {
        const key = queryKeys.chat.conversations('user-123');
        expect(key).toEqual(['chat', 'conversations', 'user-123']);
      });

      it('deve gerar key para messages', () => {
        const key = queryKeys.chat.messages('conv-456');
        expect(key).toEqual(['chat', 'messages', 'conv-456']);
      });
    });
  });

  describe('retry logic', () => {
    it('não deve fazer retry em erros 4xx', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();
      const retryFn = options.queries?.retry as (failureCount: number, error: any) => boolean;
      
      // Simula erro 400
      const error400 = { status: 400 };
      expect(retryFn(0, error400)).toBe(false);
      
      // Simula erro 401
      const error401 = { status: 401 };
      expect(retryFn(0, error401)).toBe(false);
      
      // Simula erro 404
      const error404 = { status: 404 };
      expect(retryFn(0, error404)).toBe(false);
    });

    it('deve fazer retry em erros de rede até 2 vezes', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();
      const retryFn = options.queries?.retry as (failureCount: number, error: any) => boolean;
      
      // Simula erro de rede (sem status)
      const networkError = new Error('Network error');
      
      expect(retryFn(0, networkError)).toBe(true); // Primeira tentativa
      expect(retryFn(1, networkError)).toBe(true); // Segunda tentativa
      expect(retryFn(2, networkError)).toBe(false); // Terceira - não retry
    });

    it('deve fazer retry em erros 5xx', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();
      const retryFn = options.queries?.retry as (failureCount: number, error: any) => boolean;
      
      // Simula erro 500
      const error500 = { status: 500 };
      expect(retryFn(0, error500)).toBe(true);
      
      // Simula erro 503
      const error503 = { status: 503 };
      expect(retryFn(0, error503)).toBe(true);
    });
  });
});
