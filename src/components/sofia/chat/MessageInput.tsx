import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mic, 
  Camera, 
  Send, 
  Image, 
  X, 
  Loader2, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  isLoading: boolean;
  selectedImage: File | null;
  imagePreview: string | null;
  voiceEnabled: boolean;
  isListening: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onCameraClick: () => void;
  onGalleryClick: () => void;
  onMicClick: () => void;
  onToggleVoice: () => void;
  onRemoveImage: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  inputMessage,
  setInputMessage,
  isLoading,
  selectedImage,
  imagePreview,
  voiceEnabled,
  isListening,
  onSendMessage,
  onKeyPress,
  onCameraClick,
  onGalleryClick,
  onMicClick,
  onToggleVoice,
  onRemoveImage,
}) => {
  return (
    <>
      {/* Preview de imagem */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 bg-[#1F2C33] border-t border-[#2a3942]"
          >
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg object-cover" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full text-white"
                onClick={onRemoveImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de entrada estilo WhatsApp */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#1F2C33] border-t border-[#2a3942] flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão de Voz Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex-shrink-0 transition-all ${
              voiceEnabled 
                ? 'bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30' 
                : 'text-[#8696A0] hover:bg-white/5'
            }`}
            onClick={onToggleVoice}
            title={voiceEnabled ? "Desativar voz" : "Ativar voz"}
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" /> : <VolumeX className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>

          {/* Campo de texto */}
          <div className="flex-1 min-w-0 relative">
            <Input
              placeholder="Digite sua mensagem..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={onKeyPress}
              disabled={isLoading}
              className="bg-[#2A3942] border-none rounded-full text-white placeholder:text-[#8696A0] text-[15px] sm:text-base h-11 sm:h-12 pl-4 pr-24 focus-visible:ring-1 focus-visible:ring-[#25D366]"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-[#8696A0] hover:bg-white/5 hover:text-white rounded-full" 
                onClick={onCameraClick} 
                disabled={isLoading} 
                title="Câmera"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-[#8696A0] hover:bg-white/5 hover:text-white rounded-full" 
                onClick={onGalleryClick} 
                disabled={isLoading} 
                title="Galeria"
              >
                <Image className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Botão enviar/microfone */}
          <Button
            onClick={inputMessage.trim() || selectedImage ? onSendMessage : onMicClick}
            disabled={isLoading}
            size="icon"
            className={`rounded-full h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 shadow-lg transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse hover:bg-red-600' 
                : 'bg-[#00A884] text-white hover:bg-[#00A884]/90'
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
            ) : inputMessage.trim() || selectedImage ? (
              <Send className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
