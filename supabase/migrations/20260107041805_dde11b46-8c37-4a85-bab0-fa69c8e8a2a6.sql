-- Tabela para controle de mensagens agendadas (evitar duplicação)
CREATE TABLE IF NOT EXISTS public.whatsapp_scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, message_type, scheduled_date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_user ON public.whatsapp_scheduled_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_type ON public.whatsapp_scheduled_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON public.whatsapp_scheduled_messages(status);

-- Habilitar RLS
ALTER TABLE public.whatsapp_scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own scheduled messages"
  ON public.whatsapp_scheduled_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage scheduled messages"
  ON public.whatsapp_scheduled_messages
  FOR ALL
  WITH CHECK (true);