import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface FeedPost {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[] | null;
  post_type?: string | null;
  visibility?: string | null;
  tags?: string[] | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at?: string | null;
  // Joined fields
  user_name?: string;
  user_avatar?: string;
  user_level?: string;
  user_bio?: string; // Bio/foco do usuário
  is_liked?: boolean;
  is_saved?: boolean;
  comments?: FeedComment[];
}

export interface FeedComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string | null;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface FeedReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export function useFeedPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts with user info and reactions
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get posts
      const { data: postsData, error: postsError } = await supabase
        .from('health_feed_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      
      // Get profiles for users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, bio')
        .in('user_id', userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );

      // Get user's reactions if logged in
      let userReactions: Set<string> = new Set();
      if (user) {
        const { data: reactionsData } = await supabase
          .from('health_feed_reactions')
          .select('post_id')
          .eq('user_id', user.id);
        
        userReactions = new Set(reactionsData?.map(r => r.post_id) || []);
      }

      // health_feed_comments table was removed - skip comments fetch
      const commentsMap = new Map<string, FeedComment[]>();

      // Map posts with all info
      const enrichedPosts: FeedPost[] = postsData.map(post => {
        const profile = profilesMap.get(post.user_id);
        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content || '',
          media_urls: post.media_urls,
          post_type: post.post_type,
          visibility: post.visibility,
          tags: post.tags,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          created_at: post.created_at,
          updated_at: post.updated_at,
          user_name: profile?.full_name || 'Usuário',
          user_avatar: profile?.avatar_url || undefined,
          user_level: 'Membro',
          user_bio: profile?.bio || undefined,
          is_liked: userReactions.has(post.id),
          is_saved: false,
          comments: commentsMap.get(post.id) || []
        };
      });

      setPosts(enrichedPosts);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new post
  const createPost = async (content: string, tags: string[] = [], mediaUrls?: string[]) => {
    if (!user) {
      toast.error('Você precisa estar logado para publicar');
      return null;
    }

    try {
      // Determine post type based on media
      let postType = 'text';
      if (mediaUrls && mediaUrls.length > 0) {
        const firstUrl = mediaUrls[0].toLowerCase();
        const isVideo = firstUrl.includes('.mp4') || firstUrl.includes('.mov') || 
                       firstUrl.includes('.webm') || firstUrl.includes('.m4v');
        postType = isVideo ? 'video' : 'image';
      }

      const { data, error } = await supabase
        .from('health_feed_posts')
        .insert({
          user_id: user.id,
          content,
          tags,
          media_urls: mediaUrls || [],
          post_type: postType,
          visibility: 'public',
          likes_count: 0,
          comments_count: 0,
          shares_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      const newPost: FeedPost = {
        id: data.id,
        user_id: data.user_id,
        content: data.content || '',
        media_urls: data.media_urls,
        post_type: data.post_type,
        visibility: data.visibility,
        tags: data.tags,
        likes_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        shares_count: data.shares_count || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_name: profile?.full_name || 'Você',
        user_avatar: profile?.avatar_url || undefined,
        user_level: 'Membro',
        is_liked: false,
        is_saved: false,
        comments: []
      };

      setPosts(prev => [newPost, ...prev]);
      toast.success('Publicação criada com sucesso!');
      return newPost;
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast.error('Erro ao criar publicação');
      return null;
    }
  };

  // Like/unlike a post
  const toggleLike = async (postId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isCurrentlyLiked = post.is_liked;

    // Optimistic update
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            is_liked: !isCurrentlyLiked, 
            likes_count: isCurrentlyLiked ? p.likes_count - 1 : p.likes_count + 1 
          } 
        : p
    ));

    try {
      if (isCurrentlyLiked) {
        // Remove like
        await supabase
          .from('health_feed_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        // Decrement likes count
        await supabase
          .from('health_feed_posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', postId);
      } else {
        // Add like
        await supabase
          .from('health_feed_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: 'like'
          });

        // Increment likes count
        await supabase
          .from('health_feed_posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId);
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
      // Revert optimistic update
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              is_liked: isCurrentlyLiked, 
              likes_count: post.likes_count 
            } 
          : p
      ));
      toast.error('Erro ao curtir publicação');
    }
  };

  // Add a comment to a post - health_feed_comments table was removed
  const addComment = async (_postId: string, _content: string) => {
    console.log('Comments feature is temporarily disabled');
    return null;
  };

  // Delete a post
  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('health_feed_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Publicação removida');
    } catch (err: any) {
      console.error('Error deleting post:', err);
      toast.error('Erro ao remover publicação');
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchPosts();

    // Subscribe to new posts
    const postsChannel = supabase
      .channel('health_feed_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_feed_posts'
        },
        async (payload) => {
          // Only add if not created by current user (already added optimistically)
          if (payload.new.user_id !== user?.id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('user_id', payload.new.user_id)
              .single();

            const newPost: FeedPost = {
              ...payload.new as any,
              user_name: profile?.full_name || 'Usuário',
              user_avatar: profile?.avatar_url || undefined,
              user_level: 'Membro',
              is_liked: false,
              is_saved: false,
              comments: []
            };

            setPosts(prev => [newPost, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'health_feed_posts'
        },
        (payload) => {
          setPosts(prev => prev.map(p => 
            p.id === payload.new.id 
              ? { ...p, ...payload.new as any } 
              : p
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'health_feed_posts'
        },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [fetchPosts, user?.id]);

  return {
    posts,
    loading,
    error,
    createPost,
    toggleLike,
    addComment,
    deletePost,
    refetch: fetchPosts
  };
}
