import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image, X, Check, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera, CameraSource } from '@/hooks/useCamera';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (imageData: { dataUrl?: string; file?: File }) => void;
  onCancel?: () => void;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'free';
  quality?: number;
  showPreview?: boolean;
  allowGallery?: boolean;
  captureLabel?: string;
  galleryLabel?: string;
  confirmLabel?: string;
  retakeLabel?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
  className,
  aspectRatio = 'square',
  quality = 90,
  showPreview = true,
  allowGallery = true,
  captureLabel = 'Tirar Foto',
  galleryLabel = 'Galeria',
  confirmLabel = 'Usar Foto',
  retakeLabel = 'Tirar Outra',
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { 
    isLoading, 
    takePhotoFromCamera, 
    pickFromGallery, 
    dataUrlToFile,
    isNative 
  } = useCamera();
  const { shouldReduceMotion } = useReducedMotion();

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-video';
      default: return '';
    }
  };

  const handleCameraCapture = async () => {
    const result = await takePhotoFromCamera({ quality });
    if (result?.dataUrl) {
      if (showPreview) {
        setPreviewImage(result.dataUrl);
      } else {
        onCapture({ dataUrl: result.dataUrl });
      }
    }
  };

  const handleGalleryPick = async () => {
    const result = await pickFromGallery({ quality });
    if (result?.dataUrl) {
      if (showPreview) {
        setPreviewImage(result.dataUrl);
      } else {
        onCapture({ dataUrl: result.dataUrl });
      }
    }
  };

  const handleConfirm = async () => {
    if (previewImage) {
      const file = await dataUrlToFile(previewImage, `capture-${Date.now()}.jpg`);
      onCapture({ dataUrl: previewImage, file });
      setPreviewImage(null);
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
  };

  const handleCancel = () => {
    setPreviewImage(null);
    onCancel?.();
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <AnimatePresence mode="wait">
        {previewImage ? (
          <motion.div
            key="preview"
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
            className="relative"
          >
            {/* Preview Image */}
            <div className={cn(
              'relative overflow-hidden rounded-xl bg-muted',
              getAspectRatioClass()
            )}>
              <img
                src={previewImage}
                alt="Captured preview"
                className="w-full h-full object-cover"
              />
              
              {/* Close button */}
              <button
                onClick={handleCancel}
                className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Actions */}
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={handleRetake}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {retakeLabel}
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="capture"
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
          >
            {/* Capture Placeholder */}
            <div className={cn(
              'relative overflow-hidden rounded-xl border-2 border-dashed border-border',
              'bg-muted/50 flex flex-col items-center justify-center gap-4 p-8',
              getAspectRatioClass()
            )}>
              {isLoading ? (
                <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
              ) : (
                <>
                  <Camera className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    {isNative 
                      ? 'Capture uma foto ou escolha da galeria'
                      : 'Tire uma foto usando sua câmera'}
                  </p>
                </>
              )}
            </div>

            {/* Capture Actions */}
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleCameraCapture}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                {captureLabel}
              </Button>
              
              {allowGallery && (
                <Button
                  variant="outline"
                  onClick={handleGalleryPick}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {galleryLabel}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple camera button for inline use
interface CameraButtonProps {
  onCapture: (dataUrl: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  source?: 'camera' | 'gallery' | 'prompt';
}

export const CameraButton: React.FC<CameraButtonProps> = ({
  onCapture,
  className,
  variant = 'outline',
  size = 'icon',
  source = 'prompt',
}) => {
  const { isLoading, takePhoto } = useCamera();

  const handleClick = async () => {
    const sourceMap = {
      camera: CameraSource.Camera,
      gallery: CameraSource.Photos,
      prompt: CameraSource.Prompt,
    };
    
    const result = await takePhoto({ source: sourceMap[source] });
    if (result?.dataUrl) {
      onCapture(result.dataUrl);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Camera className="w-4 h-4" />
      )}
    </Button>
  );
};
