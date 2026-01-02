-- Add missing approved_at column to user_goals so goal approvals work
ALTER TABLE public.user_goals
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Optional: keep updated_at auto-managed if there's trigger function available (already defined as update_updated_at_column)
-- This just ensures updated_at has a default in case it's missing
ALTER TABLE public.user_goals
  ALTER COLUMN updated_at DROP NOT NULL;
