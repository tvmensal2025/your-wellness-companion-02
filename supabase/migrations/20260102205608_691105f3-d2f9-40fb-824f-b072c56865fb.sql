-- ============================================
-- CRIAR TABELAS FALTANTES + CORRIGIR ESTRUTURAS
-- ============================================

-- 1. TABELA: user_sport_modalities
CREATE TABLE IF NOT EXISTS public.user_sport_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  modality TEXT NOT NULL CHECK (modality IN ('gym', 'home_bodyweight', 'home_equipment', 'walking', 'running', 'functional', 'crossfit', 'yoga', 'pilates', 'swimming', 'cycling', 'martial_arts', 'dance', 'sports')),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  frequency_per_week INTEGER CHECK (frequency_per_week >= 1 AND frequency_per_week <= 7),
  preferred_time TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_sport_modalities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sport modalities" ON public.user_sport_modalities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sport modalities" ON public.user_sport_modalities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sport modalities" ON public.user_sport_modalities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sport modalities" ON public.user_sport_modalities
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_sport_modalities_user_id ON public.user_sport_modalities(user_id);

-- 2. TABELA: user_subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('free', 'basic', 'premium', 'vip')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  payment_method TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);

-- 3. TABELA: premium_medical_reports
CREATE TABLE IF NOT EXISTS public.premium_medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('bioimpedance', 'blood_test', 'preventive', 'comprehensive', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  html_path TEXT,
  pdf_path TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  data JSONB,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.premium_medical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical reports" ON public.premium_medical_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical reports" ON public.premium_medical_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_premium_medical_reports_user_id ON public.premium_medical_reports(user_id);
CREATE INDEX idx_premium_medical_reports_type ON public.premium_medical_reports(report_type);

-- 4. TABELA: challenge_participations
CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own participations" ON public.challenge_participations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own participations" ON public.challenge_participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participations" ON public.challenge_participations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_challenge_participations_user_id ON public.challenge_participations(user_id);
CREATE INDEX idx_challenge_participations_challenge_id ON public.challenge_participations(challenge_id);

-- 5. ADICIONAR COLUNAS FALTANTES EM user_anamnesis
ALTER TABLE public.user_anamnesis 
ADD COLUMN IF NOT EXISTS current_bmi DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS current_weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS waist_circumference_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS hip_circumference_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS body_fat_percentage DECIMAL(5,2);

-- 6. ADICIONAR COLUNA modality EM sport_training_plans
ALTER TABLE public.sport_training_plans 
ADD COLUMN IF NOT EXISTS modality TEXT CHECK (modality IN ('gym', 'home_bodyweight', 'home_equipment', 'walking', 'running', 'functional', 'crossfit', 'yoga', 'pilates', 'swimming', 'cycling', 'martial_arts', 'dance', 'sports'));

-- 7. TABELA: professional_evaluations (para avaliações profissionais)
CREATE TABLE IF NOT EXISTS public.professional_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  evaluator_id UUID,
  evaluation_date DATE DEFAULT CURRENT_DATE,
  weight_kg DECIMAL(5,2) NOT NULL,
  height_cm DECIMAL(5,2),
  bmi DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  fat_mass_kg DECIMAL(5,2),
  lean_mass_kg DECIMAL(5,2),
  muscle_mass_kg DECIMAL(5,2),
  bmr_kcal INTEGER,
  waist_circumference_cm DECIMAL(5,2),
  hip_circumference_cm DECIMAL(5,2),
  abdominal_circumference_cm DECIMAL(5,2),
  waist_to_height_ratio DECIMAL(5,3),
  waist_to_hip_ratio DECIMAL(5,3),
  muscle_to_fat_ratio DECIMAL(5,3),
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'very_high')),
  notes TEXT,
  recommendations TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.professional_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evaluations" ON public.professional_evaluations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluations" ON public.professional_evaluations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_professional_evaluations_user_id ON public.professional_evaluations(user_id);
CREATE INDEX idx_professional_evaluations_date ON public.professional_evaluations(evaluation_date);

-- 8. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_user_sport_modalities_updated_at ON public.user_sport_modalities;
CREATE TRIGGER update_user_sport_modalities_updated_at
  BEFORE UPDATE ON public.user_sport_modalities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_premium_medical_reports_updated_at ON public.premium_medical_reports;
CREATE TRIGGER update_premium_medical_reports_updated_at
  BEFORE UPDATE ON public.premium_medical_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenge_participations_updated_at ON public.challenge_participations;
CREATE TRIGGER update_challenge_participations_updated_at
  BEFORE UPDATE ON public.challenge_participations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_professional_evaluations_updated_at ON public.professional_evaluations;
CREATE TRIGGER update_professional_evaluations_updated_at
  BEFORE UPDATE ON public.professional_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();