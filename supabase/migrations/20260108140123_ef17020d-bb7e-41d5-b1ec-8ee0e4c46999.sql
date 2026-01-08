
-- =====================================================
-- SISTEMA DE MAPEAMENTO DE SAÚDE INTEGRAL
-- Expansão completa para Dr. Vital e Sofia
-- =====================================================

-- =====================================================
-- PARTE 1: NOVAS TABELAS DE TRACKING
-- =====================================================

-- 1.1 HUNGER BEHAVIOR TRACKING - Fome e Comportamento Alimentar
CREATE TABLE IF NOT EXISTS public.hunger_behavior_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tracking_time TIME,
  
  -- Tipo de Fome
  hunger_type TEXT CHECK (hunger_type IN ('real', 'emocional', 'mista', 'ansiedade', 'tedio')),
  hunger_intensity INTEGER CHECK (hunger_intensity BETWEEN 1 AND 10),
  
  -- Gatilhos e Contexto
  critical_time TEXT,
  trigger_perceived TEXT,
  trigger_category TEXT CHECK (trigger_category IN ('emocional', 'social', 'ambiental', 'hormonal', 'fisico')),
  
  -- Comportamento
  ate_impulsively BOOLEAN DEFAULT FALSE,
  ate_in_secret BOOLEAN DEFAULT FALSE,
  felt_guilt BOOLEAN DEFAULT FALSE,
  stopped_when_satisfied BOOLEAN,
  
  -- Contexto
  location TEXT,
  with_whom TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 DIGESTION TRACKING - Digestão
CREATE TABLE IF NOT EXISTS public.digestion_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tracking_time TIME,
  
  -- Sintomas Digestivos
  bloating_level INTEGER CHECK (bloating_level BETWEEN 0 AND 10),
  gas_level INTEGER CHECK (gas_level BETWEEN 0 AND 10),
  has_constipation BOOLEAN DEFAULT FALSE,
  has_diarrhea BOOLEAN DEFAULT FALSE,
  has_reflux BOOLEAN DEFAULT FALSE,
  has_nausea BOOLEAN DEFAULT FALSE,
  has_stomach_pain BOOLEAN DEFAULT FALSE,
  
  -- Evacuação
  bowel_movement_count INTEGER DEFAULT 0,
  stool_consistency TEXT CHECK (stool_consistency IN ('normal', 'dura', 'mole', 'liquida', 'fragmentada')),
  
  -- Relação com Alimentação
  related_food TEXT,
  time_after_meal INTEGER,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 MENSTRUAL CYCLE TRACKING - Ciclo Menstrual
CREATE TABLE IF NOT EXISTS public.menstrual_cycle_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Fase do Ciclo
  cycle_phase TEXT CHECK (cycle_phase IN ('menstrual', 'folicular', 'ovulacao', 'lutea', 'tpm', 'menopausa', 'pos_menopausa')),
  cycle_day INTEGER,
  is_period_day BOOLEAN DEFAULT FALSE,
  flow_intensity TEXT CHECK (flow_intensity IN ('leve', 'moderado', 'intenso', 'muito_intenso')),
  
  -- Sintomas Associados
  has_cramps BOOLEAN DEFAULT FALSE,
  cramps_intensity INTEGER CHECK (cramps_intensity BETWEEN 0 AND 10),
  has_headache BOOLEAN DEFAULT FALSE,
  has_breast_tenderness BOOLEAN DEFAULT FALSE,
  has_mood_swings BOOLEAN DEFAULT FALSE,
  has_bloating BOOLEAN DEFAULT FALSE,
  has_fatigue BOOLEAN DEFAULT FALSE,
  has_food_cravings BOOLEAN DEFAULT FALSE,
  craving_type TEXT,
  
  -- Impacto
  impact_on_appetite TEXT CHECK (impact_on_appetite IN ('aumentado', 'normal', 'diminuido')),
  impact_on_energy TEXT CHECK (impact_on_energy IN ('baixa', 'normal', 'alta')),
  impact_on_mood TEXT CHECK (impact_on_mood IN ('irritada', 'triste', 'normal', 'feliz', 'ansiosa')),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 SOCIAL CONTEXT TRACKING - Contexto Social
