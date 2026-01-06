import { useState, useEffect, useCallback } from 'react';
import { 
  PushNotifications, 
  Token, 
  ActionPerformed,
  PushNotificationSchema,
  PermissionStatus
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useHaptics } from './useHaptics';
import { toast } from 'sonner';

export interface NotificationPayload {
  id: string;
  title?: string;
  body?: string;
  data?: Record<string, any>;
}

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    permission: 'unknown',
  });
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const { triggerHaptic } = useHaptics();

  const isNative = Capacitor.isNativePlatform();

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      if (isNative) {
        setState(prev => ({ ...prev, isSupported: true }));
        await checkPermissions();
      } else if ('Notification' in window) {
        setState(prev => ({ 
          ...prev, 
          isSupported: true,
          permission: Notification.permission as any,
        }));
      }
    };

    checkSupport();
  }, [isNative]);

  const checkPermissions = useCallback(async () => {
    if (!isNative) {
      if ('Notification' in window) {
        setState(prev => ({ 
          ...prev, 
          permission: Notification.permission as any 
        }));
      }
      return;
    }

    try {
      const permStatus: PermissionStatus = await PushNotifications.checkPermissions();
      setState(prev => ({ 
        ...prev, 
        permission: permStatus.receive as any 
      }));
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }, [isNative]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      // Web notifications
      if (!('Notification' in window)) {
        toast.error('Notificações não suportadas neste navegador');
        return false;
      }

      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission: permission as any }));
      return permission === 'granted';
    }

    try {
      const permStatus = await PushNotifications.requestPermissions();
      const granted = permStatus.receive === 'granted';
      
      setState(prev => ({ 
        ...prev, 
        permission: permStatus.receive as any 
      }));

      if (granted) {
        await triggerHaptic('success');
        toast.success('Notificações ativadas!');
      } else {
        toast.error('Permissão de notificação negada');
      }

      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }, [isNative, triggerHaptic]);

  const register = useCallback(async () => {
    if (!isNative) {
      // For web, we just check if permission is granted
      if (Notification.permission === 'granted') {
        setState(prev => ({ ...prev, isRegistered: true }));
        return true;
      }
      return false;
    }

    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) return false;

      // Register for push notifications
      await PushNotifications.register();

      // Add listeners
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token:', token.value);
        setState(prev => ({ 
          ...prev, 
          isRegistered: true, 
          token: token.value 
        }));
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Registration error:', error);
        toast.error('Erro ao registrar notificações');
      });

      PushNotifications.addListener(
        'pushNotificationReceived',
        async (notification: PushNotificationSchema) => {
          console.log('Push notification received:', notification);
          await triggerHaptic('medium');
          
          const payload: NotificationPayload = {
            id: notification.id,
            title: notification.title,
            body: notification.body,
            data: notification.data,
          };
          
          setNotifications(prev => [...prev, payload]);
          
          // Show toast for foreground notifications
          if (notification.title) {
            toast.info(notification.title, {
              description: notification.body,
            });
          }
        }
      );

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action: ActionPerformed) => {
          console.log('Push action performed:', action);
          const payload: NotificationPayload = {
            id: action.notification.id,
            title: action.notification.title,
            body: action.notification.body,
            data: action.notification.data,
          };
          
          // Handle notification tap
          handleNotificationTap(payload);
        }
      );

      return true;
    } catch (error) {
      console.error('Error registering push notifications:', error);
      return false;
    }
  }, [isNative, requestPermission, triggerHaptic]);

  const handleNotificationTap = useCallback((notification: NotificationPayload) => {
    // Override this in your app to handle notification taps
    console.log('Notification tapped:', notification);
    
    // Example: Navigate based on notification data
    if (notification.data?.route) {
      window.location.href = notification.data.route;
    }
  }, []);

  const sendLocalNotification = useCallback(async (title: string, body: string, data?: Record<string, any>) => {
    if (!isNative && 'Notification' in window && Notification.permission === 'granted') {
      // Web notification
      new Notification(title, { body, data });
      return;
    }

    // For native, you would typically send through your backend
    // Local notifications require @capacitor/local-notifications plugin
    console.log('Local notification:', { title, body, data });
  }, [isNative]);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(async () => {
    setNotifications([]);
    
    if (isNative) {
      try {
        await PushNotifications.removeAllDeliveredNotifications();
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  }, [isNative]);

  const unregister = useCallback(async () => {
    if (isNative) {
      try {
        await PushNotifications.removeAllListeners();
        setState(prev => ({ ...prev, isRegistered: false, token: null }));
      } catch (error) {
        console.error('Error unregistering:', error);
      }
    }
  }, [isNative]);

  return {
    ...state,
    notifications,
    
    // Actions
    requestPermission,
    register,
    unregister,
    sendLocalNotification,
    clearNotification,
    clearAllNotifications,
    checkPermissions,
  };
};
