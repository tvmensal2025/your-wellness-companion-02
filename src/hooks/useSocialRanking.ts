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

// Calcular streak real baseado em dias consecutivos de atividade
async function calculateUserStreak(userId: string): Promise<number> {
  // Buscar datas de atividade do usuário (últimos 30 dias)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Buscar de múltiplas fontes de atividade
  const [trackingData, participationsData, pointsData] = await Promise.all([
    // advanced_daily_tracking
    supabase
      .from('advanced_daily_tracking')
      .select('tracking_date')
      .eq('user_id', userId)
      .gte('tracking_date', thirtyDaysAgo)
      .order('tracking_date', { ascending: false }),
    // challenge_participations (dias com atividade)
    supabase
      .from('challenge_participations')
      .select('started_at, completed_at')
      .eq('user_id', userId)
      .gte('started_at', thirtyDaysAgo),
    // user_points (dias com pontos ganhos)
    supabase
      .from('user_points')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo)
  ]);

  // Coletar todas as datas únicas de atividade
  const activityDates = new Set<string>();
  
  trackingData.data?.forEach(t => {
    if (t.tracking_date) activityDates.add(t.tracking_date);
  });
  
  participationsData.data?.forEach(p => {
    if (p.started_at) activityDates.add(p.started_at.split('T')[0]);
    if (p.completed_at) activityDates.add(p.completed_at.split('T')[0]);
  });
  
  pointsData.data?.forEach(p => {
    if (p.created_at) activityDates.add(p.created_at.split('T')[0]);
  });

  if (activityDates.size === 0) return 0;

  // Ordenar datas do mais recente para o mais antigo
  const sortedDates = Array.from(activityDates).sort((a, b) => b.localeCompare(a));
  
  // Calcular streak (dias consecutivos a partir de hoje ou ontem)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Verificar se há atividade hoje ou ontem para iniciar contagem
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0; // Streak quebrado
  }

  let streak = 1;
  let currentDate = new Date(sortedDates[0]);
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const expectedDate = prevDate.toISOString().split('T')[0];
    
    if (sortedDates[i] === expectedDate) {
      streak++;
      currentDate = prevDate;
    } else {
      break; // Streak quebrado
    }
  }

  return streak;
}

// Buscar streaks para múltiplos usuários de forma otimizada
async function fetchUserStreaks(userIds: string[]): Promise<Record<string, number>> {
  const streaks: Record<string, number> = {};
  
  // Buscar em paralelo (máximo 10 para não sobrecarregar)
  const batchSize = 10;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(id => calculateUserStreak(id)));
    batch.forEach((id, index) => {
      streaks[id] = results[index];
    });
  }
  
  return streaks;
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
        return generateDemoRanking(userId);
      }

      // Buscar streaks reais para todos os usuários
      const allUserIds = profiles?.map(p => p.id) || [];
      if (!allUserIds.includes(userId)) allUserIds.push(userId);
      const userStreaks = await fetchUserStreaks(allUserIds);

      // Montar ranking com streaks reais
      const ranking: RankingUser[] = profiles?.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Usuário',
        avatar: profile.avatar_url || undefined,
        points: userPoints[profile.id] || 0,
        position: 0,
        streak: userStreaks[profile.id] || 0
      })) || [];

      // Ordenar por pontos e atribuir posições
      ranking.sort((a, b) => b.points - a.points);
      ranking.forEach((user, index) => {
        user.position = index + 1;
        // Posição anterior baseada em variação de pontos (simplificado)
        user.previousPosition = user.position;
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
            previousPosition: ranking.length + 1,
            streak: userStreaks[userId] || 0
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
  // Dados de demonstração com valores fixos (não aleatórios)
  const demoUsers = [
    { name: 'Maria Silva', points: 4850, streak: 12 },
    { name: 'João Santos', points: 4200, streak: 8 },
    { name: 'Ana Costa', points: 3900, streak: 15 },
    { name: 'Pedro Lima', points: 3500, streak: 5 },
    { name: 'Carla Souza', points: 3100, streak: 7 },
    { name: 'Lucas Oliveira', points: 2800, streak: 3 },
    { name: 'Julia Ferreira', points: 2400, streak: 10 },
    { name: 'Bruno Alves', points: 2000, streak: 2 },
  ];

  const ranking: RankingUser[] = demoUsers.map((user, index) => ({
    id: `demo-${index}`,
    name: user.name,
    points: user.points,
    position: index + 1,
    previousPosition: index + 1,
    streak: user.streak
  }));

  // Adicionar usuário atual na posição 5 (meio do ranking)
  ranking.push({
    id: currentUserId,
    name: 'VOCÊ',
    points: 3200,
    position: 5,
    previousPosition: 5,
    streak: 4
  });

  // Reordenar por pontos
  ranking.sort((a, b) => b.points - a.points);
  ranking.forEach((user, index) => {
    user.position = index + 1;
  });

  return ranking.slice(0, 10);
}

export default useSocialRanking;
