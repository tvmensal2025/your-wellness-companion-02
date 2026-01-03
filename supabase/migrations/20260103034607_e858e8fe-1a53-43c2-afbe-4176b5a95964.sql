-- Add missing report_meta column to medical_documents so finalize-medical-document function can persist metadata
ALTER TABLE public.medical_documents
ADD COLUMN IF NOT EXISTS report_meta JSONB DEFAULT '{}'::jsonb;

-- Also ensure analysis_status column exists because reports often depend on it
ALTER TABLE public.medical_documents
ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'pending';

-- Optional index to speed up queries by analysis_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_medical_documents_analysis_status'
  ) THEN
    CREATE INDEX idx_medical_documents_analysis_status
      ON public.medical_documents(analysis_status);
  END IF;
END $$;
