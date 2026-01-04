import { useMemo } from 'react';

interface HealthScoreInput {
  // Dados de água
  waterTodayMl: number;
  waterGoalMl: number;
  
  // Dados de sono
  sleepHours: number;
  sleepQuality: number; // 1-5
  sleepGoalHours: number;
  
  // Dados de exercício
  exerciseMinutesToday: number;
  exerciseGoalMinutes: number;
  
  // Dados de peso (opcional)
  currentWeight?: number;
  targetWeight?: number;
  
  // Dados de humor (opcional)
  moodRating?: number; // 1-5
  stressLevel?: number; // 1-5
  
  // Streak de atividade
  currentStreak?: number;
}

interface HealthScoreResult {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  label: string;
  breakdown: {
    hydration: number;
    sleep: number;
    exercise: number;
    wellness: number;
    consistency: number;
  };
  insights: string[];
}

export const useHealthScore = (input: HealthScoreInput): HealthScoreResult => {
  return useMemo(() => {
    const {
      waterTodayMl,
      waterGoalMl,
      sleepHours,
      sleepQuality,
      sleepGoalHours,
      exerciseMinutesToday,
      exerciseGoalMinutes,
      currentWeight,
      targetWeight,
      moodRating = 3,
      stressLevel = 3,
      currentStreak = 0,
    } = input;

    // Calcular scores individuais (0-100)
    const hydrationScore = Math.min(100, (waterTodayMl / waterGoalMl) * 100);
    
    const sleepHoursScore = Math.min(100, (sleepHours / sleepGoalHours) * 100);
    const sleepQualityScore = (sleepQuality / 5) * 100;
    const sleepScore = (sleepHoursScore * 0.6 + sleepQualityScore * 0.4);
    
    const exerciseScore = Math.min(100, (exerciseMinutesToday / exerciseGoalMinutes) * 100);
    
    // Wellness (humor + stress invertido)
    const moodScore = (moodRating / 5) * 100;
    const stressScore = ((6 - stressLevel) / 5) * 100; // Inverter: menos stress = melhor
    const wellnessScore = (moodScore * 0.5 + stressScore * 0.5);
    
    // Consistência baseada em streak
    const consistencyScore = Math.min(100, currentStreak * 10); // 10 dias = 100%

    // Pesos para cada categoria
    const weights = {
      hydration: 0.20,
      sleep: 0.25,
      exercise: 0.25,
      wellness: 0.15,
      consistency: 0.15,
    };

    // Score final ponderado
    const totalScore = Math.round(
      hydrationScore * weights.hydration +
      sleepScore * weights.sleep +
      exerciseScore * weights.exercise +
      wellnessScore * weights.wellness +
      consistencyScore * weights.consistency
    );

    // Determinar grade e cor
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let color: string;
    let label: string;

    if (totalScore >= 90) {
      grade = 'A';
      color = 'from-emerald-500 to-green-600';
      label = 'Excelente';
    } else if (totalScore >= 75) {
      grade = 'B';
      color = 'from-green-500 to-teal-600';
      label = 'Muito Bom';
    } else if (totalScore >= 60) {
      grade = 'C';
      color = 'from-yellow-500 to-orange-600';
      label = 'Bom';
    } else if (totalScore >= 40) {
      grade = 'D';
      color = 'from-orange-500 to-red-600';
      label = 'Regular';
    } else {
      grade = 'F';
      color = 'from-red-500 to-rose-600';
      label = 'Precisa Melhorar';
    }

    // Gerar insights
    const insights: string[] = [];
    
    if (hydrationScore < 50) {
      insights.push('💧 Beba mais água hoje!');
    } else if (hydrationScore >= 100) {
      insights.push('💧 Hidratação perfeita!');
    }
    
    if (sleepScore < 50) {
      insights.push('😴 Priorize seu sono');
    } else if (sleepScore >= 80) {
      insights.push('😴 Ótimo descanso!');
    }
    
    if (exerciseScore < 30) {
      insights.push('🏃 Movimente-se mais');
    } else if (exerciseScore >= 80) {
      insights.push('🏃 Exercício em dia!');
    }
    
    if (currentStreak >= 7) {
      insights.push(`🔥 ${currentStreak} dias de streak!`);
    }
    
    if (stressLevel >= 4) {
      insights.push('🧘 Tente relaxar um pouco');
    }

    return {
      score: totalScore,
      grade,
      color,
      label,
      breakdown: {
        hydration: Math.round(hydrationScore),
        sleep: Math.round(sleepScore),
        exercise: Math.round(exerciseScore),
        wellness: Math.round(wellnessScore),
        consistency: Math.round(consistencyScore),
      },
      insights: insights.slice(0, 3), // Máximo 3 insights
    };
  }, [input]);
};

export default useHealthScore;
