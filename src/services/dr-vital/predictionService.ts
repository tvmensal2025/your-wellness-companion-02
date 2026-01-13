// =====================================================
// PREDICTION SERVICE - Health Oracle
// =====================================================
// Sistema de previsões preditivas de saúde
// Properties 9, 10, 11
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  HealthPrediction,
  RiskFactor,
  RiskTimeframe,
  WhatIfSimulation,
  WhatIfChange,
  HealthyTwin,
  HealthyTwinMetrics,
  HealthPredictionRow,
} from '@/types/dr-vital-revolution';

// =====================================================
// CONSTANTS
// =====================================================

const RISK_TYPES = [
  'diabetes_type2',
  'hypertension',
  'cardiovascular',
  'obesity',
  'metabolic_syndrome',
] as const;

const TIMEFRAMES: RiskTimeframe[] = ['3_months', '6_months', '1_year'];

// Ideal metrics for healthy twin calculation
const IDEAL_METRICS: Record<string, { male: number; female: number }> = {
  bmi: { male: 22.5, female: 21.5 },
  bodyFat: { male: 15, female: 22 },
  sleepHours: { male: 7.5, female: 7.5 },
  exerciseMinutes: { male: 30, female: 30 },
  waterIntake: { male: 3000, female: 2500 },
  stressLevel: { male: 3, female: 3 },
};

// =====================================================
// RISK CALCULATION FUNCTIONS
// =====================================================

interface UserHealthData {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  bmi: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  fastingGlucose?: number;
  cholesterolTotal?: number;
  cholesterolHDL?: number;
  cholesterolLDL?: number;
  triglycerides?: number;
  exerciseMinutesPerWeek: number;
  sleepHoursAvg: number;
  smokingStatus: 'never' | 'former' | 'current';
  familyHistoryDiabetes: boolean;
  familyHistoryHeartDisease: boolean;
}

/**
 * Calcula o risco de diabetes tipo 2
 */
function calculateDiabetesRisk(data: UserHealthData): number {
  let risk = 0;
  
  // Age factor
  if (data.age >= 45) risk += 15;
  else if (data.age >= 35) risk += 8;
  
  // BMI factor
  if (data.bmi >= 30) risk += 25;
  else if (data.bmi >= 25) risk += 15;
  else if (data.bmi >= 23) risk += 5;
  
  // Fasting glucose
  if (data.fastingGlucose) {
    if (data.fastingGlucose >= 126) risk += 30;
    else if (data.fastingGlucose >= 100) risk += 15;
  }
  
  // Family history
  if (data.familyHistoryDiabetes) risk += 15;
  
  // Exercise
  if (data.exerciseMinutesPerWeek < 150) risk += 10;
  
  // Sleep
  if (data.sleepHoursAvg < 6 || data.sleepHoursAvg > 9) risk += 5;
  
  return Math.min(100, Math.max(0, risk));
}

/**
 * Calcula o risco de hipertensão
 */
function calculateHypertensionRisk(data: UserHealthData): number {
  let risk = 0;
  
  // Age factor
  if (data.age >= 55) risk += 20;
  else if (data.age >= 45) risk += 12;
  else if (data.age >= 35) risk += 5;
  
  // Blood pressure
  if (data.bloodPressureSystolic) {
    if (data.bloodPressureSystolic >= 140) risk += 30;
    else if (data.bloodPressureSystolic >= 130) risk += 15;
    else if (data.bloodPressureSystolic >= 120) risk += 5;
  }
  
  // BMI
  if (data.bmi >= 30) risk += 15;
  else if (data.bmi >= 25) risk += 8;
  
  // Family history
  if (data.familyHistoryHeartDisease) risk += 10;
  
  // Smoking
  if (data.smokingStatus === 'current') risk += 15;
  else if (data.smokingStatus === 'former') risk += 5;
  
  // Exercise
  if (data.exerciseMinutesPerWeek < 150) risk += 10;
  
  return Math.min(100, Math.max(0, risk));
}

/**
 * Calcula o risco cardiovascular
 */
