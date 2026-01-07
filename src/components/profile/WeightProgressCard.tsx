import { motion } from 'framer-motion';
import { Scale, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WeightProgressCardProps {
  currentWeight: number | null;
  targetWeight: number | null;
  initialWeight: number | null;
  weightLoss: number | null;
  weightProgress: number;
}

export function WeightProgressCard({
  currentWeight,
  targetWeight,
  initialWeight,
  weightLoss,
  weightProgress,
}: WeightProgressCardProps) {
  if (!currentWeight && !targetWeight) {
    return null;
  }

  const isLosingWeight = weightLoss !== null && weightLoss > 0;
  const remaining = targetWeight && currentWeight ? currentWeight - targetWeight : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            Jornada de Peso
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {initialWeight && (
              <div className="p-2 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground block">Inicial</span>
                <span className="font-bold text-sm">{initialWeight.toFixed(1)}kg</span>
              </div>
            )}
            {currentWeight && (
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-xs text-muted-foreground block">Atual</span>
                <span className="font-bold text-sm text-primary">{currentWeight.toFixed(1)}kg</span>
              </div>
            )}
            {targetWeight && (
              <div className="p-2 rounded-lg bg-green-500/10">
                <span className="text-xs text-muted-foreground block">Meta</span>
                <span className="font-bold text-sm text-green-600 dark:text-green-400">{targetWeight.toFixed(1)}kg</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {weightProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-semibold text-primary">{weightProgress}%</span>
              </div>
              <Progress value={weightProgress} className="h-2" />
            </div>
          )}

          {/* Weight Loss Badge */}
          {weightLoss !== null && (
            <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
              isLosingWeight 
                ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
            }`}>
              {isLosingWeight ? (
                <TrendingDown className="w-5 h-5" />
              ) : (
                <TrendingUp className="w-5 h-5" />
              )}
              <span className="font-bold text-lg">
                {isLosingWeight ? '-' : '+'}{Math.abs(weightLoss).toFixed(1)}kg
              </span>
              <span className="text-sm">desde o início</span>
            </div>
          )}

          {/* Remaining */}
          {remaining !== null && remaining > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>Faltam <strong className="text-foreground">{remaining.toFixed(1)}kg</strong> para a meta!</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
