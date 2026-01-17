import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Client com fallback para credenciais hardcoded do MaxNutrition Cloud
// Isso garante que o app funcione mesmo se as variáveis de ambiente não estiverem disponíveis
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ciszqtlaacrhfwsqnvjr.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpc3pxdGxhYWNyaGZ3c3FudmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODI0OTgsImV4cCI6MjA4MzA1ODQ5OH0.eyhrWnFshb7AhW0HQJquLeRFO-L3HOdjSIrgjSEgLMo';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
