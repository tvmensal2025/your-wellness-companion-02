import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type RepairStatus = "skipped" | "repaired" | "failed";

let inflight: Promise<{ status: RepairStatus; reason?: string }> | null = null;

export async function repairAuthSessionIfTooLarge(
  session: Session,
): Promise<{ status: RepairStatus; reason?: string }> {
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const accessToken = session.access_token || "";
      const avatarMeta = session.user?.user_metadata?.avatar_url;

      const hasHugeAvatarInToken =
        typeof avatarMeta === "string" &&
        avatarMeta.startsWith("data:image") &&
        avatarMeta.length > 4000;

      const tokenTooLarge = accessToken.length > 8000;

      if (!hasHugeAvatarInToken && !tokenTooLarge) {
        return { status: "skipped" as const };
      }

      const refreshToken = session.refresh_token;
      if (!refreshToken) {
        return { status: "failed" as const, reason: "missing_refresh_token" };
      }

      const supabaseUrl =
        (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
        ((supabase as any).supabaseUrl as string | undefined) ||
        ((supabase as any).rest?.url as string | undefined)?.replace(/\/rest\/v1\/?$/, "");

      const apiKey =
        (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
        ((supabase as any).supabaseKey as string | undefined) ||
        ((supabase as any).rest?.headers?.apikey as string | undefined);

      if (!supabaseUrl || !apiKey) {
        return { status: "failed" as const, reason: "missing_env" };
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/repair-auth-metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return {
          status: "failed" as const,
          reason: text || `http_${res.status}`,
        };
      }

      const data = (await res.json().catch(() => null)) as
        | { access_token?: string; refresh_token?: string }
        | null;

      if (!data?.access_token || !data?.refresh_token) {
        return { status: "failed" as const, reason: "invalid_response" };
      }

      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      return { status: "repaired" as const };
    } catch (e) {
      return {
        status: "failed" as const,
        reason: e instanceof Error ? e.message : String(e),
      };
    }
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}
