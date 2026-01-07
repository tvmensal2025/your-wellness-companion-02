-- 1. Corrigir RLS de health_feed_follows para permitir leitura correta
DROP POLICY IF EXISTS "Users can manage their own follows" ON public.health_feed_follows;
DROP POLICY IF EXISTS "health_feed_follows_select" ON public.health_feed_follows;
DROP POLICY IF EXISTS "health_feed_follows_insert" ON public.health_feed_follows;
DROP POLICY IF EXISTS "health_feed_follows_delete" ON public.health_feed_follows;

-- SELECT: usuário pode ver onde é follower OU following
CREATE POLICY "health_feed_follows_select" ON public.health_feed_follows
FOR SELECT TO authenticated
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- INSERT: só pode criar follow onde é o follower e não está seguindo a si mesmo
CREATE POLICY "health_feed_follows_insert" ON public.health_feed_follows
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = follower_id AND follower_id <> following_id);

-- DELETE: só pode remover follows que criou
CREATE POLICY "health_feed_follows_delete" ON public.health_feed_follows
FOR DELETE TO authenticated
USING (auth.uid() = follower_id);

-- 2. Corrigir RLS de user_blocks para detectar bloqueio nos dois sentidos
DROP POLICY IF EXISTS "Users can view blocks involving them" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can manage their own blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "user_blocks_select" ON public.user_blocks;
DROP POLICY IF EXISTS "user_blocks_insert" ON public.user_blocks;
DROP POLICY IF EXISTS "user_blocks_delete" ON public.user_blocks;

-- SELECT: ver bloqueios onde eu bloqueei OU fui bloqueado
CREATE POLICY "user_blocks_select" ON public.user_blocks
FOR SELECT TO authenticated
USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

-- INSERT: só posso criar bloqueio onde sou o blocker
CREATE POLICY "user_blocks_insert" ON public.user_blocks
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = blocker_id AND blocker_id <> blocked_id);

-- DELETE: só posso remover bloqueios que criei
CREATE POLICY "user_blocks_delete" ON public.user_blocks
FOR DELETE TO authenticated
USING (auth.uid() = blocker_id);