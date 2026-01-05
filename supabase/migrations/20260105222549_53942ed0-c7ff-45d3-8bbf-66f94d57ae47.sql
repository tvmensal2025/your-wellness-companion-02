-- Persistência do banner da dashboard (configuração global)
CREATE TABLE IF NOT EXISTS public.dashboard_settings (
  key TEXT PRIMARY KEY,
  banner_title TEXT NULL,
  banner_subtitle TEXT NULL,
  banner_image_url TEXT NULL,
  banner_video_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer usuário autenticado (a dashboard é área logada)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'dashboard_settings' AND policyname = 'Authenticated users can read dashboard settings'
  ) THEN
    CREATE POLICY "Authenticated users can read dashboard settings"
    ON public.dashboard_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Escrita: apenas admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'dashboard_settings' AND policyname = 'Admins can manage dashboard settings'
  ) THEN
    CREATE POLICY "Admins can manage dashboard settings"
    ON public.dashboard_settings
    FOR ALL
    USING (public.is_admin_user())
    WITH CHECK (public.is_admin_user());
  END IF;
END $$;

-- updated_at automático
DROP TRIGGER IF EXISTS update_dashboard_settings_updated_at ON public.dashboard_settings;
CREATE TRIGGER update_dashboard_settings_updated_at
BEFORE UPDATE ON public.dashboard_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed inicial (não sobrescreve se já existir)
INSERT INTO public.dashboard_settings (key, banner_title, banner_subtitle, banner_image_url)
VALUES (
  'default',
  'PLATAFORMA DOS SONHOS',
  'Transforme sua vida com nossos cursos exclusivos',
  'https://45.67.221.216:8086/capa01.png'
)
ON CONFLICT (key) DO NOTHING;
