import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/utils/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[get-public-report] Buscando relatório com token:", token.slice(0, 10) + "...");

    // Buscar link público pelo token
    const { data: linkData, error: linkError } = await supabase
      .from("public_report_links")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (linkError) {
      console.error("[get-public-report] Erro ao buscar link:", linkError);
      throw new Error("Erro ao buscar relatório");
    }

    if (!linkData) {
      return new Response(
        JSON.stringify({ error: "Relatório não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar expiração
    if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Este link expirou" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[get-public-report] Link encontrado, report_path:", linkData.report_path);

    // Buscar HTML do Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("medical-documents-reports")
      .download(linkData.report_path);

    if (fileError) {
      console.error("[get-public-report] Erro ao baixar arquivo:", fileError);
      throw new Error("Erro ao carregar relatório");
    }

    const html = await fileData.text();

    // Atualizar contagem de visualizações
    await supabase
      .from("public_report_links")
      .update({
        view_count: (linkData.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq("id", linkData.id);

    console.log("[get-public-report] Relatório carregado, tamanho HTML:", html.length);

    return new Response(
      JSON.stringify({
        html,
        title: linkData.title,
        exam_type: linkData.exam_type,
        exam_date: linkData.exam_date,
        created_at: linkData.created_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[get-public-report] Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
