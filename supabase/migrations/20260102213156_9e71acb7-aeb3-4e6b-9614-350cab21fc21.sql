-- ============================================
-- MIGRAÇÃO 11: SUPLEMENTOS, PROTOCOLOS E CHAT
-- ============================================

-- Tabela: user_nutraceutical_suggestions (19 colunas)
CREATE TABLE IF NOT EXISTS public.user_nutraceutical_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  timing TEXT,
  duration_days INTEGER,
  health_goal TEXT,
  benefits TEXT[],
  precautions TEXT[],
  interactions TEXT[],
  cost_estimate DECIMAL(10,2),
  priority_level TEXT,
  evidence_quality TEXT,
  suggested_by TEXT,
  status TEXT DEFAULT 'suggested',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: user_supplements (11 colunas)
CREATE TABLE IF NOT EXISTS public.user_supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID REFERENCES public.supplements(id),
  supplement_name TEXT,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: nutritional_protocols (15 colunas)
CREATE TABLE IF NOT EXISTS public.nutritional_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_name TEXT NOT NULL,
  health_condition TEXT,
  description TEXT,
  duration_weeks INTEGER,
  phases JSONB,
  dietary_guidelines JSONB,
  supplement_recommendations JSONB,
  meal_timing JSONB,
  restrictions TEXT[],
  monitoring_metrics TEXT[],
  expected_outcomes TEXT[],
  evidence_level TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: nutritional_recommendations (10 colunas)
CREATE TABLE IF NOT EXISTS public.nutritional_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT,
  recommendation_text TEXT,
  foods_to_include TEXT[],
  foods_to_avoid TEXT[],
  priority TEXT,
  valid_until DATE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: conversation_messages (11 colunas)
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT,
  message_content TEXT,
  message_type TEXT,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: conversation_attachments (7 colunas)
CREATE TABLE IF NOT EXISTS public.conversation_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: conversation_facts (10 colunas)
CREATE TABLE IF NOT EXISTS public.conversation_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fact_type TEXT,
  fact_content TEXT,
  source_message_id UUID,
  importance_score INTEGER,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.user_nutraceutical_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own supplement suggestions" ON public.user_nutraceutical_suggestions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own supplements" ON public.user_supplements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view protocols" ON public.nutritional_protocols
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own recommendations" ON public.nutritional_recommendations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own messages" ON public.conversation_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view message attachments" ON public.conversation_attachments
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own conversation facts" ON public.conversation_facts
  FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_supplements_user_id ON public.user_supplements(user_id);
CREATE INDEX IF NOT EXISTS idx_nutritional_recommendations_user_id ON public.nutritional_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_user_id ON public.conversation_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_facts_user_id ON public.conversation_facts(user_id);