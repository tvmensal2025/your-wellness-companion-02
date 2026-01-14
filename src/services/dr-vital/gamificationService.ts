// =====================================================
// GAMIFICATION SERVICE
// =====================================================
// Sistema de gamificação Health Quest
// Agora usa configuração do banco via unifiedGamificationService
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { 
  awardXP as awardUnifiedXP,
  getXPConfig,
} from '@/services/gamification/unifiedGamificationService';
import type {
  HealthMission,
  HealthStreak,
  HealthLevel,
  MissionType,
  HealthMissionRow,
  HealthStreakRow,
} from '@/types/dr-vital-revolution';
import { LEVEL_TITLES, LEVEL_TITLES_MASC, LEVEL_TITLES_FEM, getLevelTitleByGender } from '@/types/dr-vital-revolution';

// =====================================================
// CONSTANTS (fallbacks - valores do banco têm prioridade)
// =====================================================

const XP_PER_LEVEL_BASE = 100;
const STREAK_BONUS_THRESHOLD = 7;
const STREAK_BONUS_MULTIPLIER = 10;

// Daily mission templates com action_type para buscar config do banco
const DAILY_MISSION_TEMPLATES = [
  { title: 'Beba 2L de água', description: 'Mantenha-se hidratado durante o dia', xpReward: 50, actionType: 'water_goal' },
  { title: 'Registre 3 refeições', description: 'Acompanhe sua alimentação', xpReward: 75, actionType: 'meal_logged' },
  { title: 'Faça 30 min de exercício', description: 'Movimente seu corpo', xpReward: 100, actionType: 'workout_complete' },
  { title: 'Durma 7+ horas', description: 'Descanse bem esta noite', xpReward: 75, actionType: 'sleep_goal' },
  { title: 'Medite por 10 minutos', description: 'Cuide da sua mente', xpReward: 50, actionType: 'daily_checkin' },
  { title: 'Caminhe 5000 passos', description: 'Mantenha-se ativo', xpReward: 60, actionType: 'steps_goal' },
  { title: 'Coma uma fruta', description: 'Adicione vitaminas ao seu dia', xpReward: 30, actionType: 'meal_logged' },
  { title: 'Evite açúcar refinado', description: 'Faça escolhas saudáveis', xpReward: 80, actionType: 'daily_checkin' },
];

// =====================================================
// LEVEL CALCULATION FUNCTIONS
// =====================================================

/**
 * Calcula o nível baseado no XP total
 * Property 8: level = floor(sqrt(total_xp / 100)) + 1
 */
export function calculateLevel(totalXp: number): number {
  if (totalXp < 0) return 1;
  return Math.floor(Math.sqrt(totalXp / XP_PER_LEVEL_BASE)) + 1;
}

/**
 * Calcula o XP necessário para o próximo nível
 * Property 8: xpToNextLevel = (level^2 * 100) - total_xp
 */
export function xpToNextLevel(currentLevel: number, totalXp: number): number {
  const xpForNextLevel = currentLevel * currentLevel * XP_PER_LEVEL_BASE;
  return Math.max(0, xpForNextLevel - totalXp);
}

/**
 * Calcula o XP total necessário para um nível específico
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * (level - 1) * XP_PER_LEVEL_BASE;
}

/**
 * Retorna o título do nível (padrão masculino para compatibilidade)
 */
export function getLevelTitle(level: number, gender?: string | null): string {
  if (gender) {
    return getLevelTitleByGender(level, gender);
  }
  if (level >= 10) return LEVEL_TITLES[10];
  return LEVEL_TITLES[level] || LEVEL_TITLES[1];
}

/**
 * Calcula o bônus de XP por streak
 * Property 6: streaks of 7+ days trigger bonus XP (streak * 10)
 */
export function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= STREAK_BONUS_THRESHOLD) {
    return streakDays * STREAK_BONUS_MULTIPLIER;
  }
  return 0;
}

/**
 * Monta objeto HealthLevel completo
 */
export function buildHealthLevel(totalXp: number): HealthLevel {
  const level = calculateLevel(totalXp);
  const xpForCurrentLevel = xpForLevel(level);
  const xpForNext = xpForLevel(level + 1);
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNext - xpForCurrentLevel;
  
  return {
    level,
    currentXp: totalXp,
    xpToNextLevel: xpToNextLevel(level, totalXp),
    title: getLevelTitle(level),
    progressPercentage: xpNeededForLevel > 0 
      ? Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)
      : 100,
    unlockedFeatures: getUnlockedFeatures(level),
  };
}

