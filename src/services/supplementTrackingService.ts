/**
 * Supplement Tracking Service
 * Registra interações do usuário com suplementos para analytics e otimização
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================
// TIPOS E INTERFACES
// ============================================

export type InteractionEventType = 
  | 'view'           // Visualizou o card do produto
  | 'expand'         // Expandiu detalhes do produto
  | 'article_click'  // Clicou no artigo científico
  | 'article_view'   // Visualizou modal do artigo
  | 'purchase_click' // Clicou em comprar
  | 'purchase_complete'; // Completou a compra

export interface SupplementInteraction {
  id?: string;
  user_id: string;
  product_id: string;
  event_type: InteractionEventType;
  article_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface TrackingStats {
  totalViews: number;
  totalClicks: number;
  totalPurchases: number;
  conversionRate: number;
  topProducts: Array<{ productId: string; views: number; clicks: number }>;
}

// ============================================
// FUNÇÕES DE TRACKING
// ============================================

/**
 * Registra visualização de um produto
 */
export const trackView = async (
  userId: string, 
  productId: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    await trackInteraction(userId, productId, 'view', undefined, metadata);
  } catch (error) {
    console.error('[SupplementTracking] Erro ao registrar view:', error);
  }
};

/**
 * Registra clique em artigo científico
 */
export const trackArticleClick = async (
  userId: string,
  productId: string,
  articleId: string
): Promise<void> => {
  try {
    await trackInteraction(userId, productId, 'article_click', articleId);
  } catch (error) {
    console.error('[SupplementTracking] Erro ao registrar article click:', error);
  }
};

/**
 * Registra visualização do modal de artigo
 */
export const trackArticleView = async (
  userId: string,
  productId: string,
  articleId: string
): Promise<void> => {
  try {
    await trackInteraction(userId, productId, 'article_view', articleId);
  } catch (error) {
    console.error('[SupplementTracking] Erro ao registrar article view:', error);
  }
};

/**
 * Registra clique no botão de compra
 */
export const trackPurchaseClick = async (
  userId: string,
  productId: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    await trackInteraction(userId, productId, 'purchase_click', undefined, metadata);
  } catch (error) {
    console.error('[SupplementTracking] Erro ao registrar purchase click:', error);
  }
};

/**
 * Registra compra completada
 */
export const trackPurchaseComplete = async (
  userId: string,
  productId: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    await trackInteraction(userId, productId, 'purchase_complete', undefined, metadata);
  } catch (error) {
    console.error('[SupplementTracking] Erro ao registrar purchase complete:', error);
  }
};

/**
 * Registra expansão de detalhes do produto
 */
export const trackExpand = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    await trackInteraction(userId, productId, 'expand');
  } catch (error) {
    console.error('[SupplementTracking] Erro ao registrar expand:', error);
  }
};

// ============================================
// FUNÇÃO PRINCIPAL DE TRACKING
// ============================================

/**
 * Função genérica para registrar interações
 * Usa localStorage como fallback se a tabela não existir
 */
const trackInteraction = async (
  userId: string,
  productId: string,
  eventType: InteractionEventType,
  articleId?: string,
  metadata?: Record<string, any>
): Promise<void> => {
  const interaction: SupplementInteraction = {
    user_id: userId,
    product_id: productId,
    event_type: eventType,
    article_id: articleId,
    metadata,
    created_at: new Date().toISOString(),
  };

  try {
    // Tentar salvar no Supabase (usando any para evitar erro de tipo enquanto tabela não existe)
    const { error } = await (supabase as any)
      .from('supplement_interactions')
      .insert(interaction);

    if (error) {
      // Se a tabela não existir, usar localStorage como fallback
      if (error.code === '42P01') { // relation does not exist
        saveToLocalStorage(interaction);
      } else {
        throw error;
      }
    }
  } catch (error) {
    // Fallback para localStorage
    saveToLocalStorage(interaction);
  }
};

/**
 * Salva interação no localStorage como fallback
 */
