import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'session' | 'reminder' | 'achievement' | 'tip' | 'health' | 'alert' | 'system';

export const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'session': return '🧘';
    case 'reminder': return '⏰';
    case 'achievement': return '🏆';
    case 'tip': return '💡';
    case 'health': return '❤️';
    case 'alert': return '⚠️';
    case 'system': return '🔔';
    default: return '🔔';
  }
};

export const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'session': return 'from-blue-500/20 to-blue-500/5';
    case 'reminder': return 'from-amber-500/20 to-amber-500/5';
    case 'achievement': return 'from-yellow-500/20 to-yellow-500/5';
    case 'tip': return 'from-primary/20 to-primary/5';
    case 'health': return 'from-red-500/20 to-red-500/5';
    case 'alert': return 'from-orange-500/20 to-orange-500/5';
    default: return 'from-primary/20 to-primary/5';
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'system',
  actionUrl?: string
) => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
      action_url: actionUrl,
      is_read: false,
    });
  
  if (error) {
    console.error('Error creating notification:', error);
    return false;
  }
  return true;
};

export const createSessionNotification = (userId: string, sessionTitle: string) => 
  createNotification(userId, 'Nova Sessão', `${sessionTitle} está disponível para você!`, 'session', '/sessions');

export const createReminderNotification = (userId: string, message: string) => 
  createNotification(userId, 'Lembrete', message, 'reminder');

export const createAchievementNotification = (userId: string, achievement: string) => 
  createNotification(userId, 'Conquista Desbloqueada! 🎉', achievement, 'achievement', '/achievements');

export const createHealthNotification = (userId: string, message: string) => 
  createNotification(userId, 'Alerta de Saúde', message, 'health');

export const createTipNotification = (userId: string, tip: string) => 
  createNotification(userId, 'Dica da Sofia', tip, 'tip');
