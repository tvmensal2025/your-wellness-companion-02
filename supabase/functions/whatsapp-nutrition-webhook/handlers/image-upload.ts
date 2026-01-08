import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

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
 * Upload bytes to Supabase storage
 */
export async function uploadBytesToStorage(
  supabase: SupabaseClient,
  userId: string,
  bytes: Uint8Array,
  contentType: string
): Promise<string | null> {
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
    ? "webp"
    : "jpg";
  const fileName = `whatsapp/${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("chat-images")
    .upload(
      fileName,
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      { contentType, upsert: true }
    );

  if (uploadError) {
    console.error("[ImageUpload] Erro no upload:", uploadError);
    return null;
  }

  const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(fileName);
  return urlData.publicUrl || null;
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
 */
export async function processAndUploadImage(
  supabase: SupabaseClient,
  userId: string,
  message: any,
  webhook: any
): Promise<string | null> {
  const contentTypeHint = message?.imageMessage?.mimetype || "image/jpeg";

  // 1) Base64 direto do webhook
  const directBase64 =
    webhook?.data?.message?.imageMessage?.base64 ??
    webhook?.data?.message?.base64 ??
    message?.imageMessage?.base64 ??
    message?.base64;

  if (directBase64) {
    const url = await uploadBase64ToStorage(supabase, userId, directBase64, contentTypeHint);
    if (url) return url;
  }

  // 2) Buscar base64 via Evolution
  const evoBase64 = await getBase64FromEvolution(webhook);
  if (evoBase64) {
    return uploadBase64ToStorage(supabase, userId, evoBase64, contentTypeHint);
  }

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
  const contentTypeHint = message?.imageMessage?.mimetype || "image/jpeg";

  // 1) Base64 direto do webhook
  const directBase64 =
    webhook?.data?.message?.imageMessage?.base64 ??
    webhook?.data?.message?.base64 ??
    message?.imageMessage?.base64 ??
    message?.base64;

  if (directBase64) {
    const url = await uploadBase64ToStorage(supabase, userId, directBase64, contentTypeHint);
    if (url) return url;
  }

  // 2) Buscar base64 via Evolution
  const evoBase64 = await getBase64Fn();
  if (evoBase64) {
    return uploadBase64ToStorage(supabase, userId, evoBase64, contentTypeHint);
  }

  return null;
}
