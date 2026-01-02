-- =================================================================
-- PARTE 6 (CORREÇÃO): FUNÇÕES E TRIGGERS DO SISTEMA
-- =================================================================

-- Função para verificar roles (com cast correto)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::TEXT = _role
  )
$$;

-- Função para verificar admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN public.has_role(auth.uid(), 'admin');
END;
$function$;

-- Atualizar função handle_new_user para incluir user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    -- Inserir perfil básico
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
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        (NEW.raw_user_meta_data->>'birth_date')::date,
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'state',
        (NEW.raw_user_meta_data->>'height')::decimal,
        NEW.raw_user_meta_data->>'gender',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        birth_date = COALESCE(EXCLUDED.birth_date, profiles.birth_date),
        city = COALESCE(EXCLUDED.city, profiles.city),
        state = COALESCE(EXCLUDED.state, profiles.state),
        height = COALESCE(EXCLUDED.height, profiles.height),
        gender = COALESCE(EXCLUDED.gender, profiles.gender),
        updated_at = NOW();
    
    -- Inserir role padrão
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falha a criação do usuário
        RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$function$;

-- Triggers para updated_at em tabelas adicionais
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_goals_updated_at') THEN
        CREATE TRIGGER update_user_goals_updated_at
          BEFORE UPDATE ON public.user_goals
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_weekly_analyses_updated_at') THEN
        CREATE TRIGGER update_weekly_analyses_updated_at
          BEFORE UPDATE ON public.weekly_analyses
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chat_configurations_updated_at') THEN
        CREATE TRIGGER update_chat_configurations_updated_at
          BEFORE UPDATE ON public.chat_configurations
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_configurations_updated_at') THEN
        CREATE TRIGGER update_company_configurations_updated_at
          BEFORE UPDATE ON public.company_configurations
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ai_fallback_configs_updated_at') THEN
        CREATE TRIGGER update_ai_fallback_configs_updated_at
          BEFORE UPDATE ON public.ai_fallback_configs
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;