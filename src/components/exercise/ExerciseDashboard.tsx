import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useExerciseProgram } from '@/hooks/useExerciseProgram';
import { useExerciseAI } from '@/hooks/useExerciseAI';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Play,
  Pause,
  Trophy,
  TrendingUp,
  History,
  Sparkles,
  Brain,
  Lightbulb
} from 'lucide-react';
import { ExerciseOnboardingModal } from './ExerciseOnboardingModal';
import { ExerciseStepModal } from './ExerciseStepModal';

interface ExerciseDashboardProps {
  user: User | null;
}

export const ExerciseDashboard: React.FC<ExerciseDashboardProps> = ({ user }) => {
  const { 
    programs, 
    activeProgram, 
    workoutLogs, 
    loading,
    completeWorkout,
    pauseProgram,
    resumeProgram 
  } = useExerciseProgram(user?.id);

  const { analyzeProgress, getDailyMotivation, loading: aiLoading } = useExerciseAI();

  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [dailyMotivation, setDailyMotivation] = useState<string>('');
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [stepDayIndex, setStepDayIndex] = useState<number | null>(null);

  // Buscar motivação diária ao carregar
  useEffect(() => {
    if (user?.id) {
      const fetchMotivation = async () => {
        const motivation = await getDailyMotivation(user.id);
        setDailyMotivation(motivation);
      };
      fetchMotivation();
    }
  }, [user?.id]);

  // Analisar progresso automaticamente quando tiver 3+ treinos
  useEffect(() => {
    if (activeProgram && workoutLogs.length >= 3 && !aiRecommendation && user?.id) {
      const analyze = async () => {
        const recommendation = await analyzeProgress(user.id);
        setAiRecommendation(recommendation);
      };
      analyze();
    }
  }, [activeProgram, workoutLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não tem programas ainda
  if (programs.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-orange-600" />
            Exercícios Recomendados
          </h2>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <Dumbbell className="w-12 h-12 text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">Comece sua Jornada Fitness!</h3>
            <p className="text-muted-foreground">
              Crie seu primeiro programa personalizado em menos de 2 minutos
            </p>
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            onClick={() => setShowModal(true)}
          >
            Criar Meu Programa
          </Button>
        </div>

        <ExerciseOnboardingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          user={user}
        />
      </div>
    );
  }

  // Tem programa ativo
  if (activeProgram) {
    const progress = (activeProgram.completed_workouts / activeProgram.total_workouts) * 100;
    const currentWeekData = activeProgram.plan_data?.weeks?.[activeProgram.current_week - 1];
    const nextWorkoutIndex = currentWeekData
      ? currentWeekData.activities.findIndex((_: string, idx: number) =>
          !workoutLogs.some(
            (log) =>
              log.week_number === activeProgram.current_week &&
              log.day_number === idx + 1 &&
              log.completed
          )
        )
      : -1;
    const nextWorkoutActivity =
      nextWorkoutIndex >= 0 ? currentWeekData?.activities[nextWorkoutIndex] : null;

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-orange-600" />
            Meu Programa Ativo
          </h2>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? 'Ocultar' : 'Ver'} Histórico
            </Button>
          </div>
        </div>

        {/* Programa Ativo */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">{activeProgram.plan_name}</h3>
              <p className="text-muted-foreground max-w-xl">
                {activeProgram.plan_data?.description}
              </p>
            </div>
            <Badge className="bg-green-500 self-start">Ativo</Badge>
          </div>

          {/* Treino de hoje */}
          {nextWorkoutActivity && (
            <div className="rounded-xl bg-white/70 dark:bg-black/20 border border-orange-200/70 dark:border-orange-900 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-1">
                    Treino de hoje
                  </p>
                  <p className="font-semibold text-sm md:text-base">
                    {nextWorkoutActivity}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Semana {activeProgram.current_week} · {activeProgram.workouts_per_week}x/semana
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-stretch md:items-end gap-1 text-xs md:text-sm">
                <span className="text-muted-foreground">
                  Próximo passo claro para você hoje.
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-1 md:mt-0 hover-scale"
                  onClick={() => {
                    if (nextWorkoutIndex >= 0) {
                      setStepDayIndex(nextWorkoutIndex);
                      setStepModalOpen(true);
                    }
                  }}
                >
                  Iniciar treino agora
                </Button>
              </div>
            </div>
          )}

          {/* Estatísticas gerais do programa */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                Semana {activeProgram.current_week}
              </div>
              <div className="text-sm text-muted-foreground">de {activeProgram.duration_weeks}</div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {activeProgram.completed_workouts}
              </div>
              <div className="text-sm text-muted-foreground">
                de {activeProgram.total_workouts} treinos
              </div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {activeProgram.workouts_per_week}x
              </div>
              <div className="text-sm text-muted-foreground">por semana</div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {currentWeekData?.days || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">dias/semana</div>
            </div>
          </div>

          {/* Progresso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Progresso Geral</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Botão Pausar */}
          <Button
            variant="outline"
            onClick={() => pauseProgram(activeProgram.id)}
            className="w-full"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pausar Programa
          </Button>
        </div>

        {/* Motivação Diária da IA */}
        {dailyMotivation && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Motivação do Dia
                </h3>
                <p className="text-lg italic">{dailyMotivation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recomendações da IA */}
        {aiRecommendation && (
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950 rounded-lg p-6 border-2 border-cyan-200 dark:border-cyan-800">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-cyan-600" />
                <h3 className="font-bold text-lg">Análise Inteligente (IA)</h3>
                {aiLoading && <span className="text-sm text-muted-foreground">Analisando...</span>}
              </div>
              
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Avaliação:</p>
                <p>{aiRecommendation.message}</p>
              </div>

              {aiRecommendation.suggestions && aiRecommendation.suggestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Sugestões Personalizadas:</p>
                  <ul className="space-y-2">
                    {aiRecommendation.suggestions.map((suggestion: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (user?.id) {
                    setAiRecommendation(null);
                    const newRec = await analyzeProgress(user.id);
                    setAiRecommendation(newRec);
                  }
                }}
                disabled={aiLoading}
              >
                <Brain className="w-4 h-4 mr-2" />
                {aiLoading ? 'Analisando...' : 'Analisar Novamente'}
              </Button>
            </div>
          </div>
        )}

        {/* Visualização do Programa - sempre em modo de lista da semana */}
        <div className="bg-card rounded-lg p-6 border space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-bold">Treinos desta Semana (Semana {activeProgram.current_week})</h3>
          </div>

          {currentWeekData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{currentWeekData.days}</span>
              </div>
              {currentWeekData.activities.map((activity: string, idx: number) => {
                const isCompleted = workoutLogs.some(
                  log => log.week_number === activeProgram.current_week && log.day_number === idx + 1 && log.completed
                );

                return (
                  <div
                    key={idx}
                    className={`flex items-start justify-between p-4 rounded-lg border ${
                      isCompleted ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        <span className="font-semibold">Treino {idx + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity}</p>
                    </div>
                    {!isCompleted && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setStepDayIndex(idx);
                          setStepModalOpen(true);
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Iniciar treino
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum treino programado para esta semana</p>
          )}
        </div>

        {/* Modal passo a passo do treino */}
        {activeProgram && currentWeekData && stepDayIndex !== null && stepDayIndex >= 0 && (
          <ExerciseStepModal
            open={stepModalOpen}
            onClose={() => setStepModalOpen(false)}
            planId={activeProgram.id}
            weekNumber={activeProgram.current_week}
            dayNumber={stepDayIndex + 1}
            title={`Treino ${stepDayIndex + 1}`}
            description={activeProgram.plan_data?.description}
            activity={currentWeekData.activities[stepDayIndex]}
            onCompleteWorkout={async () => {
              await completeWorkout(
                activeProgram.id,
                activeProgram.current_week,
                stepDayIndex + 1,
                `Treino ${stepDayIndex + 1}`,
                { activity: currentWeekData.activities[stepDayIndex] }
              );
            }}
          />
        )}

        {/* Histórico */}
        {showHistory && (
          <div className="bg-card rounded-lg p-6 border space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico de Programas
            </h3>

            <div className="space-y-3">
              {programs.map((program) => {
                const programProgress = (program.completed_workouts / program.total_workouts) * 100;

                return (
                  <div
                    key={program.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{program.plan_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {program.duration_weeks} semanas • {program.workouts_per_week}x/semana
                      </p>
                    </div>
                      <Badge variant={program.status === 'completed' ? 'default' : program.status === 'active' ? 'default' : 'secondary'}>
                        {program.status === 'completed' ? 'Concluído' : program.status === 'active' ? 'Ativo' : 'Pausado'}
                      </Badge>
                    </div>

                    <Progress value={programProgress} className="h-2" />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {program.completed_workouts}/{program.total_workouts} treinos ({Math.round(programProgress)}%)
                      </span>
                      {program.status === 'paused' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resumeProgram(program.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Retomar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botão Novo Programa */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowModal(true)}
        >
          <Dumbbell className="w-4 h-4 mr-2" />
          Criar Novo Programa
        </Button>

        <ExerciseOnboardingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          user={user}
        />
      </div>
    );
  }

  // Tem programas mas nenhum ativo
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Dumbbell className="w-8 h-8 text-orange-600" />
          Exercícios Recomendados
        </h2>
      </div>

      <div className="bg-card rounded-lg p-6 border space-y-4">
        <p className="text-muted-foreground">Você não tem programas ativos no momento</p>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          Criar Novo Programa
        </Button>
      </div>

      {/* Visualização dos Programas */}
      <div className="bg-card rounded-lg p-6 border space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <History className="w-5 h-5" />
          Programas Anteriores
        </h3>

        <div className="space-y-3">
          {programs.map((program) => {
            const programProgress = (program.completed_workouts / program.total_workouts) * 100;

            return (
              <div
                key={program.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{program.plan_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {program.duration_weeks} semanas • {program.workouts_per_week}x/semana
                    </p>
                  </div>
                  <Badge variant={program.status === 'completed' ? 'default' : 'secondary'}>
                    {program.status === 'completed' ? 'Concluído' : 'Pausado'}
                  </Badge>
                </div>

                <Progress value={programProgress} className="h-2" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {program.completed_workouts}/{program.total_workouts} treinos ({Math.round(programProgress)}%)
                  </span>
                  {program.status === 'paused' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resumeProgram(program.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Retomar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ExerciseOnboardingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={user}
      />
    </div>
  );
};
