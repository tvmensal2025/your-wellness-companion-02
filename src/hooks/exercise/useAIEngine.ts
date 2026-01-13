// ============================================
// 🤖 AI ENGINE HOOK
// Hook para adaptação inteligente de treinos
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAIEngine } from '@/services/exercise/aiEngine';
import type { ContextData, WorkoutPlan } from '@/types/advanced-exercise-system';

export function useAIEngine(userId: string | undefined) {
  const queryClient = useQueryClient();
  const enabled = !!userId;

  // Análise do estado do usuário
  const analyzeState = useMutation({
    mutationFn: async (contextData: ContextData) => {
      if (!userId) throw new Error('User ID required');
      const engine = createAIEngine(userId);
      return engine.analyzeUserState(contextData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-analysis', userId] });
    },
  });

  // Adaptação de treino
  const adaptWorkout = useMutation({
    mutationFn: async ({ 
      workoutPlan, 
      contextData 
    }: { 
      workoutPlan: WorkoutPlan; 
      contextData: ContextData;
    }) => {
      if (!userId) throw new Error('User ID required');
      const engine = createAIEngine(userId);
      const userState = await engine.analyzeUserState(contextData);
      return engine.adaptWorkout(workoutPlan, userState);
    },
  });

  // Adaptação em tempo real
  const adaptInRealTime = useMutation({
    mutationFn: async ({ 
      exerciseCode, 
      metrics 
    }: { 
      exerciseCode: string; 
      metrics: { difficultyRating?: number; heartRateMax?: number; painLevel?: number };
    }) => {
      if (!userId) throw new Error('User ID required');
      const engine = createAIEngine(userId);
      return engine.adaptInRealTime(exerciseCode, metrics);
    },
  });

  // Processar feedback
  const processFeedback = useMutation({
    mutationFn: async ({ 
      adaptationId, 
      accepted, 
      feedback, 
      rating 
    }: { 
      adaptationId: string; 
      accepted: boolean; 
      feedback?: string; 
      rating?: number;
    }) => {
      if (!userId) throw new Error('User ID required');
      const engine = createAIEngine(userId);
      return engine.processUserFeedback(adaptationId, accepted, feedback, rating);
    },
  });

  return {
    analyzeState,
    adaptWorkout,
    adaptInRealTime,
    processFeedback,
    isAnalyzing: analyzeState.isPending,
    isAdapting: adaptWorkout.isPending,
  };
}

export default useAIEngine;
