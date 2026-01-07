import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationCenter } from './NotificationCenter';
import { NotificationSettings } from './NotificationSettings';
import { useNotifications, Notification } from '@/hooks/useNotifications';

interface NotificationBellProps {
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onNotificationClick,
}) => {
  const {
    notifications,
    preferences,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updatePreferences,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="w-5 h-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[400px] p-0" 
          align="end"
          sideOffset={8}
        >
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
            onClearAll={clearAll}
            onNotificationClick={(notification) => {
              setOpen(false);
              onNotificationClick?.(notification);
            }}
            onSettingsClick={() => {
              setOpen(false);
              setSettingsOpen(true);
            }}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>

      <NotificationSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
      />
    </>
  );
};

// Standalone button for mobile
export const NotificationButton: React.FC<{
  unreadCount: number;
  onClick: () => void;
  className?: string;
}> = ({ unreadCount, onClick, className }) => (
  <Button
    variant="ghost"
    size="icon"
    className={`relative ${className}`}
    onClick={onClick}
  >
    <Bell className="w-5 h-5" />
    {unreadCount > 0 && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1"
      >
        <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      </motion.div>
    )}
  </Button>
);
