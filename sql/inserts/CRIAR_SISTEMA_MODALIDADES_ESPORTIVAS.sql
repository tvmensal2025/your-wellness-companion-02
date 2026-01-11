-- ============================================
-- SISTEMA DE MODALIDADES ESPORTIVAS
-- Instituto dos Sonhos - Sistema Único
-- ============================================

-- 1. TABELA DE MODALIDADES DO USUÁRIO
CREATE TABLE IF NOT EXISTS public.user_sport_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  modality TEXT NOT NULL CHECK (modality IN (
    'running', 'cycling', 'swimming', 'functional', 'yoga', 
    'martial_arts', 'trail', 'team_sports', 'racquet_sports'
  )),
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'elite')),
  goal TEXT,
  target_event TEXT, -- Ex: "5K", "Marathon", "Century Ride"
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}'::jsonb, -- Preferências específicas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_sport_modalities_user_id ON public.user_sport_modalities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sport_modalities_modality ON public.user_sport_modalities(modality);
CREATE INDEX IF NOT EXISTS idx_user_sport_modalities_active ON public.user_sport_modalities(user_id, is_active);

-- RLS Policies
ALTER TABLE public.user_sport_modalities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own modalities"
  ON public.user_sport_modalities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own modalities"
  ON public.user_sport_modalities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own modalities"
  ON public.user_sport_modalities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own modalities"
  ON public.user_sport_modalities FOR DELETE
  USING (auth.uid() = user_id);

