// ============================================
// 📊 PERFORMANCE DASHBOARD HOOK
// Hook para analytics e insights
// ============================================

import { useQuery, useMutation } from '@tanstack/react-query';
import { createPerformanceDashboard } from '@/services/exercise/performanceDashboard';

export function usePerformanceDashboard(userId: string | undefined) {
  const enabled = !!userId;

  // Estatísticas de treino
  const useWorkoutStats = (days: number = 30) => {
    return useQuery({
      queryKey: ['dashboard-stats', userId, days],
      queryFn: async () => {
        if (!userId) return null;
        const dashboard = createPerformanceDashboard(userId);
        return dashboard.getWorkoutStats(days);
      },
      enabled,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Insights de progresso
  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ['dashboard-insights', userId],
    queryFn: async () => {
      if (!userId) return [];
      const dashboard = createPerformanceDashboard(userId);
      return dashboard.generateInsights();
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  // Comparação com benchmark
  const { data: benchmark } = useQuery({
    queryKey: ['dashboard-benchmark', userId],
    queryFn: async () => {
      if (!userId) return null;
      const dashboard = createPerformanceDashboard(userId);
      return dashboard.getBenchmarkComparison();
    },
    enabled,
    staleTime: 30 * 60 * 1000,
  });

  // Previsão de meta
  const predictGoal = useMutation({
    mutationFn: async ({
      goalType,
      targetValue,
      currentValue,
    }: {
      goalType: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance';
      targetValue: number;
      currentValue: number;
    }) => {
      if (!userId) throw new Error('User ID required');
      const dashboard = createPerformanceDashboard(userId);
      return dashboard.predictGoalTimeline(goalType, targetValue, currentValue);
    },
  });

  // Gerar relatório
  const generateReport = useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      format,
    }: {
      startDate: Date;
      endDate: Date;
      format?: 'summary' | 'detailed';
    }) => {
      if (!userId) throw new Error('User ID required');
      const dashboard = createPerformanceDashboard(userId);
      return dashboard.generateReport(startDate, endDate, format);
    },
  });

  return {
    useWorkoutStats,
    insights,
    benchmark,
    predictGoal,
    generateReport,
    isLoading: isLoadingInsights,
  };
}

export default usePerformanceDashboard;
