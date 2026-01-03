-- Add missing idempotency_key column to medical_documents so finalize-medical-document function works
ALTER TABLE public.medical_documents
ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Optional: ensure we don't create duplicate docs for same idempotency key per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_medical_documents_idempotency_key'
  ) THEN
    CREATE INDEX idx_medical_documents_idempotency_key
      ON public.medical_documents(idempotency_key);
  END IF;
END $$;
