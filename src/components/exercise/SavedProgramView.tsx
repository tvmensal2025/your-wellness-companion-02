import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Dumbbell, 
  Play, 
  Flame, 
  Clock,
  Zap,
  Moon,
  AlertTriangle,
  ChevronRight,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Exercise } from '@/hooks/useExercisesLibrary';
import { formatDifficulty } from '@/lib/exercise-format';
import { matchExercisesFromActivities } from '@/lib/exercise-matching';
import { getCameraInfo } from '@/lib/exercise-camera-mapping';
import { CameraWorkoutModal } from './CameraWorkoutModal';
import type { ExerciseType } from '@/types/camera-workout';

interface WeekActivity {
  week: number;
  activities: string[];
  days: string;
}

interface SavedProgramData {
  description?: string;
  goal?: string;
  level?: string;
  location?: string;
  limitation?: string;
  weeks?: WeekActivity[];
}

interface SavedProgramProps {
  program: {
    id: string;
    plan_name?: string;
    name?: string;
    current_week: number;
    duration_weeks: number;
    completed_workouts: number;
    total_workouts: number;
    workouts_per_week: number;
    status: string;
    plan_data?: SavedProgramData;
    exercises?: SavedProgramData;
    goal?: string;
    difficulty?: string;
  };
  onStartWorkout: (weekNumber: number, dayActivities: string[], resolvedExercises?: Exercise[]) => void;
  onCompleteWorkout: () => void;
  onExerciseClick?: (exercise: Exercise) => void;
}

interface DayPlan {
  dayNumber: number;
  dayName: string;
  shortName: string;
  title: string;
  activities: string[];
  isToday: boolean;
  isRestDay: boolean;
  muscleGroups: string[];
  estimatedTime: number;
}

const extractMuscleGroups = (activity: string): string[] => {
  const groups: string[] = [];
  const activityLower = activity.toLowerCase();
  
  if (activityLower.includes('perna') || activityLower.includes('agachamento') || activityLower.includes('leg')) groups.push('Pernas');
  if (activityLower.includes('peito') || activityLower.includes('supino') || activityLower.includes('flexão') || activityLower.includes('push')) groups.push('Peito');
  if (activityLower.includes('costa') || activityLower.includes('remada') || activityLower.includes('pull')) groups.push('Costas');
  if (activityLower.includes('ombro') || activityLower.includes('desenvolvimento')) groups.push('Ombros');
  if (activityLower.includes('braço') || activityLower.includes('bíceps') || activityLower.includes('tríceps')) groups.push('Braços');
  if (activityLower.includes('cardio') || activityLower.includes('aeróbico') || activityLower.includes('corrida') || activityLower.includes('caminhada')) groups.push('Cardio');
  if (activityLower.includes('funcional') || activityLower.includes('core') || activityLower.includes('abdominal')) groups.push('Funcional');
  if (activityLower.includes('mobilidade') || activityLower.includes('alongamento') || activityLower.includes('flexibilidade')) groups.push('Mobilidade');
  
  return groups.length > 0 ? groups : ['Funcional'];
};

const parseActivity = (activity: string): { name: string; sets: string; reps: string; rest: string; difficulty: string } => {
  let name = activity;
  let sets = '3';
  let reps = '10';
  const rest = '60s';
  let difficulty = 'Medio';
  
  const setsMatch = activity.match(/(\d+)\s*(?:x|séries|sets)/i);
  const repsMatch = activity.match(/(?:x|séries|sets)\s*(\d+)(?:\s*-\s*(\d+))?/i);
  
  if (setsMatch) sets = setsMatch[1];
  if (repsMatch) reps = repsMatch[2] ? `${repsMatch[1]}-${repsMatch[2]}` : repsMatch[1];
  
  const activityLower = activity.toLowerCase();
  if (activityLower.includes('leve') || activityLower.includes('iniciante') || activityLower.includes('básico')) {
    difficulty = 'Facil';
  } else if (activityLower.includes('intenso') || activityLower.includes('avançado') || activityLower.includes('pesado')) {
    difficulty = 'Dificil';
  }
  
  name = activity
    .replace(/\(.*?\)/g, '')
    .replace(/\d+\s*(?:x|séries|sets)\s*\d+/gi, '')
    .replace(/\d+\s*-\s*\d+\s*(?:reps?|repetições)/gi, '')
    .trim();
  
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  return { name: name || activity, sets, reps, rest, difficulty };
};

// Map de labels de limitações
const limitationLabels: Record<string, string> = {
  joelho: '🦵 Joelho',
  coluna: '🦴 Coluna',
  ombro: '💪 Ombro',
  quadril: '🦿 Quadril',
  nenhuma: '',
};

// Extrair ID do YouTube
const getVideoId = (videoUrl?: string): string | null => {
  if (!videoUrl) return null;
  
  try {
    const match = videoUrl.match(/https?:\/\/[\w./?=&%-]+/i);
    if (!match) return null;
    
    const url = new URL(match[0]);
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v');
    if (url.hostname.includes('youtu.be')) return url.pathname.replace('/', '');
  } catch (e) {
    return null;
  }
  
  return null;
};

