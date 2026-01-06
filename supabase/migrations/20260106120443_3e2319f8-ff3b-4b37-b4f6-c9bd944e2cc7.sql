-- Tabela para Stories 24 horas
CREATE TABLE IF NOT EXISTS public.health_feed_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  text_content TEXT,
  background_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  views_count INTEGER DEFAULT 0
);

-- Tabela para visualizações de stories
CREATE TABLE IF NOT EXISTS public.health_feed_story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.health_feed_stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Habilitar RLS nas tabelas de stories
ALTER TABLE public.health_feed_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_story_views ENABLE ROW LEVEL SECURITY;

-- Políticas para stories
CREATE POLICY "Users can view non-expired stories" 
ON public.health_feed_stories FOR SELECT 
USING (expires_at > NOW());

CREATE POLICY "Users can create their own stories" 
ON public.health_feed_stories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
ON public.health_feed_stories FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para visualizações de stories
CREATE POLICY "Users can view story views" 
ON public.health_feed_story_views FOR SELECT 
USING (true);

CREATE POLICY "Users can mark stories as viewed" 
ON public.health_feed_story_views FOR INSERT 
WITH CHECK (auth.uid() = viewer_id);

-- Habilitar Realtime para posts e comentários
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_feed_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_feed_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_feed_stories;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_health_feed_stories_user_id ON public.health_feed_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_stories_expires_at ON public.health_feed_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_health_feed_story_views_story_id ON public.health_feed_story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_posts_user_id ON public.health_feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_posts_created_at ON public.health_feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_feed_comments_post_id ON public.health_feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_reactions_post_id ON public.health_feed_reactions(post_id);