// ============================================
// 🏥 INJURY PREDICTOR SERVICE
// Sistema de prevenção e predição de lesões
// ============================================

import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';
import type {
  RiskFactor,
  InjuryRiskAssessment,
  PainReport,
} from '@/types/advanced-exercise-system';

// Local type for recovery protocol
interface RecoveryProtocol {
  phase: 'acute' | 'subacute' | 'remodeling' | 'return_to_activity';
  durationDays: number;
  activities: string[];
  restrictions: string[];
  progressionCriteria: string[];
}

// Local type for injury risk
interface InjuryRisk {
  overallLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
  nextAssessmentDate: Date;
}

// ============================================
// CONSTANTS
// ============================================

const RISK_THRESHOLDS = {
  overtraining: {
    workoutsPerWeek: 7,
    consecutiveDays: 5,
    highIntensityStreak: 4,
  },
  imbalance: {
    ratioThreshold: 1.5,
    volumeDifferencePercent: 40,
  },
  pain: {
    reportThreshold: 3,
    severityThreshold: 5,
    recurrenceWindow: 14,
  },
  fatigue: {
    chronicThreshold: 7,
    acuteThreshold: 8,
  },
};

const BODY_REGIONS = [
  'neck', 'shoulder_left', 'shoulder_right', 'upper_back',
  'lower_back', 'elbow_left', 'elbow_right', 'wrist_left',
  'wrist_right', 'hip_left', 'hip_right', 'knee_left',
  'knee_right', 'ankle_left', 'ankle_right',
] as const;

// Local pain report interface for internal use
interface LocalPainReport {
  id: string;
  bodyRegion: string;
  painLevel: number;
  painType?: string;
  duringExercise?: boolean;
  exerciseCode?: string;
  description?: string;
  limitsMovement?: boolean;
  reportedAt: Date;
}

// ============================================
// INJURY PREDICTOR CLASS
// ============================================

export class InjuryPredictor {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ============================================
  // RISK ASSESSMENT
  // ============================================

  async assessOverallRisk(): Promise<InjuryRisk> {
    const [
      overtrainingRisk,
      imbalanceRisk,
      painHistory,
      fatigueData,
      holisticFactors,
    ] = await Promise.all([
      this.assessOvertrainingRisk(),
      this.assessImbalanceRisk(),
      this.getPainHistory(30),
      this.getFatigueData(),
      this.getHolisticFactors(),
    ]);

    const riskFactors: RiskFactor[] = [];
    let totalRiskScore = 0;

    // Avaliar overtraining
    if (overtrainingRisk.isAtRisk) {
      riskFactors.push({
        type: 'overtraining',
        severity: overtrainingRisk.severity,
        description: overtrainingRisk.description,
        affectedAreas: overtrainingRisk.affectedMuscles,
      });
      totalRiskScore += this.severityToScore(overtrainingRisk.severity);
    }

    // Avaliar desequilíbrios
    for (const imbalance of imbalanceRisk) {
      riskFactors.push({
        type: 'muscle_imbalance',
        severity: imbalance.severity,
        description: imbalance.description,
        affectedAreas: [imbalance.weakerGroup, imbalance.strongerGroup],
      });
      totalRiskScore += this.severityToScore(imbalance.severity);
    }

    // Avaliar histórico de dor
    const painRisk = this.assessPainRisk(painHistory);
    if (painRisk) {
      riskFactors.push(painRisk);
      totalRiskScore += this.severityToScore(painRisk.severity);
    }

    // Avaliar fadiga
    if (fatigueData.chronicFatigue) {
      riskFactors.push({
        type: 'chronic_fatigue',
        severity: fatigueData.level > 8 ? 'high' : 'moderate',
        description: 'Fadiga crônica detectada - risco aumentado de lesão',
      });
      totalRiskScore += fatigueData.level > 8 ? 3 : 2;
    }

    // Avaliar fatores holísticos
    if (holisticFactors.sleepDebt > 10) {
      riskFactors.push({
        type: 'sleep_deprivation',
        severity: holisticFactors.sleepDebt > 20 ? 'high' : 'moderate',
        description: 'Déficit de sono acumulado aumenta risco de lesão',
      });
      totalRiskScore += holisticFactors.sleepDebt > 20 ? 3 : 2;
    }

    // Calcular nível geral de risco
    const overallLevel = this.calculateOverallLevel(totalRiskScore, riskFactors.length);

    return {
      overallLevel,
      riskScore: Math.min(100, totalRiskScore * 10),
      riskFactors,
      recommendations: this.generateRiskRecommendations(riskFactors, overallLevel),
      nextAssessmentDate: this.calculateNextAssessment(overallLevel),
    };
  }

