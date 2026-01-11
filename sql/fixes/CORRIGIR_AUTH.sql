-- Script para corrigir problemas de autenticação
-- Execute este script no Supabase Dashboard

-- 1. Verificar se o usuário existe
DO $$
DECLARE
    user_exists boolean;
    user_id uuid;
BEGIN
    -- Verificar se o usuário existe
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = 'rafael.ids@icloud.com'
    ) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'Usuário encontrado: rafael.ids@icloud.com';
        
        -- Confirmar email se não estiver confirmado
        UPDATE auth.users 
        SET 
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE email = 'rafael.ids@icloud.com';
        
        RAISE NOTICE 'Email confirmado com sucesso!';
        
    ELSE
        RAISE NOTICE 'Usuário não encontrado. Criando novo usuário...';
        
        -- Criar novo usuário
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            raw_app_meta_data,
            is_super_admin,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'rafael.ids@icloud.com',
            crypt('123456', gen_salt('bf')), -- Senha: 123456
            NOW(),
            NOW(),
            NOW(),
            '{"full_name": "Rafael"}',
            '{"provider": "email", "providers": ["email"]}',
            false,
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE 'Usuário criado com sucesso! Email: rafael.ids@icloud.com, Senha: 123456';
    END IF;
END $$;

-- 2. Verificar/criar perfil do usuário
DO $$
DECLARE
    user_id uuid;
    profile_exists boolean;
BEGIN
    -- Obter ID do usuário
    SELECT id INTO user_id FROM auth.users WHERE email = 'rafael.ids@icloud.com';
    
    IF user_id IS NOT NULL THEN
        -- Verificar se o perfil existe
        SELECT EXISTS(
            SELECT 1 FROM public.profiles 
            WHERE id = user_id
        ) INTO profile_exists;
        
        IF NOT profile_exists THEN
            -- Criar perfil básico
            INSERT INTO public.profiles (
                id,
                full_name,
                email,
                created_at,
                updated_at
            ) VALUES (
                user_id,
                'Rafael',
                'rafael.ids@icloud.com',
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Perfil criado com sucesso!';
        ELSE
            RAISE NOTICE 'Perfil já existe.';
        END IF;
    END IF;
END $$;

-- 3. Verificar políticas RLS
DO $$
BEGIN
    -- Habilitar RLS na tabela profiles se não estiver habilitado
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'profiles' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela profiles.';
    END IF;
    
    -- Criar políticas se não existirem
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
        RAISE NOTICE 'Política de visualização criada.';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
        RAISE NOTICE 'Política de atualização criada.';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
        RAISE NOTICE 'Política de inserção criada.';
    END IF;
END $$;

-- 4. Verificar configurações de autenticação
SELECT 
    'Configurações verificadas' as status,
    'Tente fazer login novamente' as instrucao;

-- 5. Mostrar informações do usuário
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'rafael.ids@icloud.com';

