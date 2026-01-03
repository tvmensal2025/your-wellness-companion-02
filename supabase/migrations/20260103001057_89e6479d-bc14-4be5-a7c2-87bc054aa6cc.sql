-- Adicionar colunas faltantes na tabela user_goals para sistema de aprovação

-- 1. Coluna para identificar qual admin aprovou/rejeitou
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- 2. Coluna para motivo de rejeição
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Coluna para pontos finais concedidos
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS final_points INTEGER;

-- 4. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON public.user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_approved_by ON public.user_goals(approved_by);

-- 5. Adicionar comentários para documentação
COMMENT ON COLUMN public.user_goals.approved_by IS 'ID do admin que aprovou ou rejeitou a meta';
COMMENT ON COLUMN public.user_goals.rejection_reason IS 'Motivo da rejeição da meta';
COMMENT ON COLUMN public.user_goals.final_points IS 'Pontos finais concedidos quando a meta é aprovada';
COMMENT ON COLUMN public.user_goals.admin_notes IS 'Notas adicionais do admin sobre a decisão';