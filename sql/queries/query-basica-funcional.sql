-- QUERY BÁSICA QUE DEVE FUNCIONAR
-- Usando apenas campos essenciais que provavelmente existem

-- 1. Query simples para ver as anamneses com nomes
SELECT 
    ua.id as anamnesis_id,
    ua.user_id,
    COALESCE(p.full_name, 'Usuário sem nome') as nome_usuario,
    p.email,
    ua.created_at as data_criacao
FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC;

-- 2. Query para ver alguns campos da anamnesis (os que mais provavelmente existem)
SELECT 
    ua.id,
    ua.user_id,
    p.full_name as nome,
    ua.profession,
    ua.current_weight,
    ua.current_bmi,
    ua.family_diabetes_history,
    ua.family_obesity_history,
    ua.has_compulsive_eating,
    ua.food_relationship_score,
    ua.sleep_quality_score,
    ua.daily_stress_level,
    ua.created_at
FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC;
