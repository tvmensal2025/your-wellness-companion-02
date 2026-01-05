import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Minus, 
  Check, 
  TrendingUp, 
  Dumbbell,
  Target,
  Sparkles
} from 'lucide-react';
import { useExerciseProgress } from '@/hooks/useExerciseProgress';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  exerciseId?: string;
  exerciseName: string;
  userId: string | undefined;
  defaultSets?: number;
  defaultReps?: string;
  onComplete?: () => void;
}

interface SetLog {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  exerciseId,
  exerciseName,
  userId,
  defaultSets = 3,
  defaultReps = '12',
  onComplete
}) => {
  const { logProgress, getLastWeight, getSuggestedWeight } = useExerciseProgress(userId);
  const [sets, setSets] = useState<SetLog[]>([]);
  const [currentSet, setCurrentSet] = useState(1);
  const [lastWeight, setLastWeight] = useState<number | null>(null);
  const [suggestedWeight, setSuggestedWeight] = useState<number | null>(null);
  const [perceivedDifficulty, setPerceivedDifficulty] = useState(5);
  const [saving, setSaving] = useState(false);

  // Parsear reps padrão
  const parseDefaultReps = (): number => {
    const match = defaultReps.match(/\d+/);
    return match ? parseInt(match[0]) : 12;
  };

  // Inicializar sets
  useEffect(() => {
    const numSets = typeof defaultSets === 'string' ? parseInt(defaultSets) : defaultSets;
    const reps = parseDefaultReps();
    
    setSets(
      Array.from({ length: numSets || 3 }, (_, i) => ({
        setNumber: i + 1,
        reps,
        weight: 0,
        completed: false
      }))
    );
  }, [defaultSets, defaultReps]);

  // Buscar última carga e sugestão
  useEffect(() => {
    const fetchWeights = async () => {
      const last = await getLastWeight(exerciseName);
      const suggested = await getSuggestedWeight(exerciseName);
      setLastWeight(last);
      setSuggestedWeight(suggested);
      
      // Auto-preencher com última carga
      if (last) {
        setSets(prev => prev.map(s => ({ ...s, weight: last })));
      }
    };
    
    if (userId) {
      fetchWeights();
    }
  }, [userId, exerciseName, getLastWeight, getSuggestedWeight]);

  const updateSet = (setNumber: number, field: 'reps' | 'weight', value: number) => {
    setSets(prev => prev.map(s => 
      s.setNumber === setNumber ? { ...s, [field]: value } : s
    ));
  };

  const adjustWeight = (setNumber: number, delta: number) => {
    setSets(prev => prev.map(s => 
      s.setNumber === setNumber 
        ? { ...s, weight: Math.max(0, s.weight + delta) } 
        : s
    ));
  };

  const completeSet = async (setNumber: number) => {
    if (!userId) return;

    const set = sets.find(s => s.setNumber === setNumber);
    if (!set) return;

    setSaving(true);
    try {
      await logProgress({
        exerciseId,
        exerciseName,
        setNumber,
        repsCompleted: set.reps,
        weightKg: set.weight > 0 ? set.weight : undefined,
        perceivedDifficulty: setNumber === sets.length ? perceivedDifficulty : undefined
      });

      setSets(prev => prev.map(s => 
        s.setNumber === setNumber ? { ...s, completed: true } : s
      ));

      if (setNumber < sets.length) {
        setCurrentSet(setNumber + 1);
      } else {
        // Último set completado
        onComplete?.();
      }
    } finally {
      setSaving(false);
    }
  };

  const completedSets = sets.filter(s => s.completed).length;
  const progress = (completedSets / sets.length) * 100;

  return (
    <Card className="border-2 border-orange-100 dark:border-orange-900/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-orange-500" />
            Registrar Progresso
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {completedSets}/{sets.length} séries
          </Badge>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dicas de carga */}
        {(lastWeight || suggestedWeight) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {lastWeight && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Última: {lastWeight}kg
              </Badge>
            )}
            {suggestedWeight && suggestedWeight > (lastWeight || 0) && (
              <Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                <Sparkles className="w-3 h-3" />
                Sugestão: {suggestedWeight}kg
              </Badge>
            )}
          </div>
        )}

        {/* Sets */}
        <div className="space-y-3">
          {sets.map((set) => (
            <motion.div
              key={set.setNumber}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: set.setNumber * 0.05 }}
              className={cn(
                "p-3 rounded-xl border transition-all",
                set.completed 
                  ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" 
                  : currentSet === set.setNumber
                    ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                    : "bg-muted/30 border-border"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Set Number */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                  set.completed 
                    ? "bg-green-500 text-white" 
                    : currentSet === set.setNumber
                      ? "bg-orange-500 text-white"
                      : "bg-muted text-muted-foreground"
                )}>
                  {set.completed ? <Check className="w-4 h-4" /> : set.setNumber}
                </div>

                {/* Reps Input */}
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground uppercase">Reps</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => updateSet(set.setNumber, 'reps', Math.max(1, set.reps - 1))}
                      disabled={set.completed}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(set.setNumber, 'reps', parseInt(e.target.value) || 0)}
                      className="h-8 w-12 text-center p-0 text-sm font-bold"
                      disabled={set.completed}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => updateSet(set.setNumber, 'reps', set.reps + 1)}
                      disabled={set.completed}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Weight Input */}
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground uppercase">Peso (kg)</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => adjustWeight(set.setNumber, -2.5)}
                      disabled={set.completed}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      step="0.5"
                      value={set.weight}
                      onChange={(e) => updateSet(set.setNumber, 'weight', parseFloat(e.target.value) || 0)}
                      className="h-8 w-14 text-center p-0 text-sm font-bold"
                      disabled={set.completed}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => adjustWeight(set.setNumber, 2.5)}
                      disabled={set.completed}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Complete Button */}
                {!set.completed && currentSet === set.setNumber && (
                  <Button
                    size="sm"
                    onClick={() => completeSet(set.setNumber)}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dificuldade Percebida (último set) */}
        {currentSet === sets.length && !sets[sets.length - 1]?.completed && (
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              Dificuldade percebida
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[perceivedDifficulty]}
                onValueChange={(v) => setPerceivedDifficulty(v[0])}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className={cn(
                "font-bold text-lg w-8 text-center",
                perceivedDifficulty <= 3 && "text-green-500",
                perceivedDifficulty > 3 && perceivedDifficulty <= 6 && "text-yellow-500",
                perceivedDifficulty > 6 && perceivedDifficulty <= 8 && "text-orange-500",
                perceivedDifficulty > 8 && "text-red-500"
              )}>
                {perceivedDifficulty}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {perceivedDifficulty <= 3 && "Muito fácil - pode aumentar carga"}
              {perceivedDifficulty > 3 && perceivedDifficulty <= 6 && "Moderado - boa intensidade"}
              {perceivedDifficulty > 6 && perceivedDifficulty <= 8 && "Difícil - mantendo o desafio"}
              {perceivedDifficulty > 8 && "Máximo - cuidado com lesões"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
