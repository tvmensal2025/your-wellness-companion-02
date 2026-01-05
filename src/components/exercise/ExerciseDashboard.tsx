import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dumbbell, Flame, Target, Zap, Clock, Calendar, RefreshCw } from 'lucide-react';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { WeeklyPlanView } from './WeeklyPlanView';
import { ActiveWorkoutModal } from './ActiveWorkoutModal';
import { useExerciseProgram } from '@/hooks/useExerciseProgram';
import { useExercisesLibrary, Exercise, WeeklyPlan } from '@/hooks/useExercisesLibrary';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ExerciseDashboardProps {
  user: User | null;
}

export const ExerciseDashboard: React.FC<ExerciseDashboardProps> = ({ user }) => {
  const { activeProgram, completeWorkout } = useExerciseProgram(user?.id);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<WeeklyPlan | null>(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const { toast } = useToast();

  // Extrair localização e objetivo do programa ativo
  const programData = React.useMemo(() => {
    if (!activeProgram) return null;
    return (activeProgram as any).exercises || 
           (activeProgram as any).plan_data || 
           (activeProgram as any).planData;
  }, [activeProgram]);

  const location = React.useMemo<'casa' | 'academia'>(() => {
    if (!programData?.location) return 'casa';
    const loc = String(programData.location).toLowerCase();
    if (loc.includes('academia')) return 'academia';
    return 'casa';
  }, [programData]);

  const goal = React.useMemo(() => {
    const rawGoal = programData?.goal || (activeProgram as any)?.goal;
    if (!rawGoal) return 'condicionamento';
    
    const goalMap: Record<string, string> = {
      'hipertrofia': 'hipertrofia',
      'ganhar massa': 'hipertrofia',
      'massa muscular': 'hipertrofia',
      'emagrecer': 'emagrecimento',
      'perder peso': 'emagrecimento',
      'emagrecimento': 'emagrecimento',
      'condicionamento': 'condicionamento',
      'saude': 'saude',
      'saúde': 'saude'
    };
    
    const normalizedGoal = String(rawGoal).toLowerCase();
    for (const [key, value] of Object.entries(goalMap)) {
      if (normalizedGoal.includes(key)) {
        return value;
      }
    }
    return 'condicionamento';
  }, [programData, activeProgram]);

  // Usar exercícios do banco de dados
  const { 
    weeklyPlan, 
    todayWorkout, 
    loading, 
    error, 
    refreshPlan 
  } = useExercisesLibrary(location, goal);

  const handleStartWorkout = (day: WeeklyPlan) => {
    setActiveWorkout(day);
    setIsWorkoutModalOpen(true);
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

    // Registrar no programa ativo
    await completeWorkout(
      activeProgram.id,
      activeProgram.current_week,
      new Date().getDay(),
      activeWorkout?.title || 'Treino',
      { exercises: completedExercises }
    );
  };

  // Calcular totais do treino de hoje
  const todayExerciseCount = todayWorkout?.exercises.length || 0;
  const estimatedDuration = Math.round(todayExerciseCount * 4); // ~4 min por exercício

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Hero Section - Design Premium */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 px-5 py-8 md:px-8 md:py-10"
      >
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
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
                {todayWorkout?.isRestDay ? 'DIA DE DESCANSO' : 'TREINO DO DIA'}
              </Badge>
              <Badge className="bg-white/10 text-white/80 border-0 text-[10px]">
                <Calendar className="w-3 h-3 mr-1" />
                {todayWorkout?.dayName}
              </Badge>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-white leading-tight">
              {todayWorkout?.isRestDay 
                ? 'Hora de recuperar! 💤' 
                : todayWorkout?.title || 'Sua melhor versão começa agora! 💪'
              }
            </h2>
            <p className="text-sm md:text-base text-white/80 max-w-lg">
              {todayWorkout?.isRestDay 
                ? 'Seu corpo precisa de descanso para ficar mais forte. Aproveite!' 
                : 'Cada treino é uma conquista. Foco no movimento, não na perfeição.'
              }
            </p>
          </div>

          {/* Stats Cards */}
          {!todayWorkout?.isRestDay && (
            <div className="flex gap-3 md:flex-col">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3">
                <Target className="w-4 h-4 text-white" />
                <div>
                  <p className="text-[10px] text-white/70 uppercase tracking-wide">Exercícios</p>
                  <p className="text-lg font-bold text-white">{todayExerciseCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3">
                <Clock className="w-4 h-4 text-white" />
                <div>
                  <p className="text-[10px] text-white/70 uppercase tracking-wide">Duração</p>
                  <p className="text-lg font-bold text-white">~{estimatedDuration}min</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* Location & Goal Badge + Refresh */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center flex-wrap gap-3"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 px-4 py-2 text-sm font-medium">
            {location === 'casa' ? '🏠 Em Casa' : '🏋️ Academia'}
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 capitalize">
            🎯 {goal}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshPlan}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </motion.section>

      {/* Loading State */}
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
      ) : error ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={refreshPlan} variant="outline" className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Plano Semanal */
        <WeeklyPlanView
          weeklyPlan={weeklyPlan}
          todayWorkout={todayWorkout}
          onStartWorkout={handleStartWorkout}
          onExerciseClick={handleExerciseClick}
        />
      )}

      {/* Modal de Detalhes do Exercício */}
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
            equipamento: selectedExercise.equipment_needed?.join(', '),
            instrucoes: selectedExercise.instructions,
            dicas: selectedExercise.tips,
            youtubeUrl: selectedExercise.youtube_url
          }}
          location={location}
        />
      )}

      {/* Modal de Treino Ativo */}
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
