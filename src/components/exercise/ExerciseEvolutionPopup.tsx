import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Trophy, Calendar, Dumbbell, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-sm p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Sua Evolução
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome do exercício */}
          <div className="text-center pb-2 border-b">
            <h3 className="font-semibold text-lg">{exerciseName}</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !hasData ? (
            <div className="text-center py-6 text-muted-foreground">
              <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Ainda não há dados de evolução.</p>
              <p className="text-xs mt-1">Complete este exercício para começar a rastrear!</p>
            </div>
          ) : (
            <>
              {/* Estatísticas principais */}
              <div className="grid grid-cols-2 gap-3">
                {/* Recorde */}
                <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
                  <CardContent className="p-3 text-center">
                    <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                    <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                      {evolution?.max_weight_kg ? `${evolution.max_weight_kg}kg` : '-'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Recorde</p>
                  </CardContent>
                </Card>

                {/* Último peso */}
                <Card>
                  <CardContent className="p-3 text-center">
                    <Dumbbell className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <p className="text-lg font-bold">
                      {evolution?.weight_kg ? `${evolution.weight_kg}kg` : '-'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Último peso</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tendência e última vez */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
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
              </div>

              {/* Mini gráfico de histórico */}
              {history.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Histórico de pesos</p>
                  <div className="flex items-end gap-1 h-16">
                    {history.slice(0, 8).reverse().map((entry, index) => {
                      const maxWeight = Math.max(...history.map(h => h.weight_kg));
                      const minWeight = Math.min(...history.map(h => h.weight_kg));
                      const range = maxWeight - minWeight || 1;
                      const heightPercent = ((entry.weight_kg - minWeight) / range) * 70 + 30;
                      
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all"
                          style={{ height: `${heightPercent}%` }}
                          title={`${entry.weight_kg}kg`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>Mais antigo</span>
                    <span>Mais recente</span>
                  </div>
                </div>
              )}

              {/* Total de séries */}
              {evolution?.total_sets && (
                <Badge variant="outline" className="w-full justify-center py-2">
                  💪 Total: {evolution.total_sets} séries completadas
                </Badge>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
