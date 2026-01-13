-- ============================================
-- 🏋️ ADVANCED EXERCISE SYSTEM - DATABASE SCHEMA
-- Sistema de exercícios avançado com IA, gamificação, 
-- progressão inteligente, previsão de lesões e social
-- ============================================

-- ============================================
-- 1. AI ENGINE TABLES
-- ============================================

-- Análise de estado do usuário pela IA
CREATE TABLE IF NOT EXISTS ai_user_state_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  analysis_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Estado atual
  energy_level DECIMAL(3,2) CHECK (energy_level >= 0 AND energy_level <= 1),
  readiness_score DECIMAL(3,2) CHECK (readiness_score >= 0 AND readiness_score <= 1),
  fatigue_level DECIMAL(3,2) CHECK (fatigue_level >= 0 AND fatigue_level <= 1),
  stress_level DECIMAL(3,2) CHECK (stress_level >= 0 AND stress_level <= 1),
  
  -- Fatores contextuais
  time_of_day VARCHAR(20),
  sleep_quality DECIMAL(3,2),
  sleep_hours DECIMAL(4,2),
  
  -- Recomendações da IA
  recommended_intensity VARCHAR(20) CHECK (recommended_intensity IN ('low', 'medium', 'high', 'rest')),
  recommended_duration_minutes INTEGER,
  risk_factors JSONB DEFAULT '[]',
  recommendations TEXT[],
  
  -- Metadados
  model_version VARCHAR(50),
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adaptações de treino pela IA
CREATE TABLE IF NOT EXISTS ai_workout_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_session_id UUID,
  exercise_code VARCHAR(20),
  
  -- Adaptação aplicada
  adaptation_type VARCHAR(50) NOT NULL, -- 'intensity_increase', 'intensity_decrease', 'rest_extension', 'exercise_swap', 'skip'
  original_value JSONB,
  adapted_value JSONB,
  reason TEXT,
  
  -- Trigger da adaptação
  trigger_type VARCHAR(50), -- 'difficulty_rating', 'heart_rate', 'fatigue', 'pain', 'environmental'
  trigger_value JSONB,
  
  -- Feedback do usuário
  user_accepted BOOLEAN,
  user_feedback TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modelo de aprendizado do usuário
CREATE TABLE IF NOT EXISTS ai_user_learning_model (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferências aprendidas
  preferred_workout_times JSONB DEFAULT '[]', -- horários preferidos
  preferred_exercise_types JSONB DEFAULT '[]',
  disliked_exercises TEXT[],
  optimal_rest_times JSONB DEFAULT '{}',
  
  -- Padrões de performance
  performance_patterns JSONB DEFAULT '{}',
  recovery_patterns JSONB DEFAULT '{}',
  fatigue_patterns JSONB DEFAULT '{}',
  
  -- Métricas de aprendizado
  total_feedback_count INTEGER DEFAULT 0,
  model_accuracy DECIMAL(3,2),
  last_model_update TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- 2. GAMIFICATION TABLES
-- ============================================

-- Sistema de pontos do usuário
CREATE TABLE IF NOT EXISTS exercise_gamification_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Pontos totais
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  
  -- Nível e XP
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  
  -- Multiplicadores ativos
  active_multipliers JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Histórico de pontos ganhos
CREATE TABLE IF NOT EXISTS exercise_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  points_earned INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  
  -- Fonte dos pontos
  source_type VARCHAR(50) NOT NULL, -- 'workout_complete', 'streak', 'personal_record', 'challenge', 'social', 'achievement'
  source_id UUID,
  source_details JSONB,
  
  -- Multiplicadores aplicados
  base_points INTEGER,
  multiplier DECIMAL(4,2) DEFAULT 1.0,
  bonus_points INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conquistas/Achievements
CREATE TABLE IF NOT EXISTS exercise_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Definição da conquista
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  
  -- Categoria e raridade
  category VARCHAR(50) NOT NULL, -- 'consistency', 'strength', 'endurance', 'social', 'milestone', 'special'
  rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  
  -- Recompensas
  points_reward INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 0,
  unlocks JSONB, -- exercícios ou programas desbloqueados
  
  -- Critérios para desbloquear
  unlock_criteria JSONB NOT NULL,
  
  -- Metadados
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conquistas desbloqueadas pelo usuário
CREATE TABLE IF NOT EXISTS exercise_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES exercise_achievements(id) ON DELETE CASCADE,
  
  -- Progresso
  progress INTEGER DEFAULT 0,
  max_progress INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  UNIQUE(user_id, achievement_id)
);

