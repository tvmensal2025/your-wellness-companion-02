import { supabase as baseSupabase } from './client';
import type { Database } from './types';

// Wrapper de compatibilidade: reexporta o client oficial baseado
// nas variáveis de ambiente do Lovable Cloud.
// Assim, qualquer código que ainda importe
// `@/integrations/supabase/client-fixed` usará o backend novo.

export const supabase = baseSupabase as unknown as ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>;

