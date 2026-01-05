import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { repairAuthSessionIfTooLarge } from "@/lib/auth-token-repair";

const AUTH_INIT_TIMEOUT_MS = 2000;

export const useAutoAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fail-safe para não ficar preso no loading caso a rede falhe/trave
    const timeoutId = window.setTimeout(() => {
      if (mounted) setLoading(false);
    }, AUTH_INIT_TIMEOUT_MS);

    // Listener primeiro (evita perder eventos durante a inicialização)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) return;

      window.setTimeout(() => {
        void repairAuthSessionIfTooLarge(session);
      }, 0);
    });

    // Depois buscar sessão existente
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          await repairAuthSessionIfTooLarge(session);
        }

        const {
          data: { session: finalSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setUser(finalSession?.user ?? null);
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

  return { user, loading };
};
