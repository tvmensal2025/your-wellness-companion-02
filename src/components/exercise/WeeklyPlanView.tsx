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
  Check
} from 'lucide-react';
import { WeeklyPlan, Exercise } from '@/hooks/useExercisesLibrary';
import { cn } from '@/lib/utils';
import { formatDifficulty } from '@/lib/exercise-format';

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
        <div className="flex gap-2 pb-2">
          {weeklyPlan.map((day) => (
            <motion.button
              key={day.dayNumber}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[80px]",
                day.isToday && "ring-2 ring-orange-500 ring-offset-2",
                selectedDay?.dayNumber === day.dayNumber
                  ? "bg-gradient-to-br from-orange-500 to-red-600 border-transparent text-white shadow-lg"
                  : day.isRestDay
                    ? "bg-muted/50 border-border/50 text-muted-foreground"
                    : "bg-card border-border hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20"
              )}
            >
              <div className="text-center">
                <p className={cn(
                  "text-xs font-medium uppercase tracking-wide",
                  selectedDay?.dayNumber === day.dayNumber ? "text-white/80" : "text-muted-foreground"
                )}>
                  {day.shortName}
                </p>
                <div className="flex items-center justify-center mt-1">
                  {day.isRestDay ? (
                    <Moon className="w-4 h-4" />
                  ) : day.isToday ? (
                    <Flame className="w-4 h-4 text-orange-300" />
                  ) : (
                    <Dumbbell className="w-4 h-4" />
                  )}
                </div>
                {day.isToday && (
                  <Badge className="mt-1 text-[8px] px-1.5 py-0 bg-white/20 text-white border-0">
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
    <CardContent className="p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
      >
        <Moon className="w-10 h-10 text-white" />
      </motion.div>
      <h3 className="text-2xl font-bold mb-2">{day.title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Seu corpo precisa de descanso para se recuperar e ficar mais forte. 
        Aproveite para alongar, hidratar e dormir bem! 💤
      </p>
      <div className="flex justify-center gap-3 mt-6">
        <Badge variant="secondary" className="text-sm px-4 py-2">
          🧘 Alongamentos leves
        </Badge>
        <Badge variant="secondary" className="text-sm px-4 py-2">
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
}> = ({ day, onStartWorkout, onExerciseClick }) => (
  <div className="space-y-4">
    {/* Header do Treino */}
    <Card className="border-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Badge className="bg-white/20 border-0 text-white text-xs">
              {day.dayName}
            </Badge>
            <h2 className="text-xl md:text-2xl font-bold">{day.title}</h2>
            <div className="flex flex-wrap gap-2">
              {day.muscleGroups.slice(0, 3).map((group) => (
                <Badge key={group} variant="outline" className="bg-white/10 border-white/30 text-white text-xs capitalize">
                  {group}
                </Badge>
              ))}
              {day.muscleGroups.length > 3 && (
                <Badge variant="outline" className="bg-white/10 border-white/30 text-white text-xs">
                  +{day.muscleGroups.length - 3}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <Dumbbell className="w-4 h-4" />
              <span>{day.exercises.length} exercícios</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <Clock className="w-4 h-4" />
              <span>~{Math.round(day.exercises.length * 4)} min</span>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => onStartWorkout(day)}
          className="w-full mt-4 bg-white text-orange-600 hover:bg-white/90 font-bold"
        >
          <Play className="w-5 h-5 mr-2" fill="currentColor" />
          Começar Treino
        </Button>
      </CardContent>
    </Card>

    {/* Lista de Exercícios */}
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <Zap className="w-4 h-4 text-orange-500" />
        Exercícios do Dia
      </h3>

      {day.exercises.map((exercise, index) => (
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className="group cursor-pointer border hover:border-orange-300 hover:shadow-md transition-all duration-300"
            onClick={() => onExerciseClick(exercise)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              {/* Número */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow">
                {index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground group-hover:text-orange-600 transition-colors truncate">
                  {exercise.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
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

              {/* Badge dificuldade */}
              {(() => {
                const diff = formatDifficulty(exercise.difficulty);
                return (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] capitalize flex-shrink-0",
                      diff.tone === 'easy' && "border-green-300 text-green-600 bg-green-50 dark:bg-green-950/30",
                      diff.tone === 'medium' && "border-yellow-300 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
                      diff.tone === 'hard' && "border-red-300 text-red-600 bg-red-50 dark:bg-red-950/30"
                    )}
                  >
                    {diff.label || exercise.difficulty}
                  </Badge>
                );
              })()}

              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-500 transition-colors flex-shrink-0" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);
