// =====================================================
// USE FLASH CHALLENGE HOOK
// =====================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FlashChallenge {
  id: string;
  title: string;
  description?: string;
  challenge_type: string;
  target_value: number;
  unit?: string;
  xp_reward: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  bonus_multiplier?: number;
  emoji?: string;
}

export function useFlashChallenge() {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<FlashChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchActiveFlashChallenge();
    
    // Refresh every minute
    const interval = setInterval(fetchActiveFlashChallenge, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchActiveFlashChallenge = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('flash_challenges')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setChallenge(data as FlashChallenge);
      } else {
        setChallenge(null);
      }
    } catch (error) {
      console.error('Error fetching flash challenge:', error);
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  };

  const timeRemaining = useMemo(() => {
    if (!challenge) return '';
    
    const now = new Date();
    const end = new Date(challenge.ends_at);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Encerrado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }, [challenge]);

  const percentComplete = useMemo(() => {
    if (!challenge) return 0;
    return Math.min((progress / challenge.target_value) * 100, 100);
  }, [challenge, progress]);

  return {
    challenge,
    loading,
    progress,
    timeRemaining,
    percentComplete,
    refetch: fetchActiveFlashChallenge,
    updateProgress: setProgress,
  };
}

export default useFlashChallenge;
