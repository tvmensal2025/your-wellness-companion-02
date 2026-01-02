-- Deixar a tabela public.user_anamnesis 100% compatível com o frontend SystemicAnamnesis
-- Sem remover nada; apenas adiciona colunas que o código já usa

ALTER TABLE public.user_anamnesis
  -- Dados pessoais
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  ADD COLUMN IF NOT EXISTS how_found_method TEXT,

  -- Histórico familiar detalhado
  ADD COLUMN IF NOT EXISTS family_obesity_history BOOLEAN,
  ADD COLUMN IF NOT EXISTS family_diabetes_history BOOLEAN,
  ADD COLUMN IF NOT EXISTS family_heart_disease_history BOOLEAN,
  ADD COLUMN IF NOT EXISTS family_eating_disorders_history BOOLEAN,
  ADD COLUMN IF NOT EXISTS family_depression_anxiety_history BOOLEAN,
  ADD COLUMN IF NOT EXISTS family_thyroid_problems_history BOOLEAN,
  ADD COLUMN IF NOT EXISTS family_other_chronic_diseases TEXT,

  -- Histórico de peso (algumas já existem ou foram adicionadas em migrações anteriores)
  ADD COLUMN IF NOT EXISTS lowest_adult_weight NUMERIC,
  ADD COLUMN IF NOT EXISTS highest_adult_weight NUMERIC,
  ADD COLUMN IF NOT EXISTS weight_gain_started_age INTEGER,
  ADD COLUMN IF NOT EXISTS major_weight_gain_periods TEXT,
  ADD COLUMN IF NOT EXISTS emotional_events_during_weight_gain TEXT,
  ADD COLUMN IF NOT EXISTS weight_fluctuation_classification TEXT,

  -- Tratamentos anteriores
  ADD COLUMN IF NOT EXISTS previous_weight_treatments TEXT,
  ADD COLUMN IF NOT EXISTS most_effective_treatment TEXT,
  ADD COLUMN IF NOT EXISTS least_effective_treatment TEXT,
  ADD COLUMN IF NOT EXISTS had_rebound_effect BOOLEAN,

  -- Medicações e condições (já existiam em parte, aqui garantimos todas)
  ADD COLUMN IF NOT EXISTS current_medications TEXT,
  ADD COLUMN IF NOT EXISTS chronic_diseases TEXT,
  ADD COLUMN IF NOT EXISTS supplements TEXT,
  ADD COLUMN IF NOT EXISTS herbal_medicines TEXT,

  -- Relacionamento com comida
  ADD COLUMN IF NOT EXISTS food_relationship_score INTEGER,
  ADD COLUMN IF NOT EXISTS has_compulsive_eating BOOLEAN,
  ADD COLUMN IF NOT EXISTS compulsive_eating_situations TEXT,
  ADD COLUMN IF NOT EXISTS problematic_foods TEXT,
  ADD COLUMN IF NOT EXISTS forbidden_foods TEXT,
  ADD COLUMN IF NOT EXISTS feels_guilt_after_eating BOOLEAN,
  ADD COLUMN IF NOT EXISTS eats_in_secret BOOLEAN,
  ADD COLUMN IF NOT EXISTS eats_until_uncomfortable BOOLEAN,

  -- Qualidade de vida
  ADD COLUMN IF NOT EXISTS sleep_hours_per_night NUMERIC,
  ADD COLUMN IF NOT EXISTS sleep_quality_score INTEGER,
  ADD COLUMN IF NOT EXISTS daily_stress_level TEXT,
  ADD COLUMN IF NOT EXISTS physical_activity_type TEXT,
  ADD COLUMN IF NOT EXISTS physical_activity_frequency TEXT,
  ADD COLUMN IF NOT EXISTS daily_energy_level INTEGER,
  ADD COLUMN IF NOT EXISTS general_quality_of_life INTEGER,

  -- Objetivos e expectativas
  ADD COLUMN IF NOT EXISTS main_treatment_goals TEXT,
  ADD COLUMN IF NOT EXISTS ideal_weight_goal NUMERIC,
  ADD COLUMN IF NOT EXISTS timeframe_to_achieve_goal TEXT,
  ADD COLUMN IF NOT EXISTS biggest_weight_loss_challenge TEXT,
  ADD COLUMN IF NOT EXISTS treatment_success_definition TEXT,
  ADD COLUMN IF NOT EXISTS motivation_for_seeking_treatment TEXT;

-- Comentários principais para documentação (não afetam execução)
COMMENT ON COLUMN public.user_anamnesis.profession IS 'Profissão do paciente';
COMMENT ON COLUMN public.user_anamnesis.marital_status IS 'Estado civil';
COMMENT ON COLUMN public.user_anamnesis.how_found_method IS 'Como conheceu o método/Instituto';
COMMENT ON COLUMN public.user_anamnesis.food_relationship_score IS 'Escala de 0–10 para relação com a comida';
COMMENT ON COLUMN public.user_anamnesis.general_quality_of_life IS 'Escala geral de qualidade de vida';