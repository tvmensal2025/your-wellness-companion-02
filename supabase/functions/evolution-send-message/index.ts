import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendTextPayload {
  phone: string;
  message: string;
  userId?: string;
  messageType?: string;
}

interface SendMediaPayload {
  phone: string;
  mediaUrl?: string;
  mediaBase64?: string;
  caption?: string;
  mediaType: "image" | "document" | "audio" | "video";
  fileName?: string;
  userId?: string;
  messageType?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      throw new Error("Evolution API não configurada. Verifique os secrets.");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { action, ...payload } = await req.json();

    console.log(`[Evolution] Action: ${action}`);

    let result;

    switch (action) {
      case "sendText":
        result = await sendText(EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE, payload as SendTextPayload, supabase);
        break;
      case "sendImage":
        result = await sendMedia(EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE, { ...payload, mediaType: "image" } as SendMediaPayload, supabase);
        break;
      case "sendDocument":
        result = await sendMedia(EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE, { ...payload, mediaType: "document" } as SendMediaPayload, supabase);
        break;
      case "checkConnection":
        result = await checkConnection(EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE);
        break;
      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Evolution] Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Formatar telefone para padrão brasileiro
function formatPhone(phone: string): string {
  // Remove tudo que não é número
  let cleaned = phone.replace(/\D/g, "");
  
  // Se começar com 0, remove
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  
  // Se não tiver código do país, adiciona 55
  if (!cleaned.startsWith("55")) {
    cleaned = "55" + cleaned;
  }
  
  return cleaned;
}

// Enviar mensagem de texto
async function sendText(
  apiUrl: string,
  apiKey: string,
  instance: string,
  payload: SendTextPayload,
  supabase: any
) {
  const formattedPhone = formatPhone(payload.phone);
  
  console.log(`[Evolution] Enviando texto para ${formattedPhone}`);

  const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": apiKey,
    },
    body: JSON.stringify({
      number: formattedPhone,
      text: payload.message,
      delay: 1200, // Simula digitação
    }),
  });

  const data = await response.json();
  
  // Registrar log
  if (payload.userId) {
    await logMessage(supabase, {
      userId: payload.userId,
      phone: formattedPhone,
      messageType: payload.messageType || "text",
      messageContent: payload.message,
      evolutionResponse: data,
      status: response.ok ? "sent" : "failed",
      errorMessage: response.ok ? null : JSON.stringify(data),
    });
  }

  if (!response.ok) {
    console.error("[Evolution] Erro ao enviar texto:", data);
    throw new Error(data.message || "Erro ao enviar mensagem");
  }

  console.log("[Evolution] Texto enviado com sucesso:", data);
  return { success: true, data };
}

// Enviar mídia (imagem, documento, etc.)
async function sendMedia(
  apiUrl: string,
  apiKey: string,
  instance: string,
  payload: SendMediaPayload,
  supabase: any
) {
  const formattedPhone = formatPhone(payload.phone);
  
  console.log(`[Evolution] Enviando ${payload.mediaType} para ${formattedPhone}`);

  const body: any = {
    number: formattedPhone,
    mediatype: payload.mediaType,
    delay: 1500,
  };

  // Usar URL ou Base64
  if (payload.mediaBase64) {
    body.media = payload.mediaBase64;
  } else if (payload.mediaUrl) {
    body.media = payload.mediaUrl;
  } else {
    throw new Error("mediaUrl ou mediaBase64 é obrigatório");
  }

  if (payload.caption) {
    body.caption = payload.caption;
  }

  if (payload.fileName) {
    body.fileName = payload.fileName;
  }

  const response = await fetch(`${apiUrl}/message/sendMedia/${instance}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  
  // Registrar log
  if (payload.userId) {
    await logMessage(supabase, {
      userId: payload.userId,
      phone: formattedPhone,
      messageType: payload.messageType || payload.mediaType,
      messageContent: payload.caption || null,
      mediaUrl: payload.mediaUrl || null,
      mediaType: payload.mediaType,
      evolutionResponse: data,
      status: response.ok ? "sent" : "failed",
      errorMessage: response.ok ? null : JSON.stringify(data),
    });
  }

  if (!response.ok) {
    console.error("[Evolution] Erro ao enviar mídia:", data);
    throw new Error(data.message || "Erro ao enviar mídia");
  }

  console.log("[Evolution] Mídia enviada com sucesso:", data);
  return { success: true, data };
}

// Verificar conexão da instância
async function checkConnection(apiUrl: string, apiKey: string, instance: string) {
  console.log(`[Evolution] Verificando conexão da instância ${instance}`);

  const response = await fetch(`${apiUrl}/instance/connectionState/${instance}`, {
    method: "GET",
    headers: {
      "apikey": apiKey,
    },
  });

  const data = await response.json();
  
  console.log("[Evolution] Estado da conexão:", data);
  return { success: true, data };
}

// Registrar log da mensagem
async function logMessage(supabase: any, log: {
  userId: string;
  phone: string;
  messageType: string;
  messageContent?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  evolutionResponse: any;
  status: string;
  errorMessage?: string | null;
}) {
  try {
    const { error } = await supabase
      .from("whatsapp_evolution_logs")
      .insert({
        user_id: log.userId,
        phone: log.phone,
        message_type: log.messageType,
        message_content: log.messageContent,
        media_url: log.mediaUrl,
        media_type: log.mediaType,
        evolution_response: log.evolutionResponse,
        status: log.status,
        error_message: log.errorMessage,
      });

    if (error) {
      console.error("[Evolution] Erro ao salvar log:", error);
    }
  } catch (err) {
    console.error("[Evolution] Erro ao salvar log:", err);
  }
}
