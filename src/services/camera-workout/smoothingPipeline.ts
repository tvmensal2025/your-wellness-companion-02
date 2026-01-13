/**
 * 🔄 Smoothing Pipeline - Camera Workout System
 * Suavização de keypoints para reduzir jitter e ruído
 * Validates: Requirements 2.6, 2.7
 */

import type { Keypoint, KeypointId } from '@/types/camera-workout';

interface SmoothingConfig {
  windowSize: number;      // Número de frames para histórico
  alpha: number;           // Fator EMA (0-1, maior = mais responsivo)
  confidenceThreshold: number; // Threshold para interpolação
}

const DEFAULT_CONFIG: SmoothingConfig = {
  windowSize: 5,
  alpha: 0.3,
  confidenceThreshold: 0.5,
};

/**
 * Pipeline de suavização para keypoints
 * Usa Exponential Moving Average (EMA) para reduzir jitter
 */
export class SmoothingPipeline {
  private historyX: Map<string, number[]> = new Map();
  private historyY: Map<string, number[]> = new Map();
  private config: SmoothingConfig;

  constructor(config: Partial<SmoothingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Aplica suavização exponencial aos keypoints
   * Reduz jitter mantendo responsividade
   */
  smooth(keypoints: Keypoint[]): Keypoint[] {
    return keypoints.map((kp) => {
      const keyX = `${kp.id}_x`;
      const keyY = `${kp.id}_y`;

      // Obter ou criar histórico
      const hX = this.getOrCreateHistory(keyX);
      const hY = this.getOrCreateHistory(keyY);

      // Adicionar valores atuais
      hX.push(kp.x);
      hY.push(kp.y);

      // Manter apenas últimos N valores
      while (hX.length > this.config.windowSize) hX.shift();
      while (hY.length > this.config.windowSize) hY.shift();

      // Aplicar EMA
      return {
        ...kp,
        x: this.exponentialMovingAverage(hX),
        y: this.exponentialMovingAverage(hY),
      };
    });
  }

  /**
   * Interpola keypoints com baixa confiança usando frames anteriores
   */
  interpolateLowConfidence(keypoints: Keypoint[]): Keypoint[] {
    return keypoints.map((kp) => {
      if (kp.confidence >= this.config.confidenceThreshold) {
        return kp;
      }

      const keyX = `${kp.id}_x`;
      const keyY = `${kp.id}_y`;

      const hX = this.historyX.get(keyX);
      const hY = this.historyY.get(keyY);

      // Se temos histórico, usar último valor válido
      if (hX && hX.length > 0 && hY && hY.length > 0) {
        return {
          ...kp,
          x: hX[hX.length - 1],
          y: hY[hY.length - 1],
          confidence: kp.confidence * 0.8, // Reduzir confiança de interpolados
        };
      }

      return kp;
    });
  }

  /**
   * Processa frame completo: interpola + suaviza
   */
  process(keypoints: Keypoint[]): Keypoint[] {
    const interpolated = this.interpolateLowConfidence(keypoints);
    return this.smooth(interpolated);
  }

  /**
   * Calcula EMA de um array de valores
   */
  private exponentialMovingAverage(values: number[]): number {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];

    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
      ema = this.config.alpha * values[i] + (1 - this.config.alpha) * ema;
    }
    return ema;
  }

  /**
   * Obtém ou cria array de histórico
   */
  private getOrCreateHistory(key: string): number[] {
    if (!this.historyX.has(key) && key.endsWith('_x')) {
      this.historyX.set(key, []);
    }
    if (!this.historyY.has(key) && key.endsWith('_y')) {
      this.historyY.set(key, []);
    }
    
    if (key.endsWith('_x')) {
      return this.historyX.get(key)!;
    }
    return this.historyY.get(key)!;
  }

  /**
   * Calcula variância do histórico (para detectar estabilidade)
   */
  getVariance(keypointId: KeypointId): { x: number; y: number } {
    const hX = this.historyX.get(`${keypointId}_x`) || [];
    const hY = this.historyY.get(`${keypointId}_y`) || [];

    return {
      x: this.calculateVariance(hX),
      y: this.calculateVariance(hY),
    };
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Verifica se keypoints estão estáveis (baixa variância)
   */
  isStable(threshold = 0.001): boolean {
    let totalVariance = 0;
    let count = 0;

    this.historyX.forEach((_, key) => {
      const variance = this.getVariance(key.replace('_x', '') as KeypointId);
      totalVariance += variance.x + variance.y;
      count += 2;
    });

    return count > 0 ? totalVariance / count < threshold : false;
  }

  /**
   * Reseta todo o histórico
   */
  reset(): void {
    this.historyX.clear();
    this.historyY.clear();
  }

  /**
   * Atualiza configuração
   */
  updateConfig(config: Partial<SmoothingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): SmoothingConfig {
    return { ...this.config };
  }
}

/**
 * Singleton para uso global
 */
let globalPipeline: SmoothingPipeline | null = null;

export function getSmoothingPipeline(config?: Partial<SmoothingConfig>): SmoothingPipeline {
  if (!globalPipeline) {
    globalPipeline = new SmoothingPipeline(config);
  }
  return globalPipeline;
}

export function resetSmoothingPipeline(): void {
  globalPipeline?.reset();
  globalPipeline = null;
}
