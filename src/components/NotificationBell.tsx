import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { getNotificationIcon, getNotificationColor } from '@/lib/notifications';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
}

interface NotificationBellProps {
  userId?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId: propUserId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(propUserId || null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Sync userId from props (avoid calling getUser if prop is provided)
  useEffect(() => {
    if (propUserId) {
      setUserId(propUserId);
    }
  }, [propUserId]);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      // Throttle: skip if fetched less than 1s ago
      const now = Date.now();
      if (now - lastFetchRef.current < 1000) return;
      lastFetchRef.current = now;

      const { data, error } = await supabase
        .from('health_feed_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Cleanup previous channel if exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to realtime updates - only INSERT and UPDATE (not DELETE or *)
    channelRef.current = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_feed_notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'health_feed_notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('health_feed_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    await supabase
      .from('health_feed_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-8 w-8 overflow-visible hover:bg-primary/10 transition-colors"
        >
          <Bell className={`h-5 w-5 transition-all duration-300 ${unreadCount > 0 ? 'animate-[bell-ring_1s_ease-in-out_infinite] text-primary' : 'text-muted-foreground'}`} />
          {unreadCount > 0 && (
            <>
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-bold animate-pulse shadow-lg"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive animate-ping opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 sm:w-80 p-0 overflow-hidden rounded-xl shadow-xl border-border/50">
        {/* Header compacto */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <Bell className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Notificações</h3>
              <p className="text-[10px] text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} nova${unreadCount > 1 ? 's' : ''}` : 'Tudo em dia!'}
              </p>
            </div>
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted/50 flex items-center justify-center">
              <Bell className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-xs">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer border-b border-border/30 last:border-0 focus:bg-primary/5 transition-colors ${
                  !notification.is_read ? 'bg-primary/5' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-2.5 w-full">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${getNotificationColor(notification.type)}`}>
                    <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-medium text-xs text-foreground line-clamp-1">
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border/50 bg-muted/30">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-primary hover:text-primary hover:bg-primary/10 font-medium h-8"
              onClick={markAllAsRead}
            >
              ✓ Marcar todas como lidas
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
