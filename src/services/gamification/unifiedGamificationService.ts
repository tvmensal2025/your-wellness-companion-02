/**
 * 🎮 UNIFIED GAMIFICATION SERVICE
 * 
 * Serviço centralizado que usa a tabela points_configuration do banco.
 * Substitui valores hardcoded por configuração dinâmica.
 * Implementa limites anti-exploit.
 */

import { supabase } from '@/integrations/supabase/client';
import { fromTable, callRpc } from '@/lib/supabase-helpers';

// ═══════════════════════════════════════════════════════════
// 📋 TIPOS
// ═══════════════════════════════════════════════════════════

export interface XPConfig {
  action_type: string;
  action_name: string;
  points: number;
  base_xp: number;
  multiplier: number;
  max_daily: number | null;
  icon: string;
  category: string;
  is_active: boolean;
}

export interface AwardResult {
  success: boolean;
  xp_earned: number;
  points_earned: number;
  new_total?: number;
  new_level?: number;
  action_name?: string;
  icon?: string;
  reason?: string;
  current_count?: number;
  max_count?: number;
}

export interface UserXPStats {
  total_points: number;
  level: number;
  xp_to_next_level: number;
  today_xp: number;
  week_xp: number;
  month_xp: number;
}

export interface DailyLimit {
  action_type: string;
  current_count: number;
  max_count: number | null;
  total_xp_today: number;
}

// Cache local para configurações (evita queries repetidas)
const configCache = new Map<string, { config: XPConfig; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// ═══════════════════════════════════════════════════════════
// 🔧 FUNÇÕES DE CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════

/**
 * Busca configuração de XP para uma ação específica
 * Usa cache local para evitar queries repetidas
 */
export async function getXPConfig(actionType: string): Promise<XPConfig | null> {
  // Verificar cache
  const cached = configCache.get(actionType);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.config;
  }

  const { data, error } = await callRpc('get_xp_config', {
    p_action_type: actionType,
  });

  if (error || !data) {
    console.warn(`[UnifiedGamification] Config not found for: ${actionType}`);
    return null;
  }

  const config = data as unknown as XPConfig;
  
  // Atualizar cache
  configCache.set(actionType, { config, timestamp: Date.now() });
  
  return config;
}

/**
 * Busca todas as configurações de XP (para admin)
 */
export async function getAllXPConfigs(): Promise<XPConfig[]> {
  const { data, error } = await callRpc('get_all_xp_configs');

  if (error) {
    console.error('[UnifiedGamification] Error fetching configs:', error);
    return [];
  }

  return (data || []) as unknown as XPConfig[];
}

/**
 * Atualiza configuração de XP (admin only)
 */
export async function updateXPConfig(
  actionType: string,
  updates: Partial<Pick<XPConfig, 'points' | 'base_xp' | 'max_daily' | 'multiplier' | 'is_active'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('points_configuration')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('action_type', actionType);

  if (error) {
    console.error('[UnifiedGamification] Error updating config:', error);
    return false;
  }

  // Invalidar cache
  configCache.delete(actionType);
  
  return true;
}

// ═══════════════════════════════════════════════════════════
// 🎯 FUNÇÕES DE CONCESSÃO DE XP
// ═══════════════════════════════════════════════════════════

/**
 * Concede XP de forma unificada usando a configuração do banco
 * Verifica limites diários automaticamente
 */
