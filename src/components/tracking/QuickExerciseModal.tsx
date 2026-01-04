import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Activity, Bike, Dumbbell, PersonStanding, Waves, Footprints, Heart } from 'lucide-react';
import { useTrackingData } from '@/hooks/useTrackingData';
import { useToast } from '@/hooks/use-toast';

interface QuickExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXERCISE_TYPES = [
  { id: 'caminhada', label: 'Caminhada', icon: Footprints, color: 'from-green-500 to-emerald-600', calories: 4 },
  { id: 'corrida', label: 'Corrida', icon: PersonStanding, color: 'from-orange-500 to-red-600', calories: 10 },
  { id: 'musculacao', label: 'Musculação', icon: Dumbbell, color: 'from-purple-500 to-violet-600', calories: 6 },
  { id: 'ciclismo', label: 'Ciclismo', icon: Bike, color: 'from-blue-500 to-cyan-600', calories: 8 },
  { id: 'natacao', label: 'Natação', icon: Waves, color: 'from-cyan-500 to-teal-600', calories: 9 },
  { id: 'outro', label: 'Outro', icon: Activity, color: 'from-gray-500 to-slate-600', calories: 5 },
];

export const QuickExerciseModal: React.FC<QuickExerciseModalProps> = ({ open, onOpenChange }) => {
  const [selectedType, setSelectedType] = useState('caminhada');
  const [duration, setDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addExerciseData, trackingData } = useTrackingData();
  const { toast } = useToast();

  const selectedExercise = EXERCISE_TYPES.find(e => e.id === selectedType)!;
  const estimatedCalories = Math.round(duration * selectedExercise.calories);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addExerciseData(duration, selectedType);
      toast({
        title: "🏃 Exercício registrado!",
        description: `${duration} min de ${selectedExercise.label.toLowerCase()} (~${estimatedCalories} kcal)`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayMinutes = trackingData?.exercise?.todayMinutes || 0;
  const weeklyGoal = trackingData?.exercise?.weeklyGoal || 150;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl bg-gradient-to-b from-background to-orange-950/10 border-border/50">
        <DialogHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-2"
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${selectedExercise.color} flex items-center justify-center shadow-lg transition-all duration-300`}>
              <selectedExercise.icon className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <DialogTitle className="text-xl font-bold">Registrar Exercício</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Hoje: {todayMinutes} min • Meta semanal: {weeklyGoal} min
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Exercise type selector */}
          <div className="space-y-3">
            <span className="text-sm font-medium">Tipo de exercício</span>
            <div className="grid grid-cols-3 gap-2">
              {EXERCISE_TYPES.map((exercise) => (
                <motion.button
                  key={exercise.id}
                  onClick={() => setSelectedType(exercise.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    selectedType === exercise.id 
                      ? `bg-gradient-to-br ${exercise.color} text-white shadow-lg` 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <exercise.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{exercise.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Duration slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Duração</span>
              <motion.span 
                key={duration}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-orange-500"
              >
                {duration} min
              </motion.span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([v]) => setDuration(v)}
              min={5}
              max={120}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Estimated calories */}
          <motion.div 
            key={estimatedCalories}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="bg-muted/50 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">Calorias estimadas</span>
            </div>
            <span className="text-lg font-bold text-orange-500">~{estimatedCalories} kcal</span>
          </motion.div>

          {/* Quick presets */}
          <div className="flex gap-2">
            {[15, 30, 45, 60].map((mins) => (
              <Button
                key={mins}
                variant={duration === mins ? "default" : "outline"}
                size="sm"
                onClick={() => setDuration(mins)}
                className="flex-1"
              >
                {mins}min
              </Button>
            ))}
          </div>

          {/* Submit button */}
          <Button
            className={`w-full h-12 bg-gradient-to-r ${selectedExercise.color} hover:opacity-90 text-white font-medium`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Salvando...'
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Registrar Exercício
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickExerciseModal;
