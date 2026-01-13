// =====================================================
// NOTIFICATION SERVICE - Dr. Vital
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type { SmartNotification, NotificationType, NotificationPriority } from '@/types/dr-vital-revolution';

// Helper para tabelas não tipadas
const fromTable = (table: string) => supabase.from(table as any);

const MORNING_BRIEFING_HOUR = 8;
const INACTIVITY_THRESHOLD_DAYS = 3;

export async function scheduleMorningBriefing(userId: string): Promise<SmartNotification> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(MORNING_BRIEFING_HOUR, 0, 0, 0);

  const { data, error } = await fromTable('notification_queue')
    .insert({
      user_id: userId,
      notification_type: 'morning_briefing',
      title: '☀️ Bom dia! Seu resumo de saúde',
      body: 'Confira suas missões do dia.',
      priority: 'medium',
      scheduled_for: tomorrow.toISOString(),
      action_url: '/dr-vital',
      metadata: { type: 'daily_briefing' },
    })
    .select()
    .single() as any;

  if (error) throw error;
  return rowToNotification(data);
}

export async function scheduleMedicationReminder(
  userId: string,
  medication: { name: string; time: string; dosage: string }
): Promise<SmartNotification> {
  const [hours, minutes] = medication.time.split(':').map(Number);
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);
  if (scheduledTime < new Date()) scheduledTime.setDate(scheduledTime.getDate() + 1);

  const { data, error } = await fromTable('notification_queue')
    .insert({
      user_id: userId,
      notification_type: 'medication_reminder',
      title: `💊 Hora do ${medication.name}`,
      body: `Lembre-se de tomar ${medication.dosage} de ${medication.name}.`,
      priority: 'high',
      scheduled_for: scheduledTime.toISOString(),
      metadata: { medication },
    })
    .select()
    .single() as any;

  if (error) throw error;
  return rowToNotification(data);
}

export async function detectInactivity(userId: string): Promise<{
  isInactive: boolean;
  daysSinceLastActivity: number;
  notification?: SmartNotification;
}> {
  const { data: lastActivity } = await fromTable('health_missions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle() as any;

  if (!lastActivity?.completed_at) {
    return { isInactive: true, daysSinceLastActivity: 999 };
  }

  const lastDate = new Date(lastActivity.completed_at);
  const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince >= INACTIVITY_THRESHOLD_DAYS) {
    const { data } = await fromTable('notification_queue')
      .insert({
        user_id: userId,
        notification_type: 're_engagement',
        title: '🌟 Sentimos sua falta!',
        body: `Faz ${daysSince} dias que você não completa uma missão.`,
        priority: 'medium',
        scheduled_for: new Date().toISOString(),
        action_url: '/dr-vital',
        metadata: { daysSinceLastActivity: daysSince },
      })
      .select()
      .single() as any;

    return { isInactive: true, daysSinceLastActivity: daysSince, notification: data ? rowToNotification(data) : undefined };
  }

  return { isInactive: false, daysSinceLastActivity: daysSince };
}

export async function scheduleWeeklyReport(userId: string): Promise<SmartNotification> {
  const nextSunday = new Date();
  const daysUntilSunday = (7 - nextSunday.getDay()) % 7 || 7;
  nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
  nextSunday.setHours(10, 0, 0, 0);

  const { data, error } = await fromTable('notification_queue')
    .insert({
      user_id: userId,
      notification_type: 'weekly_report',
      title: '📊 Seu relatório semanal está pronto!',
      body: 'Veja como foi sua semana de saúde.',
      priority: 'low',
      scheduled_for: nextSunday.toISOString(),
      action_url: '/dr-vital?tab=reports',
      metadata: { reportType: 'weekly' },
    })
    .select()
    .single() as any;

  if (error) throw error;
  return rowToNotification(data);
}

export async function getPendingNotifications(userId: string): Promise<SmartNotification[]> {
  const { data, error } = await fromTable('notification_queue')
    .select('*')
    .eq('user_id', userId)
    .is('sent_at', null)
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: false })
    .order('scheduled_for', { ascending: true }) as any;

  if (error) throw error;
  return (data || []).map(rowToNotification);
}

export async function getNotificationHistory(userId: string, limit: number = 20): Promise<SmartNotification[]> {
  const { data, error } = await fromTable('notification_queue')
    .select('*')
    .eq('user_id', userId)
    .not('sent_at', 'is', null)
    .order('sent_at', { ascending: false })
    .limit(limit) as any;

  if (error) throw error;
  return (data || []).map(rowToNotification);
}

export async function markAsSent(notificationId: string): Promise<void> {
  await fromTable('notification_queue').update({ sent_at: new Date().toISOString() }).eq('id', notificationId);
}

export async function markAsRead(notificationId: string): Promise<void> {
  await fromTable('notification_queue').update({ read_at: new Date().toISOString() }).eq('id', notificationId);
}

export async function notifyAchievementUnlocked(userId: string, achievementName: string, xpReward: number): Promise<SmartNotification> {
  const { data, error } = await fromTable('notification_queue')
    .insert({
      user_id: userId,
      notification_type: 'achievement_unlocked',
      title: '🏆 Conquista Desbloqueada!',
      body: `Parabéns! Você desbloqueou "${achievementName}" e ganhou ${xpReward} XP!`,
      priority: 'high',
      scheduled_for: new Date().toISOString(),
      action_url: '/dr-vital?tab=achievements',
      metadata: { achievementName, xpReward },
    })
    .select()
    .single() as any;

  if (error) throw error;
  return rowToNotification(data);
}

export async function notifyLevelUp(userId: string, newLevel: number, levelTitle: string): Promise<SmartNotification> {
  const { data, error } = await fromTable('notification_queue')
    .insert({
      user_id: userId,
      notification_type: 'level_up',
      title: '⬆️ Você subiu de nível!',
      body: `Incrível! Você alcançou o nível ${newLevel}: ${levelTitle}!`,
      priority: 'high',
      scheduled_for: new Date().toISOString(),
      action_url: '/dr-vital',
      metadata: { newLevel, levelTitle },
    })
    .select()
    .single() as any;

  if (error) throw error;
  return rowToNotification(data);
}

export async function notifyStreakMilestone(userId: string, streakDays: number): Promise<SmartNotification> {
  const { data, error } = await fromTable('notification_queue')
    .insert({
      user_id: userId,
      notification_type: 'streak_milestone',
      title: '🔥 Streak Incrível!',
      body: `Você está em uma sequência de ${streakDays} dias!`,
      priority: 'medium',
      scheduled_for: new Date().toISOString(),
      action_url: '/dr-vital',
      metadata: { streakDays },
    })
    .select()
    .single() as any;

  if (error) throw error;
  return rowToNotification(data);
}

function rowToNotification(row: any): SmartNotification {
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
