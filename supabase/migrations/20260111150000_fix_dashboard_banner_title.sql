-- Corrigir título do banner da dashboard
-- O título estava como "PLATAFORMA DOS FILHOS" na imagem, mas deve ser "PLATAFORMA DOS SONHOS"

UPDATE public.dashboard_settings 
SET 
  banner_title = 'PLATAFORMA DOS SONHOS',
  banner_subtitle = 'Transforme sua vida com nossos cursos exclusivos',
  updated_at = now()
WHERE key = 'default';

-- Se não existir, inserir
INSERT INTO public.dashboard_settings (key, banner_title, banner_subtitle, banner_image_url)
VALUES (
  'default',
  'PLATAFORMA DOS SONHOS',
  'Transforme sua vida com nossos cursos exclusivos',
  '/images/capa02.png'
)
ON CONFLICT (key) DO UPDATE SET
  banner_title = EXCLUDED.banner_title,
  banner_subtitle = EXCLUDED.banner_subtitle,
  updated_at = now();
