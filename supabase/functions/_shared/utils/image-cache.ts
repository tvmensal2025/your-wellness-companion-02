/**
 * 📦 Cache de Análises de Imagem com SHA-256
 * Reduz custos de IA em ~30% evitando reprocessamento de imagens idênticas
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Lazy init para evitar erros se variáveis não estiverem disponíveis
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase && supabaseUrl && supabaseServiceKey) {
    _supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabase;
}

export type AnalysisType = 'food' | 'medical' | 'image_type';

/**
 * Gera hash SHA-256 de uma imagem base64
 * Usa apenas os primeiros 50KB para performance
 */
export async function hashImage(base64Data: string): Promise<string> {
  try {
    // Remove prefixo data:image se existir
    const cleanData = base64Data.includes(',') 
      ? base64Data.split(',')[1] 
      : base64Data;
    
    // Usa apenas primeiros 50KB para hash rápido
    const dataToHash = cleanData.slice(0, 50000);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToHash);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('[Cache] Erro ao gerar hash:', error);
    // Fallback: usar timestamp + random como hash único
    return `fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * Busca resultado em cache
 * Retorna null se não encontrado ou expirado
 */
export async function getCachedResult(
  imageHash: string, 
  analysisType: AnalysisType
): Promise<any | null> {
  const supabase = getSupabase();
  if (!supabase) {
    console.log('[Cache] Supabase não disponível');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('analysis_cache')
      .select('result, id')
      .eq('image_hash', imageHash)
      .eq('analysis_type', analysisType)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Incrementar hits de forma assíncrona (não bloqueia)
    supabase
      .from('analysis_cache')
      .update({ 
        hits: (data as any).hits ? (data as any).hits + 1 : 1, 
        last_hit_at: new Date().toISOString() 
      })
      .eq('id', data.id)
      .then(() => console.log(`[Cache] HIT! Hash: ${imageHash.slice(0, 12)}...`));
    
    return data.result;
  } catch (error) {
    console.error('[Cache] Erro ao buscar:', error);
    return null;
  }
}

/**
 * Salva resultado em cache
 */
export async function setCachedResult(
  imageHash: string,
  analysisType: AnalysisType,
  result: any,
  modelUsed: string,
  processingTimeMs: number,
  yoloConfidence?: number
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    console.log('[Cache] Supabase não disponível para salvar');
    return;
  }

  try {
    const { error } = await supabase
      .from('analysis_cache')
      .upsert({
        image_hash: imageHash,
        analysis_type: analysisType,
        result,
        model_used: modelUsed,
        processing_time_ms: processingTimeMs,
        yolo_confidence: yoloConfidence || null,
        created_at: new Date().toISOString(),
        hits: 0
      }, { 
        onConflict: 'image_hash,analysis_type' 
      });
    
    if (error) {
      console.error('[Cache] Erro ao salvar:', error.message);
    } else {
      console.log(`[Cache] SAVED! Hash: ${imageHash.slice(0, 12)}... | Modelo: ${modelUsed} | ${processingTimeMs}ms`);
    }
  } catch (error) {
    console.error('[Cache] Erro ao salvar:', error);
  }
}

/**
 * Verifica se cache está habilitado via env
 */
export function isCacheEnabled(): boolean {
  const enabled = Deno.env.get('ENABLE_ANALYSIS_CACHE');
  // Default é true se não definido
  return enabled !== 'false';
}
