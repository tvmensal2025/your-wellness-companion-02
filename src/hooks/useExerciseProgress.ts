import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export const useExerciseProgress = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [progressHistory, setProgressHistory] = useState<ProgressLog[]>([]);
  const { toast } = useToast();

  // Registrar progresso de uma série
  const logProgress = useCallback(async (data: {
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

    try {
      const { data: result, error } = await supabase
        .from('exercise_progress_logs')
        .insert({
          user_id: userId,
          exercise_id: data.exerciseId || null,
          exercise_name: data.exerciseName,
          set_number: data.setNumber,
          reps_completed: data.repsCompleted || null,
          weight_kg: data.weightKg || null,
          duration_seconds: data.durationSeconds || null,
          perceived_difficulty: data.perceivedDifficulty || null,
          notes: data.notes || null
        })
        .select()
        .single();

      if (error) throw error;

      return result;
    } catch (error) {
      console.error('Erro ao registrar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o progresso",
        variant: "destructive"
      });
      return null;
    }
  }, [userId, toast]);

  // Buscar histórico de um exercício específico
  const getExerciseHistory = useCallback(async (exerciseName: string, limit = 30) => {
    if (!userId) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercise_progress_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .order('workout_date', { ascending: false })
        .order('set_number', { ascending: true })
        .limit(limit);

      if (error) throw error;

      setProgressHistory(data || []);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Buscar última carga usada para um exercício
  const getLastWeight = useCallback(async (exerciseName: string): Promise<number | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('exercise_progress_logs')
        .select('weight_kg')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .not('weight_kg', 'is', null)
        .order('workout_date', { ascending: false })
        .order('set_number', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      return data?.weight_kg || null;
    } catch (error) {
      console.error('Erro ao buscar última carga:', error);
      return null;
    }
  }, [userId]);

  // Buscar estatísticas gerais de um exercício
  const getExerciseStats = useCallback(async (exerciseName: string): Promise<ExerciseStats | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('exercise_progress_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data as ExerciseStats || null;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  }, [userId]);

  // Buscar evolução de peso para gráfico
  const getWeightProgression = useCallback(async (exerciseName: string, days = 30) => {
    if (!userId) return [];

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('exercise_progress_logs')
        .select('workout_date, weight_kg, set_number')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .not('weight_kg', 'is', null)
        .gte('workout_date', startDate.toISOString().split('T')[0])
        .order('workout_date', { ascending: true });

      if (error) throw error;

      // Agrupar por data e pegar o maior peso do dia
      const grouped = (data || []).reduce((acc: Record<string, number>, log) => {
        const date = log.workout_date;
        if (!acc[date] || (log.weight_kg && log.weight_kg > acc[date])) {
          acc[date] = log.weight_kg || 0;
        }
        return acc;
      }, {});

      return Object.entries(grouped).map(([date, weight]) => ({
        date,
        weight
      }));
    } catch (error) {
      console.error('Erro ao buscar progressão:', error);
      return [];
    }
  }, [userId]);

  // Calcular sugestão de carga (baseado em progressão linear)
  const getSuggestedWeight = useCallback(async (exerciseName: string): Promise<number | null> => {
    const lastWeight = await getLastWeight(exerciseName);
    if (!lastWeight) return null;

    // Sugerir aumento de 2.5kg ou 5% (o que for menor)
    const percentIncrease = lastWeight * 0.05;
    const increase = Math.min(2.5, percentIncrease);
    
    // Arredondar para múltiplos de 0.5
    return Math.round((lastWeight + increase) * 2) / 2;
  }, [getLastWeight]);

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