const saveToLocalStorage = (interaction: SupplementInteraction): void => {
  try {
    const key = 'supplement_interactions';
    const existing = localStorage.getItem(key);
    const interactions: SupplementInteraction[] = existing ? JSON.parse(existing) : [];
    
    interactions.push(interaction);
    
    // Manter apenas últimas 100 interações
    if (interactions.length > 100) {
      interactions.splice(0, interactions.length - 100);
    }
    
    localStorage.setItem(key, JSON.stringify(interactions));
  } catch (error) {
    console.error('[SupplementTracking] Erro ao salvar no localStorage:', error);
  }
};

// ============================================
// FUNÇÕES DE ANALYTICS
// ============================================

/**
 * Busca estatísticas de interações de um usuário
 */
export const getUserStats = async (userId: string): Promise<TrackingStats | null> => {
  try {
    // Usando any para evitar erro de tipo enquanto tabela não existe
    const { data, error } = await (supabase as any)
      .from('supplement_interactions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      // Tentar localStorage
      return getStatsFromLocalStorage(userId);
    }

    if (!data || data.length === 0) {
      return getStatsFromLocalStorage(userId);
    }

    return calculateStats(data as SupplementInteraction[]);
  } catch (error) {
    return getStatsFromLocalStorage(userId);
  }
};

/**
 * Busca estatísticas do localStorage
 */
const getStatsFromLocalStorage = (userId: string): TrackingStats | null => {
  try {
    const key = 'supplement_interactions';
    const existing = localStorage.getItem(key);
    if (!existing) return null;

    const interactions: SupplementInteraction[] = JSON.parse(existing);
    const userInteractions = interactions.filter(i => i.user_id === userId);
    
    if (userInteractions.length === 0) return null;

    return calculateStats(userInteractions);
  } catch {
    return null;
  }
};

/**
 * Calcula estatísticas a partir de interações
 */
const calculateStats = (interactions: SupplementInteraction[]): TrackingStats => {
  const views = interactions.filter(i => i.event_type === 'view').length;
  const clicks = interactions.filter(i => 
    i.event_type === 'purchase_click' || i.event_type === 'article_click'
  ).length;
  const purchases = interactions.filter(i => i.event_type === 'purchase_complete').length;

  // Agrupar por produto
  const productStats: Record<string, { views: number; clicks: number }> = {};
  
  interactions.forEach(i => {
    if (!productStats[i.product_id]) {
      productStats[i.product_id] = { views: 0, clicks: 0 };
    }
    if (i.event_type === 'view') {
      productStats[i.product_id].views++;
    }
    if (i.event_type === 'purchase_click' || i.event_type === 'article_click') {
      productStats[i.product_id].clicks++;
    }
  });

  const topProducts = Object.entries(productStats)
    .map(([productId, stats]) => ({ productId, ...stats }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return {
    totalViews: views,
    totalClicks: clicks,
    totalPurchases: purchases,
    conversionRate: views > 0 ? (purchases / views) * 100 : 0,
    topProducts,
  };
};

/**
 * Sincroniza interações do localStorage com o Supabase
 * Útil quando a tabela é criada depois
 */
export const syncLocalStorageToSupabase = async (): Promise<number> => {
  try {
    const key = 'supplement_interactions';
    const existing = localStorage.getItem(key);
    if (!existing) return 0;

    const interactions: SupplementInteraction[] = JSON.parse(existing);
    if (interactions.length === 0) return 0;

    // Usando any para evitar erro de tipo enquanto tabela não existe
    const { error } = await (supabase as any)
      .from('supplement_interactions')
      .insert(interactions);

    if (!error) {
      localStorage.removeItem(key);
      return interactions.length;
    }

    return 0;
  } catch {
    return 0;
  }
};

export default {
  trackView,
  trackArticleClick,
  trackArticleView,
  trackPurchaseClick,
  trackPurchaseComplete,
  trackExpand,
  getUserStats,
  syncLocalStorageToSupabase,
};
