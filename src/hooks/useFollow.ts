import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useFollow() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch who the current user follows
  const fetchFollowing = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('health_feed_follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      if (error) throw error;
      
      setFollowing(new Set(data?.map(f => f.following_id) || []));
    } catch (err) {
      console.error('Error fetching following:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  // Check if current user follows a specific user
  const isFollowing = useCallback((userId: string) => {
    return following.has(userId);
  }, [following]);

  const ensureOwnProfileExists = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true });

    if (error) {
      console.error('Erro ao garantir perfil do usuário:', error);
      throw error;
    }
  }, [user]);

  // Follow a user
  const followUser = async (userId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para seguir');
      return false;
    }

    if (userId === user.id) {
      toast.error('Você não pode seguir a si mesmo');
      return false;
    }

    try {
      // Garante que o usuário atual tem um perfil (necessário por FK em health_feed_follows)
      await ensureOwnProfileExists();

      // Verificar se o usuário alvo existe no profiles antes de seguir
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao verificar perfil:', profileError);
        toast.error('Erro ao verificar usuário');
        return false;
      }

      if (!targetProfile) {
        toast.error('Usuário não encontrado');
        return false;
      }

      // Optimistic update
      setFollowing((prev) => new Set([...prev, userId]));

      // Criar follow
      const { error: followError } = await supabase
        .from('health_feed_follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      if (followError) {
        if (followError.code === '23505') {
          // Already following
          toast.success('Seguindo!');
          return true;
        }
        throw followError;
      }

      // Criar notificação (não deve quebrar o follow se falhar)
      const { error: notifError } = await supabase.from('health_feed_notifications').insert({
        user_id: userId,
        type: 'follow',
        title: 'Novo Seguidor! 👋',
        message: 'Alguém começou a te seguir na comunidade',
        actor_id: user.id,
        entity_type: 'follow',
        is_read: false,
      });

      if (notifError) {
        console.warn('Falha ao criar notificação de follow (ignorada):', notifError);
      }

      toast.success('Seguindo!');
      return true;
    } catch (err: any) {
      console.error('Error following user:', err);
      // Revert optimistic update
      setFollowing((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

      const message =
        err?.code === '23503'
          ? 'Não foi possível seguir: perfil incompleto. Tente sair e entrar novamente.'
          : 'Erro ao seguir usuário';

      toast.error(message);
      return false;
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId: string) => {
    if (!user) return false;

    // Optimistic update
    setFollowing(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });

    try {
      const { error } = await supabase
        .from('health_feed_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      toast.success('Deixou de seguir');
      return true;
    } catch (err: any) {
      console.error('Error unfollowing user:', err);
      // Revert optimistic update
      setFollowing(prev => new Set([...prev, userId]));
      toast.error('Erro ao deixar de seguir');
      return false;
    }
  };

  // Toggle follow status
  const toggleFollow = async (userId: string) => {
    if (isFollowing(userId)) {
      return unfollowUser(userId);
    } else {
      return followUser(userId);
    }
  };

  return {
    following,
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    loading,
    refetch: fetchFollowing
  };
}
