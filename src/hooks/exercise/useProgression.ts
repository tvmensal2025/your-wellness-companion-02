// ============================================
// 📈 PROGRESSION HOOK
// Hook para progressão e análise de performance
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createProgressionEngine } from '@/services/exercise/progressionEngine';
import type { PerformanceMetric } from '@/types/advanced-exercise-system';

export function useProgression(userId: string | undefined) {
  const queryClient = useQueryClient();
  const enabled = !!userId;

  // Histórico de performance
  const usePerformanceHistory = (exerciseCode?: string, days: number = 30) => {
    return useQuery({
      queryKey: ['progression-history', userId, exerciseCode, days],
      queryFn: async () => {
        if (!userId) return [];
        const engine = createProgressionEngine(userId);
        return engine.getPerformanceHistory(exerciseCode, days);
      },
      enabled,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Progresso por grupo muscular
  const { data: muscleProgress, isLoading: isLoadingMuscle } = useQuery({
    queryKey: ['progression-muscle', userId],
    queryFn: async () => {
      if (!userId) return [];
      const engine = createProgressionEngine(userId);
      return engine.getMuscleGroupProgress();
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  // Detecção de plateau
  const { data: plateaus } = useQuery({
    queryKey: ['progression-plateaus', userId],
    queryFn: async () => {
      if (!userId) return [];
      const engine = createProgressionEngine(userId);
      return engine.detectPlateau();
    },
    enabled,
    staleTime: 30 * 60 * 1000,
  });

  // Desequilíbrios musculares
  const { data: imbalances } = useQuery({
    queryKey: ['progression-imbalances', userId],
    queryFn: async () => {
      if (!userId) return { imbalances: [], overallBalance: 0.5 };
      const engine = createProgressionEngine(userId);
      return engine.detectMuscleImbalances();
    },
    enabled,
    staleTime: 30 * 60 * 1000,
  });

  // Recomendação de recuperação
  const { data: recovery } = useQuery({
    queryKey: ['progression-recovery', userId],
    queryFn: async () => {
      if (!userId) return null;
      const engine = createProgressionEngine(userId);
      return engine.calculateRecoveryRecommendation();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Registrar performance
  const recordPerformance = useMutation({
    mutationFn: async (metric: Omit<PerformanceMetric, 'id' | 'createdAt'>) => {
      if (!userId) throw new Error('User ID required');
      const engine = createProgressionEngine(userId);
      return engine.recordPerformance(metric);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progression-history', userId] });
      queryClient.invalidateQueries({ queryKey: ['progression-muscle', userId] });
    },
  });

  // Calcular dificuldade adaptada
  const calculateDifficulty = useMutation({
    mutationFn: async (exerciseCode: string) => {
      if (!userId) throw new Error('User ID required');
      const engine = createProgressionEngine(userId);
      return engine.calculateAdaptedDifficulty(exerciseCode);
    },
  });

  // Gerar plano de progressão
  const generatePlan = useMutation({
    mutationFn: async ({
      goalType,
      weeks,
    }: {
      goalType: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss';
      weeks?: number;
    }) => {
      if (!userId) throw new Error('User ID required');
      const engine = createProgressionEngine(userId);
      return engine.generateProgressionPlan(goalType, weeks);
    },
  });

  return {
    usePerformanceHistory,
    muscleProgress,
    plateaus,
    imbalances,
    recovery,
    recordPerformance,
    calculateDifficulty,
    generatePlan,
    isLoading: isLoadingMuscle,
  };
}

export default useProgression;
