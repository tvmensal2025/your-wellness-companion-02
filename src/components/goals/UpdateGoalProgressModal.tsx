import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoalsGamification } from '@/hooks/useGoalsGamification';

interface UpdateGoalProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: any;
  onSuccess: () => void;
}

export const UpdateGoalProgressModal = ({ 
  open, 
  onOpenChange, 
  goal,
  onSuccess 
}: UpdateGoalProgressModalProps) => {
  const [progress, setProgress] = useState(goal.current_value || 0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { processXPGain, updateStreak } = useGoalsGamification(goal.user_id);

  const handleQuickAction = (amount: number) => {
    setProgress(prev => Math.min(prev + amount, goal.target_value));
  };

  const calculateXPGain = (progressDelta: number) => {
    // XP baseado no progresso + dificuldade
    const baseXP = Math.round(progressDelta * 10);
    const difficultyMultiplier = {
      'facil': 1,
      'medio': 1.5,
      'dificil': 2
    }[goal.difficulty] || 1;
    
    return Math.round(baseXP * difficultyMultiplier);
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const progressDelta = progress - (goal.current_value || 0);
      const xpGain = calculateXPGain(progressDelta);
      const newStatus = progress >= goal.target_value ? 'concluida' : 'em_progresso';

      // Atualizar meta
      const { error } = await supabase
        .from('user_goals')
        .update({ 
          current_value: progress,
          status: newStatus,
          xp_earned: (goal.xp_earned || 0) + xpGain,
        })
        .eq('id', goal.id);

      if (error) throw error;

      // Processar XP e level up
      if (xpGain > 0) {
        processXPGain({ xpAmount: xpGain });
      }

      // Atualizar streak
      updateStreak({ goalId: goal.id });

      toast({
        title: "✅ Progresso atualizado!",
        description: `Você ganhou ${xpGain} XP! Continue assim! 🔥`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = goal.target_value > 0 
    ? Math.min((progress / goal.target_value) * 100, 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Atualizar Progresso
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Progresso Atual */}
          <div>
            <Label>Progresso Atual</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                max={goal.target_value}
                min={0}
                className="flex-1"
              />
              <span className="flex items-center text-sm text-muted-foreground">
                / {goal.target_value} {goal.unit}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-semibold">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Ações Rápidas</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(1)}
                className="gap-1"
              >
                <Zap className="w-3 h-3" />
                +1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(5)}
                className="gap-1"
              >
                <Zap className="w-3 h-3" />
                +5
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(10)}
                className="gap-1"
              >
                <Zap className="w-3 h-3" />
                +10
              </Button>
            </div>
          </div>

          {/* XP Preview */}
          {progress !== goal.current_value && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">XP a ganhar:</span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  +{calculateXPGain(progress - (goal.current_value || 0))} XP
                </span>
              </div>
            </motion.div>
          )}

          {/* Botão de Atualizar */}
          <Button
            onClick={handleUpdate}
            disabled={isLoading || progress === goal.current_value}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar Progresso'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
