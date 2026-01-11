-- =====================================================
-- SISTEMA DE DESAFIOS V2 - ARQUITETURA ESCALÁVEL
-- =====================================================

-- 1. ENUM TYPES
-- =====================================================

-- Tipo de liga
DO $$ BEGIN
  CREATE TYPE league_tier AS ENUM ('bronze', 'silver', 'gold', 'diamond', 'master');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipo de power-up
DO $$ BEGIN
  CREATE TYPE powerup_type AS ENUM ('shield', 'time_extend', 'xp_boost', 'skip_day', 'combo_freeze');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status do duelo
DO $$ BEGIN
  CREATE TYPE duel_status AS ENUM ('pending', 'active', 'completed', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipo de desafio expandido
DO $$ BEGIN
  CREATE TYPE challenge_mode AS ENUM ('individual', 'flash', 'journey', 'team', 'duel', 'event');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. TABELA: challenge_journeys (Jornadas Épicas)
-- =====================================================
CREATE TABLE IF NOT EXISTS challenge_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  total_checkpoints INTEGER NOT NULL DEFAULT 7,
  boss_days INTEGER[] DEFAULT ARRAY[5, 7],
  journey_map JSONB NOT NULL DEFAULT '[]'::jsonb,
  story_intro TEXT,
  story_completion TEXT,
  theme VARCHAR(50) DEFAULT 'adventure',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA: user_leagues (Sistema de Ligas Semanais)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_league league_tier NOT NULL DEFAULT 'bronze',
  weekly_xp INTEGER NOT NULL DEFAULT 0,
  rank_position INTEGER,
  highest_league league_tier DEFAULT 'bronze',
  weeks_in_current_league INTEGER DEFAULT 0,
  total_promotions INTEGER DEFAULT 0,
  total_demotions INTEGER DEFAULT 0,
  week_start DATE NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::date,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Índices para user_leagues
CREATE INDEX IF NOT EXISTS idx_user_leagues_user ON user_leagues(user_id);
CREATE INDEX IF NOT EXISTS idx_user_leagues_league ON user_leagues(current_league);
CREATE INDEX IF NOT EXISTS idx_user_leagues_weekly_xp ON user_leagues(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_leagues_week ON user_leagues(week_start);

-- 4. TABELA: challenge_duels (Duelos 1v1)
-- =====================================================
CREATE TABLE IF NOT EXISTS challenge_duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'unidade',
  challenger_progress INTEGER DEFAULT 0,
  opponent_progress INTEGER DEFAULT 0,
  status duel_status NOT NULL DEFAULT 'pending',
  winner_id UUID REFERENCES auth.users(id),
  xp_reward INTEGER NOT NULL DEFAULT 200,
  badge_reward VARCHAR(100),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_players CHECK (challenger_id != opponent_id)
);

-- Índices para challenge_duels
CREATE INDEX IF NOT EXISTS idx_duels_challenger ON challenge_duels(challenger_id);
CREATE INDEX IF NOT EXISTS idx_duels_opponent ON challenge_duels(opponent_id);
CREATE INDEX IF NOT EXISTS idx_duels_status ON challenge_duels(status);
CREATE INDEX IF NOT EXISTS idx_duels_ends_at ON challenge_duels(ends_at);

-- 5. TABELA: challenge_teams (Times/Clãs)
-- =====================================================
CREATE TABLE IF NOT EXISTS challenge_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_emoji VARCHAR(10) DEFAULT '👥',
  color VARCHAR(7) DEFAULT '#3B82F6',
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 10,
  is_public BOOLEAN DEFAULT true,
  invite_code VARCHAR(20) UNIQUE,
  total_xp BIGINT DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  current_rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros do time
CREATE TABLE IF NOT EXISTS challenge_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES challenge_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  contribution_xp INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Índices para teams
CREATE INDEX IF NOT EXISTS idx_teams_leader ON challenge_teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON challenge_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON challenge_team_members(user_id);

-- 6. TABELA: team_challenges (Desafios de Time)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES challenge_teams(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  current_progress INTEGER DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'unidade',
  total_xp_reward INTEGER DEFAULT 500,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contribuições individuais
CREATE TABLE IF NOT EXISTS team_challenge_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_challenge_id UUID NOT NULL REFERENCES team_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_value INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_challenge_id, user_id)
);

