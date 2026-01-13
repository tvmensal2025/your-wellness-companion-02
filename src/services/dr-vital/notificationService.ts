// =====================================================
// NOTIFICATION SERVICE - Dr. Vital
// =====================================================
// Sistema de notificações inteligentes
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  SmartNotification,
  NotificationType,
  NotificationPriority,
  NotificationQueueRow,
} from '@/types/dr-vital-revolution';

// =====================================================
// CONSTANTS
// =====================================================

const MORNING_BRIEFING_HOUR = 8;
const INACTIVITY_THRESHOLD_DAYS = 3;
const WEEKLY_REPORT_DAY = 0; // Sunday

// =====================================================
// NOTIFICATION SCHEDULING
// =====================================================

/**
 * Agenda briefing matinal para o usuário
 */
export async function scheduleMorningBriefing(userId: string): Promise<SmartNotification> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(MORNING_BRIEFING_HOUR, 0, 0, 0);

  const notification = {
    user_id: userId,
    notification_type: 'morning_briefing' as NotificationType,
    title: '☀️ Bom dia! Seu resumo de saúde',
    body: 'Confira suas missões do dia e acompanhe seu progresso de saúde.',
    priority: 'medium' as NotificationPriority,
    scheduled_for: tomorrow.toISOString(),
    action_url: '/dr-vital',
    metadata: { type: 'daily_briefing' },
  };

  const { data, error } = await supabase
    .from('notification_queue')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  return rowToNotification(data as NotificationQueueRow);
}

/**
 * Agenda lembrete de medicamento
 */
export async function scheduleMedicationReminder(
  userId: string,
  medication: { name: string; time: string; dosage: string }
): Promise<SmartNotification> {
  const [hours, minutes] = medication.time.split(':').map(Number);
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  // Se já passou, agenda para amanhã
  if (scheduledTime < new Date()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const notification = {
    user_id: userId,
    notification_type: 'medication_reminder' as NotificationType,
    title: `💊 Hora do ${medication.name}`,
    body: `Lembre-se de tomar ${medication.dosage} de ${medication.name}.`,
    priority: 'high' as NotificationPriority,
    scheduled_for: scheduledTime.toISOString(),
    metadata: { medication },
  };

  const { data, error } = await supabase
    .from('notification_queue')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  return rowToNotification(data as NotificationQueueRow);
}

/**
 * Detecta inatividade e agenda re-engajamento
 */
export async function detectInactivity(userId: string): Promise<{
  isInactive: boolean;
  daysSinceLastActivity: number;
  notification?: SmartNotification;
}> {
  // Buscar última atividade
  const { data: lastActivity } = await supabase
    .from('health_missions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (!lastActivity?.completed_at) {
    return { isInactive: true, daysSinceLastActivity: 999 };
  }

  const lastDate = new Date(lastActivity.completed_at);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince >= INACTIVITY_THRESHOLD_DAYS) {
    // Agendar notificação de re-engajamento
    const notification = {
      user_id: userId,
      notification_type: 're_engagement' as NotificationType,
      title: '🌟 Sentimos sua falta!',
      body: `Faz ${daysSince} dias que você não completa uma missão. Volte e mantenha seu streak!`,
      priority: 'medium' as NotificationPriority,
      scheduled_for: new Date().toISOString(),
      action_url: '/dr-vital',
      metadata: { daysSinceLastActivity: daysSince },
    };

    const { data, error } = await supabase
      .from('notification_queue')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;

    return {
      isInactive: true,
      daysSinceLastActivity: daysSince,
      notification: rowToNotification(data as NotificationQueueRow),
    };
  }

  return { isInactive: false, daysSinceLastActivity: daysSince };
}

/**
 * Agenda relatório semanal
 */
export async function scheduleWeeklyReport(userId: string): Promise<SmartNotification> {
  const nextSunday = new Date();
  const daysUntilSunday = (7 - nextSunday.getDay()) % 7 || 7;
  nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
  nextSunday.setHours(10, 0, 0, 0);

  const notification = {
    user_id: userId,
    notification_type: 'weekly_report' as NotificationType,
    title: '📊 Seu relatório semanal está pronto!',
    body: 'Veja como foi sua semana de saúde e descubra insights personalizados.',
    priority: 'low' as NotificationPriority,
    scheduled_for: nextSunday.toISOString(),
    action_url: '/dr-vital?tab=reports',
    metadata: { reportType: 'weekly' },
  };

  const { data, error } = await supabase
    .from('notification_queue')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  return rowToNotification(data as NotificationQueueRow);
}