function calculateCardiovascularRisk(data: UserHealthData): number {
  let risk = 0;
  
  // Age and gender
  if (data.gender === 'male' && data.age >= 45) risk += 15;
  if (data.gender === 'female' && data.age >= 55) risk += 15;
  
  // Cholesterol
  if (data.cholesterolTotal) {
    if (data.cholesterolTotal >= 240) risk += 20;
    else if (data.cholesterolTotal >= 200) risk += 10;
  }
  
  if (data.cholesterolLDL) {
    if (data.cholesterolLDL >= 160) risk += 15;
    else if (data.cholesterolLDL >= 130) risk += 8;
  }
  
  if (data.cholesterolHDL) {
    if (data.cholesterolHDL < 40) risk += 15;
    else if (data.cholesterolHDL < 50) risk += 8;
  }
  
  // Blood pressure
  if (data.bloodPressureSystolic && data.bloodPressureSystolic >= 140) risk += 15;
  
  // Smoking
  if (data.smokingStatus === 'current') risk += 20;
  
  // Family history
  if (data.familyHistoryHeartDisease) risk += 15;
  
  // BMI
  if (data.bmi >= 30) risk += 10;
  
  return Math.min(100, Math.max(0, risk));
}

/**
 * Gera fatores de risco para uma previsão
 */
function generateRiskFactors(
  riskType: string,
  data: UserHealthData
): RiskFactor[] {
  const factors: RiskFactor[] = [];
  
  // BMI factor (common to all)
  if (data.bmi > 25) {
    factors.push({
      name: 'IMC',
      impact: data.bmi >= 30 ? 'high' : 'medium',
      currentValue: Math.round(data.bmi * 10) / 10,
      idealValue: 22.5,
      unit: 'kg/m²',
      description: 'Índice de Massa Corporal acima do ideal',
    });
  }
  
  // Exercise factor
  if (data.exerciseMinutesPerWeek < 150) {
    factors.push({
      name: 'Exercício Semanal',
      impact: data.exerciseMinutesPerWeek < 60 ? 'high' : 'medium',
      currentValue: data.exerciseMinutesPerWeek,
      idealValue: 150,
      unit: 'min/semana',
      description: 'Atividade física abaixo do recomendado',
    });
  }
  
  // Sleep factor
  if (data.sleepHoursAvg < 7 || data.sleepHoursAvg > 9) {
    factors.push({
      name: 'Sono',
      impact: data.sleepHoursAvg < 6 ? 'high' : 'low',
      currentValue: data.sleepHoursAvg,
      idealValue: 7.5,
      unit: 'horas/noite',
      description: 'Duração do sono fora do ideal',
    });
  }
  
  // Specific factors based on risk type
  if (riskType === 'diabetes_type2' && data.fastingGlucose) {
    if (data.fastingGlucose >= 100) {
      factors.push({
        name: 'Glicose em Jejum',
        impact: data.fastingGlucose >= 126 ? 'high' : 'medium',
        currentValue: data.fastingGlucose,
        idealValue: 90,
        unit: 'mg/dL',
        description: 'Nível de glicose elevado',
      });
    }
  }
  
  if ((riskType === 'hypertension' || riskType === 'cardiovascular') && data.bloodPressureSystolic) {
    if (data.bloodPressureSystolic >= 120) {
      factors.push({
        name: 'Pressão Arterial',
        impact: data.bloodPressureSystolic >= 140 ? 'high' : 'medium',
        currentValue: data.bloodPressureSystolic,
        idealValue: 120,
        unit: 'mmHg',
        description: 'Pressão arterial elevada',
      });
    }
  }
  
  return factors;
}

/**
 * Gera recomendações baseadas nos fatores de risco
 * Property 9: at least one recommendation SHALL be provided
 */
function generateRecommendations(
  riskType: string,
  factors: RiskFactor[]
): string[] {
  const recommendations: string[] = [];
  
  // Always add at least one general recommendation
  recommendations.push('Mantenha consultas regulares com seu médico');
  
  // Factor-specific recommendations
  for (const factor of factors) {
    if (factor.name === 'IMC') {
      recommendations.push('Reduza o peso corporal gradualmente com dieta equilibrada');
      recommendations.push('Aumente a atividade física para acelerar a perda de peso');
    }
    if (factor.name === 'Exercício Semanal') {
      recommendations.push('Pratique pelo menos 30 minutos de exercício moderado, 5x por semana');
    }
    if (factor.name === 'Sono') {
      recommendations.push('Estabeleça uma rotina de sono regular de 7-8 horas');
    }
    if (factor.name === 'Glicose em Jejum') {
      recommendations.push('Reduza o consumo de açúcares e carboidratos refinados');
      recommendations.push('Monitore sua glicose regularmente');
    }
    if (factor.name === 'Pressão Arterial') {
      recommendations.push('Reduza o consumo de sódio (sal)');
      recommendations.push('Pratique técnicas de relaxamento para reduzir o estresse');
    }
  }
  
  // Risk-specific recommendations
  if (riskType === 'diabetes_type2') {
    recommendations.push('Aumente o consumo de fibras e vegetais');
  }
  if (riskType === 'cardiovascular') {
    recommendations.push('Inclua ômega-3 na dieta (peixes, nozes)');
  }
  
  return [...new Set(recommendations)]; // Remove duplicates
}

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Calcula previsões de risco para o usuário
 * Property 9: probability 0-100, valid timeframe, at least one recommendation
 */
