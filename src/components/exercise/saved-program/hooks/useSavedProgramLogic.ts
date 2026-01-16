// ============================================
// 📋 USE SAVED PROGRAM LOGIC
// Lógica de programas salvos e seleção de dias
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Exercise } from '@/hooks/useExercisesLibrary';
import { matchExercisesFromActivities } from '@/lib/exercise-matching';

// ============================================
// TYPES
// ============================================

export interface WeekActivity {
  week: number;
  activities: string[];
  days: string;
}

export interface SavedProgramData {
  description?: string;
  goal?: string;
  level?: string;
  location?: string;
  limitation?: string;
  weeks?: WeekActivity[];
}

export interface SavedProgram {
  id: string;
  plan_name?: string;
  name?: string;
  current_week: number;
  duration_weeks: number;
  completed_workouts: number;
  total_workouts: number;
  workouts_per_week: number;
  status: string;
  plan_data?: SavedProgramData;
  exercises?: SavedProgramData;
  goal?: string;
  difficulty?: string;
}

export interface DayPlan {
  dayNumber: number;
  dayName: string;
  shortName: string;
  title: string;
  activities: string[];
  isToday: boolean;
  isRestDay: boolean;
  muscleGroups: string[];
  estimatedTime: number;
}

// ============================================
// HELPERS
// ============================================

const extractMuscleGroups = (activity: string): string[] => {
  const groups: string[] = [];
  const activityLower = activity.toLowerCase();
  
  if (activityLower.includes('perna') || activityLower.includes('agachamento') || activityLower.includes('leg')) groups.push('Pernas');
  if (activityLower.includes('peito') || activityLower.includes('supino') || activityLower.includes('flexão') || activityLower.includes('push')) groups.push('Peito');
  if (activityLower.includes('costa') || activityLower.includes('remada') || activityLower.includes('pull')) groups.push('Costas');
  if (activityLower.includes('ombro') || activityLower.includes('desenvolvimento')) groups.push('Ombros');
  if (activityLower.includes('braço') || activityLower.includes('bíceps') || activityLower.includes('tríceps')) groups.push('Braços');
  if (activityLower.includes('cardio') || activityLower.includes('aeróbico') || activityLower.includes('corrida') || activityLower.includes('caminhada')) groups.push('Cardio');
  if (activityLower.includes('funcional') || activityLower.includes('core') || activityLower.includes('abdominal')) groups.push('Funcional');
  if (activityLower.includes('mobilidade') || activityLower.includes('alongamento') || activityLower.includes('flexibilidade')) groups.push('Mobilidade');
  
  return groups.length > 0 ? groups : ['Funcional'];
};

export const limitationLabels: Record<string, string> = {
  joelho: '🦵 Joelho',
  coluna: '🦴 Coluna',
  ombro: '💪 Ombro',
  quadril: '🦿 Quadril',
  nenhuma: '',
};

// ============================================
// HOOK
// ============================================

interface UseSavedProgramLogicProps {
  program: SavedProgram;
}

export function useSavedProgramLogic({ program }: UseSavedProgramLogicProps) {
  const programData = program.plan_data || program.exercises || {};
  const weeks = programData.weeks || [];
  const currentWeekData = weeks.find((w: WeekActivity) => w.week === program.current_week);
  const limitation = programData.limitation;
  const location = 'casa' as const;

  // Week days calculation
  const weekDays = useMemo<DayPlan[]>(() => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const shortNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    const today = new Date().getDay();
    
    if (!currentWeekData) {
      return dayNames.map((name, idx) => ({
        dayNumber: idx,
        dayName: name,
        shortName: shortNames[idx],
        title: `${name} - Descanso`,
        activities: [],
        isToday: idx === today,
        isRestDay: true,
        muscleGroups: [],
        estimatedTime: 0
      }));
    }
    
    const workoutsPerWeek = program.workouts_per_week || 3;
    const activities = currentWeekData.activities || [];
    
    const trainingDays = workoutsPerWeek >= 5 
      ? [1, 2, 3, 4, 5]
      : workoutsPerWeek >= 4
        ? [1, 2, 4, 5]
        : workoutsPerWeek >= 3
          ? [1, 3, 5]
          : [1, 4];
    
    const activitiesPerDay = Math.ceil(activities.length / trainingDays.length);
    
    return dayNames.map((name, idx) => {
      const trainingDayIndex = trainingDays.indexOf(idx);
      const isTrainingDay = trainingDayIndex !== -1;
      
      if (!isTrainingDay) {
        return {
          dayNumber: idx,
          dayName: name,
          shortName: shortNames[idx],
          title: `${name} - Descanso`,
          activities: [],
          isToday: idx === today,
          isRestDay: true,
          muscleGroups: [],
          estimatedTime: 0
        };
      }
      
      const startIdx = trainingDayIndex * activitiesPerDay;
      const dayActivities = activities.slice(startIdx, startIdx + activitiesPerDay);
      const muscleGroups = [...new Set(dayActivities.flatMap(extractMuscleGroups))];
      const mainGroup = muscleGroups[0] || 'Funcional';
      const title = `${name} - ${mainGroup}`;
      
      return {
        dayNumber: idx,
        dayName: name,
        shortName: shortNames[idx],
        title,
        activities: dayActivities,
        isToday: idx === today,
        isRestDay: false,
        muscleGroups,
        estimatedTime: dayActivities.length * 4
      };
    });
  }, [currentWeekData, program.workouts_per_week]);

  // Selected day state
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(() => {
    return weekDays.find(d => d.isToday) || weekDays.find(d => !d.isRestDay) || null;
  });

  // Library exercises
  const [libraryExercises, setLibraryExercises] = useState<Exercise[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLibraryLoading(true);
        
        const { data, error } = await supabase
          .from('exercises_library')
          .select('*')
          .eq('is_active', true)
          .eq('location', location);

        if (!mounted) return;
        if (error) throw error;

        let exercises = data || [];
        
        if (exercises.length < 10) {
          const { data: allData, error: allError } = await supabase
            .from('exercises_library')
            .select('*')
            .eq('is_active', true);

          if (!allError && allData && allData.length > exercises.length) {
            exercises = allData;
          }
        }

        setLibraryExercises(exercises as Exercise[]);
      } catch (e) {
        console.error('Erro ao carregar biblioteca de exercícios:', e);
        if (mounted) setLibraryExercises([]);
      } finally {
        if (mounted) setLibraryLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [location]);

  // Day exercises
  const dayExercises = useMemo(() => {
    if (!selectedDay || selectedDay.isRestDay || libraryExercises.length === 0) {
      return [] as Exercise[];
    }

    const { exercises } = matchExercisesFromActivities(
      selectedDay.activities,
      libraryExercises,
      { maxPerActivity: 3, preferWithVideo: true }
    );

    return exercises;
  }, [selectedDay, libraryExercises]);

  return {
    // Data
    programData,
    weeks,
    limitation,
    location,
    weekDays,
    selectedDay,
    libraryExercises,
    libraryLoading,
    dayExercises,
    currentWeek: program.current_week,
    
    // Actions
    setSelectedDay,
  };
}

export type SavedProgramLogicReturn = ReturnType<typeof useSavedProgramLogic>;
