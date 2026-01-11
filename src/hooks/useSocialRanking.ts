import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  position: number;
  previousPosition?: number;
  streak?: number;
}

export const useSocialRanking = (userId?: string, period: 'week' | 'month' = 'week') => {
  const enabled = !!userId;

  const { data: rankingData, isLoading, refetch } = useQuery({
    queryKey: ['social-ranking', userId, period],
    queryFn: async (): Promise<RankingUser[]> => {
      if (!userId) return [];

      // Buscar dados de gamificação de todos os usuários ativos
      const startDate = period === 'week' 
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Buscar participações em desafios no período
      const { data: participations, error: partError } = await supabase
        .from('challenge_participations')
        .select(`
          user_id,
          points_earned,
          is_completed,
          completed_at
        `)
        .gte('started_at', startDate);

      if (partError) {
        console.error('Erro ao buscar participações:', partError);
        return [];
      }

      // Agrupar pontos por usuário
      const userPoints: Record<string, number> = {};
      participations?.forEach(p => {
        if (!userPoints[p.user_id]) userPoints[p.user_id] = 0;
        userPoints[p.user_id] += p.points_earned || 0;
        if (p.is_completed) userPoints[p.user_id] += 50; // Bônus por completar
      });

      // Buscar perfis dos usuários com pontos
      const userIds = Object.keys(userPoints);
      if (userIds.length === 0) {
        // Se não há dados reais, retornar dados simulados para demonstração
        return generateDemoRanking(userId);
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        return generateDemoRanking(userId);
      }

      // Montar ranking
      const ranking: RankingUser[] = profiles?.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Usuário',
        avatar: profile.avatar_url || undefined,
        points: userPoints[profile.id] || 0,
        position: 0,
        streak: Math.floor(Math.random() * 10) // TODO: calcular streak real
      })) || [];

      // Ordenar por pontos e atribuir posições
      ranking.sort((a, b) => b.points - a.points);
      ranking.forEach((user, index) => {
        user.position = index + 1;
        // Simular posição anterior (para demonstração)
        user.previousPosition = user.position + Math.floor(Math.random() * 3) - 1;
      });

      // Se o usuário atual não está no ranking, adicionar
      const currentUserInRanking = ranking.find(u => u.id === userId);
      if (!currentUserInRanking) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', userId)
          .single();

        if (currentProfile) {
          ranking.push({
            id: currentProfile.id,
            name: currentProfile.full_name || 'Você',
            avatar: currentProfile.avatar_url || undefined,
            points: 0,
            position: ranking.length + 1,
            previousPosition: ranking.length + 2,
            streak: 0
          });
        }
      }

      return ranking.slice(0, 10); // Top 10
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled,
    refetchOnWindowFocus: false,
  });

  return {
    rankingData: rankingData || [],
    isLoading,
    refetch
  };
};

// Gerar ranking de demonstração quando não há dados reais
function generateDemoRanking(currentUserId: string): RankingUser[] {
  const demoNames = [
    'Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Lima',
    'Carla Souza', 'Lucas Oliveira', 'Julia Ferreira', 'Bruno Alves'
  ];

  const ranking: RankingUser[] = demoNames.map((name, index) => ({
    id: `demo-${index}`,
    name,
    points: Math.floor(Math.random() * 5000) + 1000,
    position: 0,
    previousPosition: 0,
    streak: Math.floor(Math.random() * 14)
  }));

  // Adicionar usuário atual
  ranking.push({
    id: currentUserId,
    name: 'VOCÊ',
    points: Math.floor(Math.random() * 3000) + 500,
    position: 0,
    streak: Math.floor(Math.random() * 7)
  });

  // Ordenar e atribuir posições
  ranking.sort((a, b) => b.points - a.points);
  ranking.forEach((user, index) => {
    user.position = index + 1;
    user.previousPosition = user.position + Math.floor(Math.random() * 3) - 1;
  });

  return ranking.slice(0, 10);
}

export default useSocialRanking;