export async function awardXP(
  userId: string,
  actionType: string,
  options?: {
    sourceSystem?: 'exercise' | 'health' | 'social' | 'challenge';
    sourceId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<AwardResult> {
  const { data, error } = await callRpc('award_unified_xp', {
    p_user_id: userId,
    p_action_type: actionType,
    p_source_system: options?.sourceSystem || null,
    p_source_id: options?.sourceId || null,
    p_metadata: options?.metadata || {},
  });

  if (error) {
    console.error('[UnifiedGamification] Error awarding XP:', error);
    return {
      success: false,
      xp_earned: 0,
      points_earned: 0,
      reason: error.message,
    };
  }

  return data as unknown as AwardResult;
}

/**
 * Concede XP com valor customizado (para casos especiais)
 * Ainda respeita limites diários
 */
export async function awardCustomXP(
  userId: string,
  actionType: string,
  customXP: number,
  customPoints: number,
  options?: {
    sourceSystem?: string;
    sourceId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<AwardResult> {
  // Verificar limite diário primeiro
  const { data: limitCheck } = await callRpc('check_and_increment_daily_limit', {
    p_user_id: userId,
    p_action_type: actionType,
    p_xp_to_add: customXP,
    p_points_to_add: customPoints,
  });

  const result = limitCheck as any;
  if (!result?.can_award) {
    return {
      success: false,
      xp_earned: 0,
      points_earned: 0,
      reason: result?.reason || 'daily_limit_reached',
      current_count: result?.current_count,
      max_count: result?.max_count,
    };
  }

  // Registrar no histórico
  await (fromTable('unified_xp_history') as any).insert({
    user_id: userId,
    action_type: actionType,
    xp_earned: customXP,
    points_earned: customPoints,
    multiplier: 1.0,
    source_system: options?.sourceSystem,
    source_id: options?.sourceId,
    metadata: options?.metadata || {},
  });

  // Atualizar user_points
  const { data: currentPoints } = await supabase
    .from('user_points')
    .select('total_points')
    .eq('user_id', userId)
    .maybeSingle();

  const newTotal = (currentPoints?.total_points || 0) + customPoints;
  const newLevel = Math.floor(Math.sqrt(newTotal / 100)) + 1;

  await supabase.from('user_points').upsert({
    user_id: userId,
    total_points: newTotal,
    level: newLevel,
    last_activity_date: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  return {
    success: true,
    xp_earned: customXP,
    points_earned: customPoints,
    new_total: newTotal,
    new_level: newLevel,
  };
}

// ═══════════════════════════════════════════════════════════
// 📊 FUNÇÕES DE ESTATÍSTICAS
// ═══════════════════════════════════════════════════════════

/**
 * Busca estatísticas de XP do usuário
 */
export async function getUserXPStats(userId: string): Promise<UserXPStats> {
  const { data, error } = await callRpc('get_user_xp_stats', {
    p_user_id: userId,
  });

  if (error || !data) {
    return {
      total_points: 0,
      level: 1,
      xp_to_next_level: 100,
      today_xp: 0,
      week_xp: 0,
      month_xp: 0,
    };
  }

  return data as unknown as UserXPStats;
}

/**
 * Busca limites diários do usuário
 */
export async function getUserDailyLimits(userId: string): Promise<DailyLimit[]> {
  const { data: limits } = await (fromTable('user_daily_xp_limits') as any)
    .select('action_type, count, total_xp')
    .eq('user_id', userId)
    .eq('date', new Date().toISOString().split('T')[0]);

  const { data: configs } = await supabase
    .from('points_configuration')
    .select('action_type, max_daily')
    .eq('is_active', true);

  const configMap = new Map(configs?.map(c => [c.action_type, c.max_daily]) || []);

  return ((limits || []) as any[]).map(l => ({
    action_type: l.action_type,
    current_count: l.count,
    max_count: configMap.get(l.action_type) || null,
    total_xp_today: l.total_xp,
  }));
}

/**
 * Busca histórico de XP recente
 */
export async function getXPHistory(
  userId: string,
  limit: number = 20
): Promise<Array<{
  action_type: string;
  xp_earned: number;
  points_earned: number;
  created_at: string;
  source_system: string | null;
}>> {
  const { data } = await (fromTable('unified_xp_history') as any)
    .select('action_type, xp_earned, points_earned, created_at, source_system')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data || []) as any[];
}

// ═══════════════════════════════════════════════════════════
// 🔢 FUNÇÕES DE CÁLCULO DE NÍVEL
// ═══════════════════════════════════════════════════════════

/**
 * Calcula nível baseado em pontos totais
 * Fórmula: level = floor(sqrt(points / 100)) + 1
 */
export function calculateLevel(totalPoints: number): number {
  if (totalPoints < 0) return 1;
  return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
}

/**
 * Calcula XP necessário para próximo nível
 */
export function xpToNextLevel(currentLevel: number, totalPoints: number): number {
  const xpForNextLevel = currentLevel * currentLevel * 100;
  return Math.max(0, xpForNextLevel - totalPoints);
}

/**
 * Calcula XP total necessário para um nível específico
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * (level - 1) * 100;
}

/**
 * Calcula progresso percentual no nível atual
 */
export function levelProgress(totalPoints: number): number {
  const level = calculateLevel(totalPoints);
  const xpForCurrent = xpForLevel(level);
  const xpForNext = xpForLevel(level + 1);
  const range = xpForNext - xpForCurrent;
  
  if (range === 0) return 100;
  
  const progress = totalPoints - xpForCurrent;
  return Math.round((progress / range) * 100);
}

// ═══════════════════════════════════════════════════════════
// 🏷️ NOMES DE NÍVEIS
// ═══════════════════════════════════════════════════════════

const LEVEL_NAMES: Record<number, { masc: string; fem: string; icon: string }> = {
  1: { masc: 'Novato', fem: 'Novata', icon: '🌱' },
  2: { masc: 'Iniciante', fem: 'Iniciante', icon: '🌿' },
  3: { masc: 'Aprendiz', fem: 'Aprendiz', icon: '🌳' },
  4: { masc: 'Praticante', fem: 'Praticante', icon: '⭐' },
  5: { masc: 'Dedicado', fem: 'Dedicada', icon: '🌟' },
  6: { masc: 'Avançado', fem: 'Avançada', icon: '💫' },
  7: { masc: 'Expert', fem: 'Expert', icon: '🔥' },
  8: { masc: 'Mestre', fem: 'Mestra', icon: '👑' },
  9: { masc: 'Lenda', fem: 'Lenda', icon: '💎' },
  10: { masc: 'Diamante', fem: 'Diamante', icon: '💠' },
};

export function getLevelName(level: number, gender?: 'masc' | 'fem'): string {
  const cappedLevel = Math.min(Math.max(level, 1), 10);
  const names = LEVEL_NAMES[cappedLevel] || LEVEL_NAMES[1];
  return gender === 'fem' ? names.fem : names.masc;
}

export function getLevelIcon(level: number): string {
  const cappedLevel = Math.min(Math.max(level, 1), 10);
  return LEVEL_NAMES[cappedLevel]?.icon || '🌱';
}

// ═══════════════════════════════════════════════════════════
// 🔄 FUNÇÕES DE MIGRAÇÃO/COMPATIBILIDADE
// ═══════════════════════════════════════════════════════════

/**
 * Mapeia action types antigos para novos
 */
const ACTION_TYPE_MAP: Record<string, string> = {
  // Exercise
  'workout_complete': 'workout_complete',
  'exercise_complete': 'exercise_complete',
  'personal_record': 'personal_record',
  
  // Health
  'water_goal': 'water_goal',
  'meal_logged': 'meal_logged',
  'sleep_goal': 'sleep_goal',
  'steps_goal': 'steps_goal',
  'boss_battle': 'boss_battle_win',
  
  // Social
  'comment': 'comment',
  'like': 'like',
  'share': 'share_post',
  
  // Challenges
  'challenge_join': 'challenge_join',
  'challenge_complete': 'challenge_complete',
  'duel_win': 'duel_win',
  
  // Daily
  'daily_session': 'daily_session',
  'mission_complete': 'mission_complete',
  'daily_checkin': 'daily_checkin',
  
  // Bonus
  'streak_7': 'streak_bonus_7',
  'streak_30': 'streak_bonus_30',
  'first_login': 'first_login',
  'profile_complete': 'profile_complete',
};

/**
 * Normaliza action type para o formato do banco
 */
export function normalizeActionType(actionType: string): string {
  return ACTION_TYPE_MAP[actionType] || actionType;
}

// ═══════════════════════════════════════════════════════════
// 📤 EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════

export const unifiedGamificationService = {
  // Config
  getXPConfig,
  getAllXPConfigs,
  updateXPConfig,
  
  // Award
  awardXP,
  awardCustomXP,
  
  // Stats
  getUserXPStats,
  getUserDailyLimits,
  getXPHistory,
  
  // Level calculations
  calculateLevel,
  xpToNextLevel,
  xpForLevel,
  levelProgress,
  getLevelName,
  getLevelIcon,
  
  // Utils
  normalizeActionType,
};

export default unifiedGamificationService;
