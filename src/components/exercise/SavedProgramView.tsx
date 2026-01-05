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
  Info,
  CheckCircle2,
  Timer,
  Target,
  Repeat,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Exercise } from '@/hooks/useExercisesLibrary';
import { formatDifficulty, normalizeKey, parseActivityTitle } from '@/lib/exercise-format';

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
  onStartWorkout: (weekNumber: number, dayActivities: string[]) => void;
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
  let rest = '60s';
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

// Buscar detalhes do exercício no banco de instruções
const getExerciseDetails = (activityName: string, location: string = 'casa') => {
  const dict = location === 'casa' ? exerciseInstructions.casa : exerciseInstructions.academia;
  
  // Busca exata
  if ((dict as any)[activityName]) {
    return (dict as any)[activityName];
  }
  
  // Busca parcial
  const lowerName = activityName.toLowerCase();
  for (const [key, value] of Object.entries(dict)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
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
  const location = (programData.location || 'casa') as 'casa' | 'academia';
  
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
        const { data, error } = await supabase
          .from('exercises_library')
          .select('*')
          .eq('is_active', true)
          .eq('location', location);

        if (!mounted) return;
        if (error) throw error;
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
    if (!selectedDay || selectedDay.isRestDay) return [] as Exercise[];

    const keyed = libraryExercises.map((ex) => ({ key: normalizeKey(ex.name), ex }));

    return selectedDay.activities
      .map((activity) => {
        const name = parseActivityTitle(activity);
        const key = normalizeKey(name);
        const exact = keyed.find((k) => k.key === key)?.ex;
        if (exact) return exact;
        return keyed.find((k) => k.key.includes(key) || key.includes(k.key))?.ex;
      })
      .filter(Boolean) as Exercise[];
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
    <div className="space-y-6">
      {/* Aviso de Limitação */}
      {limitation && limitation !== 'nenhuma' && (
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  Exercícios Adaptados
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Seu programa foi ajustado para proteger: {limitationLabels[limitation]?.replace(/^[^\s]+\s/, '')}. 
                  Exercícios de impacto ou risco foram substituídos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Seletor de Dias da Semana */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {weekDays.map((day) => (
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
      <div className="flex justify-center gap-3 mt-6 flex-wrap">
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
  day: DayPlan;
  weekNumber: number;
  onStartWorkout: (weekNumber: number, activities: string[]) => void;
  location: 'casa' | 'academia';
  exercises: Exercise[];
  isLibraryLoading: boolean;
  onExerciseClick?: (exercise: Exercise) => void;
}> = ({ day, weekNumber, onStartWorkout, exercises, isLibraryLoading, onExerciseClick }) => {
  const exerciseCount = exercises.length || day.activities.length;

  return (
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
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <Dumbbell className="w-4 h-4" />
                <span>{exerciseCount} exercícios</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                <span>~{exerciseCount * 4} min</span>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => onStartWorkout(weekNumber, day.activities)}
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
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="group cursor-pointer border hover:border-orange-300 hover:shadow-md transition-all duration-300"
                  onClick={() => onExerciseClick?.(exercise)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow">
                      {index + 1}
                    </div>

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

                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-500 transition-colors flex-shrink-0" />
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
    </div>
  );
};
