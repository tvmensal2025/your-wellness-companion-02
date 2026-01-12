import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProgressStats {
  // Weight
  initialWeight: number | null;
  currentWeight: number | null;
  targetWeight: number | null;
  weightChange: number | null;
  weightProgress: number;
  showWeightResults: boolean;
  
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
  level: number;
  
  // Activity
  totalMealsLogged: number;
  totalWorkouts: number;
  daysActive: number;
  lastActivityDate: string | null;
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
        // Fetch profile data including privacy setting and current weight
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_weight, target_weight, show_weight_results')
          .eq('user_id', userId)
          .maybeSingle();

        // Fetch initial weight (first measurement)
        const { data: initialWeightData } = await supabase
          .from('weight_measurements')
          .select('peso_kg')
          .eq('user_id', userId)
          .order('measurement_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        // Fetch current weight (latest measurement)
        const { data: currentWeightData } = await supabase
          .from('weight_measurements')
          .select('peso_kg')
          .eq('user_id', userId)
          .order('measurement_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch user points
        const { data: userPoints } = await supabase
          .from('user_points')
          .select('total_points, current_streak, best_streak, completed_challenges, level, last_activity_date, missions_completed')
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

        // Fetch total meals logged (food_analysis)
        const { count: totalMealsLogged } = await supabase
          .from('food_analysis')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Fetch total workouts
        const { count: totalWorkouts } = await supabase
          .from('workout_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Fetch days active (unique days with activity)
        const { count: daysActive } = await supabase
          .from('advanced_daily_tracking')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Calculate weights - prefer measurements, fallback to profile
        const initialWeight = initialWeightData?.peso_kg || profile?.current_weight || null;
        const currentWeight = currentWeightData?.peso_kg || profile?.current_weight || null;
        const targetWeight = profile?.target_weight || null;
        
        // Calculate weight change (negative = lost weight)
        let weightChange: number | null = null;
        let weightProgress = 0;
        
        if (initialWeight && currentWeight) {
          weightChange = currentWeight - initialWeight;
        }
        
        if (initialWeight && targetWeight && currentWeight) {
          const totalToLose = initialWeight - targetWeight;
          const lost = initialWeight - currentWeight;
          weightProgress = totalToLose > 0 ? Math.min(100, Math.round((lost / totalToLose) * 100)) : 0;
        }

        setStats({
          initialWeight,
          currentWeight,
          targetWeight,
          weightChange,
          weightProgress,
          showWeightResults: profile?.show_weight_results ?? true,
          challengesCompleted: userPoints?.completed_challenges || completedChallengesCount || 0,
          activeChallenges: activeChallenges || 0,
          currentStreak: userPoints?.current_streak || 0,
          bestStreak: userPoints?.best_streak || 0,
          followersCount: followersCount || 0,
          followingCount: followingCount || 0,
          totalPoints: userPoints?.total_points || 0,
          rankingPosition: 0,
          level: userPoints?.level || 1,
          totalMealsLogged: totalMealsLogged || 0,
          totalWorkouts: totalWorkouts || 0,
          daysActive: daysActive || 0,
          lastActivityDate: userPoints?.last_activity_date || null,
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
