// =====================================================
// USE REPORTS HOOK - Dr. Vital
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { reportService } from '@/services/dr-vital/reportService';
import type { HealthReport, ReportType, DateRange } from '@/types/dr-vital-revolution';

export function useReports() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const enabled = !!user?.id;

  // Buscar relatórios do usuário
  const {
    data: reports,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['dr-vital-reports', user?.id],
    queryFn: () => reportService.getUserReports(user!.id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Gerar novo relatório
  const generateMutation = useMutation({
    mutationFn: ({ type, period }: { type: ReportType; period?: DateRange }) =>
      reportService.generateReport(user!.id, type, period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dr-vital-reports'] });
    },
  });

  // Criar link compartilhável
  const shareMutation = useMutation({
    mutationFn: (reportId: string) => reportService.createShareableLink(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dr-vital-reports'] });
    },
  });

  // Revogar link compartilhável
  const revokeMutation = useMutation({
    mutationFn: (reportId: string) => reportService.revokeShareableLink(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dr-vital-reports'] });
    },
  });

  // Registrar download
  const trackDownloadMutation = useMutation({
    mutationFn: (reportId: string) => reportService.trackDownload(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dr-vital-reports'] });
    },
  });

  return {
    // Data
    reports: reports || [],
    
    // Loading states
    isLoading,
    isGenerating: generateMutation.isPending,
    isSharing: shareMutation.isPending,
    
    // Actions
    generateReport: generateMutation.mutateAsync,
    createShareableLink: shareMutation.mutateAsync,
    revokeShareableLink: revokeMutation.mutate,
    trackDownload: trackDownloadMutation.mutate,
    refetch,
    
    // Latest report
    latestReport: reports?.[0],
  };
}

export default useReports;
