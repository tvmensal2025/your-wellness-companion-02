/**
 * 📊 SISTEMA DE MONITORAMENTO PARA EDGE FUNCTIONS
 * 
 * Intercepta e registra automaticamente todas as chamadas de edge functions
 * Uso: Importar e usar o wrapper em todas as edge functions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

// ============================================
// TIPOS
// ============================================

export type EdgeFunctionFeature = 
  | 'whatsapp'
  | 'sofia'
  | 'dr_vital'
  | 'yolo'
  | 'gemini'
  | 'medical_exam'
  | 'food_analysis'
  | 'google_fit'
  | 'payment'
  | 'notification'
  | 'report'
  | 'other';

export interface EdgeFunctionMetrics {
  function_name: string;
  feature: EdgeFunctionFeature;
  duration_ms: number;
  success: boolean;
  error_message?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

// ============================================
// CLASSE DE MONITORAMENTO
// ============================================

class EdgeFunctionMonitoring {
  private supabase: any;
  private enabled: boolean = true;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Registrar métrica de edge function
   */
  async logMetric(metrics: EdgeFunctionMetrics): Promise<void> {
    if (!this.enabled) return;

    try {
      const { error } = await this.supabase
        .from('performance_metrics')
        .insert({
          feature: metrics.feature,
          action: metrics.function_name,
          duration_ms: metrics.duration_ms,
          success: metrics.success,
          error_message: metrics.error_message,
          user_id: metrics.user_id,
          metadata: metrics.metadata || {}
        });

      if (error) {
        console.error('[Monitoring] Erro ao registrar métrica:', error);
      }
    } catch (error) {
      console.error('[Monitoring] Erro ao registrar métrica:', error);
    }
  }

  /**
   * Wrapper para edge functions
   * Mede automaticamente tempo de execução e registra métricas
   */
  async wrap<T>(
    functionName: string,
    feature: EdgeFunctionFeature,
    handler: () => Promise<T>,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    let success = true;
    let error_message: string | undefined;

    try {
      const result = await handler();
      return result;
    } catch (error) {
      success = false;
      error_message = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const duration_ms = Math.round(performance.now() - start);

      // Registrar métrica (não bloqueia)
      this.logMetric({
        function_name: functionName,
        feature,
        duration_ms,
        success,
        error_message,
        user_id: userId,
        metadata
      }).catch(err => {
        console.error('[Monitoring] Falha ao registrar métrica:', err);
      });
    }
  }

  /**
   * Registrar erro crítico
   */
  async logCriticalError(
    functionName: string,
    feature: EdgeFunctionFeature,
    error: Error,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      const { error: dbError } = await this.supabase
        .from('critical_errors')
        .insert({
          feature,
          error_type: error.name,
          error_message: error.message,
          stack_trace: error.stack,
          user_id: userId,
          metadata: {
            function_name: functionName,
            ...metadata
          }
        });

      if (dbError) {
        console.error('[Monitoring] Erro ao registrar erro crítico:', dbError);
      }
    } catch (err) {
      console.error('[Monitoring] Erro ao registrar erro crítico:', err);
    }
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const edgeMonitoring = new EdgeFunctionMonitoring();

// ============================================
// HELPERS ESPECÍFICOS
// ============================================

/**
 * Monitoramento WhatsApp
 */
export const whatsappMonitoring = {
  async trackMessage(
    functionName: string,
    duration_ms: number,
    success: boolean,
    metadata?: {
      message_type?: 'text' | 'image' | 'audio' | 'button';
      premium?: boolean;
      phone?: string;
      error?: string;
    }
  ) {
    await edgeMonitoring.logMetric({
      function_name: functionName,
      feature: 'whatsapp',
      duration_ms,
      success,
      error_message: metadata?.error,
      metadata
    });
  }
};

/**
 * Monitoramento Dr. Vital (Análise de Exames)
 */
export const drVitalMonitoring = {
  async trackExamAnalysis(
    functionName: string,
    duration_ms: number,
    success: boolean,
    metadata?: {
      exam_type?: string;
      yolo_used?: boolean;
      gemini_used?: boolean;
      pages?: number;
      error?: string;
    }
  ) {
    await edgeMonitoring.logMetric({
      function_name: functionName,
      feature: 'dr_vital',
      duration_ms,
      success,
      error_message: metadata?.error,
      metadata
    });
  }
};

/**
 * Monitoramento Sofia (Análise de Alimentos)
 */
export const sofiaMonitoring = {
  async trackAnalysis(
    functionName: string,
    duration_ms: number,
    success: boolean,
    metadata?: {
      foods_detected?: number;
      yolo_used?: boolean;
      gemini_used?: boolean;
      calories?: number;
      analysis_type?: 'image' | 'text';
      error?: string;
    }
  ) {
    await edgeMonitoring.logMetric({
      function_name: functionName,
      feature: 'sofia',
      duration_ms,
      success,
      error_message: metadata?.error,
      metadata
    });
  }
};

/**
 * Monitoramento Google Fit
 */
export const googleFitMonitoring = {
  async trackSync(
    functionName: string,
    duration_ms: number,
    success: boolean,
    metadata?: {
      data_points?: number;
      sync_type?: 'manual' | 'automatic';
      error?: string;
    }
  ) {
    await edgeMonitoring.logMetric({
      function_name: functionName,
      feature: 'google_fit',
      duration_ms,
      success,
      error_message: metadata?.error,
      metadata
    });
  }
};

/**
 * Monitoramento de Pagamentos
 */
export const paymentMonitoring = {
  async trackPayment(
    functionName: string,
    duration_ms: number,
    success: boolean,
    metadata?: {
      amount?: number;
      payment_method?: string;
      error?: string;
    }
  ) {
    await edgeMonitoring.logMetric({
      function_name: functionName,
      feature: 'payment',
      duration_ms,
      success,
      error_message: metadata?.error,
      metadata
    });
  }
};

/**
 * Monitoramento de Notificações
 */
export const notificationMonitoring = {
  async trackNotification(
    functionName: string,
    duration_ms: number,
    success: boolean,
    metadata?: {
      notification_type?: string;
      channel?: 'whatsapp' | 'email' | 'push';
      error?: string;
    }
  ) {
    await edgeMonitoring.logMetric({
      function_name: functionName,
      feature: 'notification',
      duration_ms,
      success,
      error_message: metadata?.error,
      metadata
    });
  }
};

/**
 * Monitoramento de Relatórios
 */
export const reportMonitoring = {
  async trackReport(
    functionName: string,
    duration_ms: number,
    success: boolean,
    metadata?: {
      report_type?: string;
      format?: 'pdf' | 'html' | 'json';
      pages?: number;
      error?: string;
    }
  ) {
    await edgeMonitoring.logMetric({
      function_name: functionName,
      feature: 'report',
      duration_ms,
      success,
      error_message: metadata?.error,
      metadata
    });
  }
};