-- 7. TABELA: user_powerups (Power-ups do Usuário)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_powerups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  powerup_type powerup_type NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, powerup_type)
);

-- Histórico de uso
CREATE TABLE IF NOT EXISTS powerup_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  powerup_type powerup_type NOT NULL,
  used_on_challenge_id UUID REFERENCES challenges(id),
  used_on_duel_id UUID REFERENCES challenge_duels(id),
  effect_description TEXT,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA: seasonal_events (Eventos Sazonais)
-- =====================================================
CREATE TABLE IF NOT EXISTS seasonal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  theme VARCHAR(50) NOT NULL,
  banner_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#EC4899',
  secondary_color VARCHAR(7) DEFAULT '#F97316',
  emoji VARCHAR(10) DEFAULT '🎉',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  exclusive_rewards JSONB DEFAULT '[]'::jsonb,
  total_challenges INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participação em eventos
CREATE TABLE IF NOT EXISTS event_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES seasonal_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenges_completed INTEGER DEFAULT 0,
  event_xp INTEGER DEFAULT 0,
  rewards_claimed JSONB DEFAULT '[]'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Desafios específicos do evento
CREATE TABLE IF NOT EXISTS event_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES seasonal_events(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  day_number INTEGER,
  is_bonus BOOLEAN DEFAULT false,
  bonus_xp INTEGER DEFAULT 0,
  UNIQUE(event_id, challenge_id)
);

-- 9. TABELA: flash_challenges (Desafios Relâmpago)
-- =====================================================
CREATE TABLE IF NOT EXISTS flash_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  emoji VARCHAR(10) DEFAULT '⚡',
  challenge_type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  unit VARCHAR(20) DEFAULT 'unidade',
  xp_reward INTEGER NOT NULL DEFAULT 150,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.5,
  duration_hours INTEGER NOT NULL DEFAULT 2,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participação em flash challenges
CREATE TABLE IF NOT EXISTS flash_challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flash_challenge_id UUID NOT NULL REFERENCES flash_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(flash_challenge_id, user_id)
);

-- 10. EXPANDIR TABELA challenges EXISTENTE
-- =====================================================
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS challenge_mode challenge_mode DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS combo_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_combo_multiplier DECIMAL(3,2) DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS journey_id UUID REFERENCES challenge_journeys(id),
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES seasonal_events(id),
ADD COLUMN IF NOT EXISTS team_only BOOLEAN DEFAULT false;

