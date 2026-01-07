-- Criar bucket público para mídias da comunidade
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-media', 
  'community-media', 
  true, 
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas RLS para storage.objects do bucket community-media
-- SELECT público (qualquer um pode ver)
CREATE POLICY "community_media_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-media');

-- INSERT apenas para usuários autenticados na própria pasta
CREATE POLICY "community_media_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- UPDATE apenas para usuários autenticados na própria pasta
CREATE POLICY "community_media_auth_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'community-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE apenas para usuários autenticados na própria pasta
CREATE POLICY "community_media_auth_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'community-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );