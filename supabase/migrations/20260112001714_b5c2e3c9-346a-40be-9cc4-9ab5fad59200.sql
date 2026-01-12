-- Adicionar coluna display_mode na tabela challenges
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS display_mode TEXT DEFAULT 'normal' 
CHECK (display_mode IN ('normal', 'featured', 'flash'));

-- Adicionar coluna para definir prioridade de exibição
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS display_priority INTEGER DEFAULT 0;

-- Adicionar coluna para data de expiração (para featured/flash)
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- Comentários
COMMENT ON COLUMN challenges.display_mode IS 'Onde o desafio aparece: normal (aba), featured (popup/sino), flash (relâmpago)';
COMMENT ON COLUMN challenges.display_priority IS 'Prioridade de exibição (maior = mais destaque)';
COMMENT ON COLUMN challenges.featured_until IS 'Data até quando o desafio fica em destaque';

-- Índice para buscar desafios em destaque
CREATE INDEX IF NOT EXISTS idx_challenges_display_mode 
ON challenges(display_mode, is_active) 
WHERE is_active = true;