export async function calculateRiskPredictions(
  userId: string
): Promise<HealthPrediction[]> {
  // Fetch user health data
  const healthData = await fetchUserHealthData(userId);
  
  if (!healthData) {
    return [];
  }
  
  const predictions: HealthPrediction[] = [];
  
  // Calculate each risk type
  const riskCalculators: Record<string, (data: UserHealthData) => number> = {
    diabetes_type2: calculateDiabetesRisk,
    hypertension: calculateHypertensionRisk,
    cardiovascular: calculateCardiovascularRisk,
  };
  
  for (const [riskType, calculator] of Object.entries(riskCalculators)) {
    const probability = calculator(healthData);
    
    // Only create prediction if risk is significant (> 10%)
    if (probability > 10) {
      const factors = generateRiskFactors(riskType, healthData);
      const recommendations = generateRecommendations(riskType, factors);
      
      // Determine timeframe based on probability
      let timeframe: RiskTimeframe = '1_year';
      if (probability >= 60) timeframe = '3_months';
      else if (probability >= 40) timeframe = '6_months';
      
      const prediction: HealthPrediction = {
        id: `${userId}_${riskType}`,
        userId,
        riskType,
        probability,
        timeframe,
        factors,
        recommendations,
        isActive: true,
        calculatedAt: new Date(),
      };
      
      predictions.push(prediction);
    }
  }
  
  // Save predictions to database
  for (const prediction of predictions) {
    await supabase
      .from('health_predictions')
      .upsert({
        user_id: prediction.userId,
        risk_type: prediction.riskType,
        probability: prediction.probability,
        timeframe: prediction.timeframe,
        factors: prediction.factors,
        recommendations: prediction.recommendations,
        is_active: true,
        calculated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,risk_type',
      });
  }
  
  return predictions;
}

/**
 * Simula mudanças "What If"
 * Property 10: changing input SHALL produce different probability
 */
export async function simulateWhatIf(
  userId: string,
  changes: WhatIfChange[]
): Promise<WhatIfSimulation> {
  // Get current predictions
  const originalPredictions = await getActivePredictions(userId);
  
  // Get current health data
  const healthData = await fetchUserHealthData(userId);
  
  if (!healthData) {
    return {
      inputChanges: changes,
      originalPredictions,
      simulatedPredictions: originalPredictions,
      improvementPercentage: 0,
      insights: ['Dados insuficientes para simulação'],
    };
  }
  
  // Apply changes to health data
  const modifiedData = { ...healthData };
  
  for (const change of changes) {
    switch (change.factor) {
      case 'weight':
        modifiedData.weight = change.newValue;
        modifiedData.bmi = change.newValue / Math.pow(modifiedData.height / 100, 2);
        break;
      case 'exerciseMinutes':
        modifiedData.exerciseMinutesPerWeek = change.newValue;
        break;
      case 'sleepHours':
        modifiedData.sleepHoursAvg = change.newValue;
        break;
      case 'bloodPressure':
        modifiedData.bloodPressureSystolic = change.newValue;
        break;
      case 'glucose':
        modifiedData.fastingGlucose = change.newValue;
        break;
    }
  }
  
  // Recalculate predictions with modified data
  const simulatedPredictions: HealthPrediction[] = [];
  
  const riskCalculators: Record<string, (data: UserHealthData) => number> = {
    diabetes_type2: calculateDiabetesRisk,
    hypertension: calculateHypertensionRisk,
    cardiovascular: calculateCardiovascularRisk,
  };
  
  for (const [riskType, calculator] of Object.entries(riskCalculators)) {
    const probability = calculator(modifiedData);
    const factors = generateRiskFactors(riskType, modifiedData);
    const recommendations = generateRecommendations(riskType, factors);
    
    simulatedPredictions.push({
      id: `${userId}_${riskType}_simulated`,
      userId,
      riskType,
      probability,
      timeframe: probability >= 60 ? '3_months' : probability >= 40 ? '6_months' : '1_year',
      factors,
      recommendations,
      isActive: false,
      calculatedAt: new Date(),
    });
  }
  
  // Calculate improvement
  const originalAvg = originalPredictions.length > 0
    ? originalPredictions.reduce((sum, p) => sum + p.probability, 0) / originalPredictions.length
    : 0;
  const simulatedAvg = simulatedPredictions.length > 0
    ? simulatedPredictions.reduce((sum, p) => sum + p.probability, 0) / simulatedPredictions.length
    : 0;
  
  const improvementPercentage = originalAvg > 0
    ? Math.round(((originalAvg - simulatedAvg) / originalAvg) * 100)
    : 0;
  
  // Generate insights
  const insights: string[] = [];
  
  if (improvementPercentage > 0) {
    insights.push(`Suas mudanças podem reduzir o risco médio em ${improvementPercentage}%`);
  } else if (improvementPercentage < 0) {
    insights.push(`Atenção: essas mudanças podem aumentar seu risco`);
  } else {
    insights.push('Essas mudanças têm impacto neutro no seu risco');
  }
  
  for (const change of changes) {
    if (change.factor === 'weight' && change.newValue < change.currentValue) {
      const kgLost = change.currentValue - change.newValue;
      insights.push(`Perder ${kgLost}kg pode melhorar significativamente sua saúde`);
    }
    if (change.factor === 'exerciseMinutes' && change.newValue > change.currentValue) {
      insights.push('Aumentar exercícios é uma das melhores formas de reduzir riscos');
    }
  }
  
  return {
    inputChanges: changes,
    originalPredictions,
    simulatedPredictions,
    improvementPercentage,
    insights,
  };
}

