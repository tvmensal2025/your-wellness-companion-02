-- Script para adicionar a coluna 'score' na tabela supplements
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna score se não existir
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.supplements.score IS 'Pontuação do produto de 0 a 100 para sistema de recomendações';

-- Atualizar produtos existentes com score padrão
UPDATE public.supplements 
SET score = 50 
WHERE score IS NULL OR score = 0;

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'supplements' 
AND column_name = 'score';
