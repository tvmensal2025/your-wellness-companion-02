-- ============================================
-- 🔧 CORREÇÃO: Problema ao Salvar Programa de Casa
-- ============================================
-- Este script corrige o erro ao salvar programas de exercícios em casa

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT '🔍 VERIFICANDO TABELA sport_training_plans:' as info;

-- Verificar se a tabela existe
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'sport_training_plans';

-- 2. CRIAR TABELA SE NÃO EXISTIR
SELECT '📋 CRIANDO TABELA sport_training_plans:' as info;

CREATE TABLE IF NOT EXISTS public.sport_training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modality TEXT NOT NULL DEFAULT 'functional',
  plan_name TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL DEFAULT 'beginner',
  goal TEXT NOT NULL DEFAULT 'general_fitness',
  location TEXT NOT NULL DEFAULT 'home',
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  frequency_per_week INTEGER NOT NULL DEFAULT 3,
  time_per_session TEXT NOT NULL DEFAULT '30 minutos',
  is_active BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completion_date TIMESTAMPTZ,
  week_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_week INTEGER NOT NULL DEFAULT 1,
  total_workouts INTEGER NOT NULL DEFAULT 0,
  completed_workouts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CRIAR TABELA DE LOGS SE NÃO EXISTIR
SELECT '📊 CRIANDO TABELA sport_workout_logs:' as info;

CREATE TABLE IF NOT EXISTS public.sport_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.sport_training_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL DEFAULT 1,
  day_number INTEGER NOT NULL DEFAULT 1,
  workout_type TEXT NOT NULL DEFAULT 'general',
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
SELECT '⚡ CRIANDO ÍNDICES:' as info;

CREATE INDEX IF NOT EXISTS idx_sport_training_plans_user_id ON public.sport_training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_training_plans_active ON public.sport_training_plans(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sport_workout_logs_user_plan ON public.sport_workout_logs(user_id, plan_id);
CREATE INDEX IF NOT EXISTS idx_sport_workout_logs_completed ON public.sport_workout_logs(plan_id, completed_at) WHERE completed = true;

-- 5. CONFIGURAR RLS (ROW LEVEL SECURITY)
SELECT '🔒 CONFIGURANDO RLS:' as info;

-- Ativar RLS
ALTER TABLE public.sport_training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_workout_logs ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own training plans" ON public.sport_training_plans;
DROP POLICY IF EXISTS "Users can insert own training plans" ON public.sport_training_plans;
DROP POLICY IF EXISTS "Users can update own training plans" ON public.sport_training_plans;
DROP POLICY IF EXISTS "Users can delete own training plans" ON public.sport_training_plans;

DROP POLICY IF EXISTS "Users can view own workout logs" ON public.sport_workout_logs;
DROP POLICY IF EXISTS "Users can insert own workout logs" ON public.sport_workout_logs;
DROP POLICY IF EXISTS "Users can update own workout logs" ON public.sport_workout_logs;

-- Criar políticas para sport_training_plans
CREATE POLICY "Users can view own training plans"
ON public.sport_training_plans FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training plans"
ON public.sport_training_plans FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training plans"
ON public.sport_training_plans FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own training plans"
ON public.sport_training_plans FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Criar políticas para sport_workout_logs
CREATE POLICY "Users can view own workout logs"
ON public.sport_workout_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs"
ON public.sport_workout_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
ON public.sport_workout_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. CRIAR TRIGGER PARA UPDATED_AT
SELECT '🔄 CRIANDO TRIGGER updated_at:' as info;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sport_training_plans
DROP TRIGGER IF EXISTS update_sport_training_plans_updated_at ON public.sport_training_plans;
CREATE TRIGGER update_sport_training_plans_updated_at
  BEFORE UPDATE ON public.sport_training_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. VERIFICAÇÃO FINAL
SELECT '✅ VERIFICAÇÃO FINAL:' as info;

-- Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'sport_training_plans' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('sport_training_plans', 'sport_workout_logs')
ORDER BY tablename, policyname;

-- 8. TESTE DE INSERÇÃO (OPCIONAL)
SELECT '🧪 TESTE DE INSERÇÃO:' as info;

-- Inserir um programa de teste (comentado para não interferir)
/*
INSERT INTO public.sport_training_plans (
  user_id,
  modality,
  plan_name,
  level,
  goal,
  location,
  duration_weeks,
  frequency_per_week,
  time_per_session,
  week_plan,
  is_active
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'home_bodyweight',
  'Teste - Programa Casa',
  'beginner',
  'general_fitness',
  'casa_sem',
  4,
  3,
  '30 minutos',
  '[{"week": 1, "activities": ["Caminhada 10min", "Alongamento 5min"]}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;
*/

-- 9. PERMISSÕES FINAIS
SELECT '🔐 CONFIGURANDO PERMISSÕES:' as info;

-- Garantir que usuários autenticados podem acessar
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sport_training_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sport_workout_logs TO authenticated;

-- Garantir que service_role pode acessar (para Edge Functions)
GRANT ALL ON public.sport_training_plans TO service_role;
GRANT ALL ON public.sport_workout_logs TO service_role;

-- 10. VERIFICAÇÃO DE SUCESSO
SELECT '🎉 CORREÇÃO CONCLUÍDA!' as info;

-- Mostrar resumo
SELECT 
  'sport_training_plans' as tabela,
  COUNT(*) as registros_existentes
FROM public.sport_training_plans
UNION ALL
SELECT 
  'sport_workout_logs' as tabela,
  COUNT(*) as registros_existentes
FROM public.sport_workout_logs;

-- Mensagem final
SELECT '✅ Sistema de exercícios corrigido! Agora você pode salvar programas de casa.' as resultado;

