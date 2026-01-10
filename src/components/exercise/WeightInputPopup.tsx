import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, TrendingUp, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WeightInputPopupProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  onSave: (weight: number | null) => void;
}

export const WeightInputPopup: React.FC<WeightInputPopupProps> = ({
  isOpen,
  onClose,
  exerciseName,
  onSave,
}) => {
  const [weight, setWeight] = useState('');
  const [lastWeight, setLastWeight] = useState<number | null>(null);
  const [maxWeight, setMaxWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Buscar último peso usado ao abrir
  useEffect(() => {
    if (!isOpen || !exerciseName) return;

    const fetchLastWeight = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('user_workout_evolution')
          .select('weight_kg, max_weight_kg')
          .eq('user_id', user.id)
          .eq('exercise_name', exerciseName)
          .maybeSingle();

        if (data) {
          setLastWeight(data.weight_kg);
          setMaxWeight(data.max_weight_kg);
        }
      } catch (error) {
        console.error('Erro ao buscar último peso:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastWeight();
  }, [isOpen, exerciseName]);

  const handleSave = () => {
    const weightValue = parseFloat(weight);
    onSave(isNaN(weightValue) ? null : weightValue);
    setWeight('');
    onClose();
  };

  const handleSkip = () => {
    onSave(null);
    setWeight('');
    onClose();
  };

  const handleQuickAdd = (amount: number) => {
    const current = parseFloat(weight) || lastWeight || 0;
    setWeight(String(Math.max(0, current + amount)));
  };

  const handleUseLastWeight = () => {
    if (lastWeight) {
      setWeight(String(lastWeight));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-xs p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="w-5 h-5 text-emerald-500" />
            Registrar Peso (Opcional)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Quanto peso você usou em <strong>{exerciseName}</strong>?
          </p>

          {/* Histórico rápido */}
          {(lastWeight || maxWeight) && (
            <div className="flex flex-wrap gap-2">
              {lastWeight && (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={handleUseLastWeight}
                >
                  <History className="w-3 h-3 mr-1" />
                  Último: {lastWeight}kg
                </Badge>
              )}
              {maxWeight && maxWeight !== lastWeight && (
                <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300">
                  <TrendingUp className="w-3 h-3 mr-1 text-yellow-600" />
                  PR: {maxWeight}kg
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              inputMode="decimal"
              placeholder={lastWeight ? `Ex: ${lastWeight}` : "Ex: 20"}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1"
            />
            <span className="text-muted-foreground font-medium">kg</span>
          </div>

          {/* Botões de incremento rápido */}
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(-2.5)}
              className="h-8 px-3 text-xs"
            >
              -2.5
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(-5)}
              className="h-8 px-3 text-xs"
            >
              -5
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(2.5)}
              className="h-8 px-3 text-xs"
            >
              +2.5
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(5)}
              className="h-8 px-3 text-xs"
            >
              +5
            </Button>
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
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              onClick={handleSave}
              disabled={!weight}
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
