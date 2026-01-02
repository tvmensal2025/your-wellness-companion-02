-- =================================================================
-- PARTE 2: TABELAS DE ATIVIDADES E CATEGORIAS
-- =================================================================

-- Tabela: activity_categories (Categorias de atividades)
CREATE TABLE IF NOT EXISTS public.activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    category_name VARCHAR(100) NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    avg_score NUMERIC DEFAULT 0,
    last_activity_date DATE,
    color_code VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: activity_sessions (Sessões de atividade)
CREATE TABLE IF NOT EXISTS public.activity_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    category_id UUID,
    session_date DATE DEFAULT CURRENT_DATE,
    duration_minutes INTEGER,
    intensity_level INTEGER,
    satisfaction_score INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: user_goals (Metas dos usuários) - extender a existente
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS challenge_id UUID;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS target_value NUMERIC;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS target_date DATE;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS estimated_points INTEGER;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para activity_categories
CREATE POLICY "Users can manage their own activity categories" ON public.activity_categories
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para activity_sessions
CREATE POLICY "Users can manage their own activity sessions" ON public.activity_sessions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_activity_categories_user_id ON public.activity_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_id ON public.activity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_category_id ON public.activity_sessions(category_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON public.user_goals(status);