CREATE TABLE IF NOT EXISTS public.social_context_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Apoio Social
  social_support_level INTEGER CHECK (social_support_level BETWEEN 1 AND 10),
  felt_lonely BOOLEAN DEFAULT FALSE,
  had_meaningful_connection BOOLEAN DEFAULT FALSE,
  
  -- Ambiente Alimentar
  main_eating_environment TEXT CHECK (main_eating_environment IN ('casa', 'trabalho', 'restaurante', 'rua', 'evento_social')),
  ate_with_company BOOLEAN,
  company_type TEXT,
  
  -- Eventos Sociais
  had_social_event BOOLEAN DEFAULT FALSE,
  event_type TEXT,
  event_impacted_eating BOOLEAN,
  event_impact TEXT,
  
  -- Pressão Social
  felt_food_pressure BOOLEAN DEFAULT FALSE,
  felt_diet_pressure BOOLEAN DEFAULT FALSE,
  received_body_comments BOOLEAN DEFAULT FALSE,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 DAILY SELF ASSESSMENT - Autoavaliação Diária
CREATE TABLE IF NOT EXISTS public.daily_self_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Percepção do Dia
  day_rating INTEGER CHECK (day_rating BETWEEN 1 AND 10),
  day_perception TEXT CHECK (day_perception IN ('otimo', 'bom', 'regular', 'ruim', 'pessimo')),
  
  -- Constância e Disciplina
  consistency_feeling INTEGER CHECK (consistency_feeling BETWEEN 1 AND 10),
  followed_plan BOOLEAN,
  plan_adherence_percentage INTEGER CHECK (plan_adherence_percentage BETWEEN 0 AND 100),
  
  -- Vitórias e Desafios
  main_win TEXT,
  main_challenge TEXT,
  what_could_improve TEXT,
  
  -- Gratidão e Mindset
  grateful_for TEXT,
  learned_today TEXT,
  tomorrow_focus TEXT,
  
  -- Sentimentos Gerais
  general_satisfaction INTEGER CHECK (general_satisfaction BETWEEN 1 AND 10),
  body_image_feeling INTEGER CHECK (body_image_feeling BETWEEN 1 AND 10),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, assessment_date)
);

-- =====================================================
-- PARTE 2: TABELAS ADICIONAIS DE TRACKING
-- =====================================================

-- 2.1 MEDICATION ADHERENCE TRACKING
CREATE TABLE IF NOT EXISTS public.medication_adherence_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tracking_time TIME,
  
  medication_name TEXT NOT NULL,
  prescribed_dose TEXT,
  taken_dose TEXT,
  was_taken BOOLEAN DEFAULT TRUE,
  missed_reason TEXT,
  side_effects_observed TEXT[],
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 HYDRATION DETAILS TRACKING
CREATE TABLE IF NOT EXISTS public.hydration_details_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tracking_time TIME,
  
  drink_type TEXT CHECK (drink_type IN ('agua', 'cha', 'cafe', 'suco', 'refrigerante', 'leite', 'alcool', 'outro')),
  amount_ml INTEGER,
  caffeine_content BOOLEAN DEFAULT FALSE,
  sugar_content BOOLEAN DEFAULT FALSE,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 BREATHING MINDFULNESS TRACKING
CREATE TABLE IF NOT EXISTS public.breathing_mindfulness_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tracking_time TIME,
  
  practice_type TEXT CHECK (practice_type IN ('meditacao', 'respiracao', 'yoga', 'relaxamento', 'oracao', 'outro')),
  duration_minutes INTEGER,
  pre_practice_stress INTEGER CHECK (pre_practice_stress BETWEEN 0 AND 10),
  post_practice_stress INTEGER CHECK (post_practice_stress BETWEEN 0 AND 10),
  felt_benefits BOOLEAN DEFAULT TRUE,
  benefits_description TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 BODY SENSATION TRACKING
