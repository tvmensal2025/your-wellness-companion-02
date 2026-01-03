-- Create buckets for medical reports (HTML) if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('medical-documents-reports', 'medical-documents-reports', false, 10485760, ARRAY['text/html','text/plain']),
  ('medical-reports', 'medical-reports', false, 10485760, ARRAY['text/html','text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read report files via signed URLs or direct access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Authenticated can view medical documents reports'
  ) THEN
    CREATE POLICY "Authenticated can view medical documents reports"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'medical-documents-reports'
      AND auth.role() = 'authenticated'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Authenticated can view medical reports'
  ) THEN
    CREATE POLICY "Authenticated can view medical reports"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'medical-reports'
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;