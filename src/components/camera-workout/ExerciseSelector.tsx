/**
 * Exercise Selector Component
 * 
 * Allows users to select which exercise they want to perform with the camera.
 */

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Activity, 
  ArrowDown, 
  Timer, 
  Info,
  CheckCircle2,
} from 'lucide-react';
import { getAllExercises, type ExerciseConfig } from '@/data/camera-workout/exerciseConfigs';
import { cn } from '@/lib/utils';

interface ExerciseSelectorProps {
  onSelectExercise: (exerciseId: string) => void;
  selectedExerciseId?: string;
}

export function ExerciseSelector({ onSelectExercise, selectedExerciseId }: ExerciseSelectorProps) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const exercises = getAllExercises();

  const handleSelectExercise = (exercise: ExerciseConfig) => {
    setSelectedExercise(exercise);
    setShowInstructions(true);
  };

  const handleStartExercise = () => {
    if (selectedExercise) {
      onSelectExercise(selectedExercise.id);
      setShowInstructions(false);
    }
  };

  const getExerciseIcon = (exerciseId: string) => {
    switch (exerciseId) {
      case 'squat':
        return '🏋️';
      case 'pushup':
        return '💪';
      case 'situp':
        return '🤸';
      case 'plank':
        return '⏱️';
      default:
        return '🎯';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Escolha seu Exercício</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {exercises.map(exercise => {
            const isSelected = selectedExerciseId === exercise.id;
            
            return (
              <Card
                key={exercise.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg',
                  'bg-card border-border',
                  isSelected && 'ring-2 ring-primary'
                )}
                onClick={() => handleSelectExercise(exercise)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getExerciseIcon(exercise.id)}</span>
                      <div>
                        <CardTitle className="text-lg text-foreground">
                          {exercise.displayName}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {exercise.description}
                        </CardDescription>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground">
                      {exercise.repType === 'count' ? (
                        <>
                          <ArrowDown className="h-3 w-3 mr-1" />
                          Contagem de Reps
                        </>
                      ) : (
                        <>
                          <Timer className="h-3 w-3 mr-1" />
                          Tempo de Sustentação
                        </>
                      )}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExercise(exercise);
                        setShowInstructions(true);
                      }}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Ver Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <span className="text-3xl">{selectedExercise && getExerciseIcon(selectedExercise.id)}</span>
              {selectedExercise?.displayName}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedExercise?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedExercise && (
            <div className="space-y-6">
              {/* Calibration Instructions */}
              <div>
                <h3 className="font-semibold mb-3 text-foreground">📸 Posicionamento da Câmera</h3>
                <ul className="space-y-2">
                  {selectedExercise.calibrationInstructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary font-bold">{index + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exercise Instructions */}
              <div>
                <h3 className="font-semibold mb-3 text-foreground">💪 Como Executar</h3>
                <ul className="space-y-2">
                  {selectedExercise.exerciseInstructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary font-bold">{index + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form Rules */}
              <div>
                <h3 className="font-semibold mb-3 text-foreground">✅ Pontos de Atenção</h3>
                <ul className="space-y-2">
                  {selectedExercise.formRules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary">•</span>
                      <span>{rule.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Start Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleStartExercise}
                  className="flex-1"
                  size="lg"
                >
                  Começar Treino
                </Button>
                <Button
                  onClick={() => setShowInstructions(false)}
                  variant="outline"
                  size="lg"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
