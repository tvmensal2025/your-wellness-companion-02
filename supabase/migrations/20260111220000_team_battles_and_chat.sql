-- =====================================================
-- SISTEMA DE BATALHAS TIME VS TIME E CHAT
-- =====================================================

-- Tabela de Batalhas entre Times
CREATE TABLE IF NOT EXISTS team_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a_id UUID NOT NULL REFERENCES challenge_teams(id) ON DELETE CASCADE,
  team_b_id UUID NOT NULL REFERENCES challenge_teams(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL DEFAULT 'exercicio',
  target_value INTEGER NOT NULL DEFAULT 1000,
  unit TEXT NOT NULL DEFAULT 'pontos',
  team_a_progress INTEGER NOT NULL DEFAULT 0,
  team_b_progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  winner_team_id UUID REFERENCES challenge_teams(id),
  xp_reward INTEGER NOT NULL DEFAULT 500,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT different_teams CHECK (team_a_id != team_b_id)
);

-- Tabela de Chat do Time
CREATE TABLE IF NOT EXISTS team_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES challenge_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'achievement')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_team_battles_teams ON team_battles(team_a_id, team_b_id);
CREATE INDEX IF NOT EXISTS idx_team_battles_status ON team_battles(status) WHERE status IN ('pending', 'active');
CREATE INDEX IF NOT EXISTS idx_team_chat_team ON team_chat_messages(team_id, created_at DESC);

-- RLS para team_battles
ALTER TABLE team_battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membros podem ver batalhas do time" ON team_battles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM challenge_team_members 
      WHERE team_id IN (team_a_id, team_b_id) 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Líderes podem criar batalhas" ON team_battles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM challenge_teams 
      WHERE id = team_a_id 
      AND leader_id = auth.uid()
    )
  );

CREATE POLICY "Sistema pode atualizar batalhas" ON team_battles
  FOR UPDATE USING (true);

-- RLS para team_chat_messages
ALTER TABLE team_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membros podem ver mensagens do time" ON team_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM challenge_team_members 
      WHERE team_id = team_chat_messages.team_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Membros podem enviar mensagens" ON team_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM challenge_team_members 
      WHERE team_id = team_chat_messages.team_id 
      AND user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Função para atualizar progresso do time em batalha
CREATE OR REPLACE FUNCTION update_team_battle_progress(
  p_battle_id UUID,
  p_team_id UUID,
  p_progress_increment INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_battle team_battles%ROWTYPE;
BEGIN
  SELECT * INTO v_battle FROM team_battles WHERE id = p_battle_id;
  
  IF v_battle.status != 'active' THEN
    RAISE EXCEPTION 'Batalha não está ativa';
  END IF;
  
  IF v_battle.team_a_id = p_team_id THEN
    UPDATE team_battles 
    SET team_a_progress = team_a_progress + p_progress_increment,
        updated_at = NOW()
    WHERE id = p_battle_id;
  ELSIF v_battle.team_b_id = p_team_id THEN
    UPDATE team_battles 
    SET team_b_progress = team_b_progress + p_progress_increment,
        updated_at = NOW()
    WHERE id = p_battle_id;
  ELSE
    RAISE EXCEPTION 'Time não participa desta batalha';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para finalizar batalha e determinar vencedor
CREATE OR REPLACE FUNCTION finalize_team_battle(p_battle_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_battle team_battles%ROWTYPE;
  v_winner_id UUID;
BEGIN
  SELECT * INTO v_battle FROM team_battles WHERE id = p_battle_id;
  
  IF v_battle.status = 'completed' THEN
    RETURN jsonb_build_object('status', 'already_completed');
  END IF;
  
  -- Determinar vencedor
  IF v_battle.team_a_progress > v_battle.team_b_progress THEN
    v_winner_id := v_battle.team_a_id;
  ELSIF v_battle.team_b_progress > v_battle.team_a_progress THEN
    v_winner_id := v_battle.team_b_id;
  ELSE
    v_winner_id := NULL; -- Empate
  END IF;
  
  -- Atualizar batalha
  UPDATE team_battles 
  SET status = 'completed',
      winner_team_id = v_winner_id,
      updated_at = NOW()
  WHERE id = p_battle_id;
  
  -- Adicionar XP ao time vencedor
  IF v_winner_id IS NOT NULL THEN
    UPDATE challenge_teams 
    SET total_xp = total_xp + v_battle.xp_reward,
        challenges_completed = challenges_completed + 1
    WHERE id = v_winner_id;
  END IF;
  
  RETURN jsonb_build_object(
    'status', 'completed',
    'winner_team_id', v_winner_id,
    'xp_awarded', CASE WHEN v_winner_id IS NOT NULL THEN v_battle.xp_reward ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE team_battles IS 'Batalhas entre times (Time vs Time)';
COMMENT ON TABLE team_chat_messages IS 'Mensagens do chat do time';
