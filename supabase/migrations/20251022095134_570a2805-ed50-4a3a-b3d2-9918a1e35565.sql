-- Criar bucket para vídeos/imagens dos exercícios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('exercise-media', 'exercise-media', true, 52428800, 
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Public can view exercise media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exercise-media');

CREATE POLICY "Admins can upload exercise media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'exercise-media' AND
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Admins can update exercise media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'exercise-media' AND
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Admins can delete exercise media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'exercise-media' AND
    public.is_super_admin(auth.uid())
  );