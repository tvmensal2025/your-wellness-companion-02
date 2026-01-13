/**
 * 🎮 Gamification Service - Pontos, Streak, Níveis
 * 
 * Centraliza toda a lógica de gamificação.
 * Substitui: useGamification, useGamificationUnified, useRealGamification,
 * useEnhancedGamification, useUserPoints, useUserXP, useUserStreak
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════
// 📋 TIPOS
// ═══════════════════════════════════════════════════════════

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  current_streak: number;
  best_streak: number;
  last_activity_date: string | null;
  level: number;
  missions_completed: number;
  completed_challenges: number;
  created_at: string;
  updated_at: string;
}

export interface GamificationData {
  points: UserPoints | null;
  // Dados derivados
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  levelName: string;
  missionsCompleted: number;
  challengesCompleted: number;
  xpToNextLevel: number;
  levelProgress: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  target: number;
}

// ═══════════════════════════════════════════════════════════
// 🎯 CONSTANTES DE NÍVEIS
// ═══════════════════════════════════════════════════════════

export const LEVEL_THRESHOLDS_MASC = [
  { level: 1, minPoints: 0, name: 'Novato', icon: '🌱' },
  { level: 2, minPoints: 100, name: 'Iniciante', icon: '🌿' },
  { level: 3, minPoints: 300, name: 'Aprendiz', icon: '🌳' },
  { level: 4, minPoints: 600, name: 'Praticante', icon: '⭐' },
  { level: 5, minPoints: 1000, name: 'Dedicado', icon: '🌟' },
  { level: 6, minPoints: 1500, name: 'Avançado', icon: '💫' },
  { level: 7, minPoints: 2200, name: 'Expert', icon: '🔥' },
  { level: 8, minPoints: 3000, name: 'Mestre', icon: '👑' },
  { level: 9, minPoints: 4000, name: 'Lenda', icon: '💎' },
  { level: 10, minPoints: 5500, name: 'Diamante', icon: '💠' },
] as const;

export const LEVEL_THRESHOLDS_FEM = [
  { level: 1, minPoints: 0, name: 'Novata', icon: '🌱' },
  { level: 2, minPoints: 100, name: 'Iniciante', icon: '🌿' },
  { level: 3, minPoints: 300, name: 'Aprendiz', icon: '🌳' },
  { level: 4, minPoints: 600, name: 'Praticante', icon: '⭐' },
  { level: 5, minPoints: 1000, name: 'Dedicada', icon: '🌟' },
  { level: 6, minPoints: 1500, name: 'Avançada', icon: '💫' },
  { level: 7, minPoints: 2200, name: 'Expert', icon: '🔥' },
  { level: 8, minPoints: 3000, name: 'Mestra', icon: '👑' },
  { level: 9, minPoints: 4000, name: 'Lenda', icon: '💎' },
  { level: 10, minPoints: 5500, name: 'Diamante', icon: '💠' },
] as const;

// Backward compatibility
export const LEVEL_THRESHOLDS = LEVEL_THRESHOLDS_MASC;

// ═══════════════════════════════════════════════════════════
// 🔧 FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════

/**
 * Calcula o nível baseado nos pontos (com suporte a gênero)
 */
export function calculateLevel(points: number, isFeminine?: boolean): { level: number; name: string; icon: string } {
  const thresholds = isFeminine ? LEVEL_THRESHOLDS_FEM : LEVEL_THRESHOLDS_MASC;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (points >= thresholds[i].minPoints) {
      return thresholds[i];
    }
  }
  return LEVEL_THRESHOLDS[0];
}

/**
 * Calcula XP necessário para próximo nível
 */
export function calculateXPToNextLevel(points: number): number {
  const currentLevelData = calculateLevel(points);
  const nextLevelIndex = LEVEL_THRESHOLDS.findIndex(l => l.level === currentLevelData.level) + 1;
  
  if (nextLevelIndex >= LEVEL_THRESHOLDS.length) {
    return 0; // Nível máximo
  }
  
  return LEVEL_THRESHOLDS[nextLevelIndex].minPoints - points;
}

/**
 * Calcula progresso percentual no nível atual
 */
export function calculateLevelProgress(points: number): number {
  const currentLevelData = calculateLevel(points);
  const currentLevelIndex = LEVEL_THRESHOLDS.findIndex(l => l.level === currentLevelData.level);
  const nextLevelIndex = currentLevelIndex + 1;
  
  if (nextLevelIndex >= LEVEL_THRESHOLDS.length) {
    return 100; // Nível máximo
  }
  
  const currentMin = LEVEL_THRESHOLDS[currentLevelIndex].minPoints;
  const nextMin = LEVEL_THRESHOLDS[nextLevelIndex].minPoints;
  const range = nextMin - currentMin;
  const progress = points - currentMin;
  
  return Math.round((progress / range) * 100);
}

// ═══════════════════════════════════════════════════════════
// 📖 READ OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Busca dados completos de gamificação do usuário
 */
