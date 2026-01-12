/**
 * 👤 useCurrentUser - Hook Unificado de Usuário
 * 
 * Este é o ÚNICO hook que deve ser usado para dados do usuário atual.
 * 
 * Substitui:
 * - useUserProfile
 * - useUserPhysicalData
 * - useUserPoints
 * - useUserXP
 * - useUserStreak
 * - useUserDataCentralized
 * - useUserDataCache
 * - usePhysicalData
 * - useUserProgressStats
 * - useUserGender
 * 
 * Benefícios:
 * - Single source of truth
 * - Cache otimizado (5 min stale time)
 * - Queries paralelas com Promise.all
 * - Dados derivados pré-calculados
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_KEYS, STALE_TIMES, GC_TIMES } from '@/services/cache';
import { 
  fetchCompleteUserData, 
  type CompleteUserData 
} from '@/services/api/userService';
import { 
  fetchGamificationData, 
  type GamificationData 
} from '@/services/api/gamificationService';

// ═══════════════════════════════════════════════════════════
// 📋 TIPOS
// ═══════════════════════════════════════════════════════════

export interface CurrentUserData extends CompleteUserData, GamificationData {
  userId: string;
  isLoading: boolean;
  error: Error | null;
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════

export function useCurrentUser(userId: string | undefined) {
  const enabled = !!userId;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CACHE_KEYS.currentUser(userId || ''),
    queryFn: async (): Promise<CurrentUserData | null> => {
      if (!userId) return null;

      // Buscar dados em paralelo
      const [userData, gamificationData] = await Promise.all([
        fetchCompleteUserData(userId),
        fetchGamificationData(userId),
      ]);

      return {
        userId,
        ...userData,
        ...gamificationData,
        isLoading: false,
        error: null,
      };
    },
    staleTime: STALE_TIMES.currentUser,
    gcTime: GC_TIMES.long,
    enabled,
    refetchOnWindowFocus: false,
  });

  // Função para invalidar cache
  const invalidate = () => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.currentUser(userId) });
    }
  };

  // Retornar dados com defaults seguros
  const data = query.data;

  return {
    // Estado da query
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,

    // Dados do usuário
    userId: data?.userId || userId || '',
    profile: data?.profile || null,
    physicalData: data?.physicalData || null,
    preferences: data?.preferences || null,

    // Dados derivados do perfil
    displayName: data?.displayName || 'Usuário',
    avatarUrl: data?.avatarUrl || null,
    email: data?.email || null,

    // Dados de gamificação
    points: data?.points || null,
    totalPoints: data?.totalPoints || 0,
    currentStreak: data?.currentStreak || 0,
    bestStreak: data?.bestStreak || 0,
    level: data?.level || 1,
    levelName: data?.levelName || 'Novato',
    missionsCompleted: data?.missionsCompleted || 0,
    challengesCompleted: data?.challengesCompleted || 0,
    xpToNextLevel: data?.xpToNextLevel || 100,
    levelProgress: data?.levelProgress || 0,
  };
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK COM AUTH AUTOMÁTICO
// ═══════════════════════════════════════════════════════════

/**
 * Versão que busca o userId automaticamente do auth
 */
export function useCurrentUserWithAuth() {
  const { data: session } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: STALE_TIMES.currentUser,
  });

  const userId = session?.user?.id;
  return useCurrentUser(userId);
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOKS DE COMPATIBILIDADE
// ═══════════════════════════════════════════════════════════

/**
 * @deprecated Use useCurrentUser instead
 */
export function useUserProfile(userId: string | undefined) {
  const { profile, isLoading, error } = useCurrentUser(userId);
  return { profile, isLoading, error };
}

/**
 * @deprecated Use useCurrentUser instead
 */
export function useUserPhysicalData(userId: string | undefined) {
  const { physicalData, isLoading, error } = useCurrentUser(userId);
  return { physicalData, isLoading, error };
}

/**
 * @deprecated Use useCurrentUser instead
 */
export function useUserPoints(userId: string | undefined) {
  const { totalPoints, level, currentStreak, bestStreak, isLoading, error } = useCurrentUser(userId);
  return { 
    points: totalPoints, 
    level, 
    currentStreak, 
    bestStreak, 
    isLoading, 
    error 
  };
}

/**
 * @deprecated Use useCurrentUser instead
 */
export function useUserStreak(userId: string | undefined) {
  const { currentStreak, bestStreak, isLoading } = useCurrentUser(userId);
  return { currentStreak, bestStreak, isLoading };
}

/**
 * @deprecated Use useCurrentUser instead
 */
export function useUserXP(userId: string | undefined) {
  const { totalPoints, xpToNextLevel, levelProgress, isLoading } = useCurrentUser(userId);
  return { 
    xp: totalPoints, 
    xpToNextLevel, 
    progress: levelProgress, 
    isLoading 
  };
}

export default useCurrentUser;
