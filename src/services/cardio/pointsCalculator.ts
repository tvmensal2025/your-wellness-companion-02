/**
 * Cardio Points Calculator Service
 * Calcula pontos cardio baseados em zonas de frequência cardíaca
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

export type CardioZoneName = 'rest' | 'fatBurn' | 'cardio' | 'peak';

export interface CardioZone {
  name: CardioZoneName;
  label: string;
  minPercent: number;
  maxPercent: number;
  pointsPerMinute: number;
  color: string;
}

export interface HeartRateSample {
  bpm: number;
  durationMinutes: number;
}

export interface DailyPointsResult {
  totalPoints: number;
  zoneBreakdown: {
    rest: number;
    fatBurn: number;
    cardio: number;
    peak: number;
  };
  minutesBreakdown: {
    rest: number;
    fatBurn: number;
    cardio: number;
    peak: number;
  };
}

/**
 * Definição das zonas cardio com multiplicadores de pontos
 * - rest: 0-50% FC máx = 0 pts/min
 * - fatBurn: 50-70% FC máx = 1 pt/min
 * - cardio: 70-85% FC máx = 2 pts/min
 * - peak: 85-100% FC máx = 3 pts/min
 */
export const CARDIO_ZONES: CardioZone[] = [
  { 
    name: 'rest', 
    label: 'Repouso',
    minPercent: 0, 
    maxPercent: 50, 
    pointsPerMinute: 0,
    color: 'text-slate-400'
  },
  { 
    name: 'fatBurn', 
    label: 'Queima de Gordura',
    minPercent: 50, 
    maxPercent: 70, 
    pointsPerMinute: 1,
    color: 'text-yellow-500'
  },
  { 
    name: 'cardio', 
    label: 'Cardio',
    minPercent: 70, 
    maxPercent: 85, 
    pointsPerMinute: 2,
    color: 'text-orange-500'
  },
  { 
    name: 'peak', 
    label: 'Pico',
    minPercent: 85, 
    maxPercent: 100, 
    pointsPerMinute: 3,
    color: 'text-red-500'
  },
];

/**
 * Calcula a frequência cardíaca máxima usando a fórmula 220 - idade
 * Property 5: Max Heart Rate Formula
 */
export function calculateMaxHeartRate(age: number): number {
  if (age < 1 || age > 120) {
    return 220 - 30; // fallback para idade média
  }
  return 220 - age;
}

/**
 * Determina a zona cardio baseada no BPM e FC máxima
 */
export function getCardioZone(bpm: number, maxHR: number): CardioZone {
  if (maxHR <= 0) {
    return CARDIO_ZONES[0]; // rest
  }
  
  const percent = (bpm / maxHR) * 100;
  
  // Encontrar a zona apropriada (de trás pra frente para pegar a mais alta)
  for (let i = CARDIO_ZONES.length - 1; i >= 0; i--) {
    const zone = CARDIO_ZONES[i];
    if (percent >= zone.minPercent) {
      return zone;
    }
  }
  
  return CARDIO_ZONES[0]; // rest como fallback
}

/**
 * Calcula pontos para uma única amostra de frequência cardíaca
 * Property 4: Cardio Points Zone Calculation
 */
export function calculatePointsForSample(
  bpm: number, 
  durationMinutes: number, 
  age: number
): number {
  if (durationMinutes <= 0 || bpm <= 0) {
    return 0;
  }
  
  const maxHR = calculateMaxHeartRate(age);
  const zone = getCardioZone(bpm, maxHR);
  
  return Math.round(zone.pointsPerMinute * durationMinutes);
}

/**
 * Calcula pontos diários totais a partir de múltiplas amostras
 */
export function calculateDailyPoints(
  samples: HeartRateSample[],
  age: number
): DailyPointsResult {
  const result: DailyPointsResult = {
    totalPoints: 0,
    zoneBreakdown: { rest: 0, fatBurn: 0, cardio: 0, peak: 0 },
    minutesBreakdown: { rest: 0, fatBurn: 0, cardio: 0, peak: 0 },
  };
  
  if (!samples || samples.length === 0) {
    return result;
  }
  
  const maxHR = calculateMaxHeartRate(age);
  
  for (const sample of samples) {
    if (sample.bpm <= 0 || sample.durationMinutes <= 0) {
      continue;
    }
    
    const zone = getCardioZone(sample.bpm, maxHR);
    const points = Math.round(zone.pointsPerMinute * sample.durationMinutes);
    
    result.totalPoints += points;
    result.zoneBreakdown[zone.name] += points;
    result.minutesBreakdown[zone.name] += sample.durationMinutes;
  }
  
  return result;
}

/**
 * Calcula o percentual de progresso em relação à meta diária
 * Property 6: Progress Percentage Calculation
 */
export function calculateProgressPercent(points: number, goal: number): number {
  if (goal <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((points / goal) * 100));
}

/**
 * Calcula a diferença de pontos entre dois dias
 * Property 7: Day Comparison Calculation
 */
export function calculateDayComparison(todayPoints: number, yesterdayPoints: number): {
  difference: number;
  percentChange: number;
  trend: 'up' | 'down' | 'same';
} {
  const difference = todayPoints - yesterdayPoints;
  const percentChange = yesterdayPoints > 0 
    ? Math.round((difference / yesterdayPoints) * 100) 
    : (todayPoints > 0 ? 100 : 0);
  
  let trend: 'up' | 'down' | 'same' = 'same';
  if (difference > 0) trend = 'up';
  if (difference < 0) trend = 'down';
  
  return { difference, percentChange, trend };
}

/**
 * Meta diária padrão de pontos cardio
 */
export const DEFAULT_DAILY_GOAL = 150;

/**
 * Converte minutos ativos do Google Fit em pontos estimados
 * Assume uma distribuição média entre as zonas
 */
export function estimatePointsFromActiveMinutes(
  activeMinutes: number,
  avgHeartRate: number,
  age: number
): number {
  if (activeMinutes <= 0) return 0;
  
  // Usar a FC média para determinar a zona predominante
  const maxHR = calculateMaxHeartRate(age);
  const zone = getCardioZone(avgHeartRate, maxHR);
  
  return Math.round(zone.pointsPerMinute * activeMinutes);
}
