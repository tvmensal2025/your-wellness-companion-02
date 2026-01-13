// ============================================
// 🏥 INJURY PREDICTOR HOOK
// Hook para prevenção de lesões
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createInjuryPredictor } from '@/services/exercise/injuryPredictor';
import type { PainReport } from '@/types/advanced-exercise-system';

export function useInjuryPredictor(userId: string | undefined) {
  const queryClient = useQueryClient();
  const enabled = !!userId;

  // Avaliação geral de risco
  const { data: riskAssessment, isLoading: isLoadingRisk } = useQuery({
    queryKey: ['injury-risk', userId],
    queryFn: async () => {
      if (!userId) return null;
      const predictor = createInjuryPredictor(userId);
      return predictor.assessOverallRisk();
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  // Reportar dor
  const reportPain = useMutation({
    mutationFn: async (report: Omit<PainReport, 'id' | 'reportedAt'>) => {
      if (!userId) throw new Error('User ID required');
      const predictor = createInjuryPredictor(userId);
      return predictor.reportPain(report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['injury-risk', userId] });
    },
  });

  // Protocolo de recuperação
  const getRecoveryProtocol = useMutation({
    mutationFn: async (bodyRegion: string) => {
      if (!userId) throw new Error('User ID required');
      const predictor = createInjuryPredictor(userId);
      return predictor.getRecoveryProtocol(bodyRegion);
    },
  });

  // Modificações de exercício
  const getExerciseModifications = useMutation({
    mutationFn: async (exerciseCode: string) => {
      if (!userId) throw new Error('User ID required');
      const predictor = createInjuryPredictor(userId);
      return predictor.getExerciseModifications(exerciseCode);
    },
  });

  return {
    riskAssessment,
    reportPain,
    getRecoveryProtocol,
    getExerciseModifications,
    isLoading: isLoadingRisk,
    isHighRisk: riskAssessment?.overallLevel === 'high' || riskAssessment?.overallLevel === 'critical',
  };
}

export default useInjuryPredictor;
