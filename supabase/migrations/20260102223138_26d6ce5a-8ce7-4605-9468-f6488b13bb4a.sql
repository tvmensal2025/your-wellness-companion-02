-- 1) Garantir que a tabela de metas tenha o campo usado pelo frontend
ALTER TABLE public.user_goals
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

COMMENT ON COLUMN public.user_goals.admin_notes IS 'Comentários do administrador ao aprovar/reprovar metas';