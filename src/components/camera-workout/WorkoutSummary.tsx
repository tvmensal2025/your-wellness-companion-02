import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  TrendingUp,
  Share2,
  X,
} from 'lucide-react';
import { 
  calculateSessionScore, 
  calculateLevel, 
  getRank,
  getMotivationalMessage,
  checkAchievements,
} from '@/services/camera-workout/scoringService';
import { cn } from '@/lib/utils';

interface WorkoutSummaryProps {
  totalReps: number;
  duration: number; // em segundos
  averageFormScore: number;
  caloriesBurned: number;
  exerciseType: string;
  streakDays?: number;
  totalXp?: number;
  onClose: () => void;
  onShare?: () => void;
}

export function WorkoutSummary({
  totalReps,
  duration,
  averageFormScore,
  caloriesBurned,
  exerciseType,
  streakDays = 0,
  totalXp = 0,
  onClose,
  onShare,
}: WorkoutSummaryProps) {
  // Calcula pontuação
  const scoring = calculateSessionScore(totalReps, averageFormScore, streakDays);
  
  // Calcula nível
  const newTotalXp = totalXp + scoring.xp;
  const levelInfo = calculateLevel(newTotalXp);
  
  // Calcula rank
  const rankInfo = getRank(scoring.totalPoints);
  
  // Mensagem motivacional
  const message = getMotivationalMessage(totalReps, averageFormScore);
  
  // Formata duração
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Treino Concluído!</h2>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Pontuação Principal */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center py-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl"
            >
              <div className="text-5xl font-bold text-primary mb-2">
                {scoring.totalPoints}
              </div>
              <div className="text-sm text-muted-foreground">Pontos Totais</div>
              {scoring.bonusPoints > 0 && (
                <div className="text-xs text-primary mt-1">
                  +{scoring.bonusPoints} bônus
                </div>
              )}
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Target}
                label="Repetições"
                value={totalReps.toString()}
                delay={0.3}
              />
              <StatCard
                icon={Clock}
                label="Tempo"
                value={durationText}
                delay={0.35}
              />
              <StatCard
                icon={Flame}
                label="Calorias"
                value={caloriesBurned.toString()}
                delay={0.4}
              />
              <StatCard
                icon={TrendingUp}
                label="Forma"
                value={`${Math.round(averageFormScore)}%`}
                delay={0.45}
                color={averageFormScore >= 80 ? 'text-green-500' : 'text-yellow-500'}
              />
            </div>

            {/* XP e Nível */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nível {levelInfo.level}</span>
                <span className="text-primary font-semibold">+{scoring.xp} XP</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-primary to-primary/60"
                />
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
              </div>
            </motion.div>

            {/* Rank */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-between p-3 bg-card border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{rankInfo.icon}</span>
                <div>
                  <div className={cn("font-semibold", rankInfo.color)}>
                    {rankInfo.rank}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Seu rank atual
                  </div>
                </div>
              </div>
              {rankInfo.pointsToNext > 0 && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Próximo:</div>
                  <div className="text-sm font-medium">{rankInfo.nextRank}</div>
                </div>
              )}
            </motion.div>

            {/* Bônus */}
            {(scoring.formBonus > 0 || scoring.streakBonus > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-2"
              >
                <div className="text-sm font-medium">Bônus Conquistados:</div>
                <div className="space-y-1">
                  {scoring.formBonus > 0 && (
                    <div className="flex items-center justify-between text-sm p-2 bg-green-500/10 rounded">
                      <span className="text-green-600 dark:text-green-400">
                        ⭐ Boa Forma
                      </span>
                      <span className="font-semibold">+{scoring.formBonus}</span>
                    </div>
                  )}
                  {scoring.streakBonus > 0 && (
                    <div className="flex items-center justify-between text-sm p-2 bg-orange-500/10 rounded">
                      <span className="text-orange-600 dark:text-orange-400">
                        🔥 Streak de {streakDays} dias
                      </span>
                      <span className="font-semibold">+{scoring.streakBonus}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {onShare && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={onClose}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Concluir
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Componente auxiliar para stats
function StatCard({
  icon: Icon,
  label,
  value,
  delay,
  color = 'text-primary',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delay: number;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring' }}
      className="p-3 bg-card border rounded-lg"
    >
      <Icon className={cn("w-5 h-5 mb-2", color)} />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}
