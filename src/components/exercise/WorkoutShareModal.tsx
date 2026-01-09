import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Dumbbell, Flame, Share2, Download, Instagram, Copy, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

interface WorkoutStats {
  duration: number;
  exercises: number;
  sets: number;
  calories?: number;
}

interface WorkoutShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: WorkoutStats;
}

export const WorkoutShareModal: React.FC<WorkoutShareModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareText = `💪 Acabei de completar meu treino!\n\n⏱️ ${stats.duration} minutos\n🏋️ ${stats.exercises} exercícios\n🔥 ${stats.sets} séries\n\nTreino com MaxNutrition App! 🚀`;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = 'meu-treino.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: "Imagem salva!",
        description: "Agora é só postar no Instagram 📸",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a imagem",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], 'treino.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Treino Concluído!',
            text: shareText,
            files: [file],
          });
        } else {
          // Fallback: download
          handleDownloadImage();
        }
      }, 'image/png');
    } catch (err) {
      // User cancelled or error
      console.log('Share cancelled');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Texto copiado!",
      description: "Cole no seu Instagram Stories",
    });
  };

  const handleOpenInstagram = () => {
    // Deep link para Instagram
    window.open('instagram://story-camera', '_blank');
    // Fallback para web se não tiver o app
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank');
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-sm p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-500" />
            Compartilhar Treino
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Card para Screenshot */}
          <div ref={cardRef} className="p-5 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white shadow-xl">
            {/* Logo e nome centralizados */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Dumbbell className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg">MaxNutrition</span>
            </div>
            
            <h2 className="text-xl font-bold mb-4 text-center">🏆 Treino Concluído!</h2>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center bg-white/10 rounded-lg p-3">
                <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <p className="text-xl font-bold">{stats.duration}</p>
                <p className="text-xs opacity-80">min</p>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-3">
                <Dumbbell className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <p className="text-xl font-bold">{stats.exercises}</p>
                <p className="text-xs opacity-80">exercícios</p>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-3">
                <Flame className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <p className="text-xl font-bold">{stats.sets}</p>
                <p className="text-xs opacity-80">séries</p>
              </div>
            </div>
            
            <p className="text-center text-sm opacity-90 mt-3">
              Baixe: <span className="font-semibold">app.oficialmaxnutrition.com.br</span>
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleDownloadImage}
              disabled={isSharing}
            >
              <Download className="w-4 h-4" />
              Salvar
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              onClick={handleShare}
              disabled={isSharing}
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleCopyText}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </Button>
            <Button 
              variant="outline"
              className="gap-2 border-pink-300 text-pink-600 hover:bg-pink-50"
              onClick={handleOpenInstagram}
            >
              <Instagram className="w-4 h-4" />
              Instagram
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
