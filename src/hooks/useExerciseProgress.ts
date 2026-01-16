import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ProgressLog {
  id: string;
  user_id: string;
  exercise_id: string | null;
  exercise_name: string;
  workout_date: string;
  set_number: number;
  reps_completed: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  perceived_difficulty: number | null;
  notes: string | null;
  created_at: string;
}

export interface ExerciseStats {
  exercise_name: string;
  total_sessions: number;
  max_weight: number | null;
  avg_weight: number | null;
  max_reps: number | null;
  avg_reps: number | null;
  first_workout: string | null;
  last_workout: string | null;
}

// exercise_progress_logs table was removed - returning mock implementations
export const useExerciseProgress = (userId: string | undefined) => {
  const [loading] = useState(false);
  const [progressHistory] = useState<ProgressLog[]>([]);
  const { toast } = useToast();

  const logProgress = useCallback(async (_data: {
    exerciseId?: string;
    exerciseName: string;
    setNumber: number;
    repsCompleted?: number;
    weightKg?: number;
    durationSeconds?: number;
    perceivedDifficulty?: number;
    notes?: string;
  }) => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para registrar progresso",
        variant: "destructive"
      });
      return null;
    }
    // Table was removed - feature disabled
    console.log('Exercise progress logging is temporarily disabled');
    return null;
  }, [userId, toast]);

  const getExerciseHistory = useCallback(async (_exerciseName: string, _limit = 30) => {
    return [];
  }, []);

  const getLastWeight = useCallback(async (_exerciseName: string): Promise<number | null> => {
    return null;
  }, []);

  const getExerciseStats = useCallback(async (_exerciseName: string): Promise<ExerciseStats | null> => {
    return null;
  }, []);

  const getWeightProgression = useCallback(async (_exerciseName: string, _days = 30) => {
    return [];
  }, []);

  const getSuggestedWeight = useCallback(async (_exerciseName: string): Promise<number | null> => {
    return null;
  }, []);

  return {
    loading,
    progressHistory,
    logProgress,
    getExerciseHistory,
    getLastWeight,
    getExerciseStats,
    getWeightProgression,
    getSuggestedWeight
  };
};
