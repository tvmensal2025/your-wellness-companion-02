// ============================================
// 🔔 NOTIFICATION CENTER
// Centro de notificações para exercícios
// ============================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  AlertTriangle,
  Trophy,
  Users,
  Flame,
  Heart,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface Notification {
  id: string;
  type: 'achievement' | 'social' | 'reminder' | 'alert' | 'motivation' | 'streak';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  createdAt: Date;
}

interface NotificationCenterProps {
  userId?: string;
  notifications?: Notification[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  onSettingsClick?: () => void;
  className?: string;
  variant?: 'dropdown' | 'panel' | 'inline' | 'compact';
}

// ============================================
// MOCK DATA
// ============================================

const getMockNotifications = (): Notification[] => [
  {
    id: '1',
    type: 'streak',
    title: '🔥 Sequência de 7 dias!',
    message: 'Você está em uma sequência incrível! Continue assim.',
    isRead: false,
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    type: 'achievement',
    title: '🏆 Nova conquista!',
    message: 'Você completou 10 treinos este mês.',
    isRead: false,
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    type: 'motivation',
    title: '💪 Hora de treinar!',
    message: 'Seu treino de hoje está esperando por você.',
    isRead: true,
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
];

// ============================================
// HELPER COMPONENTS
// ============================================

const NotificationIcon: React.FC<{ type: string; priority: string }> = ({ type, priority }) => {
  const iconMap: Record<string, { icon: React.ReactNode; bgColor: string }> = {
    achievement: {
      icon: <Trophy className="w-4 h-4" />,
      bgColor: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    },
    social: {
      icon: <Users className="w-4 h-4" />,
      bgColor: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    },
    reminder: {
      icon: <Clock className="w-4 h-4" />,
      bgColor: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
    },
    alert: {
      icon: <AlertTriangle className="w-4 h-4" />,
      bgColor: priority === 'critical' 
        ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
        : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
    },
    motivation: {
      icon: <Heart className="w-4 h-4" />,
      bgColor: 'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400',
    },
    streak: {
      icon: <Flame className="w-4 h-4" />,
      bgColor: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
    },
  };

  const config = iconMap[type] || iconMap.reminder;

  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.bgColor)}>
      {config.icon}
    </div>
  );
};

const TimeAgo: React.FC<{ date: Date }> = ({ date }) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let text = '';
  if (diffMins < 1) text = 'Agora';
  else if (diffMins < 60) text = `${diffMins}min`;
  else if (diffHours < 24) text = `${diffHours}h`;
  else if (diffDays < 7) text = `${diffDays}d`;
  else text = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return <span className="text-xs text-muted-foreground">{text}</span>;
};

// ============================================
// NOTIFICATION ITEM
// ============================================

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onClick?: () => void;
}> = ({ notification, onMarkAsRead, onDelete, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative p-3 rounded-lg transition-colors cursor-pointer",
        !notification.isRead && "bg-muted/50",
        notification.priority === 'critical' && !notification.isRead && "bg-red-50 dark:bg-red-950/30",
        "hover:bg-muted"
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <NotificationIcon type={notification.type} priority={notification.priority} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-sm", !notification.isRead && "font-medium")}>
              {notification.title}
            </p>
            <TimeAgo date={notification.createdAt} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        </div>

        {!notification.isRead && (
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500" />
        )}
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1"
          >
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); onMarkAsRead(); }}
              >
                <Check className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  notifications: externalNotifications,
  unreadCount: externalUnreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
  onSettingsClick,
  className,
  variant = 'panel',
}) => {
  const [internalNotifications, setInternalNotifications] = useState<Notification[]>(getMockNotifications);
  
  const notifications = externalNotifications || internalNotifications;
  const unreadCount = externalUnreadCount ?? notifications.filter(n => !n.isRead).length;
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAsRead = (id: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
    } else {
      setInternalNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    } else {
      setInternalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    } else {
      setInternalNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const filteredNotifications = notifications.filter(n => filter === 'all' || !n.isRead);
  const criticalNotifications = notifications.filter(n => n.priority === 'critical' && !n.isRead);

  // Compact variant
  if (variant === 'compact') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className={cn("relative h-7 w-7 sm:h-8 sm:w-8", className)}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Notificações</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAllAsRead}>
                  Ler todas
                </Button>
              )}
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <BellOff className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.slice(0, 5).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    onDelete={() => handleDelete(notification.id)}
                    onClick={() => onNotificationClick?.(notification)}
                  />
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <Card className={cn("w-80 max-h-[400px] overflow-hidden", className)}>
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Notificações</CardTitle>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  Ler todas
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSettingsClick}>
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <BellOff className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => handleDelete(notification.id)}
                  onClick={() => onNotificationClick?.(notification)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Panel variant (full)
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" />
            Notificações
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} novas</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onSettingsClick}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {criticalNotifications.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {criticalNotifications.length} alerta(s) crítico(s)
              </span>
            </div>
            {criticalNotifications.slice(0, 2).map((n) => (
              <p key={n.id} className="text-xs text-red-600 dark:text-red-400">• {n.title}</p>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
            Todas
          </Button>
          <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>
            Não lidas ({unreadCount})
          </Button>
        </div>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center">
                <BellOff className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread' ? 'Todas as notificações foram lidas' : 'Nenhuma notificação'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => handleDelete(notification.id)}
                  onClick={() => onNotificationClick?.(notification)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