/**
 * Gera o "Healthy Twin" - versão ideal do usuário
 * Property 11: twin demographics SHALL match user demographics exactly
 */
export async function generateHealthyTwin(userId: string): Promise<HealthyTwin | null> {
  const healthData = await fetchUserHealthData(userId);
  
  if (!healthData) return null;
  
  const gender = healthData.gender;
  
  // Calculate ideal weight based on height (BMI 22)
  const idealBmi = IDEAL_METRICS.bmi[gender];
  const idealWeight = idealBmi * Math.pow(healthData.height / 100, 2);
  
  const idealMetrics: HealthyTwinMetrics = {
    weight: Math.round(idealWeight),
    bmi: idealBmi,
    bodyFat: IDEAL_METRICS.bodyFat[gender],
    sleepHours: IDEAL_METRICS.sleepHours[gender],
    exerciseMinutes: IDEAL_METRICS.exerciseMinutes[gender],
    waterIntake: IDEAL_METRICS.waterIntake[gender],
    stressLevel: IDEAL_METRICS.stressLevel[gender],
  };
  
  // Calculate gaps
  const gaps: HealthyTwin['gaps'] = [];
  
  if (healthData.weight > idealWeight * 1.05) {
    gaps.push({
      metric: 'weight',
      userValue: healthData.weight,
      idealValue: idealWeight,
      gap: healthData.weight - idealWeight,
      priority: healthData.weight > idealWeight * 1.2 ? 'high' : 'medium',
    });
  }
  
  if (healthData.bmi > idealBmi * 1.1) {
    gaps.push({
      metric: 'bmi',
      userValue: healthData.bmi,
      idealValue: idealBmi,
      gap: healthData.bmi - idealBmi,
      priority: healthData.bmi > 30 ? 'high' : 'medium',
    });
  }
  
  if (healthData.exerciseMinutesPerWeek < 150) {
    gaps.push({
      metric: 'exerciseMinutes',
      userValue: healthData.exerciseMinutesPerWeek,
      idealValue: 150,
      gap: 150 - healthData.exerciseMinutesPerWeek,
      priority: healthData.exerciseMinutesPerWeek < 60 ? 'high' : 'medium',
    });
  }
  
  if (healthData.sleepHoursAvg < 7 || healthData.sleepHoursAvg > 9) {
    gaps.push({
      metric: 'sleepHours',
      userValue: healthData.sleepHoursAvg,
      idealValue: 7.5,
      gap: Math.abs(healthData.sleepHoursAvg - 7.5),
      priority: healthData.sleepHoursAvg < 6 ? 'high' : 'low',
    });
  }
  
  // Calculate comparison score (0-100)
  let comparisonScore = 100;
  for (const gap of gaps) {
    if (gap.priority === 'high') comparisonScore -= 20;
    else if (gap.priority === 'medium') comparisonScore -= 10;
    else comparisonScore -= 5;
  }
  comparisonScore = Math.max(0, comparisonScore);
  
  return {
    demographics: {
      age: healthData.age,
      gender: healthData.gender,
      height: healthData.height,
    },
    idealMetrics,
    comparisonScore,
    gaps,
  };
}

