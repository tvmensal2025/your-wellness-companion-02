import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Determina capacidade de admin com validação no backend (evita manipulação client-side).
 */
export const useAdminMode = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModeEnabled, setAdminModeEnabled] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setIsAdmin(false);
      setAdminModeEnabled(false);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);

    (async () => {
      try {
        const { data, error } = await supabase.rpc("is_admin_user");
        const ok = !error && data === true;

        if (cancelled) return;
        setIsAdmin(ok);
        setAdminModeEnabled(ok);
      } catch {
        if (cancelled) return;
        setIsAdmin(false);
        setAdminModeEnabled(false);
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const toggleAdminMode = () => {
    setAdminModeEnabled((prev) => (isAdmin ? !prev : false));
  };

  return {
    isAdmin,
    adminModeEnabled,
    toggleAdminMode,
    isChecking,
  };
};
