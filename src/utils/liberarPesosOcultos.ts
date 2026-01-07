/**
 * Utilitário para liberar todos os pesos ocultos
 * Define show_weight_results = true para todos os usuários
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Libera todos os pesos ocultos, definindo show_weight_results = true para todos os perfis
 * @returns Promise com o número de perfis atualizados
 */
export async function liberarTodosPesosOcultos(): Promise<number> {
  try {
    // Atualizar todos os perfis onde show_weight_results é false ou null
    const { data, error, count } = await supabase
      .from('profiles')
      .update({ show_weight_results: true })
      .or('show_weight_results.is.null,show_weight_results.eq.false')
      .select('id');

    if (error) {
      console.error('Erro ao liberar pesos ocultos:', error);
      toast.error('Erro ao liberar pesos ocultos');
      throw error;
    }

    const updatedCount = count || data?.length || 0;
    
    toast.success(`${updatedCount} perfil(is) atualizado(s) - Todos os pesos estão visíveis agora!`);
    
    return updatedCount;
  } catch (error) {
    console.error('Erro ao liberar pesos ocultos:', error);
    toast.error('Erro ao liberar pesos ocultos');
    throw error;
  }
}

/**
 * Verifica estatísticas de visibilidade de pesos
 * @returns Promise com estatísticas
 */
export async function verificarEstatisticasPesos(): Promise<{
  total: number;
  visiveis: number;
  ocultos: number;
}> {
  try {
    // Contar total de perfis
    const { count: total } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Contar perfis com pesos visíveis
    const { count: visiveis } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('show_weight_results', true);

    // Contar perfis com pesos ocultos
    const { count: ocultos } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .or('show_weight_results.is.null,show_weight_results.eq.false');

    return {
      total: total || 0,
      visiveis: visiveis || 0,
      ocultos: ocultos || 0,
    };
  } catch (error) {
    console.error('Erro ao verificar estatísticas:', error);
    throw error;
  }
}

