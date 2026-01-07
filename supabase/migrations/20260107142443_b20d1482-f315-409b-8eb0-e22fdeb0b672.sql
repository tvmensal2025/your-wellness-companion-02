-- 1. Adicionar categoria aos stories
ALTER TABLE health_feed_stories ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'geral';

-- 2. Adicionar menções aos posts e comentários
ALTER TABLE health_feed_posts ADD COLUMN IF NOT EXISTS mentions UUID[] DEFAULT '{}';
ALTER TABLE health_feed_comments ADD COLUMN IF NOT EXISTS mentions UUID[] DEFAULT '{}';

-- 3. Tabela de enquetes
CREATE TABLE IF NOT EXISTS health_feed_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES health_feed_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de votos nas enquetes
CREATE TABLE IF NOT EXISTS health_feed_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES health_feed_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- 5. Tabela de visualizações de perfil
CREATE TABLE IF NOT EXISTS health_feed_profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID NOT NULL,
  viewer_user_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_user_id, viewer_user_id)
);

-- 6. Tabela de mensagens diretas
CREATE TABLE IF NOT EXISTS health_feed_direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dm_sender ON health_feed_direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_receiver ON health_feed_direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_user ON health_feed_profile_views(profile_user_id);

-- RLS para enquetes
ALTER TABLE health_feed_polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view polls" ON health_feed_polls FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create polls" ON health_feed_polls FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS para votos
ALTER TABLE health_feed_poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view votes" ON health_feed_poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON health_feed_poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their vote" ON health_feed_poll_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their vote" ON health_feed_poll_votes FOR DELETE USING (auth.uid() = user_id);

-- RLS para views de perfil
ALTER TABLE health_feed_profile_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see who viewed their profile" ON health_feed_profile_views FOR SELECT USING (auth.uid() = profile_user_id);
CREATE POLICY "Authenticated users can register views" ON health_feed_profile_views FOR INSERT WITH CHECK (auth.uid() = viewer_user_id);

-- RLS para mensagens diretas
ALTER TABLE health_feed_direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their messages" ON health_feed_direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON health_feed_direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their sent messages" ON health_feed_direct_messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);