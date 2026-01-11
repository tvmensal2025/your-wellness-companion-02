-- MIGRAÇÃO COMPLETA PARA GARANTIR TODOS OS CAMPOS DA ANAMNESE
-- Execute este script no SQL Editor do Supabase para garantir que a tabela user_anamnesis
-- tenha TODAS as colunas necessárias para o formulário funcionar sem erros.

-- 1. Garantir que a tabela existe
CREATE TABLE IF NOT EXISTS public.user_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_final BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0,
  CONSTRAINT unique_user_anamnesis UNIQUE (user_id)
);

-- 2. Habilitar RLS (Segurança)
ALTER TABLE public.user_anamnesis ENABLE ROW LEVEL SECURITY;

-- 3. Adicionar/Garantir TODAS as colunas necessárias (uma por uma para evitar erros)

-- Dados Pessoais
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS marital_status TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS how_found_method TEXT;

-- Histórico Familiar (Booleanos)
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS family_obesity_history BOOLEAN;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS family_diabetes_history BOOLEAN;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS family_heart_disease_history BOOLEAN;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS family_eating_disorders_history BOOLEAN;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS family_depression_anxiety_history BOOLEAN;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS family_thyroid_problems_history BOOLEAN;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS family_other_chronic_diseases TEXT;

-- Histórico de Peso
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS weight_gain_started_age INTEGER;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS lowest_adult_weight DECIMAL(5,2);
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS highest_adult_weight DECIMAL(5,2);
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS major_weight_gain_periods TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS emotional_events_during_weight_gain TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS weight_fluctuation_classification TEXT;

-- Tratamentos Anteriores
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS previous_weight_treatments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS most_effective_treatment TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS least_effective_treatment TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS had_rebound_effect BOOLEAN;

-- Medicações Atuais
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS current_medications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS chronic_diseases JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS supplements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS herbal_medicines JSONB DEFAULT '[]'::jsonb;

-- Relacionamento com Comida
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS food_relationship_score INTEGER;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS has_compulsive_eating BOOLEAN;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS compulsive_eating_situations TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS problematic_foods JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS forbidden_foods JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS feels_guilt_after_eating BOOLEAN;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS eats_in_secret BOOLEAN;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS eats_until_uncomfortable BOOLEAN;

-- Qualidade de Vida
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS sleep_hours_per_night DECIMAL(3,1);
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS sleep_quality_score INTEGER;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS daily_stress_level INTEGER;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS physical_activity_type TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS physical_activity_frequency TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS daily_energy_level INTEGER;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS general_quality_of_life INTEGER;

-- Objetivos e Expectativas (Novos Campos)
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS main_treatment_goals TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS ideal_weight_goal DECIMAL(5,2);
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS timeframe_to_achieve_goal TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS biggest_weight_loss_challenge TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS treatment_success_definition TEXT;
ALTER TABLE public.user_anamnesis ADD COLUMN IF NOT EXISTS motivation_for_seeking_treatment TEXT;

-- 4. Garantir permissões (Policies)
-- Remove policies antigas para evitar conflitos e recria corretamente
DROP POLICY IF EXISTS "Users can view their own anamnesis" ON public.user_anamnesis;
DROP POLICY IF EXISTS "Users can insert their own anamnesis" ON public.user_anamnesis;
DROP POLICY IF EXISTS "Users can update their own anamnesis" ON public.user_anamnesis;
DROP POLICY IF EXISTS "Users can manage their anamnesis" ON public.user_anamnesis;

-- Política unificada de gerenciamento (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Users can manage their anamnesis"
ON public.user_anamnesis
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Garantir Trigger de Updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_anamnesis_updated_at ON public.user_anamnesis;
CREATE TRIGGER update_user_anamnesis_updated_at
    BEFORE UPDATE ON public.user_anamnesis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Confirmação
SELECT 'Tabela user_anamnesis atualizada com sucesso com TODAS as colunas!' as status;
