-- Add Instagram-style profile fields (optional)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_streak BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_points BOOLEAN DEFAULT true;

-- Create challenge invites table
CREATE TABLE IF NOT EXISTS public.challenge_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL,
  invitee_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, inviter_id, invitee_id)
);

-- Enable RLS
ALTER TABLE public.challenge_invites ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenge_invites
CREATE POLICY "Users can view their own invites"
ON public.challenge_invites FOR SELECT
USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Users can create invites"
ON public.challenge_invites FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their received invites"
ON public.challenge_invites FOR UPDATE
USING (auth.uid() = invitee_id);

-- Enable realtime for challenge_invites
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_invites;