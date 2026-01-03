-- Função para atribuir sessão a todos os usuários
CREATE OR REPLACE FUNCTION public.assign_session_to_all_users(session_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  users_count INTEGER;
BEGIN
  -- Verificar se a sessão existe
  IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id_param) THEN
    RAISE EXCEPTION 'Sessão não encontrada';
  END IF;

  -- Inserir atribuições para todos os usuários que ainda não têm essa sessão
  INSERT INTO public.user_sessions (user_id, session_id, status, progress, assigned_at)
  SELECT 
    p.user_id,
    session_id_param,
    'pending',
    0,
    NOW()
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_sessions us 
    WHERE us.user_id = p.user_id 
      AND us.session_id = session_id_param
  );

  GET DIAGNOSTICS users_count = ROW_COUNT;
  
  RAISE NOTICE 'Sessão atribuída a % usuários', users_count;
  RETURN TRUE;
END;
$$;

-- Função para atribuir sessão a usuários específicos
CREATE OR REPLACE FUNCTION public.assign_session_to_users(
  session_id_param UUID,
  user_ids_param UUID[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  users_count INTEGER;
BEGIN
  -- Verificar se a sessão existe
  IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id_param) THEN
    RAISE EXCEPTION 'Sessão não encontrada';
  END IF;

  -- Inserir atribuições para os usuários selecionados que ainda não têm essa sessão
  INSERT INTO public.user_sessions (user_id, session_id, status, progress, assigned_at)
  SELECT 
    unnest(user_ids_param),
    session_id_param,
    'pending',
    0,
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_sessions us 
    WHERE us.user_id = unnest(user_ids_param)
      AND us.session_id = session_id_param
  );

  GET DIAGNOSTICS users_count = ROW_COUNT;
  
  RAISE NOTICE 'Sessão atribuída a % usuários', users_count;
  RETURN TRUE;
END;
$$;