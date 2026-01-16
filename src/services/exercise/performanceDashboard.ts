// ============================================
// 📊 PERFORMANCE DASHBOARD SERVICE
// Analytics e insights de performance
// ============================================

import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';

// Local types - extended for internal use
interface WorkoutStats {
  totalWorkouts: number;
  totalDuration?: number;
  totalDurationMinutes?: number;
  totalVolume: number;
  avgDifficulty: number;
  avgWorkoutDuration?: number;
  personalRecords?: any[];
  weeklyData?: any[];
  consistency?: number;
  currentStreak?: number;
  longestStreak?: number;
  trends?: { volume: string; duration: string; frequency: string };
  periodDays?: number;
}

interface ProgressInsight {
  type: string;
  title: string;
  description: string;
  priority?: string;
  category?: string;
  metric?: number;
  recommendation?: string;
  actionItems?: string[];
}

// Local GoalPrediction type (extended)
interface LocalGoalPrediction {
  goalType: string;
  targetValue: number;
  currentValue: number;
  predictedDate?: Date | null;
  confidence: number;
  weeklyProgress: number;
  weeksToGoal?: number;
  recommendations: string[];
}

// Local BenchmarkComparison type (extended)
interface LocalBenchmarkComparison {
  userPercentile?: number;
  percentile?: number;
  comparedToAverage: number;
  strengths: string[];
  areasToImprove: string[];
  similarUsers: number;
  levelDistribution?: Record<number, number>;
}

// ============================================
// CONSTANTS
// ============================================

const INSIGHT_THRESHOLDS = {
  consistencyGood: 0.8,
  consistencyWarning: 0.5,
  progressGood: 0.1,
  progressStagnant: 0.02,
};

const BENCHMARK_PERCENTILES = [25, 50, 75, 90, 95];

// ============================================
// PERFORMANCE DASHBOARD CLASS
// ============================================

export class PerformanceDashboard {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ============================================
  // WORKOUT STATISTICS
  // ============================================

  async getWorkoutStats(days: number = 30): Promise<WorkoutStats> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Usar user_exercise_history em vez de exercise_performance_metrics
    const { data: workouts } = await supabase
      .from('user_exercise_history')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', startDate.toISOString())
      .limit(500);

    if (!workouts || workouts.length === 0) {
      return this.getEmptyStats();
    }

