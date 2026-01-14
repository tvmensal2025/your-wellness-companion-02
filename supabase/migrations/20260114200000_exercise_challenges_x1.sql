-- ============================================
-- 🏆 EXERCISE CHALLENGES X1 (1v1)
-- Sistema de desafios entre usuários que se seguem
-- ============================================

-- Tabela de desafios X1
CREATE TABLE IF NOT EXISTS exercise_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participantes
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Detalhes do desafio
  exercise_name TEXT NOT NULL,
  exercise_emoji TEXT DEFAULT '💪',
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('max_reps', 'first_to', 'timed')),
  target_value INTEGER, -- meta de reps ou tempo em segundos
  duration_seconds INTEGER DEFAULT 60, -- duração para tipo 'timed' ou 'max_reps'
  
  -- Progresso
  challenger_progress INTEGER DEFAULT 0,
  challenged_progress INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'active', 'completed', 'declined', 'expired')),
  winner_id UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- Constraints
  CONSTRAINT different_users CHECK (challenger_id != challenged_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_exercise_challenges_challenger ON exercise_challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_exercise_challenges_challenged ON exercise_challenges(challenged_id);
CREATE INDEX IF NOT EXISTS idx_exercise_challenges_status ON exercise_challenges(status);
CREATE INDEX IF NOT EXISTS idx_exercise_challenges_active ON exercise_challenges(status) WHERE status IN ('pending', 'accepted', 'active');

-- RLS
ALTER TABLE exercise_challenges ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view their own challenges"
  ON exercise_challenges FOR SELECT
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create challenges"
  ON exercise_challenges FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Participants can update their challenges"
  ON exercise_challenges FOR UPDATE
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Função para aceitar desafio
CREATE OR REPLACE FUNCTION accept_exercise_challenge(p_challenge_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge exercise_challenges%ROWTYPE;
BEGIN
  -- Buscar desafio
  SELECT * INTO v_challenge FROM exercise_challenges WHERE id = p_challenge_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Desafio não encontrado');
  END IF;
  
  -- Verificar se é o desafiado
  IF v_challenge.challenged_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas o desafiado pode aceitar');
  END IF;
  
  -- Verificar status
  IF v_challenge.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Desafio não está pendente');
  END IF;
  
  -- Aceitar
  UPDATE exercise_challenges
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = p_challenge_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Função para iniciar desafio
CREATE OR REPLACE FUNCTION start_exercise_challenge(p_challenge_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge exercise_challenges%ROWTYPE;
BEGIN
  SELECT * INTO v_challenge FROM exercise_challenges WHERE id = p_challenge_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Desafio não encontrado');
  END IF;
  
  IF v_challenge.challenger_id != auth.uid() AND v_challenge.challenged_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não autorizado');
  END IF;
  
  IF v_challenge.status != 'accepted' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Desafio precisa ser aceito primeiro');
  END IF;
  
  UPDATE exercise_challenges
  SET status = 'active', started_at = NOW()
  WHERE id = p_challenge_id;
  
  RETURN jsonb_build_object('success', true, 'started_at', NOW());
END;
$$;

-- Função para atualizar progresso
CREATE OR REPLACE FUNCTION update_challenge_progress(
  p_challenge_id UUID,
  p_progress INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge exercise_challenges%ROWTYPE;
  v_is_challenger BOOLEAN;
  v_winner_id UUID;
BEGIN
  SELECT * INTO v_challenge FROM exercise_challenges WHERE id = p_challenge_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Desafio não encontrado');
  END IF;
  
  IF v_challenge.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Desafio não está ativo');
  END IF;
  
  v_is_challenger := (auth.uid() = v_challenge.challenger_id);
  
  IF NOT v_is_challenger AND auth.uid() != v_challenge.challenged_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não autorizado');
  END IF;
  
  -- Atualizar progresso
  IF v_is_challenger THEN
    UPDATE exercise_challenges SET challenger_progress = p_progress WHERE id = p_challenge_id;
  ELSE
    UPDATE exercise_challenges SET challenged_progress = p_progress WHERE id = p_challenge_id;
  END IF;
  
  -- Verificar se completou (para tipo first_to)
  IF v_challenge.challenge_type = 'first_to' AND p_progress >= v_challenge.target_value THEN
    v_winner_id := auth.uid();
    
    UPDATE exercise_challenges
    SET status = 'completed', winner_id = v_winner_id, completed_at = NOW()
    WHERE id = p_challenge_id;
    
    RETURN jsonb_build_object('success', true, 'completed', true, 'winner_id', v_winner_id);
  END IF;
  
  RETURN jsonb_build_object('success', true, 'progress', p_progress);
END;
$$;

-- Função para finalizar desafio (por tempo)
CREATE OR REPLACE FUNCTION complete_exercise_challenge(p_challenge_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge exercise_challenges%ROWTYPE;
  v_winner_id UUID;
BEGIN
  SELECT * INTO v_challenge FROM exercise_challenges WHERE id = p_challenge_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Desafio não encontrado');
  END IF;
  
  IF v_challenge.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Desafio não está ativo');
  END IF;
  
  -- Determinar vencedor
  IF v_challenge.challenger_progress > v_challenge.challenged_progress THEN
    v_winner_id := v_challenge.challenger_id;
  ELSIF v_challenge.challenged_progress > v_challenge.challenger_progress THEN
    v_winner_id := v_challenge.challenged_id;
  ELSE
    v_winner_id := NULL; -- Empate
  END IF;
  
  UPDATE exercise_challenges
  SET status = 'completed', winner_id = v_winner_id, completed_at = NOW()
  WHERE id = p_challenge_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'winner_id', v_winner_id,
    'challenger_progress', v_challenge.challenger_progress,
    'challenged_progress', v_challenge.challenged_progress
  );
END;
$$;

-- Comentários
COMMENT ON TABLE exercise_challenges IS 'Desafios X1 de exercícios entre usuários';
COMMENT ON COLUMN exercise_challenges.challenge_type IS 'max_reps: máximo em tempo, first_to: primeiro a X, timed: tempo fixo';
