// ============================================
// 👥 USE FOLLOWING WITH STATS HOOK
// Busca usuários que você segue com estatísticas de exercício
// Para sistema de desafios X1
// ============================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPES
// ============================================

// Dias da semana que o usuário treinou (0 = Domingo, 1 = Segunda, etc)
export interface WeeklyWorkoutDays {
  dom: boolean;
  seg: boolean;
  ter: boolean;
  qua: boolean;
  qui: boolean;
  sex: boolean;
  sab: boolean;
}

// Evolução de peso
export interface WeightEvolution {
  currentWeight?: number;
  previousWeight?: number;
  weightChange?: number; // positivo = ganhou, negativo = perdeu
  lastMeasurementDate?: string;
  bodyFatPercent?: number;
  muscleMassKg?: number;
}

// Conquistas/Records
export interface UserAchievements {
  totalAchievements: number;
  recentAchievements: string[];
  bestStreak: number;
}

export interface FollowingUser {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  // Estatísticas de exercício
  weeklyPoints: number;
  totalPoints: number;
  consecutiveDays: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  totalWorkouts: number;
  lastWorkoutDate?: string;
  // Calendário semanal de treinos
  weeklyWorkoutDays: WeeklyWorkoutDays;
  // Evolução de peso
  weightEvolution?: WeightEvolution;
  // Conquistas
  achievements?: UserAchievements;
  // Status
  isOnline?: boolean;
}

// ============================================
// MAIN HOOK
// ============================================

