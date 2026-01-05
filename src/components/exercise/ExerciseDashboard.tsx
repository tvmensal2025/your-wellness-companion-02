import React, { useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Target, Zap, Clock, Calendar, RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { WeeklyPlanView } from "./WeeklyPlanView";
import { ActiveWorkoutModal } from "./ActiveWorkoutModal";
import { WorkoutHistory } from "./WorkoutHistory";
import { SavedProgramView } from "./SavedProgramView";

import { useExerciseProgram } from "@/hooks/useExerciseProgram";
import { useExercisesLibrary, Exercise, WeeklyPlan } from "@/hooks/useExercisesLibrary";
import { useToast } from "@/hooks/use-toast";

interface ExerciseDashboardProps {
  user: User | null;
}

export const ExerciseDashboard: React.FC<ExerciseDashboardProps> = ({ user }) => {
  const { activeProgram, completeWorkout, workoutLogs, loading: programLoading } = useExerciseProgram(user?.id);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<WeeklyPlan | null>(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [showLibraryPlan, setShowLibraryPlan] = useState(false);
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

  const location = useMemo<"casa" | "academia">(() => {
    const loc = programData?.location || "";
    const locStr = String(loc).toLowerCase();
    if (locStr.includes("academia")) return "academia";
    return "casa";
  }, [programData]);

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

  // Só usar biblioteca se não tiver plano salvo OU se usuário quiser ver
  const shouldUseLibrary = !hasSavedWeekPlan || showLibraryPlan;
  
  const { weeklyPlan, todayWorkout, loading: libraryLoading, error, refreshPlan } = useExercisesLibrary(
    location,
    goal,
    difficulty
  );

  const loading = programLoading || (shouldUseLibrary && libraryLoading);

  const handleStartWorkout = (day: WeeklyPlan) => {
    setActiveWorkout(day);
    setIsWorkoutModalOpen(true);
  };

  const handleStartSavedWorkout = (weekNumber: number, activities: string[]) => {
    // Criar um objeto WeeklyPlan compatível
    const workout: WeeklyPlan = {
      dayNumber: new Date().getDay(),
      dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date().getDay()],
      shortName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][new Date().getDay()],
      muscleGroups: [],
      title: `Semana ${weekNumber} - Treino do Dia`,
      exercises: [], // Será preenchido com os exercícios da biblioteca se necessário
      isRestDay: false,
      isToday: true
    };
    
    setActiveWorkout(workout);
    setIsWorkoutModalOpen(true);
    
    toast({
      title: "🔥 Vamos treinar!",
      description: `Iniciando treino da Semana ${weekNumber}`,
    });
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
    <div className="p-4 md:p-6 space-y-6">
      {/* Header com informações do treino */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 px-5 py-8 md:px-8 md:py-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-xl"
          >
            <Flame className="w-8 h-8 md:w-10 md:h-10" />
          </motion.div>

          <div className="space-y-2 md:space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-[10px] md:text-xs font-semibold tracking-wide">
                <Zap className="w-3 h-3 mr-1" />
                {hasSavedWeekPlan ? "MEU PROGRAMA" : "TREINO DO DIA"}
              </Badge>
              {activeProgram && (
                <Badge className="bg-white/10 text-white/80 border-0 text-[10px]">
                  <Calendar className="w-3 h-3 mr-1" />
                  Semana {activeProgram.current_week}/{activeProgram.duration_weeks}
                </Badge>
              )}
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-white leading-tight">
              {activeProgram 
                ? (activeProgram as any).plan_name || (activeProgram as any).name || "Meu Programa"
                : "Sua melhor versão começa agora! 💪"}
            </h2>
            <p className="text-sm md:text-base text-white/80 max-w-lg">
              {hasSavedWeekPlan 
                ? "Siga seu programa personalizado. Cada treino foi pensado para suas necessidades."
                : "Cada treino é uma conquista. Foco no movimento, não na perfeição."}
            </p>
          </div>

          {activeProgram && (
            <div className="flex gap-3 md:flex-col">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3">
                <Target className="w-4 h-4 text-white" />
                <div>
                  <p className="text-[10px] text-white/70 uppercase tracking-wide">
                    Progresso
                  </p>
                  <p className="text-lg font-bold text-white">
                    {activeProgram.completed_workouts}/{activeProgram.total_workouts}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3">
                <Clock className="w-4 h-4 text-white" />
                <div>
                  <p className="text-[10px] text-white/70 uppercase tracking-wide">
                    Treinos/Sem
                  </p>
                  <p className="text-lg font-bold text-white">{activeProgram.workouts_per_week}x</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* Badges de contexto */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center flex-wrap gap-3"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 px-4 py-2 text-sm font-medium">
            {location === "casa" ? "🏠 Em Casa" : "🏋️ Academia"}
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 capitalize">
            {goalLabels[goal] || `🎯 ${goal}`}
          </Badge>
          {difficulty && (
            <Badge variant="secondary" className="px-3 py-1.5 capitalize">
              ⚡ {difficulty}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasSavedWeekPlan && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLibraryPlan(!showLibraryPlan)}
              className="text-xs"
            >
              {showLibraryPlan ? "📋 Ver Meu Programa" : "📚 Ver Biblioteca"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPlan}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </motion.section>

      {/* Histórico de treinos */}
      <WorkoutHistory logs={workoutLogs as any} />

      {/* Conteúdo principal */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
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
