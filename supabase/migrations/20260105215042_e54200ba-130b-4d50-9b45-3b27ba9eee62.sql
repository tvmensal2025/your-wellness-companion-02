-- Performance indexes for 1000+ users - only existing tables

-- Weight measurements (heavily queried by user and date)
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_date 
ON public.weight_measurements(user_id, measurement_date DESC);

-- Chat messages (frequently queried by user)
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created 
ON public.chat_messages(user_id, created_at DESC);

-- Chat conversations (user lookup)
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user 
ON public.chat_conversations(user_id, updated_at DESC);

-- Daily tracking (daily queries per user)
CREATE INDEX IF NOT EXISTS idx_advanced_daily_tracking_user_date 
ON public.advanced_daily_tracking(user_id, tracking_date DESC);

-- Medical documents (user documents lookup)
CREATE INDEX IF NOT EXISTS idx_medical_documents_user 
ON public.medical_documents(user_id, created_at DESC);

-- Challenge participations (active challenges)
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_challenge 
ON public.challenge_participations(user_id, challenge_id);

-- User points (leaderboard queries)
CREATE INDEX IF NOT EXISTS idx_user_points_total 
ON public.user_points(total_points DESC);

-- Notifications (unread notifications)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON public.notifications(user_id, is_read, created_at DESC);

-- Sessions (user sessions lookup)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_status 
ON public.user_sessions(user_id, status);

-- Profiles (common lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON public.profiles(user_id);

-- AI usage logs (monitoring queries)
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created 
ON public.ai_usage_logs(user_id, created_at DESC);