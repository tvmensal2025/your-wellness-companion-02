import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const AUTH_INIT_TIMEOUT_MS = 2000;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const timeoutId = window.setTimeout(() => {
      if (mounted) setLoading(false);
    }, AUTH_INIT_TIMEOUT_MS);

    // Listener primeiro (evita perder eventos e reduz “travadas” na inicialização)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Depois busca sessão inicial
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setUser(session?.user ?? null);
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        window.clearTimeout(timeoutId);
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };
};
