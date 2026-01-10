
-- Criar função para buscar e sincronizar usuário órfão por telefone
CREATE OR REPLACE FUNCTION public.find_and_sync_orphan_user_by_phone(p_phone TEXT)
RETURNS TABLE(user_id UUID, email TEXT, full_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_user RECORD;
  v_clean_phone TEXT;
  v_full_name TEXT;
  v_gender TEXT;
BEGIN
  -- Limpar telefone
  v_clean_phone := regexp_replace(p_phone, '\D', '', 'g');
  
  -- Buscar em auth.users pelo telefone nos metadados
  SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data
  INTO v_auth_user
  FROM auth.users u
  WHERE 
    regexp_replace(u.raw_user_meta_data->>'phone', '\D', '', 'g') LIKE '%' || v_clean_phone || '%'
    OR regexp_replace(u.phone, '\D', '', 'g') LIKE '%' || v_clean_phone || '%'
  LIMIT 1;
  
  -- Se não encontrou, retornar vazio
  IF v_auth_user.id IS NULL THEN
    RETURN;
  END IF;
  
  -- Extrair dados
  v_full_name := COALESCE(
    v_auth_user.raw_user_meta_data->>'full_name',
    v_auth_user.raw_user_meta_data->>'name',
    SPLIT_PART(v_auth_user.email, '@', 1)
  );
  
  -- Validar gender
  v_gender := v_auth_user.raw_user_meta_data->>'gender';
  IF v_gender IS NOT NULL AND v_gender NOT IN ('male', 'female', 'other', 'masculino', 'feminino') THEN
    v_gender := NULL;
  END IF;
  
  -- Criar profile se não existir
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    phone,
    birth_date,
    city,
    state,
    height,
    gender,
    role,
    created_at,
    updated_at
  )
  VALUES (
    v_auth_user.id,
    v_auth_user.email,
    v_full_name,
    v_auth_user.raw_user_meta_data->>'phone',
    CASE 
      WHEN v_auth_user.raw_user_meta_data->>'birth_date' ~ '^\d{4}-\d{2}-\d{2}$'
      THEN (v_auth_user.raw_user_meta_data->>'birth_date')::DATE 
      ELSE NULL 
    END,
    v_auth_user.raw_user_meta_data->>'city',
    v_auth_user.raw_user_meta_data->>'state',
    CASE 
      WHEN v_auth_user.raw_user_meta_data->>'height' ~ '^\d+\.?\d*$'
      THEN (v_auth_user.raw_user_meta_data->>'height')::DECIMAL(5,2) 
      ELSE NULL 
    END,
    v_gender,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Retornar dados do usuário
  RETURN QUERY
  SELECT 
    v_auth_user.id as user_id,
    v_auth_user.email::TEXT as email,
    v_full_name as full_name;
END;
$$;
