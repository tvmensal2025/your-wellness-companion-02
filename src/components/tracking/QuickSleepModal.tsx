import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Moon, Star, Sparkles } from 'lucide-react';
import { useTrackingData } from '@/hooks/useTrackingData';
import { useToast } from '@/hooks/use-toast';

interface QuickSleepModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUALITY_LABELS = ['Péssima', 'Ruim', 'Regular', 'Boa', 'Excelente'];
const QUALITY_EMOJIS = ['😫', '😔', '😐', '😊', '🌟'];

export const QuickSleepModal: React.FC<QuickSleepModalProps> = ({ open, onOpenChange }) => {
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSleepData, trackingData } = useTrackingData();
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addSleepData({ hours, quality, notes });
      toast({
        title: "😴 Sono registrado!",
        description: `${hours}h de sono com qualidade ${QUALITY_LABELS[quality - 1].toLowerCase()}`,
      });
      onOpenChange(false);
      setNotes('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const lastNight = trackingData?.sleep?.lastNight;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl bg-gradient-to-b from-background to-indigo-950/10 border-border/50">
        <DialogHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-2"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Moon className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <DialogTitle className="text-xl font-bold">Registrar Sono</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {lastNight?.hours ? `Última noite: ${lastNight.hours}h` : 'Como foi sua noite?'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Hours slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Horas de sono</span>
              <motion.span 
                key={hours}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-indigo-500"
              >
                {hours}h
              </motion.span>
            </div>
            <Slider
              value={[hours]}
              onValueChange={([v]) => setHours(v)}
              min={1}
              max={12}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1h</span>
              <span>6h</span>
              <span>12h</span>
            </div>
          </div>

          {/* Quality selector */}
          <div className="space-y-3">
            <span className="text-sm font-medium">Qualidade do sono</span>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((q) => (
                <motion.button
                  key={q}
                  onClick={() => setQuality(q)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 py-3 rounded-xl text-2xl transition-all ${
                    quality === q 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {QUALITY_EMOJIS[q - 1]}
                </motion.button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {QUALITY_LABELS[quality - 1]}
            </p>
          </div>

          {/* Notes (optional) */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Observações (opcional)</span>
            <Textarea
              placeholder="Sonhos, interrupções, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-20"
            />
          </div>

          {/* Submit button */}
          <Button
            className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Salvando...'
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Registrar Sono
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickSleepModal;
