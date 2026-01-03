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
  Lightbulb,
} from 'lucide-react';
import { ExerciseOnboardingModal } from './ExerciseOnboardingModal';
import { ExerciseDetailView } from './ExerciseDetailView';
import { transformWeeksToWeekPlan } from '@/utils/workoutParser';
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
    resumeProgram,
  } = useExerciseProgram(user?.id);

  const { analyzeProgress, getDailyMotivation, loading: aiLoading } = useExerciseAI();

  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [dailyMotivation, setDailyMotivation] = useState<string>('');

  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [stepDayIndex, setStepDayIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchMotivation = async () => {
        const motivation = await getDailyMotivation(user.id);
        setDailyMotivation(motivation);
      };
      fetchMotivation();
    }
  }, [user?.id]);

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
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] font-semibold opacity-80">
              Exercícios Recomendados
            </p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Comece sua jornada em movimento
            </h2>
            <p className="text-sm md:text-base text-white/90 max-w-xl">
              Crie um programa de treinos simples, pensado para o seu ritmo, e receba um treino de hoje todos os dias.
            </p>
          </div>
          <div className="w-full md:w-64 h-40 rounded-2xl bg-white/10 shadow-lg overflow-hidden flex items-center justify-center">
            <img
              src="/placeholder.svg"
              alt="Ilustração de treino"
              className="w-full h-full object-cover opacity-95"
            />
          </div>
        </section>

        <section className="bg-card rounded-xl p-6 border space-y-3">
          <p className="text-muted-foreground text-sm">
            Você não tem programas ativos no momento.
          </p>
          <Button
            size="lg"
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Criar Meu Programa
          </Button>
        </section>

        <ExerciseOnboardingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          user={user}
        />
      </div>
    );
  }

  if (activeProgram) {
    const progress = (activeProgram.completed_workouts / activeProgram.total_workouts) * 100;
    const currentWeekData = activeProgram.plan_data?.weeks?.[activeProgram.current_week - 1];
    const nextWorkoutIndex = currentWeekData
      ? currentWeekData.activities.findIndex((_: string, idx: number) =>
          !workoutLogs.some(
            (log) =>
              log.week_number === activeProgram.current_week &&
              log.day_number === idx + 1 &&
              log.completed,
          ),
        )
      : -1;
    const nextWorkoutActivity =
      nextWorkoutIndex >= 0 ? currentWeekData?.activities[nextWorkoutIndex] : null;

    return (
      <div className="p-6 space-y-6">
        {/* Hero de treino com imagem */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] font-semibold opacity-80">
              Exercícios Recomendados
            </p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              {activeProgram.plan_name}
            </h2>
            <p className="text-sm md:text-base text-white/90 max-w-xl">
              {activeProgram.plan_data?.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <Badge variant="outline" className="border-white/40 bg-white/10 text-white flex items-center gap-1">
                <Dumbbell className="w-3 h-3" />
                {activeProgram.plan_data?.location === 'academia' ? 'Academia' : 'Em casa'}
              </Badge>
              <Badge variant="outline" className="border-white/40 bg-white/10 text-white">
                {activeProgram.workouts_per_week}x por semana
              </Badge>
              {activeProgram.plan_data?.goal && (
                <Badge variant="outline" className="border-white/40 bg-white/10 text-white">
                  {activeProgram.plan_data.goal}
                </Badge>
              )}
            </div>
          </div>

          <div className="w-full md:w-64 h-36 md:h-40 rounded-2xl bg-white/10 shadow-lg overflow-hidden flex items-center justify-center">
            <img
              src="/placeholder.svg"
              alt="Ilustração de treino"
              className="w-full h-full object-cover opacity-95"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm hover:bg-white/25 transition-colors"
          >
            <History className="w-3 h-3" />
            {showHistory ? 'Ocultar histórico' : 'Ver histórico'}
          </button>
        </section>

        {/* Bloco 1 – Programa ativo resumido abaixo do hero */}
        <section className="bg-card rounded-xl border p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Seu programa atual
              </p>
              <h3 className="text-xl font-bold">Resumo do progresso</h3>
            </div>

            <div className="w-full md:w-72 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Progresso do programa</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />

              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                <div className="bg-muted rounded-lg p-2">
                  <div className="font-semibold text-orange-600">
                    {activeProgram.current_week}/{activeProgram.duration_weeks}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Semanas</div>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <div className="font-semibold text-orange-600">
                    {activeProgram.completed_workouts}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Treinos feitos</div>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <div className="font-semibold text-orange-600">
                    {activeProgram.workouts_per_week}x
                  </div>
                  <div className="text-[11px] text-muted-foreground">por semana</div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => pauseProgram(activeProgram.id)}
                className="w-full mt-2"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pausar programa
              </Button>
            </div>
          </div>
        </section>

        {/* Bloco 2 – Treino de hoje em destaque */}
        {nextWorkoutActivity && (
          <section className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300 font-semibold mb-1">
                  Treino de hoje
                </p>
                <p className="font-semibold text-sm md:text-base">{nextWorkoutActivity}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Semana {activeProgram.current_week} · {activeProgram.workouts_per_week}x/semana
                </p>
              </div>
            </div>

            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4"
              onClick={() => {
                const dayIndex = nextWorkoutIndex >= 0 ? nextWorkoutIndex : 0;
                setStepDayIndex(dayIndex);
                setStepModalOpen(true);
              }}
            >
              <Play className="w-4 h-4 mr-1" />
              Começar treino
            </Button>
          </section>
        )}

        {/* Bloco 3 – Motivação diária da IA */}
        {dailyMotivation && (
          <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-5 border border-purple-200/70 dark:border-purple-800/70">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  Motivação do Dia
                </h3>
                <p className="text-sm italic">{dailyMotivation}</p>
              </div>
            </div>
          </section>
        )}

        {/* Bloco 4 – Recomendações da IA */}
        {aiRecommendation && (
          <section className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950 rounded-lg p-6 border-2 border-cyan-200 dark:border-cyan-800">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-cyan-600" />
                <h3 className="font-bold text-lg">Análise Inteligente (IA)</h3>
                {aiLoading && (
                  <span className="text-sm text-muted-foreground">Analisando...</span>
                )}
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
          </section>
        )}

        {/* Bloco 5 – Visualização detalhada do programa */}
        <ExerciseDetailView
          workoutData={{
            title: activeProgram.plan_name,
            description: activeProgram.plan_data?.description || '',
            location: activeProgram.plan_data?.location || 'casa',
            duration: activeProgram.plan_data?.weeks?.[0]?.days || 'N/A',
            frequency: `${activeProgram.workouts_per_week}x por semana`,
            goal: activeProgram.plan_data?.goal || '',
            weekPlan: transformWeeksToWeekPlan(activeProgram.plan_data?.weeks || []),
          }}
          location={activeProgram.plan_data?.location === 'academia' ? 'academia' : 'casa'}
        />

        {/* Modal passo a passo do treino */}
        {activeProgram &&
          currentWeekData &&
          stepDayIndex !== null &&
          stepDayIndex >= 0 && (
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
                  { activity: currentWeekData.activities[stepDayIndex] },
                );
              }}
            />
          )}

        {/* Histórico */}
        {showHistory && (
          <section className="bg-card rounded-lg p-6 border space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico de Programas
            </h3>

            <div className="space-y-3">
              {programs.map((program) => {
                const programProgress =
                  (program.completed_workouts / program.total_workouts) * 100;

                return (
                  <div key={program.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{program.plan_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {program.duration_weeks} semanas • {program.workouts_per_week}x/semana
                        </p>
                      </div>
                      <Badge
                        variant={
                          program.status === 'completed'
                            ? 'default'
                            : program.status === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {program.status === 'completed'
                          ? 'Concluído'
                          : program.status === 'active'
                          ? 'Ativo'
                          : 'Pausado'}
                      </Badge>
                    </div>

                    <Progress value={programProgress} className="h-2" />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {program.completed_workouts}/{program.total_workouts} treinos (
                        {Math.round(programProgress)}%)
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
          </section>
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

      <div className="space-y-4">
        {programs.map((program) => (
          <div key={program.id} className="bg-card rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{program.plan_name}</h3>
                <p className="text-muted-foreground">{program.plan_data?.description}</p>
              </div>
              <Badge variant="secondary">Pausado</Badge>
            </div>

            <ExerciseDetailView
              workoutData={{
                title: program.plan_name,
                description: program.plan_data?.description || '',
                location: program.plan_data?.location || 'casa',
                duration: program.plan_data?.weeks?.[0]?.days || 'N/A',
                frequency: `${program.workouts_per_week}x por semana`,
                goal: program.plan_data?.goal || '',
                weekPlan: transformWeeksToWeekPlan(program.plan_data?.weeks || []),
              }}
              location={program.plan_data?.location === 'academia' ? 'academia' : 'casa'}
            />
          </div>
        ))}
      </div>

      <ExerciseOnboardingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={user}
      />
    </div>
  );
};