-- 11. EXPANDIR challenge_participations
-- =====================================================
ALTER TABLE challenge_participations
ADD COLUMN IF NOT EXISTS combo_multiplier DECIMAL(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS combo_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS powerups_used JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS journey_checkpoint INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS boss_defeated BOOLEAN DEFAULT false;

-- 12. TABELA: user_achievements_v2 (Conquistas Expandidas)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_achievements_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  related_challenge_id UUID REFERENCES challenges(id),
  related_duel_id UUID REFERENCES challenge_duels(id),
  related_event_id UUID REFERENCES seasonal_events(id),
  xp_earned INTEGER DEFAULT 0,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Índices para achievements
CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON user_achievements_v2(achievement_type);

-- 13. FUNCTIONS
-- =====================================================

-- Função para calcular multiplicador de combo
CREATE OR REPLACE FUNCTION calculate_combo_multiplier(consecutive_days INTEGER)
RETURNS DECIMAL(3,2) AS $$
BEGIN
  RETURN LEAST(1.0 + (consecutive_days * 0.25), 3.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para atualizar XP semanal da liga
CREATE OR REPLACE FUNCTION update_league_weekly_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
) RETURNS void AS $$
DECLARE
  v_week_start DATE := date_trunc('week', CURRENT_DATE)::date;
BEGIN
  INSERT INTO user_leagues (user_id, weekly_xp, week_start)
  VALUES (p_user_id, p_xp_amount, v_week_start)
  ON CONFLICT (user_id, week_start) 
  DO UPDATE SET 
    weekly_xp = user_leagues.weekly_xp + p_xp_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Função para verificar e promover/rebaixar ligas
CREATE OR REPLACE FUNCTION process_league_promotions()
RETURNS void AS $$
DECLARE
  v_user RECORD;
  v_rank INTEGER;
BEGIN
  FOR v_user IN 
    SELECT * FROM user_leagues 
    WHERE week_start = date_trunc('week', CURRENT_DATE)::date
    ORDER BY weekly_xp DESC
  LOOP
    SELECT COUNT(*) + 1 INTO v_rank
    FROM user_leagues
    WHERE week_start = v_user.week_start
      AND current_league = v_user.current_league
      AND weekly_xp > v_user.weekly_xp;

    UPDATE user_leagues SET rank_position = v_rank WHERE id = v_user.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Função para finalizar duelo
CREATE OR REPLACE FUNCTION finalize_duel(p_duel_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_duel RECORD;
  v_winner_id UUID;
BEGIN
  SELECT * INTO v_duel FROM challenge_duels WHERE id = p_duel_id;

  IF v_duel IS NULL THEN
    RETURN jsonb_build_object('error', 'Duelo não encontrado');
  END IF;

  IF v_duel.challenger_progress > v_duel.opponent_progress THEN
    v_winner_id := v_duel.challenger_id;
  ELSIF v_duel.opponent_progress > v_duel.challenger_progress THEN
    v_winner_id := v_duel.opponent_id;
  ELSE
    v_winner_id := NULL;
  END IF;

  UPDATE challenge_duels 
  SET status = 'completed', 
      winner_id = v_winner_id,
      updated_at = NOW()
  WHERE id = p_duel_id;

  IF v_winner_id IS NOT NULL THEN
    PERFORM update_league_weekly_xp(v_winner_id, v_duel.xp_reward);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'winner_id', v_winner_id,
    'is_draw', v_winner_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Trigger function para auto-finalizar duelos expirados
CREATE OR REPLACE FUNCTION auto_finalize_expired_duels()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE challenge_duels 
  SET status = 'expired'
  WHERE status = 'active' 
    AND ends_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 14. RLS POLICIES
-- =====================================================

-- user_leagues
ALTER TABLE user_leagues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all leagues" ON user_leagues;
CREATE POLICY "Users can view all leagues" ON user_leagues
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own league" ON user_leagues;
CREATE POLICY "Users can update own league" ON user_leagues
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own league" ON user_leagues;
CREATE POLICY "Users can insert own league" ON user_leagues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- challenge_duels
ALTER TABLE challenge_duels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view duels they participate in" ON challenge_duels;
CREATE POLICY "Users can view duels they participate in" ON challenge_duels
  FOR SELECT USING (auth.uid() IN (challenger_id, opponent_id));

DROP POLICY IF EXISTS "Users can create duels" ON challenge_duels;
CREATE POLICY "Users can create duels" ON challenge_duels
  FOR INSERT WITH CHECK (auth.uid() = challenger_id);

DROP POLICY IF EXISTS "Participants can update duel progress" ON challenge_duels;
CREATE POLICY "Participants can update duel progress" ON challenge_duels
  FOR UPDATE USING (auth.uid() IN (challenger_id, opponent_id));

-- challenge_teams
ALTER TABLE challenge_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public teams" ON challenge_teams;
CREATE POLICY "Anyone can view public teams" ON challenge_teams
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Leaders can update their teams" ON challenge_teams;
CREATE POLICY "Leaders can update their teams" ON challenge_teams
  FOR UPDATE USING (auth.uid() = leader_id);

DROP POLICY IF EXISTS "Authenticated users can create teams" ON challenge_teams;
CREATE POLICY "Authenticated users can create teams" ON challenge_teams
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

-- challenge_team_members
ALTER TABLE challenge_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view team members" ON challenge_team_members;
CREATE POLICY "Users can view team members" ON challenge_team_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join teams" ON challenge_team_members;
CREATE POLICY "Users can join teams" ON challenge_team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave teams" ON challenge_team_members;
CREATE POLICY "Users can leave teams" ON challenge_team_members
  FOR DELETE USING (auth.uid() = user_id);

-- user_powerups
ALTER TABLE user_powerups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own powerups" ON user_powerups;
CREATE POLICY "Users can view own powerups" ON user_powerups
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can use own powerups" ON user_powerups;
CREATE POLICY "Users can use own powerups" ON user_powerups
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert powerups" ON user_powerups;
CREATE POLICY "System can insert powerups" ON user_powerups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- powerup_usage_log
ALTER TABLE powerup_usage_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own powerup usage" ON powerup_usage_log;
CREATE POLICY "Users can view own powerup usage" ON powerup_usage_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log powerup usage" ON powerup_usage_log;
CREATE POLICY "Users can log powerup usage" ON powerup_usage_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- seasonal_events (público)
ALTER TABLE seasonal_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active events" ON seasonal_events;
CREATE POLICY "Anyone can view active events" ON seasonal_events
  FOR SELECT USING (is_active = true);

-- event_participations
ALTER TABLE event_participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own event participation" ON event_participations;
CREATE POLICY "Users can view own event participation" ON event_participations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can join events" ON event_participations;
CREATE POLICY "Users can join events" ON event_participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own participation" ON event_participations;
CREATE POLICY "Users can update own participation" ON event_participations
  FOR UPDATE USING (auth.uid() = user_id);

-- event_challenges
ALTER TABLE event_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view event challenges" ON event_challenges;
CREATE POLICY "Anyone can view event challenges" ON event_challenges
  FOR SELECT USING (true);

-- flash_challenges (público)
ALTER TABLE flash_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active flash challenges" ON flash_challenges;
CREATE POLICY "Anyone can view active flash challenges" ON flash_challenges
  FOR SELECT USING (is_active = true);

-- flash_challenge_participations
ALTER TABLE flash_challenge_participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own flash participations" ON flash_challenge_participations;
CREATE POLICY "Users can view own flash participations" ON flash_challenge_participations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can join flash challenges" ON flash_challenge_participations;
CREATE POLICY "Users can join flash challenges" ON flash_challenge_participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own flash progress" ON flash_challenge_participations;
CREATE POLICY "Users can update own flash progress" ON flash_challenge_participations
  FOR UPDATE USING (auth.uid() = user_id);

-- challenge_journeys
ALTER TABLE challenge_journeys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view journeys" ON challenge_journeys;
CREATE POLICY "Anyone can view journeys" ON challenge_journeys
  FOR SELECT USING (true);

-- team_challenges
ALTER TABLE team_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view challenges" ON team_challenges;
CREATE POLICY "Team members can view challenges" ON team_challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM challenge_team_members 
      WHERE team_id = team_challenges.team_id 
        AND user_id = auth.uid()
    )
  );

