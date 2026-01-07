-- Tabela para lembretes de metas personalizados
CREATE TABLE public.goal_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Configuração de lembrete
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_frequency TEXT CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'weekly',
  reminder_day INTEGER, -- 1-7 para weekly (1=seg), 1-31 para monthly
  reminder_time TIME DEFAULT '09:00',
  
  -- Canal de notificação
  send_whatsapp BOOLEAN DEFAULT true,
  send_push BOOLEAN DEFAULT false,
  
  -- Controle
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_goal_reminders_user_id ON public.goal_reminders(user_id);
CREATE INDEX idx_goal_reminders_goal_id ON public.goal_reminders(goal_id);
CREATE INDEX idx_goal_reminders_enabled ON public.goal_reminders(reminder_enabled) WHERE reminder_enabled = true;

-- RLS
ALTER TABLE public.goal_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their goal reminders"
ON public.goal_reminders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their goal reminders"
ON public.goal_reminders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their goal reminders"
ON public.goal_reminders
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their goal reminders"
ON public.goal_reminders
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_goal_reminders_updated_at
  BEFORE UPDATE ON public.goal_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();