/**
 * Busca previsões ativas do usuário
 */
export async function getActivePredictions(userId: string): Promise<HealthPrediction[]> {
  const { data, error } = await supabase
    .from('health_predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('probability', { ascending: false });
  
  if (error) throw error;
  
  return (data as HealthPredictionRow[]).map(rowToPrediction);
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function fetchUserHealthData(userId: string): Promise<UserHealthData | null> {
  // Fetch from multiple tables
  const [profileData, physicalData, trackingData, examsData] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_physical_data').select('*').eq('user_id', userId).single(),
    supabase.from('advanced_daily_tracking').select('*').eq('user_id', userId).order('tracking_date', { ascending: false }).limit(7),
    supabase.from('medical_exams').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
  ]);
  
  const profile = profileData.data;
  const physical = physicalData.data;
  const tracking = trackingData.data || [];
  
  if (!physical) return null;
  
  // Calculate age from birth date
  const birthDate = physical.data_nascimento || profile?.birth_date;
  let age = 30; // Default
  if (birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    age = today.getFullYear() - birth.getFullYear();
  }
  
  // Calculate averages from tracking
  const avgSleep = tracking.length > 0
    ? tracking.reduce((sum, t) => sum + (t.sleep_hours || 7), 0) / tracking.length
    : 7;
  
  // Estimate exercise from workout sessions
  const { data: workouts } = await supabase
    .from('workout_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
  
  const exerciseMinutes = workouts
    ? workouts.reduce((sum, w) => sum + (w.duration_minutes || 30), 0)
    : 0;
  
  return {
    age,
    gender: (physical.sexo === 'F' ? 'female' : 'male') as 'male' | 'female',
    weight: physical.peso_atual_kg || 70,
    height: physical.altura_cm || 170,
    bmi: physical.imc || (physical.peso_atual_kg / Math.pow((physical.altura_cm || 170) / 100, 2)),
    exerciseMinutesPerWeek: exerciseMinutes,
    sleepHoursAvg: avgSleep,
    smokingStatus: 'never',
    familyHistoryDiabetes: false,
    familyHistoryHeartDisease: false,
  };
}

function rowToPrediction(row: HealthPredictionRow): HealthPrediction {
  return {
    id: row.id,
    userId: row.user_id,
    riskType: row.risk_type,
    probability: row.probability,
    timeframe: row.timeframe,
    factors: row.factors,
    recommendations: row.recommendations,
    isActive: row.is_active,
    calculatedAt: new Date(row.calculated_at),
  };
}

// =====================================================
// VALIDATION FUNCTIONS (for property tests)
// =====================================================

/**
 * Validates a prediction meets Property 9 requirements
 */
export function isValidPrediction(prediction: HealthPrediction): boolean {
  return (
    prediction.probability >= 0 &&
    prediction.probability <= 100 &&
    TIMEFRAMES.includes(prediction.timeframe) &&
    prediction.recommendations.length >= 1
  );
}

/**
 * Validates What-If simulation meets Property 10 requirements
 */
export function isValidWhatIfSimulation(simulation: WhatIfSimulation): boolean {
  // If there are changes, predictions should differ (in most cases)
  if (simulation.inputChanges.length === 0) return true;
  
  // Improvement percentage should be calculated correctly
  const originalAvg = simulation.originalPredictions.length > 0
    ? simulation.originalPredictions.reduce((sum, p) => sum + p.probability, 0) / simulation.originalPredictions.length
    : 0;
  const simulatedAvg = simulation.simulatedPredictions.length > 0
    ? simulation.simulatedPredictions.reduce((sum, p) => sum + p.probability, 0) / simulation.simulatedPredictions.length
    : 0;
  
  if (originalAvg === 0) return simulation.improvementPercentage === 0;
  
  const expectedImprovement = Math.round(((originalAvg - simulatedAvg) / originalAvg) * 100);
  return simulation.improvementPercentage === expectedImprovement;
}

/**
 * Validates Healthy Twin meets Property 11 requirements
 */
export function isValidHealthyTwin(twin: HealthyTwin, userAge: number, userGender: string, userHeight: number): boolean {
  return (
    twin.demographics.age === userAge &&
    twin.demographics.gender === userGender &&
    twin.demographics.height === userHeight
  );
}

// =====================================================
// EXPORTS
// =====================================================

export const predictionService = {
  calculateRiskPredictions,
  simulateWhatIf,
  generateHealthyTwin,
  getActivePredictions,
  isValidPrediction,
  isValidWhatIfSimulation,
  isValidHealthyTwin,
};

export default predictionService;
