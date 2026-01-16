// ============================================
// 🏋️ EXERCISE EXECUTION
// Tela de execução com timer e séries
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Pause,
  Play,
  RefreshCw,
  Timer,
} from 'lucide-react';
import { VideoBlock } from './VideoBlock';
import { DifficultyFeedback, type DifficultyFeedback as FeedbackType } from './DifficultyFeedback';

interface ExerciseExecutionProps {
  name: string;
  videoId: string | null;
  timerSeconds: number;
  isTimerRunning: boolean;
  currentSet: number;
  totalSets: number;
  reps: string;
  heartRate: {
    current: number;
    isConnected: boolean;
    isLoading: boolean;
  };
  userFeedback: FeedbackType | null;
  feedbackSaving: boolean;
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onPrevSet: () => void;
  onNextSet: () => void;
  onCompleteSet: () => void;
  onGoBack: () => void;
  onConnectGoogleFit: () => void;
  onSaveFeedback: (feedback: FeedbackType) => void;
}

export const ExerciseExecution: React.FC<ExerciseExecutionProps> = ({
  name,
  videoId,
  timerSeconds,
  isTimerRunning,
  currentSet,
  totalSets,
  reps,
  heartRate,
  userFeedback,
  feedbackSaving,
  formatTime,
  onToggleTimer,
  onResetTimer,
  onPrevSet,
  onNextSet,
  onCompleteSet,
  onGoBack,
  onConnectGoogleFit,
  onSaveFeedback,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{name}</h2>
        <Button variant="ghost" size="sm" onClick={onGoBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      <VideoBlock videoId={videoId} name={name} />

      {/* Timer elegante */}
      <Card className="border-0 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50">
        <CardContent className="p-4 text-center space-y-3">
          <Timer className="w-8 h-8 mx-auto text-emerald-600" />
          <div className="text-4xl font-bold text-emerald-600">{formatTime(timerSeconds)}</div>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              onClick={onToggleTimer}
              className="px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {isTimerRunning ? (
                <><Pause className="w-4 h-4 mr-1" />Pausar</>
              ) : (
                <><Play className="w-4 h-4 mr-1" />Iniciar</>
              )}
            </Button>
            <Button size="sm" onClick={onResetTimer} variant="outline">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-muted-foreground mb-2">Como foi?</p>
            <DifficultyFeedback
              size="md"
              userFeedback={userFeedback}
              feedbackSaving={feedbackSaving}
              onSaveFeedback={onSaveFeedback}
            />
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
                {heartRate.isConnected ? (heartRate.current > 0 ? `${heartRate.current} bpm` : '--') : 'Não conectado'}
              </div>
              <div className="text-xs text-muted-foreground">Frequência Cardíaca</div>
            </div>
          </div>
          {!heartRate.isConnected && (
            <Button size="sm" variant="outline" onClick={onConnectGoogleFit}>
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
          onClick={onPrevSet}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          onClick={onCompleteSet}
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Concluir
        </Button>
        <Button
          variant="outline"
          disabled={currentSet >= totalSets}
          onClick={onNextSet}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
