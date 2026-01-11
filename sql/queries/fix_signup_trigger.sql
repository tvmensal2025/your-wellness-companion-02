-- Script para corrigir o erro de cadastro de usuário
-- 1. Garantir que a tabela profiles tem todas as colunas necessárias
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height DECIMAL(5,2);

-- 2. Recriar a função handle_new_user para processar corretamente os metadados
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

  v_gender := NEW.raw_user_meta_data ->> 'gender';
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
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    birth_date = COALESCE(EXCLUDED.birth_date, public.profiles.birth_date),
    gender = COALESCE(EXCLUDED.gender, public.profiles.gender),
    city = COALESCE(EXCLUDED.city, public.profiles.city),
    state = COALESCE(EXCLUDED.state, public.profiles.state),
    height = COALESCE(EXCLUDED.height, public.profiles.height),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, logar mas não impedir a criação do usuário
  -- O perfil será criado depois ou o usuário ficará sem perfil temporariamente
  RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 3. Garantir que o trigger está configurado corretamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

