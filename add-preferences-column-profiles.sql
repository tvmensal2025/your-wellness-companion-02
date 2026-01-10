-- Adicionar coluna preferences à tabela profiles se não existir
-- Esta coluna armazena preferências do usuário em formato JSON

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN public.profiles.preferences IS 'Preferências do usuário em formato JSON (exercícios, alimentação, etc.)';

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'preferences';