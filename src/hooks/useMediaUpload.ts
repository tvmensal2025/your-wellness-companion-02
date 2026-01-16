/**
 * Hook centralizado para upload de mídia
 * 
 * TODAS as imagens do app devem usar este hook
 * Envia para MinIO através do VPS backend
 */

import { useState } from 'react';
import { uploadToVPS, uploadBase64ToVPS, isVPSConfigured, type MinIOFolder } from '@/lib/vpsApi';
import { useToast } from '@/hooks/use-toast';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UploadResult {
  url: string;
  path: string;
}

export function useMediaUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const { toast } = useToast();

  /**
   * Upload de arquivo para MinIO
   */
  const uploadFile = async (
    file: File,
    folder: MinIOFolder,
    options?: { showToast?: boolean }
  ): Promise<UploadResult | null> => {
    if (!isVPSConfigured()) {
      const error = 'VPS não configurada. Configure VITE_VPS_API_URL e VITE_VPS_API_KEY';
      setState({ isUploading: false, progress: 0, error });
      if (options?.showToast !== false) {
        toast({ title: 'Erro', description: error, variant: 'destructive' });
      }
      return null;
    }

    setState({ isUploading: true, progress: 10, error: null });

    try {
      setState(s => ({ ...s, progress: 50 }));
      
      const result = await uploadToVPS(file, folder);
      
      setState({ isUploading: false, progress: 100, error: null });
      
      if (options?.showToast !== false) {
        toast({ title: 'Upload concluído', description: 'Arquivo enviado com sucesso' });
      }
      
      return { url: result.url, path: result.path };
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
   * Upload de base64 para MinIO
   */
  const uploadBase64 = async (
    base64Data: string,
    folder: MinIOFolder,
    mimeType: string,
    filename?: string,
    options?: { showToast?: boolean }
  ): Promise<UploadResult | null> => {
    if (!isVPSConfigured()) {
      const error = 'VPS não configurada';
      setState({ isUploading: false, progress: 0, error });
      return null;
    }

    setState({ isUploading: true, progress: 10, error: null });

    try {
      setState(s => ({ ...s, progress: 50 }));
      
      const result = await uploadBase64ToVPS(base64Data, folder, mimeType, filename);
      
      setState({ isUploading: false, progress: 100, error: null });
      
      return { url: result.url, path: result.path };
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
   * Upload de avatar
   */
  const uploadAvatar = (file: File) => uploadFile(file, 'avatars');

  /**
   * Upload de imagem de chat (Sofia)
   */
  const uploadChatImage = (file: File) => uploadFile(file, 'chat-images');

  /**
   * Upload de foto de alimento
   */
  const uploadFoodImage = (file: File) => uploadFile(file, 'food-analysis');

  /**
   * Upload de exame médico
   */
  const uploadMedicalExam = (file: File) => uploadFile(file, 'medical-exams');

  /**
   * Upload de foto de peso
   */
  const uploadWeightPhoto = (file: File) => uploadFile(file, 'weight-photos');

  /**
   * Upload de post do feed
   */
  const uploadFeedImage = (file: File) => uploadFile(file, 'feed');

  /**
   * Upload de story
   */
  const uploadStoryImage = (file: File) => uploadFile(file, 'stories');

  /**
   * Upload de thumbnail de curso
   */
  const uploadCourseThumbnail = (file: File) => uploadFile(file, 'course-thumbnails');

  /**
   * Upload de vídeo de exercício
   */
  const uploadExerciseVideo = (file: File) => uploadFile(file, 'exercise-videos');

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
  };
}
