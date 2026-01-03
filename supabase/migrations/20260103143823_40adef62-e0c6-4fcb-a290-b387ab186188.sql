-- Create medical_exam_analyses table if it does not exist
CREATE TABLE IF NOT EXISTS public.medical_exam_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_id uuid,
  exam_type text NOT NULL DEFAULT 'exame_laboratorial',
  analysis_result text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Basic indexes for queries used in functions
CREATE INDEX IF NOT EXISTS idx_medical_exam_analyses_user_id
  ON public.medical_exam_analyses(user_id);

CREATE INDEX IF NOT EXISTS idx_medical_exam_analyses_created_at
  ON public.medical_exam_analyses(created_at DESC);

-- Enable RLS and restrict access to owning user
ALTER TABLE public.medical_exam_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical exams"
ON public.medical_exam_analyses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical exams"
ON public.medical_exam_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add missing report_path column to medical_documents so analyze-medical-exam can persist report link
ALTER TABLE public.medical_documents
ADD COLUMN IF NOT EXISTS report_path text;

-- Ensure processing_stage column is text so we can store 'finalizado'
ALTER TABLE public.medical_documents
ALTER COLUMN processing_stage TYPE text;