-- Streaks de exercício
CREATE TABLE IF NOT EXISTS exercise_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Streak atual
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Datas
  streak_start_date DATE,
  last_workout_date DATE,
  
  -- Histórico de streaks
  streak_history JSONB DEFAULT '[]',
  
  -- Proteção de streak
  freeze_available BOOLEAN DEFAULT false,
  freeze_used_at DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Desafios de exercício
CREATE TABLE IF NOT EXISTS exercise_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Definição do desafio
  title VARCHAR(200) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50) NOT NULL, -- 'individual', 'group', 'weekly', 'monthly', 'special'
  
  -- Período
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Objetivos
  goal_type VARCHAR(50) NOT NULL, -- 'workouts', 'minutes', 'calories', 'exercises', 'points'
  goal_value INTEGER NOT NULL,
  
  -- Recompensas
  points_reward INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 0,
  badge_reward UUID,
  
  -- Dificuldade progressiva
  difficulty_level INTEGER DEFAULT 1,
  min_level_required INTEGER DEFAULT 1,
  
  -- Metadados
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participação em desafios
CREATE TABLE IF NOT EXISTS exercise_challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES exercise_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Progresso
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  
  -- Ranking
  rank_position INTEGER,
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  UNIQUE(challenge_id, user_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS exercise_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de leaderboard
  leaderboard_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time', 'friends'
  period_start DATE,
  period_end DATE,
  
  -- Rankings (armazenados como JSONB para performance)
  rankings JSONB DEFAULT '[]',
  
  -- Metadados
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PROGRESSION ENGINE TABLES
-- ============================================

-- Performance por exercício
CREATE TABLE IF NOT EXISTS exercise_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_code VARCHAR(20) NOT NULL,
  workout_session_id UUID,
  
  -- Métricas de performance
  weight_kg DECIMAL(6,2),
  reps_completed INTEGER,
  sets_completed INTEGER,
  duration_seconds INTEGER,
  rest_time_seconds INTEGER,
  
  -- Ratings subjetivos
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  fatigue_level INTEGER CHECK (fatigue_level >= 1 AND fatigue_level <= 10),
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
  
  -- Dados biométricos (se disponíveis)
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  calories_burned INTEGER,
  
  -- Fatores ambientais
  time_of_day VARCHAR(20),
  environmental_factors JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nível de progressão por exercício
CREATE TABLE IF NOT EXISTS exercise_progression_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_code VARCHAR(20) NOT NULL,
  
  -- Nível atual
  current_level INTEGER DEFAULT 1,
  current_difficulty DECIMAL(4,2) DEFAULT 1.0,
  
  -- Histórico de progressão
  progression_history JSONB DEFAULT '[]',
  
  -- Métricas de capacidade
  estimated_1rm DECIMAL(6,2), -- 1 rep max estimado
  max_reps_achieved INTEGER,
  max_weight_achieved DECIMAL(6,2),
  
  -- Detecção de platô
  plateau_detected BOOLEAN DEFAULT false,
  plateau_start_date DATE,
  plateau_interventions JSONB DEFAULT '[]',
  
  -- Timestamps
  last_progression_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, exercise_code)
);

-- Balanço muscular
CREATE TABLE IF NOT EXISTS exercise_muscle_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Progressão por grupo muscular
  muscle_group_progress JSONB DEFAULT '{}',
  -- Exemplo: {"peito": 75, "costas": 80, "pernas": 65, "ombros": 70, "bracos": 72}
  
  -- Desequilíbrios detectados
  imbalances_detected JSONB DEFAULT '[]',
  -- Exemplo: [{"weak": "pernas", "strong": "costas", "ratio": 0.81, "severity": "moderate"}]
  
  -- Recomendações de correção
  correction_recommendations JSONB DEFAULT '[]',
  
  -- Timestamps
  last_analysis_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- 4. INJURY PREDICTOR TABLES
-- ============================================

-- Avaliação de risco de lesão
CREATE TABLE IF NOT EXISTS injury_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Score de risco geral
  overall_risk_score DECIMAL(3,2) CHECK (overall_risk_score >= 0 AND overall_risk_score <= 1),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  
  -- Riscos específicos
  specific_risks JSONB DEFAULT '[]',
  -- Exemplo: [{"area": "joelho", "risk": 0.7, "factors": ["overtraining", "imbalance"]}]
  
  -- Fatores de risco identificados
  risk_factors JSONB DEFAULT '[]',
  
  -- Recomendações preventivas
  prevention_recommendations JSONB DEFAULT '[]',
  
  -- Ações automáticas tomadas
  automatic_interventions JSONB DEFAULT '[]',
  
  -- Metadados
  assessment_type VARCHAR(50), -- 'scheduled', 'triggered', 'manual'
  model_version VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relatórios de dor/desconforto
