// =====================================================
// USE HEALTH SCORE HOOK
// =====================================================
// Hook para gerenciar o Health Score do usuário
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  getCurrentHealthScore,
  calculateAndSaveHealthScore,
  getHealthScoreHistory,
  getScoreBreakdown,
  getScoreColor,
} from '@/services/dr-vital/healthScoreService';
import type { HealthScoreData, HealthScoreBreakdown, ScoreColor } from '@/types/dr-vital-revolution';

// =====================================================
// QUERY KEYS
// =====================================================

export const healthScoreKeys = {
  all: ['health-score'] as const,
  current: (userId: string) => [...healthScoreKeys.all, 'current', userId] as const,
  history: (userId: string, days: number) => [...healthScoreKeys.all, 'history', userId, days] as const,
  breakdown: (userId: string) => [...healthScoreKeys.all, 'breakdown', userId] as const,
};

// =====================================================
// MAIN HOOK
// =====================================================

export function useHealthScore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const enabled = !!userId;

  // Query: Current Health Score
  const {
    data: currentScore,
    isLoading: isLoadingScore,
    error: scoreError,
    refetch: refetchScore,
  } = useQuery({
    queryKey: healthScoreKeys.current(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      return getCurrentHealthScore(userId);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });

  // Query: Score Breakdown
  const {
    data: breakdown,
    isLoading: isLoadingBreakdown,
  } = useQuery({
    queryKey: healthScoreKeys.breakdown(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      return getScoreBreakdown(userId);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation: Recalculate Score
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return calculateAndSaveHealthScore(userId);
    },
    onSuccess: (newScore) => {
      // Update cache with new score
      queryClient.setQueryData(healthScoreKeys.current(userId || ''), newScore);
      // Invalidate breakdown to refresh
      queryClient.invalidateQueries({ queryKey: healthScoreKeys.breakdown(userId || '') });
      // Invalidate history
      queryClient.invalidateQueries({ queryKey: healthScoreKeys.all });
    },
  });

  // Derived values
  const score = currentScore?.score ?? 0;
  const color = getScoreColor(Math.max(0, Math.min(100, score)));
  const trend = currentScore?.trend ?? 'stable';

  return {
    // Data
    currentScore,
    score,
    color,
    trend,
    breakdown: breakdown?.breakdown,
    breakdownDetails: breakdown?.details,
    
    // Loading states
    isLoading: isLoadingScore,
    isLoadingBreakdown,
    isRecalculating: recalculateMutation.isPending,
    
    // Error states
    error: scoreError,
    recalculateError: recalculateMutation.error,
    
    // Actions
    recalculate: recalculateMutation.mutate,
    recalculateAsync: recalculateMutation.mutateAsync,
    refetch: refetchScore,
  };
}

// =====================================================
// HISTORY HOOK
// =====================================================

export function useHealthScoreHistory(days: number = 30) {
  const { user } = useAuth();
  const userId = user?.id;
  const enabled = !!userId;

  const {
    data: history,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: healthScoreKeys.history(userId || '', days),
    queryFn: async () => {
      if (!userId) return [];
      return getHealthScoreHistory(userId, days);
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Calculate statistics
  const stats = history && history.length > 0 ? {
    average: Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length),
    highest: Math.max(...history.map(h => h.score)),
    lowest: Math.min(...history.map(h => h.score)),
    trend: history.length >= 2 
      ? history[history.length - 1].score > history[0].score ? 'improving' : 'declining'
      : 'stable',
    dataPoints: history.length,
  } : null;

  return {
    history: history ?? [],
    stats,
    isLoading,
    error,
    refetch,
  };
}

// =====================================================
// UTILITY HOOKS
// =====================================================

/**
 * Hook para obter apenas a cor do score atual
 */
export function useHealthScoreColor(): ScoreColor {
  const { color } = useHealthScore();
  return color;
}

/**
 * Hook para verificar se o score precisa de atenção
 */
export function useHealthScoreAlert() {
  const { score, breakdown } = useHealthScore();
  
  const alerts: Array<{
    category: keyof HealthScoreBreakdown;
    message: string;
    severity: 'warning' | 'critical';
  }> = [];

  if (breakdown) {
    if (breakdown.nutrition < 10) {
      alerts.push({
        category: 'nutrition',
        message: 'Sua nutrição precisa de atenção',
        severity: breakdown.nutrition < 5 ? 'critical' : 'warning',
      });
    }
    if (breakdown.exercise < 10) {
      alerts.push({
        category: 'exercise',
        message: 'Você precisa se exercitar mais',
        severity: breakdown.exercise < 5 ? 'critical' : 'warning',
      });
    }
    if (breakdown.sleep < 10) {
      alerts.push({
        category: 'sleep',
        message: 'Sua qualidade de sono está baixa',
        severity: breakdown.sleep < 5 ? 'critical' : 'warning',
      });
    }
    if (breakdown.mental < 10) {
      alerts.push({
        category: 'mental',
        message: 'Cuide da sua saúde mental',
        severity: breakdown.mental < 5 ? 'critical' : 'warning',
      });
    }
  }

  return {
    hasAlerts: alerts.length > 0,
    alerts,
    criticalCount: alerts.filter(a => a.severity === 'critical').length,
    warningCount: alerts.filter(a => a.severity === 'warning').length,
  };
}

export default useHealthScore;
