import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGoalsGamification = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar nível do usuário
  const { data: userLevel, isLoading: levelLoading } = useQuery({
    queryKey: ['user-goal-level', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_goal_levels')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Se não existe registro ou houve erro, retornar dados padrão
      if (error || !data) {
        if (error) {
          console.warn('Erro ao buscar user_goal_levels:', error.message);
        }
        return {
          id: 'temp',
          user_id: userId,
          current_level: 1,
          current_xp: 0,
          total_xp: 0,
          xp_to_next_level: 100,
          level_title: 'Iniciante',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return data;
    },
    enabled: !!userId,
  });

  // Buscar conquistas
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['goal-achievements', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('goal_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })
        .limit(100);

      // Se a tabela não existe, retornar array vazio
      if (error && (error.message?.includes('406') || error.message?.includes('Not Acceptable'))) {
        console.warn('Tabela goal_achievements não existe. Execute a migração.');
        return [];
      }
      if (error) throw error;
      return data;
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

      // Se a tabela não existe, retornar array vazio
      if (error && (error.message?.includes('406') || error.message?.includes('Not Acceptable'))) {
        console.warn('Tabela goal_streaks não existe. Execute a migração.');
        return [];
      }
      if (error) throw error;
      return data;
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
      
      // data pode ser um array ou objeto único, tratamos ambos os casos
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
      toast({
        title: "Erro ao processar XP",
        description: "Não foi possível atualizar seu nível.",
        variant: "destructive",
      });
    },
  });

  // Desbloquear conquista
  const unlockAchievement = useMutation({
    mutationFn: async ({ 
      achievementType, 
      achievementName, 
      achievementDescription,
      icon,
      rarity = 'common'
    }: { 
      achievementType: string;
      achievementName: string;
      achievementDescription?: string;
      icon?: string;
      rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    }) => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('goal_achievements')
        .upsert([{
          user_id: userId,
          achievement_type: achievementType,
          achievement_name: achievementName,
          achievement_description: achievementDescription,
          icon,
          rarity,
          progress: 1,
          total_required: 1,
        }], {
          onConflict: 'user_id,achievement_type',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goal-achievements', userId] });
      
      const rarityEmoji = {
        common: '🥉',
        rare: '🥈',
        epic: '🥇',
        legendary: '👑'
      };

      toast({
        title: `${rarityEmoji[data.rarity as keyof typeof rarityEmoji]} Conquista Desbloqueada!`,
        description: data.achievement_name,
        duration: 5000,
      });
    },
  });

  // Atualizar streak
  const updateStreak = useMutation({
    mutationFn: async ({ goalId, streakType = 'daily' }: { goalId: string; streakType?: 'daily' | 'weekly' | 'monthly' }) => {
      if (!userId) throw new Error('User ID required');

      // Buscar streak atual (maybeSingle para evitar 406 quando não há linha)
      const { data: existingStreak } = await supabase
        .from('goal_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_id', goalId)
        .eq('streak_type', streakType)
        .maybeSingle();

      const today = new Date().toISOString().split('T')[0];
      const lastUpdate = existingStreak?.last_update_date;
      
      let newStreak = 1;
      let longestStreak = existingStreak?.longest_streak || 1;

      if (lastUpdate) {
        const lastDate = new Date(lastUpdate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Mesmo dia, não incrementa
          return existingStreak;
        } else if (diffDays === 1) {
          // Dia consecutivo, incrementa
          newStreak = (existingStreak?.current_streak || 0) + 1;
        } else {
          // Quebrou o streak, reinicia
          newStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, newStreak);

      const { data, error } = await supabase
        .from('goal_streaks')
        .upsert([{
          user_id: userId,
          goal_id: goalId,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_update_date: today,
          streak_type: streakType,
        }], {
          onConflict: 'user_id,goal_id,streak_type',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goal-streaks', userId] });
      
      if (data.current_streak >= 7) {
        toast({
          title: `🔥 Streak de ${data.current_streak} dias!`,
          description: "Continue assim! Você está no caminho certo.",
        });
      }
    },
  });

  return {
    // Data
    userLevel,
    achievements,
    streaks,
    
    // Loading states
    isLoading: levelLoading || achievementsLoading || streaksLoading,
    
    // Mutations
    processXPGain: processXPGain.mutate,
    unlockAchievement: unlockAchievement.mutate,
    updateStreak: updateStreak.mutate,
    
    // Mutation states
    isProcessingXP: processXPGain.isPending,
    isUnlockingAchievement: unlockAchievement.isPending,
    isUpdatingStreak: updateStreak.isPending,
  };
};