CREATE TABLE IF NOT EXISTS pain_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Localização e intensidade
  body_area VARCHAR(50) NOT NULL,
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 10),
  pain_type VARCHAR(50), -- 'sharp', 'dull', 'burning', 'aching', 'throbbing'
  
  -- Contexto
  occurred_during VARCHAR(50), -- 'exercise', 'rest', 'daily_activity'
  related_exercise_code VARCHAR(20),
  workout_session_id UUID,
  
  -- Descrição
  description TEXT,
  
  -- Duração
  duration_minutes INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  
  -- Ações tomadas
  actions_taken TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Padrões de overtraining
CREATE TABLE IF NOT EXISTS overtraining_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Indicadores de overtraining
  training_load_7d DECIMAL(8,2), -- carga de treino últimos 7 dias
  training_load_28d DECIMAL(8,2), -- carga de treino últimos 28 dias
  acute_chronic_ratio DECIMAL(4,2), -- razão agudo/crônico
  
  -- Sinais de overtraining
  performance_decline BOOLEAN DEFAULT false,
  increased_fatigue BOOLEAN DEFAULT false,
  sleep_disruption BOOLEAN DEFAULT false,
  mood_changes BOOLEAN DEFAULT false,
  
  -- Status
  overtraining_detected BOOLEAN DEFAULT false,
  severity VARCHAR(20), -- 'mild', 'moderate', 'severe'
  
  -- Intervenções sugeridas
  suggested_interventions JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados holísticos de saúde
CREATE TABLE IF NOT EXISTS holistic_health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_date DATE NOT NULL,
  
  -- Sono
  sleep_hours DECIMAL(4,2),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  
  -- Estresse
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  
  -- Nutrição
  nutrition_quality INTEGER CHECK (nutrition_quality >= 1 AND nutrition_quality <= 10),
  hydration_ml INTEGER,
  protein_g DECIMAL(6,2),
  
  -- Recuperação
  recovery_score INTEGER CHECK (recovery_score >= 1 AND recovery_score <= 100),
  soreness_level INTEGER CHECK (soreness_level >= 1 AND soreness_level <= 10),
  
  -- Energia
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, tracking_date)
);

-- ============================================
-- 5. SOCIAL HUB TABLES
-- ============================================

-- Grupos de treino
CREATE TABLE IF NOT EXISTS workout_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações do grupo
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  
  -- Configurações
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 50,
  
  -- Estatísticas
  total_workouts INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  
  -- Metadados
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros do grupo
CREATE TABLE IF NOT EXISTS workout_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES workout_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role no grupo
  role VARCHAR(20) DEFAULT 'member', -- 'owner', 'admin', 'member'
  
  -- Estatísticas do membro no grupo
  workouts_completed INTEGER DEFAULT 0,
  points_contributed INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- Desafios de grupo
CREATE TABLE IF NOT EXISTS group_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES workout_groups(id) ON DELETE CASCADE,
  
  -- Definição do desafio
  title VARCHAR(200) NOT NULL,
  description TEXT,
  goal_type VARCHAR(50) NOT NULL,
  goal_value INTEGER NOT NULL,
  
  -- Período
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Progresso
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  
  -- Recompensas
  rewards JSONB,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout buddy matching
CREATE TABLE IF NOT EXISTS workout_buddy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferências de matching
  fitness_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced', 'expert'
  preferred_workout_times JSONB DEFAULT '[]',
  preferred_workout_types JSONB DEFAULT '[]',
  goals JSONB DEFAULT '[]',
  
  -- Localização (opcional)
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  
  -- Disponibilidade
  is_looking_for_buddy BOOLEAN DEFAULT true,
  
  -- Estatísticas
  total_buddy_workouts INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Conexões de buddy
CREATE TABLE IF NOT EXISTS workout_buddy_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Status da conexão
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'blocked'
  
  -- Compatibilidade
  compatibility_score DECIMAL(3,2),
  
  -- Estatísticas
  workouts_together INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, buddy_id)
);

-- Mensagens de encorajamento
CREATE TABLE IF NOT EXISTS workout_encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Conteúdo
  message_type VARCHAR(50), -- 'cheer', 'congratulation', 'motivation', 'custom'
  message TEXT,
  emoji VARCHAR(10),
  
  -- Contexto
  related_workout_id UUID,
  related_achievement_id UUID,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. PERFORMANCE DASHBOARD TABLES
-- ============================================

