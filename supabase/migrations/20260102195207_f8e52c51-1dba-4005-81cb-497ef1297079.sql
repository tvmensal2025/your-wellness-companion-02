-- ========================================
-- TABELAS ADICIONAIS - PARTE 8 (MAIS CORREÇÕES)
-- ========================================

-- Adicionar colunas faltantes em user_goals
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS estimated_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS current_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS goal_type TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- MEAL_PLAN_HISTORY (Histórico de planos alimentares)
CREATE TABLE IF NOT EXISTS public.meal_plan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  plan_type TEXT,
  meal_plan_data JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GOOGLE_FIT_TOKENS (Tokens do Google Fit)
CREATE TABLE IF NOT EXISTS public.google_fit_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  token_type TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.meal_plan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_fit_tokens ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS
CREATE POLICY "Users can view own meal plan history" ON public.meal_plan_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal plan history" ON public.meal_plan_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal plan history" ON public.meal_plan_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal plan history" ON public.meal_plan_history FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own google fit tokens" ON public.google_fit_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own google fit tokens" ON public.google_fit_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own google fit tokens" ON public.google_fit_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own google fit tokens" ON public.google_fit_tokens FOR DELETE USING (auth.uid() = user_id);

-- TRIGGERS
CREATE TRIGGER update_meal_plan_history_updated_at BEFORE UPDATE ON public.meal_plan_history FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_google_fit_tokens_updated_at BEFORE UPDATE ON public.google_fit_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ÍNDICES
CREATE INDEX idx_meal_plan_history_user ON public.meal_plan_history(user_id);
CREATE INDEX idx_google_fit_tokens_user ON public.google_fit_tokens(user_id);