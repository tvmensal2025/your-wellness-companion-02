import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: Media Upload Proxy
 * 
 * Recebe uploads do frontend e envia para MinIO via VPS.
 * O frontend não tem acesso às variáveis VITE_VPS_*, então esta
 * function atua como proxy seguro.
 * 
 * Endpoints:
 * - POST / : Upload via base64
 * - POST /file : Upload via FormData (futuro)
 * 
 * Fallback: Se VPS falhar, usa Supabase Storage
 */

// Folders permitidos para upload
const ALLOWED_FOLDERS = [
  'avatars',
  'chat-images', 
  'course-thumbnails',
  'exercise-media',
  'exercise-videos',
  'feed',
  'food-analysis',
  'medical-exams',
  'medical-reports',
  'profiles',
  'stories',
  'weight-photos',
  'whatsapp',
  'product-images',
];

// MIME types permitidos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

interface UploadRequest {
  data: string; // base64
  folder: string;
  userId?: string;
  mimeType: string;
  filename?: string;
}

interface UploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  size?: number;
  mimeType?: string;
  error?: string;
  source?: 'minio' | 'supabase';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body: UploadRequest = await req.json();
    const { data, folder, userId, mimeType, filename } = body;

    // Validações
    if (!data) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados da imagem não fornecidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
      return new Response(
        JSON.stringify({ success: false, error: `Pasta inválida: ${folder}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Formato não suportado. Use JPEG, PNG, GIF, WebP, MP4, MOV ou WebM.",
          code: "INVALID_TYPE"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar tamanho (base64 é ~33% maior que o arquivo original)
    const estimatedSize = Math.ceil((data.length * 3) / 4);
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (estimatedSize > maxSize) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Arquivo muito grande. Máximo 50MB.",
          code: "FILE_TOO_LARGE"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tentar upload para MinIO via VPS
    const VPS_API_URL = Deno.env.get("VPS_API_URL") || Deno.env.get("VITE_VPS_API_URL");
    const VPS_API_KEY = Deno.env.get("VPS_API_KEY") || Deno.env.get("VITE_VPS_API_KEY");

    console.log(`[media-upload] VPS_API_URL configurado: ${VPS_API_URL ? 'SIM' : 'NÃO'}`);
    console.log(`[media-upload] VPS_API_KEY configurado: ${VPS_API_KEY ? 'SIM' : 'NÃO'}`);

    if (VPS_API_URL && VPS_API_KEY) {
      try {
        console.log(`[media-upload] Tentando upload para MinIO: ${folder} via ${VPS_API_URL}`);
        
        const vpsResponse = await fetch(`${VPS_API_URL}/storage/upload-base64`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": VPS_API_KEY,
          },
          body: JSON.stringify({
            data: data.replace(/^data:[^;]+;base64,/, ''), // Remove prefix se existir
            folder,
            userId,
            mimeType,
            filename,
          }),
        });

        if (vpsResponse.ok) {
          const result = await vpsResponse.json();
          console.log(`[media-upload] Upload MinIO sucesso: ${result.url}`);
          
          return new Response(
            JSON.stringify({
              success: true,
              url: result.url,
              path: result.path,
              size: result.size || estimatedSize,
              mimeType: result.mimeType || mimeType,
              source: 'minio',
            } as UploadResponse),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const errorData = await vpsResponse.json().catch(() => ({}));
        console.warn(`[media-upload] ⚠️ MinIO falhou (status ${vpsResponse.status}): ${errorData.error || 'Erro desconhecido'}`);
        console.log(`[media-upload] Ativando fallback para Supabase Storage...`);
        // Continua para fallback
      } catch (vpsError) {
        console.warn(`[media-upload] ⚠️ Erro de conexão com MinIO:`, vpsError);
        console.log(`[media-upload] Ativando fallback para Supabase Storage...`);
        // Continua para fallback
      }
    } else {
      console.log("[media-upload] ℹ️ VPS não configurada, usando Supabase Storage diretamente");
    }

    // Fallback: Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Converter base64 para Uint8Array
    const cleanBase64 = data.replace(/^data:[^;]+;base64,/, '');
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Gerar nome de arquivo
    const extension = mimeType.split('/')[1] || 'jpg';
    const finalFilename = filename || `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = userId ? `${userId}/${finalFilename}` : finalFilename;

    // Mapear folder para bucket do Supabase
    const bucketMap: Record<string, string> = {
      'chat-images': 'chat-images',
      'food-analysis': 'chat-images',
      'stories': 'chat-images',
      'feed': 'chat-images',
      'course-thumbnails': 'course-thumbnails',
      'exercise-media': 'exercise-media',
      'exercise-videos': 'exercise-media',
      'avatars': 'avatars',
      'weight-photos': 'chat-images',
      'profiles': 'avatars',
      'whatsapp': 'chat-images',
      'medical-exams': 'medical-documents',
      'medical-reports': 'medical-documents-reports',
      'product-images': 'chat-images',
    };

    const bucket = bucketMap[folder] || 'chat-images';

    console.log(`[media-upload] Upload para Supabase Storage: ${bucket}/${filePath}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, bytes, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`[media-upload] Erro Supabase Storage:`, uploadError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: uploadError.message || "Erro ao fazer upload",
          code: "UPLOAD_FAILED"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar URL pública
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    console.log(`[media-upload] Upload Supabase sucesso: ${publicUrlData.publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrlData.publicUrl,
        path: uploadData.path,
        size: bytes.length,
        mimeType,
        source: 'supabase',
      } as UploadResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[media-upload] Erro geral:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erro interno",
        code: "INTERNAL_ERROR"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