CREATE TABLE IF NOT EXISTS public.body_sensation_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tracking_time TIME,
  
  sensation_type TEXT CHECK (sensation_type IN ('formigamento', 'calor', 'frio', 'tensao', 'relaxamento', 'pressao', 'dor', 'outro')),
  body_region TEXT,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  associated_emotion TEXT,
  possible_trigger TEXT,
  duration_minutes INTEGER,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 FOOD CRAVING TRACKING
CREATE TABLE IF NOT EXISTS public.food_craving_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tracking_time TIME,
  
  craving_type TEXT CHECK (craving_type IN ('doce', 'salgado', 'gordura', 'carboidrato', 'proteina', 'especifico')),
  specific_food TEXT,
  craving_intensity INTEGER CHECK (craving_intensity BETWEEN 1 AND 10),
  satisfied_craving BOOLEAN,
  alternative_chosen TEXT,
  trigger_identified TEXT,
  emotional_state TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 PRODUCTIVITY TRACKING
CREATE TABLE IF NOT EXISTS public.productivity_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  productivity_rating INTEGER CHECK (productivity_rating BETWEEN 1 AND 10),
  focus_rating INTEGER CHECK (focus_rating BETWEEN 1 AND 10),
  main_distractions TEXT[],
  tasks_planned INTEGER,
  tasks_completed INTEGER,
  procrastination_episodes INTEGER DEFAULT 0,
  peak_productivity_time TEXT,
  energy_correlation TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, tracking_date)
);

-- 2.7 GRATITUDE JOURNAL
CREATE TABLE IF NOT EXISTS public.gratitude_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  grateful_item_1 TEXT,
  grateful_item_2 TEXT,
  grateful_item_3 TEXT,
  highlight_of_day TEXT,
  person_to_thank TEXT,
  learned_today TEXT,
  positive_affirmation TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, journal_date)
);

-- 2.8 TRIGGER INCIDENT TRACKING
CREATE TABLE IF NOT EXISTS public.trigger_incident_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tracking_time TIME,
  
  trigger_type TEXT CHECK (trigger_type IN ('emocional', 'ambiental', 'social', 'hormonal', 'fisico', 'cognitivo')),
  trigger_description TEXT,
  trigger_intensity INTEGER CHECK (trigger_intensity BETWEEN 1 AND 10),
  reaction_type TEXT CHECK (reaction_type IN ('comeu', 'compulsao', 'resistiu', 'alternativa', 'fugiu', 'enfrentou')),
  food_involved TEXT,
  coping_strategy_used TEXT,
  strategy_worked BOOLEAN,
  outcome_rating INTEGER CHECK (outcome_rating BETWEEN 1 AND 10),
  lesson_learned TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 3: EXPANSÃO DE TABELAS EXISTENTES
-- =====================================================

-- 3.1 Expandir sleep_monitoring
ALTER TABLE public.sleep_monitoring 
  ADD COLUMN IF NOT EXISTS night_awakenings INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS woke_tired BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS had_nightmares BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS used_sleep_medication BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS time_to_fall_asleep_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS woke_up_naturally BOOLEAN,
  ADD COLUMN IF NOT EXISTS nap_during_day BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS nap_duration_minutes INTEGER;

