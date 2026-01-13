import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';
import { Send, Loader2, MessageCircle, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShareToWhatsAppButtonProps {
  userId: string;
  sessionType: string;
  sessionTitle: string;
  resultData: Record<string, any>;
  cardRef: React.RefObject<HTMLDivElement>;
  variant?: 'default' | 'compact' | 'floating';
  className?: string;
}

export const ShareToWhatsAppButton: React.FC<ShareToWhatsAppButtonProps> = ({
  userId,
  sessionType,
  sessionTitle,
  resultData,
  cardRef,
  variant = 'default',
  className
}) => {
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!userId || !cardRef.current) {
      toast({
        title: "Erro",
        description: "Não foi possível preparar o compartilhamento",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      // 1. Capturar imagem do card
      toast({
        title: "📸 Preparando...",
        description: "Gerando seu card personalizado"
      });

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imageBase64 = canvas.toDataURL('image/png').split(',')[1];

      // 2. Enviar para edge function
      toast({
        title: "📤 Enviando...",
        description: "Mandando para seu WhatsApp"
      });

      const { data, error } = await supabase.functions.invoke('whatsapp-habits-analysis', {
        body: {
          userId,
          imageBase64,
          sessionType,
          sessionTitle,
          resultData,
          action: 'share-session-result'
        }
      });

      if (error) throw error;

      if (data?.success) {
        setShowSuccess(true);
        toast({
          title: "✅ Enviado!",
          description: "Resultado enviado para seu WhatsApp"
        });

        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        throw new Error(data?.error || 'Erro ao enviar');
      }
    } catch (error: any) {
      console.error('Erro ao compartilhar:', error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Variantes de estilo
  const variants = {
    default: cn(
      "w-full h-14 rounded-2xl font-semibold text-base",
      "bg-gradient-to-r from-green-500 to-emerald-600",
      "hover:from-green-600 hover:to-emerald-700",
      "text-white shadow-lg shadow-green-500/30",
      "transition-all duration-300",
      "hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5"
    ),
    compact: cn(
      "h-10 px-4 rounded-xl font-medium text-sm",
      "bg-green-500 hover:bg-green-600",
      "text-white shadow-md"
    ),
    floating: cn(
      "fixed bottom-24 right-4 z-50",
      "w-14 h-14 rounded-full",
      "bg-gradient-to-r from-green-500 to-emerald-600",
      "hover:from-green-600 hover:to-emerald-700",
      "text-white shadow-xl shadow-green-500/40",
      "flex items-center justify-center"
    )
  };

  return (
    <AnimatePresence mode="wait">
      {showSuccess ? (
        <motion.div
          key="success"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={cn(
            variants[variant],
            "bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center gap-2",
            className
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            ✅
          </motion.div>
          <span>Enviado!</span>
        </motion.div>
      ) : (
        <motion.div
          key="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Button
            onClick={handleShare}
            disabled={isSending}
            className={cn(variants[variant], className)}
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {variant !== 'floating' && 'Enviando...'}
              </>
            ) : (
              <>
                {variant === 'floating' ? (
                  <MessageCircle className="w-6 h-6" />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    📤 Enviar para WhatsApp
                  </>
                )}
              </>
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
