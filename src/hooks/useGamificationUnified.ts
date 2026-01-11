import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook unificado de gamificação
 * Substitui: useGamification, useEnhancedGamification, useRealGamification
 * 
 * Melhorias:
 * - Single roundtrip com Promise.all
 * - Cache otimizado com staleTime
 * - enabled para evitar queries desnecessárias
 * - Optimistic updates
 */

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  difficulty: string;
  target_value: number;
  xp_reward: number;
  category: string;
  progress: number;
  is_completed: boolean;
  expires_at: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tier: string;
  requirement?: string;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface GamificationData {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  badges: Badge[];
  dailyChallenges: DailyChallenge[];
  achievements: number;
  rank: string;
  lastActivityDate: string;
}

export const useGamificationUnified = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Validar parâmetro
  const enabled = !!userId;

  const { data: gamificationData, isLoading, refetch } = useQuery({
    queryKey: ['gamification-unified', userId],
    queryFn: async (): Promise<GamificationData | null> => {
      if (!userId) return null;

      // ✅ SINGLE ROUNDTRIP - Buscar tudo em paralelo
      const [
        { data: challenges, error: challengesError },
        { data: participations, error: participationsError },
        { data: userGoals, error: goalsError },
        { data: recentActivities, error: activitiesError }
      ] = await Promise.all([
        supabase
          .from('challenges')
          .select('*')
          .eq('is_active', true),
        supabase
          .from('challenge_participations')
          .select('*')
          .eq('user_id', userId),
        supabase
          .from('user_goals')
          .select('estimated_points')
          .eq('user_id', userId)
          .eq('status', 'concluida'),
        supabase
          .from('goal_updates')
          .select('created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(30),
      ]);

      // Log errors but don't throw
      if (challengesError) console.error('Erro ao buscar desafios:', challengesError);
      if (participationsError) console.error('Erro ao buscar participações:', participationsError);
      if (goalsError) console.error('Erro ao buscar metas:', goalsError);
      if (activitiesError) console.error('Erro ao buscar atividades:', activitiesError);

      // Calcular XP e nível
      const totalXP = userGoals?.reduce((sum, goal) => sum + (goal.estimated_points || 0), 0) || 0;
      const currentLevel = totalXP === 0 ? 1 : Math.floor(totalXP / 1000) + 1;
      const currentXP = totalXP % 1000;
      const xpToNextLevel = 1000 - currentXP;

      // Calcular streak
      let currentStreak = 0;
      let bestStreak = 0;
      
      if (recentActivities && recentActivities.length > 0) {
        const today = new Date();
        let streakDate = new Date(today);
        
        for (const activity of recentActivities) {
          const activityDate = new Date(activity.created_at);
          const daysDiff = Math.floor((streakDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff <= 1) {
            currentStreak++;
            streakDate = activityDate;
          } else {
            break;
          }
        }
        bestStreak = currentStreak;
      }

      // Converter desafios
      const dailyChallenges: DailyChallenge[] = challenges?.map(challenge => {
        const participation = participations?.find(p => p.challenge_id === challenge.id);
        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description || '',
          challenge_type: challenge.challenge_type || 'general',
          difficulty: challenge.difficulty || 'medium',
          target_value: 100,
          xp_reward: challenge.points_reward || 50,
          category: challenge.challenge_type || 'general',
          progress: participation?.progress || 0,
          is_completed: participation?.is_completed || participation?.completed || false,
          expires_at: challenge.end_date 
            ? new Date(challenge.end_date) 
            : new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
      }) || [];

      // Badges baseados em dados reais
      const badges: Badge[] = [
        {
          id: '1',
          name: 'Primeira Meta',
          description: 'Complete sua primeira meta',
          icon: 'target',
          color: 'bronze',
          tier: 'bronze',
          requirement: 'Complete 1 meta',
          earned: totalXP > 0,
          earnedAt: totalXP > 0 ? new Date() : undefined
        },
        {
          id: '2',
          name: 'Sequência de Fogo',
          description: 'Mantenha uma sequência de 7 dias',
          icon: 'flame',
          color: 'gold',
          tier: 'gold',
          requirement: 'Sequência de 7 dias',
          earned: currentStreak >= 7,
          progress: currentStreak,
          maxProgress: 7
        },
        {
          id: '3',
          name: 'Mestre dos Pontos',
          description: 'Acumule 5000 pontos de experiência',
          icon: 'crown',
          color: 'platinum',
          tier: 'platinum',
          requirement: '5000 XP',
          earned: totalXP >= 5000,
          progress: totalXP,
          maxProgress: 5000
        },
        {
          id: '4',
          name: 'Lenda',
          description: 'Alcance o nível 10',
          icon: 'gem',
          color: 'diamond',
          tier: 'diamond',
          requirement: 'Nível 10',
          earned: currentLevel >= 10,
          progress: currentLevel,
          maxProgress: 10
        }
      ];

      return {
        currentLevel,
        currentXP,
        xpToNextLevel,
        totalXP,
        currentStreak,
        bestStreak,
        badges,
        dailyChallenges,
        achievements: badges.filter(b => b.earned).length,
        rank: currentLevel >= 10 ? 'Diamond' : currentLevel >= 6 ? 'Gold' : currentLevel >= 3 ? 'Silver' : 'Bronze',
        lastActivityDate: recentActivities?.[0]?.created_at || new Date().toISOString()
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 60 * 60 * 1000,   // 1 hora em memória
    enabled,
    refetchOnWindowFocus: false,
  });

  // Completar desafio com optimistic update
  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!userId) throw new Error('Usuário não autenticado');

      // Buscar ou criar participação
      let { data: participation, error: participationError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (participationError && participationError.code === 'PGRST116') {
        // Criar nova participação
        const { error: createError } = await supabase
          .from('challenge_participations')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            status: 'completed',
            progress: 100,
            is_completed: true,
            completed_at: new Date().toISOString()
          });

        if (createError) throw createError;
      } else if (participationError) {
        throw participationError;
      } else {
        // Atualizar participação existente
        const { error: updateError } = await supabase
          .from('challenge_participations')
          .update({
            status: 'completed',
            progress: 100,
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', participation.id);

        if (updateError) throw updateError;
      }

      // Buscar recompensa
      const { data: challenge } = await supabase
        .from('challenges')
        .select('points_reward')
        .eq('id', challengeId)
        .single();

      return { challengeId, xpEarned: challenge?.points_reward || 50 };
    },
    onMutate: async (challengeId: string) => {
      await queryClient.cancelQueries({ queryKey: ['gamification-unified', userId] });
      const previous = queryClient.getQueryData<GamificationData | null>(['gamification-unified', userId]);

      if (previous) {
        const challenge = previous.dailyChallenges.find(dc => dc.id === challengeId);
        const wasCompleted = challenge?.is_completed;
        const xpDelta = wasCompleted ? 0 : (challenge?.xp_reward || 50);
        
        const updated: GamificationData = {
          ...previous,
          totalXP: previous.totalXP + xpDelta,
          currentXP: (previous.currentXP + xpDelta) % 1000,
          xpToNextLevel: 1000 - ((previous.currentXP + xpDelta) % 1000),
          dailyChallenges: previous.dailyChallenges.map(dc =>
            dc.id === challengeId
              ? { ...dc, is_completed: true, progress: 100 }
              : dc
          )
        };
        queryClient.setQueryData(['gamification-unified', userId], updated);
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['gamification-unified', userId], context.previous);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Desafio Concluído! 🎉',
        description: `Você ganhou ${data.xpEarned} XP!`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-unified', userId] });
    }
  });

  // Atualizar progresso
  const updateChallengeProgressMutation = useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      if (!userId) throw new Error('Usuário não autenticado');

      const isCompleted = progress >= 100;

      // Buscar ou criar participação
      let { data: participation, error: participationError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (participationError && participationError.code === 'PGRST116') {
        const { error: createError } = await supabase
          .from('challenge_participations')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            progress: Math.min(progress, 100),
            status: isCompleted ? 'completed' : 'active',
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          });

        if (createError) throw createError;
      } else if (participationError) {
        throw participationError;
      } else {
        const { error: updateError } = await supabase
          .from('challenge_participations')
          .update({
            progress: Math.min(progress, 100),
            status: isCompleted ? 'completed' : 'active',
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', participation.id);

        if (updateError) throw updateError;
      }

      let xpEarned = 0;
      if (isCompleted) {
        const { data: challenge } = await supabase
          .from('challenges')
          .select('points_reward')
          .eq('id', challengeId)
          .single();

        xpEarned = challenge?.points_reward || 50;
      }

      return { challengeId, progress, isCompleted, xpEarned };
    },
    onMutate: async ({ challengeId, progress }) => {
      await queryClient.cancelQueries({ queryKey: ['gamification-unified', userId] });
      const previous = queryClient.getQueryData<GamificationData | null>(['gamification-unified', userId]);

      if (previous) {
        const isCompleted = progress >= 100;
        const challenge = previous.dailyChallenges.find(dc => dc.id === challengeId);
        const xpDelta = isCompleted && !challenge?.is_completed ? (challenge?.xp_reward || 50) : 0;

        const updated: GamificationData = {
          ...previous,
          totalXP: previous.totalXP + xpDelta,
          currentXP: (previous.currentXP + xpDelta) % 1000,
          xpToNextLevel: 1000 - ((previous.currentXP + xpDelta) % 1000),
          dailyChallenges: previous.dailyChallenges.map(dc =>
            dc.id === challengeId
              ? { ...dc, progress: Math.min(progress, 100), is_completed: isCompleted }
              : dc
          )
        };
        queryClient.setQueryData(['gamification-unified', userId], updated);
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['gamification-unified', userId], context.previous);
      }
    },
    onSuccess: (data) => {
      if (data.isCompleted) {
        toast({
          title: 'Desafio Concluído! 🎉',
          description: `+${data.xpEarned} XP!`,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-unified', userId] });
    }
  });

  // Função auxiliar para tracking (compatibilidade)
  const getTrackingProgress = async (type: string): Promise<number> => {
    console.log('Getting tracking progress for:', type);
    return 0;
  };

  return {
    gamificationData,
    isLoading,
    refetch,
    completeChallenge: completeChallengeMutation.mutate,
    isCompletingChallenge: completeChallengeMutation.isPending,
    updateChallengeProgress: updateChallengeProgressMutation.mutate,
    isUpdatingProgress: updateChallengeProgressMutation.isPending,
    getTrackingProgress,
  };
};

export default useGamificationUnified;