    // Calcular estatísticas
    const totalWorkouts = this.countUniqueWorkoutDays(workouts as Array<{ created_at: string }>);
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration_seconds || 0), 0);
    const totalVolume = workouts.reduce((sum, w) => 
      sum + (w.sets_completed || 0) * (w.reps_completed || 0) * (w.weight_used || 1), 0);

    // Calcular consistência (dias treinados / dias esperados)
    const expectedWorkouts = Math.floor(days / 7) * 4; // 4x por semana
    const consistency = Math.min(1, totalWorkouts / expectedWorkouts);

    // Calcular médias
    const avgDuration = totalDuration / workouts.length;
    // Converter difficulty_level para número
    const difficultyMap: Record<string, number> = { 'easy': 3, 'medium': 5, 'hard': 7, 'extreme': 9 };
    const avgDifficulty = workouts
      .filter(w => w.difficulty_level)
      .reduce((sum, w) => sum + (difficultyMap[w.difficulty_level || 'medium'] || 5), 0) / workouts.length || 5;

    // Calcular tendências
    const trends = await this.calculateTrends(workouts as Array<Record<string, unknown>>);

    return {
      totalWorkouts,
      totalDurationMinutes: Math.round(totalDuration / 60),
      totalVolume: Math.round(totalVolume),
      avgWorkoutDuration: Math.round(avgDuration / 60),
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
      consistency,
      currentStreak: await this.getCurrentStreak(),
      longestStreak: await this.getLongestStreak(),
      trends,
      periodDays: days,
    };
  }

  private countUniqueWorkoutDays(workouts: Array<{ created_at: string }>): number {
    const uniqueDays = new Set(
      workouts.map(w => new Date(w.created_at).toISOString().split('T')[0])
    );
    return uniqueDays.size;
  }

  private getEmptyStats(): WorkoutStats {
    return {
      totalWorkouts: 0,
      totalDurationMinutes: 0,
      totalVolume: 0,
      avgWorkoutDuration: 0,
      avgDifficulty: 0,
      consistency: 0,
      currentStreak: 0,
      longestStreak: 0,
      trends: { volume: 'stable', duration: 'stable', frequency: 'stable' },
      periodDays: 30,
    };
  }

  private async calculateTrends(
    workouts: Array<Record<string, unknown>>
  ): Promise<{ volume: string; duration: string; frequency: string }> {
    if (workouts.length < 4) {
      return { volume: 'stable', duration: 'stable', frequency: 'stable' };
    }

    // Dividir em duas metades
    const midpoint = Math.floor(workouts.length / 2);
    const firstHalf = workouts.slice(midpoint);
    const secondHalf = workouts.slice(0, midpoint);

    // Calcular médias de cada metade
    const avgVolume1 = firstHalf.reduce((sum, w) => 
      sum + ((w.sets_completed as number) || 0) * ((w.reps_completed as number) || 0), 0) / firstHalf.length;
    const avgVolume2 = secondHalf.reduce((sum, w) => 
      sum + ((w.sets_completed as number) || 0) * ((w.reps_completed as number) || 0), 0) / secondHalf.length;

    const avgDuration1 = firstHalf.reduce((sum, w) => sum + ((w.duration_seconds as number) || 0), 0) / firstHalf.length;
    const avgDuration2 = secondHalf.reduce((sum, w) => sum + ((w.duration_seconds as number) || 0), 0) / secondHalf.length;

    return {
      volume: this.getTrendDirection(avgVolume1, avgVolume2),
      duration: this.getTrendDirection(avgDuration1, avgDuration2),
      frequency: 'stable', // Calculado separadamente
    };
  }

  private getTrendDirection(oldValue: number, newValue: number): string {
    if (oldValue === 0) return 'stable';
    const change = (newValue - oldValue) / oldValue;
    if (change > INSIGHT_THRESHOLDS.progressGood) return 'increasing';
    if (change < -INSIGHT_THRESHOLDS.progressGood) return 'decreasing';
    return 'stable';
  }

  private async getCurrentStreak(): Promise<number> {
    // Usar user_points em vez de exercise_streaks
    const { data } = await supabase
      .from('user_points')
      .select('current_streak')
      .eq('user_id', this.userId)
      .maybeSingle();

    return data?.current_streak || 0;
  }

  private async getLongestStreak(): Promise<number> {
    // Usar user_points em vez de exercise_streaks
    const { data } = await supabase
      .from('user_points')
      .select('best_streak')
      .eq('user_id', this.userId)
      .maybeSingle();

    return data?.best_streak || 0;
  }

  // ============================================
  // PROGRESS INSIGHTS
  // ============================================

  async generateInsights(): Promise<ProgressInsight[]> {
    const insights: ProgressInsight[] = [];
    const stats = await this.getWorkoutStats(30);
    const previousStats = await this.getWorkoutStats(60);

    // Insight de consistência
    if (stats.consistency >= INSIGHT_THRESHOLDS.consistencyGood) {
      insights.push({
        type: 'positive',
        category: 'consistency',
        title: 'Excelente consistência!',
        description: `Você treinou ${stats.totalWorkouts} dias nos últimos 30 dias. Continue assim!`,
        metric: stats.consistency,
        recommendation: 'Mantenha essa frequência para resultados ótimos.',
      });
    } else if (stats.consistency < INSIGHT_THRESHOLDS.consistencyWarning) {
      insights.push({
        type: 'warning',
        category: 'consistency',
        title: 'Consistência pode melhorar',
        description: `Sua frequência de treino está em ${Math.round(stats.consistency * 100)}%.`,
        metric: stats.consistency,
        recommendation: 'Tente estabelecer horários fixos para treinar.',
      });
    }

    // Insight de progresso de volume
    if (stats.trends.volume === 'increasing') {
      insights.push({
        type: 'positive',
        category: 'progress',
        title: 'Volume em crescimento',
        description: 'Seu volume de treino está aumentando progressivamente.',
        recommendation: 'Ótimo progresso! Monitore a recuperação.',
      });
    } else if (stats.trends.volume === 'decreasing') {
      insights.push({
        type: 'warning',
        category: 'progress',
        title: 'Volume diminuindo',
        description: 'Seu volume de treino diminuiu recentemente.',
        recommendation: 'Verifique se está descansando adequadamente.',
      });
    }

    // Insight de streak
    if (stats.currentStreak >= 7) {
      insights.push({
        type: 'achievement',
        category: 'streak',
        title: `${stats.currentStreak} dias de streak!`,
        description: 'Você está em uma sequência incrível de treinos.',
        metric: stats.currentStreak,
        recommendation: 'Não quebre a sequência! Cada dia conta.',
      });
    }

    // Insight de melhoria vs período anterior
    if (previousStats.totalWorkouts > 0) {
      const improvement = (stats.totalWorkouts - previousStats.totalWorkouts / 2) / (previousStats.totalWorkouts / 2);
      if (improvement > 0.2) {
        insights.push({
          type: 'positive',
          category: 'improvement',
          title: 'Melhoria significativa',
          description: `Você treinou ${Math.round(improvement * 100)}% mais que o período anterior.`,
          metric: improvement,
        });
      }
    }

    return insights;
  }

  // ============================================
  // GOAL PREDICTIONS
  // ============================================

  async predictGoalTimeline(
    goalType: 'weight_loss' | 'strength' | 'endurance' | 'consistency' | 'custom',
    targetValue: number,
    currentValue: number
  ): Promise<LocalGoalPrediction> {
    // Buscar histórico de progresso
    const history = await this.getProgressHistory(goalType, 90);
    
    if (history.length < 2) {
      return {
        goalType,
        targetValue,
        currentValue,
        predictedDate: null,
        confidence: 0,
        weeklyProgress: 0,
        recommendations: ['Continue treinando para gerar dados suficientes para previsão.'],
      };
    }

    // Calcular taxa de progresso
    const weeklyProgress = this.calculateWeeklyProgress(history);
    const remaining = targetValue - currentValue;
    const weeksNeeded = remaining / (weeklyProgress || 0.01);

    // Calcular data prevista
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + Math.ceil(weeksNeeded * 7));

    // Calcular confiança baseada na consistência dos dados
    const confidence = this.calculatePredictionConfidence(history, weeklyProgress);

    // Gerar recomendações
    const recommendations = this.generateGoalRecommendations(
      goalType,
      weeklyProgress,
      weeksNeeded
    );

    return {
      goalType,
      targetValue,
      currentValue,
      predictedDate,
      confidence,
      weeklyProgress,
      weeksToGoal: Math.ceil(weeksNeeded),
      recommendations,
    };
  }

  private async getProgressHistory(
    goalType: string,
    days: number
  ): Promise<Array<{ date: Date; value: number }>> {
    // Buscar dados baseado no tipo de objetivo
    let tableName = 'weight_measurements';
    let valueColumn = 'weight_kg';

    if (goalType === 'strength') {
      tableName = 'exercise_performance_metrics';
      valueColumn = 'weight_used';
    }

    const { data } = await (fromTable(tableName) as any)
      .select(`created_at, ${valueColumn}`)
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at');

    return (data || []).map((d: any) => ({
      date: new Date(d.created_at),
      value: d[valueColumn] || 0,
    }));
  }

  private calculateWeeklyProgress(
    history: Array<{ date: Date; value: number }>
  ): number {
    if (history.length < 2) return 0;

    const first = history[0];
    const last = history[history.length - 1];
    const daysDiff = (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24);
    const weeksDiff = daysDiff / 7;

    if (weeksDiff === 0) return 0;
    return (last.value - first.value) / weeksDiff;
  }

  private calculatePredictionConfidence(
    history: Array<{ date: Date; value: number }>,
    weeklyProgress: number
  ): number {
    if (history.length < 4) return 0.3;

    // Calcular variância do progresso
    const values = history.map(h => h.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Menor variância = maior confiança
    const varianceScore = Math.max(0, 1 - stdDev / (avg || 1));

    // Mais dados = maior confiança
    const dataScore = Math.min(1, history.length / 20);

    // Progresso consistente = maior confiança
    const progressScore = weeklyProgress !== 0 ? 0.8 : 0.3;

    return (varianceScore * 0.4 + dataScore * 0.3 + progressScore * 0.3);
  }

  private generateGoalRecommendations(
    goalType: string,
    weeklyProgress: number,
    weeksNeeded: number
  ): string[] {
    const recommendations: string[] = [];

    if (weeksNeeded > 52) {
      recommendations.push('Meta de longo prazo - divida em metas menores.');
    }

    if (weeklyProgress <= 0) {
      recommendations.push('Progresso estagnado - revise sua estratégia.');
    }

    switch (goalType) {
      case 'weight_loss':
        recommendations.push('Mantenha déficit calórico moderado (300-500 kcal).');
        recommendations.push('Priorize proteína para preservar massa muscular.');
        break;
      case 'muscle_gain':
        recommendations.push('Garanta superávit calórico de 200-300 kcal.');
        recommendations.push('Progressão de carga é essencial.');
        break;
      case 'strength':
        recommendations.push('Foque em exercícios compostos.');
        recommendations.push('Descanse 2-3 minutos entre séries pesadas.');
        break;
      case 'endurance':
        recommendations.push('Aumente volume gradualmente (10% por semana).');
        recommendations.push('Inclua treinos de recuperação ativa.');
        break;
    }

    return recommendations;
  }

  // ============================================
  // BENCHMARK COMPARISONS
  // ============================================

  async getBenchmarkComparison(): Promise<LocalBenchmarkComparison> {
    // Buscar dados do usuário
    const myStats = await this.getWorkoutStats(30);
    // Usar user_points em vez de exercise_gamification_points
    const { data: myPoints } = await supabase
      .from('user_points')
      .select('total_points, level')
      .eq('user_id', this.userId)
      .maybeSingle();

    // Buscar dados agregados de todos os usuários
    const { data: allUsers } = await supabase
      .from('user_points')
      .select('total_points, level')
      .limit(1000);

    if (!allUsers || allUsers.length === 0) {
      return {
        userPercentile: 50,
        comparedToAverage: 0,
        strengths: [],
        areasToImprove: [],
        similarUsers: 0,
      };
    }

    // Calcular percentil do usuário
    const myTotalPoints = myPoints?.total_points || 0;
    const sortedPoints = allUsers.map(u => u.total_points || 0).sort((a, b) => a - b);
    const userRank = sortedPoints.filter(p => p < myTotalPoints).length;
    const percentile = Math.round((userRank / sortedPoints.length) * 100);

    // Calcular média
    const avgPoints = sortedPoints.reduce((a, b) => a + b, 0) / sortedPoints.length;
    const comparedToAverage = avgPoints > 0 ? ((myTotalPoints - avgPoints) / avgPoints) * 100 : 0;

    // Identificar pontos fortes e fracos
    const strengths: string[] = [];
    const areasToImprove: string[] = [];

    if (myStats.consistency > 0.7) strengths.push('Consistência de treino');
    else areasToImprove.push('Frequência de treino');

    if ((myStats.currentStreak || 0) > 7) strengths.push('Manutenção de streak');
    if (myStats.avgDifficulty > 6) strengths.push('Intensidade de treino');
    else if (myStats.avgDifficulty < 5) areasToImprove.push('Intensidade pode aumentar');

    // Contar usuários similares (mesmo nível ±1)
    const myLevel = myPoints?.level || 1;
    const similarUsers = allUsers.filter(u => 
      Math.abs((u.level || 1) - myLevel) <= 1
    ).length;

    return {
      userPercentile: percentile,
      comparedToAverage: Math.round(comparedToAverage),
      strengths,
      areasToImprove,
      similarUsers,
      levelDistribution: this.calculateLevelDistribution(allUsers.map(u => ({ current_level: u.level || 1 }))),
    };
  }

  private calculateLevelDistribution(
    users: Array<{ current_level: number }>
  ): Record<number, number> {
    const distribution: Record<number, number> = {};
    
    users.forEach(u => {
      const level = u.current_level || 1;
      distribution[level] = (distribution[level] || 0) + 1;
    });

    return distribution;
  }

  // ============================================
  // EXPORT & REPORTS
  // ============================================

  async generateReport(
    startDate: Date,
    endDate: Date,
    format: 'summary' | 'detailed' = 'summary'
  ): Promise<{
    period: { start: Date; end: Date };
    stats: WorkoutStats;
    insights: ProgressInsight[];
    exercises: Array<{ code: string; count: number; avgWeight: number }>;
    recommendations: string[];
  }> {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const stats = await this.getWorkoutStats(days);
    const insights = await this.generateInsights();

    // Buscar exercícios mais realizados - usando user_exercise_history
    const { data: exerciseData } = await supabase
      .from('user_exercise_history')
      .select('exercise_name, weight_used')
      .eq('user_id', this.userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Agrupar por exercício
    const exerciseMap: Record<string, { count: number; totalWeight: number }> = {};
    (exerciseData || []).forEach(e => {
      const exerciseName = e.exercise_name || 'unknown';
      if (!exerciseMap[exerciseName]) {
        exerciseMap[exerciseName] = { count: 0, totalWeight: 0 };
      }
      exerciseMap[exerciseName].count++;
      exerciseMap[exerciseName].totalWeight += e.weight_used || 0;
    });

    const exercises = Object.entries(exerciseMap)
      .map(([code, data]) => ({
        code,
        count: data.count,
        avgWeight: data.count > 0 ? Math.round(data.totalWeight / data.count) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Gerar recomendações baseadas nos dados
    const recommendations = this.generateReportRecommendations(stats, insights);

    return {
      period: { start: startDate, end: endDate },
      stats,
      insights,
      exercises,
      recommendations,
    };
  }

  private generateReportRecommendations(
    stats: WorkoutStats,
    insights: ProgressInsight[]
  ): string[] {
    const recommendations: string[] = [];

    if (stats.consistency < 0.6) {
      recommendations.push('Aumente a frequência de treinos para pelo menos 3-4x por semana.');
    }

    if (stats.avgDifficulty < 5) {
      recommendations.push('Considere aumentar a intensidade dos treinos.');
    }

    if (stats.trends.volume === 'decreasing') {
      recommendations.push('Seu volume está diminuindo - verifique recuperação e motivação.');
    }

    const warningInsights = insights.filter(i => i.type === 'warning');
    warningInsights.forEach(i => {
      if (i.recommendation) recommendations.push(i.recommendation);
    });

    if (recommendations.length === 0) {
      recommendations.push('Continue com o excelente trabalho!');
      recommendations.push('Considere novos desafios para continuar progredindo.');
    }

    return recommendations;
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createPerformanceDashboard(userId: string): PerformanceDashboard {
  return new PerformanceDashboard(userId);
}

export default PerformanceDashboard;
