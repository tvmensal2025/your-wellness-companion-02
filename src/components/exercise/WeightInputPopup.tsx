import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, TrendingUp, History, Repeat } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Lista de exercícios que são de peso corporal (não usam peso externo)
const BODYWEIGHT_EXERCISES = [
  'flexão', 'flexao', 'push-up', 'pushup', 'push up',
  'flexão de braço', 'flexao de braco',
  'flexão diamante', 'flexao diamante',
  'flexão inclinada', 'flexao inclinada',
  'flexão declinada', 'flexao declinada',
  'flexão pike', 'flexao pike',
  'flexão archer', 'flexao archer',
  'barra fixa', 'pull-up', 'pullup', 'pull up',
  'barra', 'chin-up', 'chinup', 'chin up',
  'paralela', 'dip', 'dips', 'mergulho',
  'abdominal', 'crunch', 'sit-up', 'situp', 'sit up',
  'prancha', 'plank',
  'agachamento livre', 'agachamento sem peso',
  'agachamento isométrico', 'agachamento na parede',
  'agachamento búlgaro', 'agachamento bulgaro',
  'afundo', 'lunge', 'afundo livre',
  'burpee', 'burpees',
  'mountain climber', 'escalador',
  'polichinelo', 'jumping jack',
  'elevação de pernas', 'elevacao de pernas', 'leg raise',
  'ponte glútea', 'ponte glutea', 'hip thrust sem peso',
  'superman', 'super-homem',
  'bird dog', 'quadrúpede', 'quadrupede',
  'dead bug',
  'hollow hold', 'hollow body',
  'step up', 'subida no banco',
  'panturrilha livre', 'panturrilha sem peso',
  'remada invertida', 'australian pull-up',
  'pistol squat', 'agachamento pistola',
];

// Função para verificar se é exercício de peso corporal
const isBodyweightExercise = (exerciseName: string): boolean => {
  const normalizedName = exerciseName.toLowerCase().trim();
  return BODYWEIGHT_EXERCISES.some(bw => normalizedName.includes(bw));
};

interface WeightInputPopupProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  onSave: (weight: number | null, isReps?: boolean) => void;
}

export const WeightInputPopup: React.FC<WeightInputPopupProps> = ({
  isOpen,
  onClose,
  exerciseName,
  onSave,
}) => {
  const [value, setValue] = useState('');
  const [lastWeight, setLastWeight] = useState<number | null>(null);
  const [maxWeight, setMaxWeight] = useState<number | null>(null);
  const [lastReps, setLastReps] = useState<number | null>(null);
  const [maxReps, setMaxReps] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Detectar se é exercício de peso corporal
  const isBodyweight = useMemo(() => isBodyweightExercise(exerciseName), [exerciseName]);

  // Buscar último peso/reps usado ao abrir
  useEffect(() => {
    if (!isOpen || !exerciseName) return;

    const fetchLastData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('user_workout_evolution')
          .select('weight_kg, max_weight_kg, max_reps, last_reps')
          .eq('user_id', user.id)
          .eq('exercise_name', exerciseName)
          .maybeSingle();

        if (data) {
          setLastWeight(data.weight_kg);
          setMaxWeight(data.max_weight_kg);
          setLastReps(data.last_reps);
          setMaxReps(data.max_reps);
        }
      } catch (error) {
        console.error('Erro ao buscar dados anteriores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastData();
  }, [isOpen, exerciseName]);

  const handleSave = () => {
    const numValue = parseFloat(value);
    onSave(isNaN(numValue) ? null : numValue, isBodyweight);
    setValue('');
    onClose();
  };

  const handleSkip = () => {
    onSave(null, isBodyweight);
    setValue('');
    onClose();
  };

  const handleQuickAdd = (amount: number) => {
    const current = parseFloat(value) || (isBodyweight ? lastReps : lastWeight) || 0;
    setValue(String(Math.max(0, current + amount)));
  };

  const handleUseLast = () => {
    const lastValue = isBodyweight ? lastReps : lastWeight;
    if (lastValue) {
      setValue(String(lastValue));
    }
  };

  // Configurações baseadas no tipo de exercício
  const config = isBodyweight ? {
    icon: <Repeat className="w-5 h-5 text-blue-500" />,
    title: 'Registrar Repetições (Opcional)',
    question: `Quantas repetições você fez em`,
    unit: 'reps',
    placeholder: lastReps ? `Ex: ${lastReps}` : 'Ex: 15',
    lastLabel: 'Último',
    lastValue: lastReps,
    maxLabel: 'Recorde',
    maxValue: maxReps,
    increments: [1, 2, 5, 10],
  } : {
    icon: <Dumbbell className="w-5 h-5 text-emerald-500" />,
    title: 'Registrar Peso (Opcional)',
    question: `Quanto peso você usou em`,
    unit: 'kg',
    placeholder: lastWeight ? `Ex: ${lastWeight}` : 'Ex: 20',
    lastLabel: 'Último',
    lastValue: lastWeight,
    maxLabel: 'PR',
    maxValue: maxWeight,
    increments: [-5, -2.5, 2.5, 5],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-xs p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {config.icon}
            {config.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {config.question} <strong>{exerciseName}</strong>?
          </p>

          {/* Histórico rápido */}
          {(config.lastValue || config.maxValue) && (
            <div className="flex flex-wrap gap-2">
              {config.lastValue && (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={handleUseLast}
                >
                  <History className="w-3 h-3 mr-1" />
                  {config.lastLabel}: {config.lastValue}{config.unit === 'kg' ? 'kg' : ''}
                </Badge>
              )}
              {config.maxValue && config.maxValue !== config.lastValue && (
                <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300">
                  <TrendingUp className="w-3 h-3 mr-1 text-yellow-600" />
                  {config.maxLabel}: {config.maxValue}{config.unit === 'kg' ? 'kg' : ''}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              inputMode="decimal"
              placeholder={config.placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1"
            />
            <span className="text-muted-foreground font-medium">{config.unit}</span>
          </div>

          {/* Botões de incremento rápido */}
          <div className="flex gap-2 justify-center">
            {config.increments.map((inc) => (
              <Button
                key={inc}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(inc)}
                className="h-8 px-3 text-xs"
              >
                {inc > 0 ? `+${inc}` : inc}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleSkip}
            >
              Pular
            </Button>
            <Button 
              className={`flex-1 ${isBodyweight ? 'bg-blue-500 hover:bg-blue-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              onClick={handleSave}
              disabled={!value}
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
