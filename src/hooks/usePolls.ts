import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Poll } from '@/components/community/PollComponent';

// health_feed_polls and health_feed_poll_votes tables were removed
// This hook now returns mock implementations
export function usePolls() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createPoll = useCallback(async (
    _postId: string,
    _question: string,
    _optionTexts: string[],
    _endsAt?: Date
  ): Promise<Poll | null> => {
    if (!user) {
      toast.error('Você precisa estar logado para criar uma enquete');
      return null;
    }
    setIsCreating(true);
    console.log('Polls feature is temporarily disabled');
    toast.info('Enquetes temporariamente desabilitadas');
    setIsCreating(false);
    return null;
  }, [user]);

  const fetchPollForPost = useCallback(async (_postId: string): Promise<Poll | null> => {
    return null;
  }, []);

  const voteOnPoll = useCallback(async (
    _pollId: string,
    _optionIndex: number
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Você precisa estar logado para votar');
      return false;
    }
    console.log('Polls feature is temporarily disabled');
    return false;
  }, [user]);

  return {
    createPoll,
    fetchPollForPost,
    voteOnPoll,
    isCreating
  };
}
