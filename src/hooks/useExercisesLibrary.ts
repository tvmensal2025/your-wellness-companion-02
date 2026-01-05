import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  location: string;
  difficulty: string;
  equipment_needed: string[] | null;
  youtube_url: string | null;
  image_url: string | null;
  instructions: string[] | null;
  sets: string | null;
  reps: string | null;
  rest_time: string | null;
  tips: string | null;
  is_active: boolean;
  order_index: number | null;
}

export interface WeeklyPlan {
  dayNumber: number;
  dayName: string;
  shortName: string;
  muscleGroups: string[];
  title: string;
  exercises: Exercise[];
  isRestDay: boolean;
  isToday: boolean;
}

// Planos de treino por objetivo
const TRAINING_SPLITS = {
  hipertrofia: {
    // Treino ABC (3x por semana)
    days: [
      { dayNumber: 1, muscleGroups: ['peito', 'triceps', 'ombros'], title: 'Treino A - Peito, Tríceps & Ombros' },
      { dayNumber: 2, muscleGroups: ['costas', 'biceps', 'trapezio', 'antebraco'], title: 'Treino B - Costas & Bíceps' },
      { dayNumber: 3, muscleGroups: ['pernas', 'quadriceps', 'posterior', 'gluteos', 'panturrilha'], title: 'Treino C - Pernas & Glúteos' },
      { dayNumber: 4, muscleGroups: ['peito', 'triceps', 'ombros'], title: 'Treino A - Peito, Tríceps & Ombros' },
      { dayNumber: 5, muscleGroups: ['costas', 'biceps', 'trapezio', 'antebraco'], title: 'Treino B - Costas & Bíceps' },
      { dayNumber: 6, muscleGroups: [], title: 'Descanso', isRest: true },
      { dayNumber: 0, muscleGroups: [], title: 'Descanso', isRest: true },
    ]
  },
  emagrecimento: {
    days: [
      { dayNumber: 1, muscleGroups: ['funcional', 'abdomen', 'obliquos'], title: 'Segunda - Funcional + Core' },
      { dayNumber: 2, muscleGroups: ['pernas', 'gluteos', 'posterior'], title: 'Terça - Lower Body' },
      { dayNumber: 3, muscleGroups: ['peito', 'costas', 'ombros'], title: 'Quarta - Upper Body' },
      { dayNumber: 4, muscleGroups: ['funcional', 'abdomen'], title: 'Quinta - HIIT + Core' },
      { dayNumber: 5, muscleGroups: ['pernas', 'gluteos', 'funcional'], title: 'Sexta - Full Body' },
      { dayNumber: 6, muscleGroups: ['mobilidade', 'aquecimento'], title: 'Sábado - Mobilidade Ativa' },
      { dayNumber: 0, muscleGroups: [], title: 'Domingo - Descanso', isRest: true },
    ]
  },
  condicionamento: {
    days: [
      { dayNumber: 1, muscleGroups: ['funcional', 'pernas'], title: 'Segunda - Força Funcional' },
      { dayNumber: 2, muscleGroups: ['peito', 'costas', 'abdomen'], title: 'Terça - Upper + Core' },
      { dayNumber: 3, muscleGroups: ['aquecimento', 'mobilidade'], title: 'Quarta - Recuperação Ativa' },
      { dayNumber: 4, muscleGroups: ['pernas', 'gluteos', 'posterior'], title: 'Quinta - Lower Body' },
      { dayNumber: 5, muscleGroups: ['funcional', 'ombros', 'triceps', 'biceps'], title: 'Sexta - Full Body' },
      { dayNumber: 6, muscleGroups: [], title: 'Sábado - Descanso', isRest: true },
      { dayNumber: 0, muscleGroups: [], title: 'Domingo - Descanso', isRest: true },
    ]
  },
  saude: {
    days: [
      { dayNumber: 1, muscleGroups: ['aquecimento', 'mobilidade', 'funcional'], title: 'Segunda - Mobilidade' },
      { dayNumber: 2, muscleGroups: ['pernas', 'gluteos'], title: 'Terça - Força Leve' },
      { dayNumber: 3, muscleGroups: ['peito', 'costas', 'abdomen'], title: 'Quarta - Upper Body' },
      { dayNumber: 4, muscleGroups: [], title: 'Quinta - Descanso', isRest: true },
      { dayNumber: 5, muscleGroups: ['funcional', 'mobilidade'], title: 'Sexta - Funcional Leve' },
      { dayNumber: 6, muscleGroups: [], title: 'Sábado - Descanso', isRest: true },
      { dayNumber: 0, muscleGroups: [], title: 'Domingo - Descanso', isRest: true },
    ]
  }
};

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const useExercisesLibrary = (
  location: 'casa' | 'academia' = 'casa',
  goal: string = 'condicionamento',
  difficulty?: string
) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar exercícios por grupos musculares
  const fetchExercisesByMuscleGroups = useCallback(async (muscleGroups: string[]): Promise<Exercise[]> => {
    if (muscleGroups.length === 0) return [];

    try {
      let query = supabase
        .from('exercises_library')
        .select('*')
        .eq('is_active', true)
        .eq('location', location)
        .in('muscle_group', muscleGroups);

      if (difficulty && difficulty !== 'todos') {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Limitar a 4-6 exercícios por grupo muscular para não sobrecarregar
      const grouped = (data || []).reduce((acc: Record<string, Exercise[]>, ex: any) => {
        if (!acc[ex.muscle_group]) acc[ex.muscle_group] = [];
        if (acc[ex.muscle_group].length < 3) {
          acc[ex.muscle_group].push(ex as Exercise);
        }
        return acc;
      }, {});

      // Flatten e shuffle levemente
      return Object.values(grouped).flat();
    } catch (err) {
      console.error('Erro ao buscar exercícios:', err);
      return [];
    }
  }, [location, difficulty]);

  // Gerar plano semanal baseado no objetivo
  const generateWeeklyPlan = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const normalizedGoal = goal.toLowerCase().replace(/\s+/g, '');
      const split = TRAINING_SPLITS[normalizedGoal as keyof typeof TRAINING_SPLITS] || TRAINING_SPLITS.condicionamento;
      
      const today = new Date().getDay(); // 0-6 (domingo-sábado)
      
      const planPromises = split.days.map(async (dayConfig) => {
        const exercises = dayConfig.isRest 
          ? [] 
          : await fetchExercisesByMuscleGroups(dayConfig.muscleGroups);

        return {
          dayNumber: dayConfig.dayNumber,
          dayName: DAY_NAMES[dayConfig.dayNumber],
          shortName: DAY_SHORT[dayConfig.dayNumber],
          muscleGroups: dayConfig.muscleGroups,
          title: dayConfig.title,
          exercises,
          isRestDay: dayConfig.isRest || false,
          isToday: dayConfig.dayNumber === today
        };
      });

      const weekPlan = await Promise.all(planPromises);
      
      // Ordenar por dia da semana (segunda = 1, domingo = 0 vai pro final)
      const sortedPlan = weekPlan.sort((a, b) => {
        const orderA = a.dayNumber === 0 ? 7 : a.dayNumber;
        const orderB = b.dayNumber === 0 ? 7 : b.dayNumber;
        return orderA - orderB;
      });

      setWeeklyPlan(sortedPlan);
      
      // Definir treino de hoje
      const todayPlan = sortedPlan.find(day => day.isToday);
      setTodayWorkout(todayPlan || null);

      // Também setar todos os exercícios para compatibilidade
      const allExercises = sortedPlan.flatMap(day => day.exercises);
      setExercises(allExercises);

    } catch (err) {
      console.error('Erro ao gerar plano semanal:', err);
      setError('Não foi possível carregar o plano de treino');
    } finally {
      setLoading(false);
    }
  }, [goal, fetchExercisesByMuscleGroups]);

  // Buscar exercício específico por ID
  const getExerciseById = async (id: string): Promise<Exercise | null> => {
    try {
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Exercise;
    } catch (err) {
      console.error('Erro ao buscar exercício:', err);
      return null;
    }
  };

  // Buscar exercícios por grupo muscular
  const getExercisesByMuscleGroup = async (muscleGroup: string): Promise<Exercise[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .eq('is_active', true)
        .eq('location', location)
        .eq('muscle_group', muscleGroup);

      if (error) throw error;
      return (data || []) as Exercise[];
    } catch (err) {
      console.error('Erro ao buscar por grupo muscular:', err);
      return [];
    }
  };

  useEffect(() => {
    generateWeeklyPlan();
  }, [generateWeeklyPlan]);

  return {
    exercises,
    weeklyPlan,
    todayWorkout,
    loading,
    error,
    refreshPlan: generateWeeklyPlan,
    getExerciseById,
    getExercisesByMuscleGroup
  };
};
