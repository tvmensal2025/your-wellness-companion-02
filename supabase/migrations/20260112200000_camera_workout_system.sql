-- =====================================================
-- 🎥 Camera Workout System - Pose Estimation Tables
-- MaxNutrition - Janeiro 2026
-- =====================================================

-- Sessões de treino com câmera
CREATE TABLE IF NOT EXISTS camera_workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_type TEXT NOT NULL DEFAULT 'squat',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  valid_reps INTEGER DEFAULT 0,
  partial_reps INTEGER DEFAULT 0,
  average_form_score DECIMAL(5,2) DEFAULT 0,
  best_rep_score DECIMAL(5,2) DEFAULT 0,
  inference_mode TEXT DEFAULT 'server', -- 'on-device', 'server', 'mediapipe'
  device_info JSONB DEFAULT '{}',
  calibration_data JSONB DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_exercise_type CHECK (exercise_type IN ('squat', 'pushup', 'situp', 'plank', 'lunge', 'jumping_jack')),
  CONSTRAINT valid_inference_mode CHECK (inference_mode IN ('on-device', 'server', 'mediapipe'))
);

-- Eventos de repetição individual
CREATE TABLE IF NOT EXISTS camera_rep_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES camera_workout_sessions(id) ON DELETE CASCADE NOT NULL,
  rep_number INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER DEFAULT 0,
  form_score DECIMAL(5,2) DEFAULT 0,
  angles JSONB DEFAULT '{}', -- { primary: 85, secondary: 120, valley: 80, peak: 170 }
  phase_durations JSONB DEFAULT '{}', -- { down: 800, up: 600 }
  is_valid BOOLEAN DEFAULT true,
  issues TEXT[] DEFAULT '{}',
  keypoints_snapshot JSONB -- Snapshot dos keypoints no momento da rep
);


-- Eventos de postura/feedback
CREATE TABLE IF NOT EXISTS camera_posture_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES camera_workout_sessions(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  issue_type TEXT NOT NULL,
  severity TEXT DEFAULT 'minor', -- 'minor', 'moderate', 'significant'
  message_shown TEXT,
  user_improved BOOLEAN DEFAULT false,
  keypoints_at_issue JSONB,
  
  CONSTRAINT valid_severity CHECK (severity IN ('minor', 'moderate', 'significant'))
);

-- Métricas de performance do sistema
CREATE TABLE IF NOT EXISTS camera_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES camera_workout_sessions(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  fps DECIMAL(5,2) DEFAULT 0,
  inference_latency_ms INTEGER DEFAULT 0,
  confidence_avg DECIMAL(5,4) DEFAULT 0,
  lighting_quality TEXT DEFAULT 'good', -- 'good', 'fair', 'poor'
  visibility_score DECIMAL(5,2) DEFAULT 0,
  device_temperature DECIMAL(5,2),
  battery_level INTEGER,
  errors TEXT[] DEFAULT '{}',
  
  CONSTRAINT valid_lighting CHECK (lighting_quality IN ('good', 'fair', 'poor'))
);

-- Calibrações salvas do usuário
CREATE TABLE IF NOT EXISTS camera_calibrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_type TEXT NOT NULL DEFAULT 'squat',
  calibration_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_calibration_exercise CHECK (exercise_type IN ('squat', 'pushup', 'situp', 'plank', 'lunge', 'jumping_jack')),
  UNIQUE(user_id, exercise_type)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para camera_workout_sessions
CREATE INDEX IF NOT EXISTS idx_camera_sessions_user_date 
  ON camera_workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_camera_sessions_exercise 
  ON camera_workout_sessions(exercise_type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_camera_sessions_user_exercise 
  ON camera_workout_sessions(user_id, exercise_type, started_at DESC);

-- Índices para camera_rep_events
CREATE INDEX IF NOT EXISTS idx_camera_reps_session 
  ON camera_rep_events(session_id, rep_number);
CREATE INDEX IF NOT EXISTS idx_camera_reps_timestamp 
  ON camera_rep_events(session_id, timestamp);

-- Índices para camera_posture_events
CREATE INDEX IF NOT EXISTS idx_camera_posture_session 
  ON camera_posture_events(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_camera_posture_type 
  ON camera_posture_events(issue_type, timestamp DESC);

-- Índices para camera_metrics
CREATE INDEX IF NOT EXISTS idx_camera_metrics_session 
  ON camera_metrics(session_id, timestamp);

-- Índices para camera_calibrations
CREATE INDEX IF NOT EXISTS idx_camera_calibrations_user 
  ON camera_calibrations(user_id, exercise_type);


-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE camera_workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_rep_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_posture_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_calibrations ENABLE ROW LEVEL SECURITY;

-- Policies para camera_workout_sessions
CREATE POLICY "Users can view own camera sessions" 
  ON camera_workout_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own camera sessions" 
  ON camera_workout_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own camera sessions" 
  ON camera_workout_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own camera sessions" 
  ON camera_workout_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies para camera_rep_events (via session ownership)
CREATE POLICY "Users can view own rep events" 
  ON camera_rep_events FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM camera_workout_sessions 
    WHERE id = camera_rep_events.session_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own rep events" 
  ON camera_rep_events FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM camera_workout_sessions 
    WHERE id = camera_rep_events.session_id AND user_id = auth.uid()
  ));

