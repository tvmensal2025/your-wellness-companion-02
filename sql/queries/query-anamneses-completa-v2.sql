-- QUERY COMPLETA DAS ANAMNESES COM NOMES DOS USUÁRIOS
-- Versão 2 - Usando campos que provavelmente existem

SELECT 
    -- Informações básicas
    ua.id as anamnesis_id,
    ua.user_id,
    COALESCE(p.full_name, 'Usuário sem nome') as nome_usuario,
    p.email as email_usuario,
    
    -- Dados pessoais (se existirem)
    ua.profession as profissao,
    ua.marital_status as estado_civil,
    
    -- Dados físicos atuais
    ua.current_weight as peso_atual_kg,
    ua.height_cm as altura_cm,
    ua.current_bmi as imc,
    CASE 
        WHEN ua.current_bmi IS NULL THEN 'Não informado'
        WHEN ua.current_bmi < 18.5 THEN 'Abaixo do peso'
        WHEN ua.current_bmi < 25 THEN 'Peso normal'
        WHEN ua.current_bmi < 30 THEN 'Sobrepeso'
        WHEN ua.current_bmi >= 30 THEN 'Obesidade'
        ELSE 'Não classificado'
    END as classificacao_imc,
    
    -- Histórico de peso
    ua.lowest_adult_weight as menor_peso_adulto,
    ua.highest_adult_weight as maior_peso_adulto,
    ua.weight_gain_started_age as idade_inicio_ganho_peso,
    
    -- Histórico familiar (fatores de risco)
    ua.family_obesity_history as familia_obesidade,
    ua.family_diabetes_history as familia_diabetes,
    ua.family_heart_disease_history as familia_coracao,
    ua.family_eating_disorders_history as familia_transtornos_alimentares,
    ua.family_depression_anxiety_history as familia_depressao_ansiedade,
    ua.family_thyroid_problems_history as familia_tireoide,
    
    -- Contagem de fatores de risco familiares
    (
        CASE WHEN ua.family_obesity_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_diabetes_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_heart_disease_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_eating_disorders_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_depression_anxiety_history = true THEN 1 ELSE 0 END +
        CASE WHEN ua.family_thyroid_problems_history = true THEN 1 ELSE 0 END
    ) as total_riscos_familiares,
    
    -- Relacionamento com comida
    ua.food_relationship_score as score_relacionamento_comida,
    CASE 
        WHEN ua.food_relationship_score IS NULL THEN 'Não avaliado'
        WHEN ua.food_relationship_score <= 3 THEN 'Muito problemático'
        WHEN ua.food_relationship_score <= 5 THEN 'Problemático'
        WHEN ua.food_relationship_score <= 7 THEN 'Regular'
        WHEN ua.food_relationship_score <= 9 THEN 'Bom'
        ELSE 'Excelente'
    END as status_relacionamento_comida,
    
    ua.has_compulsive_eating as tem_compulsao_alimentar,
    ua.feels_guilt_after_eating as sente_culpa_ao_comer,
    ua.eats_in_secret as come_escondido,
    ua.eats_until_uncomfortable as come_ate_desconforto,
    
    -- Contagem comportamentos alimentares problemáticos
    (
        CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END +
        CASE WHEN ua.feels_guilt_after_eating = true THEN 1 ELSE 0 END +
        CASE WHEN ua.eats_in_secret = true THEN 1 ELSE 0 END +
        CASE WHEN ua.eats_until_uncomfortable = true THEN 1 ELSE 0 END
    ) as comportamentos_problematicos_count,
    
    -- Qualidade de vida
    ua.sleep_hours_per_night as horas_sono_por_noite,
    ua.sleep_quality_score as score_qualidade_sono,
    CASE 
        WHEN ua.sleep_quality_score IS NULL THEN 'Não avaliado'
        WHEN ua.sleep_quality_score <= 3 THEN 'Muito ruim'
        WHEN ua.sleep_quality_score <= 5 THEN 'Ruim'
        WHEN ua.sleep_quality_score <= 7 THEN 'Regular'
        WHEN ua.sleep_quality_score <= 9 THEN 'Bom'
        ELSE 'Excelente'
    END as status_qualidade_sono,
    
    ua.daily_stress_level as nivel_stress_diario,
    CASE 
        WHEN ua.daily_stress_level IS NULL THEN 'Não avaliado'
        WHEN ua.daily_stress_level <= 3 THEN 'Baixo'
        WHEN ua.daily_stress_level <= 5 THEN 'Moderado'
        WHEN ua.daily_stress_level <= 7 THEN 'Alto'
        ELSE 'Muito alto'
    END as status_nivel_stress,
    
    ua.daily_energy_level as nivel_energia_diario,
    ua.physical_activity_frequency as frequencia_atividade_fisica,
    
    -- Tratamentos anteriores
    ua.most_effective_treatment as tratamento_mais_eficaz,
    ua.least_effective_treatment as tratamento_menos_eficaz,
    ua.had_rebound_effect as teve_efeito_rebote,
    
    -- CÁLCULO DE RISCO GERAL
    (
        -- Fatores familiares (1 ponto cada)
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
        
        -- Comportamentos alimentares
        CASE WHEN ua.has_compulsive_eating = true THEN 1 ELSE 0 END +
        CASE WHEN ua.feels_guilt_after_eating = true THEN 1 ELSE 0 END +
        CASE WHEN ua.eats_in_secret = true THEN 1 ELSE 0 END +
        
        -- Qualidade de vida
        CASE WHEN ua.daily_stress_level >= 7 THEN 1 ELSE 0 END +
        CASE WHEN ua.sleep_quality_score <= 3 THEN 1 ELSE 0 END +
        CASE WHEN ua.daily_energy_level <= 3 THEN 1 ELSE 0 END
    ) as score_risco_total,
    
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
    
    -- Datas importantes
    ua.created_at as data_criacao_anamnese,
    ua.updated_at as ultima_atualizacao_anamnese,
    
    -- Tempo desde criação (em dias)
    EXTRACT(DAY FROM (NOW() - ua.created_at)) as dias_desde_criacao,
    
    -- Dados do perfil do usuário
    p.created_at as data_registro_usuario,
    p.phone as telefone_usuario

FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC;
