/**
 * 🔢 Rep Counter Engine - Camera Workout System
 * Contagem de repetições com debouncing e detecção de fases
 * Validates: Requirements 3.2, 3.3, 3.5, 3.7
 */

import type {
  Keypoint,
  ExerciseType,
  ExerciseThresholds,
  RepCountResult,
  RepCounterState,
  MovementPhase,
  ExerciseAngles,
  CalibrationData,
} from '@/types/camera-workout';
import { calculateExerciseAngles } from './angleCalculator';
import { SmoothingPipeline } from './smoothingPipeline';

// Thresholds padrão por exercício
const DEFAULT_THRESHOLDS: Record<ExerciseType, ExerciseThresholds> = {
  squat: {
    repDownAngle: 100,
    repUpAngle: 160,
    safeZoneTolerance: 15,
    minRepDuration: 800,
    maxRepDuration: 5000,
    debounceTime: 500,
  },
  pushup: {
    repDownAngle: 90,
    repUpAngle: 160,
    safeZoneTolerance: 15,
    minRepDuration: 600,
    maxRepDuration: 4000,
    debounceTime: 400,
  },
  situp: {
    repDownAngle: 30,
    repUpAngle: 80,
    safeZoneTolerance: 10,
    minRepDuration: 800,
    maxRepDuration: 5000,
    debounceTime: 600,
  },
  plank: {
    repDownAngle: 160,
    repUpAngle: 180,
    safeZoneTolerance: 10,
    minRepDuration: 1000,
    maxRepDuration: 60000,
    debounceTime: 1000,
  },
  lunge: {
    repDownAngle: 90,
    repUpAngle: 160,
    safeZoneTolerance: 15,
    minRepDuration: 1000,
    maxRepDuration: 5000,
    debounceTime: 500,
  },
  jumping_jack: {
    repDownAngle: 30,
    repUpAngle: 150,
    safeZoneTolerance: 20,
    minRepDuration: 300,
    maxRepDuration: 2000,
    debounceTime: 200,
  },
};

/**
 * Engine de contagem de repetições
 */
export class RepCounterEngine {
  private exerciseType: ExerciseType;
  private thresholds: ExerciseThresholds;
  private state: RepCounterState;
  private smoothing: SmoothingPipeline;
  private angleHistory: number[] = [];
  private readonly angleHistorySize = 5;

  constructor(
    exerciseType: ExerciseType,
    calibration?: CalibrationData,
    customThresholds?: Partial<ExerciseThresholds>
  ) {
    this.exerciseType = exerciseType;
    this.smoothing = new SmoothingPipeline({ alpha: 0.4 });
    
    // Combinar thresholds: padrão < calibração < custom
    this.thresholds = {
      ...DEFAULT_THRESHOLDS[exerciseType],
      ...(calibration?.thresholds || {}),
      ...(customThresholds || {}),
    };

    this.reset();
  }

  /**
   * Reseta o estado do contador
   */
  reset(): void {
    this.state = {
      phase: 'up',
      repCount: 0,
      partialReps: 0,
      lastRepTime: 0,
      peakAngle: 0,
      valleyAngle: 180,
      phaseStartTime: Date.now(),
      currentAngle: 180,
    };
    this.angleHistory = [];
    this.smoothing.reset();
  }

  /**
   * Processa um frame e retorna resultado da contagem
   */
  processFrame(rawKeypoints: Keypoint[]): RepCountResult {
    // 1. Suavizar keypoints
    const keypoints = this.smoothing.process(rawKeypoints);

    // 2. Calcular ângulos
    const angles = calculateExerciseAngles(keypoints, this.exerciseType as 'squat' | 'pushup' | 'situp' | 'plank');
    
    // 3. Suavizar ângulo principal
    const smoothedAngle = this.smoothAngle(angles.primary);
    this.state.currentAngle = smoothedAngle;

    // 4. Atualizar ângulos extremos
    angles.valley = this.state.valleyAngle;
    angles.peak = this.state.peakAngle;

    // 5. Detectar transições e contar reps
    const { isValidRep, lastRepQuality } = this.detectTransition(smoothedAngle);

    // 6. Calcular progresso da fase
    const phaseProgress = this.calculatePhaseProgress(smoothedAngle);

    return {
      totalReps: this.state.repCount,
      currentPhase: this.state.phase,
      phaseProgress,
      isValidRep,
      partialReps: this.state.partialReps,
      lastRepQuality,
      angles: {
        ...angles,
        primary: smoothedAngle,
      },
    };
  }

