// =====================================================
// BOSS BATTLE SERVICE
// =====================================================
// Sistema de Boss Battles para exames anormais
// Property 7: Boss Battle Trigger from Abnormal Exams
// Agora usa configuração do banco via unifiedGamificationService
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { 
  awardXP as awardUnifiedXP,
  getXPConfig,
} from '@/services/gamification/unifiedGamificationService';
import type { HealthMission, HealthMissionRow } from '@/types/dr-vital-revolution';

// =====================================================
// CONSTANTS (fallbacks - valores do banco têm prioridade)
// =====================================================

const DEFAULT_BOSS_BATTLE_XP_REWARD = 500;
const DEFAULT_BOSS_BATTLE_BONUS_MULTIPLIER = 2;

// Exam types that can trigger boss battles
const ABNORMAL_EXAM_INDICATORS = [
  'attention_needed',
  'abnormal',
  'high',
  'low',
  'critical',
  'fora_do_normal',
  'alterado',
];

// =====================================================
// BOSS BATTLE FUNCTIONS
// =====================================================

/**
 * Cria uma Boss Battle para um exame anormal
 * Property 7: For any exam result marked as "abnormal" or "attention_needed",
 * a boss_battle mission SHALL be created with related_exam_id pointing to that exam.
 * Agora busca XP do banco de configuração
 */
export async function createBossBattle(
  userId: string,
  examId: string,
  examDetails: {
    examName: string;
    abnormalValue: string;
    targetValue: string;
    severity: 'warning' | 'critical';
  }
): Promise<HealthMission> {
  // Check if boss battle already exists for this exam
  const { data: existing } = await supabase
    .from('health_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('related_exam_id', examId)
    .eq('type', 'boss_battle')
    .eq('is_completed', false)
    .single();

  if (existing) {
    return rowToMission(existing as HealthMissionRow);
  }

  // Buscar configuração do banco
  const bossConfig = await getXPConfig('boss_battle_win');
  const baseXP = bossConfig?.base_xp || DEFAULT_BOSS_BATTLE_XP_REWARD;
  
  const xpReward = examDetails.severity === 'critical' 
    ? baseXP * DEFAULT_BOSS_BATTLE_BONUS_MULTIPLIER 
    : baseXP;

  const { data, error } = await supabase
    .from('health_missions')
    .insert({
      user_id: userId,
      title: `🏆 Normalizar ${examDetails.examName}`,
      description: `Seu ${examDetails.examName} está em ${examDetails.abnormalValue}. Meta: ${examDetails.targetValue}`,
      type: 'boss_battle',
      xp_reward: xpReward,
      progress: 0,
      is_completed: false,
      related_exam_id: examId,
      metadata: {
        exam_name: examDetails.examName,
        abnormal_value: examDetails.abnormalValue,
        target_value: examDetails.targetValue,
        severity: examDetails.severity,
        created_reason: 'abnormal_exam_detected',
      },
    })
    .select()
    .single();

  if (error) {
    console.error('[BossBattleService] Error creating boss battle:', error);
    throw error;
  }

  // Create timeline event
  await supabase.rpc('create_timeline_event', {
    p_user_id: userId,
    p_event_type: 'exam_result',
    p_title: `Nova Boss Battle: ${examDetails.examName}`,
    p_description: `Exame detectado com valor anormal. Derrote este boss normalizando seu exame!`,
    p_is_milestone: false,
    p_metadata: { exam_id: examId, boss_battle_id: data.id },
  });

  return rowToMission(data as HealthMissionRow);
}

/**
 * Derrota uma Boss Battle quando o exame normaliza
 * Agora usa sistema unificado para registrar XP
 */
export async function defeatBossBattle(
  userId: string,
  missionId: string
): Promise<{ mission: HealthMission; xpAwarded: number; trophyUnlocked: boolean }> {
  // Get the boss battle
  const { data: mission, error: fetchError } = await supabase
    .from('health_missions')
    .select('*')
    .eq('id', missionId)
    .eq('user_id', userId)
    .eq('type', 'boss_battle')
    .single();

  if (fetchError || !mission) {
    throw new Error('Boss battle not found');
  }

  if (mission.is_completed) {
    throw new Error('Boss battle already defeated');
  }

  // Mark as completed
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

  if (updateError) throw updateError;

  // Registrar XP no sistema unificado
  await awardUnifiedXP(userId, 'boss_battle_win', {
    sourceSystem: 'health',
    sourceId: missionId,
    metadata: {
      missionTitle: mission.title,
      relatedExamId: mission.related_exam_id,
    },
  });

  // Check if this unlocks a trophy achievement
  const { data: bossBattlesWon } = await supabase
    .from('health_missions')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'boss_battle')
    .eq('is_completed', true);

  const totalWon = bossBattlesWon?.length || 0;
  let trophyUnlocked = false;

  // Unlock trophy achievements at milestones
  if (totalWon === 1 || totalWon === 5 || totalWon === 10) {
    const trophyKey = `boss_battle_${totalWon}`;
    const trophyNames: Record<number, string> = {
      1: 'Primeiro Boss Derrotado',
      5: 'Caçador de Bosses',
      10: 'Mestre dos Bosses',
    };

    await supabase
      .from('health_achievements')
      .upsert({
        user_id: userId,
        achievement_key: trophyKey,
        name: trophyNames[totalWon],
        description: `Derrotou ${totalWon} boss battle(s)`,
        icon: 'trophy',
        category: 'milestones',
      }, {
        onConflict: 'user_id,achievement_key',
      });

    trophyUnlocked = true;
  }

  // Create victory timeline event
  await supabase.rpc('create_timeline_event', {
    p_user_id: userId,
    p_event_type: 'achievement',
    p_title: `Boss Derrotado: ${mission.title.replace('🏆 ', '')}`,
    p_description: `Parabéns! Você normalizou seu exame e ganhou ${mission.xp_reward} XP!`,
    p_is_milestone: true,
    p_metadata: { 
      boss_battle_id: missionId, 
      xp_earned: mission.xp_reward,
      trophy_unlocked: trophyUnlocked,
    },
  });

  return {
    mission: rowToMission(updatedMission as HealthMissionRow),
    xpAwarded: mission.xp_reward,
    trophyUnlocked,
  };
}

