-- Adicionar coluna waiting_edit para controlar estado de edição
ALTER TABLE whatsapp_pending_nutrition 
ADD COLUMN IF NOT EXISTS waiting_edit boolean DEFAULT false;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_pending_edit 
ON whatsapp_pending_nutrition (user_id, waiting_edit) 
WHERE (waiting_edit = true);