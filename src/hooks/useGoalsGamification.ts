import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// goal_achievements table was removed - using user_achievements_v2 as alternative
export const useGoalsGamification = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar nível do usuário
  const { data: userLevel, isLoading: levelLoading } = useQuery({
    queryKey: ['user-goal-level', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Buscar conquistas from user_achievements_v2
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['goal-achievements', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_achievements_v2')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('Error fetching achievements:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!userId,
  });

  // Buscar streaks
  const { data: streaks, isLoading: streaksLoading } = useQuery({
    queryKey: ['goal-streaks', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('goal_streaks')
        .select('*')
        .eq('user_id', userId)
        .order('current_streak', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error fetching streaks:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!userId,
  });

  // Processar ganho de XP
  const processXPGain = useMutation({
    mutationFn: async ({ xpAmount }: { xpAmount: number }) => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase.rpc('process_level_up', {
        p_user_id: userId,
        p_xp_gained: xpAmount,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-goal-level', userId] });
      
      const result = Array.isArray(data) ? data[0] : data;
      if (result && result.leveled_up) {
        toast({
          title: "🎉 Level Up!",
          description: `Você alcançou o nível ${result.new_level}! Título: ${result.new_title}`,
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      console.error('Error processing XP:', error);
    },
  });

  // Desbloquear conquista using user_achievements_v2
  const unlockAchievement = useMutation({
    mutationFn: async ({ 
      achievementType, 
      achievementName, 
      achievementDescription,
      icon,
    }: { 
      achievementType: string;
      achievementName: string;
      achievementDescription?: string;
      icon?: string;
      rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    }) => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('user_achievements_v2')
        .upsert([{
          user_id: userId,
          achievement_type: achievementType,
          achievement_name: achievementName,
          badge_icon: icon,
        }], {
          onConflict: 'user_id,achievement_type',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-achievements', userId] });
      toast({
        title: "🏆 Conquista Desbloqueada!",
        description: "Você ganhou uma nova conquista!",
      });
    },
  });

  return {
    userLevel,
    achievements: achievements || [],
    streaks: streaks || [],
    isLoading: levelLoading || achievementsLoading || streaksLoading,
    processXPGain,
    unlockAchievement,
  };
};

export default useGoalsGamification;
