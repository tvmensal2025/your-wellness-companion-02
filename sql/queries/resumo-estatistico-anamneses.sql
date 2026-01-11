-- RESUMO ESTATÍSTICO DAS ANAMNESES
-- Para análise administrativa geral

-- 1. Estatísticas gerais
SELECT 
    COUNT(*) as total_anamneses,
    COUNT(DISTINCT ua.user_id) as usuarios_unicos,
    COUNT(p.full_name) as usuarios_com_nome,
    COUNT(*) - COUNT(p.full_name) as usuarios_sem_nome,
    
    -- Estatísticas de IMC
    COUNT(ua.current_bmi) as usuarios_com_imc,
    AVG(ua.current_bmi) as imc_medio,
    MIN(ua.current_bmi) as menor_imc,
    MAX(ua.current_bmi) as maior_imc,
    
    -- Contagem por classificação de IMC
    SUM(CASE WHEN ua.current_bmi >= 30 THEN 1 ELSE 0 END) as casos_obesidade,
    SUM(CASE WHEN ua.current_bmi >= 25 AND ua.current_bmi < 30 THEN 1 ELSE 0 END) as casos_sobrepeso,
    SUM(CASE WHEN ua.current_bmi >= 18.5 AND ua.current_bmi < 25 THEN 1 ELSE 0 END) as casos_peso_normal,
    SUM(CASE WHEN ua.current_bmi < 18.5 THEN 1 ELSE 0 END) as casos_abaixo_peso,
    
    -- Problemas comportamentais
    SUM(CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END) as casos_compulsao_alimentar,
    SUM(CASE WHEN ua.feels_guilt_after_eating = true THEN 1 ELSE 0 END) as casos_culpa_ao_comer,
    SUM(CASE WHEN ua.eats_in_secret = true THEN 1 ELSE 0 END) as casos_come_escondido,
    
    -- Histórico familiar
    SUM(CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END) as casos_familia_diabetes,
    SUM(CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END) as casos_familia_obesidade,
    SUM(CASE WHEN ua.family_heart_disease_history = true THEN 1 ELSE 0 END) as casos_familia_coracao,
    
    -- Qualidade de vida (médias)
    AVG(ua.sleep_quality_score) as media_qualidade_sono,
    AVG(ua.daily_stress_level) as media_nivel_stress,
    AVG(ua.daily_energy_level) as media_energia_diaria,
    AVG(ua.food_relationship_score) as media_relacionamento_comida

FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id;

-- 2. Classificação por níveis de risco
SELECT 
    CASE 
        WHEN (
            CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END +
            CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END +
            CASE WHEN ua.family_heart_disease_history = true THEN 1 ELSE 0 END +
            CASE 
                WHEN ua.current_bmi >= 35 THEN 3
                WHEN ua.current_bmi >= 30 THEN 2
                WHEN ua.current_bmi >= 25 THEN 1
                ELSE 0 
            END +
            CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END +
            CASE WHEN ua.feels_guilt_after_eating = true THEN 1 ELSE 0 END +
            CASE WHEN ua.eats_in_secret = true THEN 1 ELSE 0 END +
            CASE WHEN ua.daily_stress_level >= 7 THEN 1 ELSE 0 END +
            CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END +
            CASE WHEN ua.daily_energy_level <= 3 THEN 1 ELSE 0 END
        ) >= 6 THEN 'ALTO RISCO'
        WHEN (
            CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END +
            CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END +
            CASE WHEN ua.family_heart_disease_history = true THEN 1 ELSE 0 END +
            CASE 
                WHEN ua.current_bmi >= 35 THEN 3
                WHEN ua.current_bmi >= 30 THEN 2
                WHEN ua.current_bmi >= 25 THEN 1
                ELSE 0 
            END +
            CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END +
            CASE WHEN ua.feels_guilt_after_eating = true THEN 1 ELSE 0 END +
            CASE WHEN ua.eats_in_secret = true THEN 1 ELSE 0 END +
            CASE WHEN ua.daily_stress_level >= 7 THEN 1 ELSE 0 END +
            CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END +
            CASE WHEN ua.daily_energy_level <= 3 THEN 1 ELSE 0 END
        ) >= 3 THEN 'RISCO MODERADO'
        ELSE 'BAIXO RISCO'
    END as nivel_risco,
    COUNT(*) as quantidade,
    ROUND(COUNT(*)::numeric * 100.0 / (SELECT COUNT(*) FROM user_anamnesis), 2) as percentual
FROM user_anamnesis ua
GROUP BY 
    CASE 
        WHEN (
            CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END +
            CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END +
            CASE WHEN ua.family_heart_disease_history = true THEN 1 ELSE 0 END +
            CASE 
                WHEN ua.current_bmi >= 35 THEN 3
                WHEN ua.current_bmi >= 30 THEN 2
                WHEN ua.current_bmi >= 25 THEN 1
                ELSE 0 
            END +
            CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END +
            CASE WHEN ua.feels_guilt_after_eating = true THEN 1 ELSE 0 END +
            CASE WHEN ua.eats_in_secret = true THEN 1 ELSE 0 END +
            CASE WHEN ua.daily_stress_level >= 7 THEN 1 ELSE 0 END +
            CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END +
            CASE WHEN ua.daily_energy_level <= 3 THEN 1 ELSE 0 END
        ) >= 6 THEN 'ALTO RISCO'
        WHEN (
            CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END +
            CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END +
            CASE WHEN ua.family_heart_disease_history = true THEN 1 ELSE 0 END +
            CASE 
                WHEN ua.current_bmi >= 35 THEN 3
                WHEN ua.current_bmi >= 30 THEN 2
                WHEN ua.current_bmi >= 25 THEN 1
                ELSE 0 
            END +
            CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END +
            CASE WHEN ua.feels_guilt_after_eating = true THEN 1 ELSE 0 END +
            CASE WHEN ua.eats_in_secret = true THEN 1 ELSE 0 END +
            CASE WHEN ua.daily_stress_level >= 7 THEN 1 ELSE 0 END +
            CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END +
            CASE WHEN ua.daily_energy_level <= 3 THEN 1 ELSE 0 END
        ) >= 3 THEN 'RISCO MODERADO'
        ELSE 'BAIXO RISCO'
    END
ORDER BY quantidade DESC;
