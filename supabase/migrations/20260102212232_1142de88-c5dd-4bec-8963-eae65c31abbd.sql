-- =================================================================
-- PARTE 5: TABELAS DE ANÁLISES E MEDIÇÕES
-- =================================================================

-- Tabela: weekly_analyses (Análises semanais)
CREATE TABLE IF NOT EXISTS public.weekly_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    semana_inicio DATE NOT NULL,
    semana_fim DATE NOT NULL,
    peso_inicial DECIMAL(5,2),
    peso_final DECIMAL(5,2),
    variacao_peso DECIMAL(5,2),
    tendencia TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, semana_inicio)
);

-- Tabela: weekly_insights (Insights semanais)
CREATE TABLE IF NOT EXISTS public.weekly_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    week_start_date DATE NOT NULL,
    average_mood DECIMAL(3,2),
    average_energy DECIMAL(3,2),
    average_stress DECIMAL(3,2),
    most_common_gratitude TEXT,
    water_consistency DECIMAL(3,2),
    sleep_consistency DECIMAL(3,2),
    exercise_frequency DECIMAL(3,2),
    total_points INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- Tabela: smart_notifications (Notificações inteligentes)
CREATE TABLE IF NOT EXISTS public.smart_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    trigger_conditions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extender tabela weight_measurements com campos adicionais
ALTER TABLE public.weight_measurements ADD COLUMN IF NOT EXISTS peso_kg NUMERIC;
ALTER TABLE public.weight_measurements ADD COLUMN IF NOT EXISTS circunferencia_abdominal_cm NUMERIC;
ALTER TABLE public.weight_measurements ADD COLUMN IF NOT EXISTS agua_corporal_percent NUMERIC;
ALTER TABLE public.weight_measurements ADD COLUMN IF NOT EXISTS massa_ossea_kg NUMERIC;
ALTER TABLE public.weight_measurements ADD COLUMN IF NOT EXISTS risco_cardiometabolico TEXT;
ALTER TABLE public.weight_measurements ADD COLUMN IF NOT EXISTS measurement_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.weight_measurements ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'manual';
ALTER TABLE public.weight_measurements ADD COLUMN IF NOT EXISTS notes TEXT;

-- Extender tabela profiles com campos adicionais
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.weekly_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para weekly_analyses
CREATE POLICY "Users can manage their own weekly analyses" ON public.weekly_analyses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para weekly_insights
CREATE POLICY "Users can manage their own weekly insights" ON public.weekly_insights
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para smart_notifications
CREATE POLICY "Users can view their own notifications" ON public.smart_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.smart_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_weekly_analyses_user_id ON public.weekly_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_analyses_semana_inicio ON public.weekly_analyses(semana_inicio);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_id ON public.weekly_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_week_start ON public.weekly_insights(week_start_date);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_user_active ON public.smart_notifications(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_created_at ON public.smart_notifications(created_at);