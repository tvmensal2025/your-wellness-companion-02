/**
 * Cardio Trend Analyzer Service
 * Analisa tendências de frequência cardíaca ao longo do tempo
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

export type TrendDirection = 'improving' | 'stable' | 'declining' | 'insufficient';

export interface TrendResult {
  direction: TrendDirection;
  changePercent: number;
  changeBpm: number;
  message: string;
  color: string;
  icon: 'up' | 'down' | 'minus' | 'help';
}

export interface SparklinePoint {
  value: number;
  normalizedValue: number; // 0-100 para renderização
  date: string;
}

/**
 * Analisa a tendência de frequência cardíaca baseada em médias diárias
 * Property 3: Trend Classification Consistency
 * 
 * Para frequência cardíaca em repouso:
 * - Diminuindo = melhorando (melhor condicionamento)
 * - Aumentando = piorando (atenção necessária)
 */
export function analyzeTrend(dailyAverages: number[]): TrendResult {
  // Filtrar valores inválidos
  const validAverages = dailyAverages.filter(v => v > 0);
  
  if (validAverages.length < 3) {
    return {
      direction: 'insufficient',
      changePercent: 0,
      changeBpm: 0,
      message: 'Dados insuficientes - sincronize mais dias',
      color: 'text-muted-foreground',
      icon: 'help',
    };
  }
  
  // Calcular média dos primeiros 3 dias vs últimos 3 dias
  const firstThree = validAverages.slice(0, 3);
  const lastThree = validAverages.slice(-3);
  
  const olderAvg = firstThree.reduce((a, b) => a + b, 0) / firstThree.length;
  const recentAvg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
  
  const changeBpm = recentAvg - olderAvg;
  const changePercent = olderAvg > 0 
    ? Math.round((changeBpm / olderAvg) * 100) 
    : 0;
  
  // Para FC em repouso: diminuir é bom (melhor condicionamento)
  if (changeBpm < -5) {
    return {
      direction: 'improving',
      changePercent,
      changeBpm: Math.round(changeBpm),
      message: 'Sua saúde cardíaca está melhorando!',
      color: 'text-emerald-500',
      icon: 'up',
    };
  }
  
  if (changeBpm > 5) {
    return {
      direction: 'declining',
      changePercent,
      changeBpm: Math.round(changeBpm),
      message: 'Atenção: frequência cardíaca aumentando',
      color: 'text-red-500',
      icon: 'down',
    };
  }
  
  return {
    direction: 'stable',
    changePercent,
    changeBpm: Math.round(changeBpm),
    message: 'Frequência cardíaca estável',
    color: 'text-yellow-500',
    icon: 'minus',
  };
}

/**
 * Normaliza valores para exibição em sparkline (0-100)
 * Property 11: Sparkline Data Transformation
 */
export function normalizeForSparkline(
  values: number[], 
  dates?: string[]
): SparklinePoint[] {
  if (!values || values.length === 0) {
    return [];
  }
  
  const validValues = values.filter(v => v > 0);
  if (validValues.length === 0) {
    return values.map((_, i) => ({
      value: 0,
      normalizedValue: 50,
      date: dates?.[i] || `Day ${i + 1}`,
    }));
  }
  
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const range = max - min || 1; // evitar divisão por zero
  
  return values.map((value, i) => {
    // Normalizar para 0-100, com padding de 10% em cada extremo
    const normalized = value > 0 
      ? 10 + ((value - min) / range) * 80 
      : 50; // valor padrão para dados inválidos
    
    return {
      value,
      normalizedValue: Math.round(normalized),
      date: dates?.[i] || `Day ${i + 1}`,
    };
  });
}

/**
 * Gera path SVG para sparkline
 */
export function generateSparklinePath(
  points: SparklinePoint[],
  width: number = 100,
  height: number = 40
): string {
  if (points.length === 0) {
    return '';
  }
  
  if (points.length === 1) {
    const y = height - (points[0].normalizedValue / 100) * height;
    return `M 0 ${y} L ${width} ${y}`;
  }
  
  const stepX = width / (points.length - 1);
  
  const pathPoints = points.map((point, i) => {
    const x = i * stepX;
    const y = height - (point.normalizedValue / 100) * height;
    return `${x},${y}`;
  });
  
  return `M ${pathPoints.join(' L ')}`;
}

/**
 * Calcula estatísticas básicas dos dados de FC
 */
export function calculateHeartRateStats(values: number[]): {
  avg: number;
  min: number;
  max: number;
  variance: number;
} {
  const validValues = values.filter(v => v > 0);
  
  if (validValues.length === 0) {
    return { avg: 0, min: 0, max: 0, variance: 0 };
  }
  
  const avg = Math.round(validValues.reduce((a, b) => a + b, 0) / validValues.length);
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  
  const squaredDiffs = validValues.map(v => Math.pow(v - avg, 2));
  const variance = Math.round(squaredDiffs.reduce((a, b) => a + b, 0) / validValues.length);
  
  return { avg, min, max, variance };
}

/**
 * Determina se há dados suficientes para análise
 */
export function hasEnoughDataForTrend(dailyAverages: number[]): boolean {
  const validCount = dailyAverages.filter(v => v > 0).length;
  return validCount >= 3;
}
