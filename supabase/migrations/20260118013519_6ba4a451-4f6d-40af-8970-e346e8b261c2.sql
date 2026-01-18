-- Drop old constraints
ALTER TABLE public.analysis_jobs DROP CONSTRAINT IF EXISTS analysis_jobs_job_type_check;
ALTER TABLE public.analysis_jobs DROP CONSTRAINT IF EXISTS analysis_jobs_status_check;

-- Add new constraints with all job types
ALTER TABLE public.analysis_jobs ADD CONSTRAINT analysis_jobs_job_type_check 
  CHECK (job_type = ANY (ARRAY[
    'food_image'::text, 
    'medical_exam'::text, 
    'body_composition'::text,
    'sofia_image'::text,
    'sofia_text'::text,
    'unified_assistant'::text,
    'meal_plan'::text,
    'whatsapp_message'::text
  ]));

-- Add new status constraint with pending
ALTER TABLE public.analysis_jobs ADD CONSTRAINT analysis_jobs_status_check 
  CHECK (status = ANY (ARRAY[
    'pending'::text,
    'queued'::text, 
    'processing'::text, 
    'completed'::text, 
    'failed'::text, 
    'cancelled'::text
  ]));