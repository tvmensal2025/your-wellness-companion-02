/**
 * 🎮 useGamificationUnified - Hook Unificado de Gamificação
 * 
 * Este é o ÚNICO hook que deve ser usado para gamificação.
 * 
 * Substitui:
 * - useGamification
 * - useRealGamification
 * - useEnhancedGamification
 * - useGamifiedProgress
 * - useSocialRanking
 * 
 * Funcionalidades:
 * - Pontos, streak, nível
 * - Conquistas
 * - Posição no ranking
 * - Mutations para adicionar pontos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS, STALE_TIMES, GC_TIMES } from '@/services/cache';
import {
  fetchGamificationData,
  fetchUserAchievements,
  addPoints,
  incrementMissionsCompleted,
  incrementChallengesCompleted,
  calculateLevel,
  LEVEL_THRESHOLDS,
  type GamificationData,
  type Achievement,
} from '@/services/api/gamificationService';
import { fetchUserPosition, type UserRankingPosition } from '@/services/api/rankingService';

// ═══════════════════════════════════════════════════════════
// 📋 TIPOS
// ═══════════════════════════════════════════════════════════

export interface GamificationState extends GamificationData {
  achievements: Achievement[];
  rankingPosition: UserRankingPosition | null;
  isLoading: boolean;
  error: Error | null;
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════

export function useGamification(userId: string | undefined) {
  const enabled = !!userId;
  const queryClient = useQueryClient();

  // Query principal de gamificação
  const gamificationQuery = useQuery({
    queryKey: CACHE_KEYS.gamification(userId || ''),
    queryFn: () => fetchGamificationData(userId!),
    staleTime: STALE_TIMES.gamification,
    gcTime: GC_TIMES.medium,
    enabled,
  });

  // Query de conquistas (separada para cache independente)
  const achievementsQuery = useQuery({
    queryKey: CACHE_KEYS.userAchievements(userId || ''),
    queryFn: () => fetchUserAchievements(userId!),
    staleTime: STALE_TIMES.gamification,
    gcTime: GC_TIMES.medium,
    enabled,
  });

  // Query de posição no ranking
  const positionQuery = useQuery({
    queryKey: CACHE_KEYS.userPosition(userId || ''),
    queryFn: () => fetchUserPosition(userId!),
    staleTime: STALE_TIMES.ranking,
    gcTime: GC_TIMES.medium,
    enabled,
  });

  // Mutation para adicionar pontos
  const addPointsMutation = useMutation({
    mutationFn: ({ points, reason }: { points: number; reason?: string }) =>
      addPoints(userId!, points, reason),
    onSuccess: () => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.gamification(userId!) });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.userPosition(userId!) });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.ranking() });
    },
  });

  // Mutation para completar missão
  const completeMissionMutation = useMutation({
    mutationFn: () => incrementMissionsCompleted(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.gamification(userId!) });
    },
  });

  // Mutation para completar desafio
  const completeChallengeMutation = useMutation({
    mutationFn: () => incrementChallengesCompleted(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.gamification(userId!) });
    },
  });

  // Função para invalidar cache
  const invalidate = () => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.gamification(userId) });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.userAchievements(userId) });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.userPosition(userId) });
    }
  };

  const data = gamificationQuery.data;
  const isLoading = gamificationQuery.isLoading || achievementsQuery.isLoading;

  return {
    // Estado
    isLoading,
    isError: gamificationQuery.isError,
    error: gamificationQuery.error,
    refetch: gamificationQuery.refetch,
    invalidate,

    // Dados de gamificação
    totalPoints: data?.totalPoints || 0,
    currentStreak: data?.currentStreak || 0,
    bestStreak: data?.bestStreak || 0,
    level: data?.level || 1,
    levelName: data?.levelName || 'Novato',
    missionsCompleted: data?.missionsCompleted || 0,
    challengesCompleted: data?.challengesCompleted || 0,
    xpToNextLevel: data?.xpToNextLevel || 100,
    levelProgress: data?.levelProgress || 0,

    // Conquistas
    achievements: achievementsQuery.data || [],

    // Ranking
    rankingPosition: positionQuery.data || null,
    position: positionQuery.data?.position || 0,
    percentile: positionQuery.data?.percentile || 0,

    // Mutations
    addPoints: (points: number, reason?: string) => 
      addPointsMutation.mutateAsync({ points, reason }),
    completeMission: () => completeMissionMutation.mutateAsync(),
    completeChallenge: () => completeChallengeMutation.mutateAsync(),
    isAddingPoints: addPointsMutation.isPending,

    // Constantes úteis
    levelThresholds: LEVEL_THRESHOLDS,
    calculateLevel,
  };
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOKS DE COMPATIBILIDADE
// ═══════════════════════════════════════════════════════════

/**
 * @deprecated Use useGamification instead
 */
export function useRealGamification(userId: string | undefined) {
  return useGamification(userId);
}

/**
 * @deprecated Use useGamification instead
 */
export function useEnhancedGamification(userId: string | undefined) {
  return useGamification(userId);
}

/**
 * @deprecated Use useGamification instead
 */
export function useGamifiedProgress(userId: string | undefined) {
  const gamification = useGamification(userId);
  return {
    ...gamification,
    progress: gamification.levelProgress,
    xp: gamification.totalPoints,
  };
}

export default useGamification;
