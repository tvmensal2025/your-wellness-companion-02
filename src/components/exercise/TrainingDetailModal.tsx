import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Clock,
  Dumbbell,
  Repeat,
  Timer,
  Target,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  rest?: string;
  weight?: string;
  notes?: string;
}

interface TrainingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: any;
  onStartWorkout: () => void;
  isCompleted?: boolean;
}

export const TrainingDetailModal: React.FC<TrainingDetailModalProps> = ({
  isOpen,
  onClose,
  workout,
  onStartWorkout,
  isCompleted = false
}) => {
  if (!workout) return null;

  // Extrair exercícios do workout
  const exercises: Exercise[] = workout.exercises || [];
  const tips = workout.tips || [];
  const warmup = workout.warmup || 'Aquecimento de 5-10 minutos';
  const cooldown = workout.cooldown || 'Alongamento de 5 minutos';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">
                {workout.name || 'Treino'}
              </DialogTitle>
              <DialogDescription className="text-base">
                {workout.description || workout.structure}
              </DialogDescription>
            </div>
            {isCompleted && (
              <Badge className="bg-green-500 ml-2">Concluído</Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Info Geral */}
            <div className="grid grid-cols-2 gap-4">
              {workout.duration_minutes && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold">{workout.duration_minutes} minutos</span>
                </div>
              )}
              {workout.intensity && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold">Intensidade: {workout.intensity}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Aquecimento */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-600" />
                Aquecimento
              </h3>
              <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                {warmup}
              </p>
            </div>

            {/* Exercícios */}
            {exercises.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-orange-600" />
                  Exercícios ({exercises.length})
                </h3>
                
                <div className="space-y-3">
                  {exercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 space-y-2 bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{exercise.name}</h4>
                            {exercise.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {exercise.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        {exercise.sets && (
                          <div className="bg-background rounded p-2 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Séries</div>
                            <div className="font-bold text-orange-600">{exercise.sets}</div>
                          </div>
                        )}
                        {exercise.reps && (
                          <div className="bg-background rounded p-2 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Repetições</div>
                            <div className="font-bold text-orange-600">{exercise.reps}</div>
                          </div>
                        )}
                        {exercise.rest && (
                          <div className="bg-background rounded p-2 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Descanso</div>
                            <div className="font-bold text-orange-600">{exercise.rest}</div>
                          </div>
                        )}
                        {exercise.weight && (
                          <div className="bg-background rounded p-2 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Carga</div>
                            <div className="font-bold text-orange-600">{exercise.weight}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estrutura alternativa se não tiver exercícios */}
            {exercises.length === 0 && workout.structure && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-orange-600" />
                  Estrutura do Treino
                </h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-line">{workout.structure}</p>
                </div>
              </div>
            )}

            {/* Finalização */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Repeat className="w-5 h-5 text-green-600" />
                Finalização
              </h3>
              <p className="text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                {cooldown}
              </p>
            </div>

            {/* Dicas */}
            {tips.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Dicas Importantes
                </h3>
                <div className="space-y-2">
                  {tips.map((tip: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dicas padrão se não houver específicas */}
            {tips.length === 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Dicas Gerais
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Mantenha uma boa postura durante todos os exercícios</p>
                  </div>
                  <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Hidrate-se bem antes, durante e após o treino</p>
                  </div>
                  <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Respeite os intervalos de descanso entre as séries</p>
                  </div>
                  <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Se sentir dor ou desconforto, pare imediatamente</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Fechar
          </Button>
          {!isCompleted && (
            <Button
              onClick={() => {
                onStartWorkout();
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Treino
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