-- Policies para camera_posture_events (via session ownership)
CREATE POLICY "Users can view own posture events" 
  ON camera_posture_events FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM camera_workout_sessions 
    WHERE id = camera_posture_events.session_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own posture events" 
  ON camera_posture_events FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM camera_workout_sessions 
    WHERE id = camera_posture_events.session_id AND user_id = auth.uid()
  ));

-- Policies para camera_metrics (via session ownership)
CREATE POLICY "Users can view own metrics" 
  ON camera_metrics FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM camera_workout_sessions 
    WHERE id = camera_metrics.session_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own metrics" 
  ON camera_metrics FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM camera_workout_sessions 
    WHERE id = camera_metrics.session_id AND user_id = auth.uid()
  ));

-- Policies para camera_calibrations
CREATE POLICY "Users can view own calibrations" 
  ON camera_calibrations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calibrations" 
  ON camera_calibrations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calibrations" 
  ON camera_calibrations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calibrations" 
  ON camera_calibrations FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para obter estatísticas de treino com câmera do usuário
CREATE OR REPLACE FUNCTION get_camera_workout_stats(p_user_id UUID)
RETURNS TABLE (
  total_sessions BIGINT,
  total_reps BIGINT,
  total_valid_reps BIGINT,
  avg_form_score DECIMAL,
  total_duration_minutes DECIMAL,
  favorite_exercise TEXT,
  current_streak INTEGER,
  best_session_reps INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_sessions,
    COALESCE(SUM(cws.total_reps), 0)::BIGINT as total_reps,
    COALESCE(SUM(cws.valid_reps), 0)::BIGINT as total_valid_reps,
    COALESCE(AVG(cws.average_form_score), 0)::DECIMAL as avg_form_score,
    COALESCE(SUM(cws.duration_seconds) / 60.0, 0)::DECIMAL as total_duration_minutes,
    (
      SELECT exercise_type 
      FROM camera_workout_sessions 
      WHERE user_id = p_user_id 
      GROUP BY exercise_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as favorite_exercise,
    (
      SELECT COUNT(DISTINCT DATE(started_at))::INTEGER
      FROM camera_workout_sessions
      WHERE user_id = p_user_id
        AND started_at >= CURRENT_DATE - INTERVAL '30 days'
    ) as current_streak,
    COALESCE(MAX(cws.total_reps), 0)::INTEGER as best_session_reps
  FROM camera_workout_sessions cws
  WHERE cws.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para salvar ou atualizar calibração
CREATE OR REPLACE FUNCTION upsert_camera_calibration(
  p_user_id UUID,
  p_exercise_type TEXT,
  p_calibration_data JSONB
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO camera_calibrations (user_id, exercise_type, calibration_data, last_used_at)
  VALUES (p_user_id, p_exercise_type, p_calibration_data, NOW())
  ON CONFLICT (user_id, exercise_type) 
  DO UPDATE SET 
    calibration_data = p_calibration_data,
    last_used_at = NOW()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários nas tabelas
COMMENT ON TABLE camera_workout_sessions IS 'Sessões de treino com câmera usando pose estimation';
COMMENT ON TABLE camera_rep_events IS 'Eventos individuais de repetição durante treino com câmera';
COMMENT ON TABLE camera_posture_events IS 'Eventos de feedback de postura durante treino';
COMMENT ON TABLE camera_metrics IS 'Métricas de performance do sistema de pose estimation';
COMMENT ON TABLE camera_calibrations IS 'Calibrações salvas por usuário e exercício';
