-- Adicionar colunas faltantes na tabela user_anamnesis para alinhar com o formulário SystemicAnamnesis
-- NÃO altera colunas já existentes como lowest_adult_weight/highest_adult_weight

ALTER TABLE public.user_anamnesis
  ADD COLUMN IF NOT EXISTS weight_gain_started_age INTEGER,
  ADD COLUMN IF NOT EXISTS major_weight_gain_periods TEXT,
  ADD COLUMN IF NOT EXISTS emotional_events_during_weight_gain TEXT,
  ADD COLUMN IF NOT EXISTS weight_fluctuation_classification TEXT;

-- Comentários para documentação (opcional, não afeta comportamento)
COMMENT ON COLUMN public.user_anamnesis.weight_gain_started_age IS 'Idade que começou a ganhar peso excessivo';
COMMENT ON COLUMN public.user_anamnesis.major_weight_gain_periods IS 'Períodos de maior ganho de peso';
COMMENT ON COLUMN public.user_anamnesis.emotional_events_during_weight_gain IS 'Eventos emocionais durante ganho de peso';
COMMENT ON COLUMN public.user_anamnesis.weight_fluctuation_classification IS 'Classificação da oscilação de peso ao longo da vida';