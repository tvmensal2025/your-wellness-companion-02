-- =====================================================
-- 🔴 CORREÇÃO CRÍTICA - Sistema de Sessões
-- =====================================================
-- Data: 11 Janeiro 2026
-- Executar no: Supabase SQL Editor
-- 
-- PROBLEMAS CORRIGIDOS:
-- 1. ❌ Colunas fantasma (cycle_number, is_locked, etc) → ✅ Criadas
-- 2. ❌ Falta UNIQUE constraint → ✅ Criada (user_id, session_id)
-- 3. ❌ Status 'assigned' vs 'pending' → ✅ Padronizado
-- 4. ❌ Falta CHECK constraint → ✅ Criada para status
-- 5. ❌ session_attempt_id inexistente → ✅ Criada em daily_responses
-- 6. ❌ Índices insuficientes → ✅ Criados
-- 7. ❌ Funções RPC desatualizadas → ✅ Atualizadas
-- =====================================================

-- =====================================================
-- ANÁLISE ANTES DE EXECUTAR
-- =====================================================

-- 1. Verificar estrutura atual de user_sessions
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

-- 2. Verificar se há duplicatas (user_id + session_id)
SELECT user_id, session_id, COUNT(*) as duplicatas
FROM user_sessions
GROUP BY user_id, session_id
HAVING COUNT(*) > 1;

-- 3. Verificar status existentes
SELECT status, COUNT(*) as total
FROM user_sessions
GROUP BY status;

-- 4. Verificar constraints existentes
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'user_sessions'::regclass;

-- =====================================================
-- PARTE 1: ADICIONAR COLUNAS FALTANTES
-- =====================================================

-- auto_save_data: Dados de auto-save durante a sessão
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS auto_save_data jsonb DEFAULT '{}';

-- cycle_number: Número do ciclo atual (sessões podem ser repetidas)
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS cycle_number integer DEFAULT 1;

-- next_available_date: Quando a sessão estará disponível novamente
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS next_available_date timestamp with time zone;

-- is_locked: Se a sessão está bloqueada (aguardando próximo ciclo)
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

-- review_count: Quantas vezes o usuário revisou a sessão completa
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- Adicionar comentários
COMMENT ON COLUMN public.user_sessions.auto_save_data IS 'Dados de auto-save durante a sessão';
COMMENT ON COLUMN public.user_sessions.cycle_number IS 'Número do ciclo atual (sessões podem ser repetidas a cada 30 dias)';
COMMENT ON COLUMN public.user_sessions.next_available_date IS 'Data quando a sessão estará disponível para novo ciclo';
COMMENT ON COLUMN public.user_sessions.is_locked IS 'Se a sessão está bloqueada aguardando próximo ciclo';
COMMENT ON COLUMN public.user_sessions.review_count IS 'Quantas vezes o usuário revisou a sessão completa';

-- =====================================================
-- PARTE 2: ADICIONAR COLUNA EM daily_responses
-- =====================================================

ALTER TABLE public.daily_responses 
ADD COLUMN IF NOT EXISTS session_attempt_id text;

COMMENT ON COLUMN public.daily_responses.session_attempt_id IS 'ID único da tentativa de sessão para rastreamento';

-- =====================================================
-- PARTE 3: CORRIGIR STATUS DEFAULT E VALORES
-- =====================================================

-- Mudar default de 'assigned' para 'pending'
ALTER TABLE public.user_sessions 
ALTER COLUMN status SET DEFAULT 'pending';

-- Atualizar registros existentes com status 'assigned' ou NULL
UPDATE public.user_sessions 
SET status = 'pending' 
WHERE status = 'assigned' OR status IS NULL;

-- Corrigir qualquer status inválido
UPDATE public.user_sessions 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'in_progress', 'completed', 'cancelled');

-- =====================================================
-- PARTE 4: REMOVER DUPLICATAS
-- =====================================================

-- Identificar e remover duplicatas (manter o registro mais recente)
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY user_id, session_id 
           ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
         ) as rn
  FROM public.user_sessions
)
DELETE FROM public.user_sessions 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- =====================================================
-- PARTE 5: CRIAR UNIQUE CONSTRAINT
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_sessions_user_session_unique'
  ) THEN
    ALTER TABLE public.user_sessions 
    ADD CONSTRAINT user_sessions_user_session_unique 
    UNIQUE (user_id, session_id);
    RAISE NOTICE '✅ UNIQUE constraint criada';
  ELSE
    RAISE NOTICE '⏭️ UNIQUE constraint já existe';
  END IF;
END $$;

-- =====================================================
-- PARTE 6: CRIAR CHECK CONSTRAINT
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_sessions_status_check'
  ) THEN
    ALTER TABLE public.user_sessions 
    ADD CONSTRAINT user_sessions_status_check 
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));
    RAISE NOTICE '✅ CHECK constraint criada';
  ELSE
    RAISE NOTICE '⏭️ CHECK constraint já existe';
  END IF;
END $$;

-- =====================================================
-- PARTE 7: CRIAR ÍNDICES
-- =====================================================

-- Índice para queries ordenadas por data de atribuição
CREATE INDEX IF NOT EXISTS idx_user_sessions_assigned_at 
ON public.user_sessions(assigned_at DESC);

-- Índice parcial para sessões completas
CREATE INDEX IF NOT EXISTS idx_user_sessions_completed 
ON public.user_sessions(user_id, completed_at DESC) 
WHERE status = 'completed';

-- Índice para busca por session_id
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id 
ON public.user_sessions(session_id);

