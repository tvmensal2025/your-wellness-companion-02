import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ===========================================
// External Storage (MinIO via VPS)
// ===========================================

/**
 * Upload bytes to external storage (MinIO via VPS)
 * Falls back to Supabase if VPS is unavailable
 */
async function uploadToExternalMedia(
  userId: string,
  bytes: Uint8Array,
  contentType: string
): Promise<string | null> {
  const MEDIA_API_URL = Deno.env.get('MEDIA_API_URL') || Deno.env.get('VPS_API_URL');
  const MEDIA_API_KEY = Deno.env.get('MEDIA_API_KEY') || Deno.env.get('VPS_API_KEY');
  
  if (!MEDIA_API_URL) {
    console.warn('[ImageUpload] MEDIA_API_URL não configurado, usando Supabase');
    return null;
  }
  
  try {
    // Convert bytes to base64
    const base64 = btoa(String.fromCharCode(...bytes));
    
    const response = await fetch(`${MEDIA_API_URL}/storage/upload-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(MEDIA_API_KEY && { 'X-API-Key': MEDIA_API_KEY }),
      },
      body: JSON.stringify({
        data: base64,
        folder: 'whatsapp',
        userId,
        mimeType: contentType,
      }),
    });
    
    if (!response.ok) {
      console.error('[ImageUpload] Erro no upload externo:', response.status);
      return null;
    }
    
    const result = await response.json();
    
    if (result.success && result.url) {
      console.log('[ImageUpload] Upload externo OK:', result.url.slice(0, 80));
      return result.url;
    }
    
    console.error('[ImageUpload] Resposta inválida do storage externo:', result);
    return null;
  } catch (error) {
    console.error('[ImageUpload] Erro ao fazer upload externo:', error);
    return null;
  }
}

/**
 * Convert base64 to bytes
 */
function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

/**
 * Upload bytes to storage
 * 100% MinIO - SEM FALLBACK para Supabase Storage
 */
export async function uploadBytesToStorage(
  supabase: SupabaseClient,
  userId: string,
  bytes: Uint8Array,
  contentType: string
): Promise<string | null> {
  // Upload via MinIO (VPS) - único método
  const externalUrl = await uploadToExternalMedia(userId, bytes, contentType);
  
  if (externalUrl) {
    return externalUrl;
  }
  
  // Se MinIO falhou, retornar null (SEM fallback para Supabase)
  console.error('[ImageUpload] ❌ Upload MinIO falhou - sem fallback');
  return null;
}

/**
 * Upload base64 image to Supabase storage
 */
export async function uploadBase64ToStorage(
  supabase: SupabaseClient,
  userId: string,
  base64: string,
  contentType: string
): Promise<string | null> {
  const ct = base64.startsWith("data:")
    ? base64.slice(5, base64.indexOf(";"))
    : contentType;
  return uploadBytesToStorage(supabase, userId, base64ToBytes(base64), ct || contentType);
}

/**
 * Download from URL and upload to storage
 */
async function downloadAndUpload(
  supabase: SupabaseClient,
  userId: string,
  url: string,
  contentType: string
): Promise<string | null> {
  try {
    console.log("[ImageUpload] Baixando de URL:", url.slice(0, 100));
    const response = await fetch(url);
    if (!response.ok) {
      console.error("[ImageUpload] Erro ao baixar URL:", response.status);
      return null;
    }
    
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    console.log("[ImageUpload] Download OK, tamanho:", bytes.length);
    return uploadBytesToStorage(supabase, userId, bytes, contentType);
  } catch (e) {
    console.error("[ImageUpload] Erro ao baixar de URL:", e);
    return null;
  }
}

/**
 * Get media from Whapi - either direct link or via media ID
 */
async function getMediaFromWhapi(message: any, webhook: any): Promise<{ url?: string; base64?: string } | null> {
  const WHAPI_API_URL = Deno.env.get("WHAPI_API_URL") || "https://gate.whapi.cloud";
  const WHAPI_TOKEN = Deno.env.get("WHAPI_TOKEN");

  // Try to get image/document data from various locations
  const mediaData = 
    message?.image || 
    message?.document ||
    webhook?.messages?.[0]?.image || 
    webhook?.messages?.[0]?.document ||
    webhook?.image ||
    webhook?.document;

  console.log("[ImageUpload] Whapi mediaData:", JSON.stringify(mediaData || {}).slice(0, 300));

  // 1. Direct link (if auto_download is enabled in Whapi)
  if (mediaData?.link) {
    console.log("[ImageUpload] Whapi link direto encontrado");
    return { url: mediaData.link };
  }

  // 2. Download via media ID
  const mediaId = mediaData?.id;
  if (!mediaId) {
    console.log("[ImageUpload] Sem mediaId no Whapi");
    return null;
  }

  if (!WHAPI_TOKEN) {
    console.error("[ImageUpload] WHAPI_TOKEN não configurado");
    return null;
  }

  try {
    console.log("[ImageUpload] Baixando mídia via Whapi API, mediaId:", mediaId);
    const response = await fetch(`${WHAPI_API_URL}/media/${mediaId}`, {
      headers: { 
        "Authorization": `Bearer ${WHAPI_TOKEN}`,
        "Accept": "application/json"
      },
    });

    if (!response.ok) {
      console.error("[ImageUpload] Erro ao baixar mídia Whapi:", response.status);
      
      // Try alternative endpoint
      const altResponse = await fetch(`${WHAPI_API_URL}/media/${mediaId}/download`, {
        headers: { 
          "Authorization": `Bearer ${WHAPI_TOKEN}`,
        },
      });
      
      if (altResponse.ok) {
        const buffer = await altResponse.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const base64 = btoa(String.fromCharCode(...bytes));
        return { base64 };
      }
      
      return null;
    }

    // Check if response is JSON (contains URL) or binary
    const contentType = response.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const json = await response.json();
      if (json.link || json.url) {
        return { url: json.link || json.url };
      }
      if (json.base64) {
        return { base64: json.base64 };
      }
    } else {
      // Binary response
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const base64 = btoa(String.fromCharCode(...bytes));
      return { base64 };
    }

    return null;
  } catch (e) {
    console.error("[ImageUpload] Erro ao obter mídia Whapi:", e);
    return null;
  }
}

/**
 * Get base64 from Evolution API
 */
async function getBase64FromEvolution(webhook: any): Promise<string | null> {
  const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
  const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
  const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    return null;
  }

  const messageKey = webhook.data?.key || {};
  const messageContent = webhook.data?.message || {};

  const payload = {
    message: {
      key: {
        remoteJid: messageKey.remoteJid,
        fromMe: messageKey.fromMe || false,
        id: messageKey.id,
      },
      message: messageContent,
    },
    convertToMp4: false,
  };

  try {
    const base64Response = await fetch(
      `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${EVOLUTION_INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!base64Response.ok) {
      return null;
    }

    const responseData = await base64Response.json();
    return responseData?.base64 || responseData?.data?.base64 || responseData?.media || null;
  } catch (e) {
    return null;
  }
}

/**
 * Process and upload image from webhook
 * Supports both Evolution API and Whapi formats
 */
export async function processAndUploadImage(
  supabase: SupabaseClient,
  userId: string,
  message: any,
  webhook: any
): Promise<string | null> {
  // Detectar formato baseado no conteúdo, não apenas no provider configurado
  const hasEvolutionImage = !!(
    webhook?.data?.message?.imageMessage || 
    message?.imageMessage ||
    webhook?.data?.message?.documentMessage ||
    message?.documentMessage
  );
  const hasWhapiImage = !!(
    webhook?.messages?.[0]?.image || 
    message?.image ||
    webhook?.messages?.[0]?.document ||
    message?.document
  );
  
  const configuredProvider = Deno.env.get("WHATSAPP_ACTIVE_PROVIDER") || "evolution";
  
  console.log("[ImageUpload] Formato detectado - Evolution:", hasEvolutionImage, "Whapi:", hasWhapiImage);
  console.log("[ImageUpload] Provider configurado:", configuredProvider);
  console.log("[ImageUpload] Message keys:", Object.keys(message || {}));

  // Detect content type from various formats
  const contentTypeHint = 
    message?.imageMessage?.mimetype || 
    message?.documentMessage?.mimetype ||
    message?.image?.mime_type ||
    message?.document?.mime_type ||
    "image/jpeg";

  // 1) Base64 direto do webhook (Evolution format)
  const directBase64 =
    webhook?.data?.message?.imageMessage?.base64 ??
    webhook?.data?.message?.base64 ??
    message?.imageMessage?.base64 ??
    message?.base64;

  if (directBase64) {
    console.log("[ImageUpload] Base64 direto encontrado (Evolution)");
    const url = await uploadBase64ToStorage(supabase, userId, directBase64, contentTypeHint);
    if (url) return url;
  }

  // 2) Se detectou formato Evolution, tentar Evolution API primeiro
  if (hasEvolutionImage) {
    console.log("[ImageUpload] Tentando Evolution API (formato detectado)...");
    const evoBase64 = await getBase64FromEvolution(webhook);
    if (evoBase64) {
      console.log("[ImageUpload] Evolution API retornou base64");
      return uploadBase64ToStorage(supabase, userId, evoBase64, contentTypeHint);
    }
  }

  // 3) Se detectou formato Whapi, tentar Whapi API
  if (hasWhapiImage) {
    console.log("[ImageUpload] Tentando Whapi API (formato detectado)...");
    const whapiMedia = await getMediaFromWhapi(message, webhook);
    
    if (whapiMedia?.url) {
      console.log("[ImageUpload] Whapi URL encontrada, fazendo download...");
      const url = await downloadAndUpload(supabase, userId, whapiMedia.url, contentTypeHint);
      if (url) return url;
    }
    
    if (whapiMedia?.base64) {
      console.log("[ImageUpload] Whapi base64 encontrado, fazendo upload...");
      return uploadBase64ToStorage(supabase, userId, whapiMedia.base64, contentTypeHint);
    }
  }

  // 4) Fallback: tentar ambos os métodos se nenhum formato específico foi detectado
  if (!hasEvolutionImage && !hasWhapiImage) {
    console.log("[ImageUpload] Formato não detectado, tentando fallbacks...");
    
    // Tentar Evolution
    const evoBase64 = await getBase64FromEvolution(webhook);
    if (evoBase64) {
      return uploadBase64ToStorage(supabase, userId, evoBase64, contentTypeHint);
    }
    
    // Tentar Whapi
    const whapiMedia = await getMediaFromWhapi(message, webhook);
    if (whapiMedia?.url) {
      return downloadAndUpload(supabase, userId, whapiMedia.url, contentTypeHint);
    }
    if (whapiMedia?.base64) {
      return uploadBase64ToStorage(supabase, userId, whapiMedia.base64, contentTypeHint);
    }
  }

  console.log("[ImageUpload] Nenhum método conseguiu obter a imagem");
  return null;
}

/**
 * Get image URL from webhook, trying different methods
 */
export async function getImageUrlFromWebhook(
  supabase: SupabaseClient,
  userId: string,
  message: any,
  webhook: any,
  getBase64Fn: () => Promise<string | null>
): Promise<string | null> {
  // Use the main function which now supports both providers
  return processAndUploadImage(supabase, userId, message, webhook);
}
