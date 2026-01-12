/**
 * 🏆 useRankingPaginated - Hook de Ranking Escalável
 * 
 * Substitui:
 * - useRanking
 * - useRealRanking
 * - useTopUsers
 * - useSocialRanking (parte de ranking)
 * 
 * Funcionalidades:
 * - Paginação eficiente
 * - Cache inteligente
 * - Suporte a bilhões de usuários
 */

import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS, STALE_TIMES, GC_TIMES, REFETCH_INTERVALS } from '@/services/cache';
import {
  fetchRankingPaginated,
  fetchTopRanking,
  fetchUserPosition,
  fetchRankingWithContext,
  fetchRankingStats,
  type RankingUser,
  type PaginatedRanking,
} from '@/services/api/rankingService';

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK PRINCIPAL - RANKING PAGINADO
// ═══════════════════════════════════════════════════════════

export function useRankingPaginated(page: number = 1, limit: number = 20) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CACHE_KEYS.rankingPaginated(page, limit),
    queryFn: () => fetchRankingPaginated(page, limit),
    staleTime: STALE_TIMES.ranking,
    gcTime: GC_TIMES.medium,
    refetchInterval: REFETCH_INTERVALS.normal,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.ranking() });
  };

  return {
    ...query,
    ranking: query.data?.users || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: query.data?.totalPages || 0,
    hasNextPage: query.data?.hasNextPage || false,
    hasPreviousPage: query.data?.hasPreviousPage || false,
    invalidate,
  };
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK TOP N - PARA EXIBIÇÃO RÁPIDA
// ═══════════════════════════════════════════════════════════

export function useTopRanking(limit: number = 10) {
  const query = useQuery({
    queryKey: CACHE_KEYS.rankingTop(limit),
    queryFn: () => fetchTopRanking(limit),
    staleTime: STALE_TIMES.ranking,
    gcTime: GC_TIMES.medium,
    refetchInterval: REFETCH_INTERVALS.normal,
  });

  return {
    ...query,
    ranking: query.data || [],
    loading: query.isLoading,
  };
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK COM CONTEXTO DO USUÁRIO
// ═══════════════════════════════════════════════════════════

export function useRankingWithContext(userId: string | undefined) {
  const enabled = !!userId;

  const query = useQuery({
    queryKey: ['ranking', 'context', userId],
    queryFn: () => fetchRankingWithContext(userId!),
    staleTime: STALE_TIMES.ranking,
    gcTime: GC_TIMES.medium,
    enabled,
  });

  return {
    ...query,
    ranking: query.data?.ranking || [],
    userPosition: query.data?.userPosition || 0,
  };
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK DE POSIÇÃO DO USUÁRIO
// ═══════════════════════════════════════════════════════════

export function useUserRankingPosition(userId: string | undefined) {
  const enabled = !!userId;

  const query = useQuery({
    queryKey: CACHE_KEYS.userPosition(userId || ''),
    queryFn: () => fetchUserPosition(userId!),
    staleTime: STALE_TIMES.ranking,
    gcTime: GC_TIMES.medium,
    enabled,
  });

  return {
    ...query,
    position: query.data?.position || 0,
    totalPoints: query.data?.totalPoints || 0,
    percentile: query.data?.percentile || 0,
  };
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK DE ESTATÍSTICAS
// ═══════════════════════════════════════════════════════════

export function useRankingStats() {
  const query = useQuery({
    queryKey: ['ranking', 'stats'],
    queryFn: fetchRankingStats,
    staleTime: STALE_TIMES.ranking * 2, // Cache mais longo para stats
    gcTime: GC_TIMES.long,
  });

  return {
    ...query,
    totalUsers: query.data?.totalUsers || 0,
    totalPoints: query.data?.totalPoints || 0,
    averagePoints: query.data?.averagePoints || 0,
    topStreak: query.data?.topStreak || 0,
  };
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK DE COMPATIBILIDADE
// ═══════════════════════════════════════════════════════════

/**
 * @deprecated Use useTopRanking or useRankingPaginated instead
 * 
 * Mantido para compatibilidade com código existente.
 * Retorna os top 100 usuários (comportamento antigo).
 */
export function useRanking() {
  const { ranking, isLoading, error, refetch } = useTopRanking(100);

  return {
    ranking,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * @deprecated Use useTopRanking instead
 */
export function useRealRanking() {
  return useRanking();
}

/**
 * @deprecated Use useTopRanking instead
 */
export function useTopUsers(limit: number = 10) {
  const { ranking, isLoading } = useTopRanking(limit);
  return { users: ranking, isLoading };
}

export default useRankingPaginated;
