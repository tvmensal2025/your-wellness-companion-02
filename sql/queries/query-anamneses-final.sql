-- QUERY DEFINITIVA PARA ANAMNESES (Baseada na estrutura real confirmada)
-- Removemos campos inexistentes (peso atual, altura, IMC, cidade)
-- Adicionamos novos campos descobertos (metas, desafios)

SELECT 
    -- IDENTIFICAÇÃO
    ua.id as anamnesis_id,
    ua.user_id,
    COALESCE(p.full_name, 'Usuário sem nome') as nome_usuario,
    p.email,
    
    -- DADOS PESSOAIS
    ua.profession as profissao,
    ua.marital_status as estado_civil,
    
    -- METAS E OBJETIVOS (Novos campos descobertos)
    ua.ideal_weight_goal as meta_peso_ideal,
    ua.main_treatment_goals as objetivos_tratamento,
    ua.biggest_weight_loss_challenge as maior_desafio,
    ua.motivation_for_seeking_treatment as motivacao,
    
    -- HISTÓRICO DE PESO
    ua.lowest_adult_weight as menor_peso,
    ua.highest_adult_weight as maior_peso,
    ua.weight_gain_started_age as idade_inicio_ganho,
    
    -- HISTÓRICO FAMILIAR (Fatores de Risco)
    ua.family_obesity_history as familia_obesidade,
    ua.family_diabetes_history as familia_diabetes,
    ua.family_heart_disease_history as familia_coracao,
    
    -- COMPORTAMENTO ALIMENTAR
    ua.food_relationship_score as score_comida, -- 0 a 10
    ua.has_compulsive_eating as compulsao,
    ua.feels_guilt_after_eating as culpa,
    ua.eats_in_secret as come_escondido,
    
    -- QUALIDADE DE VIDA
    ua.sleep_quality_score as score_sono, -- 0 a 10
    ua.daily_stress_level as score_stress, -- 0 a 10
    ua.daily_energy_level as score_energia, -- 0 a 10
    ua.physical_activity_frequency as exercicios,
    
    -- STATUS DO PREENCHIMENTO
    ua.completion_percentage as percentual_conclusao,
    ua.is_final as finalizado,
    
    -- CÁLCULO DE RISCO (Adaptado para campos existentes)
    (
        -- Fatores familiares
        CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_heart_disease_history = true THEN 1 ELSE 0 END +
        
        -- Comportamento alimentar
        CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END +
        CASE WHEN ua.feels_guilt_after_eating = true THEN 1 ELSE 0 END +
        CASE WHEN ua.eats_in_secret = true THEN 1 ELSE 0 END +
        
        -- Qualidade de vida (Scores ruins contam como risco)
        CASE WHEN ua.daily_stress_level >= 7 THEN 1 ELSE 0 END +
        CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END +
        CASE WHEN ua.daily_energy_level <= 3 THEN 1 ELSE 0 END
    ) as score_risco,
    
    -- DATAS
    ua.created_at as data_criacao,
    ua.updated_at as ultima_atualizacao

FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC;
