/**
 * Hook for WhatsApp Provider Configuration
 * Manages the toggle between Evolution and Whapi providers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// Types
// ============================================

export type WhatsAppProvider = 'evolution' | 'whapi';

export interface ProviderConfig {
  id: string;
  activeProvider: WhatsAppProvider;
  evolutionEnabled: boolean;
  whapiEnabled: boolean;
  evolutionApiUrl?: string;
  evolutionInstance?: string;
  evolutionHealthStatus?: 'healthy' | 'unhealthy' | 'unknown';
  evolutionLastHealthCheck?: string;
  whapiApiUrl?: string;
  whapiHealthStatus?: 'healthy' | 'unhealthy' | 'unknown';
  whapiLastHealthCheck?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ProviderStats {
  totalMessagesSent: number;
  messagesLast24h: number;
  successRate: number;
  lastMessageAt?: string;
}

// ============================================
// Query Keys
// ============================================

const QUERY_KEYS = {
  config: ['whatsapp', 'provider-config'],
  stats: (provider: WhatsAppProvider) => ['whatsapp', 'stats', provider],
};


// ============================================
// Hook: useWhatsAppProviderConfig
// ============================================

export function useWhatsAppProviderConfig() {
  const queryClient = useQueryClient();
  
  // Fetch current configuration
  const configQuery = useQuery({
    queryKey: QUERY_KEYS.config,
    queryFn: async (): Promise<ProviderConfig | null> => {
      const { data, error } = await supabase
        .from('whatsapp_provider_config')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (error) {
        console.error('[WhatsApp Config] Error fetching:', error);
        return null;
      }
      
      return {
        id: data.id,
        activeProvider: data.active_provider as WhatsAppProvider,
        evolutionEnabled: data.evolution_enabled,
        whapiEnabled: data.whapi_enabled,
        evolutionApiUrl: data.evolution_api_url,
        evolutionInstance: data.evolution_instance,
        evolutionHealthStatus: (data.evolution_health_status as 'healthy' | 'unhealthy' | 'unknown') || 'unknown',
        evolutionLastHealthCheck: data.evolution_last_health_check,
        whapiApiUrl: data.whapi_api_url,
        whapiHealthStatus: (data.whapi_health_status as 'healthy' | 'unhealthy' | 'unknown') || 'unknown',
        whapiLastHealthCheck: data.whapi_last_health_check,
        updatedAt: data.updated_at,
        updatedBy: data.updated_by,
      };
    },
    staleTime: 30000, // 30 seconds
  });
  
  // Toggle provider mutation
  const toggleMutation = useMutation({
    mutationFn: async (newProvider: WhatsAppProvider) => {
      // Use RPC function for atomic toggle
      const { data, error } = await supabase.rpc('toggle_whatsapp_provider', {
        new_provider: newProvider,
      });
      
      if (error) throw error;
      return data;
    },
    onMutate: async (newProvider) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.config });
      
      // Snapshot previous value
      const previousConfig = queryClient.getQueryData<ProviderConfig>(QUERY_KEYS.config);
      
      // Optimistically update
      if (previousConfig) {
        queryClient.setQueryData<ProviderConfig>(QUERY_KEYS.config, {
          ...previousConfig,
          activeProvider: newProvider,
          evolutionEnabled: newProvider === 'evolution',
          whapiEnabled: newProvider === 'whapi',
        });
      }
      
      return { previousConfig };
    },
    onError: (err, newProvider, context) => {
      // Rollback on error
      if (context?.previousConfig) {
        queryClient.setQueryData(QUERY_KEYS.config, context.previousConfig);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.config });
    },
  });
  
  return {
    config: configQuery.data,
    isLoading: configQuery.isLoading,
    isError: configQuery.isError,
    error: configQuery.error,
    toggleProvider: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    refetch: configQuery.refetch,
  };
}


// ============================================
// Hook: useWhatsAppProviderStats
// ============================================

export function useWhatsAppProviderStats(provider: WhatsAppProvider) {
  return useQuery({
    queryKey: QUERY_KEYS.stats(provider),
    queryFn: async (): Promise<ProviderStats> => {
      // A tabela whatsapp_message_logs pode não existir no schema atual
      // Retornar valores padrão para evitar erros de tipo
      return {
        totalMessagesSent: 0,
        messagesLast24h: 0,
        successRate: 100,
        lastMessageAt: undefined,
      };
    },
    staleTime: 60000, // 1 minute
  });
}

// ============================================
// Hook: useWhatsAppHealthCheck
// ============================================

export function useWhatsAppHealthCheck() {
  const queryClient = useQueryClient();
  
  const checkHealthMutation = useMutation({
    mutationFn: async (provider: WhatsAppProvider) => {
      const { data, error } = await supabase.functions.invoke('whatsapp-health-check', {
        body: { provider },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.config });
    },
  });
  
  return {
    checkHealth: checkHealthMutation.mutate,
    isChecking: checkHealthMutation.isPending,
  };
}
