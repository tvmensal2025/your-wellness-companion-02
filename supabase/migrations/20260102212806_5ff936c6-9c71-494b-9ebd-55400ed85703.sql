-- ============================================
-- MIGRAÇÃO 2: TABELAS DE SOFIA AI
-- ============================================

-- Tabela: sofia_conversation_context (7 colunas)
CREATE TABLE IF NOT EXISTS public.sofia_conversation_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_data JSONB,
  context_type TEXT,
  relevance_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: sofia_messages (9 colunas)
CREATE TABLE IF NOT EXISTS public.sofia_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT,
  tokens_used INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: sofia_comprehensive_analyses (9 colunas)
CREATE TABLE IF NOT EXISTS public.sofia_comprehensive_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT,
  analysis_data JSONB,
  insights TEXT[],
  recommendations TEXT[],
  priority_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: sofia_food_analysis (12 colunas)
CREATE TABLE IF NOT EXISTS public.sofia_food_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  food_items TEXT[],
  nutrition_data JSONB,
  health_rating INTEGER,
  meal_type TEXT,
  recommendations TEXT,
  analysis_confidence DECIMAL(3,2),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: sofia_learning (8 colunas)
CREATE TABLE IF NOT EXISTS public.sofia_learning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_topic TEXT,
  learning_data JSONB,
  confidence_score DECIMAL(3,2),
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: sofia_knowledge_base (10 colunas)
CREATE TABLE IF NOT EXISTS public.sofia_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT,
  title TEXT,
  content TEXT,
  keywords TEXT[],
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: sofia_memory (12 colunas)
CREATE TABLE IF NOT EXISTS public.sofia_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT,
  memory_key TEXT,
  memory_value JSONB,
  importance_score DECIMAL(3,2),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.sofia_conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_comprehensive_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_food_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sofia context" ON public.sofia_conversation_context
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sofia messages" ON public.sofia_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sofia analyses" ON public.sofia_comprehensive_analyses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sofia food analysis" ON public.sofia_food_analysis
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view sofia learning" ON public.sofia_learning
  FOR SELECT USING (auth.uid() IS NOT NULL OR user_id IS NULL);

CREATE POLICY "Everyone can view sofia knowledge base" ON public.sofia_knowledge_base
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own sofia memory" ON public.sofia_memory
  FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sofia_context_user_id ON public.sofia_conversation_context(user_id);
CREATE INDEX IF NOT EXISTS idx_sofia_messages_user_id ON public.sofia_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_sofia_messages_conversation_id ON public.sofia_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sofia_analyses_user_id ON public.sofia_comprehensive_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_sofia_food_analysis_user_id ON public.sofia_food_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_sofia_memory_user_id ON public.sofia_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_sofia_memory_type ON public.sofia_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_sofia_knowledge_category ON public.sofia_knowledge_base(category);