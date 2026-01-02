-- =================================================================
-- PARTE 4: TABELAS DE CHAT E COMUNICAÇÃO
-- =================================================================

-- Tabela: chat_configurations (Configurações do chat)
CREATE TABLE IF NOT EXISTS public.chat_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT NOT NULL,
    config_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela: chat_emotional_analysis (Análise emocional do chat)
CREATE TABLE IF NOT EXISTS public.chat_emotional_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    conversation_id UUID NOT NULL,
    week_start DATE NOT NULL DEFAULT (DATE_TRUNC('week', CURRENT_DATE))::DATE,
    sentiment_score NUMERIC,
    emotions_detected TEXT[],
    mood_keywords TEXT[],
    energy_level INTEGER,
    stress_level INTEGER,
    pain_level INTEGER,
    physical_symptoms TEXT[],
    emotional_topics TEXT[],
    concerns_mentioned TEXT[],
    goals_mentioned TEXT[],
    achievements_mentioned TEXT[],
    analysis_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela: comments (Comentários)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    post_id UUID,
    parent_comment_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: company_configurations (Configurações da empresa)
CREATE TABLE IF NOT EXISTS public.company_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    mission TEXT,
    vision TEXT,
    values TEXT,
    about_us TEXT,
    target_audience TEXT,
    health_philosophy TEXT,
    company_culture TEXT,
    differentials TEXT,
    main_services TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Extender tabela course_modules
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Tabela: course_lessons (Lições do curso)
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID,
    module_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    lesson_type TEXT DEFAULT 'video',
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    prerequisites TEXT[],
    resources JSONB DEFAULT '[]',
    quiz_questions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_emotional_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para chat_configurations
CREATE POLICY "Everyone can view chat configurations" ON public.chat_configurations
  FOR SELECT USING (true);

-- Políticas RLS para chat_emotional_analysis
CREATE POLICY "Users can view their own emotional analysis" ON public.chat_emotional_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emotional analysis" ON public.chat_emotional_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para comments
CREATE POLICY "Everyone can view comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para company_configurations
CREATE POLICY "Everyone can view company configurations" ON public.company_configurations
  FOR SELECT USING (true);

-- Políticas RLS para course_lessons
CREATE POLICY "Everyone can view published lessons" ON public.course_lessons
  FOR SELECT USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_chat_configurations_config_key ON public.chat_configurations(config_key);
CREATE INDEX IF NOT EXISTS idx_chat_emotional_analysis_user_id ON public.chat_emotional_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_emotional_analysis_week_start ON public.chat_emotional_analysis(week_start);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON public.course_lessons(module_id);