-- Estatísticas agregadas do usuário
CREATE TABLE IF NOT EXISTS exercise_user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Totais
  total_workouts INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  total_calories_burned INTEGER DEFAULT 0,
  
  -- Médias
  avg_workout_duration_minutes DECIMAL(6,2),
  avg_difficulty_rating DECIMAL(3,2),
  avg_enjoyment_rating DECIMAL(3,2),
  
  -- Records pessoais
  personal_records JSONB DEFAULT '{}',
  
  -- Consistência
  consistency_score DECIMAL(3,2),
  workouts_this_week INTEGER DEFAULT 0,
  workouts_this_month INTEGER DEFAULT 0,
  
  -- Força e resistência
  strength_score DECIMAL(5,2),
  endurance_score DECIMAL(5,2),
  
  -- Timestamps
  last_workout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Insights gerados pela IA
CREATE TABLE IF NOT EXISTS exercise_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de insight
  insight_type VARCHAR(50) NOT NULL, -- 'pattern', 'recommendation', 'milestone', 'warning', 'tip'
  category VARCHAR(50), -- 'performance', 'consistency', 'recovery', 'nutrition', 'social'
  
  -- Conteúdo
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  action_items JSONB DEFAULT '[]',
  
  -- Prioridade e relevância
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  relevance_score DECIMAL(3,2),
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  is_acted_upon BOOLEAN DEFAULT false,
  
  -- Validade
  valid_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Previsões de metas
CREATE TABLE IF NOT EXISTS goal_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Meta
  goal_type VARCHAR(50) NOT NULL, -- 'weight_loss', 'strength', 'endurance', 'consistency', 'custom'
  goal_description TEXT,
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  
  -- Previsão
  predicted_completion_date DATE,
  confidence_level DECIMAL(3,2),
  
  -- Fatores que afetam a previsão
  positive_factors JSONB DEFAULT '[]',
  negative_factors JSONB DEFAULT '[]',
  
  -- Recomendações para acelerar
  acceleration_tips JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Benchmarks comparativos
CREATE TABLE IF NOT EXISTS exercise_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Segmentação
  age_group VARCHAR(20), -- '18-25', '26-35', '36-45', '46-55', '56+'
  gender VARCHAR(20),
  fitness_level VARCHAR(20),
  
  -- Métricas de benchmark
  exercise_code VARCHAR(20),
  metric_type VARCHAR(50), -- 'avg_weight', 'avg_reps', 'avg_duration', 'completion_rate'
  
  -- Valores estatísticos
  percentile_25 DECIMAL(10,2),
  percentile_50 DECIMAL(10,2),
  percentile_75 DECIMAL(10,2),
  percentile_90 DECIMAL(10,2),
  
  -- Metadados
  sample_size INTEGER,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. NOTIFICATION SYSTEM TABLES
-- ============================================

-- Notificações de exercício
CREATE TABLE IF NOT EXISTS exercise_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo e categoria
  notification_type VARCHAR(50) NOT NULL, -- 'reminder', 'achievement', 'social', 'insight', 'alert', 'motivation'
  category VARCHAR(50),
  
  -- Conteúdo
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  icon VARCHAR(50),
  action_url TEXT,
  action_data JSONB,
  
  -- Prioridade
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Agendamento
  scheduled_for TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preferências de notificação
CREATE TABLE IF NOT EXISTS exercise_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipos de notificação habilitados
  workout_reminders BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  social_notifications BOOLEAN DEFAULT true,
  insight_notifications BOOLEAN DEFAULT true,
  injury_alerts BOOLEAN DEFAULT true,
  motivation_messages BOOLEAN DEFAULT true,
  
  -- Horários preferidos
  preferred_reminder_times JSONB DEFAULT '[]',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  -- Frequência
  max_daily_notifications INTEGER DEFAULT 10,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- 8. FEEDBACK AND LEARNING TABLES
-- ============================================

-- Feedback de exercícios
CREATE TABLE IF NOT EXISTS exercise_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contexto
  exercise_code VARCHAR(20),
  workout_session_id UUID,
  
  -- Ratings
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
  
  -- Feedback textual
  comments TEXT,
  
  -- Ações do usuário
  was_skipped BOOLEAN DEFAULT false,
  was_modified BOOLEAN DEFAULT false,
  modification_details JSONB,
  
  -- Sugestões
  would_do_again BOOLEAN,
  suggested_changes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Testing de treinos
CREATE TABLE IF NOT EXISTS workout_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Definição do teste
  test_name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Variantes
  variant_a JSONB NOT NULL,
  variant_b JSONB NOT NULL,
  
  -- Métricas de sucesso
  success_metric VARCHAR(50), -- 'completion_rate', 'enjoyment', 'effectiveness'
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  
  -- Resultados
  variant_a_participants INTEGER DEFAULT 0,
  variant_b_participants INTEGER DEFAULT 0,
  variant_a_success_rate DECIMAL(5,4),
  variant_b_success_rate DECIMAL(5,4),
  winner VARCHAR(10),
  
  -- Período
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participação em A/B tests
CREATE TABLE IF NOT EXISTS workout_ab_test_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES workout_ab_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Variante atribuída
  assigned_variant VARCHAR(10) NOT NULL, -- 'A' ou 'B'
  
  -- Resultado
  completed BOOLEAN DEFAULT false,
  success_value DECIMAL(10,4),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(test_id, user_id)
);

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================