export function useFollowingWithStats(userId?: string) {
  const enabled = !!userId;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['following-with-stats', userId],
    queryFn: async (): Promise<FollowingUser[]> => {
      if (!userId) return [];

      // 1. Buscar quem o usuário segue
      const { data: follows, error: followsError } = await supabase
        .from('health_feed_follows')
        .select('following_id')
        .eq('follower_id', userId);

      console.log('[useFollowingWithStats] userId:', userId);
      console.log('[useFollowingWithStats] follows:', follows);
      console.log('[useFollowingWithStats] followsError:', followsError);

      if (followsError) {
        console.error('Erro ao buscar follows:', followsError);
        return [];
      }

      if (!follows || follows.length === 0) {
        console.log('[useFollowingWithStats] Nenhum follow encontrado');
        return [];
      }

      const followingIds = follows.map(f => f.following_id);
      console.log('[useFollowingWithStats] followingIds:', followingIds);

      // 2. Buscar perfis dos seguidos (usando user_id, não id)
      // IMPORTANTE: user_id na tabela profiles = auth.users.id = following_id em health_feed_follows
      console.log('[useFollowingWithStats] Buscando profiles com user_id IN:', followingIds);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url, bio')
        .in('user_id', followingIds);

      console.log('[useFollowingWithStats] profiles encontrados:', profiles?.length || 0);
      console.log('[useFollowingWithStats] profiles data:', JSON.stringify(profiles, null, 2));
      
      if (profilesError) {
        console.error('[useFollowingWithStats] profilesError:', profilesError);
      }

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        return [];
      }

      // 3. Buscar pontos de user_points (exercise_gamification_points was removed)
      const { data: points } = await supabase
        .from('user_points')
        .select('user_id, weekly_points, total_points, current_streak')
        .in('user_id', followingIds);

      const pointsMap = new Map(
        (points || []).map(p => [p.user_id, p])
      );

      // 4. Buscar contagem de treinos
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Buscar treinos da semana para todos os seguidos (com data para calcular dias)
      const { data: weeklyWorkouts } = await supabase
        .from('sport_workout_logs')
        .select('user_id, created_at')
        .in('user_id', followingIds)
        .gte('created_at', startOfWeek.toISOString());

      // Buscar treinos do mês
      const { data: monthlyWorkouts } = await supabase
        .from('sport_workout_logs')
        .select('user_id')
        .in('user_id', followingIds)
        .gte('created_at', startOfMonth.toISOString());

      // Buscar total de treinos
      const { data: totalWorkouts } = await supabase
        .from('sport_workout_logs')
        .select('user_id')
        .in('user_id', followingIds);

      // Buscar último treino de cada usuário
      const { data: lastWorkouts } = await supabase
        .from('sport_workout_logs')
        .select('user_id, created_at')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false });

      // Contar treinos por usuário e mapear dias da semana
      const weeklyCount = new Map<string, number>();
      const monthlyCount = new Map<string, number>();
      const totalCount = new Map<string, number>();
      const lastWorkoutMap = new Map<string, string>();
      const weeklyDaysMap = new Map<string, Set<number>>(); // user_id -> Set de dias (0-6)

      (weeklyWorkouts || []).forEach((w: { user_id: string; created_at: string }) => {
        weeklyCount.set(w.user_id, (weeklyCount.get(w.user_id) || 0) + 1);
        
        // Mapear dia da semana do treino
        const workoutDate = new Date(w.created_at);
        const dayOfWeek = workoutDate.getDay(); // 0 = Domingo, 1 = Segunda, etc
        
        if (!weeklyDaysMap.has(w.user_id)) {
          weeklyDaysMap.set(w.user_id, new Set());
        }
        weeklyDaysMap.get(w.user_id)!.add(dayOfWeek);
      });

      (monthlyWorkouts || []).forEach((w: { user_id: string }) => {
        monthlyCount.set(w.user_id, (monthlyCount.get(w.user_id) || 0) + 1);
      });

      (totalWorkouts || []).forEach((w: { user_id: string }) => {
        totalCount.set(w.user_id, (totalCount.get(w.user_id) || 0) + 1);
      });

      (lastWorkouts || []).forEach((w: { user_id: string; created_at: string }) => {
        if (!lastWorkoutMap.has(w.user_id)) {
          lastWorkoutMap.set(w.user_id, w.created_at);
        }
      });

      // 6. Buscar evolução de peso (últimas 2 medições de cada usuário)
      const { data: weightData } = await supabase
        .from('weight_measurements')
        .select('user_id, peso_kg, gordura_corporal_percent, massa_muscular_kg, measurement_date')
        .in('user_id', followingIds)
        .order('measurement_date', { ascending: false });

      // Mapear evolução de peso por usuário
      const weightEvolutionMap = new Map<string, WeightEvolution>();
      const userWeights = new Map<string, Array<{ peso_kg: number; date: string; bodyFat?: number; muscle?: number }>>();
      
      (weightData || []).forEach((w: { 
        user_id: string; 
        peso_kg: number; 
        gordura_corporal_percent?: number;
        massa_muscular_kg?: number;
        measurement_date: string 
      }) => {
        if (!userWeights.has(w.user_id)) {
          userWeights.set(w.user_id, []);
        }
        const weights = userWeights.get(w.user_id)!;
        if (weights.length < 2) {
          weights.push({ 
            peso_kg: w.peso_kg, 
            date: w.measurement_date,
            bodyFat: w.gordura_corporal_percent ? Number(w.gordura_corporal_percent) : undefined,
            muscle: w.massa_muscular_kg ? Number(w.massa_muscular_kg) : undefined
          });
        }
      });

      userWeights.forEach((weights, oderId) => {
        if (weights.length > 0) {
          const current = weights[0];
          const previous = weights[1];
          weightEvolutionMap.set(oderId, {
            currentWeight: Number(current.peso_kg),
            previousWeight: previous ? Number(previous.peso_kg) : undefined,
            weightChange: previous ? Number(current.peso_kg) - Number(previous.peso_kg) : undefined,
            lastMeasurementDate: current.date,
            bodyFatPercent: current.bodyFat,
            muscleMassKg: current.muscle,
          });
        }
      });

      // 7. Buscar conquistas/achievements
      const { data: achievementsData } = await supabase
        .from('sports_achievements')
        .select('user_id, achievement_name, unlocked_at')
        .in('user_id', followingIds)
        .order('unlocked_at', { ascending: false });

      const achievementsMap = new Map<string, UserAchievements>();
      const userAchievements = new Map<string, string[]>();
      
      (achievementsData || []).forEach((a: { user_id: string; achievement_name: string }) => {
        if (!userAchievements.has(a.user_id)) {
          userAchievements.set(a.user_id, []);
        }
        userAchievements.get(a.user_id)!.push(a.achievement_name);
      });

      userAchievements.forEach((achievements, oderId) => {
        achievementsMap.set(oderId, {
          totalAchievements: achievements.length,
          recentAchievements: achievements.slice(0, 3), // últimas 3
          bestStreak: 0, // TODO: calcular do histórico
        });
      });

      // 8. Montar resultado (usar user_id para buscar nos Maps, pois é a chave correta)
      const result: FollowingUser[] = (profiles || []).map(profile => {
        const authUserId = profile.user_id; // user_id é a chave correta (referencia auth.users.id)
        const userPoints = pointsMap.get(authUserId);
        const workoutDays = weeklyDaysMap.get(authUserId) || new Set<number>();
        const weightEvo = weightEvolutionMap.get(authUserId);
        const userAchievs = achievementsMap.get(authUserId);
        
        return {
          id: authUserId, // Usar user_id como ID para desafios (é o auth.users.id)
          name: profile.full_name || 'Usuário',
          avatarUrl: profile.avatar_url || undefined,
          bio: profile.bio || undefined,
          weeklyPoints: userPoints?.weekly_points || 0,
          totalPoints: userPoints?.total_points || 0,
          consecutiveDays: userPoints?.current_streak || 0,
          workoutsThisWeek: weeklyCount.get(authUserId) || 0,
          workoutsThisMonth: monthlyCount.get(authUserId) || 0,
          totalWorkouts: totalCount.get(authUserId) || 0,
          lastWorkoutDate: lastWorkoutMap.get(authUserId),
          weeklyWorkoutDays: {
            dom: workoutDays.has(0),
            seg: workoutDays.has(1),
            ter: workoutDays.has(2),
            qua: workoutDays.has(3),
            qui: workoutDays.has(4),
            sex: workoutDays.has(5),
            sab: workoutDays.has(6),
          },
          weightEvolution: weightEvo,
          achievements: userAchievs,
          isOnline: false, // TODO: implementar presence real
        };
      });

      console.log('[useFollowingWithStats] RESULTADO FINAL:', result.length, 'usuários');
      console.log('[useFollowingWithStats] Nomes:', result.map(r => r.name).join(', '));

      // Ordenar por pontos semanais
      return result.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    following: data || [],
    isLoading,
    error: error?.message,
    refresh: refetch,
  };
}

export default useFollowingWithStats;
