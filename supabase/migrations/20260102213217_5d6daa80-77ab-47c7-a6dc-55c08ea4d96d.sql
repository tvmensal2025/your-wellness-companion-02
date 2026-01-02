-- ============================================
-- MIGRAÇÃO 12: FEED SOCIAL E METAS
-- ============================================

-- Tabela: health_feed_posts (15 colunas)
CREATE TABLE IF NOT EXISTS public.health_feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type TEXT,
  title TEXT,
  content TEXT,
  media_urls TEXT[],
  tags TEXT[],
  visibility TEXT DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: health_feed_reactions (5 colunas)
CREATE TABLE IF NOT EXISTS public.health_feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.health_feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: health_feed_comments (7 colunas)
CREATE TABLE IF NOT EXISTS public.health_feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.health_feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT,
  parent_comment_id UUID,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: health_feed_groups (8 colunas)
CREATE TABLE IF NOT EXISTS public.health_feed_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  description TEXT,
  group_type TEXT,
  privacy_level TEXT DEFAULT 'public',
  members_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: health_feed_group_members (5 colunas)
CREATE TABLE IF NOT EXISTS public.health_feed_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.health_feed_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: health_feed_follows (4 colunas)
CREATE TABLE IF NOT EXISTS public.health_feed_follows (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- Tabela: user_goal_invites (9 colunas)
CREATE TABLE IF NOT EXISTS public.user_goal_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.user_goals(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES auth.users(id),
  invitee_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  message TEXT,
  invited_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: user_goal_participants (5 colunas)
CREATE TABLE IF NOT EXISTS public.user_goal_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.user_goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant',
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: nutritional_goals (20 colunas)
CREATE TABLE IF NOT EXISTS public.nutritional_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_type TEXT,
  target_calories INTEGER,
  target_protein_g DECIMAL(6,2),
  target_carbs_g DECIMAL(6,2),
  target_fats_g DECIMAL(6,2),
  target_fiber_g DECIMAL(6,2),
  target_water_ml INTEGER,
  target_weight_kg DECIMAL(5,2),
  current_weight_kg DECIMAL(5,2),
  start_date DATE,
  target_date DATE,
  status TEXT DEFAULT 'active',
  progress_percentage DECIMAL(5,2),
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: goal_benefits (10 colunas)
CREATE TABLE IF NOT EXISTS public.goal_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_type TEXT NOT NULL,
  benefit_title TEXT,
  benefit_description TEXT,
  health_impact TEXT,
  evidence_level TEXT,
  time_to_benefit TEXT,
  sustainability_level TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.health_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own posts" ON public.health_feed_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public posts" ON public.health_feed_posts FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can manage their own reactions" ON public.health_feed_reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own comments" ON public.health_feed_comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view groups" ON public.health_feed_groups FOR SELECT USING (true);
CREATE POLICY "Users can manage their own group memberships" ON public.health_feed_group_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own follows" ON public.health_feed_follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Users can manage goal invites" ON public.user_goal_invites FOR ALL USING (auth.uid() IN (inviter_id, invitee_id));
CREATE POLICY "Users can manage goal participations" ON public.user_goal_participants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own nutritional goals" ON public.nutritional_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view goal benefits" ON public.goal_benefits FOR SELECT USING (is_active = true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_health_feed_posts_user_id ON public.health_feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_reactions_post_id ON public.health_feed_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_comments_post_id ON public.health_feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_nutritional_goals_user_id ON public.nutritional_goals(user_id);