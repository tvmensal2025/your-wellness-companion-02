import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  text_content?: string | null;
  background_color?: string | null;
  created_at: string;
  expires_at: string;
  views_count: number;
  // Joined fields
  user_name?: string;
  user_avatar?: string;
  is_viewed?: boolean;
  is_own?: boolean;
}

export interface GroupedStories {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  stories: Story[];
  has_unviewed: boolean;
  is_own: boolean;
}

export function useStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [groupedStories, setGroupedStories] = useState<GroupedStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all active stories
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get active stories (not expired)
      const { data: storiesData, error: storiesError } = await supabase
        .from('health_feed_stories')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (storiesError) throw storiesError;

      if (!storiesData || storiesData.length === 0) {
        setStories([]);
        setGroupedStories([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(storiesData.map(s => s.user_id))];
      
      // Get profiles for users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );

      // Get viewed stories for current user
      let viewedStoryIds: Set<string> = new Set();
      if (user) {
        const { data: viewsData } = await supabase
          .from('health_feed_story_views')
          .select('story_id')
          .eq('viewer_id', user.id);
        
        viewedStoryIds = new Set(viewsData?.map(v => v.story_id) || []);
      }

      // Map stories with user info
      const enrichedStories: Story[] = storiesData.map(story => {
        const profile = profilesMap.get(story.user_id);
        return {
          id: story.id,
          user_id: story.user_id,
          media_url: story.media_url,
          media_type: story.media_type || 'image',
          text_content: story.text_content,
          background_color: story.background_color,
          created_at: story.created_at,
          expires_at: story.expires_at,
          views_count: story.views_count || 0,
          user_name: profile?.full_name || 'Usuário',
          user_avatar: profile?.avatar_url || undefined,
          is_viewed: viewedStoryIds.has(story.id),
          is_own: story.user_id === user?.id
        };
      });

      setStories(enrichedStories);

      // Group stories by user
      const grouped = new Map<string, GroupedStories>();
      
      enrichedStories.forEach(story => {
        if (!grouped.has(story.user_id)) {
          grouped.set(story.user_id, {
            user_id: story.user_id,
            user_name: story.user_name || 'Usuário',
            user_avatar: story.user_avatar,
            stories: [],
            has_unviewed: false,
            is_own: story.is_own || false
          });
        }
        
        const group = grouped.get(story.user_id)!;
        group.stories.push(story);
        if (!story.is_viewed) {
          group.has_unviewed = true;
        }
      });

      // Sort: own stories first, then by unviewed
      const sortedGroups = Array.from(grouped.values()).sort((a, b) => {
        if (a.is_own && !b.is_own) return -1;
        if (!a.is_own && b.is_own) return 1;
        if (a.has_unviewed && !b.has_unviewed) return -1;
        if (!a.has_unviewed && b.has_unviewed) return 1;
        return 0;
      });

      setGroupedStories(sortedGroups);
    } catch (err: any) {
      console.error('Error fetching stories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new story
  const createStory = async (mediaUrl: string, mediaType: string = 'image', textContent?: string, backgroundColor?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um story');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('health_feed_stories')
        .insert({
          user_id: user.id,
          media_url: mediaUrl,
          media_type: mediaType,
          text_content: textContent,
          background_color: backgroundColor
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Story criado com sucesso!');
      await fetchStories();
      return data;
    } catch (err: any) {
      console.error('Error creating story:', err);
      toast.error('Erro ao criar story');
      return null;
    }
  };

  // Mark story as viewed
  const viewStory = async (storyId: string) => {
    if (!user) return;

    try {
      // Check if already viewed
      const story = stories.find(s => s.id === storyId);
      if (story?.is_viewed || story?.is_own) return;

      await supabase
        .from('health_feed_story_views')
        .insert({
          story_id: storyId,
          viewer_id: user.id
        })
        .select();

      // Update local state
      setStories(prev => prev.map(s => 
        s.id === storyId ? { ...s, is_viewed: true, views_count: s.views_count + 1 } : s
      ));

      // Update views count
      await supabase
        .from('health_feed_stories')
        .update({ views_count: (story?.views_count || 0) + 1 })
        .eq('id', storyId);
    } catch (err: any) {
      // Ignore duplicate errors
      if (!err.message?.includes('duplicate')) {
        console.error('Error viewing story:', err);
      }
    }
  };

  // Delete own story
  const deleteStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('health_feed_stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      setStories(prev => prev.filter(s => s.id !== storyId));
      await fetchStories();
      toast.success('Story removido');
    } catch (err: any) {
      console.error('Error deleting story:', err);
      toast.error('Erro ao remover story');
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchStories();

    const storiesChannel = supabase
      .channel('health_feed_stories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_feed_stories'
        },
        () => {
          fetchStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(storiesChannel);
    };
  }, [fetchStories]);

  return {
    stories,
    groupedStories,
    loading,
    error,
    createStory,
    viewStory,
    deleteStory,
    refetch: fetchStories
  };
}
