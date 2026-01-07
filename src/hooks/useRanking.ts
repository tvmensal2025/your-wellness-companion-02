import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface RankingUser {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  total_points: number;
  streak_days: number;
  missions_completed: number;
  completed_challenges: number;
  level: number;
  last_activity: string | null;
  position: number;
}

const fetchRankingData = async (): Promise<RankingUser[]> => {
  // Buscar dados unificados de user_points com profiles
  const { data, error } = await supabase
    .from('user_points')
    .select(`
      user_id,
      total_points,
      current_streak,
      best_streak,
      missions_completed,
      completed_challenges,
      level,
      last_activity_date,
      profiles!inner(full_name, avatar_url)
    `)
    .order('total_points', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Erro ao buscar ranking:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Mapear para formato do ranking
  const rankingUsers: RankingUser[] = data
    .filter((item: any) => item.profiles?.full_name)
    .map((item: any, index: number) => ({
      user_id: item.user_id,
      user_name: item.profiles?.full_name || 'Usuário',
      avatar_url: item.profiles?.avatar_url,
      total_points: item.total_points || 0,
      streak_days: item.current_streak || 0,
      missions_completed: item.missions_completed || 0,
      completed_challenges: item.completed_challenges || 0,
      level: item.level || 1,
      last_activity: item.last_activity_date,
      position: index + 1
    }));

  return rankingUsers;
};

export const useRanking = () => {
  const { data: ranking = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['ranking'],
    queryFn: fetchRankingData,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  return {
    ranking,
    loading,
    error: error?.message || null,
    refetch
  };
};