-- AI Engine indexes
CREATE INDEX IF NOT EXISTS idx_ai_user_state_user_id ON ai_user_state_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_user_state_timestamp ON ai_user_state_analysis(analysis_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_workout_adaptations_user_id ON ai_workout_adaptations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workout_adaptations_session ON ai_workout_adaptations(workout_session_id);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_exercise_points_history_user_id ON exercise_points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_points_history_created ON exercise_points_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_user_achievements_user_id ON exercise_user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_challenge_participants_user ON exercise_challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_challenge_participants_challenge ON exercise_challenge_participants(challenge_id);

-- Progression indexes
CREATE INDEX IF NOT EXISTS idx_exercise_performance_user_exercise ON exercise_performance_metrics(user_id, exercise_code);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_created ON exercise_performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_progression_user_exercise ON exercise_progression_levels(user_id, exercise_code);

-- Injury predictor indexes
CREATE INDEX IF NOT EXISTS idx_injury_risk_user_id ON injury_risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_injury_risk_created ON injury_risk_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pain_reports_user_id ON pain_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_pain_reports_body_area ON pain_reports(body_area);
CREATE INDEX IF NOT EXISTS idx_holistic_health_user_date ON holistic_health_data(user_id, tracking_date);

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_workout_group_members_group ON workout_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_workout_group_members_user ON workout_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_buddy_connections_user ON workout_buddy_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_encouragements_to_user ON workout_encouragements(to_user_id);

-- Dashboard indexes
CREATE INDEX IF NOT EXISTS idx_exercise_insights_user_id ON exercise_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_insights_type ON exercise_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_goal_predictions_user_id ON goal_predictions(user_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_exercise_notifications_user_id ON exercise_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_notifications_unread ON exercise_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_exercise_notifications_scheduled ON exercise_notifications(scheduled_for) WHERE is_sent = false;

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_user_id ON exercise_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_exercise ON exercise_feedback(exercise_code);

-- ============================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE ai_user_state_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workout_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_learning_model ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_progression_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_muscle_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE injury_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtraining_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE holistic_health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_buddy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_buddy_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_encouragements ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_ab_test_participants ENABLE ROW LEVEL SECURITY;

-- User-specific data policies (users can only see their own data)
CREATE POLICY "Users can view own ai_user_state_analysis" ON ai_user_state_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_user_state_analysis" ON ai_user_state_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own ai_workout_adaptations" ON ai_workout_adaptations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_workout_adaptations" ON ai_workout_adaptations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai_workout_adaptations" ON ai_workout_adaptations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own ai_user_learning_model" ON ai_user_learning_model FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercise_gamification_points" ON exercise_gamification_points FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own exercise_points_history" ON exercise_points_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercise_points_history" ON exercise_points_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements are public to view
CREATE POLICY "Anyone can view exercise_achievements" ON exercise_achievements FOR SELECT USING (true);
CREATE POLICY "Users can manage own exercise_user_achievements" ON exercise_user_achievements FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercise_streaks" ON exercise_streaks FOR ALL USING (auth.uid() = user_id);

-- Challenges are public to view
CREATE POLICY "Anyone can view active exercise_challenges" ON exercise_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own exercise_challenge_participants" ON exercise_challenge_participants FOR ALL USING (auth.uid() = user_id);

-- Leaderboards are public
CREATE POLICY "Anyone can view exercise_leaderboards" ON exercise_leaderboards FOR SELECT USING (true);

CREATE POLICY "Users can manage own exercise_performance_metrics" ON exercise_performance_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exercise_progression_levels" ON exercise_progression_levels FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exercise_muscle_balance" ON exercise_muscle_balance FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own injury_risk_assessments" ON injury_risk_assessments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own pain_reports" ON pain_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own overtraining_patterns" ON overtraining_patterns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own holistic_health_data" ON holistic_health_data FOR ALL USING (auth.uid() = user_id);

-- Social policies
CREATE POLICY "Anyone can view public workout_groups" ON workout_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Members can view their workout_groups" ON workout_groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM workout_group_members WHERE group_id = workout_groups.id AND user_id = auth.uid())
);
CREATE POLICY "Users can create workout_groups" ON workout_groups FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view workout_group_members of their groups" ON workout_group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM workout_group_members wgm WHERE wgm.group_id = workout_group_members.group_id AND wgm.user_id = auth.uid())
);
CREATE POLICY "Users can join workout_groups" ON workout_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout_buddy_profiles" ON workout_buddy_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public workout_buddy_profiles" ON workout_buddy_profiles FOR SELECT USING (is_looking_for_buddy = true);

