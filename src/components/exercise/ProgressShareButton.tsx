import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  TrendingUp, 
  Share2, 
  Download, 
  Instagram, 
  Copy, 
  Check,
  Flame,
  Target,
  Dumbbell,
  Calendar,
  Trophy
} from "lucide-react";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ProgressStats {
  totalWorkouts: number;
  currentStreak: number;
  weightChange: number | null;
  challengesCompleted: number;
}

interface ProgressShareButtonProps {
  stats: ProgressStats;
}

export const ProgressShareButton: React.FC<ProgressShareButtonProps> = ({ stats }) => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const weightText = stats.weightChange !== null 
    ? stats.weightChange < 0 
      ? `${Math.abs(stats.weightChange).toFixed(1)}kg perdidos` 
      : stats.weightChange > 0 
        ? `${stats.weightChange.toFixed(1)}kg ganhos`
        : "Peso mantido"
    : null;

  const shareText = `💪 Meu Progresso MaxNutrition!\n\n🏋️ ${stats.totalWorkouts} treinos\n🔥 ${stats.currentStreak} dias de sequência\n${weightText ? `⚖️ ${weightText}\n` : ""}🏆 ${stats.challengesCompleted} desafios\n\nBaixe: app.oficialmaxnutrition.com.br 🚀`;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = "meu-progresso.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({
        title: "Imagem salva!",
        description: "Agora é só postar nas redes sociais 📸",
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
        
        const file = new File([blob], "progresso.png", { type: "image/png" });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Meu Progresso!",
            text: shareText,
            files: [file],
          });
        } else {
          handleDownloadImage();
        }
      }, "image/png");
    } catch (err) {
      console.log("Share cancelled");
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
      description: "Cole nas suas redes sociais",
    });
  };

  const handleOpenInstagram = () => {
    window.open("instagram://story-camera", "_blank");
    setTimeout(() => {
      window.open("https://www.instagram.com/", "_blank");
    }, 500);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 px-3 gap-1.5 text-xs font-medium bg-gradient-to-r from-orange-500/10 to-pink-500/10 hover:from-orange-500/20 hover:to-pink-500/20 border border-orange-500/30 rounded-lg transition-all"
      >
        <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
        <span className="hidden xs:inline">Progresso</span>
        {stats.totalWorkouts > 0 && (
          <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-orange-500/10 text-orange-600 border-0">
            {stats.totalWorkouts}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-sm p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-pink-500" />
              Compartilhar Progresso
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Card para Screenshot */}
            <motion.div 
              ref={cardRef} 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-5 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-600 text-white shadow-xl"
            >
              {/* Logo e nome centralizados */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg">MaxNutrition</span>
              </div>
              
              <h2 className="text-xl font-bold mb-4 text-center">📈 Meu Progresso!</h2>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center bg-white/10 rounded-lg p-3">
                  <Dumbbell className="w-5 h-5 mx-auto mb-1 opacity-80" />
                  <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
                  <p className="text-xs opacity-80">treinos</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-3">
                  <Flame className="w-5 h-5 mx-auto mb-1 opacity-80" />
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className="text-xs opacity-80">dias seguidos</p>
                </div>
                {weightText && (
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <Target className="w-5 h-5 mx-auto mb-1 opacity-80" />
                    <p className="text-lg font-bold">{Math.abs(stats.weightChange || 0).toFixed(1)}kg</p>
                    <p className="text-xs opacity-80">{stats.weightChange && stats.weightChange < 0 ? "perdidos" : "ganhos"}</p>
                  </div>
                )}
                <div className="text-center bg-white/10 rounded-lg p-3">
                  <Calendar className="w-5 h-5 mx-auto mb-1 opacity-80" />
                  <p className="text-2xl font-bold">{stats.challengesCompleted}</p>
                  <p className="text-xs opacity-80">desafios</p>
                </div>
              </div>
              
              <p className="text-center text-sm opacity-90 mt-3">
                Baixe: <span className="font-semibold">app.oficialmaxnutrition.com.br</span>
              </p>
            </motion.div>

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
                {copied ? "Copiado!" : "Copiar Texto"}
              </Button>
              <Button 
                variant="outline"
                className="gap-2 border-pink-300 text-pink-600 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-400 dark:hover:bg-pink-950"
                onClick={handleOpenInstagram}
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
