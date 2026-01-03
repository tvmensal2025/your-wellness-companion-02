-- Add missing processing_started_at column to medical_documents for restart analysis flow
ALTER TABLE public.medical_documents 
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;