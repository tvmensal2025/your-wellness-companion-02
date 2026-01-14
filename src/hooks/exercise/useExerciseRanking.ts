// ============================================
// 🏆 USE EXERCISE RANKING HOOK
// Busca dados reais de ranking, grupos e parceiros
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';

// ============================================
// TYPES
// ============================================

export interface RankingUser {
  id: string;
  name: string;
  avatarUrl?: string;
  points: number;
  consecutiveDays?: number;
  workoutsThisWeek?: number;
  isCurrentUser?: boolean;
  position: number;
}

export interface GroupInfo {
  id: string;
  name: string;
  memberCount: number;
  description?: string;
  createdAt?: string;
}

export interface BuddyInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  points: number;
  consecutiveDays?: number;
  isOnline?: boolean;
  workoutsThisWeek?: number;
  workoutsThisMonth?: number;
  totalWorkouts?: number;
  lastWorkoutDate?: string;
}

export interface BuddyRanking {
  user: RankingUser;
  buddy: RankingUser;
}

// ============================================
// MAIN HOOK
// ============================================

export function useExerciseRanking(userId?: string) {
  const queryClient = useQueryClient();
  const enabled = !!userId;

  // Buscar ranking geral de treino
  const { data: generalRanking, isLoading: loadingGeneral } = useQuery({
    queryKey: ['exercise-ranking', 'general', userId],
    queryFn: async (): Promise<RankingUser[]> => {
      if (!userId) return [];

      // Buscar pontos de exercício com perfis
      const { data: pointsData, error } = await (fromTable('exercise_gamification_points') as any)
        .select(`
          user_id,
          weekly_points,
          total_points,
          current_streak,
          profiles:user_id(full_name, avatar_url)
        `)
        .order('weekly_points', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar ranking:', error);
        return [];
      }

      // Buscar treinos da semana para cada usuário
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      return (pointsData || []).map((entry, index) => ({
        id: entry.user_id,
        name: (entry.profiles as any)?.full_name || 'Usuário',
        avatarUrl: (entry.profiles as any)?.avatar_url,
        points: entry.weekly_points || 0,
        consecutiveDays: entry.current_streak || 0,
        workoutsThisWeek: Math.floor((entry.weekly_points || 0) / 100), // Estimativa
        isCurrentUser: entry.user_id === userId,
        position: index + 1,
      }));
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Buscar posição e pontos do usuário atual
  const { data: userStats } = useQuery({
    queryKey: ['exercise-ranking', 'user-stats', userId],
    queryFn: async () => {
      if (!userId) return { position: 0, points: 0 };

      const { data: myPoints } = await (fromTable('exercise_gamification_points') as any)
        .select('weekly_points, total_points, current_streak')
        .eq('user_id', userId)
        .maybeSingle();

      if (!myPoints) return { position: 0, points: 0, consecutiveDays: 0 };

      // Contar posição
      const { count } = await (fromTable('exercise_gamification_points') as any)
        .select('*', { count: 'exact', head: true })
        .gt('weekly_points', myPoints.weekly_points || 0);

      return {
        position: (count || 0) + 1,
        points: myPoints.weekly_points || 0,
        totalPoints: myPoints.total_points || 0,
        consecutiveDays: myPoints.current_streak || 0,
      };
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  // Buscar grupo do usuário (usando challenge_participations como proxy)
  const { data: groupData, isLoading: loadingGroup } = useQuery({
    queryKey: ['exercise-ranking', 'group', userId],
    queryFn: async (): Promise<{ group: GroupInfo | null; ranking: RankingUser[] }> => {
      if (!userId) return { group: null, ranking: [] };

      // Buscar desafios em grupo que o usuário participa
      const { data: participations } = await supabase
        .from('challenge_participations')
        .select(`
          challenge_id,
          challenges:challenge_id(
            id,
            title,
            challenge_type
          )
        `)
        .eq('user_id', userId)
        .eq('is_completed', false)
        .limit(1);

      if (!participations || participations.length === 0) {
        return { group: null, ranking: [] };
      }

      const challengeId = participations[0].challenge_id;
      const challenge = participations[0].challenges as any;

      // Buscar outros participantes do mesmo desafio
      const { data: members } = await supabase
        .from('challenge_participations')
        .select(`
          user_id,
          progress,
          points_earned,
          profiles:user_id(full_name, avatar_url)
        `)
        .eq('challenge_id', challengeId)
        .order('points_earned', { ascending: false })
        .limit(10);

      const groupRanking: RankingUser[] = (members || []).map((m, idx) => ({
        id: m.user_id,
        name: (m.profiles as any)?.full_name || 'Usuário',
        avatarUrl: (m.profiles as any)?.avatar_url,
        points: m.points_earned || 0,
        isCurrentUser: m.user_id === userId,
        position: idx + 1,
      }));

      return {
        group: {
          id: challengeId,
          name: challenge?.title || 'Grupo de Treino',
          memberCount: members?.length || 0,
        },
        ranking: groupRanking,
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Buscar parceiro de treino (usando connections ou amigos)
  const { data: buddyData, isLoading: loadingBuddy } = useQuery({
    queryKey: ['exercise-ranking', 'buddy', userId],
    queryFn: async (): Promise<{ buddy: BuddyInfo | null; ranking: BuddyRanking | null }> => {
      if (!userId) return { buddy: null, ranking: null };

      // Buscar conexões/amigos do usuário
      const { data: connections } = await (fromTable('user_connections') as any)
        .select(`
          connected_user_id,
          status,
          profiles:connected_user_id(full_name, avatar_url)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .limit(1);

      if (!connections || connections.length === 0) {
        // Tentar buscar na direção inversa
        const { data: reverseConnections } = await (fromTable('user_connections') as any)
          .select(`
            user_id,
            status,
            profiles:user_id(full_name, avatar_url)
          `)
          .eq('connected_user_id', userId)
          .eq('status', 'accepted')
          .limit(1);

        if (!reverseConnections || reverseConnections.length === 0) {
          return { buddy: null, ranking: null };
        }

        const buddyId = (reverseConnections[0] as any).user_id;
        return await fetchBuddyData(userId, buddyId, (reverseConnections[0] as any).profiles);
      }

      const buddyId = (connections[0] as any).connected_user_id;
      return await fetchBuddyData(userId, buddyId, (connections[0] as any).profiles);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    // Ranking geral
    generalRanking: generalRanking || [],
    userPosition: userStats?.position || 0,
    userPoints: userStats?.points || 0,
    userConsecutiveDays: userStats?.consecutiveDays || 0,
    
    // Grupo
    currentGroup: groupData?.group || null,
    groupRanking: groupData?.ranking || [],
    
    // Parceiro
    currentBuddy: buddyData?.buddy || null,
    buddyRanking: buddyData?.ranking || null,
    
    // Loading states
    isLoading: loadingGeneral || loadingGroup || loadingBuddy,
    
    // Refresh
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-ranking'] });
    },
  };
}

// Helper para buscar dados do parceiro
async function fetchBuddyData(
  userId: string,
  buddyId: string,
  buddyProfile: any
): Promise<{ buddy: BuddyInfo | null; ranking: BuddyRanking | null }> {
  // Buscar pontos do parceiro
  const { data: buddyPoints } = await (fromTable('exercise_gamification_points') as any)
    .select('weekly_points, total_points, current_streak')
    .eq('user_id', buddyId)
    .maybeSingle();

  // Buscar pontos do usuário
  const { data: userPoints } = await (fromTable('exercise_gamification_points') as any)
    .select('weekly_points, total_points, current_streak')
    .eq('user_id', userId)
    .maybeSingle();

  // Buscar perfil do usuário
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  // Buscar treinos do parceiro
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const { count: buddyWorkoutsWeek } = await supabase
    .from('sport_workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', buddyId)
    .gte('completed_at', startOfWeek.toISOString());

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  
  const { count: buddyWorkoutsMonth } = await supabase
    .from('sport_workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', buddyId)
    .gte('completed_at', startOfMonth.toISOString());

  const { count: buddyTotalWorkouts } = await supabase
    .from('sport_workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', buddyId);

  const buddy: BuddyInfo = {
    id: buddyId,
    name: buddyProfile?.full_name || 'Parceiro',
    avatarUrl: buddyProfile?.avatar_url,
    points: buddyPoints?.weekly_points || 0,
    consecutiveDays: buddyPoints?.current_streak || 0,
    isOnline: Math.random() > 0.5, // Simulado - idealmente usar presence
    workoutsThisWeek: buddyWorkoutsWeek || 0,
    workoutsThisMonth: buddyWorkoutsMonth || 0,
    totalWorkouts: buddyTotalWorkouts || 0,
  };

  const userRankingPoints = userPoints?.weekly_points || 0;
  const buddyRankingPoints = buddyPoints?.weekly_points || 0;

  const ranking: BuddyRanking = {
    user: {
      id: userId,
      name: userProfile?.full_name || 'Você',
      avatarUrl: userProfile?.avatar_url,
      points: userRankingPoints,
      consecutiveDays: userPoints?.current_streak || 0,
      isCurrentUser: true,
      position: userRankingPoints >= buddyRankingPoints ? 1 : 2,
    },
    buddy: {
      id: buddyId,
      name: buddyProfile?.full_name || 'Parceiro',
      avatarUrl: buddyProfile?.avatar_url,
      points: buddyRankingPoints,
      consecutiveDays: buddyPoints?.current_streak || 0,
      position: buddyRankingPoints > userRankingPoints ? 1 : 2,
    },
  };

  return { buddy, ranking };
}

export default useExerciseRanking;
