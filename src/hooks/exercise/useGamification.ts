// ============================================
// 🎮 GAMIFICATION HOOK
// Hook para sistema de pontos e conquistas
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createGamificationService } from '@/services/exercise/gamificationService';

export function useGamification(userId: string | undefined) {
  const queryClient = useQueryClient();
  const enabled = !!userId;

  // Estatísticas do usuário
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['gamification-stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      const service = createGamificationService(userId);
      return service.getMyStats();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Streak atual
  const { data: streak, isLoading: isLoadingStreak } = useQuery({
    queryKey: ['gamification-streak', userId],
    queryFn: async () => {
      if (!userId) return null;
      const service = createGamificationService(userId);
      return service.getStreak();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Conquistas do usuário
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['gamification-achievements', userId],
    queryFn: async () => {
      if (!userId) return [];
      const service = createGamificationService(userId);
      return service.getAchievements();
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  // Todas as conquistas disponíveis
  const { data: allAchievements } = useQuery({
    queryKey: ['gamification-all-achievements'],
    queryFn: async () => {
      if (!userId) return [];
      const service = createGamificationService(userId);
      return service.getAllAchievements();
    },
    enabled,
    staleTime: 30 * 60 * 1000,
  });

  // Desafios ativos
  const { data: activeChallenges } = useQuery({
    queryKey: ['gamification-challenges', userId],
    queryFn: async () => {
      if (!userId) return [];
      const service = createGamificationService(userId);
      return service.getActiveChallenges();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Meus desafios
  const { data: myChallenges } = useQuery({
    queryKey: ['gamification-my-challenges', userId],
    queryFn: async () => {
      if (!userId) return [];
      const service = createGamificationService(userId);
      return service.getMyChallenges();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Leaderboard
  const useLeaderboard = (type: 'weekly' | 'monthly' | 'all_time' = 'weekly') => {
    return useQuery({
      queryKey: ['gamification-leaderboard', type],
      queryFn: async () => {
        if (!userId) return [];
        const service = createGamificationService(userId);
        return service.getLeaderboard(type);
      },
      enabled,
      staleTime: 2 * 60 * 1000,
    });
  };

  // Meu ranking
  const { data: myRank } = useQuery({
    queryKey: ['gamification-my-rank', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const service = createGamificationService(userId);
      return service.getMyRank();
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  // Dar pontos por treino
  const awardPoints = useMutation({
    mutationFn: async ({
      durationMinutes,
      exercisesCompleted,
      avgDifficulty,
      isPersonalRecord,
    }: {
      durationMinutes: number;
      exercisesCompleted: number;
      avgDifficulty: number;
      isPersonalRecord?: boolean;
    }) => {
      if (!userId) throw new Error('User ID required');
      const service = createGamificationService(userId);
      return service.awardWorkoutPoints(
        durationMinutes,
        exercisesCompleted,
        avgDifficulty,
        isPersonalRecord
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['gamification-streak', userId] });
      queryClient.invalidateQueries({ queryKey: ['gamification-achievements', userId] });
    },
  });

  // Participar de desafio
  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!userId) throw new Error('User ID required');
      const service = createGamificationService(userId);
      return service.joinChallenge(challengeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-my-challenges', userId] });
    },
  });

  // Usar freeze de streak
  const useStreakFreeze = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID required');
      const service = createGamificationService(userId);
      return service.useStreakFreeze();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-streak', userId] });
    },
  });

  return {
    stats,
    streak,
    achievements,
    allAchievements,
    activeChallenges,
    myChallenges,
    myRank,
    useLeaderboard,
    awardPoints,
    joinChallenge,
    useStreakFreeze,
    isLoading: isLoadingStats || isLoadingStreak || isLoadingAchievements,
  };
}

export default useGamification;