/**
 * Detecta exames anormais e cria boss battles automaticamente
 */
export async function detectAbnormalExams(userId: string): Promise<HealthMission[]> {
  // Get recent medical exams
  const { data: exams } = await supabase
    .from('medical_exams')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!exams || exams.length === 0) return [];

  const createdBattles: HealthMission[] = [];

  for (const exam of exams) {
    // Check if exam has abnormal indicators
    const analysisText = (exam.analysis_text || '').toLowerCase();
    const status = (exam.status || '').toLowerCase();
    
    const isAbnormal = ABNORMAL_EXAM_INDICATORS.some(
      indicator => analysisText.includes(indicator) || status.includes(indicator)
    );

    if (isAbnormal) {
      // Check if boss battle already exists
      const { data: existingBattle } = await supabase
        .from('health_missions')
        .select('id')
        .eq('user_id', userId)
        .eq('related_exam_id', exam.id)
        .eq('type', 'boss_battle')
        .single();

      if (!existingBattle) {
        try {
          const battle = await createBossBattle(userId, exam.id, {
            examName: exam.exam_type || 'Exame',
            abnormalValue: 'Valor alterado',
            targetValue: 'Valor normal',
            severity: analysisText.includes('critical') ? 'critical' : 'warning',
          });
          createdBattles.push(battle);
        } catch (err) {
          console.error('[BossBattleService] Error creating battle for exam:', exam.id, err);
        }
      }
    }
  }

  return createdBattles;
}

/**
 * Busca boss battles ativas do usuário
 */
export async function getActiveBossBattles(userId: string): Promise<HealthMission[]> {
  const { data, error } = await supabase
    .from('health_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'boss_battle')
    .eq('is_completed', false)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as HealthMissionRow[]).map(rowToMission);
}

/**
 * Busca boss battles derrotadas do usuário
 */
export async function getDefeatedBossBattles(userId: string): Promise<HealthMission[]> {
  const { data, error } = await supabase
    .from('health_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'boss_battle')
    .eq('is_completed', true)
    .order('completed_at', { ascending: false });

  if (error) throw error;

  return (data as HealthMissionRow[]).map(rowToMission);
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

// =====================================================
// EXPORTS
// =====================================================

export const bossBattleService = {
  createBossBattle,
  defeatBossBattle,
  detectAbnormalExams,
  getActiveBossBattles,
  getDefeatedBossBattles,
};

export default bossBattleService;
