import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  totalXP: number;
  level: number;
  achievements: number;
  streak: number;
  isCurrentUser: boolean;
}

export const useRealRanking = () => {
  return useQuery({
    queryKey: ['real-ranking'],
    queryFn: async (): Promise<{ ranking: RankingUser[]; currentUserRank: number }> => {
      const { data: { user } } = await supabase.auth.getUser();

      // Buscar todos os usuários com seus pontos
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url');

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        return { ranking: [], currentUserRank: 0 };
      }

      // Para cada usuário, calcular XP total
      const rankingPromises = profiles.map(async (profile) => {
        // Buscar pontos de metas concluídas
        const { data: goals } = await supabase
          .from('user_goals')
          .select('estimated_points')
          .eq('user_id', profile.id)
          .eq('status', 'concluida');

        const totalXP = goals?.reduce((sum, g) => sum + (g.estimated_points || 0), 0) || 0;

        // Buscar conquistas
        const { data: achievements } = await supabase
          .from('achievement_tracking')
          .select('id')
          .eq('user_id', profile.id)
          .not('unlocked_at', 'is', null);

        // Calcular streak
        const { data: activities } = await supabase
          .from('goal_updates')
          .select('created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(30);

        let streak = 0;
        if (activities && activities.length > 0) {
          const today = new Date();
          let streakDate = new Date(today);
          
          for (const activity of activities) {
            const activityDate = new Date(activity.created_at);
            const daysDiff = Math.floor((streakDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 1) {
              streak++;
              streakDate = activityDate;
            } else {
              break;
            }
          }
        }

        return {
          id: profile.id,
          name: profile.full_name || 'Usuário',
          avatar: profile.avatar_url,
          totalXP,
          level: Math.floor(totalXP / 1000) + 1,
          achievements: achievements?.length || 0,
          streak,
          isCurrentUser: profile.id === user?.id,
        };
      });

      const ranking = await Promise.all(rankingPromises);

      // Ordenar por XP
      ranking.sort((a, b) => b.totalXP - a.totalXP);

      // Encontrar posição do usuário atual
      const currentUserRank = ranking.findIndex(u => u.isCurrentUser) + 1;

      // Retornar top 10
      return {
        ranking: ranking.slice(0, 10),
        currentUserRank,
      };
    },
    staleTime: 60000, // 1 minuto
    refetchInterval: 120000, // 2 minutos
  });
};

export default useRealRanking;
