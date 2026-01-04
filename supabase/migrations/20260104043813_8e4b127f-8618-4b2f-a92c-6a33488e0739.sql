-- Corrigir função assign_session_to_users (erro: set-returning functions are not allowed in WHERE)
CREATE OR REPLACE FUNCTION public.assign_session_to_users(session_id_param uuid, user_ids_param uuid[])
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    u.user_id,
    session_id_param,
    'pending',
    0,
    NOW()
  FROM unnest(user_ids_param) AS u(user_id)
  WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_sessions us 
    WHERE us.user_id = u.user_id
      AND us.session_id = session_id_param
  );

  GET DIAGNOSTICS users_count = ROW_COUNT;
  
  RAISE NOTICE 'Sessão atribuída a % usuários', users_count;
  RETURN TRUE;
END;
$function$;