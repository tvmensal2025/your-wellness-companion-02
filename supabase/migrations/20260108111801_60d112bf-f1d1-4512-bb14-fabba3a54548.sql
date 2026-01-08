-- Limpar lotes órfãos antigos do WhatsApp médico
UPDATE public.whatsapp_pending_medical 
SET is_processed = true, status = 'expired' 
WHERE status = 'collecting' 
AND created_at < NOW() - INTERVAL '2 hours';

-- Limpar lotes com status awaiting_confirm antigos também
UPDATE public.whatsapp_pending_medical 
SET is_processed = true, status = 'expired' 
WHERE status = 'awaiting_confirm' 
AND created_at < NOW() - INTERVAL '4 hours';