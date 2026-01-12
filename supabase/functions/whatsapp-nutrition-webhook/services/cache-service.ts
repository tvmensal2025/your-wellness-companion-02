import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * 🚀 Cache Service para WhatsApp
 * Economiza até 50% do tempo e 30% do custo em respostas repetidas
 */

// TTL padrão por tipo de query
const TTL_HOURS: Record<string, number> = {
  'greeting': 24,           // Saudações: 24h
  'faq': 168,               // FAQ: 1 semana
  'food_text_analysis': 12, // Análise de texto: 12h
  'image_hash': 24,         // Hash de imagem: 24h
  'intent': 4,              // Intenção: 4h
};

/**
 * Gera hash simples para texto (para cache)
 */
export function generateTextHash(text: string, userId?: string): string {
  const normalized = text.toLowerCase().trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 200);
  
  // Simple hash function
  let hash = 0;
  const str = `${normalized}_${userId || 'global'}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `whatsapp_${Math.abs(hash).toString(16)}`;
}

/**
 * Busca resposta em cache
 */
export async function getCachedResponse(
  supabase: SupabaseClient,
  queryHash: string
): Promise<{ hit: boolean; response?: string; tokensSaved?: number }> {
  try {
    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('response_text, tokens_used, hit_count, id')
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !data) {
      return { hit: false };
    }

    // Atualizar hit count em background (fire and forget)
    (async () => {
      try {
        await supabase
          .from('ai_response_cache')
          .update({
            hit_count: (data.hit_count || 0) + 1,
            last_hit_at: new Date().toISOString()
          })
          .eq('id', data.id);
      } catch (e) {
        // Ignore errors in background update
      }
    })();

    console.log(`[Cache] HIT para ${queryHash.slice(0, 20)}... (${data.hit_count || 0} hits anteriores)`);

    return {
      hit: true,
      response: data.response_text,
      tokensSaved: data.tokens_used || 0
    };
  } catch (error) {
    console.error('[Cache] Erro ao buscar:', error);
    return { hit: false };
  }
}

/**
 * Salva resposta em cache
 */
export async function setCachedResponse(
  supabase: SupabaseClient,
  queryHash: string,
  queryType: string,
  queryInput: string,
  responseText: string,
  options?: {
    modelUsed?: string;
    tokensUsed?: number;
    ttlHours?: number;
  }
): Promise<boolean> {
  try {
    const ttlHours = options?.ttlHours || TTL_HOURS[queryType] || 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    const { error } = await supabase
      .from('ai_response_cache')
      .upsert({
        query_hash: queryHash,
        query_type: queryType,
        query_input: queryInput.slice(0, 1000),
        response_text: responseText,
        model_used: options?.modelUsed || 'unknown',
        tokens_used: options?.tokensUsed || 0,
        ttl_hours: ttlHours,
        expires_at: expiresAt.toISOString(),
        hit_count: 0,
        created_at: new Date().toISOString()
      }, { onConflict: 'query_hash' });

    if (error) {
      console.error('[Cache] Erro ao salvar:', error);
      return false;
    }

    console.log(`[Cache] Salvo: ${queryHash.slice(0, 20)}... (TTL: ${ttlHours}h)`);
    return true;
  } catch (error) {
    console.error('[Cache] Erro ao salvar:', error);
    return false;
  }
}

/**
 * Wrapper para função com cache
 * Primeiro verifica cache, se não existir executa função e salva
 */
export async function withCache<T extends string>(
  supabase: SupabaseClient,
  queryType: string,
  queryInput: string,
  userId: string | undefined,
  fetchFn: () => Promise<T>,
  options?: {
    modelUsed?: string;
    estimatedTokens?: number;
  }
): Promise<{ response: T; fromCache: boolean; tokensSaved: number }> {
  const queryHash = generateTextHash(queryInput, userId);
  
  // Verificar cache primeiro
  const cached = await getCachedResponse(supabase, queryHash);
  
  if (cached.hit && cached.response) {
    return {
      response: cached.response as T,
      fromCache: true,
      tokensSaved: cached.tokensSaved || 0
    };
  }
  
  // Executar função
  const response = await fetchFn();
  
  // Salvar em cache em background
  (async () => {
    try {
      await setCachedResponse(
        supabase,
        queryHash,
        queryType,
        queryInput,
        response,
        {
          modelUsed: options?.modelUsed,
          tokensUsed: options?.estimatedTokens || 100
        }
      );
    } catch (e) {
      // Ignore cache save errors
    }
  })();
  
  return {
    response,
    fromCache: false,
    tokensSaved: 0
  };
}

/**
 * Limpa cache expirado (para manutenção)
 */
export async function cleanupExpiredCache(supabase: SupabaseClient): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('ai_response_cache')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('[Cache] Erro ao limpar:', error);
      return 0;
    }

    console.log(`[Cache] Limpeza: ${count || 0} entradas expiradas removidas`);
    return count || 0;
  } catch (error) {
    console.error('[Cache] Erro ao limpar:', error);
    return 0;
  }
}

/**
 * Estatísticas de cache
 */
export async function getCacheStats(supabase: SupabaseClient): Promise<{
  totalCached: number;
  totalHits: number;
  totalTokensSaved: number;
  estimatedCostSaved: number;
}> {
  try {
    const { data: hitData } = await supabase
      .from('ai_response_cache')
      .select('hit_count, tokens_used')
      .gt('hit_count', 0);

    const totalHits = hitData?.reduce((acc, row) => acc + (row.hit_count || 0), 0) || 0;
    const totalTokensSaved = hitData?.reduce((acc, row) => 
      acc + ((row.hit_count || 0) * (row.tokens_used || 0)), 0) || 0;

    const { count } = await supabase
      .from('ai_response_cache')
      .select('*', { count: 'exact', head: true });

    return {
      totalCached: count || 0,
      totalHits,
      totalTokensSaved,
      estimatedCostSaved: (totalTokensSaved / 1000) * 0.002 // ~$0.002/1k tokens
    };
  } catch (error) {
    return { totalCached: 0, totalHits: 0, totalTokensSaved: 0, estimatedCostSaved: 0 };
  }
}
