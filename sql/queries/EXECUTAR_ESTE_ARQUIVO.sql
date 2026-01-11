-- ==============================================================================
-- ⚠️ EXECUTE ESTE ARQUIVO NO SUPABASE SQL EDITOR
-- ==============================================================================
-- Este é o arquivo SQL correto para aplicar os protocolos de nutrição
-- ==============================================================================

BEGIN;

-- 1. Adicionar campo category na tabela health_conditions
ALTER TABLE public.health_conditions 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'nutrição' NOT NULL;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_health_conditions_category ON public.health_conditions(category);

-- 3. Atualizar TODAS as condições existentes para categoria 'nutrição'
-- Garantir que TODOS os protocolos fiquem na nutrição (100% de cobertura)
UPDATE public.health_conditions 
SET category = 'nutrição' 
WHERE category IS NULL OR category != 'nutrição';

-- 4. Comentário na coluna
COMMENT ON COLUMN public.health_conditions.category IS 'Categoria do protocolo: nutrição, saúde mental, estética, etc.';

COMMIT;

-- ==============================================================================
-- ✅ MIGRAÇÃO CONCLUÍDA!
-- ==============================================================================
-- Agora execute o script de verificação para confirmar:
-- VERIFICAR_PROTOCOLOS_NUTRICAO.sql
-- ==============================================================================

