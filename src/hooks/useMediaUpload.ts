/**
 * Hook centralizado para upload de mídia
 * 
 * TODAS as imagens do app devem usar este hook
 * Usa Edge Function como proxy para MinIO com fallback automático para Supabase Storage
 */

import { useState } from 'react';
import { uploadToVPS, uploadBase64ToVPS, type MinIOFolder } from '@/lib/vpsApi';
import { useToast } from '@/hooks/use-toast';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UploadResult {
  url: string;
  path: string;
  source?: 'minio' | 'supabase';
}

export function useMediaUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const { toast } = useToast();

  /**
   * Upload de arquivo via Edge Function (MinIO + fallback Supabase)
   */
  const uploadFile = async (
    file: File,
    folder: MinIOFolder,
    options?: { showToast?: boolean }
  ): Promise<UploadResult | null> => {
    setState({ isUploading: true, progress: 10, error: null });

    try {
      setState(s => ({ ...s, progress: 50 }));
      
      const result = await uploadToVPS(file, folder);
      
      setState({ isUploading: false, progress: 100, error: null });
      
      if (options?.showToast !== false) {
        toast({ title: 'Upload concluído', description: 'Arquivo enviado com sucesso' });
      }
      
      return { url: result.url, path: result.path, source: result.source };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro no upload';
      setState({ isUploading: false, progress: 0, error });
      
      if (options?.showToast !== false) {
        toast({ title: 'Erro no upload', description: error, variant: 'destructive' });
      }
      
      return null;
    }
  };

  /**
   * Upload de base64 via Edge Function
   */
  const uploadBase64 = async (
    base64Data: string,
    folder: MinIOFolder,
    mimeType: string,
    filename?: string,
    options?: { showToast?: boolean }
  ): Promise<UploadResult | null> => {
    setState({ isUploading: true, progress: 10, error: null });

    try {
      setState(s => ({ ...s, progress: 50 }));
      
      const result = await uploadBase64ToVPS(base64Data, folder, mimeType, filename);
      
      setState({ isUploading: false, progress: 100, error: null });
      
      return { url: result.url, path: result.path, source: result.source };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro no upload';
      setState({ isUploading: false, progress: 0, error });
      
      if (options?.showToast !== false) {
        toast({ title: 'Erro no upload', description: error, variant: 'destructive' });
      }
      
      return null;
    }
  };

  // Helpers específicos por tipo de mídia
  const uploadAvatar = (file: File) => uploadFile(file, 'avatars');
  const uploadChatImage = (file: File) => uploadFile(file, 'chat-images');
  const uploadFoodImage = (file: File) => uploadFile(file, 'food-analysis');
  const uploadMedicalExam = (file: File) => uploadFile(file, 'medical-exams');
  const uploadWeightPhoto = (file: File) => uploadFile(file, 'weight-photos');
  const uploadFeedImage = (file: File) => uploadFile(file, 'feed');
  const uploadStoryImage = (file: File) => uploadFile(file, 'stories');
  const uploadCourseThumbnail = (file: File) => uploadFile(file, 'course-thumbnails');
  const uploadExerciseVideo = (file: File) => uploadFile(file, 'exercise-videos');
  const uploadExerciseMedia = (file: File) => uploadFile(file, 'exercise-media');

  return {
    ...state,
    uploadFile,
    uploadBase64,
    // Helpers específicos
    uploadAvatar,
    uploadChatImage,
    uploadFoodImage,
    uploadMedicalExam,
    uploadWeightPhoto,
    uploadFeedImage,
    uploadStoryImage,
    uploadCourseThumbnail,
    uploadExerciseVideo,
    uploadExerciseMedia,
  };
}
