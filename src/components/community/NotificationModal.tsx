import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NotificationCenter } from './NotificationCenter';
import { NotificationSettings } from './NotificationSettings';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useState } from 'react';

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  open,
  onOpenChange,
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

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 h-[600px] max-h-[80vh]">
          <DialogHeader className="sr-only">
            <DialogTitle>Notificações</DialogTitle>
          </DialogHeader>
          
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
            onClearAll={clearAll}
            onNotificationClick={(notification) => {
              onOpenChange(false);
              onNotificationClick?.(notification);
            }}
            onSettingsClick={() => {
              onOpenChange(false);
              setSettingsOpen(true);
            }}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>

      <NotificationSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
      />
    </>
  );
};
