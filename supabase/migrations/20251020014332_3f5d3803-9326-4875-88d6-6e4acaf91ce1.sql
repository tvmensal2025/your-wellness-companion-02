-- Adicionar colunas necessárias para tracking completo de treinos
ALTER TABLE sport_workout_logs
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS workout_data JSONB DEFAULT '{}'::jsonb;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_workout_logs_completed_at ON sport_workout_logs(completed_at);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON sport_workout_logs(user_id, completed_at);

-- Comentários
COMMENT ON COLUMN sport_workout_logs.started_at IS 'Horário de início do treino';
COMMENT ON COLUMN sport_workout_logs.rating IS 'Avaliação do treino (1-5 estrelas)';
COMMENT ON COLUMN sport_workout_logs.workout_data IS 'Dados adicionais do treino (exercícios, séries, pesos, etc)';
