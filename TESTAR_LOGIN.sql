-- Script para verificar se o usuário existe e está ativo
-- Execute este script no Supabase Dashboard para verificar o usuário

-- 1. Verificar se o usuário existe
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'rafael.ids@icloud.com';

-- 2. Verificar configurações de autenticação
SELECT 
    'Configurações de Auth' as info,
    'Verifique se o email confirmation está habilitado' as config;

-- 3. Se o usuário não existir, você pode criar um novo
-- (Descomente as linhas abaixo se necessário)
/*
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
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'rafael.ids@icloud.com',
    crypt('sua_senha_aqui', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);
*/

-- 4. Verificar se há políticas RLS que podem estar bloqueando
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'users', 'user_profiles');