// =====================================================
// NOTIFICATION MANAGEMENT
// =====================================================

/**
 * Busca notificações pendentes do usuário
 */
export async function getPendingNotifications(userId: string): Promise<SmartNotification[]> {
  const { data, error } = await supabase
    .from('notification_queue')
    .select('*')
    .eq('user_id', userId)
    .is('sent_at', null)
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: false })
    .order('scheduled_for', { ascending: true });

  if (error) throw error;

  return (data as NotificationQueueRow[]).map(rowToNotification);
}

/**
 * Busca histórico de notificações
 */
export async function getNotificationHistory(
  userId: string,
  limit: number = 20
): Promise<SmartNotification[]> {
  const { data, error } = await supabase
    .from('notification_queue')
    .select('*')
    .eq('user_id', userId)
    .not('sent_at', 'is', null)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as NotificationQueueRow[]).map(rowToNotification);
}

/**
 * Marca notificação como enviada
 */
export async function markAsSent(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notification_queue')
    .update({ sent_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * Marca notificação como lida
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notification_queue')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * Cria notificação de achievement desbloqueado
 */
export async function notifyAchievementUnlocked(
  userId: string,
  achievementName: string,
  xpReward: number
): Promise<SmartNotification> {
  const notification = {
    user_id: userId,
    notification_type: 'achievement_unlocked' as NotificationType,
    title: '🏆 Conquista Desbloqueada!',
    body: `Parabéns! Você desbloqueou "${achievementName}" e ganhou ${xpReward} XP!`,
    priority: 'high' as NotificationPriority,
    scheduled_for: new Date().toISOString(),
    action_url: '/dr-vital?tab=achievements',
    metadata: { achievementName, xpReward },
  };

  const { data, error } = await supabase
    .from('notification_queue')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  return rowToNotification(data as NotificationQueueRow);
}

/**
 * Cria notificação de level up
 */
export async function notifyLevelUp(
  userId: string,
  newLevel: number,
  levelTitle: string
): Promise<SmartNotification> {
  const notification = {
    user_id: userId,
    notification_type: 'level_up' as NotificationType,
    title: '⬆️ Você subiu de nível!',
    body: `Incrível! Você alcançou o nível ${newLevel}: ${levelTitle}!`,
    priority: 'high' as NotificationPriority,
    scheduled_for: new Date().toISOString(),
    action_url: '/dr-vital',
    metadata: { newLevel, levelTitle },
  };

  const { data, error } = await supabase
    .from('notification_queue')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  return rowToNotification(data as NotificationQueueRow);
}

/**
 * Cria notificação de streak milestone
 */
export async function notifyStreakMilestone(
  userId: string,
  streakDays: number
): Promise<SmartNotification> {
  const notification = {
    user_id: userId,
    notification_type: 'streak_milestone' as NotificationType,
    title: '🔥 Streak Incrível!',
    body: `Você está em uma sequência de ${streakDays} dias! Continue assim!`,
    priority: 'medium' as NotificationPriority,
    scheduled_for: new Date().toISOString(),
    action_url: '/dr-vital',
    metadata: { streakDays },
  };

  const { data, error } = await supabase
    .from('notification_queue')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  return rowToNotification(data as NotificationQueueRow);
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function rowToNotification(row: NotificationQueueRow): SmartNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.notification_type,
    title: row.title,
    body: row.body,
    priority: row.priority,
    scheduledFor: new Date(row.scheduled_for),
    sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
    readAt: row.read_at ? new Date(row.read_at) : undefined,
    actionUrl: row.action_url || undefined,
    metadata: row.metadata,
    createdAt: new Date(row.created_at),
  };
}

// =====================================================
// EXPORTS
// =====================================================

export const notificationService = {
  scheduleMorningBriefing,
  scheduleMedicationReminder,
  detectInactivity,
  scheduleWeeklyReport,
  getPendingNotifications,
  getNotificationHistory,
  markAsSent,
  markAsRead,
  notifyAchievementUnlocked,
  notifyLevelUp,
  notifyStreakMilestone,
};

export default notificationService;
