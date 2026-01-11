-- QUERY CORRIGIDA PARA POSTGRESQL/SUPABASE
-- Versão compatível sem erros de função

-- QUERY PRINCIPAL: Todas as anamneses com nomes dos usuários
SELECT 
    ua.id as anamnesis_id,
    ua.user_id,
    COALESCE(p.full_name, 'Usuário sem nome') as user_name,
    p.email as user_email,
    
    -- Dados pessoais da anamnese
    ua.profession,
    ua.marital_status,
    ua.city_state,
    
    -- Dados físicos atuais
    ua.current_weight,
    ua.height_cm,
    ua.current_bmi,
    CASE 
        WHEN ua.current_bmi IS NULL THEN 'Não informado'
        WHEN ua.current_bmi < 18.5 THEN 'Abaixo do peso'
        WHEN ua.current_bmi < 25 THEN 'Peso normal'
        WHEN ua.current_bmi < 30 THEN 'Sobrepeso'
        WHEN ua.current_bmi >= 30 THEN 'Obesidade'
        ELSE 'Não classificado'
    END as bmi_classification,
    
    -- Histórico familiar (fatores de risco)
    ua.family_obesity_history,
    ua.family_diabetes_history,
    ua.family_heart_disease_history,
    ua.family_eating_disorders_history,
    ua.family_depression_anxiety_history,
    ua.family_thyroid_problems_history,
    
    -- Contagem de fatores de risco familiares
    (
        CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_heart_disease_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_eating_disorders_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_depression_anxiety_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_thyroid_problems_history = true THEN 1 ELSE 0 END
    ) as family_risk_factors_count,
    
    -- Relacionamento com comida
    ua.food_relationship_score,
    CASE 
        WHEN ua.food_relationship_score IS NULL THEN 'Não avaliado'
        WHEN ua.food_relationship_score <= 3 THEN 'Muito problemático'
        WHEN ua.food_relationship_score <= 5 THEN 'Problemático'
        WHEN ua.food_relationship_score <= 7 THEN 'Regular'
        WHEN ua.food_relationship_score <= 9 THEN 'Bom'
        ELSE 'Excelente'
    END as food_relationship_status,
    
    ua.has_compulsive_eating,
    ua.feels_guilt_after_eating,
    ua.eats_in_secret,
    ua.eats_until_uncomfortable,
    
    -- Qualidade de vida
    ua.sleep_hours_per_night,
    ua.sleep_quality_score,
    CASE 
        WHEN ua.sleep_quality_score IS NULL THEN 'Não avaliado'
        WHEN ua.sleep_quality_score <= 3 THEN 'Muito ruim'
        WHEN ua.sleep_quality_score <= 5 THEN 'Ruim'
        WHEN ua.sleep_quality_score <= 7 THEN 'Regular'
        WHEN ua.sleep_quality_score <= 9 THEN 'Bom'
        ELSE 'Excelente'
    END as sleep_quality_status,
    
    ua.daily_stress_level,
    CASE 
        WHEN ua.daily_stress_level IS NULL THEN 'Não avaliado'
        WHEN ua.daily_stress_level <= 3 THEN 'Baixo'
        WHEN ua.daily_stress_level <= 5 THEN 'Moderado'
        WHEN ua.daily_stress_level <= 7 THEN 'Alto'
        ELSE 'Muito alto'
    END as stress_level_status,
    
    ua.physical_activity_frequency,
    ua.daily_energy_level,
    
    -- CÁLCULO SIMPLES DE RISCO (sem usar ROUND)
    (
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
        CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END
    ) as risk_score,
    
    -- Classificação de risco
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
            CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END
        ) >= 6 THEN 'ALTO'
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
            CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END
        ) >= 3 THEN 'MODERADO'
        ELSE 'BAIXO'
    END as risk_level,
    
    -- Datas
    ua.created_at,
    ua.updated_at

FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC;
