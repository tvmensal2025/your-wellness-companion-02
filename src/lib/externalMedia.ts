/**
 * External Media Storage Client
 * 
 * Biblioteca centralizada para upload de mídia.
 * Usa Edge Function como proxy para MinIO (VPS) com fallback para Supabase Storage.
 * 
 * O frontend NÃO tem acesso às variáveis VITE_VPS_*, então usamos
 * a Edge Function media-upload como intermediário seguro.
 */

import { supabase } from '@/integrations/supabase/client';

// ===========================================
// Types
// ===========================================

export type MediaFolder = 
  | 'whatsapp' 
  | 'feed' 
  | 'stories' 
  | 'profiles' 
  | 'food-analysis' 
  | 'weight-photos'
  | 'chat-images'
  | 'course-thumbnails'
  | 'exercise-media'
  | 'exercise-videos'
  | 'avatars'
  | 'medical-exams'
  | 'medical-reports'
  | 'product-images';

export interface UploadOptions {
  folder: MediaFolder;
  userId?: string;
  filename?: string;
  maxSizeMB?: number;
}

export interface UploadResult {
  success: true;
  url: string;
  path: string;
  size: number;
  mimeType: string;
  source?: 'minio' | 'supabase';
}

export interface UploadError {
  success: false;
  error: string;
  code?: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'CONFIG_ERROR' | 'NETWORK_ERROR' | 'UPLOAD_FAILED';
}

export type UploadResponse = UploadResult | UploadError;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ===========================================
// Constants
// ===========================================

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
] as const;

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

const DEFAULT_MAX_SIZE_MB = 50;

// ===========================================
// Validation Functions
// ===========================================

/**
 * Valida um arquivo de mídia antes do upload
 */
export function validateMediaFile(
  file: File | Blob,
  maxSizeMB: number = DEFAULT_MAX_SIZE_MB
): ValidationResult {
  const mimeType = file.type;
  if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
    return {
      valid: false,
      error: 'Formato não suportado. Use JPEG, PNG, GIF, WebP, MP4, MOV ou WebM.',
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Verifica se um MIME type é permitido
 */
export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType);
}

// ===========================================
// Conversion Helpers
// ===========================================

/**
 * Converte File/Blob para base64
 */
async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Detecta MIME type de uma string base64 (se tiver prefixo data:)
 */
function detectMimeTypeFromBase64(base64: string): string | null {
  const match = base64.match(/^data:([^;]+);base64,/);
  return match ? match[1] : null;
}

// ===========================================
// Main Upload Function (via Edge Function)
// ===========================================

/**
 * Upload de arquivo para storage externo via Edge Function
 * 
 * A Edge Function tenta MinIO primeiro, com fallback para Supabase Storage.
 * Isso garante que o upload sempre funcione, mesmo se a VPS estiver offline.
 */
export async function uploadToExternalStorage(
  file: File | Blob | string,
  options: UploadOptions
): Promise<UploadResponse> {
  const { folder, userId, filename, maxSizeMB = DEFAULT_MAX_SIZE_MB } = options;

  try {
    // Processar input (File/Blob ou base64)
    let base64Data: string;
    let mimeType: string;
    let fileSize: number;

    if (typeof file === 'string') {
      base64Data = file.replace(/^data:[^;]+;base64,/, '');
      mimeType = detectMimeTypeFromBase64(file) || 'image/jpeg';
      fileSize = Math.ceil((base64Data.length * 3) / 4);
    } else {
      const validation = validateMediaFile(file, maxSizeMB);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error!,
          code: file.size > maxSizeMB * 1024 * 1024 ? 'FILE_TOO_LARGE' : 'INVALID_TYPE',
        };
      }

      base64Data = await fileToBase64(file);
      mimeType = file.type;
      fileSize = file.size;
    }

    // Validar MIME type
    if (!isAllowedMimeType(mimeType)) {
      return {
        success: false,
        error: 'Formato não suportado. Use JPEG, PNG, GIF, WebP, MP4, MOV ou WebM.',
        code: 'INVALID_TYPE',
      };
    }

    // Validar tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (fileSize > maxSizeBytes) {
      return {
        success: false,
        error: `Arquivo muito grande. Máximo ${maxSizeMB}MB.`,
        code: 'FILE_TOO_LARGE',
      };
    }

    // Chamar Edge Function como proxy
    console.log(`[ExternalMedia] Uploading via Edge Function: ${folder}`);
    
    const { data, error } = await supabase.functions.invoke('media-upload', {
      body: {
        data: base64Data,
        folder,
        userId,
        mimeType,
        filename,
      },
    });

    if (error) {
      console.error('[ExternalMedia] Edge Function error:', error);
      return {
        success: false,
        error: error.message || 'Erro ao fazer upload. Tente novamente.',
        code: 'UPLOAD_FAILED',
      };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Erro ao fazer upload. Tente novamente.',
        code: data?.code || 'UPLOAD_FAILED',
      };
    }

    console.log(`[ExternalMedia] Upload success via ${data.source}: ${data.url}`);

    return {
      success: true,
      url: data.url,
      path: data.path,
      size: data.size || fileSize,
      mimeType: data.mimeType || mimeType,
      source: data.source,
    };
  } catch (error) {
    console.error('[ExternalMedia] Erro no upload:', error);
    return {
      success: false,
      error: 'Erro de conexão. Tente novamente.',
      code: 'NETWORK_ERROR',
    };
  }
}

// ===========================================
// Utility Functions
// ===========================================

/**
 * Verifica se o storage externo está configurado
 * Sempre retorna true pois usamos Edge Function com fallback
 */
export function isExternalStorageConfigured(): boolean {
  return true; // Edge Function sempre disponível
}

/**
 * Verifica se um arquivo é vídeo
 */
export function isVideoFile(file: File | Blob): boolean {
  return file.type.startsWith('video/');
}

/**
 * Verifica se uma URL aponta para vídeo
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('.mp4') ||
    lowerUrl.includes('.mov') ||
    lowerUrl.includes('.webm') ||
    lowerUrl.includes('.m4v')
  );
}
