// =====================================================
// USE HEALTH ORACLE HOOK
// =====================================================
// Hook para gerenciar previsões de saúde
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useState, useCallback, useMemo } from 'react';
import {
  calculateRiskPredictions,
  simulateWhatIf,
  generateHealthyTwin,
  getActivePredictions,
} from '@/services/dr-vital/predictionService';
import type {
  HealthPrediction,
  WhatIfChange,
  WhatIfSimulation,
  HealthyTwin,
} from '@/types/dr-vital-revolution';

// =====================================================
// QUERY KEYS
// =====================================================

export const healthOracleKeys = {
  all: ['health-oracle'] as const,
  predictions: (userId: string) => [...healthOracleKeys.all, 'predictions', userId] as const,
  healthyTwin: (userId: string) => [...healthOracleKeys.all, 'healthy-twin', userId] as const,
  simulation: (userId: string) => [...healthOracleKeys.all, 'simulation', userId] as const,
};

// =====================================================
// MAIN HOOK
// =====================================================

export function useHealthOracle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const enabled = !!userId;

  // Local state for what-if simulation
  const [whatIfChanges, setWhatIfChanges] = useState<WhatIfChange[]>([]);
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulation | null>(null);

  // Query: Active Predictions
  const {
    data: predictions,
    isLoading: isLoadingPredictions,
    error: predictionsError,
    refetch: refetchPredictions,
  } = useQuery({
    queryKey: healthOracleKeys.predictions(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      return getActivePredictions(userId);
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes - predictions don't change often
  });

  // Query: Healthy Twin
  const {
    data: healthyTwin,
    isLoading: isLoadingTwin,
    error: twinError,
  } = useQuery({
    queryKey: healthOracleKeys.healthyTwin(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      return generateHealthyTwin(userId);
    },
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Mutation: Recalculate Predictions
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return calculateRiskPredictions(userId);
    },
    onSuccess: (newPredictions) => {
      queryClient.setQueryData(healthOracleKeys.predictions(userId || ''), newPredictions);
    },
  });

  // Mutation: Run What-If Simulation
  const simulateMutation = useMutation({
    mutationFn: async (changes: WhatIfChange[]) => {
      if (!userId) throw new Error('User not authenticated');
      return simulateWhatIf(userId, changes);
    },
    onSuccess: (result) => {
      setSimulationResult(result);
    },
  });

  // Actions
  const addWhatIfChange = useCallback((change: WhatIfChange) => {
    setWhatIfChanges(prev => {
      // Replace if same factor exists
      const filtered = prev.filter(c => c.factor !== change.factor);
      return [...filtered, change];
    });
  }, []);

  const removeWhatIfChange = useCallback((factor: string) => {
    setWhatIfChanges(prev => prev.filter(c => c.factor !== factor));
  }, []);

  const clearWhatIfChanges = useCallback(() => {
    setWhatIfChanges([]);
    setSimulationResult(null);
  }, []);

  const runSimulation = useCallback(() => {
    if (whatIfChanges.length > 0) {
      simulateMutation.mutate(whatIfChanges);
    }
  }, [whatIfChanges, simulateMutation]);

  // Derived values
  const highRiskPredictions = useMemo(() => {
    return predictions?.filter(p => p.probability >= 50) || [];
  }, [predictions]);

  const moderateRiskPredictions = useMemo(() => {
    return predictions?.filter(p => p.probability >= 25 && p.probability < 50) || [];
  }, [predictions]);

  const lowRiskPredictions = useMemo(() => {
    return predictions?.filter(p => p.probability < 25) || [];
  }, [predictions]);

  const overallRiskLevel = useMemo(() => {
    if (!predictions || predictions.length === 0) return 'unknown';
    const maxRisk = Math.max(...predictions.map(p => p.probability));
    if (maxRisk >= 60) return 'high';
    if (maxRisk >= 40) return 'moderate';
    if (maxRisk >= 20) return 'low';
    return 'minimal';
  }, [predictions]);

  const comparisonScore = healthyTwin?.comparisonScore ?? 0;

  return {
    // Data
    predictions: predictions || [],
    highRiskPredictions,
    moderateRiskPredictions,
    lowRiskPredictions,
    overallRiskLevel,
    healthyTwin,
    comparisonScore,
    
    // What-If Simulation
    whatIfChanges,
    simulationResult,
    
    // Loading states
    isLoading: isLoadingPredictions || isLoadingTwin,
    isLoadingPredictions,
    isLoadingTwin,
    isRecalculating: recalculateMutation.isPending,
    isSimulating: simulateMutation.isPending,
    
    // Error states
    error: predictionsError || twinError,
    simulationError: simulateMutation.error,
    
    // Actions
    recalculate: recalculateMutation.mutate,
    addWhatIfChange,
    removeWhatIfChange,
    clearWhatIfChanges,
    runSimulation,
    refetch: refetchPredictions,
  };
}

