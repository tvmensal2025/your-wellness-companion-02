import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Dumbbell, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Clock,
  Zap,
  Moon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Timer,
  Target,
  Repeat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exerciseInstructions } from '@/data/exercise-instructions';

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
  onCompleteWorkout
}) => {
  const programData = program.plan_data || program.exercises || {};
  const weeks = programData.weeks || [];
  const currentWeekData = weeks.find((w: WeekActivity) => w.week === program.current_week);
  const limitation = programData.limitation;
  const location = programData.location || 'casa';
  
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
  
  const limitationLabels: Record<string, string> = {
    nenhuma: '',
    joelho: '🦵 Proteção Joelhos',
    costas: '🔙 Proteção Coluna',
    ombro: '💪 Proteção Ombros',
    cardiaco: '❤️ Cuidado Cardíaco'
  };

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
  location: string;
}> = ({ day, weekNumber, onStartWorkout, location }) => {
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedExercise(expandedExercise === index ? null : index);
  };

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
                <span>{day.activities.length} exercícios</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                <span>~{day.estimatedTime} min</span>
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

        {day.activities.map((activity, index) => {
          const parsed = parseActivity(activity);
          const exerciseDetails = getExerciseDetails(parsed.name, location);
          const isExpanded = expandedExercise === index;
          const videoId = exerciseDetails ? getVideoId(exerciseDetails.video_url) : null;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border overflow-hidden transition-all duration-300">
                {/* Header do exercício - clicável */}
                <CardContent 
                  className={cn(
                    "p-4 cursor-pointer transition-colors",
                    isExpanded 
                      ? "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center gap-4">
                    {/* Número */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow">
                      {index + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">
                        {parsed.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="capitalize">{day.muscleGroups[0] || 'Funcional'}</span>
                        <span>•</span>
                        <span>{parsed.sets}x{parsed.reps}</span>
                        <span>•</span>
                        <span>{parsed.rest} desc.</span>
                      </div>
                    </div>

                    {/* Badge dificuldade */}
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] capitalize flex-shrink-0",
                        parsed.difficulty === 'Facil' && "border-green-300 text-green-600 bg-green-50 dark:bg-green-950/30",
                        parsed.difficulty === 'Medio' && "border-yellow-300 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
                        parsed.difficulty === 'Dificil' && "border-red-300 text-red-600 bg-red-50 dark:bg-red-950/30"
                      )}
                    >
                      {parsed.difficulty}
                    </Badge>

                    {/* Ícone expandir */}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>

                {/* Conteúdo expandido */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-4 border-t">
                        {/* Vídeo */}
                        <div className="rounded-xl overflow-hidden bg-black/80 mt-4">
                          {videoId ? (
                            <div className="relative w-full pt-[56.25%]">
                              <iframe
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="Vídeo do exercício"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center min-h-[180px] bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950 dark:to-red-950">
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                                <Dumbbell className="w-10 h-10 text-white" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Descrição */}
                        {exerciseDetails?.descricao && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground">
                                {exerciseDetails.descricao}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Info Cards */}
                        <div className="grid grid-cols-3 gap-2">
                          <Card className="bg-white/50 dark:bg-black/20">
                            <CardContent className="p-3 text-center">
                              <Repeat className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                              <div className="text-sm font-semibold">{parsed.sets}</div>
                              <div className="text-[10px] text-muted-foreground">Séries</div>
                            </CardContent>
                          </Card>
                          <Card className="bg-white/50 dark:bg-black/20">
                            <CardContent className="p-3 text-center">
                              <Target className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                              <div className="text-sm font-semibold">{parsed.reps}</div>
                              <div className="text-[10px] text-muted-foreground">Reps</div>
                            </CardContent>
                          </Card>
                          <Card className="bg-white/50 dark:bg-black/20">
                            <CardContent className="p-3 text-center">
                              <Timer className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                              <div className="text-sm font-semibold">{parsed.rest}</div>
                              <div className="text-[10px] text-muted-foreground">Descanso</div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Passos */}
                        {exerciseDetails?.passos && exerciseDetails.passos.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Como executar
                            </h4>
                            <div className="space-y-1.5">
                              {exerciseDetails.passos.slice(0, 3).map((passo: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <span className="font-semibold text-primary">{idx + 1}.</span>
                                  <span>{passo}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dica */}
                        {exerciseDetails?.dicas && (
                          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                              <Flame className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{exerciseDetails.dicas}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
