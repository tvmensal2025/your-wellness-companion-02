import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProgressStats {
  // Weight
  currentWeight: number | null;
  targetWeight: number | null;
  weightLoss: number | null;
  weightProgress: number;
  
  // Challenges
  challengesCompleted: number;
  activeChallenges: number;
  
  // Streaks
  currentStreak: number;
  bestStreak: number;
  
  // Social
  followersCount: number;
  followingCount: number;
  
  // Points
  totalPoints: number;
  rankingPosition: number;
}

export function useUserProgressStats(userId: string | null) {
  const [stats, setStats] = useState<UserProgressStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_weight, target_weight')
          .eq('user_id', userId)
          .maybeSingle();

        // Fetch user points
        const { data: userPoints } = await supabase
          .from('user_points')
          .select('total_points, current_streak, best_streak, completed_challenges')
          .eq('user_id', userId)
          .maybeSingle();

        // Fetch followers count
        const { count: followersCount } = await supabase
          .from('health_feed_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId);

        // Fetch following count
        const { count: followingCount } = await supabase
          .from('health_feed_follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId);

        // Fetch active challenges
        const { count: activeChallenges } = await supabase
          .from('challenge_participations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_completed', false);

        // Fetch completed challenges count
        const { count: completedChallengesCount } = await supabase
          .from('challenge_participations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_completed', true);

        // Calculate weight progress
        const currentWeight = profile?.current_weight || null;
        const targetWeight = profile?.target_weight || null;
        
        // Assume initial weight is 10% more than current as estimate if not available
        const estimatedInitialWeight = currentWeight ? currentWeight * 1.1 : null;
        
        let weightLoss: number | null = null;
        let weightProgress = 0;
        
        if (estimatedInitialWeight && currentWeight) {
          weightLoss = estimatedInitialWeight - currentWeight;
        }
        
        if (estimatedInitialWeight && targetWeight && currentWeight) {
          const totalToLose = estimatedInitialWeight - targetWeight;
          const lost = estimatedInitialWeight - currentWeight;
          weightProgress = totalToLose > 0 ? Math.min(100, Math.round((lost / totalToLose) * 100)) : 0;
        }

        setStats({
          currentWeight,
          targetWeight,
          weightLoss,
          weightProgress,
          challengesCompleted: userPoints?.completed_challenges || completedChallengesCount || 0,
          activeChallenges: activeChallenges || 0,
          currentStreak: userPoints?.current_streak || 0,
          bestStreak: userPoints?.best_streak || 0,
          followersCount: followersCount || 0,
          followingCount: followingCount || 0,
          totalPoints: userPoints?.total_points || 0,
          rankingPosition: 0,
        });
      } catch (error) {
        console.error('Error fetching user progress stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading };
}
