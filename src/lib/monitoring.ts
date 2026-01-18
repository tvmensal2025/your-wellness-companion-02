/**
 * 🎯 SISTEMA DE MONITORAMENTO CENTRALIZADO
 * 
 * Sistema completo de tracking de performance, erros e health checks
 * Integrado com o painel admin para visualização em tempo real
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================
// TIPOS
// ============================================

export type MonitoringFeature = 
  | 'yolo'
  | 'sofia'
  | 'camera_workout'
  | 'dr_vital'
  | 'gemini'
  | 'food_analysis'
  | 'exam_analysis'
  | 'whatsapp'
  | 'challenges'
  | 'sessions'
  | 'auth'
  | 'database'
  | 'storage'
  | 'other';

export type ServiceStatus = 'healthy' | 'degraded' | 'down';

export interface PerformanceMetric {
  feature: MonitoringFeature;
  action: string;
  duration_ms: number;
  success: boolean;
  error_message?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

export interface HealthCheck {
  service_name: string;
  status: ServiceStatus;
  response_time_ms?: number;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface CriticalError {
  feature: MonitoringFeature;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  user_id?: string;
  user_agent?: string;
  url?: string;
  metadata?: Record<string, any>;
}

// ============================================
// CLASSE PRINCIPAL DE MONITORAMENTO
// ============================================

class MonitoringService {
  private enabled: boolean = true;
  private batchQueue: PerformanceMetric[] = [];
  private batchSize: number = 10;
  private batchTimeout: number = 5000; // 5 segundos
  private batchTimer: NodeJS.Timeout | null = null;

  /**
   * Desabilitar monitoramento (útil para testes)
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Habilitar monitoramento
   */
  enable() {
    this.enabled = true;
  }

  /**
   * 📊 Registrar métrica de performance
   */
  async logMetric(metric: PerformanceMetric): Promise<void> {
    if (!this.enabled) return;

    try {
      // Adicionar à fila de batch
      this.batchQueue.push(metric);

      // Se atingiu o tamanho do batch, enviar imediatamente
      if (this.batchQueue.length >= this.batchSize) {
        await this.flushBatch();
      } else {
        // Caso contrário, agendar envio
        this.scheduleBatchFlush();
      }
    } catch (error) {
      console.error('[Monitoring] Erro ao registrar métrica:', error);
    }
  }

  /**
   * Agendar envio do batch
   */
  private scheduleBatchFlush() {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.flushBatch();
    }, this.batchTimeout);
  }

  /**
   * Enviar batch de métricas
   * NOTA: Tabela performance_metrics não existe, usando console.log como fallback
   */
  private async flushBatch() {
    if (this.batchQueue.length === 0) return;

    const metricsToSend = [...this.batchQueue];
    this.batchQueue = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      // TODO: Criar tabela performance_metrics quando necessário
      // Por enquanto, apenas logar no console
      console.log('[Monitoring] Métricas (tabela não existe):', metricsToSend.length, 'métricas');
      
      // Comentado pois tabela não existe:
      // const { error } = await supabase
      //   .from('performance_metrics')
      //   .insert(metricsToSend);
    } catch (error) {
      console.error('[Monitoring] Erro ao enviar batch:', error);
    }
  }

  /**
   * 🏥 Registrar health check
   * NOTA: RPC log_health_check não existe, usando console.log
   */
  async logHealthCheck(check: HealthCheck): Promise<void> {
    if (!this.enabled) return;

    try {
      // TODO: Criar função RPC log_health_check quando necessário
      console.log('[Monitoring] Health check (RPC não existe):', check.service_name, check.status);
    } catch (error) {
      console.error('[Monitoring] Erro ao registrar health check:', error);
    }
  }

  /**
   * 🚨 Registrar erro crítico
   * NOTA: RPC log_critical_error não existe, usando console.log
   */
  async logCriticalError(error: CriticalError): Promise<void> {
    if (!this.enabled) return;

    try {
      // TODO: Criar função RPC log_critical_error quando necessário
      console.error('[Monitoring] Erro crítico (RPC não existe):', error.feature, error.error_message);
    } catch (err) {
      console.error('[Monitoring] Erro ao registrar erro crítico:', err);
    }
  }


  /**
   * ⏱️ Wrapper para medir tempo de execução
   */
  async measure<T>(
    feature: MonitoringFeature,
    action: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    let success = true;
    let error_message: string | undefined;

    try {
      const result = await fn();
      return result;
    } catch (error) {
      success = false;
      error_message = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const duration_ms = Math.round(performance.now() - start);

      await this.logMetric({
        feature,
        action,
        duration_ms,
        success,
        error_message,
        metadata
      });
    }
  }

  /**
   * 🔍 Verificar saúde de um serviço
   */
  async checkServiceHealth(
    serviceName: string,
    healthCheckFn: () => Promise<boolean>
  ): Promise<ServiceStatus> {
    const start = performance.now();
    let status: ServiceStatus = 'healthy';
    let error_message: string | undefined;

    try {
      const isHealthy = await healthCheckFn();
      status = isHealthy ? 'healthy' : 'degraded';
    } catch (error) {
      status = 'down';
      error_message = error instanceof Error ? error.message : String(error);
    } finally {
      const response_time_ms = Math.round(performance.now() - start);

      await this.logHealthCheck({
        service_name: serviceName,
        status,
        response_time_ms,
        error_message
      });
    }

    return status;
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const monitoring = new MonitoringService();

// ============================================
// HELPERS ESPECÍFICOS POR FEATURE
// ============================================

/**
 * 🦾 Monitoramento YOLO
 */
export const yoloMonitoring = {
  async trackDetection(
    duration_ms: number,
    success: boolean,
    metadata?: { objects_detected?: number; confidence?: number }
  ) {
    await monitoring.logMetric({
      feature: 'yolo',
      action: 'detect_objects',
      duration_ms,
      success,
      metadata
    });
  },

  async checkHealth(): Promise<ServiceStatus> {
    return monitoring.checkServiceHealth('yolo', async () => {
      const response = await fetch(
        'https://yolo-service-yolo-detection.0sw627.easypanel.host/health',
        { method: 'GET', signal: AbortSignal.timeout(5000) }
      );
      return response.ok;
    });
  }
};

/**
 * 🤖 Monitoramento Sofia (Análise de Alimentos)
 */
export const sofiaMonitoring = {
  async trackAnalysis(
    duration_ms: number,
    success: boolean,
    metadata?: {
      foods_detected?: number;
      yolo_used?: boolean;
      gemini_used?: boolean;
      calories?: number;
    }
  ) {
    await monitoring.logMetric({
      feature: 'sofia',
      action: 'analyze_food',
      duration_ms,
      success,
      metadata
    });
  },

  async trackError(error: Error, context?: Record<string, any>) {
    await monitoring.logCriticalError({
      feature: 'sofia',
      error_type: error.name,
      error_message: error.message,
      stack_trace: error.stack,
      metadata: context
    });
  }
};

/**
 * 🏋️ Monitoramento Camera Workout
 */
export const cameraWorkoutMonitoring = {
  async trackWorkout(
    duration_ms: number,
    success: boolean,
    metadata?: {
      exercise?: string;
      reps?: number;
      score?: number;
      yolo_latency?: number;
      // Extended fields for metricsService
      session_id?: string;
      avg_fps?: number;
      avg_latency?: number;
      avg_confidence?: number;
      min_fps?: number;
      max_latency?: number;
      min_confidence?: number;
      issues_count?: number;
    }
  ) {
    await monitoring.logMetric({
      feature: 'camera_workout',
      action: 'workout_session',
      duration_ms,
      success,
      metadata
    });
  },

  async trackPoseDetection(
    duration_ms: number,
    success: boolean,
    metadata?: { keypoints_detected?: number; confidence?: number }
  ) {
    await monitoring.logMetric({
      feature: 'camera_workout',
      action: 'pose_detection',
      duration_ms,
      success,
      metadata
    });
  }
};

/**
 * 🩺 Monitoramento Dr. Vital (Análise de Exames)
 */
export const drVitalMonitoring = {
  async trackExamAnalysis(
    duration_ms: number,
    success: boolean,
    metadata?: {
      exam_type?: string;
      yolo_used?: boolean;
      gemini_used?: boolean;
    }
  ) {
    await monitoring.logMetric({
      feature: 'dr_vital',
      action: 'analyze_exam',
      duration_ms,
      success,
      metadata
    });
  }
};

/**
 * 💬 Monitoramento WhatsApp
 */
export const whatsappMonitoring = {
  async trackMessage(
    duration_ms: number,
    success: boolean,
    metadata?: {
      message_type?: 'text' | 'image' | 'audio';
      premium?: boolean;
    }
  ) {
    await monitoring.logMetric({
      feature: 'whatsapp',
      action: 'process_message',
      duration_ms,
      success,
      metadata
    });
  }
};

// ============================================
// HOOK REACT PARA MONITORAMENTO
// ============================================

export function useMonitoring() {
  return {
    logMetric: monitoring.logMetric.bind(monitoring),
    logHealthCheck: monitoring.logHealthCheck.bind(monitoring),
    logCriticalError: monitoring.logCriticalError.bind(monitoring),
    measure: monitoring.measure.bind(monitoring),
    
    // Helpers específicos
    yolo: yoloMonitoring,
    sofia: sofiaMonitoring,
    cameraWorkout: cameraWorkoutMonitoring,
    drVital: drVitalMonitoring,
    whatsapp: whatsappMonitoring
  };
}

// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================

// Capturar erros não tratados
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    monitoring.logCriticalError({
      feature: 'other',
      error_type: 'UnhandledError',
      error_message: event.message,
      stack_trace: event.error?.stack,
      url: event.filename,
      metadata: {
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    monitoring.logCriticalError({
      feature: 'other',
      error_type: 'UnhandledPromiseRejection',
      error_message: String(event.reason),
      stack_trace: event.reason?.stack,
      metadata: {
        promise: String(event.promise)
      }
    });
  });
}
