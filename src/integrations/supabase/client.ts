// Este arquivo agora apenas reexporta o cliente já configurado em client-fixed.
// Isso evita erros de "supabaseUrl is required" causados por variáveis de ambiente não carregadas.

export { supabase } from './client-fixed';
