import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Info,
  Lightbulb,
  Pause,
  Play,
  RefreshCw,
  Repeat,
  Target,
  Timer,
  WifiOff,
  ThumbsUp,
  ThumbsDown,
  Home,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useToast } from '@/hooks/use-toast';
import { useRealTimeHeartRate } from '@/hooks/useRealTimeHeartRate';
import { extractYouTubeId, formatDifficulty } from '@/lib/exercise-format';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseData: any;
  location?: 'casa' | 'academia';
}

type Step = 'overview' | 'instructions' | 'execution';

function asText(input: unknown): string {
  if (input == null) return '';
  if (Array.isArray(input)) return input.filter(Boolean).join(' ');
  return String(input);
}

function asStringList(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String).filter(Boolean);
  return [String(input)].filter(Boolean);
}

// Cria resumo inteligente da descrição
function createSummary(description: string, maxLength = 120): string {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  const trimmed = description.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  return trimmed.substring(0, lastSpace > 80 ? lastSpace : maxLength) + '...';
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  isOpen,
  onClose,
  exerciseData,
  location = 'casa',
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>('overview');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [userFeedback, setUserFeedback] = useState<'facil' | 'medio' | 'dificil' | null>(null);
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const exerciseId = useMemo(() => exerciseData?.id || '', [exerciseData]);

  const saveDifficultyFeedback = async (perceived: 'facil' | 'medio' | 'dificil') => {
    if (!exerciseId || feedbackSaving) return;
    
    setFeedbackSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_exercise_feedback')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          exercise_name: name,
          perceived_difficulty: perceived,
          expected_difficulty: difficultyRaw,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,exercise_id' });

      if (error) throw error;
      
      setUserFeedback(perceived);
      toast({ 
        title: 'Feedback registrado!', 
        description: 'Obrigado por nos ajudar a personalizar seu treino.',
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
    } finally {
      setFeedbackSaving(false);
    }
  };

  const {
    heartRate,
    isLoading: isHeartRateLoading,
    isConnected: isGoogleFitConnected,
    sync: syncHeartRate,
  } = useRealTimeHeartRate(isOpen && currentStep === 'execution');

  const name = useMemo(() => asText(exerciseData?.name) || 'Exercício', [exerciseData]);
  const description = useMemo(
    () => asText(exerciseData?.descricao ?? exerciseData?.description),
    [exerciseData]
  );
  const descriptionSummary = useMemo(() => createSummary(description), [description]);

  const sets = useMemo(() => asText(exerciseData?.series ?? exerciseData?.sets) || '3', [exerciseData]);
  const reps = useMemo(() => asText(exerciseData?.repeticoes ?? exerciseData?.reps) || '12', [exerciseData]);
  const rest = useMemo(
    () => asText(exerciseData?.descanso ?? exerciseData?.rest_time) || '60s',
    [exerciseData]
  );

  const totalSets = useMemo(() => {
    const nums = (sets.match(/\d+/g) || [])
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n) && n > 0);
    return nums.length ? Math.max(...nums) : 3;
  }, [sets]);

  const instructions = useMemo(
    () => asStringList(exerciseData?.instrucoes ?? exerciseData?.instructions),
    [exerciseData]
  );

  const tips = useMemo(() => asStringList(exerciseData?.dicas ?? exerciseData?.tips), [exerciseData]);

  const videoUrl = useMemo(
    () =>
      asText(
        exerciseData?.youtubeUrl ??
          exerciseData?.youtube_url ??
          exerciseData?.video_url ??
          exerciseData?.videoUrl
      ),
    [exerciseData]
  );

  const videoId = useMemo(() => extractYouTubeId(videoUrl), [videoUrl]);

  const difficultyRaw = useMemo(
    () => asText(exerciseData?.nivel ?? exerciseData?.difficulty),
    [exerciseData]
  );
  const diff = useMemo(() => formatDifficulty(difficultyRaw), [difficultyRaw]);

  const difficultyProgress = useMemo(() => {
    if (diff.tone === 'easy') return 35;
    if (diff.tone === 'medium') return 60;
    if (diff.tone === 'hard') return 90;
    return 60;
  }, [diff.tone]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep('overview');
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setCurrentSet(1);
    setUserFeedback(null);
    setShowFullDescription(false);
  }, [isOpen, name]);

  useEffect(() => {
    if (!isOpen || !exerciseId) return;
    
    const loadFeedback = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('user_exercise_feedback')
          .select('perceived_difficulty')
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId)
          .maybeSingle();

        if (data?.perceived_difficulty) {
          setUserFeedback(data.perceived_difficulty as 'facil' | 'medio' | 'dificil');
        }
      } catch (error) {
        console.error('Error loading feedback:', error);
      }
    };
    
    loadFeedback();
  }, [isOpen, exerciseId]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsTimerRunning((prev) => !prev);
  const resetTimer = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  const startExecution = () => {
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setCurrentSet(1);
    setCurrentStep('execution');
    if (isGoogleFitConnected) syncHeartRate();
  };

  const renderVideoBlock = () => (
    <div className="rounded-xl overflow-hidden bg-muted/50 shadow-sm">
      {videoId ? (
        <div className="relative w-full pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={`Vídeo: ${name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
        </div>
      )}
    </div>
  );

  const FeedbackButtons = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => {
    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
    const textSize = size === 'sm' ? 'text-[9px]' : 'text-xs';
    const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => saveDifficultyFeedback('facil')}
          disabled={feedbackSaving}
          className={`flex flex-col items-center ${padding} rounded-lg transition-all ${
            userFeedback === 'facil' 
              ? 'bg-green-500/20 text-green-600 ring-1 ring-green-500/50' 
              : 'hover:bg-green-500/10 text-muted-foreground hover:text-green-600'
          }`}
        >
          <ThumbsUp className={iconSize} />
          <span className={`${textSize} font-medium mt-0.5`}>Fácil</span>
        </button>
        <button
          onClick={() => saveDifficultyFeedback('medio')}
          disabled={feedbackSaving}
          className={`flex flex-col items-center ${padding} rounded-lg transition-all ${
            userFeedback === 'medio' 
              ? 'bg-yellow-500/20 text-yellow-600 ring-1 ring-yellow-500/50' 
              : 'hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-600'
          }`}
        >
          <Target className={iconSize} />
          <span className={`${textSize} font-medium mt-0.5`}>Ok</span>
        </button>
        <button
          onClick={() => saveDifficultyFeedback('dificil')}
          disabled={feedbackSaving}
          className={`flex flex-col items-center ${padding} rounded-lg transition-all ${
            userFeedback === 'dificil' 
              ? 'bg-red-500/20 text-red-600 ring-1 ring-red-500/50' 
              : 'hover:bg-red-500/10 text-muted-foreground hover:text-red-600'
          }`}
        >
          <ThumbsDown className={iconSize} />
          <span className={`${textSize} font-medium mt-0.5`}>Difícil</span>
        </button>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Header elegante */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground leading-tight">{name}</h2>
          <Badge 
            variant="secondary" 
            className="shrink-0 gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border-0"
          >
            {location === 'casa' ? <Home className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
            {location === 'casa' ? 'Casa' : 'Academia'}
          </Badge>
        </div>
        
        {/* Descrição resumida com expansão */}
        {description && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {showFullDescription ? description : descriptionSummary}
            </p>
            {description.length > 120 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                {showFullDescription ? (
                  <>Ver menos <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Ver mais <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Vídeo */}
      {renderVideoBlock()}

      {/* Stats em cards elegantes */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20">
          <CardContent className="p-3 text-center">
            <Repeat className="w-5 h-5 mx-auto mb-1 text-orange-600" />
            <div className="text-lg font-bold text-orange-700 dark:text-orange-400">{sets}</div>
            <div className="text-[10px] text-orange-600/70 dark:text-orange-400/70 font-medium">Séries</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold text-blue-700 dark:text-blue-400">{reps}</div>
            <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-medium">Repetições</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-purple-600" />
            <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{rest}</div>
            <div className="text-[10px] text-purple-600/70 dark:text-purple-400/70 font-medium">Descanso</div>
          </CardContent>
        </Card>
      </div>

      {/* Dificuldade e Feedback */}
      <Card className="border-0 bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">Dificuldade:</span>
              <Badge variant="outline" className="text-xs">
                {diff.label || difficultyRaw || 'Médio'}
              </Badge>
            </div>
            <FeedbackButtons size="sm" />
          </div>
          <Progress value={difficultyProgress} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Instruções - exibidas diretamente */}
      {instructions.length > 0 && (
        <Card className="border-0 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700 dark:text-green-400">
                Passo a Passo
              </span>
            </div>
            <div className="space-y-2">
              {instructions.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas - exibidas diretamente */}
      {tips.length > 0 && (
        <Card className="border-0 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-700 dark:text-blue-400">
                Dicas do Personal
              </span>
            </div>
            <div className="space-y-2">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2"
                >
                  <Flame className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão principal */}
      <Button
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25"
        onClick={startExecution}
      >
        <Play className="w-5 h-5 mr-2" />
        Começar Exercício
      </Button>
    </div>
  );

  const renderExecution = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{name}</h2>
        <Button variant="ghost" size="sm" onClick={() => setCurrentStep('overview')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      {renderVideoBlock()}

      {/* Timer elegante */}
      <Card className="border-0 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50">
        <CardContent className="p-4 text-center space-y-3">
          <Timer className="w-8 h-8 mx-auto text-orange-600" />
          <div className="text-4xl font-bold text-orange-600">{formatTime(timerSeconds)}</div>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              onClick={toggleTimer}
              className="px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isTimerRunning ? <><Pause className="w-4 h-4 mr-1" />Pausar</> : <><Play className="w-4 h-4 mr-1" />Iniciar</>}
            </Button>
            <Button size="sm" onClick={resetTimer} variant="outline">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
            <p className="text-xs text-muted-foreground mb-2">Como foi?</p>
            <FeedbackButtons size="md" />
          </div>
        </CardContent>
      </Card>

      {/* Heart Rate */}
      <Card className="border-0 bg-muted/30">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className={`w-6 h-6 ${heartRate.current > 0 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
            <div>
              <div className="font-semibold">
                {isGoogleFitConnected ? (heartRate.current > 0 ? `${heartRate.current} bpm` : '--') : 'Não conectado'}
              </div>
              <div className="text-xs text-muted-foreground">Frequência Cardíaca</div>
            </div>
          </div>
          {!isGoogleFitConnected && (
            <Button size="sm" variant="outline" onClick={() => navigate('/google-fit-oauth?auto=1')}>
              Conectar
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Série atual */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Série {currentSet} de {totalSets}</span>
          <span className="text-muted-foreground">{reps} repetições</span>
        </div>
        <Progress value={(currentSet / Math.max(1, totalSets)) * 100} className="h-2" />
      </div>

      {/* Controles */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          disabled={currentSet <= 1}
          onClick={() => setCurrentSet((prev) => Math.max(1, prev - 1))}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          onClick={() => {
            if (currentSet < totalSets) {
              toast({
                title: `Série ${currentSet} concluída!`,
                description: `Descanse ${rest} e siga para a próxima.`,
              });
              setCurrentSet((prev) => Math.min(totalSets, prev + 1));
              return;
            }
            toast({ title: '✅ Exercício concluído!', description: 'Boa! Vamos para o próximo.' });
            onClose();
          }}
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Concluir
        </Button>
        <Button
          variant="outline"
          disabled={currentSet >= totalSets}
          onClick={() => setCurrentSet((prev) => Math.min(totalSets, prev + 1))}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md p-0 gap-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            Detalhes do Exercício
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-60px)]">
          <div className="p-4">
            {currentStep === 'overview' && renderOverview()}
            {currentStep === 'execution' && renderExecution()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
