import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

// 🔥 TEMPO DE INATIVIDADE PARA CONSIDERAR "FIM DO BLOCO" (30 segundos)
const INACTIVITY_TIMEOUT_SECONDS = 30;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[Medical Batch Timeout] ========================================");
    console.log("[Medical Batch Timeout] 🔍 Verificando lotes médicos inativos...");

    const cutoffTime = new Date(Date.now() - INACTIVITY_TIMEOUT_SECONDS * 1000).toISOString();
    const now = new Date().toISOString();

    // 🔥 BUSCAR LOTES QUE ESTÃO "COLLECTING" E INATIVOS HÁ MAIS DE 30 SEGUNDOS
    const { data: staleBatches, error: fetchError } = await supabase
      .from("whatsapp_pending_medical")
      .select("*")
      .eq("status", "collecting")
      .eq("is_processed", false)
      .lt("last_image_at", cutoffTime)
      .gt("expires_at", now); // Só considera não expirados

    if (fetchError) {
      console.error("[Medical Batch Timeout] Erro ao buscar lotes:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    if (!staleBatches || staleBatches.length === 0) {
      console.log("[Medical Batch Timeout] ✅ Nenhum lote inativo encontrado");
      return new Response(JSON.stringify({ ok: true, processed: 0 }), { headers: corsHeaders });
    }

    console.log(`[Medical Batch Timeout] 📋 Encontrados ${staleBatches.length} lotes inativos`);

    let processed = 0;

    for (const batch of staleBatches) {
      try {
        const imagesCount = batch.images_count || 1;
        const phone = batch.phone;

        console.log(`[Medical Batch Timeout] 📤 Enviando confirmação para ${phone} (${imagesCount} imagens)`);

        // 🔥 ENVIAR PERGUNTA DE CONFIRMAÇÃO AUTOMÁTICA
        await sendWhatsApp(phone,
          `📋 *${imagesCount} ${imagesCount === 1 ? "imagem recebida" : "imagens recebidas"}*\n\n` +
          `*Posso analisar agora?*\n\n` +
          `1️⃣ *SIM*, pode analisar\n` +
          `2️⃣ *NÃO*, vou enviar mais\n` +
          `3️⃣ *CANCELAR*\n\n` +
          `_Dr. Vital 🩺_`
        );

        // 🔥 ATUALIZAR STATUS PARA AWAITING_CONFIRM
        const { error: updateError } = await supabase
          .from("whatsapp_pending_medical")
          .update({
            status: "awaiting_confirm",
            waiting_confirmation: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", batch.id);

        if (updateError) {
          console.error(`[Medical Batch Timeout] ❌ Erro ao atualizar lote ${batch.id}:`, updateError);
        } else {
          console.log(`[Medical Batch Timeout] ✅ Lote ${batch.id} atualizado para awaiting_confirm`);
          processed++;
        }

      } catch (batchError) {
        console.error(`[Medical Batch Timeout] ❌ Erro no lote ${batch.id}:`, batchError);
      }
    }

    console.log(`[Medical Batch Timeout] ✅ Processados ${processed}/${staleBatches.length} lotes`);
    console.log("[Medical Batch Timeout] ========================================");

    return new Response(JSON.stringify({ ok: true, processed }), { headers: corsHeaders });

  } catch (error) {
    console.error("[Medical Batch Timeout] 💥 ERRO:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// =============== ENVIAR WHATSAPP ===============

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.error("[Medical Batch Timeout] Evolution API não configurada");
    return;
  }

  let formattedPhone = phone.replace(/\D/g, "");
  if (!formattedPhone.startsWith("55")) {
    formattedPhone = "55" + formattedPhone;
  }

  try {
    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
        delay: 1200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[Medical Batch Timeout] Erro ao enviar mensagem:", errorData);
    } else {
      console.log("[Medical Batch Timeout] ✅ Mensagem enviada para", formattedPhone);
    }
  } catch (error) {
    console.error("[Medical Batch Timeout] Erro ao enviar WhatsApp:", error);
  }
}
