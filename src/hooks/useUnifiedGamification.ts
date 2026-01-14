/**
 * 🎮 useUnifiedGamification
 * 
 * Hook unificado de gamificação que usa a tabela points_configuration.
 * Substitui: useGamification, useEnhancedGamification, useRealGamification, useGamificationUnified
 * 
 * Features:
 * - Usa configuração do banco (não hardcoded)
 * - Verifica limites diários automaticamente
 * - Cache otimizado com React Query
 * - Optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  awardXP,
  getUserXPStats,
  getUserDailyLimits,
  getXPHistory,
  calculateLevel,
  xpToNextLevel,
  levelProgress,
  getLevelName,
  getLevelIcon,
  type UserXPStats,
  type DailyLimit,
  type AwardResult,
} from '@/services/gamification/unifiedGamificationService';

// ═══════════════════════════════════════════════════════════
// 📋 TIPOS
// ═══════════════════════════════════════════════════════════

export interface GamificationState {
  // Dados principais
  totalPoints: number;
  level: number;
  levelName: string;
  levelIcon: string;
  xpToNextLevel: number;
  levelProgress: number;
  
  // Estatísticas
  todayXP: number;
  weekXP: number;
  monthXP: number;
  
  // Limites
  dailyLimits: DailyLimit[];
  
  // Histórico recente
  recentHistory: Array<{
    action_type: string;
    xp_earned: number;
    points_earned: number;
    created_at: string;
  }>;
}

export interface UseUnifiedGamificationReturn {
  // Estado
  data: GamificationState | null;
  isLoading: boolean;
  error: Error | null;
  
  // Ações
  awardXP: (actionType: string, options?: {
    sourceSystem?: 'exercise' | 'health' | 'social' | 'challenge';
    sourceId?: string;
    metadata?: Record<string, unknown>;
  }) => Promise<AwardResult>;
  
  // Mutations
  isAwarding: boolean;
  
  // Refetch
  refetch: () => void;
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════

export function useUnifiedGamification(userId?: string): UseUnifiedGamificationReturn {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const enabled = !!userId;

  // Query principal - busca stats, limites e histórico em paralelo
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unified-gamification', userId],
    queryFn: async (): Promise<GamificationState | null> => {
      if (!userId) return null;

      const [stats, limits, history] = await Promise.all([
        getUserXPStats(userId),
        getUserDailyLimits(userId),
        getXPHistory(userId, 10),
      ]);

      const level = calculateLevel(stats.total_points);

      return {
        totalPoints: stats.total_points,
        level,
        levelName: getLevelName(level),
        levelIcon: getLevelIcon(level),
        xpToNextLevel: xpToNextLevel(level, stats.total_points),
        levelProgress: levelProgress(stats.total_points),
        todayXP: stats.today_xp,
        weekXP: stats.week_xp,
        monthXP: stats.month_xp,
        dailyLimits: limits,
        recentHistory: history,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 30 * 60 * 1000,   // 30 minutos
    enabled,
    refetchOnWindowFocus: false,
  });

  // Mutation para conceder XP
  const awardMutation = useMutation({
    mutationFn: async ({
      actionType,
      options,
    }: {
      actionType: string;
      options?: {
        sourceSystem?: 'exercise' | 'health' | 'social' | 'challenge';
        sourceId?: string;
        metadata?: Record<string, unknown>;
      };
    }) => {
      if (!userId) throw new Error('Usuário não autenticado');
      return awardXP(userId, actionType, options);
    },
    
    // Optimistic update
    onMutate: async ({ actionType }) => {
      await queryClient.cancelQueries({ queryKey: ['unified-gamification', userId] });
      const previous = queryClient.getQueryData<GamificationState>(['unified-gamification', userId]);

      // Não fazemos optimistic update aqui porque não sabemos o valor exato
      // O banco calcula baseado na configuração
      
      return { previous };
    },
    
    onError: (_err, _variables, context) => {
      // Rollback em caso de erro
      if (context?.previous) {
        queryClient.setQueryData(['unified-gamification', userId], context.previous);
      }
    },
    
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: `+${result.xp_earned} XP! ${result.icon || '🎉'}`,
          description: result.action_name || 'Pontos adicionados!',
        });
        
        // Verificar level up
        if (data && result.new_level && result.new_level > data.level) {
          toast({
            title: `🎊 Level Up!`,
            description: `Você alcançou o nível ${result.new_level}!`,
          });
        }
      } else if (result.reason === 'daily_limit_reached') {
        toast({
          title: 'Limite diário atingido',
          description: `Você já completou ${result.current_count}/${result.max_count} vezes hoje.`,
          variant: 'destructive',
        });
      }
    },
    
    onSettled: () => {
      // Sempre refetch após mutation
      queryClient.invalidateQueries({ queryKey: ['unified-gamification', userId] });
    },
  });

  // Função wrapper para awardXP
  const handleAwardXP = async (
    actionType: string,
    options?: {
      sourceSystem?: 'exercise' | 'health' | 'social' | 'challenge';
      sourceId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<AwardResult> => {
    return awardMutation.mutateAsync({ actionType, options });
  };

  return {
    data: data || null,
    isLoading,
    error: error as Error | null,
    awardXP: handleAwardXP,
    isAwarding: awardMutation.isPending,
    refetch,
  };
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOKS AUXILIARES
// ═══════════════════════════════════════════════════════════

/**
 * Hook simplificado para apenas ler pontos (sem mutations)
 */
export function useUserPoints(userId?: string) {
  const enabled = !!userId;

  return useQuery({
    queryKey: ['user-points-simple', userId],
    queryFn: async () => {
      if (!userId) return null;
      const stats = await getUserXPStats(userId);
      return {
        totalPoints: stats.total_points,
        level: calculateLevel(stats.total_points),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

/**
 * Hook para verificar se uma ação pode ser executada (limite diário)
 */
export function useCanAwardXP(userId?: string, actionType?: string) {
  const enabled = !!userId && !!actionType;

  return useQuery({
    queryKey: ['can-award-xp', userId, actionType],
    queryFn: async () => {
      if (!userId || !actionType) return { canAward: false, reason: 'missing_params' };
      
      const limits = await getUserDailyLimits(userId);
      const limit = limits.find(l => l.action_type === actionType);
      
      if (!limit) return { canAward: true, reason: 'no_limit' };
      if (limit.max_count === null) return { canAward: true, reason: 'unlimited' };
      
      const canAward = limit.current_count < limit.max_count;
      return {
        canAward,
        reason: canAward ? 'within_limit' : 'daily_limit_reached',
        currentCount: limit.current_count,
        maxCount: limit.max_count,
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled,
  });
}

// ═══════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════

export default useUnifiedGamification;
