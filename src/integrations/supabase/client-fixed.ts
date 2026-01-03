import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Fallback Supabase client that does NOT depend on import.meta.env,
// to evitar erro "supabaseUrl is required" quando as variáveis de ambiente
// não são injetadas corretamente.
//
// IMPORTANTE: esta chave é a mesma anon/publishable já exposta em lovable.json
// e no painel do projeto, ou seja, não adiciona nenhum segredo novo no código.

const SUPABASE_URL = 'https://yhyzvihztivqmygxbbwv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeXp2aWh6dGl2cW15Z3hiYnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDkxMzUsImV4cCI6MjA4MzAyNTEzNX0.YazKpD2apqgWqT0EVoecsf_3NpSowvKuMmCTzF0KQ8I';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
