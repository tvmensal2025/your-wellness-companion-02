-- Create user_blocks table for blocking functionality
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT,
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Policies for user_blocks
CREATE POLICY "Users can view their own blocks"
ON public.user_blocks FOR SELECT
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
ON public.user_blocks FOR INSERT
WITH CHECK (auth.uid() = blocker_id AND auth.uid() != blocked_id);

CREATE POLICY "Users can unblock"
ON public.user_blocks FOR DELETE
USING (auth.uid() = blocker_id);

-- Add policy to allow authenticated users to view other profiles (for community)
-- But exclude users who have blocked or been blocked by the viewer
CREATE POLICY "Authenticated users can view community profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    auth.uid() = user_id  -- Own profile always visible
    OR (
      -- Not blocked by viewer
      NOT EXISTS (
        SELECT 1 FROM public.user_blocks 
        WHERE blocker_id = auth.uid() AND blocked_id = profiles.user_id
      )
      -- Not blocking viewer
      AND NOT EXISTS (
        SELECT 1 FROM public.user_blocks 
        WHERE blocker_id = profiles.user_id AND blocked_id = auth.uid()
      )
    )
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);