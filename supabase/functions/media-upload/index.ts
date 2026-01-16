/**
 * Edge Function: media-upload
 * 
 * MODO: 100% MinIO (SEM FALLBACK PARA SUPABASE STORAGE)
 * 
 * Upload de mídia via VPS/Media-API para MinIO.
 * Se MinIO falhar, retorna erro - NÃO usa Supabase Storage.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Folders permitidos para upload
const ALLOWED_FOLDERS = [
  'avatars',
  'banners',
  'chat-images', 
  'course-thumbnails',
  'exercise-media',
  'exercise-videos',
  'feed',
  'food-analysis',
  'lesson-videos',
  'medical-exams',
  'medical-reports',
  'profiles',
  'product-images',
  'stories',
  'weight-photos',
  'whatsapp',
];

// MIME types permitidos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'audio/mpeg',
  'audio/wav',
  'application/pdf',
];

interface UploadRequest {
  data: string; // base64
  folder: string;
  userId?: string;
  mimeType: string;
  filename?: string;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VPS_API_URL = Deno.env.get('VPS_API_URL');
    const VPS_API_KEY = Deno.env.get('VPS_API_KEY');

    // Validar configuração - OBRIGATÓRIO para modo MinIO-only
    if (!VPS_API_URL) {
      console.error('[media-upload] ❌ VPS_API_URL não configurado');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'VPS_API_URL não configurado. Configure nas secrets do projeto.',
          code: 'CONFIG_ERROR'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!VPS_API_KEY) {
      console.error('[media-upload] ❌ VPS_API_KEY não configurado');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'VPS_API_KEY não configurado. Configure nas secrets do projeto.',
          code: 'CONFIG_ERROR'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[media-upload] VPS_API_URL:', VPS_API_URL);
    console.log('[media-upload] VPS_API_KEY: configurado');

    // Parse request body
    const body: UploadRequest = await req.json();
    const { data, folder, userId, mimeType, filename } = body;

    // Validar campos obrigatórios
    if (!data) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campo "data" (base64) é obrigatório', code: 'MISSING_DATA' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!folder) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campo "folder" é obrigatório', code: 'MISSING_FOLDER' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar folder permitido
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Pasta inválida: ${folder}. Permitidas: ${ALLOWED_FOLDERS.join(', ')}`,
          code: 'INVALID_FOLDER'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar MIME type
    const normalizedMimeType = mimeType || 'application/octet-stream';
    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
      console.warn(`[media-upload] MIME type não listado: ${mimeType} (continuando mesmo assim)`);
    }

    // Validar tamanho (base64 é ~33% maior que o arquivo original)
    const cleanBase64 = data.replace(/^data:[^;]+;base64,/, '');
    const estimatedSize = Math.ceil((cleanBase64.length * 3) / 4);
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (estimatedSize > maxSize) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Arquivo muito grande (${Math.round(estimatedSize / 1024 / 1024)}MB). Máximo: 50MB.`,
          code: 'FILE_TOO_LARGE'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar nome de arquivo único
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = getExtensionFromMime(normalizedMimeType);
    const generatedFilename = `${timestamp}-${randomId}${extension}`;
    const finalFilename = filename || generatedFilename;

    // Construir path
    const filePath = userId 
      ? `${userId}/${generatedFilename}`
      : generatedFilename;

    console.log(`[media-upload] Upload para MinIO: folder=${folder}, path=${filePath}, size=${Math.round(estimatedSize/1024)}KB`);

    // ===== UPLOAD PARA MINIO VIA MEDIA-API =====
    const uploadUrl = `${VPS_API_URL}/storage/upload-base64`;
    
    const uploadPayload = {
      data: cleanBase64,
      folder,
      mimeType: normalizedMimeType,
      filename: filePath,
      userId: userId || null
    };

    console.log(`[media-upload] Chamando: POST ${uploadUrl}`);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': VPS_API_KEY,
      },
      body: JSON.stringify(uploadPayload),
    });

    const responseText = await response.text();
    console.log(`[media-upload] MinIO resposta status: ${response.status}`);

    if (!response.ok) {
      // Log detalhado do erro
      console.error(`[media-upload] ❌ MinIO falhou (status ${response.status})`);
      console.error(`[media-upload] Resposta: ${responseText}`);
      
      // Tentar parsear erro JSON
      let errorMessage = `MinIO upload falhou (status ${response.status})`;
      let errorDetails = responseText;
      
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch {
        // responseText não é JSON
      }

      // MODO SEM FALLBACK: Retornar erro direto (não tenta Supabase Storage)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: errorDetails,
          code: 'MINIO_ERROR',
          folder,
          mimeType: normalizedMimeType,
          vpsUrl: VPS_API_URL
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse resposta de sucesso
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error('[media-upload] Resposta MinIO não é JSON válido:', responseText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Resposta inválida do MinIO (não é JSON)',
          code: 'INVALID_RESPONSE',
          rawResponse: responseText.substring(0, 500)
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[media-upload] ✅ Upload MinIO sucesso: ${result.url}`);

    return new Response(
      JSON.stringify({
        success: true,
        url: result.url,
        path: result.path || filePath,
        size: result.size || estimatedSize,
        mimeType: result.mimeType || normalizedMimeType,
        source: 'minio',
        folder
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[media-upload] Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno',
        code: 'INTERNAL_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getExtensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/webm': '.webm',
    'video/x-msvideo': '.avi',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'application/pdf': '.pdf',
    'application/octet-stream': '.bin',
  };
  return map[mimeType] || '.bin';
}
