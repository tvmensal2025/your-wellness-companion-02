import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Poll, PollOption } from '@/components/community/PollComponent';
import type { Json } from '@/integrations/supabase/types';

export function usePolls() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  // Create a new poll
  const createPoll = useCallback(async (
    postId: string,
    question: string,
    optionTexts: string[],
    endsAt?: Date
  ): Promise<Poll | null> => {
    if (!user) {
      toast.error('Você precisa estar logado para criar uma enquete');
      return null;
    }

    setIsCreating(true);

    try {
      const options = optionTexts.map(text => ({
        text,
        votes: 0
      }));

      const { data, error } = await supabase
        .from('health_feed_polls')
        .insert({
          post_id: postId,
          question,
          options: options as unknown as Json,
          ends_at: endsAt?.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        post_id: data.post_id,
        question: data.question,
        options: data.options as unknown as PollOption[],
        ends_at: data.ends_at || undefined,
        created_at: data.created_at
      };
    } catch (err: any) {
      console.error('Error creating poll:', err);
      toast.error('Erro ao criar enquete');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user]);

  // Fetch poll for a post
  const fetchPollForPost = useCallback(async (postId: string): Promise<Poll | null> => {
    try {
      const { data, error } = await supabase
        .from('health_feed_polls')
        .select('*')
        .eq('post_id', postId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          id: data.id,
          post_id: data.post_id,
          question: data.question,
          options: data.options as unknown as PollOption[],
          ends_at: data.ends_at || undefined,
          created_at: data.created_at
        };
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching poll:', err);
      return null;
    }
  }, []);

  // Vote on a poll
  const voteOnPoll = useCallback(async (
    pollId: string,
    optionIndex: number
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Você precisa estar logado para votar');
      return false;
    }

    try {
      // Check if already voted
      const { data: existingVote } = await supabase
        .from('health_feed_poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        toast.info('Você já votou nesta enquete');
        return false;
      }

      // Record the vote
      const { error: voteError } = await supabase
        .from('health_feed_poll_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex
        });

      if (voteError) throw voteError;

      // Update poll options count
      const { data: poll } = await supabase
        .from('health_feed_polls')
        .select('options')
        .eq('id', pollId)
        .single();

      if (poll) {
        const options = poll.options as unknown as PollOption[];
        options[optionIndex].votes += 1;

        await supabase
          .from('health_feed_polls')
          .update({ options: options as unknown as Json })
          .eq('id', pollId);
      }

      return true;
    } catch (err: any) {
      console.error('Error voting:', err);
      if (err.message?.includes('duplicate')) {
        toast.info('Você já votou nesta enquete');
      } else {
        toast.error('Erro ao votar');
      }
      return false;
    }
  }, [user]);

  return {
    createPoll,
    fetchPollForPost,
    voteOnPoll,
    isCreating
  };
}
