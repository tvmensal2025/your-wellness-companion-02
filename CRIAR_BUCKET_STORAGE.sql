-- Script para criar bucket de storage para imagens de produtos
-- Execute este script no Supabase para configurar o armazenamento de imagens

-- Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880, -- 5MB limite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Política RLS para permitir leitura pública
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Política RLS para permitir upload (apenas usuários autenticados)
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política RLS para permitir atualização (apenas usuários autenticados)
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política RLS para permitir exclusão (apenas usuários autenticados)
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'product-images';

