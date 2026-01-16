// ============================================
// 🏋️ PROGRAM EXERCISE LIST
// Lista de exercícios do dia
// ============================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Camera, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDifficulty } from '@/lib/exercise-format';
import { getCameraInfo } from '@/lib/exercise-camera-mapping';
import { CameraWorkoutModal } from '../CameraWorkoutModal';
import type { Exercise } from '@/hooks/useExercisesLibrary';
import type { ExerciseType } from '@/types/camera-workout';

interface ProgramExerciseListProps {
  exercises: Exercise[];
  isLoading: boolean;
  activitiesCount: number;
  onExerciseClick?: (exercise: Exercise) => void;
}

export const ProgramExerciseList: React.FC<ProgramExerciseListProps> = ({
  exercises,
  isLoading,
  activitiesCount,
  onExerciseClick,
}) => {
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [selectedCameraExercise, setSelectedCameraExercise] = useState<{
    name: string;
    type: ExerciseType;
    reps: number;
    sets: number;
  } | null>(null);

  const handleCameraClick = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    const cameraInfo = getCameraInfo(exercise.name);
    if (cameraInfo.supported && cameraInfo.type) {
      const reps = parseInt(exercise.reps?.split('-')[0] || '12', 10);
      setSelectedCameraExercise({
        name: exercise.name,
        type: cameraInfo.type,
        reps,
        sets: typeof exercise.sets === 'number' ? exercise.sets : parseInt(String(exercise.sets) || '3', 10)
      });
      setCameraModalOpen(true);
    }
  };

  const handleCameraComplete = (reps: number, formScore: number) => {
    console.log(`Exercício completado: ${reps} reps, ${formScore}% forma`);
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <h3 className="text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
        Exercícios do Dia
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: Math.min(6, Math.max(3, activitiesCount)) }).map((_, i) => (
            <Card key={i} className="border">
              <CardContent className="p-4">
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded mt-2 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">Exercícios não vinculados</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Não consegui relacionar este treino salvo com a biblioteca de exercícios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        exercises.map((exercise, index) => {
          const diff = formatDifficulty(exercise.difficulty);
          const cameraInfo = getCameraInfo(exercise.name);
          
          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="group cursor-pointer border hover:border-emerald-300 hover:shadow-md transition-all duration-200"
                onClick={() => onExerciseClick?.(exercise)}
              >
                <CardContent className="p-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-[11px] sm:text-xs shadow-sm">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h4 className="font-medium text-sm sm:text-base text-foreground group-hover:text-emerald-600 transition-colors truncate">
                      {exercise.name}
                    </h4>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                      <span className="capitalize truncate max-w-[80px] sm:max-w-[120px]">{exercise.muscle_group}</span>
                      <span>•</span>
                      <span className="font-medium">{exercise.sets || '3'}x{exercise.reps || '12'}</span>
                    </div>
                  </div>

                  {cameraInfo.supported && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:hover:bg-cyan-900/50 text-cyan-600 hover:text-cyan-700 rounded-full"
                      onClick={(e) => handleCameraClick(exercise, e)}
                      title={`Treinar ${cameraInfo.label} com câmera`}
                    >
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  )}

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] sm:text-[10px] capitalize flex-shrink-0 px-1.5 sm:px-2 py-0.5",
                      diff.tone === 'easy' && "border-green-300 text-green-600 bg-green-50 dark:bg-green-950/30",
                      diff.tone === 'medium' && "border-yellow-300 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
                      diff.tone === 'hard' && "border-red-300 text-red-600 bg-red-50 dark:bg-red-950/30"
                    )}
                  >
                    {diff.label || exercise.difficulty}
                  </Badge>

                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}

      {selectedCameraExercise && (
        <CameraWorkoutModal
          open={cameraModalOpen}
          onOpenChange={setCameraModalOpen}
          exerciseName={selectedCameraExercise.name}
          exerciseType={selectedCameraExercise.type}
          targetReps={selectedCameraExercise.reps}
          targetSets={selectedCameraExercise.sets}
          onComplete={handleCameraComplete}
        />
      )}
    </div>
  );
};