-- 2. TABELA DE PROGRAMAS DE TREINO
CREATE TABLE IF NOT EXISTS public.sport_training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  modality_id UUID REFERENCES public.user_sport_modalities(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL, -- "Couch to 5K", "Century Ride", etc
  plan_type TEXT NOT NULL, -- "progressive", "maintenance", "competition_prep"
  duration_weeks INTEGER NOT NULL,
  workouts_per_week INTEGER NOT NULL,
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  
  -- Estrutura dos treinos (JSON)
  plan_data JSONB NOT NULL,
  
  -- Progresso
  total_workouts INTEGER DEFAULT 0,
  completed_workouts INTEGER DEFAULT 0,
  completion_percentage DECIMAL DEFAULT 0,
  
  -- Datas
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_workout_at TIMESTAMP WITH TIME ZONE,
  
  -- Estatísticas
  total_distance_km DECIMAL DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  total_calories_burned INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sport_training_plans_user_id ON public.sport_training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_training_plans_status ON public.sport_training_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sport_training_plans_modality ON public.sport_training_plans(modality_id);

-- RLS Policies
ALTER TABLE public.sport_training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans"
  ON public.sport_training_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON public.sport_training_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON public.sport_training_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON public.sport_training_plans FOR DELETE
  USING (auth.uid() = user_id);

-- 3. TABELA DE LOGS DE TREINOS
CREATE TABLE IF NOT EXISTS public.sport_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  training_plan_id UUID REFERENCES public.sport_training_plans(id) ON DELETE SET NULL,
  modality TEXT NOT NULL,
  
  -- Tipo de treino
  workout_type TEXT NOT NULL, -- 'easy_run', 'intervals', 'long_ride', etc
  workout_name TEXT,
  
  -- Métricas básicas
  distance_km DECIMAL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  
  -- Métricas de intensidade
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  avg_pace TEXT, -- '5:30/km' para corrida
  avg_speed_kmh DECIMAL,
  
  -- Métricas específicas de ciclismo
  avg_power_watts INTEGER,
  normalized_power INTEGER,
  intensity_factor DECIMAL,
  
  -- Métricas de elevação
  elevation_gain_m INTEGER,
  elevation_loss_m INTEGER,
  
  -- Sensação e notas
  perceived_effort INTEGER CHECK (perceived_effort BETWEEN 1 AND 10),
  mood TEXT CHECK (mood IN ('great', 'good', 'ok', 'tired', 'bad')),
  notes TEXT,
  
  -- Integrações externas
  external_source TEXT, -- 'strava', 'garmin', 'manual'
  external_id TEXT,
  external_data JSONB,
  
  -- Localização
  location_type TEXT CHECK (location_type IN ('outdoor', 'indoor', 'track', 'trail')),
  weather_conditions TEXT,
  
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sport_workout_logs_user_id ON public.sport_workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_workout_logs_date ON public.sport_workout_logs(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sport_workout_logs_modality ON public.sport_workout_logs(user_id, modality);
CREATE INDEX IF NOT EXISTS idx_sport_workout_logs_plan ON public.sport_workout_logs(training_plan_id);
CREATE INDEX IF NOT EXISTS idx_sport_workout_logs_external ON public.sport_workout_logs(external_source, external_id);

-- RLS Policies
ALTER TABLE public.sport_workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON public.sport_workout_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON public.sport_workout_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON public.sport_workout_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON public.sport_workout_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 4. TABELA DE DESAFIOS VIRTUAIS
CREATE TABLE IF NOT EXISTS public.sport_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  modality TEXT NOT NULL,
  
  -- Tipo de desafio
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('distance', 'duration', 'count', 'streak')),
  goal_value DECIMAL NOT NULL,
  goal_unit TEXT NOT NULL, -- 'km', 'minutes', 'workouts', 'days'
  
  -- Datas
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Visibilidade
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  
  -- Recompensas
  badge_icon TEXT,
  badge_name TEXT,
  points_reward INTEGER DEFAULT 0,
  
  -- Estatísticas
  participants_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  
  -- Criador
  created_by UUID REFERENCES auth.users(id),
  is_official BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sport_challenges_dates ON public.sport_challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_sport_challenges_modality ON public.sport_challenges(modality);
CREATE INDEX IF NOT EXISTS idx_sport_challenges_active ON public.sport_challenges(start_date, end_date) 
  WHERE end_date >= CURRENT_DATE;

-- RLS Policies
ALTER TABLE public.sport_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public challenges"
  ON public.sport_challenges FOR SELECT
  USING (visibility = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can create challenges"
  ON public.sport_challenges FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own challenges"
  ON public.sport_challenges FOR UPDATE
  USING (auth.uid() = created_by);

-- 5. TABELA DE PARTICIPAÇÃO EM DESAFIOS
CREATE TABLE IF NOT EXISTS public.sport_challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.sport_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Progresso
  current_progress DECIMAL DEFAULT 0,
  goal_progress_percentage DECIMAL DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Ranking
  rank INTEGER,
  
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Único por usuário por desafio
  UNIQUE(challenge_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user ON public.sport_challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_challenge ON public.sport_challenge_participations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_rank ON public.sport_challenge_participations(challenge_id, rank);

-- RLS Policies
ALTER TABLE public.sport_challenge_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own participations"
  ON public.sport_challenge_participations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public challenge leaderboards"
  ON public.sport_challenge_participations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sport_challenges
      WHERE id = challenge_id AND visibility = 'public'
    )
  );

CREATE POLICY "Users can join challenges"
  ON public.sport_challenge_participations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participations"
  ON public.sport_challenge_participations FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. TABELA DE CONQUISTAS/BADGES
CREATE TABLE IF NOT EXISTS public.sport_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo de conquista
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  
  -- Modalidade relacionada
  modality TEXT,
  
  -- Visual
  badge_icon TEXT NOT NULL,
  badge_color TEXT DEFAULT '#667eea',
  
  -- Dados da conquista
  achievement_data JSONB,
  
  -- Raridade
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sport_achievements_user ON public.sport_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_achievements_type ON public.sport_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_sport_achievements_date ON public.sport_achievements(user_id, earned_at DESC);

-- RLS Policies
ALTER TABLE public.sport_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON public.sport_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' achievements"
  ON public.sport_achievements FOR SELECT
  USING (true); -- Conquistas são públicas

-- 7. FUNÇÕES E TRIGGERS

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_user_sport_modalities_updated_at
    BEFORE UPDATE ON public.user_sport_modalities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sport_training_plans_updated_at
    BEFORE UPDATE ON public.sport_training_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar progresso do plano quando um treino é completado
CREATE OR REPLACE FUNCTION update_training_plan_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.training_plan_id IS NOT NULL THEN
    UPDATE public.sport_training_plans
    SET 
      completed_workouts = completed_workouts + 1,
      total_distance_km = total_distance_km + COALESCE(NEW.distance_km, 0),
      total_duration_minutes = total_duration_minutes + COALESCE(NEW.duration_minutes, 0),
      total_calories_burned = total_calories_burned + COALESCE(NEW.calories_burned, 0),
      last_workout_at = NEW.completed_at,
      completion_percentage = (
        (completed_workouts + 1)::decimal / NULLIF(total_workouts, 0) * 100
      )
    WHERE id = NEW.training_plan_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plan_on_workout_complete
    AFTER INSERT ON public.sport_workout_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_training_plan_progress();

-- Função para atualizar progresso de desafios
CREATE OR REPLACE FUNCTION update_challenge_progress()
RETURNS TRIGGER AS $$
DECLARE
  challenge_record RECORD;
BEGIN
  -- Buscar desafios ativos do usuário na modalidade
  FOR challenge_record IN 
    SELECT cp.id, cp.challenge_id, sc.challenge_type, sc.goal_value, sc.goal_unit
    FROM public.sport_challenge_participations cp
    JOIN public.sport_challenges sc ON sc.id = cp.challenge_id
    WHERE cp.user_id = NEW.user_id
      AND cp.status = 'active'
      AND sc.modality = NEW.modality
      AND CURRENT_DATE BETWEEN sc.start_date AND sc.end_date
  LOOP
    -- Atualizar progresso baseado no tipo de desafio
    IF challenge_record.challenge_type = 'distance' AND challenge_record.goal_unit = 'km' THEN
      UPDATE public.sport_challenge_participations
      SET 
        current_progress = current_progress + COALESCE(NEW.distance_km, 0),
        goal_progress_percentage = ((current_progress + COALESCE(NEW.distance_km, 0)) / challenge_record.goal_value * 100),
        last_updated_at = NOW(),
        status = CASE 
          WHEN (current_progress + COALESCE(NEW.distance_km, 0)) >= challenge_record.goal_value 
          THEN 'completed'
          ELSE 'active'
        END,
        completed_at = CASE 
          WHEN (current_progress + COALESCE(NEW.distance_km, 0)) >= challenge_record.goal_value 
          THEN NOW()
          ELSE completed_at
        END
      WHERE id = challenge_record.id;
      
    ELSIF challenge_record.challenge_type = 'duration' AND challenge_record.goal_unit = 'minutes' THEN
      UPDATE public.sport_challenge_participations
      SET 
        current_progress = current_progress + COALESCE(NEW.duration_minutes, 0),
        goal_progress_percentage = ((current_progress + COALESCE(NEW.duration_minutes, 0)) / challenge_record.goal_value * 100),
        last_updated_at = NOW(),
        status = CASE 
          WHEN (current_progress + COALESCE(NEW.duration_minutes, 0)) >= challenge_record.goal_value 
          THEN 'completed'
          ELSE 'active'
        END,
        completed_at = CASE 
          WHEN (current_progress + COALESCE(NEW.duration_minutes, 0)) >= challenge_record.goal_value 
          THEN NOW()
          ELSE completed_at
        END
      WHERE id = challenge_record.id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenges_on_workout
    AFTER INSERT ON public.sport_workout_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_challenge_progress();

-- 8. INSERIR DESAFIOS OFICIAIS INICIAIS

INSERT INTO public.sport_challenges (name, description, modality, challenge_type, goal_value, goal_unit, start_date, end_date, badge_icon, badge_name, points_reward, is_official)
VALUES 
  ('Desafio 100km - Corrida', 'Corra 100km em um mês', 'running', 'distance', 100, 'km', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '🏃', 'Corredor dos Sonhos', 500, true),
  ('Desafio 500km - Ciclismo', 'Pedale 500km em um mês', 'cycling', 'distance', 500, 'km', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '🚴', 'Ciclista dos Sonhos', 1000, true),
  ('Desafio 10km Natação', 'Nade 10km em um mês', 'swimming', 'distance', 10, 'km', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '🏊', 'Nadador dos Sonhos', 750, true),
  ('Treinos Consistentes', 'Complete 20 treinos no mês', 'running', 'count', 20, 'workouts', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '💪', 'Consistência', 300, true)
ON CONFLICT DO NOTHING;

-- 9. VIEWS ÚTEIS

-- View de estatísticas gerais do usuário
CREATE OR REPLACE VIEW user_sport_statistics AS
SELECT 
  user_id,
  modality,
  COUNT(*) as total_workouts,
  SUM(distance_km) as total_distance_km,
  SUM(duration_minutes) as total_duration_minutes,
  SUM(calories_burned) as total_calories_burned,
  AVG(perceived_effort) as avg_effort,
  MAX(completed_at) as last_workout_date,
  DATE_PART('day', NOW() - MAX(completed_at)) as days_since_last_workout
FROM public.sport_workout_logs
GROUP BY user_id, modality;

-- View de ranking de desafios
CREATE OR REPLACE VIEW challenge_leaderboard AS
SELECT 
  cp.challenge_id,
  cp.user_id,
  cp.current_progress,
  cp.goal_progress_percentage,
  cp.status,
  RANK() OVER (PARTITION BY cp.challenge_id ORDER BY cp.current_progress DESC) as rank
FROM public.sport_challenge_participations cp
WHERE cp.status IN ('active', 'completed');

-- Comentários nas tabelas
COMMENT ON TABLE public.user_sport_modalities IS 'Modalidades esportivas que cada usuário pratica';
COMMENT ON TABLE public.sport_training_plans IS 'Programas de treino personalizados por modalidade';
COMMENT ON TABLE public.sport_workout_logs IS 'Histórico de todos os treinos realizados';
COMMENT ON TABLE public.sport_challenges IS 'Desafios virtuais disponíveis';
COMMENT ON TABLE public.sport_challenge_participations IS 'Participação dos usuários nos desafios';
COMMENT ON TABLE public.sport_achievements IS 'Conquistas e badges ganhos pelos usuários';

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Para verificar se tudo foi criado corretamente:
SELECT 
  'user_sport_modalities' as table_name, 
  COUNT(*) as columns 
FROM information_schema.columns 
WHERE table_name = 'user_sport_modalities'
UNION ALL
SELECT 'sport_training_plans', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'sport_training_plans'
UNION ALL
SELECT 'sport_workout_logs', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'sport_workout_logs'
UNION ALL
SELECT 'sport_challenges', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'sport_challenges'
UNION ALL
SELECT 'sport_challenge_participations', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'sport_challenge_participations'
UNION ALL
SELECT 'sport_achievements', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'sport_achievements';


