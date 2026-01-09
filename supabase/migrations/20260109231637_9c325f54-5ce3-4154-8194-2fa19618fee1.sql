-- Criar tabela follows para sistema de seguir
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Políticas para follows
CREATE POLICY "Authenticated users can view all follows" 
ON public.follows FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can follow others" 
ON public.follows FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
ON public.follows FOR DELETE 
TO authenticated
USING (auth.uid() = follower_id);