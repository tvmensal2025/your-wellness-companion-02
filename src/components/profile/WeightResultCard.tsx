import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Trophy, Flame, Star, Target, Lock, Scale, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface WeightResultCardProps {
  initialWeight: number | null;
  currentWeight: number | null;
  targetWeight: number | null;
  isHidden?: boolean;
  isOwnProfile?: boolean;
  onAddWeight?: () => void;
}

export const WeightResultCard: React.FC<WeightResultCardProps> = ({
  initialWeight,
  currentWeight,
  targetWeight,
  isHidden = false,
  isOwnProfile = false,
  onAddWeight,
}) => {
  // Se não tem dados de peso, mostrar card de incentivo
  if (!initialWeight || !currentWeight) {
    // Só mostrar card de incentivo para o próprio perfil
    if (!isOwnProfile) {
      return null;
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-dashed border-2 border-muted-foreground/30 bg-muted/10">
          <CardContent className="p-4 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Acompanhe seu Peso</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Registre seu peso para ver sua evolução aqui
              </p>
            </div>
            {onAddWeight && (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1.5"
                onClick={onAddWeight}
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Peso
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const weightChange = currentWeight - initialWeight;
  const isLosingWeight = weightChange < 0;
  const isGainingWeight = weightChange > 0;
  const isMaintaining = weightChange === 0;

  // Calculate progress towards goal
  const totalToLose = targetWeight ? initialWeight - targetWeight : 0;
  const alreadyLost = initialWeight - currentWeight;
  const progressPercent = totalToLose > 0 ? Math.min(100, Math.max(0, (alreadyLost / totalToLose) * 100)) : 0;
  const remainingToGoal = targetWeight ? currentWeight - targetWeight : 0;

  // Get badge based on weight loss
  const getBadge = () => {
    const absChange = Math.abs(weightChange);
    if (isLosingWeight) {
      if (absChange >= 10) return { text: '🏆 Super Transformação!', color: 'text-yellow-500' };
      if (absChange >= 5) return { text: '💪 Grande Progresso!', color: 'text-green-500' };
      if (absChange >= 1) return { text: '🌟 No Caminho Certo!', color: 'text-blue-500' };
    }
    if (isMaintaining) return { text: '✨ Consistente!', color: 'text-muted-foreground' };
    return { text: '🔥 Foco no objetivo!', color: 'text-orange-500' };
  };

  const badge = getBadge();

  // Hidden state - show lock for other users
  if (isHidden && !isOwnProfile) {
    return (
      <Card className="border-muted/30 bg-muted/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Resultados de peso ocultos</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-2 overflow-hidden ${
        isLosingWeight 
          ? 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5' 
          : isGainingWeight 
            ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5'
            : 'border-muted/30 bg-muted/10'
      }`}>
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${
                isLosingWeight ? 'bg-green-500/20' : isGainingWeight ? 'bg-orange-500/20' : 'bg-muted/20'
              }`}>
                {isLosingWeight ? (
                  <TrendingDown className="w-5 h-5 text-green-500" />
                ) : isGainingWeight ? (
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                ) : (
                  <Minus className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <span className="font-semibold text-foreground">Resultado de Peso</span>
            </div>
            {isHidden && isOwnProfile && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Oculto</span>
              </div>
            )}
          </div>

          {/* Main Result */}
          <div className="text-center py-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`text-4xl font-bold ${
                isLosingWeight ? 'text-green-500' : isGainingWeight ? 'text-orange-500' : 'text-muted-foreground'
              }`}
            >
              {isLosingWeight ? '' : isGainingWeight ? '+' : ''}{weightChange.toFixed(1)}kg
            </motion.div>
            <div className={`text-sm font-medium mt-1 ${badge.color}`}>
              {badge.text}
            </div>
          </div>

          {/* Weight Journey */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <div className="text-muted-foreground text-xs">Inicial</div>
              <div className="font-semibold">{initialWeight.toFixed(1)}kg</div>
            </div>
            <div className="flex-1 mx-3 flex items-center">
              <div className="flex-1 h-px bg-border" />
              <Target className="w-4 h-4 mx-2 text-primary" />
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="text-center">
              <div className="text-muted-foreground text-xs">Atual</div>
              <div className="font-semibold text-primary">{currentWeight.toFixed(1)}kg</div>
            </div>
          </div>

          {/* Progress to Goal */}
          {targetWeight && targetWeight < initialWeight && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso para meta ({targetWeight}kg)</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              {remainingToGoal > 0 && (
                <div className="text-xs text-center text-muted-foreground">
                  Faltam <span className="font-semibold text-primary">{remainingToGoal.toFixed(1)}kg</span> para a meta
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
