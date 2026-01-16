-- ============================================
-- Migração: Persistência Permanente e Status
-- ============================================

-- 1. Adicionar status em nutrition_tracking (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nutrition_tracking' AND column_name = 'status') THEN
    ALTER TABLE public.nutrition_tracking ADD COLUMN status TEXT DEFAULT 'confirmed';
  END IF;
END $$;

-- 2. Adicionar soft delete columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'food_history' AND column_name = 'deleted_at') THEN
    ALTER TABLE public.food_history ADD COLUMN deleted_at TIMESTAMPTZ NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nutrition_tracking' AND column_name = 'deleted_at') THEN
    ALTER TABLE public.nutrition_tracking ADD COLUMN deleted_at TIMESTAMPTZ NULL;
  END IF;
END $$;

-- 3. Adicionar defaults para campos de nutrição em food_history
ALTER TABLE public.food_history 
  ALTER COLUMN total_calories SET DEFAULT 0,
  ALTER COLUMN total_proteins SET DEFAULT 0,
  ALTER COLUMN total_carbs SET DEFAULT 0,
  ALTER COLUMN total_fats SET DEFAULT 0,
  ALTER COLUMN total_fiber SET DEFAULT 0;

-- 4. Função para impedir DELETE físico (soft delete obrigatório)
CREATE OR REPLACE FUNCTION public.prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Permite DELETE apenas se deleted_at for NULL (ou seja, soft delete)
  IF OLD.deleted_at IS NOT NULL THEN
    RETURN OLD; -- Já está soft-deleted, permite remoção real se necessário
  END IF;
  
  -- Em vez de deletar, faz soft delete
  UPDATE food_history SET deleted_at = NOW() WHERE id = OLD.id;
  UPDATE nutrition_tracking SET deleted_at = NOW() WHERE id = OLD.id;
  
  -- Retorna NULL para cancelar o DELETE original
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para food_history (criar apenas se não existir)
DROP TRIGGER IF EXISTS prevent_food_history_delete ON public.food_history;
CREATE TRIGGER prevent_food_history_delete
  BEFORE DELETE ON public.food_history
  FOR EACH ROW 
  EXECUTE FUNCTION public.prevent_hard_delete();

-- 6. Trigger para nutrition_tracking
DROP TRIGGER IF EXISTS prevent_nutrition_tracking_delete ON public.nutrition_tracking;
CREATE TRIGGER prevent_nutrition_tracking_delete
  BEFORE DELETE ON public.nutrition_tracking
  FOR EACH ROW 
  EXECUTE FUNCTION public.prevent_hard_delete();

-- 7. Índices para queries de soft delete
CREATE INDEX IF NOT EXISTS idx_food_history_active 
  ON public.food_history(user_id, deleted_at) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_active 
  ON public.nutrition_tracking(user_id, deleted_at) 
  WHERE deleted_at IS NULL;

-- 8. Índice por status em nutrition_tracking
CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_status 
  ON public.nutrition_tracking(user_id, date, status);

-- 9. Tabela para armazenar links de PDF de exames médicos (se não existir)
CREATE TABLE IF NOT EXISTS public.medical_pdf_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  medical_document_id UUID REFERENCES public.medical_documents(id) ON DELETE SET NULL,
  public_link_id UUID REFERENCES public.public_report_links(id) ON DELETE SET NULL,
  pdf_url TEXT NOT NULL,
  pdf_path TEXT NOT NULL,
  html_url TEXT,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT TRUE
);

-- RLS para medical_pdf_reports
ALTER TABLE public.medical_pdf_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PDF reports"
  ON public.medical_pdf_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage PDF reports"
  ON public.medical_pdf_reports FOR ALL
  USING (auth.role() = 'service_role');

-- Índice para busca de PDFs
CREATE INDEX IF NOT EXISTS idx_medical_pdf_reports_user 
  ON public.medical_pdf_reports(user_id, created_at DESC);