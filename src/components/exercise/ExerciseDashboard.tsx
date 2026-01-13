import React, { useCallback, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Target, Zap, Clock, Calendar, RefreshCw, AlertTriangle, Users, Bell, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { WeeklyPlanView } from "./WeeklyPlanView";
import { ActiveWorkoutModal } from "./ActiveWorkoutModal";
import { ProgressShareButton } from "./ProgressShareButton";
import { Library } from "lucide-react";
import { SavedProgramView } from "./SavedProgramView";

// Novos componentes avançados
import { PerformanceDashboardCard } from "./PerformanceDashboardCard";
import { SocialHubCard } from "./SocialHubCard";
import { NotificationCenter } from "./NotificationCenter";

import { useExerciseProgram } from "@/hooks/useExerciseProgram";
import { useExercisesLibrary, Exercise, WeeklyPlan } from "@/hooks/useExercisesLibrary";
import { useUserProgressStats } from "@/hooks/useUserProgressStats";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { matchExercisesFromActivities } from "@/lib/exercise-matching";

interface ExerciseDashboardProps {
  user: User | null;
}

export const ExerciseDashboard: React.FC<ExerciseDashboardProps> = ({ user }) => {
  const { activeProgram, completeWorkout, workoutLogs, loading: programLoading } = useExerciseProgram(user?.id);
  const { stats: progressStats } = useUserProgressStats(user?.id || null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<WeeklyPlan | null>(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [showLibraryPlan, setShowLibraryPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'treino' | 'stats' | 'social'>('treino');
  const { toast } = useToast();

  // Verificar se o programa salvo tem plano semanal detalhado
  const hasSavedWeekPlan = useMemo(() => {
    if (!activeProgram) return false;
    const programData = (activeProgram as any).plan_data || (activeProgram as any).exercises;
    return programData?.weeks && programData.weeks.length > 0;
  }, [activeProgram]);

  const programData = useMemo(() => {
    if (!activeProgram) return null;
    return (
      (activeProgram as any).plan_data ||
      (activeProgram as any).exercises ||
      (activeProgram as any).planData ||
      null
    );
  }, [activeProgram]);

  // Sistema agora é apenas para treino em casa
  const location = useMemo<"casa">(() => {
    return "casa";
  }, []);

  const goal = useMemo(() => {
    const rawGoal = (activeProgram as any)?.goal ?? programData?.goal;
    if (!rawGoal) return "condicionamento";

    const goalMap: Record<string, string> = {
      hipertrofia: "hipertrofia",
      "ganhar massa": "hipertrofia",
      "massa muscular": "hipertrofia",
      emagrecer: "emagrecimento",
      "perder peso": "emagrecimento",
      emagrecimento: "emagrecimento",
      condicionamento: "condicionamento",
      saude: "saude",
      saúde: "saude",
      estresse: "estresse",
    };

    const normalizedGoal = String(rawGoal).toLowerCase().trim();
    if (goalMap[normalizedGoal]) return goalMap[normalizedGoal];

    for (const [key, value] of Object.entries(goalMap)) {
      if (normalizedGoal.includes(key)) return value;
    }

    return "condicionamento";
  }, [activeProgram, programData]);

  const difficulty = useMemo<"iniciante" | "intermediario" | "avancado" | undefined>(() => {
    const raw = (activeProgram as any)?.difficulty ?? programData?.level;
    if (!raw) return undefined;

    const normalized = String(raw).toLowerCase().trim();
    if (normalized.includes("sedent")) return "iniciante";
    if (normalized.includes("leve") || normalized.includes("inic")) return "iniciante";
    if (normalized.includes("inter")) return "intermediario";
    if (normalized.includes("avan") || normalized.includes("elite")) return "avancado";

    return undefined;
  }, [activeProgram, programData]);

  // Extrair parâmetros adicionais do programa
  const time = useMemo(() => programData?.time || '30-45', [programData]);
  const level = useMemo(() => programData?.level || 'moderado', [programData]);
  const exercisesPerDay = useMemo(() => programData?.exercisesPerDay || programData?.exercises_per_day || '5-6', [programData]);

  // Só usar biblioteca se não tiver plano salvo OU se usuário quiser ver
  const shouldUseLibrary = !hasSavedWeekPlan || showLibraryPlan;
  
  const { weeklyPlan, todayWorkout, loading: libraryLoading, error, refreshPlan } = useExercisesLibrary(
    location,
    goal,
    difficulty,
    time,
    level,
    exercisesPerDay
  );

  const loading = programLoading || (shouldUseLibrary && libraryLoading);

  const handleStartWorkout = (day: WeeklyPlan) => {
    setActiveWorkout(day);
    setIsWorkoutModalOpen(true);
  };

  const resolveExercisesFromActivities = useCallback(async (activities: string[]) => {
    // Busca TODA a biblioteca para garantir que encontramos os exercícios
    const { data, error } = await supabase
      .from("exercises_library")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;

    const library = (data || []) as Exercise[];

    // Usar o novo sistema de matching melhorado
    const { exercises } = matchExercisesFromActivities(
      activities,
      library,
      { maxPerActivity: 3, preferWithVideo: true }
    );

    return exercises;
  }, []);

  const handleStartSavedWorkout = async (weekNumber: number, activities: string[], resolvedExercises?: Exercise[]) => {
    try {
      // Se já temos exercícios resolvidos (passados do SavedProgramView), usá-los diretamente
      let exercises: Exercise[] = resolvedExercises || [];

      // Se não temos exercícios resolvidos, tentar resolver (fallback)
      if (exercises.length === 0) {
        toast({
          title: "Preparando seu treino…",
          description: "Carregando exercícios e vídeos.",
        });

        exercises = await resolveExercisesFromActivities(activities);
      }

      if (exercises.length === 0) {
        toast({
          title: "Nenhum exercício encontrado",
          description: "Os exercícios deste treino ainda não estão na biblioteca. Tente gerar um novo plano.",
          variant: "destructive",
        });
        return;
      }

      // Se encontramos alguns mas não todos, avisa mas continua
      if (exercises.length < activities.length) {
        console.log(`Encontrados ${exercises.length} exercícios para ${activities.length} atividades`);
      }

      // Criar um objeto WeeklyPlan compatível
      const workout: WeeklyPlan = {
        dayNumber: new Date().getDay(),
        dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date().getDay()],
        shortName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][new Date().getDay()],
        muscleGroups: Array.from(new Set(exercises.map((e) => e.muscle_group).filter(Boolean))) as string[],
        title: `Semana ${weekNumber} - Treino do Dia`,
        exercises: exercises,
        isRestDay: false,
        isToday: true
      };

      setActiveWorkout(workout);
      setIsWorkoutModalOpen(true);

      toast({
        title: "🔥 Vamos treinar!",
        description: `Iniciando treino da Semana ${weekNumber} com ${exercises.length} exercícios`,
      });
    } catch (e: any) {
      console.error('Erro ao iniciar treino salvo:', e);
      toast({
        title: "Erro ao iniciar treino",
        description: "Não foi possível carregar os exercícios do treino salvo.",
        variant: "destructive",
      });
    }
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDetailModalOpen(true);
  };

  const handleWorkoutComplete = async (completedExercises: string[]) => {
    if (!activeProgram) {
      toast({
        title: "Treino Concluído! 🎉",
        description: `Você completou ${completedExercises.length} exercícios!`,
      });
      return;
    }

    await completeWorkout(
      activeProgram.id,
      activeProgram.current_week,
      new Date().getDay(),
      activeWorkout?.title || "Treino",
      { exercises: completedExercises }
    );
  };

  const todayExerciseCount = todayWorkout?.exercises.length || 0;
  const estimatedDuration = Math.round(todayExerciseCount * 4);

  // Labels para exibição
  const goalLabels: Record<string, string> = {
    hipertrofia: "💪 Hipertrofia",
    emagrecimento: "🔥 Emagrecimento",
    condicionamento: "🏃 Condicionamento",
    saude: "❤️ Saúde",
    estresse: "🧘 Anti-Estresse"
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-3 sm:space-y-5 overflow-hidden max-w-full">
      {/* Header com informações do treino */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-8"
      >
        <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
          {/* Top row: icon + badges */}
          <div className="flex items-start gap-3 sm:gap-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-xl flex-shrink-0"
            >
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </motion.div>

            <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-wide px-2 py-0.5">
                  <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  {hasSavedWeekPlan ? "MEU PROGRAMA" : "TREINO DO DIA"}
                </Badge>
                {activeProgram && (
                  <Badge className="bg-white/10 text-white/80 border-0 text-[9px] sm:text-[10px] px-2 py-0.5">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    Sem {activeProgram.current_week}/{activeProgram.duration_weeks}
                  </Badge>
                )}
              </div>
              <h2 className="text-base sm:text-xl md:text-3xl font-bold text-white leading-tight line-clamp-2">
                {activeProgram 
                  ? (activeProgram as any).plan_name || (activeProgram as any).name || "Meu Programa"
                  : "Sua melhor versão começa agora! 💪"}
              </h2>
            </div>
          </div>

          {/* Description + stats */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-5">
            <p className="text-xs sm:text-sm md:text-base text-white/80 max-w-lg leading-relaxed">
              {hasSavedWeekPlan 
                ? "Siga seu programa personalizado. Cada treino foi pensado para suas necessidades."
                : "Cada treino é uma conquista. Foco no movimento, não na perfeição."}
            </p>

            {activeProgram && (
              <div className="flex gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  <div>
                    <p className="text-[8px] sm:text-[10px] text-white/70 uppercase tracking-wide">
                      Progresso
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-white">
                      {activeProgram.completed_workouts}/{activeProgram.total_workouts}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  <div>
                    <p className="text-[8px] sm:text-[10px] text-white/70 uppercase tracking-wide">
                      Treinos/Sem
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-white">{activeProgram.workouts_per_week}x</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Barra de ações compacta */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between gap-2"
      >
        {/* Tabs de navegação */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
          <Button
            variant={activeTab === 'treino' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('treino')}
            className="h-7 px-2.5 text-[10px] sm:text-xs gap-1"
          >
            <Flame className="w-3 h-3" />
            <span className="hidden sm:inline">Treino</span>
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('stats')}
            className="h-7 px-2.5 text-[10px] sm:text-xs gap-1"
          >
            <BarChart3 className="w-3 h-3" />
            <span className="hidden sm:inline">Stats</span>
          </Button>
          <Button
            variant={activeTab === 'social' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('social')}
            className="h-7 px-2.5 text-[10px] sm:text-xs gap-1"
          >
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">Social</span>
          </Button>
        </div>
        
        {/* Ações compactas no topo */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Notificações */}
          <NotificationCenter userId={user?.id || ''} variant="compact" />

          {/* Botão Progresso Compartilhável */}
          <ProgressShareButton 
            stats={{
              totalWorkouts: (workoutLogs as any[])?.length || 0,
              currentStreak: progressStats?.currentStreak || 0,
              weightChange: progressStats?.weightChange || null,
              challengesCompleted: progressStats?.challengesCompleted || 0,
            }} 
          />

          {/* Botão Biblioteca */}
          {hasSavedWeekPlan && activeTab === 'treino' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLibraryPlan(!showLibraryPlan)}
              className="h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium bg-muted/50 hover:bg-muted border border-border/40 rounded-lg"
            >
              <Library className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              <span className="hidden sm:inline">{showLibraryPlan ? "Programa" : "Biblioteca"}</span>
            </Button>
          )}
          
          {/* Botão Atualizar */}
          {activeTab === 'treino' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshPlan}
              disabled={loading}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-muted/50 hover:bg-muted border border-border/40"
            >
              <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </motion.section>

      {/* Conteúdo principal */}
      {activeTab === 'treino' && (
        <>
          {loading ? (
            <div className="space-y-3">
              <Skeleton variant="shimmer" className="h-16 w-full rounded-xl" />
              <div className="grid grid-cols-7 gap-1.5">
                {[...Array(7)].map((_, i) => (
                  <Skeleton variant="shimmer" key={i} className="h-12 rounded-lg" />
                ))}
              </div>
              <Skeleton variant="shimmer" className="h-40 w-full rounded-xl" />
            </div>
          ) : error && shouldUseLibrary ? (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-6 text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button onClick={refreshPlan} variant="outline" className="mt-4">
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          ) : hasSavedWeekPlan && !showLibraryPlan ? (
            // MOSTRAR PROGRAMA SALVO
            <SavedProgramView
              program={activeProgram as any}
              onStartWorkout={handleStartSavedWorkout}
              onCompleteWorkout={() => {}}
              onExerciseClick={handleExerciseClick}
            />
          ) : (
            // MOSTRAR BIBLIOTECA DE EXERCÍCIOS
            <WeeklyPlanView
              weeklyPlan={weeklyPlan}
              todayWorkout={todayWorkout}
              onStartWorkout={handleStartWorkout}
              onExerciseClick={handleExerciseClick}
            />
          )}
        </>
      )}

      {/* Tab de Estatísticas */}
      {activeTab === 'stats' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <PerformanceDashboardCard userId={user?.id || ''} />
        </motion.div>
      )}

      {/* Tab Social */}
      {activeTab === 'social' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <SocialHubCard userId={user?.id || ''} />
        </motion.div>
      )}

      {/* Modais */}
      {selectedExercise && (
        <ExerciseDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          exerciseData={{
            name: selectedExercise.name,
            descricao: selectedExercise.description,
            series: selectedExercise.sets,
            repeticoes: selectedExercise.reps,
            descanso: selectedExercise.rest_time,
            nivel: selectedExercise.difficulty,
            equipamento: selectedExercise.equipment_needed?.join(", "),
            instrucoes: selectedExercise.instructions,
            dicas: selectedExercise.tips,
            youtubeUrl: selectedExercise.youtube_url,
          }}
          location={location}
        />
      )}

      {activeWorkout && (
        <ActiveWorkoutModal
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          workout={activeWorkout}
          onComplete={handleWorkoutComplete}
        />
      )}
    </div>
  );
};