// =====================================================
// PREDICTION DETAILS HOOK
// =====================================================

export function usePredictionDetails(riskType: string) {
  const { predictions } = useHealthOracle();
  
  const prediction = useMemo(() => {
    return predictions.find(p => p.riskType === riskType) || null;
  }, [predictions, riskType]);

  const riskLevel = useMemo(() => {
    if (!prediction) return 'unknown';
    if (prediction.probability >= 60) return 'high';
    if (prediction.probability >= 40) return 'moderate';
    if (prediction.probability >= 20) return 'low';
    return 'minimal';
  }, [prediction]);

  const riskColor = useMemo(() => {
    switch (riskLevel) {
      case 'high': return 'red';
      case 'moderate': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  }, [riskLevel]);

  const topFactors = useMemo(() => {
    if (!prediction) return [];
    return prediction.factors
      .sort((a, b) => {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        return impactOrder[a.impact] - impactOrder[b.impact];
      })
      .slice(0, 3);
  }, [prediction]);

  return {
    prediction,
    riskLevel,
    riskColor,
    topFactors,
    recommendations: prediction?.recommendations || [],
    timeframe: prediction?.timeframe,
  };
}

// =====================================================
// HEALTHY TWIN HOOK
// =====================================================

export function useHealthyTwin() {
  const { user } = useAuth();
  const userId = user?.id;
  const enabled = !!userId;

  const {
    data: healthyTwin,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: healthOracleKeys.healthyTwin(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      return generateHealthyTwin(userId);
    },
    enabled,
    staleTime: 60 * 60 * 1000,
  });

  // Derived values
  const gaps = healthyTwin?.gaps || [];
  const highPriorityGaps = gaps.filter(g => g.priority === 'high');
  const mediumPriorityGaps = gaps.filter(g => g.priority === 'medium');
  
  const improvementSuggestions = useMemo(() => {
    const suggestions: string[] = [];
    
    for (const gap of highPriorityGaps) {
      if (gap.metric === 'weight') {
        suggestions.push(`Perder ${Math.round(gap.gap)}kg para alcançar o peso ideal`);
      }
      if (gap.metric === 'exerciseMinutes') {
        suggestions.push(`Aumentar exercícios em ${Math.round(gap.gap)} minutos por semana`);
      }
    }
    
    return suggestions;
  }, [highPriorityGaps]);

  return {
    healthyTwin,
    comparisonScore: healthyTwin?.comparisonScore ?? 0,
    gaps,
    highPriorityGaps,
    mediumPriorityGaps,
    improvementSuggestions,
    idealMetrics: healthyTwin?.idealMetrics,
    isLoading,
    error,
    refetch,
  };
}

// =====================================================
// WHAT-IF SIMULATOR HOOK
// =====================================================

export function useWhatIfSimulator() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const [changes, setChanges] = useState<WhatIfChange[]>([]);
  const [result, setResult] = useState<WhatIfSimulation | null>(null);

  const simulateMutation = useMutation({
    mutationFn: async (whatIfChanges: WhatIfChange[]) => {
      if (!userId) throw new Error('User not authenticated');
      return simulateWhatIf(userId, whatIfChanges);
    },
    onSuccess: setResult,
  });

  const addChange = useCallback((factor: string, currentValue: number, newValue: number) => {
    setChanges(prev => {
      const filtered = prev.filter(c => c.factor !== factor);
      return [...filtered, { factor, currentValue, newValue }];
    });
  }, []);

  const removeChange = useCallback((factor: string) => {
    setChanges(prev => prev.filter(c => c.factor !== factor));
  }, []);

  const reset = useCallback(() => {
    setChanges([]);
    setResult(null);
  }, []);

  const simulate = useCallback(() => {
    if (changes.length > 0) {
      simulateMutation.mutate(changes);
    }
  }, [changes, simulateMutation]);

  return {
    changes,
    result,
    addChange,
    removeChange,
    reset,
    simulate,
    isSimulating: simulateMutation.isPending,
    error: simulateMutation.error,
    hasChanges: changes.length > 0,
    improvementPercentage: result?.improvementPercentage ?? 0,
    insights: result?.insights ?? [],
  };
}

export default useHealthOracle;
