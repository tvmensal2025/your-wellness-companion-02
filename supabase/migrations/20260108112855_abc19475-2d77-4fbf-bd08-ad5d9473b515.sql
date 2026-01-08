-- Limpar lote órfão específico que está parado com 1 imagem
UPDATE public.whatsapp_pending_medical 
SET is_processed = true, status = 'expired' 
WHERE id = '214c34cb-26a6-484e-9a02-db79ea4c0620';

-- Limpar lotes em collecting antigos (mais de 30 min)
UPDATE public.whatsapp_pending_medical 
SET is_processed = true, status = 'expired' 
WHERE status = 'collecting' 
AND is_processed = false
AND created_at < NOW() - INTERVAL '30 minutes';

-- Limpar lotes em awaiting_confirm antigos (mais de 1 hora)
UPDATE public.whatsapp_pending_medical 
SET is_processed = true, status = 'expired' 
WHERE status = 'awaiting_confirm' 
AND is_processed = false
AND created_at < NOW() - INTERVAL '1 hour';

-- Marcar lotes com erro antigos como processados (não criar duplicatas)
UPDATE public.whatsapp_pending_medical 
SET is_processed = true 
WHERE status = 'error' 
AND is_processed = false
AND created_at < NOW() - INTERVAL '2 hours';