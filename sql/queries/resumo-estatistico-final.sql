-- RESUMO ESTATÍSTICO FINAL (Baseado na estrutura real)
-- Para dashboard administrativo

SELECT 
    -- TOTAIS
    COUNT(*) as total_anamneses,
    COUNT(DISTINCT ua.user_id) as usuarios_unicos,
    
    -- STATUS DE PREENCHIMENTO
    AVG(ua.completion_percentage) as media_conclusao,
    SUM(CASE WHEN ua.is_final = true THEN 1 ELSE 0 END) as anamneses_finalizadas,
    
    -- MOTIVAÇÕES PRINCIPAIS
    SUM(CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END) as casos_compulsao,
    SUM(CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END) as historico_familiar_obesidade,
    
    -- MÉDIAS DE SCORES (0-10)
    ROUND(AVG(ua.sleep_quality_score), 1) as media_sono,
    ROUND(AVG(ua.daily_stress_level), 1) as media_stress,
    ROUND(AVG(ua.food_relationship_score), 1) as media_relacao_comida,
    
    -- DISTRIBUIÇÃO DE RISCO (Baseado nos fatores disponíveis)
    SUM(CASE WHEN (
        -- Cálculo simplificado de risco alto (Score >= 4)
        (CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END +
         CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END +
         CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END +
         CASE WHEN ua.daily_stress_level >= 7 THEN 1 ELSE 0 END +
         CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END) >= 4
    ) THEN 1 ELSE 0 END) as alto_risco_qtd

FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id;
