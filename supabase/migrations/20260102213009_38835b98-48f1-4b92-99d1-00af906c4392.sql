-- ============================================
-- MIGRAÇÃO 7: TABELAS DE SAÚDE E MÉDICO
-- ============================================

-- Tabela: ai_documents (7 colunas)
CREATE TABLE IF NOT EXISTS public.ai_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT,
  content JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: ai_system_logs (10 colunas)
CREATE TABLE IF NOT EXISTS public.ai_system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type TEXT,
  service_name TEXT,
  operation TEXT,
  status TEXT,
  details JSONB,
  execution_time_ms INTEGER,
  error_message TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: user_medical_reports (20 colunas)
CREATE TABLE IF NOT EXISTS public.user_medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT,
  title TEXT,
  description TEXT,
  report_date DATE DEFAULT CURRENT_DATE,
  doctor_name TEXT,
  specialty TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  analysis_data JSONB,
  key_findings TEXT[],
  recommendations TEXT[],
  follow_up_date DATE,
  is_critical BOOLEAN DEFAULT false,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: weight_measures (29 colunas)
CREATE TABLE IF NOT EXISTS public.weight_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date DATE DEFAULT CURRENT_DATE,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  bmi DECIMAL(4,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  bone_mass_kg DECIMAL(4,2),
  water_percentage DECIMAL(4,2),
  visceral_fat_level INTEGER,
  basal_metabolic_rate INTEGER,
  waist_circumference_cm DECIMAL(5,2),
  hip_circumference_cm DECIMAL(5,2),
  chest_circumference_cm DECIMAL(5,2),
  arm_circumference_cm DECIMAL(4,2),
  thigh_circumference_cm DECIMAL(5,2),
  calf_circumference_cm DECIMAL(4,2),
  neck_circumference_cm DECIMAL(4,2),
  metabolic_age INTEGER,
  protein_percentage DECIMAL(4,2),
  body_type TEXT,
  measurement_method TEXT,
  device_used TEXT,
  measurement_conditions TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: weighings (12 colunas)
CREATE TABLE IF NOT EXISTS public.weighings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  time TIME,
  bmi DECIMAL(4,2),
  body_fat_percentage DECIMAL(4,2),
  notes TEXT,
  measurement_context TEXT,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: google_fit_data_extended (41 colunas)
CREATE TABLE IF NOT EXISTS public.google_fit_data_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_source TEXT,
  data_type TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  value DECIMAL(10,2),
  unit TEXT,
  
  -- Atividade
  steps INTEGER,
  distance_meters DECIMAL(10,2),
  calories_burned INTEGER,
  active_minutes INTEGER,
  
  -- Frequência Cardíaca
  heart_rate_bpm INTEGER,
  heart_rate_min INTEGER,
  heart_rate_max INTEGER,
  heart_rate_avg INTEGER,
  heart_rate_resting INTEGER,
  
  -- Sono
  sleep_duration_minutes INTEGER,
  sleep_quality_score INTEGER,
  deep_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  awake_minutes INTEGER,
  
  -- Peso e Composição
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  
  -- Nutrição
  water_ml INTEGER,
  nutrition_calories INTEGER,
  nutrition_protein_g DECIMAL(6,2),
  nutrition_carbs_g DECIMAL(6,2),
  nutrition_fat_g DECIMAL(6,2),
  
  -- Estresse e Bem-estar
  stress_level INTEGER,
  energy_level INTEGER,
  mood_score INTEGER,
  
  -- Outros
  raw_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: google_fit_analysis (22 colunas)
CREATE TABLE IF NOT EXISTS public.google_fit_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_date DATE DEFAULT CURRENT_DATE,
  period_type TEXT,
  period_start DATE,
  period_end DATE,
  
  -- Métricas de Atividade
  total_steps INTEGER,
  avg_daily_steps INTEGER,
  total_distance_km DECIMAL(8,2),
  total_calories INTEGER,
  total_active_minutes INTEGER,
  
  -- Métricas de Saúde
  avg_heart_rate INTEGER,
  resting_heart_rate INTEGER,
  avg_sleep_hours DECIMAL(4,2),
  sleep_quality_avg DECIMAL(3,2),
  
  -- Tendências
  activity_trend TEXT,
  health_score INTEGER,
  insights TEXT[],
  recommendations TEXT[],
  
  -- Metadata
  data_quality_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: heart_rate_data (14 colunas)
CREATE TABLE IF NOT EXISTS public.heart_rate_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_time TIMESTAMPTZ DEFAULT now(),
  heart_rate_bpm INTEGER NOT NULL,
  measurement_type TEXT,
  activity_context TEXT,
  resting_heart_rate INTEGER,
  max_heart_rate INTEGER,
  heart_rate_variability INTEGER,
  recovery_time_minutes INTEGER,
  stress_level TEXT,
  notes TEXT,
  device_source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: sleep_monitoring (8 colunas)
CREATE TABLE IF NOT EXISTS public.sleep_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_date DATE DEFAULT CURRENT_DATE,
  sleep_duration_hours DECIMAL(4,2),
  sleep_quality_rating INTEGER,
  deep_sleep_hours DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: diseases_conditions (16 colunas)
CREATE TABLE IF NOT EXISTS public.diseases_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  symptoms TEXT[],
  risk_factors TEXT[],
  prevention_tips TEXT[],
  treatment_approaches TEXT[],
  dietary_recommendations TEXT[],
  exercise_recommendations TEXT[],
  lifestyle_modifications TEXT[],
  related_conditions TEXT[],
  severity_levels JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: specific_health (10 colunas)
CREATE TABLE IF NOT EXISTS public.specific_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  health_category TEXT,
  condition_name TEXT,
  diagnosis_date DATE,
  severity TEXT,
  current_treatment TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weighings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_fit_data_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_fit_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heart_rate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specific_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own ai documents" ON public.ai_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own medical reports" ON public.user_medical_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own weight measures" ON public.weight_measures FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own weighings" ON public.weighings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own google fit data" ON public.google_fit_data_extended FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own google fit analysis" ON public.google_fit_analysis FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own heart rate data" ON public.heart_rate_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sleep monitoring" ON public.sleep_monitoring FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view diseases and conditions" ON public.diseases_conditions FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage their own specific health" ON public.specific_health FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_medical_reports_user_id ON public.user_medical_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_measures_user_date ON public.weight_measures(user_id, measurement_date);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_time ON public.google_fit_data_extended(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_heart_rate_data_user_time ON public.heart_rate_data(user_id, measurement_time);