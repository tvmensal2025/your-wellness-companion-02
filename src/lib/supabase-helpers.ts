// Utility para queries em tabelas não tipadas no schema do Supabase
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper para acessar tabelas que não estão tipadas no schema atual.
 * Use quando a tabela existe no banco mas não está no types.ts
 */
export const fromTable = (table: string) => supabase.from(table as any);

/**
 * Helper para chamar funções RPC não tipadas
 */
export const callRpc = (fn: string, params?: any) => supabase.rpc(fn as any, params);

export default fromTable;
