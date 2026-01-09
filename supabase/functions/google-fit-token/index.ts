import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/utils/cors.ts";

function getRequestOrigin(req: Request): string {
  const raw = req.headers.get("origin") || req.headers.get("referer") || "";
  try {
    return new URL(raw).origin;
  } catch {
    return "https://www.oficialmaxnutrition.com.br";
  }
}

serve(async (req) => {
  console.log("🚀 google-fit-token chamada:", req.method, req.url);

  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS request - retornando CORS");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { action, code, redirect_uri, testSecrets } = body;
    console.log("📋 Parâmetros recebidos:", { action, hasCode: !!code, redirect_uri, testSecrets });

    // 1) Teste de configuração
    if (testSecrets) {
      const clientId = Deno.env.get("GOOGLE_FIT_CLIENT_ID");
      const clientSecret = Deno.env.get("GOOGLE_FIT_CLIENT_SECRET");
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      const origin = getRequestOrigin(req);

      return new Response(
        JSON.stringify({
          success: true,
          config: {
            clientId: clientId ? "✅ Configurado" : "❌ Não configurado",
            clientSecret: clientSecret ? "✅ Configurado" : "❌ Não configurado",
            supabaseUrl: supabaseUrl ? "✅ Configurado" : "❌ Não configurado",
            serviceRoleKey: serviceRoleKey ? "✅ Configurado" : "❌ Não configurado",
            redirectUri: `${origin}/google-fit-callback`,
            timestamp: new Date().toISOString(),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // Helpers auth
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    const apiKeyHeader = req.headers.get("apikey") || req.headers.get("x-api-key") || "";

    console.log("🔐 Headers recebidos:", {
      hasAuthorization: !!authHeader,
      jwtLength: jwt ? jwt.length : 0,
      hasApikey: !!apiKeyHeader,
      origin: req.headers.get("origin"),
    });

    // 2) Gerar URL de autorização
    if (action === "connect") {
      console.log("🔗 Iniciando conexão Google Fit...");

      if (!jwt) {
        return new Response(
          JSON.stringify({ success: false, error: "Authorization token required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
        );
      }

      const { data: userData, error: userError } = await supabaseClient.auth.getUser(jwt);
      if (userError || !userData.user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
        );
      }

      const clientId = Deno.env.get("GOOGLE_FIT_CLIENT_ID");
      if (!clientId) {
        return new Response(
          JSON.stringify({ success: false, error: "Google Fit credentials not configured" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
        );
      }

      const returnUrl = getRequestOrigin(req);
      // IMPORTANTE: o Google vai redirecionar para o FRONTEND (não para a função), para não depender de endpoint público.
      const redirectUri = `${returnUrl}/google-fit-callback`;

      const stateData = {
        returnUrl,
        redirectUri,
        userId: userData.user.id,
        userEmail: userData.user.email,
        timestamp: new Date().toISOString(),
      };

      const state = encodeURIComponent(JSON.stringify(stateData));

      const scope =
        "https://www.googleapis.com/auth/fitness.activity.read " +
        "https://www.googleapis.com/auth/fitness.body.read " +
        "https://www.googleapis.com/auth/fitness.heart_rate.read " +
        "https://www.googleapis.com/auth/fitness.sleep.read";

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`;

      console.log("✅ URL de autorização gerada", { redirectUri, userId: userData.user.id });

      return new Response(
        JSON.stringify({
          success: true,
          authUrl,
          redirectUri,
          state: stateData,
          userId: userData.user.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // 3) Trocar code por token e salvar no banco (sempre via chamada autenticada do app)
    if (code) {
      console.log("🔑 Processando código de autorização...");

      if (!jwt) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
        );
      }

      const { data: userData, error: userError } = await supabaseClient.auth.getUser(jwt);
      if (userError || !userData.user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
        );
      }

      const clientId = Deno.env.get("GOOGLE_FIT_CLIENT_ID");
      const clientSecret = Deno.env.get("GOOGLE_FIT_CLIENT_SECRET");
      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({ success: false, error: "Google Fit credentials not configured" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
        );
      }

      const fallbackRedirectUri = `${getRequestOrigin(req)}/google-fit-callback`;
      const redirectUri =
        typeof redirect_uri === "string" && redirect_uri.startsWith("http") ? redirect_uri : fallbackRedirectUri;

      const tokenBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      });

      console.log("🔄 Trocando código por token...", { redirectUri });
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenBody,
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.log("❌ Erro na troca de token:", errorText);
        return new Response(
          JSON.stringify({ success: false, error: errorText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        );
      }

      const tokenData = await tokenResponse.json();
      const expiresAt = new Date(Date.now() + (tokenData.expires_in || 0) * 1000).toISOString();

      console.log("💾 Salvando tokens no banco...");
      const { error: upsertError } = await supabaseClient
        .from("google_fit_tokens")
        .upsert(
          {
            user_id: userData.user.id,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || null,
            expires_at: expiresAt,
            token_type: tokenData.token_type || "Bearer",
            scope: tokenData.scope || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

      if (upsertError) {
        console.log("❌ Erro ao salvar tokens:", upsertError.message);
        return new Response(
          JSON.stringify({ success: false, error: upsertError.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        );
      }

      // Marcar no profile
      await supabaseClient.from("profiles").update({ google_fit_enabled: true }).eq("user_id", userData.user.id);

      console.log("✅ Tokens salvos com sucesso", { userId: userData.user.id });
      return new Response(
        JSON.stringify({ success: true, userId: userData.user.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request. Use action: "connect" or provide a code.',
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  } catch (error) {
    console.error("❌ Erro na Edge Function google-fit-token:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
