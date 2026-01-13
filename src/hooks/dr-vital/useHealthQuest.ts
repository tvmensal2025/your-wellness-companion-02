// =====================================================
// USE HEALTH QUEST HOOK
// =====================================================
// Hook para gerenciar o sistema de gamificação
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  generateDailyMissions,
  completeMission,
  updateMissionProgress,
  getActiveMissions,
  getCompletedMissions,
  getOrCreateStreak,
  checkDailyCompletion,
  buildHealthLevel,
} from '@/services/dr-vital/gamificationService';
import { getAllAchievements } from '@/services/dr-vital/achievementService';
import type { HealthMission, HealthStreak, HealthLevel, Achievement } from '@/types/dr-vital-revolution';
import { useCallback, useMemo } from 'react';

// =====================================================
// QUERY KEYS
// =====================================================

export const healthQuestKeys = {
  all: ['health-quest'] as const,
  missions: (userId: string) => [...healthQuestKeys.all, 'missions', userId] as const,
  activeMissions: (userId: string) => [...healthQuestKeys.missions(userId), 'active'] as const,
  completedMissions: (userId: string) => [...healthQuestKeys.missions(userId), 'completed'] as const,
  streak: (userId: string) => [...healthQuestKeys.all, 'streak', userId] as const,
  dailyStatus: (userId: string) => [...healthQuestKeys.all, 'daily-status', userId] as const,
};

// =====================================================
// MAIN HOOK
// =====================================================

