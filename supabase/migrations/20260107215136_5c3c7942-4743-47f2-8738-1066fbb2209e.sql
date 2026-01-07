-- Alterar o default de show_weight_results para true (novos usuários já entram desbloqueados)
ALTER TABLE public.profiles 
ALTER COLUMN show_weight_results SET DEFAULT true;

-- Atualizar todos os perfis que ainda estão com null ou false para true
UPDATE public.profiles 
SET show_weight_results = true 
WHERE show_weight_results IS NULL OR show_weight_results = false;