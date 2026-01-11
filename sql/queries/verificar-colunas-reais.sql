-- VERIFICAR ESTRUTURA REAL DAS TABELAS
-- Execute esta query primeiro para ver quais colunas realmente existem

-- 1. Verificar todas as colunas da tabela user_anamnesis
SELECT 
    column_name as campo_anamnesis,
    data_type as tipo
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_anamnesis'
ORDER BY ordinal_position;

-- Separador visual
SELECT '=== SEPARADOR ===' as info;

-- 2. Verificar todas as colunas da tabela profiles  
SELECT 
    column_name as campo_profiles,
    data_type as tipo
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;
