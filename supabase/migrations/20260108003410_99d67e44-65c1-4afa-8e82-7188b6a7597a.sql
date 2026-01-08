-- Tabela para armazenar perguntas pendentes de nutrição via WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_pending_nutrition (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'snack', 'dinner'
  question_sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_received_at TIMESTAMP WITH TIME ZONE,
  response_content TEXT,
  response_type TEXT, -- 'text', 'image', 'audio'
  image_url TEXT,
  analysis_result JSONB,
  is_processed BOOLEAN DEFAULT false,
  nutrition_tracking_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '2 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar colunas de configuração de nutrição em user_notification_settings
ALTER TABLE public.user_notification_settings 
ADD COLUMN IF NOT EXISTS whatsapp_nutrition_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_nutrition_times JSONB DEFAULT '{"breakfast": "08:00", "lunch": "12:30", "snack": "15:30", "dinner": "19:30"}'::jsonb,
ADD COLUMN IF NOT EXISTS whatsapp_daily_summary_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_daily_summary_time TEXT DEFAULT '22:00';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pending_nutrition_user ON public.whatsapp_pending_nutrition(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_nutrition_unprocessed ON public.whatsapp_pending_nutrition(is_processed) WHERE is_processed = false;
CREATE INDEX IF NOT EXISTS idx_pending_nutrition_expires ON public.whatsapp_pending_nutrition(expires_at);

-- RLS
ALTER TABLE public.whatsapp_pending_nutrition ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pending nutrition"
ON public.whatsapp_pending_nutrition FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all pending nutrition"
ON public.whatsapp_pending_nutrition FOR ALL
USING (true)
WITH CHECK (true);