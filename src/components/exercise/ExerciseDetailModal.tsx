import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Info,
  Target,
  ArrowLeft,
  ArrowRight,
  Repeat,
  Timer,
  Play,
  Heart,
  Pause,
} from 'lucide-react';
import { exerciseInstructions } from '@/data/exercise-instructions';

interface ExerciseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseData: any;
  location?: 'casa' | 'academia';
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  isOpen,
  onClose,
  exerciseData,
  location = 'casa',
}) => {
  const [currentStep, setCurrentStep] = useState<'overview' | 'instructions' | 'execution'>('overview');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Cronômetro
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  // Inicia a execução: muda passo, zera e já começa o timer
  const startExecution = () => {
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setCurrentStep('execution');
  };

  // Obter os exercícios com base na localização
  const exerciseList =
    location === 'casa'
      ? Object.entries(exerciseInstructions.casa)
      : Object.entries(exerciseInstructions.academia);

  // Exercício atual
  const currentExercise = exerciseList[currentExerciseIndex];

  // Sincroniza índice com o exercício recebido por props
  useEffect(() => {
    if (!exerciseData || exerciseList.length === 0) return;

    const names = exerciseList.map(([name]) => name);
    const idx = exerciseData.name ? names.indexOf(exerciseData.name) : -1;
    if (idx >= 0) {
      setCurrentExerciseIndex(idx);
    }
  }, [exerciseData, location, exerciseList.length]);

  const nextExercise = () => {
    setCurrentExerciseIndex((prev) => (prev < exerciseList.length - 1 ? prev + 1 : 0));
  };

  const prevExercise = () => {
    setCurrentExerciseIndex((prev) => (prev > 0 ? prev - 1 : exerciseList.length - 1));
  };

  // Helper para extrair ID do YouTube
  const getVideoId = () => {
    let raw = '';

    if (currentExercise && currentExercise[1] && (currentExercise[1] as any).video_url) {
      raw = (currentExercise[1] as any).video_url as string;
    }

    if (!raw && exerciseData && exerciseData.name) {
      const dict = location === 'casa' ? exerciseInstructions.casa : exerciseInstructions.academia;
      const fromDict = (dict as any)[exerciseData.name];
      if (fromDict && fromDict.video_url) {
        raw = fromDict.video_url as string;
      }
    }

    if (!raw && exerciseData) {
      raw = (exerciseData.video_url || exerciseData.youtube_url || '') as string;
    }

    if (!raw) return null;
    const match = raw.match(/https?:\/\/[\w./?=&%-]+/i);
    if (!match) return null;
    const url = new URL(match[0]);
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v');
    if (url.hostname.includes('youtu.be')) return url.pathname.replace('/', '');
    return null;
  };

  const renderVideoBlock = () => {
    const videoId = getVideoId();

    return (
      <div className="rounded-xl overflow-hidden bg-black/80">
        {videoId ? (
          <div className="relative w-full pt-[50%]">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Vídeo do exercício"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[200px] bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <Dumbbell className="w-14 h-14 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Visão geral
  const renderOverview = () => {
    if (!currentExercise) return <div>Carregando...</div>;
    const [exerciseName, exerciseDetails] = currentExercise as [string, any];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary">{exerciseName}</h2>
            <p className="text-muted-foreground">{exerciseDetails.descricao}</p>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            {location === 'casa' ? '🏠 Em Casa' : '🏋️ Academia'}
          </Badge>
        </div>

        {renderVideoBlock()}

        <div className="grid grid-cols-3 gap-2 mt-2">
          <Card className="bg-white/50 dark:bg-black/20">
            <CardContent className="p-2.5 text-center">
              <Repeat className="w-5 h-5 mx-auto mb-1 text-orange-600" />
              <div className="text-sm font-semibold">3-4</div>
              <div className="text-[10px] text-muted-foreground">Séries</div>
            </CardContent>
          </Card>
          <Card className="bg-white/50 dark:bg-black/20">
            <CardContent className="p-2.5 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-orange-600" />
              <div className="text-sm font-semibold">12-15</div>
              <div className="text-[10px] text-muted-foreground">Repetições</div>
            </CardContent>
          </Card>
          <Card className="bg-white/50 dark:bg-black/20">
            <CardContent className="p-2.5 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-orange-600" />
              <div className="text-sm font-semibold">60s</div>
              <div className="text-[10px] text-muted-foreground">Descanso</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-1 mt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Dificuldade</span>
            <span className="text-muted-foreground">Intermediário</span>
          </div>
          <Progress value={60} className="h-1.5" />
        </div>

        <div className="flex justify-between gap-2 mt-2">
          <Button
            variant="outline"
            className="flex-1 py-2"
            onClick={() => setCurrentStep('instructions')}
          >
            <Info className="w-4 h-4 mr-1" />
            Instruções
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-2"
            onClick={startExecution}
          >
            <Play className="w-4 h-4 mr-1" />
            Começar
          </Button>
        </div>
      </div>
    );
  };

  // Instruções detalhadas
  const renderInstructions = () => {
    if (!currentExercise) return <div>Carregando...</div>;
    const [exerciseName, exerciseDetails] = currentExercise as [string, any];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">{exerciseName}</h2>
        </div>


        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-orange-600" />
              Descrição
            </h3>
            <p className="text-muted-foreground">{exerciseDetails.descricao}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-600" />
              Passos de Execução
            </h3>
            <div className="space-y-2">
              {exerciseDetails.passos.map((passo: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-2 bg-white/50 dark:bg-black/20 p-3 rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{passo}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
              <Flame className="w-5 h-5" />
              Dica do Personal
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">{exerciseDetails.dicas}</p>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          onClick={startExecution}
        >
          <Play className="w-4 h-4 mr-2" />
          Começar
        </Button>
      </div>
    );
  };

  // Execução: vídeo em cima, timer logo abaixo
  const renderExecution = () => {
    if (!currentExercise) return <div>Carregando...</div>;
    const [exerciseName] = currentExercise as [string, any];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">{exerciseName}</h2>
        </div>


        {renderVideoBlock()}

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800">
          <CardContent className="p-3 text-center space-y-2">
            <Timer className="w-6 h-6 mx-auto text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">{formatTime(timerSeconds)}</div>
            <div className="text-[11px] text-muted-foreground">Tempo de exercício</div>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                onClick={toggleTimer}
                className="px-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button size="sm" onClick={resetTimer} variant="outline" className="px-3">
                Resetar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-black/20">
          <CardContent className="p-3 text-center space-y-1">
            <Heart className="w-5 h-5 mx-auto text-orange-600" />
            <div className="text-base font-semibold">120 bpm</div>
            <div className="text-[11px] text-muted-foreground">Frequência Cardíaca</div>
          </CardContent>
        </Card>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Progresso da Série</span>
            <span className="text-muted-foreground">8/12 repetições</span>
          </div>
          <Progress value={66} className="h-1.5" />
        </div>

        <div className="flex justify-between gap-2">
          <Button variant="outline" className="flex-1 py-2 text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          <Button className="flex-1 py-2 text-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Concluído
          </Button>
          <Button variant="outline" className="flex-1 py-2 text-xs">
            <ArrowRight className="w-4 h-4 ml-1" />
            Próximo
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Detalhes do</p>
                  <p className="text-2xl font-bold leading-tight">Exercício</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              </div>

              <div className="flex items-center">
                <div className="flex flex-col items-center justify-center rounded-full border px-3 py-2 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-7 w-7 rounded-full"
                  >
                    <span className="sr-only">Fechar</span>
                    ✕
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prevExercise}
                      className="h-7 w-7 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={nextExercise}
                      className="h-7 w-7 rounded-full"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'overview' && renderOverview()}
        {currentStep === 'instructions' && renderInstructions()}
        {currentStep === 'execution' && renderExecution()}
      </DialogContent>
    </Dialog>
  );
};
