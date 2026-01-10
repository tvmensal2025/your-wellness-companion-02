import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Trophy, 
  Calendar, 
  Dumbbell, 
  BarChart3,
  Flame,
  Target,
  Zap,
  Star,
  Medal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ExerciseEvolutionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  userId?: string;
}

interface EvolutionData {
  weight_kg: number | null;
  max_weight_kg: number | null;
  max_reps: number | null;
  total_sets: number | null;
  total_volume: number | null;
  last_workout_date: string | null;
  progression_trend: string | null;
}

interface HistoryEntry {
  weight_kg: number;
  completed_at: string;
}

// Mensagens motivacionais baseadas no progresso
const getMotivationalMessage = (evolution: EvolutionData | null, history: HistoryEntry[]): { emoji: string; message: string; color: string } => {
  if (!evolution) {
    return { emoji: '🎯', message: 'Primeira vez? Vamos começar sua jornada!', color: 'text-blue-600' };
  }
  
  if (evolution.progression_trend === 'up') {
    return { emoji: '🚀', message: 'Você está evoluindo! Continue assim!', color: 'text-green-600' };
  }
  
  if (evolution.total_sets && evolution.total_sets >= 50) {
    return { emoji: '🏆', message: 'Veterano! Mais de 50 séries neste exercício!', color: 'text-yellow-600' };
  }
  
  if (evolution.max_weight_kg && evolution.weight_kg && evolution.weight_kg >= evolution.max_weight_kg * 0.95) {
    return { emoji: '🔥', message: 'Perto do seu recorde! Hoje pode ser o dia!', color: 'text-orange-600' };
  }
  
  return { emoji: '💪', message: 'Cada série conta! Foco no treino!', color: 'text-emerald-600' };
};

// Calcular conquistas
const getAchievements = (evolution: EvolutionData | null): { icon: React.ReactNode; label: string; unlocked: boolean }[] => {
  const achievements = [
    { 
      icon: <Star className="w-4 h-4" />, 
      label: 'Primeira série', 
      unlocked: (evolution?.total_sets || 0) >= 1 
    },
    { 
      icon: <Flame className="w-4 h-4" />, 
      label: '10 séries', 
      unlocked: (evolution?.total_sets || 0) >= 10 
    },
    { 
      icon: <Zap className="w-4 h-4" />, 
      label: '25 séries', 
      unlocked: (evolution?.total_sets || 0) >= 25 
    },
    { 
      icon: <Medal className="w-4 h-4" />, 
      label: '50 séries', 
      unlocked: (evolution?.total_sets || 0) >= 50 
    },
    { 
      icon: <Trophy className="w-4 h-4" />, 
      label: '100 séries', 
      unlocked: (evolution?.total_sets || 0) >= 100 
    },
  ];
  return achievements;
};

interface ExerciseEvolutionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  userId?: string;
}

interface EvolutionData {
  weight_kg: number | null;
  max_weight_kg: number | null;
  max_reps: number | null;
  total_sets: number | null;
  total_volume: number | null;
  last_workout_date: string | null;
  progression_trend: string | null;
}

interface HistoryEntry {
  weight_kg: number;
  completed_at: string;
}