  private severityToScore(severity: 'low' | 'moderate' | 'high' | 'critical'): number {
    const scores = { low: 1, moderate: 2, high: 3, critical: 5 };
    return scores[severity];
  }

  private calculateOverallLevel(
    score: number,
    factorCount: number
  ): 'low' | 'moderate' | 'high' | 'critical' {
    const adjustedScore = score + factorCount * 0.5;
    if (adjustedScore >= 10) return 'critical';
    if (adjustedScore >= 6) return 'high';
    if (adjustedScore >= 3) return 'moderate';
    return 'low';
  }

  // ============================================
  // OVERTRAINING DETECTION
  // ============================================

  private async assessOvertrainingRisk(): Promise<{
    isAtRisk: boolean;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    description: string;
    affectedMuscles: string[];
  }> {
    const { data: recentWorkouts } = await fromTable('exercise_performance_metrics')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }) as any;

    if (!recentWorkouts || recentWorkouts.length === 0) {
      return { isAtRisk: false, severity: 'low', description: '', affectedMuscles: [] };
    }

    const workouts = recentWorkouts as any[];

    // Contar treinos por semana
    const last7Days = workouts.filter((w: any) => 
      new Date(w.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    // Verificar dias consecutivos
    const workoutDates = [...new Set(
      workouts.map((w: any) => new Date(w.created_at).toISOString().split('T')[0])
    )].sort().reverse();

    let consecutiveDays = 1;
    for (let i = 1; i < workoutDates.length; i++) {
      const diff = new Date(workoutDates[i-1]).getTime() - new Date(workoutDates[i]).getTime();
      if (diff === 24 * 60 * 60 * 1000) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    // Verificar intensidade alta consecutiva
    const highIntensityWorkouts = workouts.filter((w: any) => 
      (w.difficulty_rating || 0) >= 8
    );

    let isAtRisk = false;
    let severity: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    const issues: string[] = [];

    if (last7Days.length >= RISK_THRESHOLDS.overtraining.workoutsPerWeek) {
      isAtRisk = true;
      severity = 'moderate';
      issues.push(`${last7Days.length} treinos em 7 dias`);
    }

    if (consecutiveDays >= RISK_THRESHOLDS.overtraining.consecutiveDays) {
      isAtRisk = true;
      severity = severity === 'moderate' ? 'high' : 'moderate';
      issues.push(`${consecutiveDays} dias consecutivos`);
    }

    if (highIntensityWorkouts.length >= RISK_THRESHOLDS.overtraining.highIntensityStreak) {
      isAtRisk = true;
      severity = 'high';
      issues.push(`${highIntensityWorkouts.length} treinos de alta intensidade`);
    }

    // Identificar músculos mais treinados
    const muscleCount: Record<string, number> = {};
    workouts.forEach((w: any) => {
      const muscle = this.exerciseToMuscle(w.exercise_code);
      muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
    });

    const affectedMuscles = Object.entries(muscleCount)
      .filter(([_, count]) => count >= 4)
      .map(([muscle]) => muscle);

    return {
      isAtRisk,
      severity,
      description: issues.length > 0 ? `Overtraining: ${issues.join(', ')}` : '',
      affectedMuscles,
    };
  }

  private exerciseToMuscle(exerciseCode: string): string {
    const mapping: Record<string, string> = {
      'supino': 'chest', 'crucifixo': 'chest',
      'remada': 'back', 'puxada': 'back',
      'desenvolvimento': 'shoulders', 'elevacao': 'shoulders',
      'rosca': 'biceps', 'triceps': 'triceps',
      'agachamento': 'legs', 'leg': 'legs', 'stiff': 'legs',
    };

    for (const [key, muscle] of Object.entries(mapping)) {
      if (exerciseCode?.includes(key)) return muscle;
    }
    return 'other';
  }

  // ============================================
  // IMBALANCE DETECTION
  // ============================================

  private async assessImbalanceRisk(): Promise<Array<{
    strongerGroup: string;
    weakerGroup: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    description: string;
  }>> {
    const { data: muscleProgress } = await fromTable('exercise_muscle_group_progress')
      .select('*')
      .eq('user_id', this.userId) as any;

    if (!muscleProgress || muscleProgress.length < 2) return [];

    const progress = muscleProgress as any[];

    const imbalances: Array<{
      strongerGroup: string;
      weakerGroup: string;
      severity: 'low' | 'moderate' | 'high' | 'critical';
      description: string;
    }> = [];

    // Pares antagonistas
    const pairs = [
      ['chest', 'back'],
      ['biceps', 'triceps'],
      ['quadriceps', 'hamstrings'],
      ['hip_flexors', 'glutes'],
    ];

    for (const [group1, group2] of pairs) {
      const prog1 = progress.find((p: any) => p.muscle_group === group1);
      const prog2 = progress.find((p: any) => p.muscle_group === group2);

      if (prog1 && prog2) {
        const vol1 = prog1.weekly_volume || 0;
        const vol2 = prog2.weekly_volume || 0;

        if (vol1 === 0 && vol2 === 0) continue;

        const ratio = vol1 > vol2 ? vol1 / (vol2 || 1) : vol2 / (vol1 || 1);
        const stronger = vol1 > vol2 ? group1 : group2;
        const weaker = vol1 > vol2 ? group2 : group1;

        if (ratio >= RISK_THRESHOLDS.imbalance.ratioThreshold) {
          let severity: 'low' | 'moderate' | 'high' | 'critical' = 'low';
          if (ratio >= 3) severity = 'high';
          else if (ratio >= 2) severity = 'moderate';

          imbalances.push({
            strongerGroup: stronger,
            weakerGroup: weaker,
            severity,
            description: `Desequilíbrio ${stronger}/${weaker}: proporção ${ratio.toFixed(1)}:1`,
          });
        }
      }
    }

    return imbalances;
  }

  // ============================================
  // PAIN TRACKING
  // ============================================

  async reportPain(report: Omit<PainReport, 'id' | 'createdAt'>): Promise<PainReport> {
    const { data, error } = await fromTable('exercise_pain_reports')
      .insert({
        user_id: this.userId,
        body_region: report.bodyArea,
        pain_level: report.painLevel,
        pain_type: report.painType,
        during_exercise: report.occurredDuring === 'exercise',
        exercise_code: report.relatedExerciseCode,
        description: report.description,
        limits_movement: report.isRecurring,
      })
      .select()
      .single() as any;

    if (error) throw error;

    const d = data as any;

    // Verificar se precisa alerta imediato
    if (report.painLevel >= 7 || report.isRecurring) {
      await this.createInjuryAlert(report);
    }

    return {
      id: d.id,
      userId: this.userId,
      bodyArea: d.body_region,
      painLevel: d.pain_level,
      painType: d.pain_type,
      occurredDuring: d.during_exercise ? 'exercise' : 'rest',
      relatedExerciseCode: d.exercise_code,
      description: d.description,
      isRecurring: d.limits_movement || false,
      createdAt: new Date(d.reported_at || d.created_at),
    };
  }

  private async getPainHistory(days: number): Promise<LocalPainReport[]> {
    const { data } = await fromTable('exercise_pain_reports')
      .select('*')
      .eq('user_id', this.userId)
      .gte('reported_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('reported_at', { ascending: false }) as any;

    return ((data as any[]) || []).map((p: any) => ({
      id: p.id,
      bodyRegion: p.body_region,
      painLevel: p.pain_level,
      painType: p.pain_type,
      duringExercise: p.during_exercise,
      exerciseCode: p.exercise_code,
      description: p.description,
      limitsMovement: p.limits_movement,
      reportedAt: new Date(p.reported_at),
    }));
  }

  private assessPainRisk(painHistory: LocalPainReport[]): RiskFactor | null {
    if (painHistory.length === 0) return null;

    // Agrupar por região
    const byRegion: Record<string, LocalPainReport[]> = {};
    painHistory.forEach(p => {
      if (!byRegion[p.bodyRegion]) byRegion[p.bodyRegion] = [];
      byRegion[p.bodyRegion].push(p);
    });

    // Encontrar região mais problemática
    let worstRegion = '';
    let worstScore = 0;

    for (const [region, reports] of Object.entries(byRegion)) {
      const avgPain = reports.reduce((sum, r) => sum + r.painLevel, 0) / reports.length;
      const frequency = reports.length;
      const score = avgPain * frequency;

      if (score > worstScore) {
        worstScore = score;
        worstRegion = region;
      }
    }

    if (worstScore < 5) return null;

    const reports = byRegion[worstRegion];
    const avgPain = reports.reduce((sum, r) => sum + r.painLevel, 0) / reports.length;

    let severity: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    if (avgPain >= 7 || reports.length >= 5) severity = 'high';
    else if (avgPain >= 5 || reports.length >= 3) severity = 'moderate';

    return {
      type: 'recent_pain',
      severity,
      description: `Dor recorrente em ${worstRegion}: ${reports.length} relatos, média ${avgPain.toFixed(1)}/10`,
      affectedAreas: [worstRegion],
    };
  }

  private async createInjuryAlert(report: Omit<PainReport, 'id' | 'createdAt'>): Promise<void> {
    await fromTable('exercise_injury_alerts').insert({
      user_id: this.userId,
      alert_type: 'pain_report',
      severity: report.painLevel >= 8 ? 'critical' : 'high',
      body_region: report.bodyArea,
      description: `Dor nível ${report.painLevel}/10 em ${report.bodyArea}`,
      recommended_action: report.isRecurring 
        ? 'Evitar exercícios que envolvam esta região. Consulte um profissional.'
        : 'Reduzir intensidade e monitorar evolução.',
    });
  }

  // ============================================
  // FATIGUE & HOLISTIC DATA
  // ============================================

  private async getFatigueData(): Promise<{
    level: number;
    chronicFatigue: boolean;
  }> {
    const { data } = await fromTable('exercise_performance_metrics')
      .select('fatigue_level, created_at')
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }) as any;

    if (!data || data.length === 0) {
      return { level: 0, chronicFatigue: false };
    }

    const fatigueLevels = (data as any[])
      .map((d: any) => d.fatigue_level)
      .filter((f: any) => f !== null) as number[];

    if (fatigueLevels.length === 0) {
      return { level: 0, chronicFatigue: false };
    }

    const avgFatigue = fatigueLevels.reduce((a, b) => a + b, 0) / fatigueLevels.length;
    const chronicFatigue = fatigueLevels.filter(f => f >= RISK_THRESHOLDS.fatigue.chronicThreshold).length >= 5;

    return { level: avgFatigue, chronicFatigue };
  }

  private async getHolisticFactors(): Promise<{
    sleepDebt: number;
    stressLevel: number;
    nutritionScore: number;
  }> {
    const { data } = await fromTable('holistic_health_data')
      .select('sleep_hours, stress_level, nutrition_score')
      .eq('user_id', this.userId)
      .gte('tracking_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('tracking_date', { ascending: false }) as any;

    if (!data || data.length === 0) {
      return { sleepDebt: 0, stressLevel: 5, nutritionScore: 5 };
    }

    const records = data as any[];

    // Calcular déficit de sono (ideal = 8h/noite)
    const sleepHours = records.map((d: any) => d.sleep_hours || 8);
    const sleepDebt = sleepHours.reduce((debt: number, hours: number) => debt + Math.max(0, 8 - hours), 0);

    const avgStress = records.reduce((sum: number, d: any) => sum + (d.stress_level || 5), 0) / records.length;
    const avgNutrition = records.reduce((sum: number, d: any) => sum + (d.nutrition_score || 5), 0) / records.length;

    return {
      sleepDebt,
      stressLevel: avgStress,
      nutritionScore: avgNutrition,
    };
  }

  // ============================================
  // RECOMMENDATIONS
  // ============================================

  private generateRiskRecommendations(
    riskFactors: RiskFactor[],
    overallLevel: 'low' | 'moderate' | 'high' | 'critical'
  ): string[] {
    const recommendations: string[] = [];

    if (overallLevel === 'critical') {
      recommendations.push('⚠️ ALERTA: Risco crítico de lesão. Considere descanso completo.');
      recommendations.push('Consulte um profissional de saúde antes de continuar.');
    }

    for (const factor of riskFactors) {
      switch (factor.type) {
        case 'overtraining':
          recommendations.push('Reduza a frequência de treinos para 4-5x por semana');
          recommendations.push('Inclua pelo menos 2 dias de descanso completo');
          break;
        case 'muscle_imbalance':
          recommendations.push(`Aumente o volume de ${factor.affectedAreas?.[0]} em 20-30%`);
          recommendations.push('Considere exercícios unilaterais para corrigir assimetrias');
          break;
        case 'recent_pain':
          recommendations.push(`Evite exercícios que sobrecarreguem ${factor.affectedAreas?.[0]}`);
          recommendations.push('Aplique gelo após treinos e faça alongamentos suaves');
          break;
        case 'chronic_fatigue':
          recommendations.push('Priorize 7-9 horas de sono por noite');
          recommendations.push('Considere uma semana de deload (50% do volume)');
          break;
        case 'sleep_deprivation':
          recommendations.push('Estabeleça uma rotina de sono consistente');
          recommendations.push('Evite treinos intensos quando dormir menos de 6h');
          break;
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Baixo risco de lesão. Continue com seu programa atual.');
      recommendations.push('Mantenha boa hidratação e nutrição adequada.');
    }

    return [...new Set(recommendations)]; // Remove duplicatas
  }

  private calculateNextAssessment(level: 'low' | 'moderate' | 'high' | 'critical'): Date {
    const daysUntilNext = {
      low: 7,
      moderate: 3,
      high: 1,
      critical: 0, // Imediato
    };

    return new Date(Date.now() + daysUntilNext[level] * 24 * 60 * 60 * 1000);
  }

  // ============================================
  // RECOVERY PROTOCOLS
  // ============================================

  async getRecoveryProtocol(bodyRegion: string): Promise<RecoveryProtocol> {
    // Buscar histórico de dor na região
    const painHistory = await this.getPainHistory(30);
    const regionPain = painHistory.filter(p => p.bodyRegion === bodyRegion);

    const avgPain = regionPain.length > 0
      ? regionPain.reduce((sum, p) => sum + p.painLevel, 0) / regionPain.length
      : 0;

    // Determinar fase de recuperação
    let phase: 'acute' | 'subacute' | 'remodeling' | 'return_to_activity' = 'return_to_activity';
    if (avgPain >= 7) phase = 'acute';
    else if (avgPain >= 5) phase = 'subacute';
    else if (avgPain >= 3) phase = 'remodeling';

    // Gerar protocolo baseado na fase
    const protocols: Record<string, RecoveryProtocol> = {
      acute: {
        phase: 'acute',
        durationDays: 3,
        activities: ['Repouso relativo', 'Gelo 15-20min 3x/dia', 'Compressão leve'],
        restrictions: ['Evitar exercícios na região', 'Não aplicar calor', 'Evitar massagem profunda'],
        progressionCriteria: ['Dor < 5/10 em repouso', 'Sem inchaço visível'],
      },
      subacute: {
        phase: 'subacute',
        durationDays: 7,
        activities: ['Mobilidade ativa suave', 'Alongamentos leves', 'Calor antes de atividades'],
        restrictions: ['Evitar cargas pesadas', 'Limitar amplitude de movimento'],
        progressionCriteria: ['Dor < 3/10 durante movimento', 'Amplitude de movimento > 80%'],
      },
      remodeling: {
        phase: 'remodeling',
        durationDays: 14,
        activities: ['Fortalecimento progressivo', 'Exercícios de estabilização', 'Retorno gradual ao treino'],
        restrictions: ['Aumentar carga em no máximo 10% por semana'],
        progressionCriteria: ['Sem dor durante exercícios', 'Força simétrica bilateral'],
      },
      return_to_activity: {
        phase: 'return_to_activity',
        durationDays: 0,
        activities: ['Treino normal com monitoramento', 'Aquecimento adequado', 'Alongamento pós-treino'],
        restrictions: [],
        progressionCriteria: ['Manter sem dor por 2 semanas'],
      },
    };

    return protocols[phase];
  }

  // ============================================
  // EXERCISE MODIFICATIONS
  // ============================================

  async getExerciseModifications(exerciseCode: string): Promise<{
    canPerform: boolean;
    modifications: string[];
    alternatives: string[];
    precautions: string[];
  }> {
    const risk = await this.assessOverallRisk();
    const painHistory = await this.getPainHistory(14);

    // Verificar se há dor relacionada ao exercício
    const relatedPain = painHistory.filter(p => 
      p.exerciseCode === exerciseCode || 
      this.exerciseAffectsRegion(exerciseCode, p.bodyRegion)
    );

    const canPerform = relatedPain.length === 0 || 
      relatedPain.every(p => p.painLevel < 4);

    const modifications: string[] = [];
    const alternatives: string[] = [];
    const precautions: string[] = [];

    if (!canPerform) {
      modifications.push('Reduzir amplitude de movimento');
      modifications.push('Diminuir carga em 30-50%');
      alternatives.push(...this.getAlternativeExercises(exerciseCode));
      precautions.push('Interromper imediatamente se sentir dor');
    } else if (relatedPain.length > 0) {
      modifications.push('Aumentar tempo de aquecimento');
      modifications.push('Usar carga moderada');
      precautions.push('Monitorar sensações durante o exercício');
    }

    // Adicionar precauções baseadas no risco geral
    if (risk.overallLevel === 'high' || risk.overallLevel === 'critical') {
      precautions.push('Considerar pular este exercício hoje');
      precautions.push('Priorizar recuperação');
    }

    return { canPerform, modifications, alternatives, precautions };
  }

  private exerciseAffectsRegion(exerciseCode: string, region: string): boolean {
    const exerciseRegions: Record<string, string[]> = {
      'supino': ['shoulder_left', 'shoulder_right', 'chest'],
      'desenvolvimento': ['shoulder_left', 'shoulder_right', 'neck'],
      'agachamento': ['knee_left', 'knee_right', 'lower_back', 'hip_left', 'hip_right'],
      'stiff': ['lower_back', 'hamstrings'],
      'remada': ['lower_back', 'shoulder_left', 'shoulder_right'],
      'rosca': ['elbow_left', 'elbow_right'],
    };

    for (const [key, regions] of Object.entries(exerciseRegions)) {
      if (exerciseCode?.includes(key) && regions.includes(region)) {
        return true;
      }
    }
    return false;
  }

  private getAlternativeExercises(exerciseCode: string): string[] {
    const alternatives: Record<string, string[]> = {
      'supino-reto': ['supino-inclinado-halteres', 'crossover', 'flexao'],
      'agachamento-livre': ['leg-press', 'agachamento-hack', 'bulgaro'],
      'stiff': ['mesa-flexora', 'cadeira-flexora', 'elevacao-pelvica'],
      'desenvolvimento': ['elevacao-lateral', 'face-pull', 'arnold-press'],
      'remada-curvada': ['remada-unilateral', 'remada-maquina', 'pulldown'],
    };

    for (const [key, alts] of Object.entries(alternatives)) {
      if (exerciseCode?.includes(key.split('-')[0])) {
        return alts;
      }
    }
    return [];
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createInjuryPredictor(userId: string): InjuryPredictor {
  return new InjuryPredictor(userId);
}

export default InjuryPredictor;
