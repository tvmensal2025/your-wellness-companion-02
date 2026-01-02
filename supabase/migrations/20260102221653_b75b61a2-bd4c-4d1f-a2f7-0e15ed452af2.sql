-- Garantir trigger para criar/atualizar perfil (inclui altura) quando um usuário é criado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Backfill: criar perfis para usuários antigos que ainda não têm registro em profiles
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
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  u.raw_user_meta_data->>'phone',
  (u.raw_user_meta_data->>'birth_date')::date,
  u.raw_user_meta_data->>'city',
  u.raw_user_meta_data->>'state',
  (u.raw_user_meta_data->>'height')::decimal,
  u.raw_user_meta_data->>'gender',
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL;