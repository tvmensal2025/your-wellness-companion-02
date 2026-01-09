-- Ajustar RLS da health_feed_follows para comunidade pública
DROP POLICY IF EXISTS "Users can view their follows" ON public.health_feed_follows;
DROP POLICY IF EXISTS "Authenticated users can view all follows" ON public.health_feed_follows;

CREATE POLICY "Authenticated users can view all follows" 
ON public.health_feed_follows FOR SELECT 
TO authenticated
USING (true);