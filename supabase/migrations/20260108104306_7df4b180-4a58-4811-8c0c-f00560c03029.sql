-- Adicionar campos para suportar lote de imagens médicas
ALTER TABLE public.whatsapp_pending_medical 
ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_image_at timestamptz NULL,
ADD COLUMN IF NOT EXISTS waiting_confirmation boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmed boolean NULL,
ADD COLUMN IF NOT EXISTS images_count integer NOT NULL DEFAULT 0;

-- Índice para buscar lotes ativos
CREATE INDEX IF NOT EXISTS idx_pending_medical_collecting 
ON public.whatsapp_pending_medical(user_id, status, waiting_confirmation) 
WHERE status IN ('collecting', 'awaiting_confirm');

-- Comentários
COMMENT ON COLUMN public.whatsapp_pending_medical.image_urls IS 'Lista de URLs das imagens do lote [{url, created_at}]';
COMMENT ON COLUMN public.whatsapp_pending_medical.waiting_confirmation IS 'True quando aguardando confirmação do usuário para analisar';
COMMENT ON COLUMN public.whatsapp_pending_medical.confirmed IS 'True se usuário confirmou análise, false se cancelou';