export const ExerciseEvolutionPopup: React.FC<ExerciseEvolutionPopupProps> = ({
  isOpen,
  onClose,
  exerciseName,
  userId,
}) => {
  const [evolution, setEvolution] = useState<EvolutionData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !exerciseName) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let currentUserId = userId;
        if (!currentUserId) {
          const { data: { user } } = await supabase.auth.getUser();
          currentUserId = user?.id;
        }
        if (!currentUserId) {
          setLoading(false);
          return;
        }

        // Buscar evolução
        const { data: evolutionData } = await supabase
          .from('user_workout_evolution')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('exercise_name', exerciseName)
          .maybeSingle();

        setEvolution(evolutionData);

        // Buscar histórico recente (últimos 10 treinos com peso)
        const { data: historyData } = await supabase
          .from('user_exercise_history')
          .select('notes, completed_at')
          .eq('user_id', currentUserId)
          .eq('exercise_name', exerciseName)
          .order('completed_at', { ascending: false })
          .limit(10);

        // Extrair peso do campo notes (formato: "Treino: X | Peso: Ykg")
        const parsedHistory: HistoryEntry[] = (historyData || [])
          .map(entry => {
            const match = entry.notes?.match(/Peso:\s*([\d.]+)/);
            const weight = match ? parseFloat(match[1]) : null;
            return weight ? { weight_kg: weight, completed_at: entry.completed_at } : null;
          })
          .filter((h): h is HistoryEntry => h !== null);

        setHistory(parsedHistory);
      } catch (error) {
        console.error('Erro ao buscar evolução:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, exerciseName, userId]);

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendLabel = (trend: string | null) => {
    switch (trend) {
      case 'up':
        return 'Subindo 📈';
      case 'down':
        return 'Descendo 📉';
      default:
        return 'Estável';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const hasData = evolution || history.length > 0;
  const motivational = getMotivationalMessage(evolution, history);
  const achievements = getAchievements(evolution);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-sm p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Sua Evolução
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome do exercício */}
          <div className="text-center pb-2 border-b">
            <h3 className="font-semibold text-lg">{exerciseName}</h3>
            {/* Mensagem motivacional */}
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("text-sm mt-1 font-medium", motivational.color)}
            >
              {motivational.emoji} {motivational.message}
            </motion.p>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !hasData ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                <Target className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm font-medium">Primeira vez neste exercício!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete para começar a rastrear sua evolução 📈
              </p>
            </motion.div>
          ) : (
            <>
              {/* Estatísticas principais */}
              <div className="grid grid-cols-2 gap-3">
                {/* Recorde */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30">
                    <CardContent className="p-3 text-center">
                      <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                      <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                        {evolution?.max_weight_kg ? `${evolution.max_weight_kg}kg` : '-'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">🏆 Recorde</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Último peso */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                    <CardContent className="p-3 text-center">
                      <Dumbbell className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                        {evolution?.weight_kg ? `${evolution.weight_kg}kg` : '-'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">💪 Último peso</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Tendência e última vez */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {getTrendIcon(evolution?.progression_trend || null)}
                  <span className="text-sm font-medium">
                    {getTrendLabel(evolution?.progression_trend || null)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(evolution?.last_workout_date || null)}
                </div>
              </motion.div>

              {/* Conquistas */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-2"
              >
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Medal className="w-3.5 h-3.5" />
                  Conquistas ({unlockedCount}/{achievements.length})
                </p>
                <div className="flex gap-2 justify-center">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                        achievement.unlocked 
                          ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md" 
                          : "bg-muted/50 text-muted-foreground/30"
                      )}
                      title={achievement.label}
                    >
                      {achievement.icon}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Mini gráfico de histórico */}
              {history.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <p className="text-xs font-medium text-muted-foreground">📊 Histórico de pesos</p>
                  <div className="flex items-end gap-1 h-16 px-2">
                    {history.slice(0, 8).reverse().map((entry, index) => {
                      const maxWeight = Math.max(...history.map(h => h.weight_kg));
                      const minWeight = Math.min(...history.map(h => h.weight_kg));
                      const range = maxWeight - minWeight || 1;
                      const heightPercent = ((entry.weight_kg - minWeight) / range) * 70 + 30;
                      const isLast = index === history.slice(0, 8).length - 1;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                          className={cn(
                            "flex-1 rounded-t transition-all",
                            isLast 
                              ? "bg-gradient-to-t from-emerald-600 to-teal-400" 
                              : "bg-gradient-to-t from-emerald-500/60 to-teal-400/60"
                          )}
                          title={`${entry.weight_kg}kg`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground px-2">
                    <span>Mais antigo</span>
                    <span>Mais recente</span>
                  </div>
                </motion.div>
              )}

              {/* Total de séries */}
              {evolution?.total_sets && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <Badge variant="outline" className="w-full justify-center py-2 text-sm">
                    💪 Total: <span className="font-bold mx-1">{evolution.total_sets}</span> séries completadas
                  </Badge>
                </motion.div>
              )}
            </>
          )}

          {/* Botão para fechar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              onClick={onClose} 
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-semibold"
            >
              Entendi! Bora treinar 💪
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