-- Índice para sessões bloqueadas
CREATE INDEX IF NOT EXISTS idx_user_sessions_locked 
ON public.user_sessions(user_id) 
WHERE is_locked = true;

-- Índice para daily_responses por session_attempt_id
CREATE INDEX IF NOT EXISTS idx_daily_responses_session_attempt 
ON public.daily_responses(session_attempt_id) 
WHERE session_attempt_id IS NOT NULL;

-- =====================================================
-- PARTE 8: CRIAR/ATUALIZAR FUNÇÕES RPC
-- =====================================================

-- Função: complete_session_cycle
CREATE OR REPLACE FUNCTION public.complete_session_cycle(
  p_user_id uuid, 
  p_session_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_cycle INTEGER;
  v_next_date TIMESTAMP WITH TIME ZONE;
  v_result JSONB;
BEGIN
  -- Buscar ciclo atual
  SELECT COALESCE(cycle_number, 1) INTO v_current_cycle
  FROM user_sessions
  WHERE user_id = p_user_id AND session_id = p_session_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Sessão não encontrada'
    );
  END IF;
  
  -- Calcular próxima data (30 dias)
  v_next_date := NOW() + INTERVAL '30 days';
  
  -- Atualizar sessão atual como completa e bloqueada
  UPDATE user_sessions 
  SET 
    status = 'completed',
    progress = 100,
    completed_at = NOW(),
    is_locked = TRUE,
    next_available_date = v_next_date,
    cycle_number = v_current_cycle,
    updated_at = NOW()
  WHERE user_id = p_user_id AND session_id = p_session_id;
  
  v_result := jsonb_build_object(
    'status', 'success',
    'cycle_completed', v_current_cycle,
    'next_cycle', v_current_cycle + 1,
    'next_available_date', v_next_date
  );
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.complete_session_cycle IS 'Completa um ciclo de sessão e bloqueia por 30 dias';

-- Função: unlock_available_sessions
CREATE OR REPLACE FUNCTION public.unlock_available_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Desbloquear sessões cuja data de disponibilidade já passou
  UPDATE user_sessions 
  SET 
    is_locked = FALSE,
    status = 'pending',
    progress = 0,
    cycle_number = cycle_number + 1,
    started_at = NULL,
    completed_at = NULL,
    next_available_date = NULL,
    updated_at = NOW()
  WHERE is_locked = TRUE 
    AND next_available_date IS NOT NULL 
    AND next_available_date <= NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.unlock_available_sessions IS 'Desbloqueia sessões que já passaram do período de espera';

-- Função: auto_save_session_progress
CREATE OR REPLACE FUNCTION public.auto_save_session_progress(
  p_user_id uuid, 
  p_session_id uuid, 
  p_progress_data jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE user_sessions 
  SET 
    auto_save_data = p_progress_data,
    progress = COALESCE((p_progress_data->>'progress')::integer, progress),
    updated_at = NOW()
  WHERE user_id = p_user_id AND session_id = p_session_id;
  
  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION public.auto_save_session_progress IS 'Salva progresso automaticamente durante a sessão';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
  v_columns_count INTEGER;
  v_constraint_exists BOOLEAN;
  v_index_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 VERIFICAÇÃO FINAL';
  RAISE NOTICE '========================================';
  
  -- Verificar colunas
  SELECT COUNT(*) INTO v_columns_count
  FROM information_schema.columns 
  WHERE table_name = 'user_sessions' 
    AND column_name IN ('auto_save_data', 'cycle_number', 'next_available_date', 'is_locked', 'review_count');
  
  IF v_columns_count = 5 THEN
    RAISE NOTICE '✅ Todas as 5 colunas criadas';
  ELSE
    RAISE WARNING '❌ Apenas % de 5 colunas encontradas', v_columns_count;
  END IF;
  
  -- Verificar constraint unique
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_sessions_user_session_unique'
  ) INTO v_constraint_exists;
  
  IF v_constraint_exists THEN
    RAISE NOTICE '✅ UNIQUE constraint (user_id, session_id) OK';
  ELSE
    RAISE WARNING '❌ UNIQUE constraint NÃO criada';
  END IF;
  
  -- Verificar constraint check
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_sessions_status_check'
  ) INTO v_constraint_exists;
  
  IF v_constraint_exists THEN
    RAISE NOTICE '✅ CHECK constraint (status) OK';
  ELSE
    RAISE WARNING '❌ CHECK constraint NÃO criada';
  END IF;
  
  -- Verificar índices
  SELECT COUNT(*) INTO v_index_count
  FROM pg_indexes 
  WHERE tablename = 'user_sessions'
    AND indexname LIKE 'idx_user_sessions%';
  
  RAISE NOTICE '✅ % índices criados para user_sessions', v_index_count;
  
  -- Verificar coluna em daily_responses
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_responses' AND column_name = 'session_attempt_id'
  ) INTO v_constraint_exists;
  
  IF v_constraint_exists THEN
    RAISE NOTICE '✅ Coluna session_attempt_id em daily_responses OK';
  ELSE
    RAISE WARNING '❌ Coluna session_attempt_id NÃO criada';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 CORREÇÃO CONCLUÍDA!';
  RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- CONSULTAS DE VERIFICAÇÃO (executar separadamente)
-- =====================================================

-- Ver estrutura final de user_sessions
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_sessions' 
-- ORDER BY ordinal_position;

-- Ver constraints
-- SELECT conname, contype, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'user_sessions'::regclass;

-- Ver índices
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'user_sessions';

-- Testar função complete_session_cycle
-- SELECT complete_session_cycle('seu-user-id'::uuid, 'seu-session-id'::uuid);
