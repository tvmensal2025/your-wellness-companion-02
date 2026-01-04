import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplets, Plus, Minus } from 'lucide-react';
import { useTrackingData } from '@/hooks/useTrackingData';
import { useToast } from '@/hooks/use-toast';

interface QuickWaterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_OPTIONS = [
  { label: '1 copo', value: 1, ml: 250 },
  { label: '2 copos', value: 2, ml: 500 },
  { label: '500ml', value: 2, ml: 500 },
  { label: '1 litro', value: 4, ml: 1000 },
];

export const QuickWaterModal: React.FC<QuickWaterModalProps> = ({ open, onOpenChange }) => {
  const [customAmount, setCustomAmount] = useState(250);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addWaterIntake, trackingData } = useTrackingData();
  const { toast } = useToast();

  const handleQuickAdd = async (glasses: number, ml: number) => {
    setIsSubmitting(true);
    try {
      await addWaterIntake(glasses);
      toast({
        title: "💧 Água registrada!",
        description: `+${ml}ml adicionados ao seu dia`,
      });
      onOpenChange(false);
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

  const handleCustomAdd = async () => {
    const glasses = Math.ceil(customAmount / 250);
    await handleQuickAdd(glasses, customAmount);
  };

  const todayTotal = (trackingData?.waterIntake?.today || 0) * 250;
  const goal = 2000;
  const progress = Math.min(100, (todayTotal / goal) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl bg-gradient-to-b from-background to-muted/30 border-border/50">
        <DialogHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-2"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Droplets className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <DialogTitle className="text-xl font-bold">Registrar Água</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Hoje: {todayTotal}ml de {goal}ml ({Math.round(progress)}%)
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar visual */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
          />
        </div>

        {/* Quick options */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {QUICK_OPTIONS.map((option, index) => (
            <motion.div
              key={option.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full h-14 text-base font-medium hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600 transition-all"
                onClick={() => handleQuickAdd(option.value, option.ml)}
                disabled={isSubmitting}
              >
                <Droplets className="w-4 h-4 mr-2 text-cyan-500" />
                {option.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Custom amount */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">Ou quantidade personalizada:</p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCustomAmount(Math.max(50, customAmount - 50))}
              className="h-12 w-12"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="text-center text-lg font-bold h-12 pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">ml</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCustomAmount(customAmount + 50)}
              className="h-12 w-12"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium"
            onClick={handleCustomAdd}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : `Adicionar ${customAmount}ml`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickWaterModal;
