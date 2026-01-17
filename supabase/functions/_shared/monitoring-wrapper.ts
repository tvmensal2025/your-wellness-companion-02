/**
 * 📊 WRAPPER SIMPLES PARA INSTRUMENTAÇÃO DE EDGE FUNCTIONS
 * 
 * Uso: Envolver o handler principal da edge function
 */

import { edgeMonitoring, type EdgeFunctionFeature } from './monitoring.ts';

/**
 * Wrapper para edge functions
 * Registra automaticamente métricas de performance
 */
export function monitoredHandler(
  functionName: string,
  feature: EdgeFunctionFeature,
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const start = performance.now();
    let success = true;
    let error_message: string | undefined;
    let userId: string | undefined;
    let metadata: Record<string, any> = {};

    try {
      // Extrair user_id do body se possível
      if (req.method === 'POST') {
        try {
          const clonedReq = req.clone();
          const body = await clonedReq.json();
          userId = body.userId || body.user_id;
          
          // Capturar metadata relevante
          if (body.imageUrl) metadata.has_image = true;
          if (body.text) metadata.has_text = true;
          if (body.phone) metadata.has_phone = true;
        } catch {
          // Ignorar se não conseguir parsear
        }
      }

      // Executar handler
      const response = await handler(req);
      
      // Verificar se foi sucesso
      success = response.ok;
      
      // Tentar extrair metadata da response
      try {
        const clonedRes = response.clone();
        const responseBody = await clonedRes.json();
        
        if (responseBody.error) {
          success = false;
          error_message = responseBody.error;
        }
        
        // Capturar metadata da resposta
        if (responseBody.foods) metadata.foods_count = responseBody.foods.length;
        if (responseBody.calories) metadata.calories = responseBody.calories;
        if (responseBody.analysis) metadata.has_analysis = true;
      } catch {
        // Ignorar se não conseguir parsear
      }

      return response;
      
    } catch (error) {
      success = false;
      error_message = error instanceof Error ? error.message : String(error);
      
      // Registrar erro crítico
      if (error instanceof Error) {
        await edgeMonitoring.logCriticalError(
          functionName,
          feature,
          error,
          userId,
          metadata
        );
      }
      
      throw error;
      
    } finally {
      const duration_ms = Math.round(performance.now() - start);
      
      // Registrar métrica (não bloqueia)
      edgeMonitoring.logMetric({
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
  };
}

/**
 * Helper para registrar métrica manualmente dentro de uma edge function
 */
export async function trackMetric(
  functionName: string,
  feature: EdgeFunctionFeature,
  duration_ms: number,
  success: boolean,
  options?: {
    error?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
) {
  await edgeMonitoring.logMetric({
    function_name: functionName,
    feature,
    duration_ms,
    success,
    error_message: options?.error,
    user_id: options?.userId,
    metadata: options?.metadata || {}
  });
}
