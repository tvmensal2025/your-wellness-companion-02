// =====================================================
// GAMIFICATION SERVICE
// =====================================================
// Sistema de gamificação Health Quest
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  HealthMission,
  HealthStreak,
  HealthLevel,
  MissionType,
  HealthMissionRow,
  HealthStreakRow,
} from '@/types/dr-vital-revolution';
import { LEVEL_TITLES, getLevelTitleByGender } from '@/types/dr-vital-revolution';

// Helper to create typed queries for tables not in schema
const fromTable = (tableName: string) => supabase.from(tableName as any);

// =====================================================
// CONSTANTS
// =====================================================

const XP_PER_LEVEL_BASE = 100;
const STREAK_BONUS_THRESHOLD = 7;
const STREAK_BONUS_MULTIPLIER = 10;

// Daily mission templates
const DAILY_MISSION_TEMPLATES = [
  { title: 'Beba 2L de água', description: 'Mantenha-se hidratado durante o dia', xpReward: 50 },
  { title: 'Registre 3 refeições', description: 'Acompanhe sua alimentação', xpReward: 75 },
  { title: 'Faça 30 min de exercício', description: 'Movimente seu corpo', xpReward: 100 },
  { title: 'Durma 7+ horas', description: 'Descanse bem esta noite', xpReward: 75 },
  { title: 'Medite por 10 minutos', description: 'Cuide da sua mente', xpReward: 50 },
];

// =====================================================
// LEVEL CALCULATION FUNCTIONS
// =====================================================

export function calculateLevel(totalXp: number): number {
  if (totalXp < 0) return 1;
  return Math.floor(Math.sqrt(totalXp / XP_PER_LEVEL_BASE)) + 1;
}

export function xpToNextLevel(currentLevel: number, totalXp: number): number {
  const xpForNextLevel = currentLevel * currentLevel * XP_PER_LEVEL_BASE;
  return Math.max(0, xpForNextLevel - totalXp);
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * (level - 1) * XP_PER_LEVEL_BASE;
}

export function getLevelTitle(level: number, gender?: string | null): string {
  if (gender) return getLevelTitleByGender(level, gender);
  if (level >= 10) return LEVEL_TITLES[10];
  return LEVEL_TITLES[level] || LEVEL_TITLES[1];
}

export function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= STREAK_BONUS_THRESHOLD) {
    return streakDays * STREAK_BONUS_MULTIPLIER;
  }
  return 0;
}

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
  if (level >= 5) features.push('Avatar Customizável');
  if (level >= 10) features.push('Acesso VIP');
  return features;
}

// =====================================================
// MISSION FUNCTIONS
// =====================================================

export async function generateDailyMissions(userId: string): Promise<HealthMission[]> {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const { data: existingMissions } = await fromTable('health_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'daily')
    .gte('created_at', new Date().toISOString().split('T')[0])
    .limit(10) as unknown as { data: HealthMissionRow[] | null };
  
  if (existingMissions && existingMissions.length > 0) {
    return existingMissions.map(rowToMission);
  }
  
  const shuffled = [...DAILY_MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
  const selectedMissions = shuffled.slice(0, 3);
  
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
  
  const { data: newMissions, error } = await fromTable('health_missions')
    .insert(missionsToInsert)
    .select() as unknown as { data: HealthMissionRow[] | null; error: any };
  
  if (error) throw error;
  return (newMissions || []).map(rowToMission);
}

export async function completeMission(
  userId: string,
  missionId: string
): Promise<{ mission: HealthMission; xpAwarded: number; levelUp: boolean }> {
  const { data: mission } = await fromTable('health_missions')
    .select('*')
    .eq('id', missionId)
    .eq('user_id', userId)
    .single() as unknown as { data: HealthMissionRow | null };
  
  if (!mission) throw new Error('Mission not found');
  if (mission.is_completed) throw new Error('Mission already completed');
  
  const { data: streakData } = await fromTable('health_streaks')
    .select('*')
    .eq('user_id', userId)
    .single() as unknown as { data: HealthStreakRow | null };
  
  const currentLevel = streakData?.current_level || 1;
  
  const { data: updatedMission } = await fromTable('health_missions')
    .update({ is_completed: true, progress: 100, completed_at: new Date().toISOString() })
    .eq('id', missionId)
    .select()
    .single() as unknown as { data: HealthMissionRow | null };
  
  const { data: newStreakData } = await fromTable('health_streaks')
    .select('*')
    .eq('user_id', userId)
    .single() as unknown as { data: HealthStreakRow | null };
  
  return {
    mission: rowToMission(updatedMission as HealthMissionRow),
    xpAwarded: mission.xp_reward,
    levelUp: (newStreakData?.current_level || 1) > currentLevel,
  };
}

export async function getActiveMissions(userId: string): Promise<HealthMission[]> {
  const { data } = await fromTable('health_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('created_at', { ascending: false })
    .limit(50) as unknown as { data: HealthMissionRow[] | null };
  
  return (data || []).map(rowToMission);
}

export async function getCompletedMissions(userId: string, limit = 20): Promise<HealthMission[]> {
  const { data } = await fromTable('health_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(limit) as unknown as { data: HealthMissionRow[] | null };
  
  return (data || []).map(rowToMission);
}

// =====================================================
// STREAK FUNCTIONS
// =====================================================

export async function getOrCreateStreak(userId: string): Promise<HealthStreak> {
  const { data, error } = await fromTable('health_streaks')
    .select('*')
    .eq('user_id', userId)
    .single() as unknown as { data: HealthStreakRow | null; error: any };
  
  if (data) return rowToStreak(data);
  
  const { data: newStreak } = await fromTable('health_streaks')
    .insert({ user_id: userId, current_streak: 0, longest_streak: 0, total_xp_earned: 0, current_level: 1 })
    .select()
    .single() as unknown as { data: HealthStreakRow | null };
  
  return rowToStreak(newStreak as HealthStreakRow);
}

export async function calculateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number; lastCompletedDate: Date | null }> {
  const streak = await getOrCreateStreak(userId);
  return { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, lastCompletedDate: streak.lastCompletedDate || null };
}

export async function checkDailyCompletion(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const { data: missions } = await fromTable('health_missions')
    .select('is_completed')
    .eq('user_id', userId)
    .eq('type', 'daily')
    .gte('created_at', today)
    .limit(10) as unknown as { data: { is_completed: boolean }[] | null };
  
  if (!missions || missions.length === 0) return false;
  return missions.every(m => m.is_completed);
}

export async function awardBonusXp(userId: string, streakDays: number): Promise<{ bonusXp: number; newTotalXp: number }> {
  const bonusXp = calculateStreakBonus(streakDays);
  const streak = await getOrCreateStreak(userId);
  if (bonusXp === 0) return { bonusXp: 0, newTotalXp: streak.totalXpEarned };
  
  const newTotal = streak.totalXpEarned + bonusXp;
  await fromTable('health_streaks')
    .update({ total_xp_earned: newTotal, current_level: calculateLevel(newTotal) })
    .eq('user_id', userId);
  
  return { bonusXp, newTotalXp: newTotal };
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

export const gamificationService = {
  calculateLevel, xpToNextLevel, xpForLevel, getLevelTitle, calculateStreakBonus, buildHealthLevel,
  generateDailyMissions, completeMission, getActiveMissions, getCompletedMissions,
  getOrCreateStreak, calculateStreak, checkDailyCompletion, awardBonusXp,
};

export default gamificationService;