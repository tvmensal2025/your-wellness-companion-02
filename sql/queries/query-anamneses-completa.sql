-- QUERY COMPLETA PARA BUSCAR TODAS AS ANAMNESES COM NOMES DOS USUÁRIOS
-- Esta query faz o relacionamento correto entre user_anamnesis e profiles
-- e calcula automaticamente indicadores de risco para análise administrativa

SELECT 
    -- Informações básicas
    ua.id as anamnesis_id,
    ua.user_id,
    COALESCE(p.full_name, 'Usuário sem nome') as user_name,
    p.email as user_email,
    p.phone as user_phone,
    
    -- Dados pessoais da anamnese
    ua.profession,
    ua.marital_status,
    ua.city_state,
    ua.how_found_method,
    
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
    
    -- Histórico de peso
    ua.weight_gain_started_age,
    ua.lowest_adult_weight,
    ua.highest_adult_weight,
    (ua.highest_adult_weight - ua.lowest_adult_weight) as weight_variation_range,
    ua.major_weight_gain_periods,
    ua.emotional_events_during_weight_gain,
    
    -- Histórico familiar (fatores de risco)
    ua.family_obesity_history,
    ua.family_diabetes_history,
    ua.family_heart_disease_history,
    ua.family_eating_disorders_history,
    ua.family_depression_anxiety_history,
    ua.family_thyroid_problems_history,
    ua.family_other_chronic_diseases,
    
    -- Contagem de fatores de risco familiares
    (
        CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_heart_disease_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_eating_disorders_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_depression_anxiety_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_thyroid_problems_history = true THEN 1 ELSE 0 END
    ) as family_risk_factors_count,
    
    -- Tratamentos anteriores
    ua.previous_weight_treatments,
    ua.most_effective_treatment,
    ua.least_effective_treatment,
    ua.had_rebound_effect,
    
    -- Medicações e condições atuais
    ua.current_medications,
    ua.chronic_diseases,
    ua.supplements,
    ua.herbal_medicines,
    
    -- Relacionamento com comida (área crítica)
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
    ua.compulsive_eating_situations,
    ua.problematic_foods,
    ua.forbidden_foods,
    ua.feels_guilt_after_eating,
    ua.eats_in_secret,
    ua.eats_until_uncomfortable,
    
    -- Contagem de comportamentos alimentares problemáticos
    (
        CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END +
        CASE WHEN ua.feels_guilt_after_eating = true THEN 1 ELSE 0 END +
        CASE WHEN ua.eats_in_secret = true THEN 1 ELSE 0 END +
        CASE WHEN ua.eats_until_uncomfortable = true THEN 1 ELSE 0 END
    ) as problematic_eating_behaviors_count,
    
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
    
    ua.physical_activity_type,
    ua.physical_activity_frequency,
    ua.daily_energy_level,
    
    -- CÁLCULO DO NÍVEL DE RISCO GERAL
    (
        -- Fatores de risco familiares (peso 1 cada)
        CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_heart_disease_history = true THEN 1 ELSE 0 END +
        
        -- IMC (peso maior)
        CASE 
            WHEN ua.current_bmi >= 35 THEN 3
            WHEN ua.current_bmi >= 30 THEN 2
            WHEN ua.current_bmi >= 25 THEN 1
            ELSE 0 
        END +
        
        -- Comportamentos alimentares (peso 1 cada)
        CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END +
        CASE WHEN ua.feels_guilt_after_eating = true THEN 1 ELSE 0 END +
        CASE WHEN ua.eats_in_secret = true THEN 1 ELSE 0 END +
        
        -- Qualidade de vida
        CASE WHEN ua.daily_stress_level >= 7 THEN 1 ELSE 0 END +
        CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END +
        CASE WHEN ua.daily_energy_level <= 3 THEN 1 ELSE 0 END
    ) as risk_score,
    
    -- Classificação de risco baseada no score
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
            CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END +
            CASE WHEN ua.daily_energy_level <= 3 THEN 1 ELSE 0 END
        ) >= 3 THEN 'MODERADO'
        ELSE 'BAIXO'
    END as risk_level,
    
    -- Datas de controle
    ua.created_at,
    ua.updated_at,
    
    -- Tempo desde a última atualização
    EXTRACT(DAY FROM (NOW() - ua.updated_at)) as days_since_update,
    
    -- Informações do perfil do usuário
    p.created_at as user_registration_date,
    EXTRACT(DAY FROM (NOW() - p.created_at)) as days_since_registration

