-- Migration: Cardio Points History
-- Feature: real-heart-monitoring
-- Validates: Requirements 3.7

-- Tabela para histórico de pontos cardio diários
CREATE TABLE IF NOT EXISTS cardio_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  fat_burn_minutes INTEGER DEFAULT 0,
  cardio_minutes INTEGER DEFAULT 0,
  peak_minutes INTEGER DEFAULT 0,
  avg_heart_rate INTEGER DEFAULT 0,
  max_heart_rate INTEGER DEFAULT 0,
  min_heart_rate INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Comentários para documentação
COMMENT ON TABLE cardio_points_history IS 'Histórico diário de pontos cardio baseados em zonas de frequência cardíaca';
COMMENT ON COLUMN cardio_points_history.total_points IS 'Total de pontos cardio do dia (fat_burn*1 + cardio*2 + peak*3)';
COMMENT ON COLUMN cardio_points_history.fat_burn_minutes IS 'Minutos na zona queima de gordura (50-70% FC máx)';
COMMENT ON COLUMN cardio_points_history.cardio_minutes IS 'Minutos na zona cardio (70-85% FC máx)';
COMMENT ON COLUMN cardio_points_history.peak_minutes IS 'Minutos na zona pico (85-100% FC máx)';

-- Index para queries por usuário e data
CREATE INDEX IF NOT EXISTS idx_cardio_points_user_date 
  ON cardio_points_history(user_id, date DESC);

-- Index para ranking e estatísticas
CREATE INDEX IF NOT EXISTS idx_cardio_points_date_points 
  ON cardio_points_history(date, total_points DESC);

-- RLS policies
ALTER TABLE cardio_points_history ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios pontos
CREATE POLICY "Users can view own cardio points"
  ON cardio_points_history FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir seus próprios pontos
CREATE POLICY "Users can insert own cardio points"
  ON cardio_points_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seus próprios pontos
CREATE POLICY "Users can update own cardio points"
  ON cardio_points_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_cardio_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cardio_points_updated_at
  BEFORE UPDATE ON cardio_points_history
  FOR EACH ROW
  EXECUTE FUNCTION update_cardio_points_updated_at();

-- Função para upsert de pontos cardio
CREATE OR REPLACE FUNCTION upsert_cardio_points(
  p_user_id UUID,
  p_date DATE,
  p_total_points INTEGER,
  p_fat_burn_minutes INTEGER DEFAULT 0,
  p_cardio_minutes INTEGER DEFAULT 0,
  p_peak_minutes INTEGER DEFAULT 0,
  p_avg_heart_rate INTEGER DEFAULT 0,
  p_max_heart_rate INTEGER DEFAULT 0,
  p_min_heart_rate INTEGER DEFAULT 0
)
RETURNS cardio_points_history AS $$
DECLARE
  result cardio_points_history;
BEGIN
  INSERT INTO cardio_points_history (
    user_id, date, total_points, 
    fat_burn_minutes, cardio_minutes, peak_minutes,
    avg_heart_rate, max_heart_rate, min_heart_rate
  )
  VALUES (
    p_user_id, p_date, p_total_points,
    p_fat_burn_minutes, p_cardio_minutes, p_peak_minutes,
    p_avg_heart_rate, p_max_heart_rate, p_min_heart_rate
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    fat_burn_minutes = EXCLUDED.fat_burn_minutes,
    cardio_minutes = EXCLUDED.cardio_minutes,
    peak_minutes = EXCLUDED.peak_minutes,
    avg_heart_rate = EXCLUDED.avg_heart_rate,
    max_heart_rate = EXCLUDED.max_heart_rate,
    min_heart_rate = EXCLUDED.min_heart_rate,
    updated_at = NOW()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter pontos dos últimos N dias
CREATE OR REPLACE FUNCTION get_cardio_points_history(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  date DATE,
  total_points INTEGER,
  fat_burn_minutes INTEGER,
  cardio_minutes INTEGER,
  peak_minutes INTEGER,
  avg_heart_rate INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cph.date,
    cph.total_points,
    cph.fat_burn_minutes,
    cph.cardio_minutes,
    cph.peak_minutes,
    cph.avg_heart_rate
  FROM cardio_points_history cph
  WHERE cph.user_id = p_user_id
    AND cph.date >= CURRENT_DATE - p_days
  ORDER BY cph.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
