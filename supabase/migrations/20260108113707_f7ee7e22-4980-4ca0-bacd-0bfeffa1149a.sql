-- Atualizar lote que ficou em processing
UPDATE public.whatsapp_pending_medical 
SET status = 'completed', is_processed = true
WHERE id = '205cb147-8a1d-4e72-b839-2fb2b85a7cd4';

-- Limpar outros lotes travados em processing por mais de 30 minutos
UPDATE public.whatsapp_pending_medical 
SET status = 'expired', is_processed = true 
WHERE status = 'processing' 
AND created_at < NOW() - INTERVAL '30 minutes';