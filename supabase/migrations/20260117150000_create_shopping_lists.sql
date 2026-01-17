-- ============================================
-- MIGRATION: Create Shopping Lists Table
-- ============================================
-- Descrição: Tabela para armazenar listas de compras geradas automaticamente
-- Autor: MaxNutrition Team
-- Data: 2026-01-17
-- ============================================

-- Criar tabela shopping_lists
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  sent_to_whatsapp BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comentários
COMMENT ON TABLE public.shopping_lists IS 'Listas de compras geradas automaticamente baseadas no planejamento semanal';
COMMENT ON COLUMN public.shopping_lists.user_id IS 'ID do usuário dono da lista';
COMMENT ON COLUMN public.shopping_lists.week_start IS 'Data de início da semana';
COMMENT ON COLUMN public.shopping_lists.week_end IS 'Data de fim da semana';
COMMENT ON COLUMN public.shopping_lists.items IS 'Array de itens da lista: [{name, quantity, unit, category, checked}]';
COMMENT ON COLUMN public.shopping_lists.sent_to_whatsapp IS 'Se a lista foi enviada via WhatsApp';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user 
  ON public.shopping_lists(user_id);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_dates 
  ON public.shopping_lists(week_start, week_end);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_created 
  ON public.shopping_lists(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_shopping_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_lists_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas suas próprias listas
CREATE POLICY "Users can view own shopping lists"
  ON public.shopping_lists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem criar suas próprias listas
CREATE POLICY "Users can create own shopping lists"
  ON public.shopping_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar suas próprias listas
CREATE POLICY "Users can update own shopping lists"
  ON public.shopping_lists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas próprias listas
CREATE POLICY "Users can delete own shopping lists"
  ON public.shopping_lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_lists TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