-- 3.2 Expandir mood_monitoring
ALTER TABLE public.mood_monitoring 
  ADD COLUMN IF NOT EXISTS predominant_emotion TEXT,
  ADD COLUMN IF NOT EXISTS emotion_intensity INTEGER CHECK (emotion_intensity BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS anxiety_level INTEGER CHECK (anxiety_level BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS self_esteem_today INTEGER CHECK (self_esteem_today BETWEEN 1 AND 10);

-- 3.3 Expandir advanced_daily_tracking
ALTER TABLE public.advanced_daily_tracking 
  ADD COLUMN IF NOT EXISTS energy_drop_time TEXT,
  ADD COLUMN IF NOT EXISTS sitting_hours NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS light_walks_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS movement_quality TEXT CHECK (movement_quality IN ('sedentario', 'leve', 'moderado', 'ativo', 'muito_ativo'));

-- =====================================================
-- PARTE 4: TABELA AGREGADORA - DAILY HEALTH SNAPSHOT
-- =====================================================

CREATE TABLE IF NOT EXISTS public.daily_health_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,
  
  -- Agregações Nutricionais
  total_calories INTEGER,
  total_protein_g NUMERIC(6,2),
  total_carbs_g NUMERIC(6,2),
  total_fats_g NUMERIC(6,2),
  total_fiber_g NUMERIC(6,2),
  total_water_ml INTEGER,
  meals_logged INTEGER,
  nutritional_adherence INTEGER,
  
  -- Agregações de Movimento
  total_steps INTEGER,
  active_minutes INTEGER,
  exercise_type TEXT,
  exercise_duration INTEGER,
  calories_burned INTEGER,
  sitting_hours NUMERIC(4,2),
  movement_score INTEGER CHECK (movement_score BETWEEN 0 AND 100),
  
  -- Agregações de Sono
  sleep_hours NUMERIC(4,2),
  sleep_quality INTEGER,
  night_awakenings INTEGER,
  woke_tired BOOLEAN,
  sleep_score INTEGER CHECK (sleep_score BETWEEN 0 AND 100),
  
  -- Agregações Emocionais
  predominant_mood TEXT,
  mood_rating INTEGER,
  stress_level INTEGER,
  anxiety_level INTEGER,
  energy_level INTEGER,
  emotional_score INTEGER CHECK (emotional_score BETWEEN 0 AND 100),
  
  -- Agregações de Fome/Comportamento
  hunger_episodes INTEGER,
  emotional_eating_episodes INTEGER,
  main_trigger TEXT,
  eating_behavior_score INTEGER CHECK (eating_behavior_score BETWEEN 0 AND 100),
  
  -- Agregações Digestivas
  digestive_symptoms TEXT[],
  bloating_level INTEGER,
  digestion_score INTEGER CHECK (digestion_score BETWEEN 0 AND 100),
  
  -- Ciclo Menstrual
  cycle_phase TEXT,
  cycle_day INTEGER,
  menstrual_symptoms TEXT[],
  
  -- Contexto Social
  social_support_level INTEGER,
  main_eating_environment TEXT,
  had_social_event BOOLEAN,
  
  -- Sintomas e Dor
  pain_reported BOOLEAN,
  pain_level INTEGER,
  pain_locations TEXT[],
  symptoms_reported TEXT[],
  
  -- Autoavaliação
  day_rating INTEGER,
  consistency_feeling INTEGER,
  main_win TEXT,
  main_challenge TEXT,
  
  -- Mindfulness
  mindfulness_minutes INTEGER,
  mindfulness_practiced BOOLEAN,
  
  -- Medicamentos
  medications_taken TEXT[],
  medication_adherence_percentage INTEGER,
  
  -- Scores Calculados
  overall_health_score INTEGER CHECK (overall_health_score BETWEEN 0 AND 100),
  trend_vs_yesterday TEXT CHECK (trend_vs_yesterday IN ('melhorando', 'estavel', 'piorando')),
  
  -- Insights da IA
  ai_insights TEXT,
  ai_recommendations TEXT[],
  alerts TEXT[],
  
  -- Metadados
  data_completeness INTEGER CHECK (data_completeness BETWEEN 0 AND 100),
  sources_used TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, snapshot_date)
);

