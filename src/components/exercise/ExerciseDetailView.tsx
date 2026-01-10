import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  Dumbbell,
  Calendar,
  Target,
  ChevronDown,
  ChevronUp,
  Info,
  Play,
  Flame,
  Timer,
} from 'lucide-react';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { exerciseInstructions } from '@/data/exercise-instructions';

interface ExerciseDetailViewProps {
  workoutData?: any;
  location?: 'casa' | 'academia';
}

export const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({
  workoutData,
  location = 'casa',
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const mockWorkoutData = {
    title: '💪 Seu Treino em Casa',
    description: 'Programa personalizado para perda de peso',
    location: location,
    duration: '30 min/dia',
    frequency: '5 dias/semana',
    goal: 'Perder Peso',
    weekPlan: [
      {
        day: 'Segunda-feira',
        focus: 'Membros Inferiores + Cardio',
        exercises: [
          { name: 'Subir Escada', sets: '3', reps: '30 segundos', completed: false },
          { name: 'Agachamento com Cadeira', sets: '4', reps: '15 repetições', completed: true },
          { name: 'Elevação de Panturrilha', sets: '3', reps: '20 repetições', completed: false },
          { name: 'Polichinelos', sets: '3', reps: '30 segundos', completed: false },
        ],
      },
      {
        day: 'Terça-feira',
        focus: 'Membros Superiores',
        exercises: [
          { name: 'Flexão de Braço', sets: '4', reps: '10-12 repetições', completed: false },
          { name: 'Remada com Cabo de Vassoura', sets: '3', reps: '15 repetições', completed: false },
          { name: 'Mergulho na Cadeira (Tríceps)', sets: '3', reps: '12 repetições', completed: false },
          { name: 'Prancha Isométrica', sets: '3', reps: '30 segundos', completed: false },
        ],
      },
      {
        day: 'Quarta-feira',
        focus: 'Abdômen + Cardio',
        exercises: [
          { name: 'Abdominal Crunch', sets: '4', reps: '20 repetições', completed: false },
          { name: 'Bicicleta no Ar', sets: '3', reps: '30 segundos', completed: false },
          { name: 'Corrida na Escada', sets: '4', reps: '30 segundos', completed: false },
          { name: 'Mountain Climbers', sets: '3', reps: '20 repetições', completed: false },
        ],
      },
      {
        day: 'Quinta-feira',
        focus: 'Corpo Inteiro (Full Body)',
        exercises: [
          { name: 'Burpees', sets: '3', reps: '10 repetições', completed: false },
          { name: 'Avanço (Lunges)', sets: '3', reps: '12 por perna', completed: false },
          { name: 'Flexão com Joelho', sets: '3', reps: '15 repetições', completed: false },
          { name: 'Prancha Lateral', sets: '3', reps: '20seg cada lado', completed: false },
        ],
      },
      {
        day: 'Sexta-feira',
        focus: 'HIIT Intenso',
        exercises: [
          { name: 'HIIT Circuito', sets: '4', reps: '40seg trabalho / 20seg descanso', completed: false },
          { name: 'Corrida Parada', sets: '-', reps: 'Incluído no circuito', completed: false },
          { name: 'Agachamento Saltado', sets: '-', reps: 'Incluído no circuito', completed: false },
          { name: 'Alongamento Final', sets: '1', reps: '5 minutos relaxamento', completed: false },
        ],
      },
    ],
  };

  const data = workoutData || mockWorkoutData;

  if (!data.weekPlan || !Array.isArray(data.weekPlan)) {
    data.weekPlan = [];
  }

  const toggleDayExpansion = (dayIndex: number) => {
    if (expandedDay === dayIndex) {
      setExpandedDay(null);
    } else {
      setExpandedDay(dayIndex);
    }
  };

  const openExerciseDetails = (exercise: any) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const markExerciseCompleted = (dayIndex: number, exerciseIndex: number) => {
    console.log(`Marcando exercício ${exerciseIndex} do dia ${dayIndex} como concluído`);
  };

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  const hasWeekPlan = data.weekPlan && Array.isArray(data.weekPlan) && data.weekPlan.length > 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-emerald-600" />
            {data.title}
          </h2>
          <p className="text-muted-foreground">{data.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-primary">
            {data.location === 'casa' ? '🏠 Em Casa' : '🏋️ Academia'}
          </Badge>
          <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-primary">
            <Clock className="w-4 h-4 mr-1" />
            {data.duration}
          </Badge>
          <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-primary">
            <Calendar className="w-4 h-4 mr-1" />
            {data.frequency}
          </Badge>
          <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-primary">
            <Target className="w-4 h-4 mr-1" />
            {data.goal}
          </Badge>
        </div>
      </div>

      {/* Alerta de treino atual */}
      {hasWeekPlan && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
                Treino de Hoje: {data.weekPlan[todayIndex]?.day || 'Descanso'}
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                {data.weekPlan[todayIndex]?.focus || 'Dia de recuperação. Aproveite para descansar!'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de dias de treino – carrossel horizontal (estilo Netflix) */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {hasWeekPlan ? (
          data.weekPlan.map((day, dayIndex) => (
            <Card
              key={dayIndex}
              className={`min-w-[260px] max-w-xs transition-all duration-300 flex-shrink-0 ${
                dayIndex === todayIndex ? 'border-primary shadow-sm' : ''
              }`}
            >
              <CardContent className="p-0">
                {/* Cabeçalho do dia */}
                <div
                  className={`p-4 flex items-center justify-between cursor-pointer ${
                    dayIndex === todayIndex
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950'
                      : ''
                  }`}
                  onClick={() => toggleDayExpansion(dayIndex)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        dayIndex === todayIndex
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      {dayIndex === todayIndex ? (
                        <Flame className="w-5 h-5" />
                      ) : (
                        <Calendar className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {day.day}
                        {dayIndex === todayIndex && <Badge className="bg-green-500">Hoje</Badge>}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{day.focus}</p>
                    </div>
                  </div>
                  {expandedDay === dayIndex ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {/* Detalhes dos exercícios (expandidos) */}
                {expandedDay === dayIndex && (
                  <div className="p-4 border-t space-y-3">
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <div
                        key={exerciseIndex}
                        className={`p-3 rounded-lg border ${
                          exercise.completed
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                            : 'bg-white dark:bg-gray-900'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white">
                              <Dumbbell className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{exercise.name}</h4>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                <Badge variant="outline" className="bg-white/50 dark:bg-black/20">
                                  <Flame className="w-3 h-3 mr-1" />
                                  {exercise.sets} séries
                                </Badge>
                                <Badge variant="outline" className="bg-white/50 dark:bg-black/20">
                                  <Timer className="w-3 h-3 mr-1" />
                                  {exercise.reps}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openExerciseDetails(exercise)}
                          >
                            <Info className="w-4 h-4 mr-1" />
                            Detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant={exercise.completed ? 'outline' : 'default'}
                            className={exercise.completed ? 'bg-green-500/10 text-green-700' : ''}
                            onClick={() => markExerciseCompleted(dayIndex, exerciseIndex)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            {exercise.completed ? 'Concluído' : 'Marcar como feito'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            Nenhum plano de treino definido para esta semana.
          </p>
        )}
      </div>

      {selectedExercise && (
        <ExerciseDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          exerciseData={selectedExercise}
          location={location}
        />
      )}
    </div>
  );
};
