import React, { useCallback, useMemo, useState } from "react";
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
import { WorkoutHistory, WorkoutHistoryContent } from "./WorkoutHistory";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Library } from "lucide-react";
import { SavedProgramView } from "./SavedProgramView";

import { useExerciseProgram } from "@/hooks/useExerciseProgram";
import { useExercisesLibrary, Exercise, WeeklyPlan } from "@/hooks/useExercisesLibrary";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { normalizeKey, parseActivityTitle } from "@/lib/exercise-format";

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

  const resolveExercisesFromActivities = useCallback(async (activities: string[]) => {
    const names = activities.map(parseActivityTitle).filter(Boolean);

    // Busca em TODA a biblioteca, não apenas na localização atual
    // para garantir que encontramos os exercícios do plano salvo
    const { data, error } = await supabase
      .from("exercises_library")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;

    const library = (data || []) as Exercise[];

    // Índices de busca (nome e grupo muscular)
    const keyed = library.map((ex) => {
      const nameKey = normalizeKey(ex.name);
      const groupKey = normalizeKey(ex.muscle_group || "");
      return {
        ex,
        nameKey,
        nameWords: nameKey.split(" "),
        groupKey,
        groupWords: groupKey.split(" "),
      };
    });

    const result: Exercise[] = [];
    const usedIds = new Set<string>();

    const addIfNotUsed = (ex: Exercise) => {
      if (usedIds.has(ex.id)) return false;
      usedIds.add(ex.id);
      result.push(ex);
      return true;
    };

    // Quando a atividade não é um nome exato de exercício (ex: "Ombros", "Mobilidade"),
    // traz 2-3 exercícios do mesmo grupo muscular.
    const pickByMuscleGroup = (key: string, limit = 3) => {
      let added = 0;

      const directMatches = keyed
        .filter((k) => k.groupKey && !usedIds.has(k.ex.id))
        .filter((k) => k.groupKey === key || k.groupKey.includes(key) || key.includes(k.groupKey))
        .map((k) => k.ex);

      for (const ex of directMatches) {
        if (added >= limit) break;
        if (addIfNotUsed(ex)) added++;
      }

      if (added > 0) return;

      const words = key.split(" ").filter((w) => w.length > 2);
      const importantWords = words.filter(
        (w) => !["com", "de", "do", "da", "na", "no", "em", "para"].includes(w)
      );

      if (!importantWords.length) return;

      const fuzzyMatches = keyed
        .filter((k) => k.groupKey && !usedIds.has(k.ex.id))
        .filter((k) => importantWords.some((w) => k.groupKey.includes(w)))
        .map((k) => k.ex);

      for (const ex of fuzzyMatches) {
        if (added >= limit) break;
        if (addIfNotUsed(ex)) added++;
      }
    };

    for (const name of names) {
      const key = normalizeKey(name);
      if (!key) continue;

      const words = key.split(" ").filter((w) => w.length > 2);

      // 1. Busca exata por nome
      let match = keyed.find((k) => k.nameKey === key && !usedIds.has(k.ex.id))?.ex;

      // 2. Busca parcial - nome contém ou está contido
      if (!match) {
        match = keyed.find(
          (k) =>
            !usedIds.has(k.ex.id) &&
            (k.nameKey.includes(key) || key.includes(k.nameKey))
        )?.ex;
      }

      // 3. Busca por palavras-chave (pelo menos 2 palavras coincidentes)
      if (!match && words.length >= 1) {
        match = keyed.find((k) => {
          if (usedIds.has(k.ex.id)) return false;
          const matchingWords = words.filter((w) => k.nameWords.includes(w) || k.nameKey.includes(w));
          return matchingWords.length >= Math.min(2, words.length);
        })?.ex;
      }

      // 4. Busca flexível - qualquer palavra importante coincide
      if (!match && words.length >= 1) {
        const importantWords = words.filter(
          (w) => !["com", "de", "do", "da", "na", "no", "em", "para", "perna", "braco"].includes(w)
        );
        if (importantWords.length > 0) {
          match = keyed.find((k) => {
            if (usedIds.has(k.ex.id)) return false;
            return importantWords.some((w) => k.nameKey.includes(w));
          })?.ex;
        }
      }

      if (match) {
        addIfNotUsed(match);
        continue;
      }

      // Fallback: tratar "activity" como grupo muscular e puxar múltiplos exercícios
      pickByMuscleGroup(key, 3);
    }

    return result;
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

      {/* Barra de ações compacta */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between gap-2 flex-wrap"
      >
        {/* Badges de contexto - mais compactos */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 h-7 px-2.5 text-xs font-medium">
            {location === "casa" ? "🏠 Casa" : "🏋️ Academia"}
          </Badge>
          <Badge variant="outline" className="h-7 px-2 text-xs capitalize">
            {goalLabels[goal] || `🎯 ${goal}`}
          </Badge>
        </div>
        
        {/* Ações compactas no topo */}
        <div className="flex items-center gap-1.5">
          {/* Botão Histórico */}
          <Popover>
            <PopoverTrigger asChild>
              <WorkoutHistory logs={workoutLogs as any} />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-3 border-b border-border/50">
                <h4 className="font-semibold text-sm">Histórico de Treinos</h4>
              </div>
              <WorkoutHistoryContent logs={workoutLogs as any} />
            </PopoverContent>
          </Popover>

          {/* Botão Biblioteca */}
          {hasSavedWeekPlan && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLibraryPlan(!showLibraryPlan)}
              className="h-8 px-3 gap-1.5 text-xs font-medium bg-muted/50 hover:bg-muted border border-border/40 rounded-lg"
            >
              <Library className="w-3.5 h-3.5 text-primary" />
              <span className="hidden xs:inline">{showLibraryPlan ? "Programa" : "Biblioteca"}</span>
            </Button>
          )}
          
          {/* Botão Atualizar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshPlan}
            disabled={loading}
            className="h-8 w-8 rounded-lg bg-muted/50 hover:bg-muted border border-border/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </motion.section>

      {/* Conteúdo principal */}
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