-- =====================================================
-- PARTE 5: ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_hunger_user_date ON public.hunger_behavior_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_digestion_user_date ON public.digestion_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_menstrual_user_date ON public.menstrual_cycle_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_social_user_date ON public.social_context_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_assessment_user_date ON public.daily_self_assessment(user_id, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_medication_user_date ON public.medication_adherence_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_hydration_user_date ON public.hydration_details_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_mindfulness_user_date ON public.breathing_mindfulness_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_sensation_user_date ON public.body_sensation_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_craving_user_date ON public.food_craving_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_productivity_user_date ON public.productivity_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_gratitude_user_date ON public.gratitude_journal(user_id, journal_date DESC);
CREATE INDEX IF NOT EXISTS idx_trigger_user_date ON public.trigger_incident_tracking(user_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshot_user_date ON public.daily_health_snapshot(user_id, snapshot_date DESC);

-- =====================================================
-- PARTE 6: RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.hunger_behavior_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digestion_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menstrual_cycle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_context_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_self_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_adherence_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_details_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breathing_mindfulness_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_sensation_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_craving_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_incident_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_health_snapshot ENABLE ROW LEVEL SECURITY;

-- Policies for hunger_behavior_tracking
CREATE POLICY "Users can view own hunger data" ON public.hunger_behavior_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hunger data" ON public.hunger_behavior_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hunger data" ON public.hunger_behavior_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hunger data" ON public.hunger_behavior_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for digestion_tracking
CREATE POLICY "Users can view own digestion data" ON public.digestion_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own digestion data" ON public.digestion_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own digestion data" ON public.digestion_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own digestion data" ON public.digestion_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for menstrual_cycle_tracking
CREATE POLICY "Users can view own menstrual data" ON public.menstrual_cycle_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own menstrual data" ON public.menstrual_cycle_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own menstrual data" ON public.menstrual_cycle_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own menstrual data" ON public.menstrual_cycle_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for social_context_tracking
CREATE POLICY "Users can view own social data" ON public.social_context_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social data" ON public.social_context_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social data" ON public.social_context_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social data" ON public.social_context_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for daily_self_assessment
CREATE POLICY "Users can view own assessment data" ON public.daily_self_assessment FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessment data" ON public.daily_self_assessment FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessment data" ON public.daily_self_assessment FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assessment data" ON public.daily_self_assessment FOR DELETE USING (auth.uid() = user_id);

-- Policies for medication_adherence_tracking
CREATE POLICY "Users can view own medication data" ON public.medication_adherence_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medication data" ON public.medication_adherence_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medication data" ON public.medication_adherence_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medication data" ON public.medication_adherence_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for hydration_details_tracking
CREATE POLICY "Users can view own hydration data" ON public.hydration_details_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hydration data" ON public.hydration_details_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hydration data" ON public.hydration_details_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hydration data" ON public.hydration_details_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for breathing_mindfulness_tracking
CREATE POLICY "Users can view own mindfulness data" ON public.breathing_mindfulness_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mindfulness data" ON public.breathing_mindfulness_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mindfulness data" ON public.breathing_mindfulness_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mindfulness data" ON public.breathing_mindfulness_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for body_sensation_tracking
CREATE POLICY "Users can view own sensation data" ON public.body_sensation_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sensation data" ON public.body_sensation_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sensation data" ON public.body_sensation_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sensation data" ON public.body_sensation_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for food_craving_tracking
CREATE POLICY "Users can view own craving data" ON public.food_craving_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own craving data" ON public.food_craving_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own craving data" ON public.food_craving_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own craving data" ON public.food_craving_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for productivity_tracking
CREATE POLICY "Users can view own productivity data" ON public.productivity_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own productivity data" ON public.productivity_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own productivity data" ON public.productivity_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own productivity data" ON public.productivity_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for gratitude_journal
CREATE POLICY "Users can view own gratitude data" ON public.gratitude_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gratitude data" ON public.gratitude_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gratitude data" ON public.gratitude_journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gratitude data" ON public.gratitude_journal FOR DELETE USING (auth.uid() = user_id);

-- Policies for trigger_incident_tracking
CREATE POLICY "Users can view own trigger data" ON public.trigger_incident_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trigger data" ON public.trigger_incident_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trigger data" ON public.trigger_incident_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trigger data" ON public.trigger_incident_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for daily_health_snapshot
CREATE POLICY "Users can view own snapshot data" ON public.daily_health_snapshot FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own snapshot data" ON public.daily_health_snapshot FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snapshot data" ON public.daily_health_snapshot FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own snapshot data" ON public.daily_health_snapshot FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PARTE 7: FUNÇÃO DE CONSOLIDAÇÃO DO SNAPSHOT
-- =====================================================

CREATE OR REPLACE FUNCTION public.consolidate_daily_health_snapshot(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_snapshot_id UUID;
  v_nutrition RECORD;
  v_tracking RECORD;
  v_sleep RECORD;
  v_mood RECORD;
  v_hunger_count INTEGER;
  v_emotional_eating INTEGER;
  v_digestion RECORD;
  v_menstrual RECORD;
  v_social RECORD;
  v_assessment RECORD;
  v_mindfulness INTEGER;
  v_data_sources TEXT[] := ARRAY[]::TEXT[];
  v_completeness INTEGER := 0;
  v_overall_score INTEGER := 0;
  v_alerts TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Buscar dados nutricionais
  SELECT total_calories, total_proteins as protein, total_carbs as carbs, total_fats as fats, 
         total_fiber as fiber, total_water_ml as water, meals_count
  INTO v_nutrition
  FROM daily_nutrition_summary
  WHERE user_id = p_user_id AND date = p_date
  LIMIT 1;
  
  IF v_nutrition IS NOT NULL THEN
    v_data_sources := array_append(v_data_sources, 'nutrition');
    v_completeness := v_completeness + 15;
  END IF;

  -- Buscar dados de tracking
  SELECT steps, active_minutes, exercise_type, exercise_duration_minutes, calories_burned,
         sitting_hours, energy_level, sleep_hours, sleep_quality, stress_level, pain_level,
         pain_location, symptoms, mood_rating
  INTO v_tracking
  FROM advanced_daily_tracking
  WHERE user_id = p_user_id AND tracking_date = p_date
  LIMIT 1;
  
  IF v_tracking IS NOT NULL THEN
    v_data_sources := array_append(v_data_sources, 'tracking');
    v_completeness := v_completeness + 20;
  END IF;

  -- Buscar dados de sono
  SELECT sleep_duration_hours, sleep_quality, night_awakenings, woke_tired
  INTO v_sleep
  FROM sleep_monitoring
  WHERE user_id = p_user_id AND sleep_date = p_date
  LIMIT 1;
  
  IF v_sleep IS NOT NULL THEN
    v_data_sources := array_append(v_data_sources, 'sleep');
    v_completeness := v_completeness + 15;
  END IF;

  -- Buscar dados de humor
  SELECT mood_level, stress_level, notes, predominant_emotion, anxiety_level, motivation_level
  INTO v_mood
  FROM mood_monitoring
  WHERE user_id = p_user_id AND mood_date = p_date
  LIMIT 1;
  
  IF v_mood IS NOT NULL THEN
    v_data_sources := array_append(v_data_sources, 'mood');
    v_completeness := v_completeness + 10;
  END IF;

  -- Contar episódios de fome
  SELECT COUNT(*), COUNT(*) FILTER (WHERE hunger_type IN ('emocional', 'ansiedade'))
  INTO v_hunger_count, v_emotional_eating
  FROM hunger_behavior_tracking
  WHERE user_id = p_user_id AND tracking_date = p_date;
  
  IF v_hunger_count > 0 THEN
    v_data_sources := array_append(v_data_sources, 'hunger');
    v_completeness := v_completeness + 10;
  END IF;

  -- Buscar dados digestivos
  SELECT bloating_level, 
         ARRAY_REMOVE(ARRAY[
           CASE WHEN has_constipation THEN 'constipacao' END,
           CASE WHEN has_diarrhea THEN 'diarreia' END,
           CASE WHEN has_reflux THEN 'refluxo' END,
           CASE WHEN has_nausea THEN 'nausea' END,
           CASE WHEN gas_level > 5 THEN 'gases' END
         ], NULL) as symptoms
  INTO v_digestion
  FROM digestion_tracking
  WHERE user_id = p_user_id AND tracking_date = p_date
  LIMIT 1;
  
  IF v_digestion IS NOT NULL THEN
    v_data_sources := array_append(v_data_sources, 'digestion');
    v_completeness := v_completeness + 10;
  END IF;

  -- Buscar ciclo menstrual
  SELECT cycle_phase, cycle_day,
         ARRAY_REMOVE(ARRAY[
           CASE WHEN has_cramps THEN 'colicas' END,
           CASE WHEN has_headache THEN 'dor_cabeca' END,
           CASE WHEN has_mood_swings THEN 'oscilacao_humor' END,
           CASE WHEN has_fatigue THEN 'fadiga' END
         ], NULL) as symptoms
  INTO v_menstrual
  FROM menstrual_cycle_tracking
  WHERE user_id = p_user_id AND tracking_date = p_date
  LIMIT 1;
  
  IF v_menstrual IS NOT NULL THEN
    v_data_sources := array_append(v_data_sources, 'menstrual');
    v_completeness := v_completeness + 5;
  END IF;

  -- Buscar contexto social
  SELECT social_support_level, main_eating_environment, had_social_event
  INTO v_social
  FROM social_context_tracking
  WHERE user_id = p_user_id AND tracking_date = p_date
  LIMIT 1;
  
  IF v_social IS NOT NULL THEN
    v_data_sources := array_append(v_data_sources, 'social');
    v_completeness := v_completeness + 5;
  END IF;

  -- Buscar autoavaliação
  SELECT day_rating, consistency_feeling, main_win, main_challenge
  INTO v_assessment
  FROM daily_self_assessment
  WHERE user_id = p_user_id AND assessment_date = p_date
  LIMIT 1;
  
  IF v_assessment IS NOT NULL THEN
    v_data_sources := array_append(v_data_sources, 'assessment');
    v_completeness := v_completeness + 10;
  END IF;

  -- Calcular minutos de mindfulness
  SELECT COALESCE(SUM(duration_minutes), 0)
  INTO v_mindfulness
  FROM breathing_mindfulness_tracking
  WHERE user_id = p_user_id AND tracking_date = p_date;

  -- Calcular score geral (simplificado)
  v_overall_score := LEAST(100, GREATEST(0,
    COALESCE(v_tracking.energy_level, 5) * 10 +
    COALESCE(v_mood.mood_level, 5) * 5 +
    COALESCE(v_sleep.sleep_quality, 5) * 5 +
    COALESCE(v_assessment.day_rating, 5) * 5 -
    COALESCE(v_tracking.stress_level, 0) * 2 -
    COALESCE(v_tracking.pain_level, 0) * 2
  ) / 3);

  -- Gerar alertas
  IF COALESCE(v_sleep.sleep_duration_hours, 8) < 6 THEN
    v_alerts := array_append(v_alerts, 'Sono insuficiente (menos de 6h)');
  END IF;
  
  IF COALESCE(v_tracking.stress_level, 0) > 7 THEN
    v_alerts := array_append(v_alerts, 'Nível de estresse elevado');
  END IF;
  
  IF v_emotional_eating > 2 THEN
    v_alerts := array_append(v_alerts, 'Múltiplos episódios de fome emocional');
  END IF;

  -- Inserir ou atualizar snapshot
  INSERT INTO daily_health_snapshot (
    user_id, snapshot_date,
    -- Nutrição
    total_calories, total_protein_g, total_carbs_g, total_fats_g, total_fiber_g,
    total_water_ml, meals_logged,
    -- Movimento
    total_steps, active_minutes, exercise_type, exercise_duration, calories_burned, sitting_hours,
    -- Sono
    sleep_hours, sleep_quality, night_awakenings, woke_tired,
    -- Emocional
    predominant_mood, mood_rating, stress_level, anxiety_level, energy_level,
    -- Fome/Comportamento
    hunger_episodes, emotional_eating_episodes,
    -- Digestão
    digestive_symptoms, bloating_level,
    -- Ciclo
    cycle_phase, cycle_day, menstrual_symptoms,
    -- Social
    social_support_level, main_eating_environment, had_social_event,
    -- Dor
    pain_reported, pain_level, pain_locations,
    -- Autoavaliação
    day_rating, consistency_feeling, main_win, main_challenge,
    -- Mindfulness
    mindfulness_minutes, mindfulness_practiced,
    -- Scores
    overall_health_score, alerts, data_completeness, sources_used,
    updated_at
  ) VALUES (
    p_user_id, p_date,
    -- Nutrição
    v_nutrition.total_calories, v_nutrition.protein, v_nutrition.carbs, v_nutrition.fats, v_nutrition.fiber,
    v_nutrition.water, v_nutrition.meals_count,
    -- Movimento
    v_tracking.steps, v_tracking.active_minutes, v_tracking.exercise_type, 
    v_tracking.exercise_duration_minutes, v_tracking.calories_burned, v_tracking.sitting_hours,
    -- Sono
    COALESCE(v_sleep.sleep_duration_hours, v_tracking.sleep_hours), 
    COALESCE(v_sleep.sleep_quality, v_tracking.sleep_quality),
    v_sleep.night_awakenings, v_sleep.woke_tired,
    -- Emocional
    v_mood.predominant_emotion, COALESCE(v_mood.mood_level, v_tracking.mood_rating),
    COALESCE(v_mood.stress_level, v_tracking.stress_level), v_mood.anxiety_level, v_tracking.energy_level,
    -- Fome
    v_hunger_count, v_emotional_eating,
    -- Digestão
    v_digestion.symptoms, v_digestion.bloating_level,
    -- Ciclo
    v_menstrual.cycle_phase, v_menstrual.cycle_day, v_menstrual.symptoms,
    -- Social
    v_social.social_support_level, v_social.main_eating_environment, v_social.had_social_event,
    -- Dor
    v_tracking.pain_level > 0, v_tracking.pain_level, 
    CASE WHEN v_tracking.pain_location IS NOT NULL THEN ARRAY[v_tracking.pain_location] ELSE NULL END,
    -- Autoavaliação
    v_assessment.day_rating, v_assessment.consistency_feeling, v_assessment.main_win, v_assessment.main_challenge,
    -- Mindfulness
    v_mindfulness, v_mindfulness > 0,
    -- Scores
    v_overall_score, v_alerts, v_completeness, v_data_sources,
    NOW()
  )
  ON CONFLICT (user_id, snapshot_date) DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g = EXCLUDED.total_carbs_g,
    total_fats_g = EXCLUDED.total_fats_g,
    total_fiber_g = EXCLUDED.total_fiber_g,
    total_water_ml = EXCLUDED.total_water_ml,
    meals_logged = EXCLUDED.meals_logged,
    total_steps = EXCLUDED.total_steps,
    active_minutes = EXCLUDED.active_minutes,
    exercise_type = EXCLUDED.exercise_type,
    exercise_duration = EXCLUDED.exercise_duration,
    calories_burned = EXCLUDED.calories_burned,
    sitting_hours = EXCLUDED.sitting_hours,
    sleep_hours = EXCLUDED.sleep_hours,
    sleep_quality = EXCLUDED.sleep_quality,
    night_awakenings = EXCLUDED.night_awakenings,
    woke_tired = EXCLUDED.woke_tired,
    predominant_mood = EXCLUDED.predominant_mood,
    mood_rating = EXCLUDED.mood_rating,
    stress_level = EXCLUDED.stress_level,
    anxiety_level = EXCLUDED.anxiety_level,
    energy_level = EXCLUDED.energy_level,
    hunger_episodes = EXCLUDED.hunger_episodes,
    emotional_eating_episodes = EXCLUDED.emotional_eating_episodes,
    digestive_symptoms = EXCLUDED.digestive_symptoms,
    bloating_level = EXCLUDED.bloating_level,
    cycle_phase = EXCLUDED.cycle_phase,
    cycle_day = EXCLUDED.cycle_day,
    menstrual_symptoms = EXCLUDED.menstrual_symptoms,
    social_support_level = EXCLUDED.social_support_level,
    main_eating_environment = EXCLUDED.main_eating_environment,
    had_social_event = EXCLUDED.had_social_event,
    pain_reported = EXCLUDED.pain_reported,
    pain_level = EXCLUDED.pain_level,
    pain_locations = EXCLUDED.pain_locations,
    day_rating = EXCLUDED.day_rating,
    consistency_feeling = EXCLUDED.consistency_feeling,
    main_win = EXCLUDED.main_win,
    main_challenge = EXCLUDED.main_challenge,
    mindfulness_minutes = EXCLUDED.mindfulness_minutes,
    mindfulness_practiced = EXCLUDED.mindfulness_practiced,
    overall_health_score = EXCLUDED.overall_health_score,
    alerts = EXCLUDED.alerts,
    data_completeness = EXCLUDED.data_completeness,
    sources_used = EXCLUDED.sources_used,
    updated_at = NOW()
  RETURNING id INTO v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$;
