-- 1. Limpar follows órfãos onde following_id não existe em profiles
DELETE FROM health_feed_follows
WHERE following_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL);

-- 2. Limpar follows órfãos onde follower_id não existe em profiles
DELETE FROM health_feed_follows
WHERE follower_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL);

-- 3. Adicionar constraint para garantir integridade futura (follower)
ALTER TABLE health_feed_follows
DROP CONSTRAINT IF EXISTS fk_health_feed_follows_follower;

ALTER TABLE health_feed_follows
ADD CONSTRAINT fk_health_feed_follows_follower
FOREIGN KEY (follower_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 4. Adicionar constraint para garantir integridade futura (following)
ALTER TABLE health_feed_follows
DROP CONSTRAINT IF EXISTS fk_health_feed_follows_following;

ALTER TABLE health_feed_follows
ADD CONSTRAINT fk_health_feed_follows_following
FOREIGN KEY (following_id) REFERENCES profiles(user_id) ON DELETE CASCADE;