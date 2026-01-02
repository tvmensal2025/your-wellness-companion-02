-- 1. Criar tabela alimentos_completos (base de alimentos TACO)
CREATE TABLE IF NOT EXISTS public.alimentos_completos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  categoria TEXT,
  aliases TEXT[],
  unidade_padrao TEXT DEFAULT '100g',
  peso_medio_g NUMERIC,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para alimentos_completos
CREATE INDEX IF NOT EXISTS idx_alimentos_nome ON public.alimentos_completos(nome);
CREATE INDEX IF NOT EXISTS idx_alimentos_categoria ON public.alimentos_completos(categoria);

-- RLS para alimentos_completos
ALTER TABLE public.alimentos_completos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view alimentos" ON public.alimentos_completos
  FOR SELECT USING (true);

-- Comentários
COMMENT ON TABLE public.alimentos_completos IS 'Catálogo completo de alimentos da base TACO';
COMMENT ON COLUMN public.alimentos_completos.aliases IS 'Nomes alternativos para o alimento';

-- 2. Criar tabela valores_nutricionais_completos (valores nutricionais TACO)
CREATE TABLE IF NOT EXISTS public.valores_nutricionais_completos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alimento_id UUID REFERENCES public.alimentos_completos(id) ON DELETE CASCADE,
  alimento_nome TEXT NOT NULL,
  kcal NUMERIC,
  proteina NUMERIC,
  gorduras NUMERIC,
  carboidratos NUMERIC,
  fibras NUMERIC,
  sodio NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para valores_nutricionais_completos
CREATE INDEX IF NOT EXISTS idx_valores_alimento_id ON public.valores_nutricionais_completos(alimento_id);
CREATE INDEX IF NOT EXISTS idx_valores_alimento_nome ON public.valores_nutricionais_completos(alimento_nome);

-- RLS para valores_nutricionais_completos
ALTER TABLE public.valores_nutricionais_completos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view valores nutricionais" ON public.valores_nutricionais_completos
  FOR SELECT USING (true);

-- Comentários
COMMENT ON TABLE public.valores_nutricionais_completos IS 'Base robusta TACO com todos os valores nutricionais por 100g';
COMMENT ON COLUMN public.valores_nutricionais_completos.kcal IS 'Calorias por 100g';
COMMENT ON COLUMN public.valores_nutricionais_completos.proteina IS 'Proteínas em gramas por 100g';
COMMENT ON COLUMN public.valores_nutricionais_completos.gorduras IS 'Gorduras totais em gramas por 100g';
COMMENT ON COLUMN public.valores_nutricionais_completos.carboidratos IS 'Carboidratos em gramas por 100g';
COMMENT ON COLUMN public.valores_nutricionais_completos.fibras IS 'Fibras em gramas por 100g';
COMMENT ON COLUMN public.valores_nutricionais_completos.sodio IS 'Sódio em miligramas por 100g';

-- 3. Criar tabela image_cache (cache de imagens)
CREATE TABLE IF NOT EXISTS public.image_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL UNIQUE,
  base64_data TEXT,
  mime_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_count INTEGER DEFAULT 0
);

-- Índices para image_cache
CREATE INDEX IF NOT EXISTS idx_image_cache_storage_path ON public.image_cache(storage_path);
CREATE INDEX IF NOT EXISTS idx_image_cache_accessed_at ON public.image_cache(accessed_at);

-- RLS para image_cache
ALTER TABLE public.image_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read image cache" ON public.image_cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert image cache" ON public.image_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update image cache" ON public.image_cache
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Comentários
COMMENT ON TABLE public.image_cache IS 'Sistema de cache de imagens para melhorar performance';
COMMENT ON COLUMN public.image_cache.storage_path IS 'Caminho único no storage';
COMMENT ON COLUMN public.image_cache.base64_data IS 'Dados da imagem em base64';
COMMENT ON COLUMN public.image_cache.accessed_at IS 'Última vez que foi acessada';
COMMENT ON COLUMN public.image_cache.access_count IS 'Número de vezes acessada';

-- 4. Criar storage bucket chat-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies para o bucket chat-images
CREATE POLICY "Authenticated users can upload chat images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Public can view chat images" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-images');

CREATE POLICY "Authenticated users can update chat images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'chat-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete chat images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-images' AND
    auth.role() = 'authenticated'
  );

-- 5. Adicionar coluna score na tabela supplements
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- Adicionar comentário na coluna score
COMMENT ON COLUMN public.supplements.score IS 'Pontuação do produto de 0 a 100 para sistema de recomendações';

-- Atualizar produtos existentes com score padrão
UPDATE public.supplements 
SET score = 50 
WHERE score IS NULL OR score = 0;

-- Trigger para atualizar updated_at em alimentos_completos
CREATE OR REPLACE FUNCTION update_alimentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alimentos_completos_updated_at
  BEFORE UPDATE ON public.alimentos_completos
  FOR EACH ROW
  EXECUTE FUNCTION update_alimentos_updated_at();