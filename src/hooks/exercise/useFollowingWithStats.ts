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

      if (followsError) {
        console.error('Erro ao buscar follows:', followsError);
        return [];
      }

      if (!follows || follows.length === 0) {
        return [];
      }

      const followingIds = follows.map(f => f.following_id);

      // 2. Buscar perfis dos seguidos
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio')
        .in('id', followingIds);

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        return [];
      }

      // 3. Buscar pontos de exercício
      const { data: points } = await supabase
        .from('exercise_gamification_points')
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

      // Buscar treinos da semana para todos os seguidos
      const { data: weeklyWorkouts } = await supabase
        .from('sport_workout_logs')
        .select('user_id')
        .in('user_id', followingIds)
        .gte('completed_at', startOfWeek.toISOString());

      // Buscar treinos do mês
      const { data: monthlyWorkouts } = await supabase
        .from('sport_workout_logs')
        .select('user_id')
        .in('user_id', followingIds)
        .gte('completed_at', startOfMonth.toISOString());

      // Buscar total de treinos
      const { data: totalWorkouts } = await supabase
        .from('sport_workout_logs')
        .select('user_id')
        .in('user_id', followingIds);

      // Buscar último treino de cada usuário
      const { data: lastWorkouts } = await supabase
        .from('sport_workout_logs')
        .select('user_id, completed_at')
        .in('user_id', followingIds)
        .order('completed_at', { ascending: false });

      // Contar treinos por usuário
      const weeklyCount = new Map<string, number>();
      const monthlyCount = new Map<string, number>();
      const totalCount = new Map<string, number>();
      const lastWorkoutMap = new Map<string, string>();

      (weeklyWorkouts || []).forEach(w => {
        weeklyCount.set(w.user_id, (weeklyCount.get(w.user_id) || 0) + 1);
      });

      (monthlyWorkouts || []).forEach(w => {
        monthlyCount.set(w.user_id, (monthlyCount.get(w.user_id) || 0) + 1);
      });

      (totalWorkouts || []).forEach(w => {
        totalCount.set(w.user_id, (totalCount.get(w.user_id) || 0) + 1);
      });

      (lastWorkouts || []).forEach(w => {
        if (!lastWorkoutMap.has(w.user_id)) {
          lastWorkoutMap.set(w.user_id, w.completed_at);
        }
      });

      // 5. Montar resultado
      const result: FollowingUser[] = (profiles || []).map(profile => {
        const userPoints = pointsMap.get(profile.id);
        
        return {
          id: profile.id,
          name: profile.full_name || 'Usuário',
          avatarUrl: profile.avatar_url || undefined,
          bio: profile.bio || undefined,
          weeklyPoints: userPoints?.weekly_points || 0,
          totalPoints: userPoints?.total_points || 0,
          consecutiveDays: userPoints?.current_streak || 0,
          workoutsThisWeek: weeklyCount.get(profile.id) || 0,
          workoutsThisMonth: monthlyCount.get(profile.id) || 0,
          totalWorkouts: totalCount.get(profile.id) || 0,
          lastWorkoutDate: lastWorkoutMap.get(profile.id),
          isOnline: false, // TODO: implementar presence real
        };
      });

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
