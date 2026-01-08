-- Criar tabela food_analysis_logs para armazenar histórico de análises
CREATE TABLE IF NOT EXISTS public.food_analysis_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  detected_foods JSONB,
  nutrition_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.food_analysis_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own food logs" ON public.food_analysis_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs" ON public.food_analysis_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role pode inserir (para edge functions)
CREATE POLICY "Service role can manage food logs" ON public.food_analysis_logs
  FOR ALL USING (true) WITH CHECK (true);