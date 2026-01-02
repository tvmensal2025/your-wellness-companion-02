-- =================================================================
-- PARTE 1: TIPOS CUSTOMIZADOS E TABELAS AUXILIARES
-- =================================================================

-- Criar tipo para roles do sistema
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela: user_roles (Sistema de roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID,
    UNIQUE (user_id, role)
);

-- Tabela: ai_presets (Presets de IA)
CREATE TABLE IF NOT EXISTS public.ai_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preset_name TEXT NOT NULL,
    preset_level TEXT NOT NULL,
    service TEXT NOT NULL,
    model TEXT NOT NULL,
    description TEXT,
    temperature NUMERIC NOT NULL,
    max_tokens INTEGER NOT NULL,
    is_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: ai_usage_logs (Logs de uso de IA)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    service_name TEXT,
    model TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: ai_fallback_configs (Configurações de fallback de IA)
CREATE TABLE IF NOT EXISTS public.ai_fallback_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    functionality TEXT NOT NULL UNIQUE,
    primary_service TEXT NOT NULL,
    fallback_service TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_fallback_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para ai_presets
CREATE POLICY "Everyone can view AI presets" ON public.ai_presets
  FOR SELECT USING (true);

-- Políticas RLS para ai_usage_logs
CREATE POLICY "Users can view their own AI usage" ON public.ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage" ON public.ai_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para ai_fallback_configs
CREATE POLICY "Everyone can view AI fallback configs" ON public.ai_fallback_configs
  FOR SELECT USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at);