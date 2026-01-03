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
  Pause
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
  location = 'casa'
}) => {
  const [currentStep, setCurrentStep] = useState<'overview' | 'instructions' | 'execution'>('overview');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Cronômetro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle timer
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // Reset timer
  const resetTimer = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  // Obter os exercícios com base na localização
  const exerciseList = location === 'casa' 
    ? Object.entries(exerciseInstructions.casa)
    : Object.entries(exerciseInstructions.academia);

  // Obter o exercício atual
  const currentExercise = exerciseList[currentExerciseIndex];

  // Sempre que abrir ou mudar o exercício selecionado, alinhar com a lista
  useEffect(() => {
    if (!exerciseData || exerciseList.length === 0) return;

    const names = exerciseList.map(([name]) => name);
    const idx = exerciseData.name ? names.indexOf(exerciseData.name) : -1;
    if (idx >= 0) {
      setCurrentExerciseIndex(idx);
    }
  }, [exerciseData, location]);

  // Navegar para o próximo exercício
  const nextExercise = () => {
    if (currentExerciseIndex < exerciseList.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      setCurrentExerciseIndex(0); // Voltar ao primeiro se estiver no último
    }
  };

  // Navegar para o exercício anterior
  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    } else {
      setCurrentExerciseIndex(exerciseList.length - 1); // Ir para o último se estiver no primeiro
    }
  };

  // Helper para extrair ID do YouTube a partir dos dados do exercício ou da base de instruções
  const getVideoId = () => {
    let raw = '';

    // 1) Tenta usar o vídeo associado ao exercício atual da base (casa/academia)
    if (currentExercise && currentExercise[1] && (currentExercise[1] as any).video_url) {
      raw = (currentExercise[1] as any).video_url as string;
    }

    // 2) Se ainda não tiver, tenta buscar pela combinação nome + local na base
    if (!raw && exerciseData && exerciseData.name) {
      const dict = location === 'casa' ? exerciseInstructions.casa : exerciseInstructions.academia;
      const fromDict = (dict as any)[exerciseData.name];
      if (fromDict && fromDict.video_url) {
        raw = fromDict.video_url as string;
      }
    }

    // 3) Por fim, tenta vir diretamente de campos de vídeo do exerciseData (vindo do admin)
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

  // Renderizar a visão geral do exercício
  const renderOverview = () => {
    if (!currentExercise) return <div>Carregando...</div>;
    const [exerciseName, exerciseDetails] = currentExercise;
    const videoId = getVideoId();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary">{exerciseName}</h2>
            <p className="text-muted-foreground">{exerciseDetails.descricao}</p>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            {location === 'casa' ? '🏠 Em Casa' : '🏋️ Academia'}
          </Badge>
        </div>

        {/* Vídeo do exercício */}
        <div className="rounded-xl overflow-hidden bg-black/80">
          {videoId ? (
            <div className="relative w-full pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Vídeo do exercício"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[220px] bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Dumbbell className="w-16 h-16 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white/50 dark:bg-black/20">
            <CardContent className="p-4 text-center">
              <Repeat className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-lg font-semibold">3-4</div>
              <div className="text-xs text-muted-foreground">Séries</div>
            </CardContent>
          </Card>
          <Card className="bg-white/50 dark:bg-black/20">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-lg font-semibold">12-15</div>
              <div className="text-xs text-muted-foreground">Repetições</div>
            </CardContent>
          </Card>
          <Card className="bg-white/50 dark:bg-black/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-lg font-semibold">60s</div>
              <div className="text-xs text-muted-foreground">Descanso</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Dificuldade</span>
            <span className="text-muted-foreground">Intermediário</span>
          </div>
          <Progress value={60} className="h-2" />
        </div>

        <div className="flex justify-between gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setCurrentStep('instructions')}
          >
            <Info className="w-4 h-4 mr-2" />
            Instruções
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            onClick={() => setCurrentStep('execution')}
          >
            <Play className="w-4 h-4 mr-2" />
            Começar
          </Button>
        </div>
      </div>
    );
  };

  // Renderizar as instruções do exercício
  const renderInstructions = () => {
    if (!currentExercise) return <div>Carregando...</div>;
    
    const [exerciseName, exerciseDetails] = currentExercise;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">{exerciseName}</h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentStep('overview')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
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
                <div key={index} className="flex items-start gap-2 bg-white/50 dark:bg-black/20 p-3 rounded-lg">
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
          onClick={() => setCurrentStep('execution')}
        >
          <Play className="w-4 h-4 mr-2" />
          Começar
        </Button>
      </div>
    );
  };

  // Renderizar a execução do exercício
  const renderExecution = () => {
    if (!currentExercise) return <div>Carregando...</div>;
    
    const [exerciseName, exerciseDetails] = currentExercise;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">{exerciseName}</h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentStep('overview')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-4">
            <Dumbbell className="w-12 h-12 text-white" />
          </div>
          <p className="text-center text-muted-foreground">
            Animação/Imagem da execução do exercício seria exibida aqui.
          </p>
        </div>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-2 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6 text-center">
            <Timer className="w-8 h-8 mx-auto mb-3 text-orange-600" />
            <div className="text-4xl font-bold text-orange-600 mb-2">{formatTime(timerSeconds)}</div>
            <div className="text-sm text-muted-foreground mb-4">Tempo Restante</div>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={toggleTimer}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button
                onClick={resetTimer}
                variant="outline"
              >
                Resetar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-black/20">
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <div className="text-lg font-semibold">120 bpm</div>
            <div className="text-xs text-muted-foreground">Frequência Cardíaca</div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Progresso da Série</span>
            <span className="text-muted-foreground">8/12 repetições</span>
          </div>
          <Progress value={66} className="h-2" />
        </div>

        <div className="flex justify-between gap-4">
          <Button variant="outline" className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Concluído
          </Button>
          <Button variant="outline" className="flex-1">
            <ArrowRight className="w-4 h-4 ml-2 order-2" />
            <span className="order-1">Próximo</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-orange-600" />
              Detalhes do Exercício
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prevExercise}
                className="h-10 w-10"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextExercise}
                className="h-10 w-10"
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
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

