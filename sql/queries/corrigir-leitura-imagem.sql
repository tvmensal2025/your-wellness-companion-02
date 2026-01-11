-- ============================================
-- 🔧 CORREÇÃO: Sistema de Leitura de Imagens
-- ============================================
-- Este script corrige todos os problemas de leitura de imagens

-- ============================================
-- 1. CRIAR/VERIFICAR BUCKET DE IMAGENS
-- ============================================

-- Criar bucket chat-images (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

-- ============================================
-- 2. CONFIGURAR POLÍTICAS DE ACESSO
-- ============================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete chat images" ON storage.objects;

-- Política 1: Leitura pública (necessário para análise)
CREATE POLICY "Public Access to chat-images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'chat-images' );

-- Política 2: Upload para usuários autenticados
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-images'
);

-- Política 3: Usuários podem atualizar suas próprias imagens
CREATE POLICY "Users can update own chat images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chat-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'chat-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política 4: Usuários podem deletar suas próprias imagens
CREATE POLICY "Users can delete own chat images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 3. CRIAR TABELA DE LOG DE ANÁLISES
-- ============================================

CREATE TABLE IF NOT EXISTS public.image_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  analysis_type TEXT DEFAULT 'food', -- food, medical, general
  success BOOLEAN DEFAULT false,
  detected_items JSONB DEFAULT '[]'::jsonb,
  confidence_score DECIMAL(3,2),
  error_message TEXT,
  processing_time_ms INTEGER,
  model_used TEXT, -- yolo, gemini, gpt4-vision
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_image_analysis_logs_user_id ON public.image_analysis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analysis_logs_created_at ON public.image_analysis_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_analysis_logs_success ON public.image_analysis_logs(success);

-- RLS para image_analysis_logs
ALTER TABLE public.image_analysis_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analysis logs" ON public.image_analysis_logs;
CREATE POLICY "Users can view own analysis logs"
ON public.image_analysis_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert logs" ON public.image_analysis_logs;
CREATE POLICY "Service role can insert logs"
ON public.image_analysis_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- 4. CRIAR TABELA DE CACHE DE ANÁLISES
-- ============================================

CREATE TABLE IF NOT EXISTS public.image_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_hash TEXT UNIQUE NOT NULL, -- MD5 da imagem
  analysis_result JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  model_used TEXT,
  times_used INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_image_cache_hash ON public.image_analysis_cache(image_hash);
CREATE INDEX IF NOT EXISTS idx_image_cache_expires ON public.image_analysis_cache(expires_at);

-- RLS para cache (público para leitura)
ALTER TABLE public.image_analysis_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read cache" ON public.image_analysis_cache;
CREATE POLICY "Public can read cache"
ON public.image_analysis_cache FOR SELECT
TO authenticated
USING (expires_at > NOW());

DROP POLICY IF EXISTS "Service role manages cache" ON public.image_analysis_cache;
CREATE POLICY "Service role manages cache"
ON public.image_analysis_cache FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 5. FUNÇÃO: Limpar cache expirado
-- ============================================

CREATE OR REPLACE FUNCTION clean_expired_image_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.image_analysis_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- ============================================
-- 6. FUNÇÃO: Estatísticas de análise
-- ============================================

CREATE OR REPLACE FUNCTION get_user_image_analysis_stats(p_user_id UUID)
RETURNS TABLE (
  total_analyses BIGINT,
  successful_analyses BIGINT,
  failed_analyses BIGINT,
  average_confidence DECIMAL,
  most_used_model TEXT,
  total_items_detected BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_analyses,
    COUNT(*) FILTER (WHERE success = true)::BIGINT as successful_analyses,
    COUNT(*) FILTER (WHERE success = false)::BIGINT as failed_analyses,
    AVG(confidence_score) as average_confidence,
    MODE() WITHIN GROUP (ORDER BY model_used) as most_used_model,
    SUM(jsonb_array_length(detected_items))::BIGINT as total_items_detected
  FROM public.image_analysis_logs
  WHERE user_id = p_user_id;
END;
$$;

-- ============================================
-- 7. CRIAR NOTIFICAÇÕES
-- ============================================

-- Notificar quando análise falha repetidamente
CREATE OR REPLACE FUNCTION notify_analysis_failures()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  recent_failures INTEGER;
BEGIN
  -- Contar falhas nas últimas 24h
  SELECT COUNT(*) INTO recent_failures
  FROM public.image_analysis_logs
  WHERE user_id = NEW.user_id
    AND success = false
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Se mais de 5 falhas, logar
  IF recent_failures > 5 THEN
    INSERT INTO public.system_logs (
      log_type,
      message,
      metadata,
      created_at
    ) VALUES (
      'warning',
      'Multiple image analysis failures',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'failures_24h', recent_failures,
        'last_error', NEW.error_message
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para análises falhadas
DROP TRIGGER IF EXISTS trigger_notify_analysis_failures ON public.image_analysis_logs;
CREATE TRIGGER trigger_notify_analysis_failures
AFTER INSERT ON public.image_analysis_logs
FOR EACH ROW
WHEN (NEW.success = false)
EXECUTE FUNCTION notify_analysis_failures();

-- ============================================
-- 8. GRANTS DE PERMISSÕES
-- ============================================

-- Permissões para authenticated users
GRANT SELECT ON public.image_analysis_logs TO authenticated;
GRANT SELECT ON public.image_analysis_cache TO authenticated;

-- Permissões para service_role
GRANT ALL ON public.image_analysis_logs TO service_role;
GRANT ALL ON public.image_analysis_cache TO service_role;

-- Permissões para funções
GRANT EXECUTE ON FUNCTION clean_expired_image_cache() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_image_analysis_stats(UUID) TO authenticated;

-- ============================================
-- 9. CRIAR SISTEMA DE HEALTH CHECK
-- ============================================

CREATE TABLE IF NOT EXISTS public.image_service_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL, -- 'yolo', 'gemini', 'storage'
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  last_check TIMESTAMPTZ DEFAULT NOW(),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índice único por serviço (mantém apenas último status)
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_health_name 
ON public.image_service_health(service_name);

-- ============================================
-- 10. VERIFICAÇÃO FINAL
-- ============================================

DO $$
BEGIN
  -- Verificar se bucket existe
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'chat-images') THEN
    RAISE NOTICE '✅ Bucket chat-images configurado';
  ELSE
    RAISE WARNING '❌ Bucket chat-images não encontrado';
  END IF;
  
  -- Verificar políticas
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname LIKE '%chat-images%'
  ) THEN
    RAISE NOTICE '✅ Políticas de acesso configuradas';
  ELSE
    RAISE WARNING '❌ Políticas não encontradas';
  END IF;
  
  -- Verificar tabelas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'image_analysis_logs') THEN
    RAISE NOTICE '✅ Tabela de logs criada';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'image_analysis_cache') THEN
    RAISE NOTICE '✅ Tabela de cache criada';
  END IF;
  
  RAISE NOTICE '✅ Sistema de leitura de imagens configurado com sucesso!';
END $$;


