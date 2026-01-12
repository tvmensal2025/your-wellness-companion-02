// =====================================================
// MODAL DE ATUALIZAÇÃO DE PROGRESSO
// =====================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Zap, Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useUpdateProgress } from '@/hooks/challenges/useChallengesV2';
import type { IndividualParticipation } from '@/types/challenges-v2';
import { CATEGORY_CONFIG, calculateProgress } from '@/types/challenges-v2';

interface ChallengeProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participation: IndividualParticipation;
}

export const ChallengeProgressModal: React.FC<ChallengeProgressModalProps> = ({
  open,
  onOpenChange,
  participation,
}) => {
  const challenge = participation.challenge;
  const [amount, setAmount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const updateProgress = useUpdateProgress();
  
  if (!challenge) return null;

  // Usar challenge_type (coluna real do banco) em vez de category
  const category = CATEGORY_CONFIG[challenge.challenge_type] || CATEGORY_CONFIG.exercicio;
  const currentProgress = participation.progress;
  const targetValue = participation.target_value || challenge.target_value || challenge.daily_log_target || 100;
  const newProgress = Math.min(currentProgress + amount, targetValue);
  const progressPercent = calculateProgress(newProgress, targetValue);
  const willComplete = newProgress >= targetValue;

  // Quick add buttons baseado no tipo
  const quickAddOptions = getQuickAddOptions(challenge.challenge_type);

  const handleSubmit = async () => {
    if (amount <= 0) return;

    try {
      await updateProgress.mutateAsync({
        participation_id: participation.id,
        new_progress: newProgress,
        is_daily_completion: willComplete,
      });

      if (willComplete) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onOpenChange(false);
        }, 2000);
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <SuccessAnimation comboMultiplier={participation.combo_multiplier || 1} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                    `bg-gradient-to-br ${category.color}`
                  )}>
                    {category.emoji}
                  </div>
                  <div>
                    <span className="block">{challenge.title}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      Atualizar progresso
                    </span>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Progresso atual */}
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">
                    {currentProgress} <span className="text-muted-foreground text-2xl">/ {targetValue}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getUnitLabel(challenge.challenge_type)}
                  </p>
                </div>

                {/* Input de quantidade */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setAmount(Math.max(0, amount - quickAddOptions[0]))}
                    disabled={amount <= 0}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 h-14 text-center text-2xl font-bold"
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setAmount(amount + quickAddOptions[0])}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                {/* Quick add buttons */}
                <div className="flex justify-center gap-2">
                  {quickAddOptions.map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(amount + value)}
                      className="min-w-[60px]"
                    >
                      +{value}
                    </Button>
                  ))}
                </div>

                {/* Preview do novo progresso */}
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Novo progresso</span>
                    <span className={cn(
                      "font-bold",
                      willComplete && "text-green-500"
                    )}>
                      {newProgress} / {targetValue}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        willComplete 
                          ? "bg-gradient-to-r from-green-500 to-emerald-400"
                          : `bg-gradient-to-r ${category.color}`
                      )}
                      initial={{ width: `${calculateProgress(currentProgress, targetValue)}%` }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  {willComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-2 bg-green-500/20 rounded-lg text-center"
                    >
                      <span className="text-green-500 font-medium flex items-center justify-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Meta do dia completa! +{Math.round((challenge.xp_reward || challenge.points_reward || 100) * (participation.combo_multiplier || 1))} XP
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Botão de confirmar */}
                <Button
                  className="w-full h-12"
                  onClick={handleSubmit}
                  disabled={amount <= 0 || updateProgress.isPending}
                >
                  {updateProgress.isPending ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Confirmar Progresso
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

// Animação de sucesso
const SuccessAnimation: React.FC<{ comboMultiplier: number }> = ({ comboMultiplier }) => (
  <motion.div
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="py-12 text-center"
  >
    <motion.div
      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: 0.5 }}
      className="text-6xl mb-4"
    >
      🎉
    </motion.div>
    <h3 className="text-2xl font-bold text-green-500 mb-2">Incrível!</h3>
    <p className="text-muted-foreground">
      Progresso atualizado com sucesso
    </p>
    {comboMultiplier > 1 && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full"
      >
        <span className="text-orange-400 font-bold">🔥 Combo x{comboMultiplier.toFixed(1)}</span>
      </motion.div>
    )}
  </motion.div>
);

// Helpers
function getQuickAddOptions(challengeType: string): number[] {
  switch (challengeType) {
    case 'hidratacao':
      return [250, 500, 1000];
    case 'passos':
      return [1000, 2500, 5000];
    case 'exercicio':
      return [10, 30, 60];
    default:
      return [1, 5, 10];
  }
}

function getUnitLabel(challengeType: string): string {
  switch (challengeType) {
    case 'hidratacao':
      return 'mililitros de água';
    case 'passos':
      return 'passos';
    case 'exercicio':
      return 'minutos de exercício';
    default:
      return 'unidades';
  }
}

export default ChallengeProgressModal;
