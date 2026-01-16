// =====================================================
// USE NOTIFICATIONS HOOK - Dr. Vital
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/dr-vital/notificationService';
import type { SmartNotification } from '@/types/dr-vital-revolution';

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const enabled = !!user?.id;

  // Buscar notificações pendentes
  const {
    data: pendingNotifications,
    isLoading: loadingPending,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ['dr-vital-notifications-pending', user?.id],
    queryFn: () => notificationService.getPendingNotifications(user!.id),
    enabled,
    staleTime: 60 * 1000, // 1 minuto
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });

  // Buscar histórico de notificações
  const {
    data: notificationHistory,
    isLoading: loadingHistory,
  } = useQuery({
    queryKey: ['dr-vital-notifications-history', user?.id],
    queryFn: () => notificationService.getNotificationHistory(user!.id, 20),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dr-vital-notifications-pending'] });
      queryClient.invalidateQueries({ queryKey: ['dr-vital-notifications-history'] });
    },
  });

  // Agendar briefing matinal
  const scheduleBriefingMutation = useMutation({
    mutationFn: () => notificationService.scheduleMorningBriefing(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dr-vital-notifications-pending'] });
    },
  });

  // Agendar relatório semanal
  const scheduleWeeklyReportMutation = useMutation({
    mutationFn: () => notificationService.scheduleWeeklyReport(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dr-vital-notifications-pending'] });
    },
  });

  // Verificar inatividade
  const checkInactivityMutation = useMutation({
    mutationFn: () => notificationService.detectInactivity(user!.id),
  });

  return {
    // Data
    pendingNotifications: pendingNotifications || [],
    notificationHistory: notificationHistory || [],
    unreadCount: pendingNotifications?.filter(n => !n.readAt).length || 0,
    
    // Loading states
    isLoading: loadingPending || loadingHistory,
    loadingPending,
    loadingHistory,
    
    // Actions
    markAsRead: markAsReadMutation.mutate,
    scheduleBriefing: scheduleBriefingMutation.mutate,
    scheduleWeeklyReport: scheduleWeeklyReportMutation.mutate,
    checkInactivity: checkInactivityMutation.mutateAsync,
    refetch: refetchPending,
    
    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
  };
}

export default useNotifications;
