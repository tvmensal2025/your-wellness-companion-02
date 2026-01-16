/**
 * External Media Storage Client
 * 
 * Biblioteca centralizada para upload de mídia para o MinIO via VPS API.
 * Substitui o Supabase Storage para buckets de alto volume (feed, stories, whatsapp).
 * 
 * Buckets RETIDOS no Supabase (dados sensíveis):
 * - medical-documents
 * - avatars
 * - medical-documents-reports
 */

// ===========================================
// Types
// ===========================================

export type MediaFolder = 'whatsapp' | 'feed' | 'stories' | 'profiles' | 'food-analysis' | 'weight-photos';

export interface UploadOptions {
  folder: MediaFolder;
  userId: string;
  filename?: string;
  maxSizeMB?: number;
}

export interface UploadResult {
  success: true;
  url: string;
  path: string;
  size: number;
  mimeType: string;
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
// Configuration
// ===========================================

function getMediaApiUrl(): string {
  const url = import.meta.env.VITE_MEDIA_API_URL || import.meta.env.VITE_VPS_API_URL;
  if (!url) {
    throw new Error('MEDIA_API_URL não configurada');
  }
  return url;
}

function getMediaApiKey(): string {
  return import.meta.env.VITE_MEDIA_API_KEY || import.meta.env.VITE_VPS_API_KEY || '';
}

// ===========================================
// Validation Functions
// ===========================================

/**
 * Valida um arquivo de mídia antes do upload
 * @param file - Arquivo a ser validado
 * @param maxSizeMB - Tamanho máximo em MB (padrão: 50MB)
 * @returns Resultado da validação com mensagem de erro em português
 */
export function validateMediaFile(
  file: File | Blob,
  maxSizeMB: number = DEFAULT_MAX_SIZE_MB
): ValidationResult {
  // Validar MIME type
  const mimeType = file.type;
  if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
    return {
      valid: false,
      error: 'Formato não suportado. Use JPEG, PNG, GIF, WebP, MP4, MOV ou WebM.',
    };
  }

  // Validar tamanho
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
      // Remove o prefixo data:mime;base64,
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
// Main Upload Function
// ===========================================

/**
 * Upload de arquivo para storage externo (MinIO via VPS)
 * 
 * @param file - Arquivo (File, Blob) ou string base64
 * @param options - Opções de upload (folder, userId, etc.)
 * @returns Resultado do upload ou erro
 * 
 * @example
 * // Upload de File
 * const result = await uploadToExternalStorage(file, {
 *   folder: 'feed',
 *   userId: 'user-123'
 * });
 * 
 * @example
 * // Upload de base64
 * const result = await uploadToExternalStorage(base64String, {
 *   folder: 'whatsapp',
 *   userId: 'user-456'
 * });
 */
export async function uploadToExternalStorage(
  file: File | Blob | string,
  options: UploadOptions
): Promise<UploadResponse> {
  const { folder, userId, filename, maxSizeMB = DEFAULT_MAX_SIZE_MB } = options;

  try {
    // Obter URL da API
    let apiUrl: string;
    try {
      apiUrl = getMediaApiUrl();
    } catch {
      return {
        success: false,
        error: 'Configuração de upload não encontrada.',
        code: 'CONFIG_ERROR',
      };
    }

    const apiKey = getMediaApiKey();

    // Processar input (File/Blob ou base64)
    let base64Data: string;
    let mimeType: string;
    let fileSize: number;

    if (typeof file === 'string') {
      // Input é base64
      base64Data = file.replace(/^data:[^;]+;base64,/, '');
      mimeType = detectMimeTypeFromBase64(file) || 'image/jpeg';
      fileSize = Math.ceil((base64Data.length * 3) / 4); // Estimativa do tamanho
    } else {
      // Input é File ou Blob
      // Validar antes de fazer qualquer request
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

    // Validar MIME type para base64 também
    if (!isAllowedMimeType(mimeType)) {
      return {
        success: false,
        error: 'Formato não suportado. Use JPEG, PNG, GIF, WebP, MP4, MOV ou WebM.',
        code: 'INVALID_TYPE',
      };
    }

    // Validar tamanho para base64
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (fileSize > maxSizeBytes) {
      return {
        success: false,
        error: `Arquivo muito grande. Máximo ${maxSizeMB}MB.`,
        code: 'FILE_TOO_LARGE',
      };
    }

    // Fazer request para API
    const response = await fetch(`${apiUrl}/storage/upload-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'X-API-Key': apiKey }),
      },
      body: JSON.stringify({
        data: base64Data,
        folder,
        userId,
        mimeType,
        filename,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      
      // Mapear códigos de erro do servidor
      if (errorData.code === 'INVALID_TYPE') {
        return {
          success: false,
          error: 'Formato não suportado. Use JPEG, PNG, GIF, WebP, MP4, MOV ou WebM.',
          code: 'INVALID_TYPE',
        };
      }
      
      if (errorData.code === 'FILE_TOO_LARGE') {
        return {
          success: false,
          error: `Arquivo muito grande. Máximo ${maxSizeMB}MB.`,
          code: 'FILE_TOO_LARGE',
        };
      }

      return {
        success: false,
        error: errorData.error || 'Erro ao fazer upload. Tente novamente.',
        code: 'UPLOAD_FAILED',
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erro ao fazer upload. Tente novamente.',
        code: 'UPLOAD_FAILED',
      };
    }

    return {
      success: true,
      url: result.url,
      path: result.path,
      size: result.size,
      mimeType: result.mimeType,
    };
  } catch (error) {
    // Erro de rede ou outro erro inesperado
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
 */
export function isExternalStorageConfigured(): boolean {
  try {
    getMediaApiUrl();
    return true;
  } catch {
    return false;
  }
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
