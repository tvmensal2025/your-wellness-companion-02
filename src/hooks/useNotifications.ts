// =====================================================
// USE NOTIFICATIONS HOOK
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  is_read: boolean;
  entity_id?: string;
  entity_type?: string;
  created_at: string;
  actor_id?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  daily_summary: boolean;
  weekly_summary: boolean;
  challenge_updates: boolean;
  social_updates: boolean;
  achievement_alerts: boolean;
  likes_enabled?: boolean;
  comments_enabled?: boolean;
  follows_enabled?: boolean;
  mentions_enabled?: boolean;
  shares_enabled?: boolean;
  challenges_enabled?: boolean;
  achievements_enabled?: boolean;
  direct_messages_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

const defaultPreferences: NotificationPreferences = {
  email_notifications: true,
  push_notifications: true,
  in_app_notifications: true,
  daily_summary: false,
  weekly_summary: true,
  challenge_updates: true,
  social_updates: true,
  achievement_alerts: true,
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await fromTable('health_feed_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications((data || []).map((n: any) => ({
        id: n.id,
        user_id: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        is_read: n.is_read || false,
        entity_id: n.entity_id,
        entity_type: n.entity_type,
        created_at: n.created_at,
        actor_id: n.actor_id,
      })));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    try {
      await fromTable('health_feed_notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await fromTable('health_feed_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Todas notificações marcadas como lidas');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fromTable('health_feed_notifications')
        .delete()
        .eq('id', id);
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    if (!user?.id) return;
    
    try {
      await fromTable('health_feed_notifications')
        .delete()
        .eq('user_id', user.id);
      
      setNotifications([]);
      toast.success('Notificações removidas');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const updatePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    // Could persist to DB if needed
  };

  return {
    notifications,
    preferences,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updatePreferences,
    refetch: fetchNotifications,
  };
}

export default useNotifications;
