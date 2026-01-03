import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Client fixo usando o backend NOVO do Lovable Cloud,
// independente das variáveis de ambiente do Vite.
// Assim evitamos o erro "supabaseUrl is required".

const SUPABASE_URL = 'https://bstkhoxhxitfjbwudthq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzdGtob3hoeGl0Zmpid3VkdGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NjI2NzIsImV4cCI6MjA4MzAzODY3Mn0.nU0R0yF7YynnPwDV8MuF_wmpcKX1swYERdE6lW-saOA';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

