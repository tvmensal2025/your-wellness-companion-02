-- Adicionar colunas para fluxo de confirmação no WhatsApp
ALTER TABLE whatsapp_pending_nutrition
ADD COLUMN IF NOT EXISTS waiting_confirmation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmed BOOLEAN,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Índice para busca rápida por telefone com confirmação pendente
CREATE INDEX IF NOT EXISTS idx_whatsapp_pending_phone 
ON whatsapp_pending_nutrition(phone) 
WHERE waiting_confirmation = true;

-- Índice para busca por user_id com confirmação pendente
CREATE INDEX IF NOT EXISTS idx_whatsapp_pending_user_confirmation 
ON whatsapp_pending_nutrition(user_id) 
WHERE waiting_confirmation = true;