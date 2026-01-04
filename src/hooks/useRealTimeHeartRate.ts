import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HeartRateData {
  current: number;
  min: number;
  max: number;
  avg: number;
  lastUpdated: Date | null;
}

export const useRealTimeHeartRate = (isActive: boolean = true) => {
  const [heartRate, setHeartRate] = useState<HeartRateData>({
    current: 0,
    min: 0,
    max: 0,
    avg: 0,
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHeartRate = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsConnected(false);
        return;
      }

      // Verificar se o usuário tem Google Fit conectado
      const { data: profile } = await supabase
        .from('profiles')
        .select('google_fit_enabled')
        .eq('user_id', user.id)
        .single();

      if (!profile?.google_fit_enabled) {
        setIsConnected(false);
        setError('Google Fit não conectado');
        return;
      }

      setIsConnected(true);

      // Buscar dados mais recentes do Google Fit
      const today = new Date().toISOString().split('T')[0];
      
      const { data: fitData, error: fetchError } = await supabase
        .from('google_fit_data')
        .select('heart_rate_avg, heart_rate_min, heart_rate_max, heart_rate_resting, date, sync_timestamp, created_at')
        .eq('user_id', user.id)
        .gte('date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Erro ao buscar dados do Google Fit:', fetchError);
        setError('Erro ao buscar dados');
        return;
      }

      if (fitData) {
        const data = fitData as any;
        setHeartRate({
          current: data.heart_rate_avg || 0,
          min: data.heart_rate_min || 0,
          max: data.heart_rate_max || 0,
          avg: data.heart_rate_avg || 0,
          lastUpdated: data.sync_timestamp ? new Date(data.sync_timestamp) : (data.created_at ? new Date(data.created_at) : null)
        });
      } else {
        // Se não há dados de hoje, buscar o último registro disponível
        const { data: lastFitData } = await supabase
          .from('google_fit_data')
          .select('heart_rate_avg, heart_rate_min, heart_rate_max, heart_rate_resting, date, sync_timestamp, created_at')
          .eq('user_id', user.id)
          .not('heart_rate_avg', 'is', null)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastFitData) {
          const data = lastFitData as any;
          setHeartRate({
            current: data.heart_rate_avg || 0,
            min: data.heart_rate_min || 0,
            max: data.heart_rate_max || 0,
            avg: data.heart_rate_avg || 0,
            lastUpdated: data.sync_timestamp ? new Date(data.sync_timestamp) : (data.created_at ? new Date(data.created_at) : null)
          });
        }
      }
    } catch (err) {
      console.error('Erro ao buscar frequência cardíaca:', err);
      setError('Erro ao buscar dados');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sincronizar dados do Google Fit
  const syncHeartRate = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setError('Sessão expirada');
        return;
      }

      // Chamar edge function para sincronizar dados
      const { data, error: syncError } = await supabase.functions.invoke('google-fit-sync', {
        body: { action: 'sync' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (syncError) {
        console.error('Erro ao sincronizar:', syncError);
        setError('Erro ao sincronizar');
        return;
      }

      if (data?.success && data?.fitData?.heartRate) {
        setHeartRate({
          current: data.fitData.heartRate.avg || 0,
          min: data.fitData.heartRate.min || 0,
          max: data.fitData.heartRate.max || 0,
          avg: data.fitData.heartRate.avg || 0,
          lastUpdated: new Date()
        });
      }

      // Atualizar dados do banco após sincronização
      await fetchHeartRate();
    } catch (err) {
      console.error('Erro ao sincronizar frequência cardíaca:', err);
      setError('Erro ao sincronizar');
    } finally {
      setIsLoading(false);
    }
  }, [fetchHeartRate]);

  // Buscar dados iniciais e configurar polling
  useEffect(() => {
    if (!isActive) return;

    fetchHeartRate();

    // Atualizar a cada 30 segundos quando ativo
    const interval = setInterval(fetchHeartRate, 30000);

    return () => clearInterval(interval);
  }, [isActive, fetchHeartRate]);

  return {
    heartRate,
    isLoading,
    isConnected,
    error,
    refresh: fetchHeartRate,
    sync: syncHeartRate
  };
};
