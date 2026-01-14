// ============================================
// 🔔 NOTIFICATION SERVICE
// Sistema inteligente de notificações para exercícios
// ============================================

import { supabase } from '@/integrations/supabase/client';
import type {
  ExerciseNotification,
  NotificationPreferences,
  NotificationTiming,
} from '@/types/advanced-exercise-system';

// ============================================
// CONSTANTS
// ============================================

const NOTIFICATION_CONFIG = {
  maxPerDay: 5,
  minIntervalMinutes: 60,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  motivationalMessages: {
    streak: [
      '🔥 {streak} dias seguidos! Você está imparável!',
      '💪 Streak de {streak} dias! Continue assim!',
      '⭐ {streak} dias de dedicação! Incrível!',
    ],
    missedWorkout: [
      '💭 Sentimos sua falta ontem! Que tal treinar hoje?',
      '🌟 Um dia de descanso é ok, mas vamos voltar?',
      '💪 Seu corpo está pronto para mais um treino!',
    ],
    achievement: [
      '🏆 Parabéns! Você desbloqueou: {achievement}!',
      '⭐ Nova conquista: {achievement}! Continue assim!',
      '🎉 Conquista desbloqueada: {achievement}!',
    ],
    recovery: [
      '😴 Hora de descansar! Seu corpo precisa recuperar.',
      '🧘 Que tal um dia de alongamento leve?',
      '💆 Recuperação é parte do treino. Descanse bem!',
    ],
    motivation: [
      '💪 Cada treino te deixa mais forte!',
      '🎯 Foco no objetivo! Você consegue!',
      '⚡ Energia positiva para o treino de hoje!',
      '🌟 Você é capaz de mais do que imagina!',
    ],
  },
};

// ============================================
// NOTIFICATION SERVICE CLASS
// ============================================

