ALTER TABLE public.dashboard_settings 
ADD COLUMN IF NOT EXISTS view_mode TEXT DEFAULT 'courses';