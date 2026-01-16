/**
 * VPS Notifications - Sistema centralizado de notificações via WhatsApp
 * Todas as notificações são enfileiradas e processadas pelo VPS Node.js
 */

import { supabase } from '@/integrations/supabase/client';

export type NotificationCategory = 
  | 'general' 
  | 'dr_vital' 
  | 'exercise' 
  | 'community' 
  | 'water' 
  | 'weight' 
  | 'achievement'
  | 'session'
  | 'reminder'
  | 'tip'
  | 'health'
  | 'alert'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface QueueNotificationOptions {
  userId: string;
  type: string;
  category: NotificationCategory;
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  priority?: NotificationPriority;
  scheduledFor?: Date;
}

/**
 * Enfileira uma notificação para ser enviada via WhatsApp pelo VPS
 * Insere diretamente na tabela unificada - o VPS processa via cron
 */
export async function queueNotification(options: QueueNotificationOptions): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('notification_queue_unified')
      .insert([{
        user_id: options.userId,
        notification_type: options.type,
        category: options.category,
        title: options.title,
        body: options.body,
        action_url: options.actionUrl,
        metadata: options.metadata || {},
        priority: options.priority || 'medium',
        scheduled_for: options.scheduledFor?.toISOString() || new Date().toISOString(),
        status: 'pending',
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao enfileirar notificação:', error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('Erro ao enfileirar notificação:', err);
    return null;
  }
}

// ===================================================
// WRAPPERS CONVENIENTES POR CATEGORIA
// ===================================================

// Conquistas
export const notifyAchievement = (userId: string, achievement: string, xpReward?: number) =>
  queueNotification({
    userId,
    type: 'achievement_unlocked',
    category: 'achievement',
    title: '🏆 Conquista Desbloqueada!',
    body: `Parabéns! ${achievement}${xpReward ? ` (+${xpReward} XP)` : ''}`,
    actionUrl: '/achievements',
    priority: 'high',
    metadata: { achievement, xpReward },
  });

// Água
export const notifyWaterReminder = (userId: string, currentMl: number, goalMl: number) =>
  queueNotification({
    userId,
    type: 'water_reminder',
    category: 'water',
    title: '💧 Hora de hidratar!',
    body: `Você bebeu ${currentMl}ml. Meta: ${goalMl}ml. Bora beber mais água!`,
    priority: 'medium',
    metadata: { currentMl, goalMl },
  });

// Peso
export const notifyWeightReminder = (userId: string, lastWeight?: number, daysSince?: number) =>
  queueNotification({
    userId,
    type: 'weight_reminder',
    category: 'weight',
    title: '⚖️ Hora de se pesar!',
    body: daysSince 
      ? `Faz ${daysSince} dias desde sua última pesagem${lastWeight ? ` (${lastWeight}kg)` : ''}.`
      : 'Que tal registrar seu peso hoje?',
    priority: 'medium',
    metadata: { lastWeight, daysSince },
  });

// Sessões
export const notifyNewSession = (userId: string, sessionTitle: string) =>
  queueNotification({
    userId,
    type: 'new_session',
    category: 'session',
    title: '🧘 Nova Sessão Disponível!',
    body: `${sessionTitle} está disponível para você!`,
    actionUrl: '/sessions',
    priority: 'medium',
    metadata: { sessionTitle },
  });

// Dr. Vital - Morning Briefing
export const notifyMorningBriefing = (userId: string, missions: string[]) =>
  queueNotification({
    userId,
    type: 'morning_briefing',
    category: 'dr_vital',
    title: '☀️ Bom dia! Suas missões de hoje',
    body: missions.length > 0 
      ? `📋 ${missions.slice(0, 3).join(' • ')}${missions.length > 3 ? ` (+${missions.length - 3} mais)` : ''}`
      : 'Confira suas missões do dia no app!',
    actionUrl: '/dr-vital',
    priority: 'medium',
    metadata: { missions },
  });

// Dr. Vital - Medication Reminder
export const notifyMedicationReminder = (userId: string, medication: { name: string; dosage: string }) =>
  queueNotification({
    userId,
    type: 'medication_reminder',
    category: 'dr_vital',
    title: `💊 Hora do ${medication.name}`,
    body: `Lembre-se de tomar ${medication.dosage} de ${medication.name}.`,
    priority: 'high',
    metadata: { medication },
  });

// Dr. Vital - Level Up
export const notifyLevelUp = (userId: string, newLevel: number, levelTitle: string) =>
  queueNotification({
    userId,
    type: 'level_up',
    category: 'dr_vital',
    title: '⬆️ Você subiu de nível!',
    body: `Incrível! Você alcançou o nível ${newLevel}: ${levelTitle}!`,
    actionUrl: '/dr-vital',
    priority: 'high',
    metadata: { newLevel, levelTitle },
  });

// Dr. Vital - Streak
export const notifyStreakMilestone = (userId: string, streakDays: number) =>
  queueNotification({
    userId,
    type: 'streak_milestone',
    category: 'dr_vital',
    title: '🔥 Streak Incrível!',
    body: `Você está em uma sequência de ${streakDays} dias! Continue assim!`,
    actionUrl: '/dr-vital',
    priority: 'medium',
    metadata: { streakDays },
  });

// Dr. Vital - Weekly Report
export const notifyWeeklyReport = (userId: string) =>
  queueNotification({
    userId,
    type: 'weekly_report',
    category: 'dr_vital',
    title: '📊 Seu relatório semanal está pronto!',
    body: 'Veja como foi sua semana de saúde.',
    actionUrl: '/dr-vital?tab=reports',
    priority: 'low',
  });

// Dr. Vital - Re-engagement
export const notifyReEngagement = (userId: string, daysSince: number) =>
  queueNotification({
    userId,
    type: 're_engagement',
    category: 'dr_vital',
    title: '🌟 Sentimos sua falta!',
    body: `Faz ${daysSince} dias que você não completa uma missão. Vamos voltar?`,
    actionUrl: '/dr-vital',
    priority: 'medium',
    metadata: { daysSince },
  });

// Exercícios - Streak
export const notifyExerciseStreak = (userId: string, streakDays: number) =>
  queueNotification({
    userId,
    type: 'exercise_streak',
    category: 'exercise',
    title: '🔥 Streak de Treino!',
    body: `${streakDays} dias seguidos de treino! Você está imparável!`,
    actionUrl: '/exercise',
    priority: 'medium',
    metadata: { streakDays },
  });

// Exercícios - Workout Reminder
export const notifyWorkoutReminder = (userId: string) =>
  queueNotification({
    userId,
    type: 'workout_reminder',
    category: 'exercise',
    title: '💪 Hora de Treinar!',
    body: 'Seu corpo está pronto para mais um treino! Vamos lá?',
    actionUrl: '/exercise',
    priority: 'medium',
  });

// Exercícios - Recovery
export const notifyRecoveryDay = (userId: string) =>
  queueNotification({
    userId,
    type: 'recovery_reminder',
    category: 'exercise',
    title: '🧘 Dia de Recuperação',
    body: 'Hora de descansar! Seu corpo precisa recuperar para crescer.',
    priority: 'low',
  });

// Exercícios - Injury Alert
export const notifyInjuryRisk = (userId: string, riskLevel: 'moderate' | 'high' | 'critical', bodyRegion?: string) =>
  queueNotification({
    userId,
    type: 'injury_risk',
    category: 'exercise',
    title: riskLevel === 'critical' ? '🆘 URGENTE: Risco Crítico' : riskLevel === 'high' ? '🚨 Alerta: Risco Alto' : '⚠️ Atenção: Risco Moderado',
    body: riskLevel === 'critical'
      ? `PARE o treino imediatamente! Risco crítico${bodyRegion ? ` em ${bodyRegion}` : ''}.`
      : `Detectamos sinais de fadiga${bodyRegion ? ` em ${bodyRegion}` : ''}. Considere descansar.`,
    priority: riskLevel === 'critical' ? 'critical' : 'high',
    metadata: { riskLevel, bodyRegion },
  });

// Comunidade - Like
export const notifyNewLike = (userId: string, actorName: string, postPreview: string) =>
  queueNotification({
    userId,
    type: 'new_like',
    category: 'community',
    title: '❤️ Nova curtida!',
    body: `${actorName} curtiu seu post: "${postPreview.slice(0, 50)}..."`,
    actionUrl: '/community',
    priority: 'low',
    metadata: { actorName, postPreview },
  });

// Comunidade - Comment
export const notifyNewComment = (userId: string, actorName: string, commentPreview: string) =>
  queueNotification({
    userId,
    type: 'new_comment',
    category: 'community',
    title: '💬 Novo comentário!',
    body: `${actorName}: "${commentPreview.slice(0, 50)}..."`,
    actionUrl: '/community',
    priority: 'medium',
    metadata: { actorName, commentPreview },
  });

// Comunidade - Follow
export const notifyNewFollower = (userId: string, actorName: string) =>
  queueNotification({
    userId,
    type: 'new_follower',
    category: 'community',
    title: '👥 Novo seguidor!',
    body: `${actorName} começou a te seguir!`,
    actionUrl: '/community',
    priority: 'low',
    metadata: { actorName },
  });

// Comunidade - Challenge Invite
export const notifyChallengeInvite = (userId: string, challengeTitle: string, inviterName: string) =>
  queueNotification({
    userId,
    type: 'challenge_invite',
    category: 'community',
    title: '🎯 Convite para Desafio!',
    body: `${inviterName} te convidou para "${challengeTitle}"`,
    actionUrl: '/challenges',
    priority: 'high',
    metadata: { challengeTitle, inviterName },
  });

// Dica da Sofia
export const notifyTip = (userId: string, tip: string) =>
  queueNotification({
    userId,
    type: 'sofia_tip',
    category: 'tip',
    title: '💡 Dica da Sofia',
    body: tip,
    priority: 'low',
  });

// Alerta de Saúde
export const notifyHealthAlert = (userId: string, message: string) =>
  queueNotification({
    userId,
    type: 'health_alert',
    category: 'health',
    title: '❤️ Alerta de Saúde',
    body: message,
    priority: 'high',
  });

// Sistema
export const notifySystem = (userId: string, title: string, message: string, actionUrl?: string) =>
  queueNotification({
    userId,
    type: 'system',
    category: 'system',
    title: `🔔 ${title}`,
    body: message,
    actionUrl,
    priority: 'medium',
  });

// Lembrete genérico
export const notifyReminder = (userId: string, title: string, message: string) =>
  queueNotification({
    userId,
    type: 'reminder',
    category: 'reminder',
    title: `⏰ ${title}`,
    body: message,
    priority: 'medium',
  });

// ===================================================
// FUNÇÕES DE LEITURA (para UI)
// ===================================================

/**
 * Buscar notificações do usuário da tabela unificada
 */
export async function getNotifications(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('notification_queue_unified')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }

  return data || [];
}

/**
 * Contar notificações não lidas
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notification_queue_unified')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'read');

  if (error) {
    console.error('Erro ao contar notificações:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Marcar notificação como lida
 */
export async function markAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notification_queue_unified')
    .update({ 
      status: 'read',
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId);

  if (error) {
    console.error('Erro ao marcar como lida:', error);
  }
}

/**
 * Marcar todas como lidas
 */
export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from('notification_queue_unified')
    .update({ 
      status: 'read',
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .neq('status', 'read');

  if (error) {
    console.error('Erro ao marcar todas como lidas:', error);
  }
}

/**
 * Deletar notificação
 */
export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from('notification_queue_unified')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Erro ao deletar notificação:', error);
  }
}
