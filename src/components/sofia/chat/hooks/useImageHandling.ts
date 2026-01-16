import { useState, useRef, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseImageHandlingProps {
  user: SupabaseUser | null;
}

interface UseImageHandlingReturn {
  selectedImage: File | null;
  imagePreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  cameraInputRef: React.RefObject<HTMLInputElement>;
  handleImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageUpload: (file: File) => Promise<string | null>;
  handleCameraClick: () => void;
  handleGalleryClick: () => void;
  handleRemoveImage: () => void;
  setSelectedImage: React.Dispatch<React.SetStateAction<File | null>>;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useImageHandling = ({ user }: UseImageHandlingProps): UseImageHandlingReturn => {
  const { toast } = useToast();
  
  // State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Image upload handler
  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para enviar imagens",
          variant: "destructive",
        });
        return null;
      }

      const safeOriginalName = (file.name || 'imagem')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '-');

      const fileName = `${user.id}/${Date.now()}_${safeOriginalName}`;
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        toast({
          title: "Erro",
          description: "Erro ao fazer upload da imagem",
          variant: "destructive",
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar imagem",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Image select handler
  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  // Camera click handler
  const handleCameraClick = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  // Gallery click handler
  const handleGalleryClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Remove image handler
  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  return {
    selectedImage,
    imagePreview,
    fileInputRef,
    cameraInputRef,
    handleImageSelect,
    handleImageUpload,
    handleCameraClick,
    handleGalleryClick,
    handleRemoveImage,
    setSelectedImage,
    setImagePreview,
  };
};
