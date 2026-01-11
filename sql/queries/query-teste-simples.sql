-- QUERY DE TESTE SIMPLES - EXECUTE ESTA PRIMEIRO
-- Para verificar se as tabelas existem e o relacionamento funciona

-- 1. Verificar se as tabelas existem
SELECT 
    'user_anamnesis' as tabela,
    COUNT(*) as registros
FROM user_anamnesis
UNION ALL
SELECT 
    'profiles' as tabela,
    COUNT(*) as registros  
FROM profiles;

-- 2. Query básica das anamneses com nomes
SELECT 
    ua.id,
    ua.user_id,
    p.full_name as nome_usuario,
    p.email,
    ua.profession as profissao,
    ua.city_state as cidade,
    ua.current_bmi as imc,
    ua.has_compulsive_eating as compulsao_alimentar,
    ua.daily_stress_level as stress,
    ua.sleep_quality_score as qualidade_sono,
    ua.created_at as data_criacao
FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC
LIMIT 10;
