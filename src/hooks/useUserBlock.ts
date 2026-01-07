import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUserBlock(userId: string | null) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkBlockStatus = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId)
        .maybeSingle();

      if (error) throw error;
      setIsBlocked(!!data);
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  }, [userId]);

  useEffect(() => {
    checkBlockStatus();
  }, [checkBlockStatus]);

  const blockUser = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: userId
        });

      if (error) throw error;

      setIsBlocked(true);
      toast.success('Usuário bloqueado');
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast.error('Erro ao bloquear usuário');
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);

      if (error) throw error;

      setIsBlocked(false);
      toast.success('Usuário desbloqueado');
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      toast.error('Erro ao desbloquear usuário');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = () => {
    if (isBlocked) {
      unblockUser();
    } else {
      blockUser();
    }
  };

  return { isBlocked, loading, blockUser, unblockUser, toggleBlock };
}
