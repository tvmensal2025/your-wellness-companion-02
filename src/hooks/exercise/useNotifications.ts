// ============================================
// 🔔 USE NOTIFICATIONS HOOK
// Hook para gerenciar notificações de exercícios
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { createNotificationService } from '@/services/exercise/notificationService';
import type {
  ExerciseNotification,
  NotificationPreferences,
  NotificationTiming,
} from '@/types/advanced-exercise-system';

// ============================================
// QUERY KEYS
// ============================================

const NOTIFICATION_KEYS = {
  all: ['exercise-notifications'] as const,
  list: (userId: string) => [...NOTIFICATION_KEYS.all, 'list', userId] as const,
  unread: (userId: string) => [...NOTIFICATION_KEYS.all, 'unread', userId] as const,
  preferences: (userId: string) => [...NOTIFICATION_KEYS.all, 'preferences', userId] as const,
  optimalTime: (userId: string) => [...NOTIFICATION_KEYS.all, 'optimal-time', userId] as const,
  scheduled: (userId: string) => [...NOTIFICATION_KEYS.all, 'scheduled', userId] as const,
};

// ============================================
// MAIN HOOK
// ============================================

export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const enabled = !!userId;

  // Memoize service instance
  const service = useMemo(() => {
    if (!userId) return null;
    return createNotificationService(userId);
  }, [userId]);

  // ============================================
  // QUERIES
  // ============================================

  // Get all notifications
  const {
    data: notifications,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: NOTIFICATION_KEYS.list(userId || ''),
    queryFn: async () => {
      if (!service) return [];
      return service.getNotifications(false, 50);
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Get unread notifications count
  const {
    data: unreadNotifications,
    isLoading: isLoadingUnread,
  } = useQuery({
    queryKey: NOTIFICATION_KEYS.unread(userId || ''),
    queryFn: async () => {
      if (!service) return [];
      return service.getNotifications(true, 100);
    },
    enabled,
    staleTime: 15 * 1000, // 15 seconds
  });

  // Get notification preferences
  const {
    data: preferences,
    isLoading: isLoadingPreferences,
  } = useQuery({
    queryKey: NOTIFICATION_KEYS.preferences(userId || ''),
    queryFn: async () => {
      if (!service) return null;
      return service.getPreferences();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get optimal workout time
  const {
    data: optimalTime,
    isLoading: isLoadingOptimalTime,
  } = useQuery({
    queryKey: NOTIFICATION_KEYS.optimalTime(userId || ''),
    queryFn: async () => {
      if (!service) return null;
      return service.getOptimalWorkoutTime();
    },
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Get scheduled notifications
  const {
    data: scheduledNotifications,
    isLoading: isLoadingScheduled,
  } = useQuery({
    queryKey: NOTIFICATION_KEYS.scheduled(userId || ''),
    queryFn: async () => {
      if (!service) return [];
      return service.getScheduledNotifications();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // ============================================
  // MUTATIONS
  // ============================================

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!service) throw new Error('Service not initialized');
      return service.markAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId || '') });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread(userId || '') });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!service) throw new Error('Service not initialized');
      return service.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId || '') });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread(userId || '') });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!service) throw new Error('Service not initialized');
      return service.deleteNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId || '') });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread(userId || '') });
    },
  });

  // Update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      if (!service) throw new Error('Service not initialized');
      return service.updatePreferences(prefs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.preferences(userId || '') });
    },
  });

  // Schedule workout reminder
  const scheduleReminderMutation = useMutation({
    mutationFn: async ({ hour, minute }: { hour: number; minute?: number }) => {
      if (!service) throw new Error('Service not initialized');
      return service.scheduleWorkoutReminder(hour, minute);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.scheduled(userId || '') });
    },
  });

  // Cancel scheduled notification
  const cancelScheduledMutation = useMutation({
    mutationFn: async (type: string) => {
      if (!service) throw new Error('Service not initialized');
      return service.cancelScheduledNotification(type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.scheduled(userId || '') });
    },
  });

  // ============================================
  // SEND NOTIFICATION MUTATIONS
  // ============================================

  // Send streak notification
  const sendStreakNotificationMutation = useMutation({
    mutationFn: async (streakDays: number) => {
      if (!service) throw new Error('Service not initialized');
      return service.sendStreakNotification(streakDays);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId || '') });
    },
  });

  // Send missed workout notification
  const sendMissedWorkoutMutation = useMutation({
    mutationFn: async () => {
      if (!service) throw new Error('Service not initialized');
      return service.sendMissedWorkoutNotification();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId || '') });
    },
  });

  // Send achievement notification
  const sendAchievementMutation = useMutation({
    mutationFn: async (achievementName: string) => {
      if (!service) throw new Error('Service not initialized');
      return service.sendAchievementNotification(achievementName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId || '') });
    },
  });

  // Send injury risk alert
  const sendInjuryAlertMutation = useMutation({
    mutationFn: async ({
      riskLevel,
      bodyRegion,
      recommendations,
    }: {
      riskLevel: 'moderate' | 'high' | 'critical';
      bodyRegion?: string;
      recommendations?: string[];
    }) => {
      if (!service) throw new Error('Service not initialized');
      return service.sendInjuryRiskAlert(riskLevel, bodyRegion, recommendations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId || '') });
    },
  });

  // Send encouragement received
  const sendEncouragementReceivedMutation = useMutation({
    mutationFn: async ({
      fromUserName,
      encouragementType,
    }: {
      fromUserName: string;
      encouragementType: string;
    }) => {
      if (!service) throw new Error('Service not initialized');
      return service.sendEncouragementReceived(fromUserName, encouragementType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId || '') });
    },
  });

  // Send challenge invite
  const sendChallengeInviteMutation = useMutation({
    mutationFn: async ({
      challengeTitle,
      inviterName,
    }: {
      challengeTitle: string;
      inviterName: string;
    }) => {
      if (!service) throw new Error('Service not initialized');
      return service.sendChallengeInvite(challengeTitle, inviterName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId || '') });
    },
  });

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const unreadCount = useMemo(() => {
    return unreadNotifications?.length || 0;
  }, [unreadNotifications]);

  const hasUnread = unreadCount > 0;

  const criticalNotifications = useMemo(() => {
    return (notifications || []).filter(
      (n) => n.priority === 'critical' && !n.isRead
    );
  }, [notifications]);

  const hasCriticalAlerts = criticalNotifications.length > 0;

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const markAsRead = useCallback(
    (notificationId: string) => {
      return markAsReadMutation.mutateAsync(notificationId);
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(() => {
    return markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback(
    (notificationId: string) => {
      return deleteNotificationMutation.mutateAsync(notificationId);
    },
    [deleteNotificationMutation]
  );

  const updatePreferences = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      return updatePreferencesMutation.mutateAsync(prefs);
    },
    [updatePreferencesMutation]
  );

  const scheduleReminder = useCallback(
    (hour: number, minute?: number) => {
      return scheduleReminderMutation.mutateAsync({ hour, minute });
    },
    [scheduleReminderMutation]
  );

  const cancelScheduled = useCallback(
    (type: string) => {
      return cancelScheduledMutation.mutateAsync(type);
    },
    [cancelScheduledMutation]
  );

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    notifications: notifications || [],
    unreadNotifications: unreadNotifications || [],
    preferences,
    optimalTime,
    scheduledNotifications: scheduledNotifications || [],

    // Computed
    unreadCount,
    hasUnread,
    criticalNotifications,
    hasCriticalAlerts,

    // Loading states
    isLoading: isLoadingNotifications || isLoadingUnread,
    isLoadingNotifications,
    isLoadingUnread,
    isLoadingPreferences,
    isLoadingOptimalTime,
    isLoadingScheduled,

    // Errors
    error: notificationsError,

    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    scheduleReminder,
    cancelScheduled,
    refetch: refetchNotifications,

    // Send notifications
    sendStreakNotification: sendStreakNotificationMutation.mutateAsync,
    sendMissedWorkoutNotification: sendMissedWorkoutMutation.mutateAsync,
    sendAchievementNotification: sendAchievementMutation.mutateAsync,
    sendInjuryAlert: sendInjuryAlertMutation.mutateAsync,
    sendEncouragementReceived: sendEncouragementReceivedMutation.mutateAsync,
    sendChallengeInvite: sendChallengeInviteMutation.mutateAsync,

    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    isSendingNotification:
      sendStreakNotificationMutation.isPending ||
      sendMissedWorkoutMutation.isPending ||
      sendAchievementMutation.isPending ||
      sendInjuryAlertMutation.isPending,
  };
}

export default useNotifications;
