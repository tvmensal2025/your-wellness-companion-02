import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlockStatus {
  iBlockedThem: boolean;
  theyBlockedMe: boolean;
  loading: boolean;
}

export function useUserBlock(userId: string | null) {
  const [iBlockedThem, setIBlockedThem] = useState(false);
  const [theyBlockedMe, setTheyBlockedMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkBlockStatus = useCallback(async () => {
    // Reset state immediately when userId changes
    setIBlockedThem(false);
    setTheyBlockedMe(false);
    
    if (!userId) return;
    
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check both directions with RLS now allowing both
      const { data, error } = await supabase
        .from('user_blocks')
        .select('blocker_id, blocked_id')
        .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${userId}),and(blocker_id.eq.${userId},blocked_id.eq.${user.id})`);

      if (error) throw error;

      // Determine block status in both directions
      const blockedByMe = data?.some(block => block.blocker_id === user.id && block.blocked_id === userId) || false;
      const blockedByThem = data?.some(block => block.blocker_id === userId && block.blocked_id === user.id) || false;

      setIBlockedThem(blockedByMe);
      setTheyBlockedMe(blockedByThem);
    } catch (error) {
      console.error('Error checking block status:', error);
    } finally {
      setLoading(false);
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

      setIBlockedThem(true);
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

      setIBlockedThem(false);
      toast.success('Usuário desbloqueado');
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      toast.error('Erro ao desbloquear usuário');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = () => {
    // Can only toggle if they haven't blocked me
    if (theyBlockedMe) {
      toast.error('Você não pode interagir com este usuário');
      return;
    }
    
    if (iBlockedThem) {
      unblockUser();
    } else {
      blockUser();
    }
  };

  // Legacy support: isBlocked means either direction
  const isBlocked = iBlockedThem || theyBlockedMe;

  return { 
    isBlocked, 
    iBlockedThem,
    theyBlockedMe,
    loading, 
    blockUser, 
    unblockUser, 
    toggleBlock,
    refetch: checkBlockStatus
  };
}
