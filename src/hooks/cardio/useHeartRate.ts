/**
 * useHeartRate Hook
 * Busca e processa dados de frequência cardíaca do Google Fit
 * 
 * Validates: Requirements 1.1, 1.3, 1.7
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGoogleFitData } from '@/hooks/useGoogleFitData';
import { 
  classifyHeartRateZone, 
  getZoneInfo, 
  HeartRateZone,
  ZoneInfo 
} from '@/services/cardio/zoneClassifier';

export interface HeartRateData {
  currentBpm: number | null;
  zone: HeartRateZone;
  zoneInfo: ZoneInfo;
  lastUpdated: Date | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  avgBpm: number;
  maxBpm: number;
  minBpm: number;
}

export interface UseHeartRateOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // em ms
}

/**
 * Hook para obter dados de frequência cardíaca em tempo real
 * Property 2: Most Recent Heart Rate Selection
 */
export function useHeartRate(options: UseHeartRateOptions = {}) {
  const { autoRefresh = false, refreshInterval = 60000 } = options;
  
  const { 
    data: googleFitData, 
    loading, 
    error, 
    isConnected, 
    lastSync,
    refetch 
  } = useGoogleFitData();

  const [heartRateData, setHeartRateData] = useState<HeartRateData>({
    currentBpm: null,
    zone: 'unknown',
    zoneInfo: getZoneInfo('unknown'),
    lastUpdated: null,
    isConnected: false,
    isLoading: true,
    error: null,
    avgBpm: 0,
    maxBpm: 0,
    minBpm: 0,
  });

  // Processar dados do Google Fit para extrair FC mais recente
  const processHeartRateData = useCallback(() => {
    if (loading) {
      setHeartRateData(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (!isConnected) {
      setHeartRateData({
        currentBpm: null,
        zone: 'unknown',
        zoneInfo: getZoneInfo('unknown'),
        lastUpdated: null,
        isConnected: false,
        isLoading: false,
        error: 'Conecte o Google Fit para ver seus dados cardíacos',
        avgBpm: 0,
        maxBpm: 0,
        minBpm: 0,
      });
      return;
    }

    if (!googleFitData || googleFitData.length === 0) {
      setHeartRateData({
        currentBpm: null,
        zone: 'unknown',
        zoneInfo: getZoneInfo('unknown'),
        lastUpdated: lastSync ? new Date(lastSync) : null,
        isConnected: true,
        isLoading: false,
        error: 'Nenhum dado cardíaco encontrado. Use seu smartwatch.',
        avgBpm: 0,
        maxBpm: 0,
        minBpm: 0,
      });
      return;
    }

    // Encontrar o registro mais recente com dados de FC
    // Property 2: Most Recent Heart Rate Selection
    const sortedData = [...googleFitData]
      .filter(d => d.heart_rate_avg && d.heart_rate_avg > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedData.length === 0) {
      setHeartRateData({
        currentBpm: null,
        zone: 'unknown',
        zoneInfo: getZoneInfo('unknown'),
        lastUpdated: lastSync ? new Date(lastSync) : null,
        isConnected: true,
        isLoading: false,
        error: 'Nenhum dado de frequência cardíaca disponível',
        avgBpm: 0,
        maxBpm: 0,
        minBpm: 0,
      });
      return;
    }

    const mostRecent = sortedData[0];
    const currentBpm = mostRecent.heart_rate_avg || null;
    const zone = classifyHeartRateZone(currentBpm);
    
    // Calcular estatísticas dos últimos 7 dias
    const last7Days = sortedData.slice(0, 7);
    const avgBpm = last7Days.length > 0
      ? Math.round(last7Days.reduce((sum, d) => sum + (d.heart_rate_avg || 0), 0) / last7Days.length)
      : 0;
    
    const maxBpm = Math.max(...last7Days.map(d => d.heart_rate_max || 0));
    const minBpm = Math.min(...last7Days.filter(d => d.heart_rate_min && d.heart_rate_min > 0).map(d => d.heart_rate_min || 0)) || 0;

    setHeartRateData({
      currentBpm,
      zone,
      zoneInfo: getZoneInfo(zone),
      lastUpdated: new Date(mostRecent.sync_timestamp || mostRecent.date),
      isConnected: true,
      isLoading: false,
      error: null,
      avgBpm,
      maxBpm,
      minBpm,
    });
  }, [googleFitData, loading, isConnected, lastSync]);

  // Processar dados quando mudarem
  useEffect(() => {
    processHeartRateData();
  }, [processHeartRateData]);

  // Auto-refresh opcional
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  // Formatar timestamp para exibição
  const formattedLastUpdate = useMemo(() => {
    if (!heartRateData.lastUpdated) return null;
    
    const now = new Date();
    const diff = now.getTime() - heartRateData.lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    
    return heartRateData.lastUpdated.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [heartRateData.lastUpdated]);

  return {
    ...heartRateData,
    formattedLastUpdate,
    refresh: refetch,
  };
}

export default useHeartRate;