FROM public.user_anamnesis ua
LEFT JOIN public.profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC;


-- QUERY RESUMO ESTATÍSTICO PARA ANÁLISE ADMINISTRATIVA
SELECT 
    'RESUMO ESTATÍSTICO DAS ANAMNESES' as title,
    COUNT(*) as total_anamneses,
    COUNT(DISTINCT ua.user_id) as unique_users,
    
    -- Estatísticas de risco
    SUM(CASE WHEN (
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
    ) >= 6 THEN 1 ELSE 0 END) as high_risk_count,
    
    SUM(CASE WHEN (
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
    ) >= 3 AND (
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
    ) < 6 THEN 1 ELSE 0 END) as moderate_risk_count,
    
    -- Problemas específicos
    SUM(CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END) as compulsive_eating_cases,
    SUM(CASE WHEN ua.current_bmi >= 30 THEN 1 ELSE 0 END) as obesity_cases,
    SUM(CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END) as family_diabetes_cases,
    SUM(CASE WHEN ua.daily_stress_level >= 7 THEN 1 ELSE 0 END) as high_stress_cases,
    
    -- Médias
    ROUND(AVG(ua.current_bmi), 2) as avg_bmi,
    ROUND(AVG(ua.food_relationship_score), 1) as avg_food_relationship_score,
    ROUND(AVG(ua.sleep_quality_score), 1) as avg_sleep_quality,
    ROUND(AVG(ua.daily_stress_level), 1) as avg_stress_level,
    
    -- Tempo médio desde criação
    ROUND(AVG(EXTRACT(DAY FROM (NOW() - ua.created_at)))) as avg_days_since_creation

FROM public.user_anamnesis ua
LEFT JOIN public.profiles p ON ua.user_id = p.user_id;


-- QUERY PARA IDENTIFICAR USUÁRIOS QUE PRECISAM ATENÇÃO IMEDIATA
SELECT 
    COALESCE(p.full_name, 'Usuário sem nome') as user_name,
    p.email,
    ua.current_bmi,
    ua.has_compulsive_eating,
    ua.daily_stress_level,
    ua.sleep_quality_score,
    ua.food_relationship_score,
    'REQUER ATENÇÃO IMEDIATA' as alert_level,
    CASE 
        WHEN ua.current_bmi >= 35 THEN 'IMC indica obesidade grau II/III'
        WHEN ua.has_compulsive_eating = true AND ua.eats_in_secret = true THEN 'Compulsão alimentar severa'
        WHEN ua.daily_stress_level >= 8 AND ua.sleep_quality_score <= 2 THEN 'Stress e sono críticos'
        WHEN ua.food_relationship_score <= 2 THEN 'Relação com comida muito problemática'
        ELSE 'Múltiplos fatores de risco'
    END as main_concern,
    ua.created_at
    
FROM public.user_anamnesis ua
LEFT JOIN public.profiles p ON ua.user_id = p.user_id
WHERE 
    ua.current_bmi >= 35 OR
    (ua.has_compulsive_eating = true AND ua.eats_in_secret = true) OR
    (ua.daily_stress_level >= 8 AND ua.sleep_quality_score <= 2) OR
    ua.food_relationship_score <= 2
ORDER BY ua.current_bmi DESC, ua.daily_stress_level DESC;
