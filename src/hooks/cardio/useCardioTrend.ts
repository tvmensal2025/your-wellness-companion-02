/**
 * useCardioTrend Hook
 * Analisa tendências de frequência cardíaca ao longo do tempo
 * 
 * Validates: Requirements 2.1, 2.6
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGoogleFitData } from '@/hooks/useGoogleFitData';
import {
  analyzeTrend,
  normalizeForSparkline,
  generateSparklinePath,
  hasEnoughDataForTrend,
  TrendResult,
  SparklinePoint,
} from '@/services/cardio/trendAnalyzer';

export interface CardioTrendData {
  trend: TrendResult;
  weeklyAverages: number[];
  sparklinePoints: SparklinePoint[];
  sparklinePath: string;
  hasEnoughData: boolean;
  isLoading: boolean;
  error: string | null;
  daysWithData: number;
}

export interface UseCardioTrendOptions {
  days?: number; // número de dias para análise (default: 7)
}

/**
 * Hook para análise de tendência cardiovascular
 */
export function useCardioTrend(options: UseCardioTrendOptions = {}) {
  const { days = 7 } = options;
  
  const { 
    data: googleFitData, 
    loading, 
    error, 
    isConnected,
    refetch 
  } = useGoogleFitData();

  const [trendData, setTrendData] = useState<CardioTrendData>({
    trend: {
      direction: 'insufficient',
      changePercent: 0,
      changeBpm: 0,
      message: 'Carregando...',
      color: 'text-muted-foreground',
      icon: 'help',
    },
    weeklyAverages: [],
    sparklinePoints: [],
    sparklinePath: '',
    hasEnoughData: false,
    isLoading: true,
    error: null,
    daysWithData: 0,
  });

  // Processar dados para análise de tendência
  const processTrendData = useCallback(() => {
    if (loading) {
      setTrendData(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (!isConnected) {
      setTrendData({
        trend: {
          direction: 'insufficient',
          changePercent: 0,
          changeBpm: 0,
          message: 'Conecte o Google Fit para ver tendências',
          color: 'text-muted-foreground',
          icon: 'help',
        },
        weeklyAverages: [],
        sparklinePoints: [],
        sparklinePath: '',
        hasEnoughData: false,
        isLoading: false,
        error: 'Google Fit não conectado',
        daysWithData: 0,
      });
      return;
    }

    if (!googleFitData || googleFitData.length === 0) {
      setTrendData({
        trend: {
          direction: 'insufficient',
          changePercent: 0,
          changeBpm: 0,
          message: 'Dados insuficientes - sincronize mais dias',
          color: 'text-muted-foreground',
          icon: 'help',
        },
        weeklyAverages: [],
        sparklinePoints: [],
        sparklinePath: '',
        hasEnoughData: false,
        isLoading: false,
        error: null,
        daysWithData: 0,
      });
      return;
    }

    // Filtrar e ordenar dados dos últimos N dias
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentData = googleFitData
      .filter(d => new Date(d.date) >= cutoffDate && d.heart_rate_avg && d.heart_rate_avg > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Extrair médias diárias
    const weeklyAverages = recentData.map(d => d.heart_rate_avg || 0);
    const dates = recentData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    });

    // Analisar tendência
    const trend = analyzeTrend(weeklyAverages);
    
    // Gerar dados para sparkline
    const sparklinePoints = normalizeForSparkline(weeklyAverages, dates);
    const sparklinePath = generateSparklinePath(sparklinePoints, 100, 40);

    setTrendData({
      trend,
      weeklyAverages,
      sparklinePoints,
      sparklinePath,
      hasEnoughData: hasEnoughDataForTrend(weeklyAverages),
      isLoading: false,
      error: null,
      daysWithData: recentData.length,
    });
  }, [googleFitData, loading, isConnected, days]);

  // Processar dados quando mudarem
  useEffect(() => {
    processTrendData();
  }, [processTrendData]);

  // Mensagem formatada para exibição
  const trendMessage = useMemo(() => {
    if (!trendData.hasEnoughData) {
      return `Sincronize mais ${3 - trendData.daysWithData} dia(s) para ver tendências`;
    }
    return trendData.trend.message;
  }, [trendData]);

  // Ícone baseado na direção da tendência
  const trendIcon = useMemo(() => {
    switch (trendData.trend.direction) {
      case 'improving':
        return '📈'; // Melhorando (FC diminuindo)
      case 'declining':
        return '📉'; // Piorando (FC aumentando)
      case 'stable':
        return '➡️'; // Estável
      default:
        return '❓'; // Dados insuficientes
    }
  }, [trendData.trend.direction]);

  return {
    ...trendData,
    trendMessage,
    trendIcon,
    refresh: refetch,
  };
}

export default useCardioTrend;
