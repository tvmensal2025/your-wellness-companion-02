-- Create notifications table
CREATE TABLE IF NOT EXISTS public.health_feed_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'mention', 'share', 'challenge', 'achievement'
  title TEXT NOT NULL,
  message TEXT,
  actor_id UUID, -- who triggered the notification
  entity_type TEXT, -- 'post', 'comment', 'story', 'challenge', 'user'
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  likes_enabled BOOLEAN DEFAULT true,
  comments_enabled BOOLEAN DEFAULT true,
  follows_enabled BOOLEAN DEFAULT true,
  mentions_enabled BOOLEAN DEFAULT true,
  shares_enabled BOOLEAN DEFAULT true,
  challenges_enabled BOOLEAN DEFAULT true,
  achievements_enabled BOOLEAN DEFAULT true,
  direct_messages_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_feed_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications"
ON public.health_feed_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.health_feed_notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications"
ON public.health_feed_notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own notifications"
ON public.health_feed_notifications FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for preferences
CREATE POLICY "Users can view own preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.health_feed_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.health_feed_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.health_feed_notifications(is_read);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_feed_notifications;