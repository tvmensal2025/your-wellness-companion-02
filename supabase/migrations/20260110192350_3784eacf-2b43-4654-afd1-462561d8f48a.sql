-- Adicionar coluna preferences à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN public.profiles.preferences IS 'Preferências do usuário em formato JSON (exercícios, alimentação, etc.)';