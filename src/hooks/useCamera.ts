import { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useHaptics } from './useHaptics';
import { toast } from 'sonner';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
  width?: number;
  height?: number;
  correctOrientation?: boolean;
}

export interface CameraResult {
  dataUrl?: string;
  webPath?: string;
  base64String?: string;
  format: string;
}

const defaultOptions: CameraOptions = {
  quality: 90,
  allowEditing: true,
  resultType: CameraResultType.DataUrl,
  correctOrientation: true,
  width: 1024,
  height: 1024,
};

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [photo, setPhoto] = useState<CameraResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { triggerHaptic } = useHaptics();

  const isNative = Capacitor.isNativePlatform();

  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (!isNative) {
        // Web - check if camera API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          return false;
        }
        return true;
      }

      const permissions = await Camera.checkPermissions();
      if (permissions.camera === 'granted' && permissions.photos === 'granted') {
        return true;
      }

      const requested = await Camera.requestPermissions();
      return requested.camera === 'granted';
    } catch (err) {
      console.error('Permission check failed:', err);
      return false;
    }
  }, [isNative]);

  const takePhoto = useCallback(async (options?: CameraOptions): Promise<CameraResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      await triggerHaptic('light');

      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error('Permissão de câmera negada');
      }

      const mergedOptions = { ...defaultOptions, ...options };

      const image: Photo = await Camera.getPhoto({
        quality: mergedOptions.quality,
        allowEditing: mergedOptions.allowEditing,
        resultType: mergedOptions.resultType || CameraResultType.DataUrl,
        source: mergedOptions.source || CameraSource.Prompt,
        width: mergedOptions.width,
        height: mergedOptions.height,
        correctOrientation: mergedOptions.correctOrientation,
      });

      const result: CameraResult = {
        dataUrl: image.dataUrl,
        webPath: image.webPath,
        base64String: image.base64String,
        format: image.format,
      };

      setPhoto(result);
      await triggerHaptic('success');
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao capturar foto';
      
      // User cancelled - not an error
      if (errorMessage.includes('cancelled') || errorMessage.includes('User cancelled')) {
        setIsLoading(false);
        return null;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      await triggerHaptic('error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkPermissions, triggerHaptic]);

  const takePhotoFromCamera = useCallback(async (options?: Omit<CameraOptions, 'source'>) => {
    return takePhoto({ ...options, source: CameraSource.Camera });
  }, [takePhoto]);

  const pickFromGallery = useCallback(async (options?: Omit<CameraOptions, 'source'>) => {
    return takePhoto({ ...options, source: CameraSource.Photos });
  }, [takePhoto]);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
    setError(null);
  }, []);

  const dataUrlToBlob = useCallback(async (dataUrl: string): Promise<Blob> => {
    const response = await fetch(dataUrl);
    return response.blob();
  }, []);

  const dataUrlToFile = useCallback(async (dataUrl: string, filename: string): Promise<File> => {
    const blob = await dataUrlToBlob(dataUrl);
    return new File([blob], filename, { type: blob.type });
  }, [dataUrlToBlob]);

  return {
    // State
    isLoading,
    photo,
    error,
    isNative,
    
    // Actions
    takePhoto,
    takePhotoFromCamera,
    pickFromGallery,
    clearPhoto,
    checkPermissions,
    
    // Utilities
    dataUrlToBlob,
    dataUrlToFile,
  };
};

// Component for easy photo capture
export { CameraSource, CameraResultType };
