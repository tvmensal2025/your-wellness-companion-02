import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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

// Planos de treino por objetivo - ABCDE
// Os muscleGroups devem corresponder EXATAMENTE aos valores na tabela exercises_library
const TRAINING_SPLITS = {
  hipertrofia: {
    days: [
      { dayNumber: 1, muscleGroups: ['peito', 'triceps', 'ombros'], title: 'Treino A - Peito, Tríceps & Ombros' },
      { dayNumber: 2, muscleGroups: ['costas', 'biceps', 'bracos'], title: 'Treino B - Costas & Bíceps' },
      { dayNumber: 3, muscleGroups: ['pernas', 'gluteos'], title: 'Treino C - Pernas & Glúteos' },
      { dayNumber: 4, muscleGroups: ['peito', 'triceps', 'ombros'], title: 'Treino A - Peito, Tríceps & Ombros' },
      { dayNumber: 5, muscleGroups: ['costas', 'biceps', 'bracos'], title: 'Treino B - Costas & Bíceps' },
      { dayNumber: 6, muscleGroups: [], title: 'Descanso', isRest: true },
      { dayNumber: 0, muscleGroups: [], title: 'Descanso', isRest: true },
    ]
  },
  emagrecimento: {
    days: [
      { dayNumber: 1, muscleGroups: ['funcional', 'abdomen'], title: 'Segunda - Funcional + Core' },
      { dayNumber: 2, muscleGroups: ['pernas', 'gluteos'], title: 'Terça - Lower Body' },
      { dayNumber: 3, muscleGroups: ['peito', 'costas', 'ombros'], title: 'Quarta - Upper Body' },
      { dayNumber: 4, muscleGroups: ['funcional', 'abdomen'], title: 'Quinta - HIIT + Core' },
      { dayNumber: 5, muscleGroups: ['pernas', 'gluteos', 'funcional'], title: 'Sexta - Full Body' },
      { dayNumber: 6, muscleGroups: ['mobilidade'], title: 'Sábado - Mobilidade Ativa' },
      { dayNumber: 0, muscleGroups: [], title: 'Domingo - Descanso', isRest: true },
    ]
  },
  condicionamento: {
    days: [
      { dayNumber: 1, muscleGroups: ['funcional', 'pernas'], title: 'Segunda - Força Funcional' },
      { dayNumber: 2, muscleGroups: ['peito', 'costas', 'abdomen'], title: 'Terça - Upper + Core' },
      { dayNumber: 3, muscleGroups: ['mobilidade'], title: 'Quarta - Recuperação Ativa' },
      { dayNumber: 4, muscleGroups: ['pernas', 'gluteos'], title: 'Quinta - Lower Body' },
      { dayNumber: 5, muscleGroups: ['funcional', 'ombros', 'bracos'], title: 'Sexta - Full Body' },
      { dayNumber: 6, muscleGroups: [], title: 'Sábado - Descanso', isRest: true },
      { dayNumber: 0, muscleGroups: [], title: 'Domingo - Descanso', isRest: true },
    ]
  },
  saude: {
    days: [
      { dayNumber: 1, muscleGroups: ['mobilidade', 'funcional'], title: 'Segunda - Mobilidade' },
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

const getExercisesPerGroup = (exercisesPerDay?: string, time?: string, level?: string): number => {
  if (exercisesPerDay === '3-4') return 4;
  if (exercisesPerDay === '5-6') return 6;
  if (exercisesPerDay === '7-8') return 8;
  if (exercisesPerDay === '9-12') return 12;
  if (time === '10-15') return 3;
  if (time === '20-30') return 4;
  if (time === '30-45') return 5;
  if (time === '45-60') return 6;
  if (level === 'sedentario') return 3;
  if (level === 'leve') return 4;
  if (level === 'moderado') return 5;
  if (level === 'avancado') return 6;
  return 5;
};

// Gerar plano placeholder para mostrar instantaneamente
const generatePlaceholderPlan = (goal: string): WeeklyPlan[] => {
  const normalizedGoal = goal.toLowerCase().replace(/\s+/g, '');
  const split = TRAINING_SPLITS[normalizedGoal as keyof typeof TRAINING_SPLITS] || TRAINING_SPLITS.condicionamento;
  const today = new Date().getDay();
  
  return split.days.map((dayConfig) => ({
    dayNumber: dayConfig.dayNumber,
    dayName: DAY_NAMES[dayConfig.dayNumber],
    shortName: DAY_SHORT[dayConfig.dayNumber],
    muscleGroups: dayConfig.muscleGroups,
    title: dayConfig.title,
    exercises: [], // Vazio inicialmente
    isRestDay: dayConfig.isRest || false,
    isToday: dayConfig.dayNumber === today
  })).sort((a, b) => {
    const orderA = a.dayNumber === 0 ? 7 : a.dayNumber;
    const orderB = b.dayNumber === 0 ? 7 : b.dayNumber;
    return orderA - orderB;
  });
};

// Função para buscar todos os exercícios de uma vez
async function fetchAllExercises(location: string, difficulty?: string): Promise<Exercise[]> {
  let query = supabase
    .from('exercises_library')
    .select('*')
    .eq('is_active', true)
    .eq('location', location);

  if (difficulty && difficulty !== 'todos') {
    query = query.eq('difficulty', difficulty);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Exercise[];
}

// Função para gerar plano a partir dos exercícios
function generatePlanFromExercises(
  exercises: Exercise[],
  goal: string,
  exercisesPerGroup: number
): WeeklyPlan[] {
  const normalizedGoal = goal.toLowerCase().replace(/\s+/g, '');
  const split = TRAINING_SPLITS[normalizedGoal as keyof typeof TRAINING_SPLITS] || TRAINING_SPLITS.condicionamento;
  const today = new Date().getDay();

  // Agrupar exercícios por muscle_group (normalizado para lowercase)
  const exercisesByGroup: Record<string, Exercise[]> = {};
  exercises.forEach(ex => {
    const group = (ex.muscle_group || 'funcional').toLowerCase();
    if (!exercisesByGroup[group]) {
      exercisesByGroup[group] = [];
    }
    exercisesByGroup[group].push(ex);
  });

  // Log para debug
  console.log('[useExercisesLibrary] Grupos disponíveis:', Object.keys(exercisesByGroup));
  console.log('[useExercisesLibrary] Total exercícios por grupo:', 
    Object.entries(exercisesByGroup).map(([k, v]) => `${k}: ${v.length}`).join(', ')
  );

  return split.days.map((dayConfig) => {
    const dayExercises: Exercise[] = [];
    
    if (!dayConfig.isRest) {
      // Para cada grupo muscular do dia
      dayConfig.muscleGroups.forEach(group => {
        const normalizedGroup = group.toLowerCase();
        const groupExercises = exercisesByGroup[normalizedGroup] || [];
        
        // Pegar exercícios deste grupo (limitado por exercisesPerGroup)
        const toAdd = groupExercises.slice(0, Math.ceil(exercisesPerGroup / dayConfig.muscleGroups.length));
        dayExercises.push(...toAdd);
      });

      // Se não encontrou exercícios suficientes, buscar de 'funcional' como fallback
      if (dayExercises.length < 3 && exercisesByGroup['funcional']) {
        const funcionalExercises = exercisesByGroup['funcional']
          .filter(ex => !dayExercises.some(de => de.id === ex.id))
          .slice(0, 3 - dayExercises.length);
        dayExercises.push(...funcionalExercises);
      }
    }

    return {
      dayNumber: dayConfig.dayNumber,
      dayName: DAY_NAMES[dayConfig.dayNumber],
      shortName: DAY_SHORT[dayConfig.dayNumber],
      muscleGroups: dayConfig.muscleGroups,
      title: dayConfig.title,
      exercises: dayExercises,
      isRestDay: dayConfig.isRest || false,
      isToday: dayConfig.dayNumber === today
    };
  }).sort((a, b) => {
    const orderA = a.dayNumber === 0 ? 7 : a.dayNumber;
    const orderB = b.dayNumber === 0 ? 7 : b.dayNumber;
    return orderA - orderB;
  });
}

export const useExercisesLibrary = (
  location: 'casa' | 'academia' = 'casa',
  goal: string = 'condicionamento',
  difficulty?: string,
  time?: string,
  level?: string,
  exercisesPerDay?: string
) => {
  const exercisesPerGroup = getExercisesPerGroup(exercisesPerDay, time, level);

  // Placeholder para mostrar instantaneamente
  const placeholderPlan = useMemo(() => generatePlaceholderPlan(goal), [goal]);

  // Query com cache agressivo
  const { data: allExercises, isLoading, error, refetch } = useQuery({
    queryKey: ['exercises-library', location, difficulty],
    queryFn: () => fetchAllExercises(location, difficulty),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Gerar plano a partir dos exercícios
  const weeklyPlan = useMemo(() => {
    if (!allExercises || allExercises.length === 0) {
      return placeholderPlan;
    }
    return generatePlanFromExercises(allExercises, goal, exercisesPerGroup);
  }, [allExercises, goal, exercisesPerGroup, placeholderPlan]);

  // Treino de hoje
  const todayWorkout = useMemo(() => {
    return weeklyPlan.find(day => day.isToday) || null;
  }, [weeklyPlan]);

  // Todos os exercícios (para compatibilidade)
  const exercises = useMemo(() => {
    return weeklyPlan.flatMap(day => day.exercises);
  }, [weeklyPlan]);

  // Buscar exercício específico por ID
  const getExerciseById = useCallback(async (id: string): Promise<Exercise | null> => {
    // Primeiro tentar no cache local
    const cached = allExercises?.find(ex => ex.id === id);
    if (cached) return cached;

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
  }, [allExercises]);

  // Buscar exercícios por grupo muscular
  const getExercisesByMuscleGroup = useCallback(async (muscleGroup: string): Promise<Exercise[]> => {
    // Primeiro tentar no cache local
    const cached = allExercises?.filter(ex => ex.muscle_group === muscleGroup);
    if (cached && cached.length > 0) return cached;

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
  }, [allExercises, location]);

  return {
    exercises,
    weeklyPlan,
    todayWorkout,
    loading: isLoading,
    error: error?.message || null,
    refreshPlan: refetch,
    getExerciseById,
    getExercisesByMuscleGroup
  };
};
