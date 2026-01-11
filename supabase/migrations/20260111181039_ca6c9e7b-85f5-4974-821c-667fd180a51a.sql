
-- =====================================================
-- CORREÇÃO CRÍTICA - Sistema de Sessões
-- =====================================================

-- PARTE 1: ADICIONAR COLUNAS FALTANTES EM user_sessions
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS auto_save_data jsonb DEFAULT '{}';

ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS cycle_number integer DEFAULT 1;

ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS next_available_date timestamp with time zone;

ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- Comentários
COMMENT ON COLUMN public.user_sessions.auto_save_data IS 'Dados de auto-save durante a sessão';
COMMENT ON COLUMN public.user_sessions.cycle_number IS 'Número do ciclo atual (sessões podem ser repetidas a cada 30 dias)';
COMMENT ON COLUMN public.user_sessions.next_available_date IS 'Data quando a sessão estará disponível para novo ciclo';
COMMENT ON COLUMN public.user_sessions.is_locked IS 'Se a sessão está bloqueada aguardando próximo ciclo';
COMMENT ON COLUMN public.user_sessions.review_count IS 'Quantas vezes o usuário revisou a sessão completa';

-- PARTE 2: ADICIONAR COLUNA EM daily_responses
ALTER TABLE public.daily_responses 
ADD COLUMN IF NOT EXISTS session_attempt_id text;

COMMENT ON COLUMN public.daily_responses.session_attempt_id IS 'ID único da tentativa de sessão para rastreamento';

-- PARTE 3: CORRIGIR STATUS DEFAULT
ALTER TABLE public.user_sessions 
ALTER COLUMN status SET DEFAULT 'pending';

-- Atualizar registros com status 'assigned'
UPDATE public.user_sessions 
SET status = 'pending' 
WHERE status = 'assigned' OR status IS NULL;

-- PARTE 4: CRIAR UNIQUE CONSTRAINT
ALTER TABLE public.user_sessions 
ADD CONSTRAINT user_sessions_user_session_unique 
UNIQUE (user_id, session_id);

-- PARTE 5: CRIAR CHECK CONSTRAINT (usando trigger por segurança)
CREATE OR REPLACE FUNCTION public.validate_user_session_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'in_progress', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Status inválido: %. Valores permitidos: pending, in_progress, completed, cancelled', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DROP TRIGGER IF EXISTS validate_user_session_status_trigger ON public.user_sessions;
CREATE TRIGGER validate_user_session_status_trigger
  BEFORE INSERT OR UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_session_status();

-- PARTE 6: CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_user_sessions_assigned_at 
ON public.user_sessions(assigned_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_completed 
ON public.user_sessions(user_id, completed_at DESC) 
WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id 
ON public.user_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_locked 
ON public.user_sessions(user_id) 
WHERE is_locked = true;

CREATE INDEX IF NOT EXISTS idx_daily_responses_session_attempt 
ON public.daily_responses(session_attempt_id) 
WHERE session_attempt_id IS NOT NULL;

-- PARTE 7: FUNÇÕES RPC

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
  SELECT COALESCE(cycle_number, 1) INTO v_current_cycle
  FROM user_sessions
  WHERE user_id = p_user_id AND session_id = p_session_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Sessão não encontrada'
    );
  END IF;

  v_next_date := NOW() + INTERVAL '30 days';

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