function getUnlockedFeatures(level: number): string[] {
  const features: string[] = ['Missões Diárias'];
  
  if (level >= 2) features.push('Histórico de Saúde');
  if (level >= 3) features.push('Previsões de Saúde');
  if (level >= 4) features.push('Relatórios Compartilháveis');
  if (level >= 5) features.push('Avatar Customizável');
  if (level >= 6) features.push('Simulador What-If');
  if (level >= 7) features.push('Integração Wearables');
  if (level >= 8) features.push('Assistente de Voz');
  if (level >= 9) features.push('Relatórios Premium');
  if (level >= 10) features.push('Acesso VIP');
  
  return features;
}

// =====================================================
// MISSION FUNCTIONS
// =====================================================

/**
 * Gera missões diárias para o usuário
 */
export async function generateDailyMissions(userId: string): Promise<HealthMission[]> {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  // Check if missions already exist for today
  const { data: existingMissions } = await supabase
    .from('health_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'daily')
    .gte('created_at', new Date().toISOString().split('T')[0]);
  
  if (existingMissions && existingMissions.length > 0) {
    return (existingMissions as HealthMissionRow[]).map(rowToMission);
  }
  
  // Generate 3-5 random missions for today
  const shuffled = [...DAILY_MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
  const selectedMissions = shuffled.slice(0, Math.floor(Math.random() * 3) + 3);
  
  const missionsToInsert = selectedMissions.map(template => ({
    user_id: userId,
    title: template.title,
    description: template.description,
    type: 'daily' as MissionType,
    xp_reward: template.xpReward,
    progress: 0,
    is_completed: false,
    expires_at: today.toISOString(),
  }));
  
  const { data: newMissions, error } = await supabase
    .from('health_missions')
    .insert(missionsToInsert)
    .select();
  
  if (error) {
    console.error('[GamificationService] Error creating missions:', error);
    throw error;
  }
  
  return (newMissions as HealthMissionRow[]).map(rowToMission);
}

/**
 * Completa uma missão e atribui XP
 * Property 5: XP awarded equals mission's xpReward
 * Agora usa sistema unificado para registrar XP
 */
export async function completeMission(
  userId: string,
  missionId: string
): Promise<{ mission: HealthMission; xpAwarded: number; levelUp: boolean }> {
  // Get mission details
  const { data: mission, error: fetchError } = await supabase
    .from('health_missions')
    .select('*')
    .eq('id', missionId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError || !mission) {
    throw new Error('Mission not found');
  }
  
  if (mission.is_completed) {
    throw new Error('Mission already completed');
  }
  
  // Get current streak/level info
  const { data: streakData } = await supabase
    .from('health_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  const currentLevel = streakData?.current_level || 1;
  
  // Update mission as completed
  const { data: updatedMission, error: updateError } = await supabase
    .from('health_missions')
    .update({
      is_completed: true,
      progress: 100,
      completed_at: new Date().toISOString(),
    })
    .eq('id', missionId)
    .select()
    .single();
  
  if (updateError) {
    throw updateError;
  }
  
  // Registrar XP no sistema unificado
  await awardUnifiedXP(userId, 'mission_complete', {
    sourceSystem: 'health',
    sourceId: missionId,
    metadata: { 
      missionTitle: mission.title,
      missionType: mission.type,
    },
  });
  
  // The trigger will handle XP and streak updates
  // Check if level changed
  const { data: newStreakData } = await supabase
    .from('health_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  const newLevel = newStreakData?.current_level || 1;
  const levelUp = newLevel > currentLevel;
  
  return {
    mission: rowToMission(updatedMission as HealthMissionRow),
    xpAwarded: mission.xp_reward,
    levelUp,
  };
}

/**
 * Atualiza o progresso de uma missão
 */
export async function updateMissionProgress(
  userId: string,
  missionId: string,
  progress: number
): Promise<HealthMission> {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const isCompleted = clampedProgress >= 100;
  
  const { data, error } = await supabase
    .from('health_missions')
    .update({
      progress: clampedProgress,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('id', missionId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  
  return rowToMission(data as HealthMissionRow);
}

/**
 * Busca missões ativas do usuário
 */
export async function getActiveMissions(userId: string): Promise<HealthMission[]> {
  const { data, error } = await supabase
    .from('health_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data as HealthMissionRow[]).map(rowToMission);
}

/**
 * Busca missões completadas do usuário
 */
export async function getCompletedMissions(
  userId: string,
  limit: number = 20
): Promise<HealthMission[]> {
  const { data, error } = await supabase
    .from('health_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return (data as HealthMissionRow[]).map(rowToMission);
}

// =====================================================
// STREAK FUNCTIONS
// =====================================================

/**
 * Busca ou cria o streak do usuário
 */
export async function getOrCreateStreak(userId: string): Promise<HealthStreak> {
  const { data, error } = await supabase
    .from('health_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  if (data) {
    return rowToStreak(data as HealthStreakRow);
  }
  
  // Create new streak record
  const { data: newStreak, error: insertError } = await supabase
    .from('health_streaks')
    .insert({
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      total_xp_earned: 0,
      current_level: 1,
    })
    .select()
    .single();
  
  if (insertError) throw insertError;
  
  return rowToStreak(newStreak as HealthStreakRow);
}

/**
 * Calcula o streak atual baseado nas missões completadas
 * Property 6: current_streak increments for consecutive days
 */
export async function calculateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date | null;
}> {
  const streak = await getOrCreateStreak(userId);
  
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastCompletedDate: streak.lastCompletedDate || null,
  };
}

/**
 * Verifica se todas as missões diárias foram completadas hoje
 */
export async function checkDailyCompletion(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: missions } = await supabase
    .from('health_missions')
    .select('is_completed')
    .eq('user_id', userId)
    .eq('type', 'daily')
    .gte('created_at', today);
  
  if (!missions || missions.length === 0) return false;
  
  return missions.every(m => m.is_completed);
}

/**
 * Atribui bônus de XP por streak
 */
export async function awardBonusXp(
  userId: string,
  streakDays: number
): Promise<{ bonusXp: number; newTotalXp: number }> {
  const bonusXp = calculateStreakBonus(streakDays);
  
  if (bonusXp === 0) {
    const streak = await getOrCreateStreak(userId);
    return { bonusXp: 0, newTotalXp: streak.totalXpEarned };
  }
  
  const { data, error } = await supabase
    .from('health_streaks')
    .update({
      total_xp_earned: supabase.rpc('increment_xp', { amount: bonusXp }),
    })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    // Fallback: get current and update manually
    const streak = await getOrCreateStreak(userId);
    const newTotal = streak.totalXpEarned + bonusXp;
    
    await supabase
      .from('health_streaks')
      .update({
        total_xp_earned: newTotal,
        current_level: calculateLevel(newTotal),
      })
      .eq('user_id', userId);
    
    return { bonusXp, newTotalXp: newTotal };
  }
  
  return {
    bonusXp,
    newTotalXp: (data as HealthStreakRow).total_xp_earned,
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function rowToMission(row: HealthMissionRow): HealthMission {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    type: row.type,
    xpReward: row.xp_reward,
    progress: row.progress,
    isCompleted: row.is_completed,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    relatedExamId: row.related_exam_id || undefined,
    metadata: row.metadata,
    createdAt: new Date(row.created_at),
  };
}

function rowToStreak(row: HealthStreakRow): HealthStreak {
  return {
    id: row.id,
    userId: row.user_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastCompletedDate: row.last_completed_date ? new Date(row.last_completed_date) : undefined,
    totalXpEarned: row.total_xp_earned,
    currentLevel: row.current_level,
    updatedAt: new Date(row.updated_at),
  };
}

// =====================================================
// EXPORTS
// =====================================================

export const gamificationService = {
  // Level functions
  calculateLevel,
  xpToNextLevel,
  xpForLevel,
  getLevelTitle,
  calculateStreakBonus,
  buildHealthLevel,
  
  // Mission functions
  generateDailyMissions,
  completeMission,
  updateMissionProgress,
  getActiveMissions,
  getCompletedMissions,
  
  // Streak functions
  getOrCreateStreak,
  calculateStreak,
  checkDailyCompletion,
  awardBonusXp,
};

export default gamificationService;
