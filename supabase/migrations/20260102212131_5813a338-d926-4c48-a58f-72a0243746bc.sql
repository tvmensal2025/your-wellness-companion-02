-- =================================================================
-- PARTE 3: TABELAS DE DESAFIOS EXTENDIDAS
-- =================================================================

-- Tabela: challenge_daily_logs (Logs diários dos desafios)
CREATE TABLE IF NOT EXISTS public.challenge_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participation_id UUID NOT NULL,
    challenge_name TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    numeric_value NUMERIC,
    value_logged TEXT,
    notes TEXT,
    photo_url TEXT,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: challenge_group_messages (Mensagens de grupo dos desafios)
CREATE TABLE IF NOT EXISTS public.challenge_group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    challenge_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extender tabela challenges com campos adicionais
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS target_value NUMERIC;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS frequency VARCHAR(50) DEFAULT 'once';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS target_unit VARCHAR(50);
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS icon VARCHAR(50);
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS color VARCHAR(10) DEFAULT '#6366f1';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS entry_fee NUMERIC DEFAULT 0;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS auto_assign BOOLEAN DEFAULT FALSE;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS completion_criteria JSONB DEFAULT '{}';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS progress_tracking JSONB DEFAULT '{}';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS rewards JSONB DEFAULT '[]';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS is_group_challenge BOOLEAN DEFAULT FALSE;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS daily_log_target NUMERIC DEFAULT 1;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS daily_log_type TEXT DEFAULT 'boolean';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS daily_log_unit TEXT DEFAULT 'dia';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'personal';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 100;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS badge_icon TEXT DEFAULT '🏆';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS badge_name TEXT;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS tips TEXT[] DEFAULT '{}';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS rules TEXT;

-- Extender tabela challenge_participations
ALTER TABLE public.challenge_participations ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.challenge_participations ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT 100;

-- Enable RLS
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_group_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para challenge_daily_logs
CREATE POLICY "Users can manage their own challenge logs" ON public.challenge_daily_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.challenge_participations
      WHERE id = challenge_daily_logs.participation_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.challenge_participations
      WHERE id = challenge_daily_logs.participation_id
      AND user_id = auth.uid()
    )
  );

-- Políticas RLS para challenge_group_messages
CREATE POLICY "Everyone can view challenge messages" ON public.challenge_group_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create challenge messages" ON public.challenge_group_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_challenge_daily_logs_participation_id ON public.challenge_daily_logs(participation_id);
CREATE INDEX IF NOT EXISTS idx_challenge_daily_logs_log_date ON public.challenge_daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_challenge_group_messages_challenge_id ON public.challenge_group_messages(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_group_messages_user_id ON public.challenge_group_messages(user_id);