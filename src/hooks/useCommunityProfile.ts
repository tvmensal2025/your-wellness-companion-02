import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityProfileData {
  id: string;
  name: string;
  avatar?: string;
  level: string;
  bio?: string;
  joinedAt: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  points: number;
  streak: number;
  position: number;
}

export interface CommunityUserPost {
  id: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  tags: string[];
}

export function useCommunityProfile() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CommunityProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<CommunityUserPost[]>([]);

  const fetchProfile = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // Fetch profile info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch posts count
      const { count: postsCount } = await supabase
        .from('health_feed_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Fetch followers count
      const { count: followersCount } = await supabase
        .from('health_feed_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Fetch following count
      const { count: followingCount } = await supabase
        .from('health_feed_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      // Fetch user posts
      const { data: postsData } = await supabase
        .from('health_feed_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      const displayName = profileData?.full_name || 
                          profileData?.email?.split('@')[0] || 
                          'Usuário';

      // Determine level based on posts count
      const postCount = postsCount || 0;
      const level = postCount > 50 
        ? 'Expert' 
        : postCount > 20 
          ? 'Avançado' 
          : postCount > 5 
            ? 'Intermediário' 
            : 'Iniciante';

      setProfile({
        id: userId,
        name: displayName,
        avatar: profileData?.avatar_url,
        level,
        bio: undefined,
        joinedAt: profileData?.created_at || new Date().toISOString(),
        postsCount: postsCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        points: 0,
        streak: 0,
        position: 0,
      });

      setUserPosts((postsData || []).map(p => ({
        id: p.id,
        content: p.content,
        imageUrl: p.media_urls?.[0] || undefined,
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
        createdAt: p.created_at,
        tags: p.tags || [],
      })));

    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setUserPosts([]);
  }, []);

  return {
    loading,
    profile,
    userPosts,
    fetchProfile,
    clearProfile,
  };
}