export class NotificationService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ============================================
  // NOTIFICATION MANAGEMENT
  // ============================================

  async getNotifications(
    unreadOnly: boolean = false,
    limit: number = 20
  ): Promise<ExerciseNotification[]> {
    let query = supabase
      .from('exercise_notifications')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data } = await query;

    return (data || []).map(n => ({
      id: n.id,
      type: n.notification_type,
      title: n.title,
      message: n.message,
      data: n.data,
      isRead: n.is_read,
      priority: n.priority,
      actionUrl: n.action_url,
      createdAt: new Date(n.created_at),
      expiresAt: n.expires_at ? new Date(n.expires_at) : undefined,
    }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from('exercise_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', this.userId);
  }

  async markAllAsRead(): Promise<void> {
    await supabase
      .from('exercise_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', this.userId)
      .eq('is_read', false);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await supabase
      .from('exercise_notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', this.userId);
  }

  // ============================================
  // NOTIFICATION CREATION
  // ============================================

  async createNotification(
    type: string,
    title: string,
    message: string,
    options?: {
      priority?: 'low' | 'medium' | 'high' | 'critical';
      actionUrl?: string;
      data?: Record<string, unknown>;
      expiresInHours?: number;
    }
  ): Promise<ExerciseNotification> {
    // Verificar preferências do usuário
    const prefs = await this.getPreferences();
    if (!this.shouldSendNotification(type, prefs)) {
      throw new Error('Notification blocked by user preferences');
    }

    // Verificar limite diário
    const todayCount = await this.getTodayNotificationCount();
    if (todayCount >= NOTIFICATION_CONFIG.maxPerDay) {
      throw new Error('Daily notification limit reached');
    }

    const expiresAt = options?.expiresInHours
      ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000)
      : null;

    const { data, error } = await supabase
      .from('exercise_notifications')
      .insert({
        user_id: this.userId,
        notification_type: type,
        title,
        message,
        priority: options?.priority || 'medium',
        action_url: options?.actionUrl,
        data: options?.data,
        expires_at: expiresAt?.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      type: data.notification_type,
      title: data.title,
      message: data.message,
      data: data.data,
      isRead: data.is_read,
      priority: data.priority,
      actionUrl: data.action_url,
      createdAt: new Date(data.created_at),
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    };
  }

  private async getTodayNotificationCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('exercise_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .gte('created_at', today.toISOString());

    return count || 0;
  }

  // ============================================
  // MOTIVATIONAL NOTIFICATIONS
  // ============================================

  async sendStreakNotification(streakDays: number): Promise<void> {
    const messages = NOTIFICATION_CONFIG.motivationalMessages.streak;
    const message = messages[Math.floor(Math.random() * messages.length)]
      .replace('{streak}', streakDays.toString());

    await this.createNotification(
      'streak',
      '🔥 Streak Incrível!',
      message,
      { priority: 'medium', expiresInHours: 24 }
    );
  }

  async sendMissedWorkoutNotification(): Promise<void> {
    const messages = NOTIFICATION_CONFIG.motivationalMessages.missedWorkout;
    const message = messages[Math.floor(Math.random() * messages.length)];

    await this.createNotification(
      'missed_workout',
      '💪 Hora de Treinar!',
      message,
      { priority: 'medium', actionUrl: '/exercise', expiresInHours: 12 }
    );
  }

  async sendAchievementNotification(achievementName: string): Promise<void> {
    const messages = NOTIFICATION_CONFIG.motivationalMessages.achievement;
    const message = messages[Math.floor(Math.random() * messages.length)]
      .replace('{achievement}', achievementName);

    await this.createNotification(
      'achievement',
      '🏆 Nova Conquista!',
      message,
      { priority: 'high', actionUrl: '/achievements', expiresInHours: 48 }
    );
  }

  async sendRecoveryReminder(): Promise<void> {
    const messages = NOTIFICATION_CONFIG.motivationalMessages.recovery;
    const message = messages[Math.floor(Math.random() * messages.length)];

    await this.createNotification(
      'recovery',
      '🧘 Dia de Recuperação',
      message,
      { priority: 'low', expiresInHours: 24 }
    );
  }

  async sendMotivationalMessage(): Promise<void> {
    const messages = NOTIFICATION_CONFIG.motivationalMessages.motivation;
    const message = messages[Math.floor(Math.random() * messages.length)];

    await this.createNotification(
      'motivation',
      '⚡ Motivação do Dia',
      message,
      { priority: 'low', expiresInHours: 12 }
    );
  }

  // ============================================
  // CRITICAL ALERTS
  // ============================================

  async sendInjuryRiskAlert(
    riskLevel: 'moderate' | 'high' | 'critical',
    bodyRegion?: string,
    recommendations?: string[]
  ): Promise<void> {
    const titles = {
      moderate: '⚠️ Atenção: Risco Moderado',
      high: '🚨 Alerta: Risco Alto de Lesão',
      critical: '🆘 URGENTE: Risco Crítico',
    };

    const messages = {
      moderate: `Detectamos sinais de fadiga${bodyRegion ? ` em ${bodyRegion}` : ''}. Considere reduzir a intensidade.`,
      high: `Risco elevado de lesão${bodyRegion ? ` em ${bodyRegion}` : ''}. Recomendamos descanso.`,
      critical: `PARE o treino imediatamente! Risco crítico${bodyRegion ? ` em ${bodyRegion}` : ''}.`,
    };

    await this.createNotification(
      'injury_risk',
      titles[riskLevel],
      messages[riskLevel],
      {
        priority: riskLevel === 'critical' ? 'critical' : 'high',
        data: { riskLevel, bodyRegion, recommendations },
        actionUrl: '/injury-prevention',
      }
    );
  }

  async sendOvertrainingAlert(workoutsThisWeek: number): Promise<void> {
    await this.createNotification(
      'overtraining',
      '⚠️ Alerta de Overtraining',
      `Você treinou ${workoutsThisWeek} vezes esta semana. Seu corpo precisa de descanso para se recuperar e crescer.`,
      {
        priority: 'high',
        data: { workoutsThisWeek },
        expiresInHours: 24,
      }
    );
  }

  // ============================================
  // SOCIAL NOTIFICATIONS
  // ============================================

  async sendEncouragementReceived(
    fromUserName: string,
    encouragementType: string
  ): Promise<void> {
    const typeEmojis: Record<string, string> = {
      cheer: '📣',
      high_five: '🙌',
      motivation: '💪',
      celebration: '🎉',
    };

    const emoji = typeEmojis[encouragementType] || '👏';

    await this.createNotification(
      'encouragement',
      `${emoji} Você recebeu apoio!`,
      `${fromUserName} te enviou um ${encouragementType}!`,
      { priority: 'medium', actionUrl: '/social', expiresInHours: 48 }
    );
  }

  async sendChallengeInvite(
    challengeTitle: string,
    inviterName: string
  ): Promise<void> {
    await this.createNotification(
      'challenge_invite',
      '🎯 Convite para Desafio!',
      `${inviterName} te convidou para o desafio "${challengeTitle}"`,
      { priority: 'high', actionUrl: '/challenges', expiresInHours: 72 }
    );
  }

  async sendChallengeCompleted(
    challengeTitle: string,
    pointsEarned: number
  ): Promise<void> {
    await this.createNotification(
      'challenge_complete',
      '🏆 Desafio Concluído!',
      `Você completou "${challengeTitle}" e ganhou ${pointsEarned} pontos!`,
      { priority: 'high', actionUrl: '/challenges' }
    );
  }

  async sendBuddyRequest(fromUserName: string): Promise<void> {
    await this.createNotification(
      'buddy_request',
      '👥 Novo Pedido de Buddy!',
      `${fromUserName} quer ser seu parceiro de treino!`,
      { priority: 'medium', actionUrl: '/social/buddies', expiresInHours: 168 }
    );
  }

  async sendGroupActivity(
    groupName: string,
    activityType: string
  ): Promise<void> {
    const messages: Record<string, string> = {
      new_member: `Novo membro entrou no grupo "${groupName}"`,
      challenge_started: `Novo desafio iniciado no grupo "${groupName}"`,
      live_session: `Sessão ao vivo começando no grupo "${groupName}"`,
    };

    await this.createNotification(
      'group_activity',
      '👥 Atividade no Grupo',
      messages[activityType] || `Nova atividade no grupo "${groupName}"`,
      { priority: 'low', actionUrl: '/social/groups', expiresInHours: 24 }
    );
  }

  // ============================================
  // TIMING & PREFERENCES
  // ============================================

  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await supabase
      .from('exercise_notification_preferences')
      .select('*')
      .eq('user_id', this.userId)
      .maybeSingle();

    if (!data) {
      return this.getDefaultPreferences();
    }

    return {
      enabled: data.enabled,
      streakReminders: data.streak_reminders,
      achievementAlerts: data.achievement_alerts,
      socialNotifications: data.social_notifications,
      recoveryReminders: data.recovery_reminders,
      injuryAlerts: data.injury_alerts,
      motivationalMessages: data.motivational_messages,
      quietHoursStart: data.quiet_hours_start,
      quietHoursEnd: data.quiet_hours_end,
      preferredTime: data.preferred_time,
      maxPerDay: data.max_per_day,
    };
  }

  async updatePreferences(
    prefs: Partial<NotificationPreferences>
  ): Promise<void> {
    await supabase
      .from('exercise_notification_preferences')
      .upsert({
        user_id: this.userId,
        enabled: prefs.enabled,
        streak_reminders: prefs.streakReminders,
        achievement_alerts: prefs.achievementAlerts,
        social_notifications: prefs.socialNotifications,
        recovery_reminders: prefs.recoveryReminders,
        injury_alerts: prefs.injuryAlerts,
        motivational_messages: prefs.motivationalMessages,
        quiet_hours_start: prefs.quietHoursStart,
        quiet_hours_end: prefs.quietHoursEnd,
        preferred_time: prefs.preferredTime,
        max_per_day: prefs.maxPerDay,
      }, {
        onConflict: 'user_id',
      });
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      streakReminders: true,
      achievementAlerts: true,
      socialNotifications: true,
      recoveryReminders: true,
      injuryAlerts: true,
      motivationalMessages: true,
      quietHoursStart: NOTIFICATION_CONFIG.quietHoursStart,
      quietHoursEnd: NOTIFICATION_CONFIG.quietHoursEnd,
      maxPerDay: NOTIFICATION_CONFIG.maxPerDay,
    };
  }

  private shouldSendNotification(
    type: string,
    prefs: NotificationPreferences
  ): boolean {
    if (!prefs.enabled) return false;

    // Verificar horário silencioso
    const hour = new Date().getHours();
    if (hour >= prefs.quietHoursStart || hour < prefs.quietHoursEnd) {
      // Permitir apenas alertas críticos durante horário silencioso
      if (type !== 'injury_risk' && type !== 'overtraining') {
        return false;
      }
    }

    // Verificar preferências por tipo
    const typePrefs: Record<string, keyof NotificationPreferences> = {
      streak: 'streakReminders',
      missed_workout: 'streakReminders',
      achievement: 'achievementAlerts',
      recovery: 'recoveryReminders',
      injury_risk: 'injuryAlerts',
      overtraining: 'injuryAlerts',
      motivation: 'motivationalMessages',
      encouragement: 'socialNotifications',
      challenge_invite: 'socialNotifications',
      challenge_complete: 'socialNotifications',
      buddy_request: 'socialNotifications',
      group_activity: 'socialNotifications',
    };

    const prefKey = typePrefs[type];
    if (prefKey && !prefs[prefKey]) {
      return false;
    }

    return true;
  }

  // ============================================
  // OPTIMAL TIMING ANALYSIS
  // ============================================

  async getOptimalWorkoutTime(): Promise<NotificationTiming> {
    // Buscar histórico de treinos
    const { data: workouts } = await supabase
      .from('exercise_performance_metrics')
      .select('created_at, difficulty_rating, fatigue_level')
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!workouts || workouts.length < 5) {
      return {
        recommendedHour: 18,
        confidence: 0.3,
        reason: 'Dados insuficientes - usando horário padrão',
      };
    }

    // Agrupar por hora do dia
    const hourStats: Record<number, { count: number; avgPerformance: number }> = {};

    workouts.forEach(w => {
      const hour = new Date(w.created_at).getHours();
      if (!hourStats[hour]) {
        hourStats[hour] = { count: 0, avgPerformance: 0 };
      }
      hourStats[hour].count++;
      // Performance = baixa dificuldade percebida + baixa fadiga
      const performance = 10 - ((w.difficulty_rating || 5) + (w.fatigue_level || 5)) / 2;
      hourStats[hour].avgPerformance += performance;
    });

    // Calcular média e encontrar melhor horário
    let bestHour = 18;
    let bestScore = 0;

    Object.entries(hourStats).forEach(([hour, stats]) => {
      const avgPerf = stats.avgPerformance / stats.count;
      const frequencyBonus = Math.min(1, stats.count / 5); // Bonus por consistência
      const score = avgPerf * (0.7 + 0.3 * frequencyBonus);

      if (score > bestScore) {
        bestScore = score;
        bestHour = parseInt(hour);
      }
    });

    const confidence = Math.min(0.9, 0.3 + workouts.length * 0.02);

    return {
      recommendedHour: bestHour,
      confidence,
      reason: `Baseado em ${workouts.length} treinos, você performa melhor às ${bestHour}h`,
      alternativeHours: this.getAlternativeHours(hourStats, bestHour),
    };
  }

  private getAlternativeHours(
    hourStats: Record<number, { count: number; avgPerformance: number }>,
    bestHour: number
  ): number[] {
    return Object.entries(hourStats)
      .filter(([hour]) => parseInt(hour) !== bestHour)
      .sort((a, b) => {
        const scoreA = a[1].avgPerformance / a[1].count;
        const scoreB = b[1].avgPerformance / b[1].count;
        return scoreB - scoreA;
      })
      .slice(0, 2)
      .map(([hour]) => parseInt(hour));
  }

  // ============================================
  // SCHEDULED NOTIFICATIONS
  // ============================================

  async scheduleWorkoutReminder(hour: number, minute: number = 0): Promise<void> {
    await supabase.from('exercise_scheduled_notifications').upsert({
      user_id: this.userId,
      notification_type: 'workout_reminder',
      scheduled_hour: hour,
      scheduled_minute: minute,
      is_active: true,
    }, {
      onConflict: 'user_id,notification_type',
    });
  }

  async cancelScheduledNotification(type: string): Promise<void> {
    await supabase
      .from('exercise_scheduled_notifications')
      .update({ is_active: false })
      .eq('user_id', this.userId)
      .eq('notification_type', type);
  }

  async getScheduledNotifications(): Promise<Array<{
    type: string;
    hour: number;
    minute: number;
    isActive: boolean;
  }>> {
    const { data } = await supabase
      .from('exercise_scheduled_notifications')
      .select('*')
      .eq('user_id', this.userId);

    return (data || []).map(n => ({
      type: n.notification_type,
      hour: n.scheduled_hour,
      minute: n.scheduled_minute,
      isActive: n.is_active,
    }));
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createNotificationService(userId: string): NotificationService {
  return new NotificationService(userId);
}

export default NotificationService;