export async function fetchGamificationData(userId: string): Promise<GamificationData> {
  const { data, error } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar gamificação:', error);
  }

  const points = data as UserPoints | null;
  const totalPoints = points?.total_points || 0;
  const levelData = calculateLevel(totalPoints);

  return {
    points,
    totalPoints,
    currentStreak: points?.current_streak || 0,
    bestStreak: points?.best_streak || 0,
    level: levelData.level,
    levelName: levelData.name,
    missionsCompleted: points?.missions_completed || 0,
    challengesCompleted: points?.completed_challenges || 0,
    xpToNextLevel: calculateXPToNextLevel(totalPoints),
    levelProgress: calculateLevelProgress(totalPoints),
  };
}

/**
 * Busca apenas pontos do usuário (query leve)
 */
export async function fetchUserPoints(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_points')
    .select('total_points')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar pontos:', error);
    return 0;
  }

  return data?.total_points || 0;
}

/**
 * Busca streak atual do usuário
 */
export async function fetchUserStreak(userId: string): Promise<{ current: number; best: number }> {
  const { data, error } = await supabase
    .from('user_points')
    .select('current_streak, best_streak')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar streak:', error);
    return { current: 0, best: 0 };
  }

  return {
    current: data?.current_streak || 0,
    best: data?.best_streak || 0,
  };
}

// ═══════════════════════════════════════════════════════════
// ✏️ UPDATE OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Adiciona pontos ao usuário
 */
export async function addPoints(userId: string, points: number, reason?: string): Promise<number> {
  // Buscar pontos atuais
  const { data: current } = await supabase
    .from('user_points')
    .select('total_points, level')
    .eq('user_id', userId)
    .maybeSingle();

  const currentPoints = current?.total_points || 0;
  const newTotal = currentPoints + points;
  const newLevel = calculateLevel(newTotal).level;

  // Atualizar ou criar registro
  const { data, error } = await supabase
    .from('user_points')
    .upsert({
      user_id: userId,
      total_points: newTotal,
      level: newLevel,
      last_activity_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select('total_points')
    .single();

  if (error) {
    console.error('Erro ao adicionar pontos:', error);
    throw error;
  }

  return data.total_points;
}

/**
 * Incrementa contador de missões completadas
 */
export async function incrementMissionsCompleted(userId: string): Promise<void> {
  const { error } = await (supabase as any).rpc('increment_missions_completed', {
    p_user_id: userId,
  });

  if (error) {
    // Fallback se RPC não existir
    const { data: current } = await supabase
      .from('user_points')
      .select('missions_completed')
      .eq('user_id', userId)
      .maybeSingle();

    await supabase
      .from('user_points')
      .upsert({
        user_id: userId,
        missions_completed: (current?.missions_completed || 0) + 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  }
}

/**
 * Incrementa contador de desafios completados
 */
export async function incrementChallengesCompleted(userId: string): Promise<void> {
  const { data: current } = await supabase
    .from('user_points')
    .select('completed_challenges')
    .eq('user_id', userId)
    .maybeSingle();

  await supabase
    .from('user_points')
    .upsert({
      user_id: userId,
      completed_challenges: (current?.completed_challenges || 0) + 1,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
}

/**
 * Atualiza streak manualmente (normalmente feito por trigger)
 */
export async function updateStreak(userId: string, newStreak: number): Promise<void> {
  const { data: current } = await supabase
    .from('user_points')
    .select('best_streak')
    .eq('user_id', userId)
    .maybeSingle();

  const bestStreak = Math.max(current?.best_streak || 0, newStreak);

  await supabase
    .from('user_points')
    .upsert({
      user_id: userId,
      current_streak: newStreak,
      best_streak: bestStreak,
      last_activity_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
}

// ═══════════════════════════════════════════════════════════
// 🏆 ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════

/**
 * Busca conquistas do usuário
 */
export async function fetchUserAchievements(userId: string): Promise<Achievement[]> {
  // Por enquanto retorna lista estática baseada nos dados
  const gamification = await fetchGamificationData(userId);
  
  const achievements: Achievement[] = [
    {
      id: 'first-steps',
      name: 'Primeiros Passos',
      description: 'Complete sua primeira missão',
      icon: '🎯',
      unlockedAt: gamification.missionsCompleted > 0 ? new Date().toISOString() : null,
      progress: Math.min(gamification.missionsCompleted, 1),
      target: 1,
    },
    {
      id: 'streak-7',
      name: 'Semana Perfeita',
      description: 'Mantenha 7 dias de streak',
      icon: '🔥',
      unlockedAt: gamification.bestStreak >= 7 ? new Date().toISOString() : null,
      progress: Math.min(gamification.currentStreak, 7),
      target: 7,
    },
    {
      id: 'streak-30',
      name: 'Mês Dedicado',
      description: 'Mantenha 30 dias de streak',
      icon: '💪',
      unlockedAt: gamification.bestStreak >= 30 ? new Date().toISOString() : null,
      progress: Math.min(gamification.currentStreak, 30),
      target: 30,
    },
    {
      id: 'level-5',
      name: 'Dedicado',
      description: 'Alcance o nível 5',
      icon: '⭐',
      unlockedAt: gamification.level >= 5 ? new Date().toISOString() : null,
      progress: gamification.level,
      target: 5,
    },
    {
      id: 'points-1000',
      name: 'Mil Pontos',
      description: 'Acumule 1000 pontos',
      icon: '💎',
      unlockedAt: gamification.totalPoints >= 1000 ? new Date().toISOString() : null,
      progress: Math.min(gamification.totalPoints, 1000),
      target: 1000,
    },
  ];

  return achievements;
}
