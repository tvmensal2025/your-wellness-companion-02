-- Adicionar índice único em memory_key para permitir upsert
CREATE UNIQUE INDEX IF NOT EXISTS dr_vital_memory_memory_key_unique 
ON public.dr_vital_memory (memory_key);

-- Adicionar coluna user_id para melhor organização (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dr_vital_memory' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.dr_vital_memory ADD COLUMN user_id UUID;
  END IF;
END $$;