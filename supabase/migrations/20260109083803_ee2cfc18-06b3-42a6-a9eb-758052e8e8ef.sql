-- Adicionar colunas faltantes na tabela whatsapp_pending_medical
ALTER TABLE public.whatsapp_pending_medical 
ADD COLUMN IF NOT EXISTS analysis_result jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_whatsapp_pending_medical_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_whatsapp_pending_medical_updated_at ON public.whatsapp_pending_medical;
CREATE TRIGGER trigger_set_whatsapp_pending_medical_updated_at
  BEFORE UPDATE ON public.whatsapp_pending_medical
  FOR EACH ROW
  EXECUTE FUNCTION public.set_whatsapp_pending_medical_updated_at();

-- Corrigir lotes stuck que já têm medical_document_id (já foram concluídos mas ficaram travados)
UPDATE public.whatsapp_pending_medical
SET status = 'completed', is_processed = true
WHERE status IN ('processing', 'stuck', 'awaiting_confirm')
  AND is_processed = false
  AND medical_document_id IS NOT NULL;

-- Marcar lotes muito antigos sem documento como expirados
UPDATE public.whatsapp_pending_medical
SET status = 'expired', is_processed = true
WHERE status IN ('processing', 'collecting', 'awaiting_confirm')
  AND is_processed = false
  AND medical_document_id IS NULL
  AND created_at < NOW() - INTERVAL '2 hours';