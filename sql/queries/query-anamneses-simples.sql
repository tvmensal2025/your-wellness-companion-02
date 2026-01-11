-- QUERY SIMPLES PARA USAR DIRETAMENTE NO SUPABASE SQL EDITOR
-- Busca todas as anamneses com nomes dos usuários

SELECT 
    ua.id as anamnesis_id,
    ua.user_id,
    COALESCE(p.full_name, 'Usuário sem nome') as nome_usuario,
    p.email,
    
    -- Dados básicos
    ua.profession as profissao,
    ua.city_state as cidade_estado,
    ua.current_weight as peso_atual,
    ua.current_bmi as imc,
    
    -- Histórico familiar
    ua.family_obesity_history as familia_obesidade,
    ua.family_diabetes_history as familia_diabetes,
    ua.family_heart_disease_history as familia_coracao,
    
    -- Comportamento alimentar
    ua.has_compulsive_eating as compulsao_alimentar,
    ua.food_relationship_score as score_comida,
    ua.feels_guilt_after_eating as culpa_comer,
    ua.eats_in_secret as come_escondido,
    
    -- Qualidade de vida
    ua.sleep_quality_score as qualidade_sono,
    ua.daily_stress_level as nivel_stress,
    ua.daily_energy_level as nivel_energia,
    
    -- Datas
    ua.created_at as data_criacao,
    ua.updated_at as ultima_atualizacao
    
FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC;
