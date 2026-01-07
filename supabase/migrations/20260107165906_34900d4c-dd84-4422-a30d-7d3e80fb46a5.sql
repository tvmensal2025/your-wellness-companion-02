-- Remove foreign key constraints that reference auth.users for follow table
-- This allows following users that may have IDs from external sources (like ranking data)

ALTER TABLE public.health_feed_follows 
DROP CONSTRAINT IF EXISTS health_feed_follows_follower_id_fkey;

ALTER TABLE public.health_feed_follows 
DROP CONSTRAINT IF EXISTS health_feed_follows_following_id_fkey;

-- Add foreign key only for follower_id (the logged in user)
-- following_id can be any valid UUID from our system
ALTER TABLE public.health_feed_follows
ADD CONSTRAINT health_feed_follows_follower_id_fkey 
FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE;