import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface RankingUser {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  total_points: number;
  streak_days: number;
  missions_completed: number;
  completed_challenges: number;
  level: number;
  last_activity: string | null;
  position: number;
}

const fetchRankingData = async (): Promise<RankingUser[]> => {
  // Query robusta: buscar pontos primeiro, depois perfis separadamente
  // Isso evita problemas com FK e RLS
  const { data: pointsData, error: pointsError } = await supabase
    .from('user_points')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(100);

  if (pointsError) {
    console.error('Erro ao buscar pontos:', pointsError);
    throw pointsError;
  }

  if (!pointsData || pointsData.length === 0) {
    console.warn('Nenhum registro em user_points encontrado');
    return [];
  }

  // Buscar perfis separadamente para evitar problemas de FK
  const userIds = pointsData.map(p => p.user_id).filter(Boolean);
  
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url')
    .in('user_id', userIds);

  if (profilesError) {
    console.warn('Erro ao buscar perfis (continuando sem nomes):', profilesError);
  }

  // Criar mapa de perfis para lookup rápido
  const profilesMap = new Map(
    profilesData?.map(p => [p.user_id, p]) || []
  );

  // Mapear para formato do ranking com fallbacks
  // FILTRAR usuários com 0 pontos ANTES de atribuir posições
  const usersWithPoints = pointsData
    .filter(item => (item.total_points || 0) > 0)
    .map((item) => {
      const profile = profilesMap.get(item.user_id);
      return {
        user_id: item.user_id,
        user_name: profile?.full_name || 'Membro',
        avatar_url: profile?.avatar_url || undefined,
        total_points: item.total_points || 0,
        streak_days: item.current_streak || 0,
        missions_completed: item.missions_completed || 0,
        completed_challenges: item.completed_challenges || 0,
        level: item.level || 1,
        last_activity: item.last_activity_date,
        position: 0 // Será atribuído abaixo
      };
    })
    // Filtrar usuários sem nome válido
    .filter(u => u.user_name !== 'Membro' || u.total_points > 10);

  // Atribuir posições APÓS filtrar
  const rankingUsers: RankingUser[] = usersWithPoints.map((user, index) => ({
    ...user,
    position: index + 1
  }));

  return rankingUsers;
};

export const useRanking = () => {
  const { data: ranking = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['ranking'],
    queryFn: fetchRankingData,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  return {
    ranking,
    loading,
    error: error?.message || null,
    refetch
  };
};
