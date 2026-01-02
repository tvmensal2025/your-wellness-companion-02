-- ============================================
-- MIGRAÇÃO 15: TABELAS FINAIS COMPLEMENTARES
-- ============================================

-- Tabela: users_needing_analysis (8 colunas)
CREATE TABLE IF NOT EXISTS public.users_needing_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT,
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Tabela: health_alerts (12 colunas)
CREATE TABLE IF NOT EXISTS public.health_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT,
  severity TEXT,
  title TEXT,
  message TEXT,
  related_data JSONB,
  action_required BOOLEAN DEFAULT false,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Tabela: health_integrations (10 colunas)
CREATE TABLE IF NOT EXISTS public.health_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_type TEXT,
  provider_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: premium_report_events (8 colunas)
CREATE TABLE IF NOT EXISTS public.premium_report_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.premium_medical_reports(id),
  event_type TEXT,
  event_data JSONB,
  triggered_by UUID REFERENCES auth.users(id),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Tabela: scheduled_analysis_records (8 colunas)
CREATE TABLE IF NOT EXISTS public.scheduled_analysis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT,
  scheduled_for TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  completed_at TIMESTAMPTZ,
  result_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: user_anamnesis_history (10 colunas)
CREATE TABLE IF NOT EXISTS public.user_anamnesis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anamnesis_id UUID,
  change_type TEXT,
  changes JSONB,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  previous_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: information_feedback (7 colunas)
CREATE TABLE IF NOT EXISTS public.information_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT,
  content_id TEXT,
  feedback_type TEXT,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: meal_feedback (7 colunas)
CREATE TABLE IF NOT EXISTS public.meal_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id UUID,
  rating INTEGER,
  feedback_text TEXT,
  would_eat_again BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: challenge_leaderboard (6 colunas)
CREATE TABLE IF NOT EXISTS public.challenge_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL(10,2),
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: dr_vital_memory (5 colunas)
CREATE TABLE IF NOT EXISTS public.dr_vital_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_key TEXT NOT NULL,
  memory_value JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: mock_users (6 colunas)
CREATE TABLE IF NOT EXISTS public.mock_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mock_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: user_ingredient_history (7 colunas)
CREATE TABLE IF NOT EXISTS public.user_ingredient_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: food_contraindications (10 colunas)
CREATE TABLE IF NOT EXISTS public.food_contraindications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  condition_name TEXT,
  contraindication_type TEXT,
  severity TEXT,
  reason TEXT,
  alternative_suggestions TEXT[],
  scientific_reference TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: food_preparation_preservation (13 colunas)
CREATE TABLE IF NOT EXISTS public.food_preparation_preservation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  preparation_methods JSONB,
  cooking_tips TEXT[],
  preservation_methods JSONB,
  storage_duration TEXT,
  storage_conditions TEXT,
  nutritional_impact JSONB,
  food_safety_tips TEXT[],
  best_practices TEXT[],
  common_mistakes TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: food_security (11 colunas)
CREATE TABLE IF NOT EXISTS public.food_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  allergen_info TEXT[],
  cross_contamination_risks TEXT[],
  storage_safety TEXT,
  handling_precautions TEXT[],
  expiration_guidelines TEXT,
  foodborne_illness_risks TEXT[],
  safe_temperature_range TEXT,
  recall_history JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: nutritional_food_patterns (9 colunas)
CREATE TABLE IF NOT EXISTS public.nutritional_food_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name TEXT NOT NULL,
  pattern_type TEXT,
  description TEXT,
  food_combinations JSONB,
  health_benefits TEXT[],
  meal_examples JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: institute_nutritional_catalog (19 colunas)
CREATE TABLE IF NOT EXISTS public.institute_nutritional_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  food_code TEXT,
  category TEXT,
  subcategory TEXT,
  nutritional_data JSONB,
  health_benefits TEXT[],
  therapeutic_uses TEXT[],
  bioactive_compounds JSONB,
  recommended_portions TEXT,
  preparation_notes TEXT,
  contraindications TEXT[],
  drug_interactions TEXT[],
  research_references TEXT[],
  quality_grade TEXT,
  certification_info JSONB,
  is_verified BOOLEAN DEFAULT true,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: user_favorite_foods (8 colunas)
CREATE TABLE IF NOT EXISTS public.user_favorite_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id UUID,
  food_name TEXT,
  category TEXT,
  preference_level INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.users_needing_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_report_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_analysis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_anamnesis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.information_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dr_vital_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ingredient_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_contraindications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_preparation_preservation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_food_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institute_nutritional_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health alerts" ON public.health_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own health integrations" ON public.health_integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own scheduled analysis" ON public.scheduled_analysis_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own anamnesis history" ON public.user_anamnesis_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can submit feedback" ON public.information_feedback FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can submit meal feedback" ON public.meal_feedback FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view challenge leaderboard" ON public.challenge_leaderboard FOR SELECT USING (true);
CREATE POLICY "System can manage dr vital memory" ON public.dr_vital_memory FOR ALL USING (true);
CREATE POLICY "Users can view their own ingredient history" ON public.user_ingredient_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view food contraindications" ON public.food_contraindications FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view food preparation" ON public.food_preparation_preservation FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view food security" ON public.food_security FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view nutritional patterns" ON public.nutritional_food_patterns FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view institute catalog" ON public.institute_nutritional_catalog FOR SELECT USING (is_verified = true);
CREATE POLICY "Users can manage their favorite foods" ON public.user_favorite_foods FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_health_alerts_user_id ON public.health_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_health_integrations_user_id ON public.health_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_analysis_user_id ON public.scheduled_analysis_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ingredient_history_user_id ON public.user_ingredient_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_foods_user_id ON public.user_favorite_foods(user_id);