export function useHealthQuest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const enabled = !!userId;

  // Query: Active Missions
  const {
    data: activeMissions,
    isLoading: isLoadingMissions,
    error: missionsError,
    refetch: refetchMissions,
  } = useQuery({
    queryKey: healthQuestKeys.activeMissions(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      // Generate daily missions if needed, then get all active
      await generateDailyMissions(userId);
      return getActiveMissions(userId);
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Query: Streak Data
  const {
    data: streak,
    isLoading: isLoadingStreak,
    error: streakError,
  } = useQuery({
    queryKey: healthQuestKeys.streak(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      return getOrCreateStreak(userId);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Query: Daily Completion Status
  const {
    data: isDailyComplete,
  } = useQuery({
    queryKey: healthQuestKeys.dailyStatus(userId || ''),
    queryFn: async () => {
      if (!userId) return false;
      return checkDailyCompletion(userId);
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Query: Achievements
  const {
    data: achievements,
    isLoading: isLoadingAchievements,
  } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      if (!userId) return [];
      return getAllAchievements(userId);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation: Complete Mission
  const completeMissionMutation = useMutation({
    mutationFn: async (missionId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return completeMission(userId, missionId);
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: healthQuestKeys.missions(userId || '') });
      queryClient.invalidateQueries({ queryKey: healthQuestKeys.streak(userId || '') });
      queryClient.invalidateQueries({ queryKey: healthQuestKeys.dailyStatus(userId || '') });
      
      // If level up, could trigger celebration
      if (result.levelUp) {
        // Could dispatch event or update state for celebration animation
        console.log('[HealthQuest] Level up!');
      }
    },
  });

  // Mutation: Update Mission Progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ missionId, progress }: { missionId: string; progress: number }) => {
      if (!userId) throw new Error('User not authenticated');
      return updateMissionProgress(userId, missionId, progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthQuestKeys.activeMissions(userId || '') });
    },
  });

  // Derived: Health Level
  const healthLevel: HealthLevel | null = useMemo(() => {
    if (!streak) return null;
    return buildHealthLevel(streak.totalXpEarned);
  }, [streak]);

  // Derived: Daily missions only
  const dailyMissions = useMemo(() => {
    return activeMissions?.filter(m => m.type === 'daily') || [];
  }, [activeMissions]);

  // Derived: Boss battles
  const bossBattles = useMemo(() => {
    return activeMissions?.filter(m => m.type === 'boss_battle') || [];
  }, [activeMissions]);

  // Derived: Weekly missions
  const weeklyMissions = useMemo(() => {
    return activeMissions?.filter(m => m.type === 'weekly') || [];
  }, [activeMissions]);

  // Derived: Progress stats
  const stats = useMemo(() => {
    if (!activeMissions) return null;
    
    const daily = activeMissions.filter(m => m.type === 'daily');
    const completedDaily = daily.filter(m => m.isCompleted);
    
    return {
      totalMissions: activeMissions.length,
      completedMissions: activeMissions.filter(m => m.isCompleted).length,
      dailyProgress: daily.length > 0 
        ? Math.round((completedDaily.length / daily.length) * 100)
        : 0,
      totalXpAvailable: activeMissions
        .filter(m => !m.isCompleted)
        .reduce((sum, m) => sum + m.xpReward, 0),
    };
  }, [activeMissions]);

  return {
    // Data
    activeMissions: activeMissions || [],
    dailyMissions,
    bossBattles,
    weeklyMissions,
    streak,
    healthLevel,
    isDailyComplete: isDailyComplete || false,
    stats,
    achievements: achievements || [],
    
    // Loading states
    isLoading: isLoadingMissions || isLoadingStreak || isLoadingAchievements,
    isLoadingMissions,
    isLoadingStreak,
    isLoadingAchievements,
    isCompletingMission: completeMissionMutation.isPending,
    isUpdatingProgress: updateProgressMutation.isPending,
    
    // Error states
    error: missionsError || streakError,
    completeMissionError: completeMissionMutation.error,
    
    // Actions
    completeMission: completeMissionMutation.mutate,
    completeMissionAsync: completeMissionMutation.mutateAsync,
    updateProgress: updateProgressMutation.mutate,
    refetch: refetchMissions,
  };
}

// =====================================================
// COMPLETED MISSIONS HOOK
// =====================================================

export function useCompletedMissions(limit: number = 20) {
  const { user } = useAuth();
  const userId = user?.id;
  const enabled = !!userId;

  const {
    data: completedMissions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: healthQuestKeys.completedMissions(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      return getCompletedMissions(userId, limit);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Stats
  const stats = useMemo(() => {
    if (!completedMissions || completedMissions.length === 0) return null;
    
    const totalXp = completedMissions.reduce((sum, m) => sum + m.xpReward, 0);
    const byType = completedMissions.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalCompleted: completedMissions.length,
      totalXpEarned: totalXp,
      byType,
    };
  }, [completedMissions]);

  return {
    completedMissions: completedMissions || [],
    stats,
    isLoading,
    error,
    refetch,
  };
}

// =====================================================
// STREAK HOOK
// =====================================================

export function useHealthStreak() {
  const { user } = useAuth();
  const userId = user?.id;
  const enabled = !!userId;

  const {
    data: streak,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: healthQuestKeys.streak(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      return getOrCreateStreak(userId);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Derived values
  const isOnStreak = (streak?.currentStreak || 0) > 0;
  const hasStreakBonus = (streak?.currentStreak || 0) >= 7;
  const streakBonusXp = hasStreakBonus ? (streak?.currentStreak || 0) * 10 : 0;
  const daysUntilBonus = hasStreakBonus ? 0 : 7 - (streak?.currentStreak || 0);

  return {
    streak,
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    isOnStreak,
    hasStreakBonus,
    streakBonusXp,
    daysUntilBonus,
    isLoading,
    error,
    refetch,
  };
}

// =====================================================
// LEVEL HOOK
// =====================================================

export function useHealthLevel() {
  const { streak } = useHealthStreak();
  
  const healthLevel = useMemo(() => {
    if (!streak) return null;
    return buildHealthLevel(streak.totalXpEarned);
  }, [streak]);

  return {
    level: healthLevel?.level || 1,
    title: healthLevel?.title || 'Iniciante',
    currentXp: healthLevel?.currentXp || 0,
    xpToNextLevel: healthLevel?.xpToNextLevel || 100,
    progressPercentage: healthLevel?.progressPercentage || 0,
    unlockedFeatures: healthLevel?.unlockedFeatures || ['Missões Diárias'],
    healthLevel,
  };
}

export default useHealthQuest;
