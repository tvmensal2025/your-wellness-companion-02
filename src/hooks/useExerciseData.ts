/**
 * useExerciseData Hook - OTIMIZADO
 * Busca dados de exercícios com cache agressivo para carregamento instantâneo
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ExerciseData {
  workoutsThisMonth: number;
  workoutsChange: string;
  totalMinutes: number;
  minutesChange: string;
  streak: number;
  goalProgress: number;
  strength: number;
  endurance: number;
  consistency: number;
  records: Array<{
    name: string;
    weight: string;
    date: string;
  }>;
  recentWorkouts: Array<{
    id: string;
    name: string;
    duration: number;
    date: string;
  }>;
}

// Dados padrão para mostrar instantaneamente
const DEFAULT_DATA: ExerciseData = {
  workoutsThisMonth: 0,
  workoutsChange: '+0%',
  totalMinutes: 0,
  minutesChange: '+0%',
  streak: 0,
  goalProgress: 0,
  strength: 50,
  endurance: 50,
  consistency: 50,
  records: [],
  recentWorkouts: [],
};

// Cache key
const EXERCISE_DATA_KEY = 'exercise-data';

// Tentar recuperar do localStorage para carregamento instantâneo
function getCachedData(userId: string): ExerciseData | null {
  try {
    const cached = localStorage.getItem(`${EXERCISE_DATA_KEY}-${userId}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache válido por 5 minutos
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  } catch {
    // Ignora erros de parse
  }
  return null;
}

function setCachedData(userId: string, data: ExerciseData) {
  try {
    localStorage.setItem(`${EXERCISE_DATA_KEY}-${userId}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignora erros de storage
  }
}

async function fetchExerciseData(userId: string): Promise<ExerciseData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  // Fazer todas as queries em paralelo (exercise_sessions was removed, using only user_exercise_history)
  const [
    historyResult,
    lastMonthHistoryResult,
    pointsResult,
    goalResult,
  ] = await Promise.all([
    // Treinos deste mês (user_exercise_history)
    supabase
      .from('user_exercise_history')
      .select('id, exercise_name, duration_seconds, completed_at')
      .eq('user_id', userId)
      .gte('completed_at', startOfMonth)
      .order('completed_at', { ascending: false })
      .limit(50),
    
    // Treinos do mês passado (user_exercise_history - só count)
    supabase
      .from('user_exercise_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', startOfLastMonth)
      .lte('completed_at', endOfLastMonth),
    
    // Streak
    supabase
      .from('user_points')
      .select('current_streak')
      .eq('user_id', userId)
      .single(),
    
    // Meta de treinos
    supabase
      .from('user_goals')
      .select('target_value, current_value')
      .eq('user_id', userId)
      .eq('goal_type', 'workouts')
      .eq('status', 'active')
      .maybeSingle(),
  ]);

  // Usar apenas user_exercise_history
  const history = historyResult.data || [];
  
  // Calcular treinos únicos por data
  const uniqueWorkoutDates = new Set<string>();
  
  // Adicionar datas de user_exercise_history
  history.forEach(h => {
    const date = new Date(h.completed_at).toISOString().slice(0, 10);
    uniqueWorkoutDates.add(date);
  });
  
  const workoutsCount = uniqueWorkoutDates.size;
  
  // Contagem do mês passado
  const lastMonthCount = Math.floor((lastMonthHistoryResult.count || 0) / 3); // Estimar sessões

  // Calcular totais
  const workoutsChangePercent = lastMonthCount > 0 
    ? Math.round(((workoutsCount - lastMonthCount) / lastMonthCount) * 100)
    : 0;

  // Calcular minutos totais
  const totalMinutes = history.reduce((acc, h) => acc + Math.ceil((h.duration_seconds || 0) / 60), 0);

  // Calcular progresso da meta
  const goalProgress = goalResult.data?.target_value 
    ? Math.min(100, Math.round((workoutsCount / goalResult.data.target_value) * 100))
    : Math.min(100, Math.round((workoutsCount / 12) * 100));

  // Calcular métricas
  const consistency = Math.min(100, Math.round((workoutsCount / 20) * 100));
  const strength = Math.min(100, 50 + workoutsCount * 2);
  const endurance = Math.min(100, Math.round(totalMinutes / 6));

  // Formatar dados recentes de user_exercise_history
  const allWorkouts = history.map(h => ({
    id: h.id,
    name: h.exercise_name || 'Exercício',
    duration: Math.ceil((h.duration_seconds || 0) / 60),
    date: h.completed_at,
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Formatar dados
  const records = allWorkouts.slice(0, 3).map((w) => ({
    name: w.name,
    weight: `${w.duration || 0} min`,
    date: formatRelativeDate(w.date),
  }));

  const recentWorkouts = allWorkouts.slice(0, 5).map((w) => ({
    id: w.id,
    name: w.name,
    duration: w.duration,
    date: formatRelativeDate(w.date),
  }));

  const data: ExerciseData = {
    workoutsThisMonth: workoutsCount,
    workoutsChange: `${workoutsChangePercent >= 0 ? '+' : ''}${workoutsChangePercent}%`,
    totalMinutes,
    minutesChange: '+0%',
    streak: pointsResult.data?.current_streak || 0,
    goalProgress,
    strength,
    endurance,
    consistency,
    records,
    recentWorkouts,
  };

  // Salvar no cache local
  setCachedData(userId, data);

  return data;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function useExerciseData() {
  const { user } = useAuth();
  const userId = user?.id;

  // Tentar pegar dados do cache local para mostrar instantaneamente
  const cachedData = userId ? getCachedData(userId) : null;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['exercise-data', userId],
    queryFn: () => fetchExerciseData(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Usar dados do cache local como placeholder
    placeholderData: cachedData || DEFAULT_DATA,
  });

  return {
    exerciseData: data || cachedData || DEFAULT_DATA,
    loading: isLoading && !cachedData,
    error: error?.message || null,
    refresh: refetch,
  };
}

export default useExerciseData;
