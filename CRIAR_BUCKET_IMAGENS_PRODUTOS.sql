-- =============================================
-- 🖼️ CRIAR BUCKET PARA IMAGENS DE PRODUTOS
-- =============================================

-- 1. Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880, -- 5MB limite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas RLS para o bucket de imagens de produtos
DO $$
BEGIN
  -- Política para leitura pública (qualquer um pode ver as imagens)
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public read access for product images'
  ) THEN
    CREATE POLICY "Public read access for product images" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'product-images');
  END IF;

  -- Política para upload (apenas usuários autenticados)
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload product images'
  ) THEN
    CREATE POLICY "Authenticated users can upload product images" 
    ON storage.objects FOR INSERT 
    WITH CHECK (
      bucket_id = 'product-images' 
      AND auth.role() = 'authenticated'
    );
  END IF;

  -- Política para atualização (apenas usuários autenticados)
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can update product images'
  ) THEN
    CREATE POLICY "Authenticated users can update product images" 
    ON storage.objects FOR UPDATE 
    USING (
      bucket_id = 'product-images' 
      AND auth.role() = 'authenticated'
    );
  END IF;

  -- Política para exclusão (apenas usuários autenticados)
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can delete product images'
  ) THEN
    CREATE POLICY "Authenticated users can delete product images" 
    ON storage.objects FOR DELETE 
    USING (
      bucket_id = 'product-images' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- 3. Adicionar coluna image_url na tabela supplements se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'supplements' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.supplements 
    ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- 4. Criar função para gerar URL pública da imagem
CREATE OR REPLACE FUNCTION get_product_image_url(image_path TEXT)
RETURNS TEXT AS $$
BEGIN
  IF image_path IS NULL OR image_path = '' THEN
    RETURN NULL;
  END IF;
  
  -- Se já é uma URL completa, retornar como está
  IF image_path LIKE 'http%' THEN
    RETURN image_path;
  END IF;
  
  -- Se é um caminho do storage, construir URL pública
  RETURN 'https://' || current_setting('app.supabase_url', true) || '/storage/v1/object/public/product-images/' || image_path;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar view para produtos com URLs de imagem
CREATE OR REPLACE VIEW products_with_images AS
SELECT 
  s.*,
  get_product_image_url(s.image_url) as full_image_url,
  CASE 
    WHEN s.image_url IS NOT NULL AND s.image_url != '' THEN true
    ELSE false
  END as has_image
FROM public.supplements s;

-- 6. Inserir algumas imagens de exemplo (URLs públicas temporárias)
UPDATE public.supplements 
SET image_url = 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=CART+CONTROL'
WHERE id = 'CART_CONTROL';

UPDATE public.supplements 
SET image_url = 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=A-Z+COMPLEX'
WHERE id = 'AZ_COMPLEX';

UPDATE public.supplements 
SET image_url = 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=OMEGA+3'
WHERE id = 'OMEGA_3';

UPDATE public.supplements 
SET image_url = 'https://via.placeholder.com/300x300/EF4444/FFFFFF?text=MAGNÉSIO'
WHERE id = 'CLORETO_MAGNESIO';

UPDATE public.supplements 
SET image_url = 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=MACA+PERUANA'
WHERE id = 'MACA_PERUANA';

-- 7. Comentários para documentação
COMMENT ON FUNCTION get_product_image_url(TEXT) IS 'Função para gerar URL pública das imagens dos produtos';
COMMENT ON VIEW products_with_images IS 'View que retorna produtos com URLs completas das imagens';

-- 8. Verificar se o bucket foi criado
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'product-images';

-- 9. Verificar políticas criadas
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%product%';

-- 10. Testar a função
SELECT 
  id,
  name,
  image_url,
  get_product_image_url(image_url) as full_url,
  has_image
FROM products_with_images 
WHERE image_url IS NOT NULL 
LIMIT 5;
