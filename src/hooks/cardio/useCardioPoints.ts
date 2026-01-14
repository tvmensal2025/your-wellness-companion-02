/**
 * useCardioPoints Hook
 * Calcula e gerencia pontos cardio baseados em atividade física
 * 
 * Validates: Requirements 3.5, 3.7, 3.8
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGoogleFitData } from '@/hooks/useGoogleFitData';
import { useUserDataCache } from '@/hooks/useUserDataCache';
import {
  calculateProgressPercent,
  calculateDayComparison,
  estimatePointsFromActiveMinutes,
  DEFAULT_DAILY_GOAL,
} from '@/services/cardio/pointsCalculator';

export interface CardioPointsData {
  todayPoints: number;
  yesterdayPoints: number;
  dailyGoal: number;
  progressPercent: number;
  comparison: {
    difference: number;
    percentChange: number;
    trend: 'up' | 'down' | 'same';
  };
  zoneBreakdown: {
    fatBurn: number;
    cardio: number;
    peak: number;
  };
  isLoading: boolean;
  error: string | null;
  goalReached: boolean;
}

export interface UseCardioPointsOptions {
  dailyGoal?: number;
  persistToDatabase?: boolean;
}

/**
 * Hook para gerenciar pontos cardio diários
 */
export function useCardioPoints(options: UseCardioPointsOptions = {}) {
  const { dailyGoal = DEFAULT_DAILY_GOAL, persistToDatabase = true } = options;
  
  const { data: userData } = useUserDataCache();
  const { 
    data: googleFitData, 
    loading, 
    isConnected,
    refetch 
  } = useGoogleFitData();

  const [pointsData, setPointsData] = useState<CardioPointsData>({
    todayPoints: 0,
    yesterdayPoints: 0,
    dailyGoal,
    progressPercent: 0,
    comparison: { difference: 0, percentChange: 0, trend: 'same' },
    zoneBreakdown: { fatBurn: 0, cardio: 0, peak: 0 },
    isLoading: true,
    error: null,
    goalReached: false,
  });

  // Usar idade diretamente do cache (já calculada)
  const userAge = useMemo(() => {
    return userData.physicalData?.idade || 30; // fallback
  }, [userData.physicalData?.idade]);

  // Buscar pontos de ontem do Google Fit (dados do dia anterior)
  const fetchYesterdayPoints = useCallback((fitData: Array<{ date: string; active_minutes?: number; heart_rate_avg?: number }> | null): number => {
    if (!fitData || fitData.length === 0) return 0;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const yesterdayData = fitData.find(d => d.date === yesterdayStr);
    if (!yesterdayData) return 0;
    
    const activeMinutes = yesterdayData.active_minutes || 0;
    const avgHeartRate = yesterdayData.heart_rate_avg || 0;
    
    return estimatePointsFromActiveMinutes(activeMinutes, avgHeartRate, userAge);
  }, [userAge]);

  // Log pontos para debug (persistência futura quando tabela existir)
  const logPoints = useCallback((
    points: number,
    breakdown: { fatBurn: number; cardio: number; peak: number },
    avgHR: number
  ) => {
    if (!persistToDatabase) return;
    
    // TODO: Persistir quando tabela cardio_points_history existir
    console.debug('[CardioPoints] Today:', {
      points,
      breakdown,
      avgHR,
      date: new Date().toISOString().split('T')[0],
    });
  }, [persistToDatabase]);

  // Processar dados para calcular pontos
  const processPointsData = useCallback(async () => {
    if (loading) {
      setPointsData(prev => ({ ...prev, isLoading: true }));
      return;
    }

    const userId = userData.user?.id;

    if (!isConnected || !userId) {
      setPointsData({
        todayPoints: 0,
        yesterdayPoints: 0,
        dailyGoal,
        progressPercent: 0,
        comparison: { difference: 0, percentChange: 0, trend: 'same' },
        zoneBreakdown: { fatBurn: 0, cardio: 0, peak: 0 },
        isLoading: false,
        error: 'Conecte o Google Fit para ganhar pontos cardio',
        goalReached: false,
      });
      return;
    }

    // Buscar dados de hoje
    const today = new Date().toISOString().split('T')[0];
    const todayData = googleFitData?.find(d => d.date === today);

    // Calcular pontos baseados em minutos ativos e FC média
    const activeMinutes = todayData?.active_minutes || 0;
    const avgHeartRate = todayData?.heart_rate_avg || 0;
    
    // Estimar pontos baseados nos dados disponíveis
    const todayPoints = estimatePointsFromActiveMinutes(activeMinutes, avgHeartRate, userAge);

    // Estimar breakdown por zona (simplificado)
    const zoneBreakdown = {
      fatBurn: Math.round(activeMinutes * 0.5), // 50% em fat burn
      cardio: Math.round(activeMinutes * 0.35), // 35% em cardio
      peak: Math.round(activeMinutes * 0.15), // 15% em peak
    };

    // Buscar pontos de ontem do Google Fit
    const yesterdayPoints = fetchYesterdayPoints(googleFitData);

    // Calcular comparação
    const comparison = calculateDayComparison(todayPoints, yesterdayPoints);

    // Calcular progresso
    const progressPercent = calculateProgressPercent(todayPoints, dailyGoal);
    const goalReached = progressPercent >= 100;

    // Log pontos para debug
    if (todayPoints > 0) {
      logPoints(todayPoints, zoneBreakdown, avgHeartRate);
    }

    setPointsData({
      todayPoints,
      yesterdayPoints,
      dailyGoal,
      progressPercent,
      comparison,
      zoneBreakdown,
      isLoading: false,
      error: null,
      goalReached,
    });
  }, [
    googleFitData, 
    loading, 
    isConnected, 
    userData.user?.id, 
    userAge, 
    dailyGoal,
    fetchYesterdayPoints,
    logPoints
  ]);

  // Processar dados quando mudarem
  useEffect(() => {
    processPointsData();
  }, [processPointsData]);

  // Texto formatado para comparação
  const comparisonText = useMemo(() => {
    const { difference, trend } = pointsData.comparison;
    if (trend === 'same') return 'Igual a ontem';
    const sign = difference > 0 ? '+' : '';
    return `${sign}${difference} vs ontem`;
  }, [pointsData.comparison]);

  // Cor baseada no progresso
  const progressColor = useMemo(() => {
    if (pointsData.progressPercent >= 100) return 'text-emerald-500';
    if (pointsData.progressPercent >= 70) return 'text-yellow-500';
    if (pointsData.progressPercent >= 40) return 'text-orange-500';
    return 'text-red-500';
  }, [pointsData.progressPercent]);

  return {
    ...pointsData,
    comparisonText,
    progressColor,
    refresh: refetch,
  };
}

export default useCardioPoints;
