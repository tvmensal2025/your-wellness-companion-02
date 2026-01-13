// ============================================
// 🧠 USE LEARNING HOOK
// Hook para gerenciar aprendizado e feedback
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { createLearningService } from '@/services/exercise/learningService';
import type {
  UserFeedback,
  ExercisePreference,
  LearningInsight,
  ABTestVariant,
} from '@/types/advanced-exercise-system';

// ============================================
// QUERY KEYS
// ============================================

const LEARNING_KEYS = {
  all: ['exercise-learning'] as const,
  preferences: (userId: string) => [...LEARNING_KEYS.all, 'preferences', userId] as const,
  preference: (userId: string, exerciseCode: string) =>
    [...LEARNING_KEYS.all, 'preference', userId, exerciseCode] as const,
  insights: (userId: string) => [...LEARNING_KEYS.all, 'insights', userId] as const,
  tests: (userId: string) => [...LEARNING_KEYS.all, 'tests', userId] as const,
  accuracy: (userId: string) => [...LEARNING_KEYS.all, 'accuracy', userId] as const,
  explanation: (userId: string, exerciseCode: string) =>
    [...LEARNING_KEYS.all, 'explanation', userId, exerciseCode] as const,
};

// ============================================
// MAIN HOOK
// ============================================

export function useLearning(userId: string | undefined) {
  const queryClient = useQueryClient();
  const enabled = !!userId;

  // Memoize service instance
  const service = useMemo(() => {
    if (!userId) return null;
    return createLearningService(userId);
  }, [userId]);

  // ============================================
  // QUERIES
  // ============================================

  // Get all preferences
  const {
    data: preferences,
    isLoading: isLoadingPreferences,
    error: preferencesError,
    refetch: refetchPreferences,
  } = useQuery({
    queryKey: LEARNING_KEYS.preferences(userId || ''),
    queryFn: async () => {
      if (!service) return [];
      return service.getPreferences();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get learning insights
  const {
    data: insights,
    isLoading: isLoadingInsights,
    error: insightsError,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: LEARNING_KEYS.insights(userId || ''),
    queryFn: async () => {
      if (!service) return [];
      return service.generateInsights();
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Get active A/B tests
  const {
    data: activeTests,
    isLoading: isLoadingTests,
  } = useQuery({
    queryKey: LEARNING_KEYS.tests(userId || ''),
    queryFn: async () => {
      if (!service) return [];
      return service.getActiveTests();
    },
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Get model accuracy
  const {
    data: modelAccuracy,
    isLoading: isLoadingAccuracy,
  } = useQuery({
    queryKey: LEARNING_KEYS.accuracy(userId || ''),
    queryFn: async () => {
      if (!service) return null;
      return service.getModelAccuracy();
    },
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // ============================================
  // MUTATIONS
  // ============================================

  // Submit exercise feedback
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({
      exerciseCode,
      feedback,
    }: {
      exerciseCode: string;
      feedback: {
        rating: number;
        difficulty: number;
        enjoyment: number;
        wouldRepeat: boolean;
        comment?: string;
        tags?: string[];
      };
    }) => {
      if (!service) throw new Error('Service not initialized');
      return service.submitExerciseFeedback(exerciseCode, feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_KEYS.preferences(userId || '') });
      queryClient.invalidateQueries({ queryKey: LEARNING_KEYS.insights(userId || '') });
      queryClient.invalidateQueries({ queryKey: LEARNING_KEYS.accuracy(userId || '') });
    },
  });

  // Submit workout feedback
  const submitWorkoutFeedbackMutation = useMutation({
    mutationFn: async ({
      workoutId,
      feedback,
    }: {
      workoutId: string;
      feedback: {
        overallRating: number;
        energyAfter: number;
        durationSatisfaction: number;
        wouldRepeat: boolean;
        suggestions?: string;
      };
    }) => {
      if (!service) throw new Error('Service not initialized');
      return service.submitWorkoutFeedback(workoutId, feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_KEYS.preferences(userId || '') });
      queryClient.invalidateQueries({ queryKey: LEARNING_KEYS.insights(userId || '') });
    },
  });

  // Record skip
  const recordSkipMutation = useMutation({
    mutationFn: async ({
      exerciseCode,
      reason,
    }: {
      exerciseCode: string;
      reason?: string;
    }) => {
      if (!service) throw new Error('Service not initialized');
      return service.recordSkip(exerciseCode, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_KEYS.preferences(userId || '') });
    },
  });

  // Record modification
  const recordModificationMutation = useMutation({
    mutationFn: async ({
      exerciseCode,
      modificationType,
      originalValue,
      newValue,
    }: {
      exerciseCode: string;
      modificationType: string;
      originalValue: unknown;
      newValue: unknown;
    }) => {
      if (!service) throw new Error('Service not initialized');
      return service.recordModification(exerciseCode, modificationType, originalValue, newValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_KEYS.preferences(userId || '') });
    },
  });

  // Record A/B test interaction
  const recordTestInteractionMutation = useMutation({
    mutationFn: async ({
      testId,
      interactionType,
      value,
    }: {
      testId: string;
      interactionType: string;
      value?: number;
    }) => {
      if (!service) throw new Error('Service not initialized');
      return service.recordTestInteraction(testId, interactionType, value);
    },
  });

  // ============================================
  // COMPUTED VALUES
  // ============================================

  // Favorite exercises (high preference score)
  const favoriteExercises = useMemo(() => {
    return (preferences || [])
      .filter((p) => p.preferenceScore > 0.7 && p.confidence > 0.5)
      .sort((a, b) => b.preferenceScore - a.preferenceScore)
      .slice(0, 10);
  }, [preferences]);

  // Disliked exercises (low preference score)
  const dislikedExercises = useMemo(() => {
    return (preferences || [])
      .filter((p) => p.preferenceScore < 0.3 && p.confidence > 0.5)
      .sort((a, b) => a.preferenceScore - b.preferenceScore)
      .slice(0, 10);
  }, [preferences]);

  // Actionable insights
  const actionableInsights = useMemo(() => {
    return (insights || []).filter((i) => i.actionable);
  }, [insights]);

  // Model is learning (has enough data)
  const isModelLearning = useMemo(() => {
    return (modelAccuracy?.predictionCount || 0) >= 10;
  }, [modelAccuracy]);

  // Model trend
  const modelTrend = useMemo(() => {
    return modelAccuracy?.recentTrend || 'stable';
  }, [modelAccuracy]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Get preference for specific exercise
  const getExercisePreference = useCallback(
    async (exerciseCode: string): Promise<ExercisePreference | null> => {
      if (!service) return null;
      return service.getExercisePreference(exerciseCode);
    },
    [service]
  );

  // Explain recommendation
  const explainRecommendation = useCallback(
    async (
      exerciseCode: string,
      context: 'workout' | 'alternative' | 'progression'
    ) => {
      if (!service) return null;
      return service.explainRecommendation(exerciseCode, context);
    },
    [service]
  );

  // Submit feedback helper
  const submitFeedback = useCallback(
    (
      exerciseCode: string,
      feedback: {
        rating: number;
        difficulty: number;
        enjoyment: number;
        wouldRepeat: boolean;
        comment?: string;
        tags?: string[];
      }
    ) => {
      return submitFeedbackMutation.mutateAsync({ exerciseCode, feedback });
    },
    [submitFeedbackMutation]
  );

  // Submit workout feedback helper
  const submitWorkoutFeedback = useCallback(
    (
      workoutId: string,
      feedback: {
        overallRating: number;
        energyAfter: number;
        durationSatisfaction: number;
        wouldRepeat: boolean;
        suggestions?: string;
      }
    ) => {
      return submitWorkoutFeedbackMutation.mutateAsync({ workoutId, feedback });
    },
    [submitWorkoutFeedbackMutation]
  );

  // Record skip helper
  const recordSkip = useCallback(
    (exerciseCode: string, reason?: string) => {
      return recordSkipMutation.mutateAsync({ exerciseCode, reason });
    },
    [recordSkipMutation]
  );

  // Record modification helper
  const recordModification = useCallback(
    (
      exerciseCode: string,
      modificationType: string,
      originalValue: unknown,
      newValue: unknown
    ) => {
      return recordModificationMutation.mutateAsync({
        exerciseCode,
        modificationType,
        originalValue,
        newValue,
      });
    },
    [recordModificationMutation]
  );

  // Quick rating (simplified feedback)
  const quickRate = useCallback(
    (exerciseCode: string, rating: 1 | 2 | 3 | 4 | 5) => {
      return submitFeedbackMutation.mutateAsync({
        exerciseCode,
        feedback: {
          rating,
          difficulty: 5, // neutral
          enjoyment: rating,
          wouldRepeat: rating >= 3,
        },
      });
    },
    [submitFeedbackMutation]
  );

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    preferences: preferences || [],
    insights: insights || [],
    activeTests: activeTests || [],
    modelAccuracy,

    // Computed
    favoriteExercises,
    dislikedExercises,
    actionableInsights,
    isModelLearning,
    modelTrend,

    // Loading states
    isLoading: isLoadingPreferences || isLoadingInsights,
    isLoadingPreferences,
    isLoadingInsights,
    isLoadingTests,
    isLoadingAccuracy,

    // Errors
    error: preferencesError || insightsError,

    // Actions
    submitFeedback,
    submitWorkoutFeedback,
    recordSkip,
    recordModification,
    quickRate,
    getExercisePreference,
    explainRecommendation,
    refetchPreferences,
    refetchInsights,

    // A/B Testing
    recordTestInteraction: recordTestInteractionMutation.mutateAsync,

    // Mutation states
    isSubmittingFeedback: submitFeedbackMutation.isPending,
    isSubmittingWorkoutFeedback: submitWorkoutFeedbackMutation.isPending,
    isRecordingSkip: recordSkipMutation.isPending,
    isRecordingModification: recordModificationMutation.isPending,
  };
}

export default useLearning;
