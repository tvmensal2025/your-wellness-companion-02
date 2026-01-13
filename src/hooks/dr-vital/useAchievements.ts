// =====================================================
// USE ACHIEVEMENTS HOOK
// =====================================================
// Hook para gerenciar conquistas do usuário
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import {
  getUserAchievements,
  checkAndUnlockAchievements,
  getAvailableAchievements,
} from '@/services/dr-vital/achievementService';
import type { Achievement, AchievementCategory } from '@/types/dr-vital-revolution';

// =====================================================
// QUERY KEYS
// =====================================================

export const achievementKeys = {
  all: ['achievements'] as const,
  user: (userId: string) => [...achievementKeys.all, 'user', userId] as const,
  available: () => [...achievementKeys.all, 'available'] as const,
};

// =====================================================
// MAIN HOOK
// =====================================================

export function useAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const enabled = !!userId;

  // Query: User Achievements
  const {
    data: userAchievements,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: achievementKeys.user(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      return getUserAchievements(userId);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Query: Available Achievements
  const {
    data: availableAchievements,
    isLoading: isLoadingAvailable,
  } = useQuery({
    queryKey: achievementKeys.available(),
    queryFn: getAvailableAchievements,
    staleTime: 60 * 60 * 1000, // 1 hour - these don't change often
  });

  // Mutation: Check and Unlock
  const checkMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return checkAndUnlockAchievements(userId);
    },
    onSuccess: (newlyUnlocked) => {
      if (newlyUnlocked.length > 0) {
        queryClient.invalidateQueries({ queryKey: achievementKeys.user(userId || '') });
      }
    },
  });

  // Merge available with user's unlocked status
  const achievements: Achievement[] = useMemo(() => {
    if (!availableAchievements) return [];
    
    const unlockedMap = new Map(
      (userAchievements || []).map(a => [a.achievementKey, a])
    );

    return availableAchievements.map(available => {
      const unlocked = unlockedMap.get(available.achievementKey);
      return {
        ...available,
        isUnlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt,
      };
    });
  }, [availableAchievements, userAchievements]);

  // Derived: By category
  const byCategory = useMemo(() => {
    const grouped: Record<AchievementCategory, Achievement[]> = {
      nutrition: [],
      exercise: [],
      consistency: [],
      milestones: [],
    };

    for (const achievement of achievements) {
      if (grouped[achievement.category]) {
        grouped[achievement.category].push(achievement);
      }
    }

    return grouped;
  }, [achievements]);

  // Derived: Stats
  const stats = useMemo(() => {
    const unlocked = achievements.filter(a => a.isUnlocked);
    return {
      total: achievements.length,
      unlocked: unlocked.length,
      locked: achievements.length - unlocked.length,
      percentage: achievements.length > 0 
        ? Math.round((unlocked.length / achievements.length) * 100)
        : 0,
      byCategory: {
        nutrition: byCategory.nutrition.filter(a => a.isUnlocked).length,
        exercise: byCategory.exercise.filter(a => a.isUnlocked).length,
        consistency: byCategory.consistency.filter(a => a.isUnlocked).length,
        milestones: byCategory.milestones.filter(a => a.isUnlocked).length,
      },
    };
  }, [achievements, byCategory]);

  // Recent unlocks
  const recentUnlocks = useMemo(() => {
    return achievements
      .filter(a => a.isUnlocked && a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, 5);
  }, [achievements]);

  return {
    // Data
    achievements,
    byCategory,
    stats,
    recentUnlocks,
    
    // Loading states
    isLoading: isLoadingUser || isLoadingAvailable,
    isChecking: checkMutation.isPending,
    
    // Error states
    error: userError,
    
    // Actions
    checkForNewAchievements: checkMutation.mutate,
    refetch: refetchUser,
  };
}

export default useAchievements;
