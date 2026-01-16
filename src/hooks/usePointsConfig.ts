import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PointsConfig {
  id: string;
  action_type: string;
  action_name: string;
  points: number;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  category: string | null;
  multiplier: number;
  max_daily: number | null;
  created_at: string;
  updated_at: string;
}

export const usePointsConfig = () => {
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading, error } = useQuery({
    queryKey: ['points-configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_configuration')
        .select('*')
        .order('category', { ascending: true })
        .order('action_name', { ascending: true })
        .limit(200);

      if (error) throw error;
      return data as PointsConfig[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<PointsConfig> & { id: string }) => {
      const { id, ...data } = updates;
      const { error } = await supabase
        .from('points_configuration')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-configuration'] });
      toast.success('Configuração atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao salvar configuração');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: Array<Partial<PointsConfig> & { id: string }>) => {
      for (const update of updates) {
        const { id, ...data } = update;
        const { error } = await supabase
          .from('points_configuration')
          .update(data)
          .eq('id', id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-configuration'] });
      toast.success('Todas as configurações salvas!');
    },
    onError: (error) => {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    },
  });

  const getPoints = (actionType: string): number => {
    const config = configs.find(c => c.action_type === actionType && c.is_active);
    return config ? config.points * (config.multiplier || 1) : 0;
  };

  const getConfig = (actionType: string): PointsConfig | undefined => {
    return configs.find(c => c.action_type === actionType);
  };

  const getByCategory = (category: string): PointsConfig[] => {
    return configs.filter(c => c.category === category);
  };

  return {
    configs,
    isLoading,
    error,
    updateConfig: updateConfigMutation.mutate,
    bulkUpdate: bulkUpdateMutation.mutate,
    isSaving: updateConfigMutation.isPending || bulkUpdateMutation.isPending,
    getPoints,
    getConfig,
    getByCategory,
  };
};
