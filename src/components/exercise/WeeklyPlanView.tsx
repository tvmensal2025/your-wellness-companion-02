import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Dumbbell, 
  Play, 
  ChevronRight, 
  Flame, 
  Trophy,
  Clock,
  Zap,
  Moon,
  Check,
  Camera
} from 'lucide-react';
import { WeeklyPlan, Exercise } from '@/hooks/useExercisesLibrary';
import { cn } from '@/lib/utils';
import { formatDifficulty } from '@/lib/exercise-format';
import { getCameraInfo } from '@/lib/exercise-camera-mapping';
import { CameraWorkoutModal } from './CameraWorkoutModal';
import type { ExerciseType } from '@/types/camera-workout';

interface WeeklyPlanViewProps {
  weeklyPlan: WeeklyPlan[];
  todayWorkout: WeeklyPlan | null;
  onStartWorkout: (day: WeeklyPlan) => void;
  onExerciseClick: (exercise: Exercise) => void;
}

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({
  weeklyPlan,
  todayWorkout,
  onStartWorkout,
  onExerciseClick
}) => {
  const [selectedDay, setSelectedDay] = useState<WeeklyPlan | null>(todayWorkout);

  return (
    <div className="space-y-6">
      {/* Seletor de Dias da Semana */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 sm:gap-3 pb-2">
          {weeklyPlan.map((day) => (
            <motion.button
              key={day.dayNumber}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 min-w-[80px] sm:min-w-[90px]",
                day.isToday && "ring-2 ring-emerald-500 ring-offset-2",
                selectedDay?.dayNumber === day.dayNumber
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white shadow-lg"
                  : day.isRestDay
                    ? "bg-muted/50 border-border/50 text-muted-foreground"
                    : "bg-card border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              )}
            >
              <div className="text-center">
                <p className={cn(
                  "text-xs sm:text-sm font-semibold uppercase tracking-wide",
                  selectedDay?.dayNumber === day.dayNumber ? "text-white/90" : "text-muted-foreground"
                )}>
                  {day.shortName}
                </p>
                <div className="flex items-center justify-center mt-1.5 sm:mt-2">
                  {day.isRestDay ? (
                    <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : day.isToday ? (
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                  ) : (
                    <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>
                {day.isToday && (
                  <Badge className="mt-1.5 text-[9px] sm:text-[10px] px-2 py-0.5 bg-white/20 text-white border-0">
                    HOJE
                  </Badge>
                )}
              </div>
            </motion.button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Conteúdo do Dia Selecionado */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            key={selectedDay.dayNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedDay.isRestDay ? (
              <RestDayCard day={selectedDay} />
            ) : (
              <WorkoutDayCard 
                day={selectedDay}
                onStartWorkout={onStartWorkout}
                onExerciseClick={onExerciseClick}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Card para dia de descanso
const RestDayCard: React.FC<{ day: WeeklyPlan }> = ({ day }) => (
  <Card className="border-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10">
    <CardContent className="p-6 sm:p-8 md:p-10 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
      >
        <Moon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
      </motion.div>
      <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">{day.title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
        Seu corpo precisa de descanso para se recuperar e ficar mais forte. 
        Aproveite para alongar, hidratar e dormir bem! 💤
      </p>
      <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 flex-wrap">
        <Badge variant="secondary" className="text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5">
          🧘 Alongamentos leves
        </Badge>
        <Badge variant="secondary" className="text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5">
          💧 Hidratação
        </Badge>
      </div>
    </CardContent>
  </Card>
);

// Card para dia de treino
const WorkoutDayCard: React.FC<{
  day: WeeklyPlan;
  onStartWorkout: (day: WeeklyPlan) => void;
  onExerciseClick: (exercise: Exercise) => void;
}> = ({ day, onStartWorkout, onExerciseClick }) => {
  // Estado para o modal de câmera
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
        sets: parseInt(exercise.sets || '3', 10)
      });
      setCameraModalOpen(true);
    }
  };

  return (
  <div className="space-y-4 sm:space-y-5">
    {/* Header do Treino */}
    <Card className="border-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <CardContent className="p-5 sm:p-6 md:p-8 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
            <Badge className="bg-white/20 border-0 text-white text-xs sm:text-sm px-3 py-1">
              {day.dayName}
            </Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{day.title}</h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {day.muscleGroups.slice(0, 3).map((group) => (
                <Badge key={group} variant="outline" className="bg-white/10 border-white/30 text-white text-[10px] sm:text-xs capitalize px-2 sm:px-3 py-0.5">
                  {group}
                </Badge>
              ))}
              {day.muscleGroups.length > 3 && (
                <Badge variant="outline" className="bg-white/10 border-white/30 text-white text-[10px] sm:text-xs">
                  +{day.muscleGroups.length - 3}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right space-y-1.5 sm:space-y-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-sm sm:text-base">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">{day.exercises.length} ex</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-sm sm:text-base">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>~{Math.round(day.exercises.length * 4)} min</span>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => onStartWorkout(day)}
          className="w-full mt-4 sm:mt-5 h-12 sm:h-14 bg-white text-emerald-600 hover:bg-white/90 font-bold text-base sm:text-lg"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="currentColor" />
          Começar Treino
        </Button>
      </CardContent>
    </Card>

    {/* Lista de Exercícios */}
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
        Exercícios do Dia
      </h3>

      {day.exercises.map((exercise, index) => {
        const cameraInfo = getCameraInfo(exercise.name);
        
        return (
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className="group cursor-pointer border hover:border-emerald-300 hover:shadow-md transition-all duration-300"
            onClick={() => onExerciseClick(exercise)}
          >
            <CardContent className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4">
              {/* Número */}
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow">
                {index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm sm:text-base md:text-lg text-foreground group-hover:text-emerald-600 transition-colors truncate">
                  {exercise.name}
                </h4>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5">
                  <span className="capitalize">{exercise.muscle_group}</span>
                  <span>•</span>
                  <span>{exercise.sets || '3'}x{exercise.reps || '12'}</span>
                  {exercise.rest_time && (
                    <>
                      <span>•</span>
                      <span>{exercise.rest_time} desc.</span>
                    </>
                  )}
                </div>
              </div>

              {/* Botão de Câmera */}
              {cameraInfo.supported && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:hover:bg-cyan-900/50 text-cyan-600 hover:text-cyan-700 rounded-full"
                  onClick={(e) => handleCameraClick(exercise, e)}
                  title={`Treinar ${cameraInfo.label} com câmera`}
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              )}

              {/* Badge dificuldade */}
              {(() => {
                const diff = formatDifficulty(exercise.difficulty);
                return (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] sm:text-xs capitalize flex-shrink-0 px-2 sm:px-3 py-0.5 sm:py-1",
                      diff.tone === 'easy' && "border-green-300 text-green-600 bg-green-50 dark:bg-green-950/30",
                      diff.tone === 'medium' && "border-yellow-300 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
                      diff.tone === 'hard' && "border-red-300 text-red-600 bg-red-50 dark:bg-red-950/30"
                    )}
                  >
                    {diff.label || exercise.difficulty}
                  </Badge>
                );
              })()}

              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-emerald-500 transition-colors flex-shrink-0" />
            </CardContent>
          </Card>
        </motion.div>
        );
      })}
    </div>
    
    {/* Modal de Câmera */}
    {selectedCameraExercise && (
      <CameraWorkoutModal
        open={cameraModalOpen}
        onOpenChange={setCameraModalOpen}
        exerciseName={selectedCameraExercise.name}
        exerciseType={selectedCameraExercise.type}
        targetReps={selectedCameraExercise.reps}
        targetSets={selectedCameraExercise.sets}
      />
    )}
  </div>
  );
};