CREATE POLICY "Users can manage own workout_buddy_connections" ON workout_buddy_connections FOR ALL USING (auth.uid() = user_id OR auth.uid() = buddy_id);

CREATE POLICY "Users can view encouragements sent to them" ON workout_encouragements FOR SELECT USING (auth.uid() = to_user_id);
CREATE POLICY "Users can send encouragements" ON workout_encouragements FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can manage own exercise_user_statistics" ON exercise_user_statistics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exercise_insights" ON exercise_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goal_predictions" ON goal_predictions FOR ALL USING (auth.uid() = user_id);

-- Benchmarks are public
CREATE POLICY "Anyone can view exercise_benchmarks" ON exercise_benchmarks FOR SELECT USING (true);

CREATE POLICY "Users can manage own exercise_notifications" ON exercise_notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exercise_notification_preferences" ON exercise_notification_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercise_feedback" ON exercise_feedback FOR ALL USING (auth.uid() = user_id);

-- A/B tests are managed by system
CREATE POLICY "Anyone can view active workout_ab_tests" ON workout_ab_tests FOR SELECT USING (status = 'active');
CREATE POLICY "Users can manage own workout_ab_test_participants" ON workout_ab_test_participants FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 11. HELPER FUNCTIONS
-- ============================================

-- Função para calcular pontos de treino
CREATE OR REPLACE FUNCTION calculate_workout_points(
  p_user_id UUID,
  p_workout_duration_minutes INTEGER,
  p_exercises_completed INTEGER,
  p_difficulty_avg DECIMAL,
  p_is_streak_day BOOLEAN DEFAULT false
)
RETURNS TABLE(
  base_points INTEGER,
  bonus_points INTEGER,
  multiplier DECIMAL,
  total_points INTEGER
) AS $$
DECLARE
  v_base_points INTEGER;
  v_bonus_points INTEGER := 0;
  v_multiplier DECIMAL := 1.0;
  v_streak_days INTEGER;
BEGIN
  -- Pontos base: 10 por exercício + 1 por minuto
  v_base_points := (p_exercises_completed * 10) + p_workout_duration_minutes;
  
  -- Bônus por dificuldade alta
  IF p_difficulty_avg >= 7 THEN
    v_bonus_points := v_bonus_points + 20;
  END IF;
  
  -- Multiplicador de streak
  IF p_is_streak_day THEN
    SELECT current_streak INTO v_streak_days
    FROM exercise_streaks
    WHERE user_id = p_user_id;
    
    IF v_streak_days >= 7 THEN
      v_multiplier := 1.5;
    ELSIF v_streak_days >= 3 THEN
      v_multiplier := 1.25;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    v_base_points,
    v_bonus_points,
    v_multiplier,
    FLOOR((v_base_points + v_bonus_points) * v_multiplier)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar streak
CREATE OR REPLACE FUNCTION update_exercise_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_workout DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Buscar dados atuais
  SELECT last_workout_date, current_streak, longest_streak
  INTO v_last_workout, v_current_streak, v_longest_streak
  FROM exercise_streaks
  WHERE user_id = p_user_id;
  
  -- Se não existe registro, criar
  IF NOT FOUND THEN
    INSERT INTO exercise_streaks (user_id, current_streak, longest_streak, streak_start_date, last_workout_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE, CURRENT_DATE);
    RETURN;
  END IF;
  
  -- Verificar se é dia consecutivo
  IF v_last_workout = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continua streak
    v_current_streak := v_current_streak + 1;
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
  ELSIF v_last_workout < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Quebrou streak
    v_current_streak := 1;
  END IF;
  -- Se v_last_workout = CURRENT_DATE, não faz nada (já treinou hoje)
  
  -- Atualizar
  UPDATE exercise_streaks
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_workout_date = CURRENT_DATE,
    streak_start_date = CASE 
      WHEN v_current_streak = 1 THEN CURRENT_DATE 
      ELSE streak_start_date 
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar conquistas
CREATE OR REPLACE FUNCTION check_exercise_achievements(p_user_id UUID)
RETURNS SETOF exercise_achievements AS $$
DECLARE
  v_achievement RECORD;
  v_criteria JSONB;
  v_met BOOLEAN;
  v_user_stats RECORD;
  v_streak INTEGER;
