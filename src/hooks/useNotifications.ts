import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share' | 'challenge' | 'achievement' | 'message';
  title: string;
  message: string | null;
  actor_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
  // Enriched fields
  actor_name?: string;
  actor_avatar?: string;
}

export interface NotificationPreferences {
  likes_enabled: boolean;
  comments_enabled: boolean;
  follows_enabled: boolean;
  mentions_enabled: boolean;
  shares_enabled: boolean;
  challenges_enabled: boolean;
  achievements_enabled: boolean;
  direct_messages_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

const defaultPreferences: NotificationPreferences = {
  likes_enabled: true,
  comments_enabled: true,
  follows_enabled: true,
  mentions_enabled: true,
  shares_enabled: true,
  challenges_enabled: true,
  achievements_enabled: true,
  direct_messages_enabled: true,
  email_notifications: false,
  push_notifications: true,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('health_feed_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get actor profiles
      const actorIds = [...new Set(data?.map(n => n.actor_id).filter(Boolean) || [])];
      
      let profilesMap = new Map();
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', actorIds);

        profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      }

      const enrichedNotifications: Notification[] = (data || []).map(n => {
        const actor = n.actor_id ? profilesMap.get(n.actor_id) : null;
        return {
          ...n,
          type: n.type as Notification['type'],
          is_read: n.is_read ?? false,
          actor_name: actor?.full_name || undefined,
          actor_avatar: actor?.avatar_url || undefined,
        };
      });

      setNotifications(enrichedNotifications);
      setUnreadCount(enrichedNotifications.filter(n => !n.is_read).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch preferences from existing table (using preferences JSON field)
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.preferences) {
        // Merge stored preferences with defaults
        const storedPrefs = data.preferences as Record<string, unknown>;
        setPreferences({
          ...defaultPreferences,
          ...storedPrefs,
        });
      }
    } catch (err: any) {
      console.error('Error fetching preferences:', err);
    }
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      const updated = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          preferences: updated,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setPreferences(updated);
      toast.success('Preferências salvas!');
    } catch (err: any) {
      console.error('Error updating preferences:', err);
      toast.error('Erro ao salvar preferências');
    }
  }, [user, preferences]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('health_feed_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking as read:', err);
    }
  }, [user]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('health_feed_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('Todas as notificações marcadas como lidas');
    } catch (err: any) {
      console.error('Error marking all as read:', err);
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('health_feed_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  }, [user, notifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('health_feed_notifications')
        .delete()
        .eq('user_id', user.id);

      setNotifications([]);
      setUnreadCount(0);
      toast.success('Notificações limpas');
    } catch (err: any) {
      console.error('Error clearing notifications:', err);
    }
  }, [user]);

  // Create notification (for other users to trigger)
  const createNotification = useCallback(async (
    targetUserId: string,
    type: Notification['type'],
    title: string,
    message?: string,
    entityType?: string,
    entityId?: string
  ) => {
    if (!user) return;

    // Don't notify yourself
    if (targetUserId === user.id) return;

    try {
      await supabase
        .from('health_feed_notifications')
        .insert({
          user_id: targetUserId,
          type,
          title,
          message,
          actor_id: user.id,
          entity_type: entityType,
          entity_id: entityId,
          is_read: false,
        });
    } catch (err: any) {
      console.error('Error creating notification:', err);
    }
  }, [user]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    fetchPreferences();

    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_feed_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newNotification = payload.new as Notification;
          
          // Get actor profile
          let actorName: string | undefined;
          let actorAvatar: string | undefined;
          
          if (newNotification.actor_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('user_id', newNotification.actor_id)
              .single();

            actorName = profile?.full_name || undefined;
            actorAvatar = profile?.avatar_url || undefined;
          }

          const enrichedNotification: Notification = {
            ...newNotification,
            is_read: newNotification.is_read ?? false,
            actor_name: actorName,
            actor_avatar: actorAvatar,
          };

          setNotifications(prev => [enrichedNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast(enrichedNotification.title, {
            description: enrichedNotification.message || undefined,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, fetchPreferences]);

  return {
    notifications,
    preferences,
    loading,
    unreadCount,
    fetchNotifications,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    createNotification,
  };
}
