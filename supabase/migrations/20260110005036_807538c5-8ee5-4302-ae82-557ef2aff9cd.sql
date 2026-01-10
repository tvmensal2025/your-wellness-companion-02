
-- 1. Garantir que a função handle_new_user está atualizada com validação de gender
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
  v_birth_date DATE;
  v_gender TEXT;
  v_city TEXT;
  v_state TEXT;
  v_height DECIMAL(5,2);
BEGIN
  -- Extrair dados dos metadados do usuário
  v_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  v_phone := NEW.raw_user_meta_data ->> 'phone';
  
  -- Tratamento seguro para data de nascimento
  BEGIN
    v_birth_date := (NEW.raw_user_meta_data ->> 'birth_date')::DATE;
  EXCEPTION WHEN OTHERS THEN
    v_birth_date := NULL;
  END;

  -- Validar gender contra valores permitidos
  v_gender := NEW.raw_user_meta_data ->> 'gender';
  IF v_gender IS NOT NULL AND v_gender NOT IN ('male', 'female', 'other', 'masculino', 'feminino') THEN
    v_gender := NULL;
  END IF;

  v_city := NEW.raw_user_meta_data ->> 'city';
  v_state := NEW.raw_user_meta_data ->> 'state';
  
  -- Tratamento seguro para altura
  BEGIN
    v_height := (NEW.raw_user_meta_data ->> 'height')::DECIMAL(5,2);
  EXCEPTION WHEN OTHERS THEN
    v_height := NULL;
  END;

  -- Inserir no perfil
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    phone,
    birth_date,
    gender,
    city,
    state,
    height,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_full_name,
    NEW.email,
    v_phone,
    v_birth_date,
    v_gender,
    v_city,
    v_state,
    v_height,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    birth_date = COALESCE(EXCLUDED.birth_date, public.profiles.birth_date),
    gender = COALESCE(EXCLUDED.gender, public.profiles.gender),
    city = COALESCE(EXCLUDED.city, public.profiles.city),
    state = COALESCE(EXCLUDED.state, public.profiles.state),
    height = COALESCE(EXCLUDED.height, public.profiles.height),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 2. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Sincronizar usuários órfãos (com validação de gender)
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
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1)),
    u.raw_user_meta_data->>'phone',
    CASE 
      WHEN u.raw_user_meta_data->>'birth_date' IS NOT NULL 
           AND u.raw_user_meta_data->>'birth_date' ~ '^\d{4}-\d{2}-\d{2}$'
      THEN (u.raw_user_meta_data->>'birth_date')::date 
      ELSE NULL 
    END,
    u.raw_user_meta_data->>'city',
    u.raw_user_meta_data->>'state',
    CASE 
      WHEN u.raw_user_meta_data->>'height' IS NOT NULL 
           AND u.raw_user_meta_data->>'height' ~ '^\d+\.?\d*$'
      THEN (u.raw_user_meta_data->>'height')::decimal(5,2) 
      ELSE NULL 
    END,
    -- Validar gender contra valores permitidos
    CASE 
      WHEN u.raw_user_meta_data->>'gender' IN ('male', 'female', 'other', 'masculino', 'feminino')
      THEN u.raw_user_meta_data->>'gender'
      ELSE NULL
    END,
    'user',
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;