BEGIN
  -- Buscar estatísticas do usuário
  SELECT * INTO v_user_stats FROM exercise_user_statistics WHERE user_id = p_user_id;
  SELECT current_streak INTO v_streak FROM exercise_streaks WHERE user_id = p_user_id;
  
  -- Verificar cada conquista não desbloqueada
  FOR v_achievement IN 
    SELECT ea.* FROM exercise_achievements ea
    LEFT JOIN exercise_user_achievements eua ON ea.id = eua.achievement_id AND eua.user_id = p_user_id
    WHERE eua.id IS NULL OR eua.is_completed = false
  LOOP
    v_criteria := v_achievement.unlock_criteria;
    v_met := false;
    
    -- Verificar critérios baseados no tipo
    IF v_criteria->>'type' = 'streak' THEN
      v_met := COALESCE(v_streak, 0) >= (v_criteria->>'value')::INTEGER;
    ELSIF v_criteria->>'type' = 'total_workouts' THEN
      v_met := COALESCE(v_user_stats.total_workouts, 0) >= (v_criteria->>'value')::INTEGER;
    ELSIF v_criteria->>'type' = 'total_exercises' THEN
      v_met := COALESCE(v_user_stats.total_exercises, 0) >= (v_criteria->>'value')::INTEGER;
    END IF;
    
    IF v_met THEN
      -- Desbloquear conquista
      INSERT INTO exercise_user_achievements (user_id, achievement_id, progress, max_progress, is_completed, completed_at)
      VALUES (p_user_id, v_achievement.id, 1, 1, true, NOW())
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET is_completed = true, completed_at = NOW();
      
      -- Adicionar pontos
      INSERT INTO exercise_points_history (user_id, points_earned, xp_earned, source_type, source_id)
      VALUES (p_user_id, v_achievement.points_reward, v_achievement.xp_reward, 'achievement', v_achievement.id);
      
      RETURN NEXT v_achievement;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular risco de lesão