  /**
   * Suaviza o ângulo usando média móvel
   */
  private smoothAngle(angle: number): number {
    this.angleHistory.push(angle);
    if (this.angleHistory.length > this.angleHistorySize) {
      this.angleHistory.shift();
    }

    // Média simples para suavização adicional
    const sum = this.angleHistory.reduce((a, b) => a + b, 0);
    return sum / this.angleHistory.length;
  }

  /**
   * Detecta transições de fase e conta reps
   */
  private detectTransition(angle: number): { isValidRep: boolean; lastRepQuality: number } {
    const { repDownAngle, repUpAngle, safeZoneTolerance, debounceTime, minRepDuration } = this.thresholds;
    const now = Date.now();
    let isValidRep = false;
    let lastRepQuality = 0;

    // Zona segura: tolerância para movimentos imperfeitos
    const downThreshold = repDownAngle + safeZoneTolerance;
    const upThreshold = repUpAngle - safeZoneTolerance;

    // Rastrear ângulos extremos
    if (angle < this.state.valleyAngle) {
      this.state.valleyAngle = angle;
    }
    if (angle > this.state.peakAngle) {
      this.state.peakAngle = angle;
    }

    if (this.state.phase === 'up') {
      // Esperando descer
      if (angle < downThreshold) {
        this.state.phase = 'down';
        this.state.phaseStartTime = now;
      }
    } else if (this.state.phase === 'down') {
      // Esperando subir
      if (angle > upThreshold) {
        const timeSinceLastRep = now - this.state.lastRepTime;
        const phaseDuration = now - this.state.phaseStartTime;

        // Verificar debounce e duração mínima
        if (timeSinceLastRep > debounceTime && phaseDuration >= minRepDuration) {
          // Calcular qualidade da rep baseado na profundidade
          const depthAchieved = this.state.valleyAngle;
          const targetDepth = repDownAngle;
          
          // Qualidade: 100% se atingiu ou passou do target, menos se não atingiu
          if (depthAchieved <= targetDepth) {
            // Rep completa
            this.state.repCount++;
            isValidRep = true;
            lastRepQuality = Math.min(100, 100 + (targetDepth - depthAchieved));
          } else if (depthAchieved <= downThreshold) {
            // Rep válida mas não perfeita
            this.state.repCount++;
            isValidRep = true;
            lastRepQuality = Math.max(60, 100 - (depthAchieved - targetDepth) * 2);
          } else {
            // Rep parcial
            this.state.partialReps++;
            lastRepQuality = Math.max(30, 60 - (depthAchieved - downThreshold) * 2);
          }

          this.state.lastRepTime = now;
        }

        // Resetar para próxima rep
        this.state.phase = 'up';
        this.state.valleyAngle = 180;
        this.state.peakAngle = 0;
        this.state.phaseStartTime = now;
      }
    }

    return { isValidRep, lastRepQuality };
  }

  /**
   * Calcula progresso da fase atual (0-100%)
   */
  private calculatePhaseProgress(angle: number): number {
    const { repDownAngle, repUpAngle } = this.thresholds;
    const range = repUpAngle - repDownAngle;

    if (range <= 0) return 0;

    if (this.state.phase === 'down') {
      // Progresso de descida: 0% em pé, 100% agachado
      return Math.min(100, Math.max(0, ((repUpAngle - angle) / range) * 100));
    } else {
      // Progresso de subida: 0% agachado, 100% em pé
      return Math.min(100, Math.max(0, ((angle - repDownAngle) / range) * 100));
    }
  }

  /**
   * Obtém estatísticas atuais
   */
  getStats() {
    return {
      totalReps: this.state.repCount,
      partialReps: this.state.partialReps,
      validReps: this.state.repCount,
      currentPhase: this.state.phase,
      currentAngle: this.state.currentAngle,
    };
  }

  /**
   * Obtém estado interno (para debug)
   */
  getState(): RepCounterState {
    return { ...this.state };
  }

  /**
   * Atualiza thresholds
   */
  updateThresholds(thresholds: Partial<ExerciseThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Obtém thresholds atuais
   */
  getThresholds(): ExerciseThresholds {
    return { ...this.thresholds };
  }

  /**
   * Força uma contagem de rep (para testes ou correção manual)
   */
  forceCountRep(): void {
    this.state.repCount++;
    this.state.lastRepTime = Date.now();
  }

  /**
   * Remove última rep (para correção)
   */
  undoLastRep(): void {
    if (this.state.repCount > 0) {
      this.state.repCount--;
    }
  }
}

/**
 * Factory para criar engine baseado no exercício
 */
export function createRepCounterEngine(
  exerciseType: ExerciseType,
  calibration?: CalibrationData
): RepCounterEngine {
  return new RepCounterEngine(exerciseType, calibration);
}