-- team_challenge_contributions
ALTER TABLE team_challenge_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view team contributions" ON team_challenge_contributions;
CREATE POLICY "Users can view team contributions" ON team_challenge_contributions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add contributions" ON team_challenge_contributions;
CREATE POLICY "Users can add contributions" ON team_challenge_contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own contributions" ON team_challenge_contributions;
CREATE POLICY "Users can update own contributions" ON team_challenge_contributions
  FOR UPDATE USING (auth.uid() = user_id);

-- user_achievements_v2
ALTER TABLE user_achievements_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements_v2;
CREATE POLICY "Users can view own achievements" ON user_achievements_v2
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert achievements" ON user_achievements_v2;
CREATE POLICY "System can insert achievements" ON user_achievements_v2
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 15. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_flash_challenges_active ON flash_challenges(is_active, ends_at);
CREATE INDEX IF NOT EXISTS idx_events_active ON seasonal_events(is_active, ends_at);
CREATE INDEX IF NOT EXISTS idx_team_challenges_team ON team_challenges(team_id);
CREATE INDEX IF NOT EXISTS idx_event_participations_user ON event_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_powerup_usage_user ON powerup_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_flash_participations_user ON flash_challenge_participations(user_id);

-- 16. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE user_leagues IS 'Sistema de ligas semanais (Bronze → Diamante)';
COMMENT ON TABLE challenge_duels IS 'Duelos 1v1 entre usuários';
COMMENT ON TABLE challenge_teams IS 'Times/Clãs para desafios coletivos';
COMMENT ON TABLE user_powerups IS 'Power-ups do usuário (escudo, boost, etc.)';
COMMENT ON TABLE seasonal_events IS 'Eventos sazonais (Carnaval, Verão, etc.)';
COMMENT ON TABLE flash_challenges IS 'Desafios relâmpago de curta duração';
COMMENT ON TABLE challenge_journeys IS 'Jornadas épicas com mapa e checkpoints';