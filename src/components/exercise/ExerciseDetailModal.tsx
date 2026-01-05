import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Info,
  Pause,
  Play,
  RefreshCw,
  Repeat,
  Target,
  Timer,
  WifiOff,
  ThumbsUp,
  ThumbsDown,
  Minus,
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
  // If it's a long string, keep as single bullet.
  return [String(input)].filter(Boolean);
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

  const exerciseId = useMemo(() => exerciseData?.id || '', [exerciseData]);

  // Salvar feedback de dificuldade do usuário
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

  // Hook para frequência cardíaca (Google Fit)
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

  // Reset ao abrir
  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep('overview');
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setCurrentSet(1);
    setUserFeedback(null);
  }, [isOpen, name]);

  // Carregar feedback existente
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

  // Cronômetro
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
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

    // Ao iniciar o exercício, puxa o dado mais recente do Google Fit (se conectado)
    if (isGoogleFitConnected) {
      syncHeartRate();
    }
  };

  const renderVideoBlock = () => (
    <div className="rounded-xl overflow-hidden bg-black/80">
      {videoId ? (
        <div className="relative w-full pt-[50%]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={`Vídeo do exercício: ${name}`}
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

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">{name}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
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
            <div className="text-sm font-semibold">{sets}</div>
            <div className="text-[10px] text-muted-foreground">Séries</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 dark:bg-black/20">
          <CardContent className="p-2.5 text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-orange-600" />
            <div className="text-sm font-semibold">{reps}</div>
            <div className="text-[10px] text-muted-foreground">Repetições</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 dark:bg-black/20">
          <CardContent className="p-2.5 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-orange-600" />
            <div className="text-sm font-semibold">{rest}</div>
            <div className="text-[10px] text-muted-foreground">Descanso</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-1 mt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">Dificuldade</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{diff.label || difficultyRaw || '—'}</span>
            {/* Botões discretos de feedback */}
            <div className="flex items-center gap-0.5 opacity-50 hover:opacity-100 transition-opacity">
              <button
                onClick={() => saveDifficultyFeedback('facil')}
                disabled={feedbackSaving}
                className={`p-0.5 rounded transition-colors ${userFeedback === 'facil' ? 'text-green-500' : 'text-muted-foreground hover:text-green-500'}`}
                title="Achei fácil"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => saveDifficultyFeedback('medio')}
                disabled={feedbackSaving}
                className={`p-0.5 rounded transition-colors ${userFeedback === 'medio' ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                title="Moderado"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => saveDifficultyFeedback('dificil')}
                disabled={feedbackSaving}
                className={`p-0.5 rounded transition-colors ${userFeedback === 'dificil' ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                title="Achei difícil"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        <Progress value={difficultyProgress} className="h-1.5" />
      </div>

      <div className="flex justify-between gap-2 mt-2">
        <Button variant="outline" className="flex-1 py-2" onClick={() => setCurrentStep('instructions')}>
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

  const renderInstructions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">{name}</h2>
        <Button variant="ghost" size="sm" onClick={() => setCurrentStep('overview')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      {description && (
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-orange-600" />
            Descrição
          </h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      )}

      {instructions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-orange-600" />
            Passos de Execução
          </h3>
          <div className="space-y-2">
            {instructions.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-2 bg-white/50 dark:bg-black/20 p-3 rounded-lg"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tips.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
            <Flame className="w-5 h-5" />
            Dica do Personal
          </h3>
          <div className="space-y-1.5">
            {tips.map((tip, i) => (
              <p key={i} className="text-blue-700 dark:text-blue-300 text-sm">{tip}</p>
            ))}
          </div>
        </div>
      )}

      <Button
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        onClick={startExecution}
      >
        <Play className="w-4 h-4 mr-2" />
        Começar
      </Button>
    </div>
  );

  const renderExecution = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">{name}</h2>
        <Button variant="ghost" size="sm" onClick={() => setCurrentStep('overview')}>
          Voltar
        </Button>
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
        <CardContent className="p-3 text-center space-y-2">
          <div className="flex items-center justify-center gap-1">
            <Heart
              className={
                `w-5 h-5 ${heartRate.current > 0 ? 'text-red-500 animate-pulse' : 'text-orange-600'}`
              }
            />
            {isGoogleFitConnected && (
              <button
                onClick={syncHeartRate}
                disabled={isHeartRateLoading}
                className="p-0.5 hover:bg-muted rounded-full transition-colors"
                title="Sincronizar frequência cardíaca"
              >
                <RefreshCw
                  className={`w-3 h-3 text-muted-foreground ${isHeartRateLoading ? 'animate-spin' : ''}`}
                />
              </button>
            )}
          </div>

          {isGoogleFitConnected ? (
            <>
              <div className="text-base font-semibold">
                {heartRate.current > 0 ? `${heartRate.current} bpm` : '--'}
              </div>
              <div className="text-[11px] text-muted-foreground">Frequência Cardíaca</div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <WifiOff className="w-3 h-3" />
                <span className="text-xs">Sem conexão</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Conecte o Google Fit para ver dados reais
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast({
                    title: 'Conectar Google Fit',
                    description: 'Conecte para registrar dados do exercício automaticamente.',
                  });
                  navigate('/google-fit-oauth?auto=1');
                }}
                className="mx-auto"
              >
                Conectar
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">Série atual</span>
          <span className="text-muted-foreground">{currentSet}/{totalSets}</span>
        </div>
        <Progress value={(currentSet / Math.max(1, totalSets)) * 100} className="h-1.5" />
        <div className="text-[11px] text-muted-foreground">
          Repetições por série: <span className="font-medium text-foreground">{reps}</span>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <Button
          variant="outline"
          className="flex-1 py-2 text-xs"
          disabled={currentSet <= 1}
          onClick={() => setCurrentSet((prev) => Math.max(1, prev - 1))}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>
        <Button
          className="flex-1 py-2 text-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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
          Concluído
        </Button>
        <Button
          variant="outline"
          className="flex-1 py-2 text-xs"
          disabled={currentSet >= totalSets}
          onClick={() => setCurrentSet((prev) => Math.min(totalSets, prev + 1))}
        >
          Próximo
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-orange-600" />
              Detalhes do Exercício
            </span>
            {/* Mantemos o layout do topo (sem navegação global) */}
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'overview' && renderOverview()}
        {currentStep === 'instructions' && renderInstructions()}
        {currentStep === 'execution' && renderExecution()}
      </DialogContent>
    </Dialog>
  );
};
