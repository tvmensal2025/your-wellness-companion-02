-- Adicionar coluna view_mode para controlar o modo de visualização da plataforma
-- Valores possíveis: 'courses', 'modules', 'lessons'

ALTER TABLE public.dashboard_settings 
ADD COLUMN IF NOT EXISTS view_mode TEXT DEFAULT 'courses';

-- Comentário para documentação
COMMENT ON COLUMN public.dashboard_settings.view_mode IS 'Modo de visualização da plataforma: courses, modules ou lessons';
