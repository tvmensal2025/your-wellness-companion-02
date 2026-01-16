import { 
  uploadToExternalStorage, 
  validateMediaFile as validateExternalMedia,
  isVideoFile as checkIsVideo,
  isVideoUrl as checkIsVideoUrl,
  type MediaFolder as ExternalMediaFolder,
  type UploadResponse
} from '@/lib/externalMedia';

export type MediaFolder = 'stories' | 'posts';

export interface UploadResult {
  publicUrl: string;
  path: string;
  mimeType: string;
}

/**
 * Upload a file to external storage (MinIO via VPS)
 * Files are organized by userId and folder (stories/posts -> feed)
 */
export async function uploadCommunityMedia(
  file: File,
  folder: MediaFolder,
  userId: string
): Promise<UploadResult> {
  // Validar arquivo antes do upload
  const validation = validateExternalMedia(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Mapear 'posts' para 'feed' no storage externo
  const externalFolder: ExternalMediaFolder = folder === 'posts' ? 'feed' : folder;

  const response: UploadResponse = await uploadToExternalStorage(file, {
    folder: externalFolder,
    userId,
  });

  if (!response.success) {
    throw new Error(response.error);
  }

  return {
    publicUrl: response.url,
    path: response.path,
    mimeType: response.mimeType,
  };
}

/**
 * Check if a file is a video based on MIME type
 */
export function isVideoFile(file: File): boolean {
  return checkIsVideo(file);
}

/**
 * Check if a URL points to a video (by extension or known patterns)
 */
export function isVideoUrl(url: string): boolean {
  return checkIsVideoUrl(url);
}

/**
 * Validate file for upload (size and type)
 */
export function validateMediaFile(
  file: File,
  maxSizeMB: number = 50
): { valid: boolean; error?: string } {
  return validateExternalMedia(file, maxSizeMB);
}