CREATE OR REPLACE FUNCTION calculate_injury_risk(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_risk DECIMAL := 0;
  v_training_load_7d DECIMAL;
  v_training_load_28d DECIMAL;
  v_acr DECIMAL;
  v_pain_count INTEGER;
  v_sleep_avg DECIMAL;
BEGIN
  -- Calcular carga de treino (últimos 7 dias)
  SELECT COALESCE(SUM(duration_seconds * difficulty_rating / 60.0), 0)
  INTO v_training_load_7d
  FROM exercise_performance_metrics
  WHERE user_id = p_user_id AND created_at >= NOW() - INTERVAL '7 days';
  
  -- Calcular carga de treino (últimos 28 dias)
  SELECT COALESCE(SUM(duration_seconds * difficulty_rating / 60.0), 0) / 4
  INTO v_training_load_28d
  FROM exercise_performance_metrics
  WHERE user_id = p_user_id AND created_at >= NOW() - INTERVAL '28 days';
  
  -- Calcular ACR (Acute:Chronic Ratio)
  IF v_training_load_28d > 0 THEN
    v_acr := v_training_load_7d / v_training_load_28d;
  ELSE
    v_acr := 1;
  END IF;
  
  -- Risco baseado em ACR (ideal entre 0.8 e 1.3)
  IF v_acr > 1.5 THEN
    v_risk := v_risk + 0.4;
  ELSIF v_acr > 1.3 THEN
    v_risk := v_risk + 0.2;
  ELSIF v_acr < 0.8 THEN
    v_risk := v_risk + 0.1; -- Destreinamento também é risco
  END IF;
  
  -- Contar relatórios de dor recentes
  SELECT COUNT(*) INTO v_pain_count
  FROM pain_reports
  WHERE user_id = p_user_id AND created_at >= NOW() - INTERVAL '7 days';
  
  IF v_pain_count >= 3 THEN
    v_risk := v_risk + 0.3;
  ELSIF v_pain_count >= 1 THEN
    v_risk := v_risk + 0.15;
  END IF;
  
  -- Verificar qualidade do sono
  SELECT AVG(sleep_quality) INTO v_sleep_avg
  FROM holistic_health_data
  WHERE user_id = p_user_id AND tracking_date >= CURRENT_DATE - INTERVAL '7 days';
  
  IF v_sleep_avg IS NOT NULL AND v_sleep_avg < 5 THEN
    v_risk := v_risk + 0.15;
  END IF;
  
  -- Limitar entre 0 e 1
  RETURN LEAST(GREATEST(v_risk, 0), 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. SEED DATA - DEFAULT ACHIEVEMENTS
-- ============================================

INSERT INTO exercise_achievements (code, name, description, icon, category, rarity, points_reward, xp_reward, unlock_criteria) VALUES
-- Conquistas de Consistência
('streak_3', 'Iniciante Dedicado', 'Complete 3 dias consecutivos de treino', '🔥', 'consistency', 'common', 50, 25, '{"type": "streak", "value": 3}'),
('streak_7', 'Semana Perfeita', 'Complete 7 dias consecutivos de treino', '⭐', 'consistency', 'rare', 150, 75, '{"type": "streak", "value": 7}'),
('streak_14', 'Duas Semanas Fortes', 'Complete 14 dias consecutivos de treino', '💪', 'consistency', 'rare', 300, 150, '{"type": "streak", "value": 14}'),
('streak_30', 'Mês de Ferro', 'Complete 30 dias consecutivos de treino', '🏆', 'consistency', 'epic', 500, 250, '{"type": "streak", "value": 30}'),
('streak_100', 'Centurião', 'Complete 100 dias consecutivos de treino', '👑', 'consistency', 'legendary', 1000, 500, '{"type": "streak", "value": 100}'),

-- Conquistas de Volume
('workouts_10', 'Primeiros Passos', 'Complete 10 treinos', '🎯', 'milestone', 'common', 100, 50, '{"type": "total_workouts", "value": 10}'),
('workouts_50', 'Meio Centenário', 'Complete 50 treinos', '🎖️', 'milestone', 'rare', 250, 125, '{"type": "total_workouts", "value": 50}'),
('workouts_100', 'Centenário', 'Complete 100 treinos', '🥇', 'milestone', 'epic', 500, 250, '{"type": "total_workouts", "value": 100}'),
('workouts_500', 'Veterano', 'Complete 500 treinos', '🏅', 'milestone', 'legendary', 1000, 500, '{"type": "total_workouts", "value": 500}'),

-- Conquistas de Exercícios
('exercises_100', 'Explorador', 'Complete 100 exercícios diferentes', '🗺️', 'milestone', 'common', 75, 40, '{"type": "total_exercises", "value": 100}'),
('exercises_500', 'Aventureiro', 'Complete 500 exercícios', '🧭', 'milestone', 'rare', 200, 100, '{"type": "total_exercises", "value": 500}'),
('exercises_1000', 'Mestre dos Exercícios', 'Complete 1000 exercícios', '🎓', 'milestone', 'epic', 400, 200, '{"type": "total_exercises", "value": 1000}'),

-- Conquistas Sociais
('first_group', 'Espírito de Equipe', 'Entre em seu primeiro grupo de treino', '👥', 'social', 'common', 50, 25, '{"type": "join_group", "value": 1}'),
('first_buddy', 'Parceiro de Treino', 'Conecte-se com seu primeiro buddy', '🤝', 'social', 'common', 50, 25, '{"type": "buddy_connection", "value": 1}'),
('encourager', 'Motivador', 'Envie 10 mensagens de encorajamento', '💬', 'social', 'rare', 100, 50, '{"type": "encouragements_sent", "value": 10}'),

-- Conquistas Especiais
('early_bird', 'Madrugador', 'Complete 5 treinos antes das 7h', '🌅', 'special', 'rare', 150, 75, '{"type": "early_workouts", "value": 5}'),
('night_owl', 'Coruja', 'Complete 5 treinos após as 21h', '🌙', 'special', 'rare', 150, 75, '{"type": "late_workouts", "value": 5}'),
('weekend_warrior', 'Guerreiro de Fim de Semana', 'Complete 10 treinos no fim de semana', '⚔️', 'special', 'rare', 150, 75, '{"type": "weekend_workouts", "value": 10}')

ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 13. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas relevantes
CREATE TRIGGER update_ai_user_learning_model_updated_at
  BEFORE UPDATE ON ai_user_learning_model
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_gamification_points_updated_at
  BEFORE UPDATE ON exercise_gamification_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_streaks_updated_at
  BEFORE UPDATE ON exercise_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_progression_levels_updated_at
  BEFORE UPDATE ON exercise_progression_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_muscle_balance_updated_at
  BEFORE UPDATE ON exercise_muscle_balance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_groups_updated_at
  BEFORE UPDATE ON workout_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_buddy_profiles_updated_at
  BEFORE UPDATE ON workout_buddy_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_buddy_connections_updated_at
  BEFORE UPDATE ON workout_buddy_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_user_statistics_updated_at
  BEFORE UPDATE ON exercise_user_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goal_predictions_updated_at
  BEFORE UPDATE ON goal_predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_notification_preferences_updated_at
  BEFORE UPDATE ON exercise_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Total de tabelas criadas: 32
-- Total de índices criados: 25
-- Total de políticas RLS: 40+
-- Total de funções: 4
-- Total de triggers: 11
-- Conquistas padrão: 17
