import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'community-media';

export type MediaFolder = 'stories' | 'posts';

export interface UploadResult {
  publicUrl: string;
  path: string;
  mimeType: string;
}

/**
 * Upload a file to the community-media bucket
 * Files are organized by userId and folder (stories/posts)
 */
export async function uploadCommunityMedia(
  file: File,
  folder: MediaFolder,
  userId: string
): Promise<UploadResult> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}-${randomSuffix}-${sanitizedName}`;
  const path = `${userId}/${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return {
    publicUrl: data.publicUrl,
    path,
    mimeType: file.type,
  };
}

/**
 * Check if a file is a video based on MIME type
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * Check if a URL points to a video (by extension or known patterns)
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('.mp4') ||
    lowerUrl.includes('.mov') ||
    lowerUrl.includes('.webm') ||
    lowerUrl.includes('.m4v') ||
    lowerUrl.includes('.avi')
  );
}

/**
 * Validate file for upload (size and type)
 */
export function validateMediaFile(
  file: File,
  maxSizeMB: number = 50
): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ];

  if (!allowedTypes.includes(file.type)) {
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
