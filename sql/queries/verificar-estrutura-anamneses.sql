-- SCRIPT PARA VERIFICAR A ESTRUTURA DAS TABELAS E DADOS
-- Execute este script primeiro para diagnosticar a estrutura

-- 1. Verificar se as tabelas existem
SELECT 
    'user_anamnesis' as tabela,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_anamnesis'
    ) THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status;

SELECT 
    'profiles' as tabela,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status;

-- 2. Verificar estrutura da tabela user_anamnesis
SELECT 
    column_name as campo,
    data_type as tipo,
    is_nullable as permite_nulo
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_anamnesis'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela profiles
SELECT 
    column_name as campo,
    data_type as tipo,
    is_nullable as permite_nulo
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Contar registros nas tabelas
SELECT 'user_anamnesis' as tabela, COUNT(*) as total_registros
FROM user_anamnesis
UNION ALL
SELECT 'profiles' as tabela, COUNT(*) as total_registros
FROM profiles;

-- 5. Verificar anamneses com e sem nomes
SELECT 
    COUNT(*) as total_anamneses,
    COUNT(p.full_name) as com_nome,
    COUNT(*) - COUNT(p.full_name) as sem_nome,
    ROUND((COUNT(p.full_name)::numeric / COUNT(*)) * 100, 2) as percentual_com_nome
FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id;

-- 6. Amostra de dados (primeiros 5 registros)
SELECT 
    ua.id,
    ua.user_id,
    p.full_name,
    ua.profession,
    ua.current_weight,
    ua.current_bmi,
    ua.created_at
FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC
LIMIT 5;

-- 7. Verificar possíveis problemas de dados
SELECT 
    'Anamneses sem user_id' as problema,
    COUNT(*) as quantidade
FROM user_anamnesis 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'Profiles sem user_id' as problema,
    COUNT(*) as quantidade
FROM profiles 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'Anamneses sem nome de usuário' as problema,
    COUNT(*) as quantidade
FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
WHERE p.full_name IS NULL;
