-- Adicionar coluna is_processed que está faltando na tabela whatsapp_pending_medical
ALTER TABLE public.whatsapp_pending_medical 
ADD COLUMN IF NOT EXISTS is_processed boolean NOT NULL DEFAULT false;

-- Índice para buscar lotes ativos eficientemente
CREATE INDEX IF NOT EXISTS idx_pending_medical_active 
ON public.whatsapp_pending_medical(user_id, is_processed, status);

-- Limpar lotes órfãos antigos (marcar como processados)
UPDATE public.whatsapp_pending_medical 
SET is_processed = true 
WHERE created_at < NOW() - INTERVAL '1 day' 
AND status NOT IN ('collecting', 'awaiting_confirm');