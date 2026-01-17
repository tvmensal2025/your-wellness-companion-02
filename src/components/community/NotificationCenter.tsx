import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Share2,
  Trophy,
  Award,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Notification } from '@/hooks/useNotifications';

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onSettingsClick?: () => void;
  onClose?: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-rose-500" />;
    case 'comment':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'follow':
      return <UserPlus className="w-4 h-4 text-emerald-500" />;
    case 'mention':
      return <AtSign className="w-4 h-4 text-purple-500" />;
    case 'share':
      return <Share2 className="w-4 h-4 text-orange-500" />;
    case 'challenge':
      return <Trophy className="w-4 h-4 text-amber-500" />;
    case 'achievement':
      return <Award className="w-4 h-4 text-yellow-500" />;
    case 'message':
      return <MessageCircle className="w-4 h-4 text-primary" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return 'bg-rose-100 dark:bg-rose-900/30';
    case 'comment':
      return 'bg-blue-100 dark:bg-blue-900/30';
    case 'follow':
      return 'bg-emerald-100 dark:bg-emerald-900/30';
    case 'mention':
      return 'bg-purple-100 dark:bg-purple-900/30';
    case 'share':
      return 'bg-orange-100 dark:bg-orange-900/30';
    case 'challenge':
      return 'bg-amber-100 dark:bg-amber-900/30';
    case 'achievement':
      return 'bg-yellow-100 dark:bg-yellow-900/30';
    case 'message':
      return 'bg-primary/10';
    default:
      return 'bg-muted';
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onNotificationClick,
  onSettingsClick,
  onClose,
}) => {
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`flex gap-3 p-4 cursor-pointer transition-colors border-b border-muted/50 group ${
        notification.is_read ? 'bg-transparent' : 'bg-primary/5'
      } hover:bg-muted/30`}
      onClick={() => {
        if (!notification.is_read) {
          onMarkAsRead(notification.id);
        }
        onNotificationClick?.(notification);
      }}
    >
      {/* Actor Avatar or Icon */}
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)} border-2 border-background`}>
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notification.is_read ? 'text-muted-foreground' : 'font-medium'}`}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </motion.div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  );

  return (
    <Card className="h-full flex flex-col border-primary/20">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            Notificações
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={onMarkAllAsRead}
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas
              </Button>
            )}
            {onSettingsClick && (
              <Button variant="ghost" size="icon" onClick={onSettingsClick}>
                <Settings className="w-5 h-5" />
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <Tabs defaultValue="all" className="h-full">
          <TabsList className="w-full justify-start rounded-none border-b px-4 h-10">
            <TabsTrigger value="all" className="text-sm">
              Todas
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-sm">
              Não lidas
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0 h-[calc(100%-40px)]">
            <ScrollArea className="h-[400px]">
              <AnimatePresence>
                {notifications.length === 0 ? (
                  <EmptyState message="Nenhuma notificação ainda" />
                ) : (
                  notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="m-0 h-[calc(100%-40px)]">
            <ScrollArea className="h-[400px]">
              <AnimatePresence>
                {unreadNotifications.length === 0 ? (
                  <EmptyState message="Tudo lido! 🎉" />
                ) : (
                  unreadNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onClearAll}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar todas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