export const SavedProgramView: React.FC<SavedProgramProps> = ({
  program,
  onStartWorkout,
  onCompleteWorkout,
  onExerciseClick,
}) => {
  const programData = program.plan_data || program.exercises || {};
  const weeks = programData.weeks || [];
  const currentWeekData = weeks.find((w: WeekActivity) => w.week === program.current_week);
  const limitation = programData.limitation;
  const rawLocation = programData.location || 'casa';
  // Normalizar location: todos os valores agora são 'casa' (sistema apenas para treino em casa)
  const location = 'casa' as const;
  
  const weekDays = useMemo<DayPlan[]>(() => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const shortNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    const today = new Date().getDay();
    
    if (!currentWeekData) {
      return dayNames.map((name, idx) => ({
        dayNumber: idx,
        dayName: name,
        shortName: shortNames[idx],
        title: `${name} - Descanso`,
        activities: [],
        isToday: idx === today,
        isRestDay: true,
        muscleGroups: [],
        estimatedTime: 0
      }));
    }
    
    const workoutsPerWeek = program.workouts_per_week || 3;
    const activities = currentWeekData.activities || [];
    
    const trainingDays = workoutsPerWeek >= 5 
      ? [1, 2, 3, 4, 5]
      : workoutsPerWeek >= 4
        ? [1, 2, 4, 5]
        : workoutsPerWeek >= 3
          ? [1, 3, 5]
          : [1, 4];
    
    const activitiesPerDay = Math.ceil(activities.length / trainingDays.length);
    
    return dayNames.map((name, idx) => {
      const trainingDayIndex = trainingDays.indexOf(idx);
      const isTrainingDay = trainingDayIndex !== -1;
      
      if (!isTrainingDay) {
        return {
          dayNumber: idx,
          dayName: name,
          shortName: shortNames[idx],
          title: `${name} - Descanso`,
          activities: [],
          isToday: idx === today,
          isRestDay: true,
          muscleGroups: [],
          estimatedTime: 0
        };
      }
      
      const startIdx = trainingDayIndex * activitiesPerDay;
      const dayActivities = activities.slice(startIdx, startIdx + activitiesPerDay);
      const muscleGroups = [...new Set(dayActivities.flatMap(extractMuscleGroups))];
      const mainGroup = muscleGroups[0] || 'Funcional';
      const title = `${name} - ${mainGroup}`;
      
      return {
        dayNumber: idx,
        dayName: name,
        shortName: shortNames[idx],
        title,
        activities: dayActivities,
        isToday: idx === today,
        isRestDay: false,
        muscleGroups,
        estimatedTime: dayActivities.length * 4
      };
    });
  }, [currentWeekData, program.workouts_per_week]);
  
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(() => {
    return weekDays.find(d => d.isToday) || weekDays.find(d => !d.isRestDay) || null;
  });

  const [libraryExercises, setLibraryExercises] = useState<Exercise[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLibraryLoading(true);
        
        // Primeiro tenta buscar com location específico
        let { data, error } = await supabase
          .from('exercises_library')
          .select('*')
          .eq('is_active', true)
          .eq('location', location);

        if (!mounted) return;
        if (error) throw error;

        // Se não encontrou exercícios suficientes, buscar TODOS
        if (!data || data.length < 10) {
          const { data: allData, error: allError } = await supabase
            .from('exercises_library')
            .select('*')
            .eq('is_active', true);

          if (!allError && allData && allData.length > (data?.length || 0)) {
            data = allData;
            console.log(`Fallback: carregando ${data.length} exercícios de todos os locais`);
          }
        }

        setLibraryExercises((data || []) as Exercise[]);
      } catch (e) {
        console.error('Erro ao carregar biblioteca de exercícios:', e);
        if (mounted) setLibraryExercises([]);
      } finally {
        if (mounted) setLibraryLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [location]);

  const dayExercises = useMemo(() => {
    if (!selectedDay || selectedDay.isRestDay || libraryExercises.length === 0) {
      return [] as Exercise[];
    }

    // Usar o novo sistema de matching melhorado
    const { exercises } = matchExercisesFromActivities(
      selectedDay.activities,
      libraryExercises,
      { maxPerActivity: 3, preferWithVideo: true }
    );

    return exercises;
  }, [selectedDay, libraryExercises]);

  if (weeks.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-700 dark:text-amber-300">
            Programa sem plano semanal detalhado. 
            Considere criar um novo programa personalizado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 overflow-hidden max-w-full">
      {/* Aviso de Limitação */}
      {limitation && limitation !== 'nenhuma' && (
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm sm:text-base text-amber-800 dark:text-amber-200">
                  Exercícios Adaptados
                </p>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                  Seu programa foi ajustado para proteger: {limitationLabels[limitation] || limitation}. 
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Seletor de Dias da Semana - Mobile optimized */}
      <ScrollArea className="w-full">
        <div className="flex gap-1.5 sm:gap-2 pb-2">
          {weekDays.map((day) => (
            <motion.button
              key={day.dayNumber}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "flex-shrink-0 px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 min-w-[52px] sm:min-w-[80px]",
                day.isToday && "ring-2 ring-emerald-500 ring-offset-1 sm:ring-offset-2",
                selectedDay?.dayNumber === day.dayNumber
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white shadow-lg"
                  : day.isRestDay
                    ? "bg-muted/50 border-border/50 text-muted-foreground"
                    : "bg-card border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              )}
            >
              <div className="text-center">
                <p className={cn(
                  "text-[10px] sm:text-xs font-medium uppercase tracking-wide",
                  selectedDay?.dayNumber === day.dayNumber ? "text-white/80" : "text-muted-foreground"
                )}>
                  {day.shortName}
                </p>
                <div className="flex items-center justify-center mt-0.5 sm:mt-1">
                  {day.isRestDay ? (
                    <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : day.isToday ? (
                    <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                  ) : (
                    <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </div>
                {day.isToday && (
                  <Badge className="mt-0.5 sm:mt-1 text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0 bg-white/20 text-white border-0">
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
                weekNumber={program.current_week}
                onStartWorkout={onStartWorkout}
                location={location}
                exercises={dayExercises}
                isLibraryLoading={libraryLoading}
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
const RestDayCard: React.FC<{ day: DayPlan }> = ({ day }) => (
  <Card className="border-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10">
    <CardContent className="p-5 sm:p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
      >
        <Moon className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
      </motion.div>
      <h3 className="text-lg sm:text-2xl font-bold mb-1.5 sm:mb-2">{day.title}</h3>
      <p className="text-xs sm:text-base text-muted-foreground max-w-md mx-auto">
        Seu corpo precisa de descanso para se recuperar e ficar mais forte. 
        Aproveite para alongar, hidratar e dormir bem! 💤
      </p>
      <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 flex-wrap">
        <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 sm:px-4 py-1 sm:py-2">
          🧘 Alongamentos
        </Badge>
        <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 sm:px-4 py-1 sm:py-2">
          💧 Hidratação
        </Badge>
      </div>
    </CardContent>
  </Card>
);

// Card para dia de treino
const WorkoutDayCard: React.FC<{
  day: DayPlan;
  weekNumber: number;
  onStartWorkout: (weekNumber: number, activities: string[], resolvedExercises?: Exercise[]) => void;
  location: 'casa' | 'academia';
  exercises: Exercise[];
  isLibraryLoading: boolean;
  onExerciseClick?: (exercise: Exercise) => void;
}> = ({ day, weekNumber, onStartWorkout, exercises, isLibraryLoading, onExerciseClick }) => {
  const exerciseCount = exercises.length || day.activities.length;
  
  // Estado para o modal de câmera
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [selectedCameraExercise, setSelectedCameraExercise] = useState<{
    name: string;
    type: ExerciseType;
    reps: number;
    sets: number;
  } | null>(null);

  const handleCameraClick = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation(); // Não abre o modal de detalhes
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
    // Aqui pode salvar no banco, atualizar progresso, etc.
  };

  return (
    <div className="space-y-3 sm:space-y-4 overflow-hidden">
      {/* Header do Treino */}
      <Card className="border-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <CardContent className="p-2.5 sm:p-3 md:p-4 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
              <Badge className="bg-white/20 border-0 text-white text-xs sm:text-sm px-3 py-1">
                {day.dayName}
              </Badge>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{day.title}</h2>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {day.muscleGroups.slice(0, 3).map((group) => (
                  <Badge key={group} variant="outline" className="bg-white/10 border-white/30 text-white text-[10px] sm:text-xs capitalize px-2 sm:px-3 py-0.5">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right space-y-1 sm:space-y-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-sm sm:text-base">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">{exerciseCount} ex</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-sm sm:text-base">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">~{exerciseCount * 4}m</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => onStartWorkout(weekNumber, day.activities, exercises)}
            className="w-full mt-3 sm:mt-4 bg-white text-emerald-600 hover:bg-white/90 font-semibold h-9 sm:h-10 text-sm shadow-md"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" fill="currentColor" />
            Começar Treino
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Exercícios */}
      <div className="space-y-2.5 sm:space-y-3">
        <h3 className="text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
          Exercícios do Dia
        </h3>

        {isLibraryLoading ? (
          <div className="space-y-3">
            {Array.from({ length: Math.min(6, Math.max(3, day.activities.length)) }).map((_, i) => (
              <Card key={i} className="border">
                <CardContent className="p-4">
                  <div className="h-4 w-2/3 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
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

                    {/* Botão de Câmera - só aparece se exercício suporta */}
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

        {!isLibraryLoading && exercises.length === 0 && (
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
        )}
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
          onComplete={handleCameraComplete}
        />
      )}
    </div>
  );
};
