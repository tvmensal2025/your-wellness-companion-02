-- Tabela para histórico permanente de alimentação
CREATE TABLE public.food_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_time TIME DEFAULT CURRENT_TIME,
  meal_type TEXT, -- cafe_da_manha, almoco, jantar, lanche
  photo_url TEXT, -- URL da imagem (NUNCA deletada)
  food_items JSONB, -- Lista de alimentos detectados
  total_calories NUMERIC DEFAULT 0,
  total_proteins NUMERIC DEFAULT 0,
  total_carbs NUMERIC DEFAULT 0,
  total_fats NUMERIC DEFAULT 0,
  total_fiber NUMERIC DEFAULT 0,
  source TEXT DEFAULT 'whatsapp', -- whatsapp, app, manual
  confidence_score NUMERIC, -- Confiança da detecção IA
  user_confirmed BOOLEAN DEFAULT false,
  user_notes TEXT,
  ai_analysis TEXT, -- Análise completa da IA
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para buscas rápidas
CREATE INDEX idx_food_history_user_date ON public.food_history(user_id, meal_date);
CREATE INDEX idx_food_history_user_type ON public.food_history(user_id, meal_type);
CREATE INDEX idx_food_history_created ON public.food_history(user_id, created_at DESC);

-- RLS: Usuário só vê suas refeições
ALTER TABLE public.food_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food history" ON public.food_history 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food history" ON public.food_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food history" ON public.food_history 
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy para edge functions (service role)
CREATE POLICY "Service role full access to food_history" ON public.food_history
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_food_history_updated_at
  BEFORE UPDATE ON public.food_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();