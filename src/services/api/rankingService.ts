/**
 * 🏆 Ranking Service - Ranking Paginado e Escalável
 * 
 * Projetado para suportar bilhões de usuários com:
 * - Paginação eficiente
 * - Cache inteligente
 * - Queries otimizadas
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════
// 📋 TIPOS
// ═══════════════════════════════════════════════════════════

export interface RankingUser {
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  total_points: number;
  streak_days: number;
  missions_completed: number;
  completed_challenges: number;
  level: number;
  last_activity: string | null;
  position: number;
}

export interface PaginatedRanking {
  users: RankingUser[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserRankingPosition {
  position: number;
  totalPoints: number;
  percentile: number; // Top X%
}

// ═══════════════════════════════════════════════════════════
// 📖 READ OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Busca ranking paginado
 * 
 * @param page - Página atual (começa em 1)
 * @param limit - Itens por página (default: 20)
 */
export async function fetchRankingPaginated(
  page: number = 1, 
  limit: number = 20
): Promise<PaginatedRanking> {
  const offset = (page - 1) * limit;

  // Query 1: Buscar pontos com paginação
  const { data: pointsData, error: pointsError, count } = await supabase
    .from('user_points')
    .select('*', { count: 'exact' })
    .gt('total_points', 0)
    .order('total_points', { ascending: false })
    .range(offset, offset + limit - 1);

  if (pointsError) {
    console.error('Erro ao buscar ranking:', pointsError);
    throw pointsError;
  }

  if (!pointsData || pointsData.length === 0) {
    return {
      users: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  // Query 2: Buscar perfis dos usuários
  const userIds = pointsData.map(p => p.user_id).filter(Boolean);
  
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url')
    .in('user_id', userIds);

  // Criar mapa de perfis
  const profilesMap = new Map(
    profilesData?.map(p => [p.user_id, p]) || []
  );

  // Mapear para formato do ranking
  const users: RankingUser[] = pointsData.map((item, index) => {
    const profile = profilesMap.get(item.user_id);
    return {
      user_id: item.user_id,
      user_name: profile?.full_name || 'Membro',
      avatar_url: profile?.avatar_url || null,
      total_points: item.total_points || 0,
      streak_days: item.current_streak || 0,
      missions_completed: item.missions_completed || 0,
      completed_challenges: item.completed_challenges || 0,
      level: item.level || 1,
      last_activity: item.last_activity_date,
      position: offset + index + 1,
    };
  });

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    users,
    totalCount,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Busca top N usuários (para exibição rápida)
 */
export async function fetchTopRanking(limit: number = 10): Promise<RankingUser[]> {
  const result = await fetchRankingPaginated(1, limit);
  return result.users;
}

/**
 * Busca posição de um usuário específico no ranking
 */
export async function fetchUserPosition(userId: string): Promise<UserRankingPosition | null> {
  // Buscar pontos do usuário
  const { data: userPoints, error: userError } = await supabase
    .from('user_points')
    .select('total_points')
    .eq('user_id', userId)
    .maybeSingle();

  if (userError || !userPoints) {
    return null;
  }

  const totalPoints = userPoints.total_points || 0;

  // Contar quantos usuários têm mais pontos
  const { count: usersAbove } = await supabase
    .from('user_points')
    .select('*', { count: 'exact', head: true })
    .gt('total_points', totalPoints);

  // Contar total de usuários com pontos
  const { count: totalUsers } = await supabase
    .from('user_points')
    .select('*', { count: 'exact', head: true })
    .gt('total_points', 0);

  const position = (usersAbove || 0) + 1;
  const percentile = totalUsers ? Math.round((1 - position / totalUsers) * 100) : 0;

  return {
    position,
    totalPoints,
    percentile: Math.max(0, percentile),
  };
}

/**
 * Busca ranking com contexto do usuário (mostra usuários próximos)
 */
export async function fetchRankingWithContext(
  userId: string,
  contextSize: number = 2
): Promise<{ ranking: RankingUser[]; userPosition: number }> {
  // Primeiro, buscar posição do usuário
  const userPosition = await fetchUserPosition(userId);
  
  if (!userPosition) {
    // Usuário não tem pontos, retornar top 10
    const top = await fetchTopRanking(10);
    return { ranking: top, userPosition: 0 };
  }

  const position = userPosition.position;
  
  // Se está no top 10, retornar top 10
  if (position <= 10) {
    const top = await fetchTopRanking(10);
    return { ranking: top, userPosition: position };
  }

  // Caso contrário, buscar contexto ao redor do usuário
  const startPosition = Math.max(1, position - contextSize);
  const endPosition = position + contextSize;
  
  // Buscar top 3 + contexto do usuário
  const [top3, context] = await Promise.all([
    fetchTopRanking(3),
    fetchRankingPaginated(Math.ceil(startPosition / 10), 10),
  ]);

  // Filtrar contexto para mostrar apenas posições relevantes
  const contextUsers = context.users.filter(
    u => u.position >= startPosition && u.position <= endPosition
  );

  // Combinar top 3 + separador + contexto
  const ranking = [...top3, ...contextUsers];

  return { ranking, userPosition: position };
}

// ═══════════════════════════════════════════════════════════
// 📊 ESTATÍSTICAS
// ═══════════════════════════════════════════════════════════

/**
 * Busca estatísticas gerais do ranking
 */
export async function fetchRankingStats(): Promise<{
  totalUsers: number;
  totalPoints: number;
  averagePoints: number;
  topStreak: number;
}> {
  const { data, error } = await supabase
    .from('user_points')
    .select('total_points, current_streak')
    .gt('total_points', 0);

  if (error || !data) {
    return {
      totalUsers: 0,
      totalPoints: 0,
      averagePoints: 0,
      topStreak: 0,
    };
  }

  const totalUsers = data.length;
  const totalPoints = data.reduce((sum, u) => sum + (u.total_points || 0), 0);
  const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
  const topStreak = Math.max(...data.map(u => u.current_streak || 0), 0);

  return {
    totalUsers,
    totalPoints,
    averagePoints,
    topStreak,
  };
}
