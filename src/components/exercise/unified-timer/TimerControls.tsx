import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipForward, Zap, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimerControlsProps {
  isRunning: boolean; isComplete: boolean; seconds: number;
  variant?: 'full' | 'compact' | 'inline' | 'mini'; showSkip?: boolean; showAdjustments?: boolean;
  onToggle: () => void; onReset: () => void; onSkip?: () => void;
  onAdjustTime?: (delta: number) => void; formatTime: (s: number) => string;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning, isComplete, seconds, variant = 'full', showSkip = true, showAdjustments = true,
  onToggle, onReset, onSkip, onAdjustTime, formatTime,
}) => {
  // Versão inline - controles compactos
  if (variant === 'inline') {
    return (
      <div className="flex flex-col gap-3">
        {showAdjustments && !isComplete && (
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onAdjustTime?.(-15)} disabled={isRunning || isComplete} className="h-10 w-10 rounded-full">
              <Minus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onAdjustTime?.(15)} disabled={isRunning || isComplete} className="h-10 w-10 rounded-full">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center justify-center gap-2">
          {!isComplete && (
            <Button variant={isRunning ? "destructive" : "default"} size="sm" onClick={onToggle} className="rounded-full px-4">
              {isRunning ? <><Pause className="w-4 h-4 mr-1" />Pausar</> : <><Play className="w-4 h-4 mr-1" />Continuar</>}
            </Button>
          )}
          {showSkip && (
            <Button variant={isComplete ? "default" : "outline"} size="sm" onClick={onSkip}
              className={cn("rounded-full", isComplete && "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6")}>
              <SkipForward className="w-4 h-4 mr-1" />{isComplete ? "Próxima Série" : "Pular"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Versão full - controles completos
  return (
    <div className="flex flex-col gap-4">
      {!isComplete && showAdjustments && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" onClick={() => onAdjustTime?.(-15)} disabled={isRunning} className="h-10 w-10 p-0 rounded-full">
            <Minus className="w-5 h-5" />
          </Button>
          <span className="text-lg font-mono min-w-[80px] text-center font-medium">{formatTime(seconds)}</span>
          <Button variant="outline" size="sm" onClick={() => onAdjustTime?.(15)} disabled={isRunning} className="h-10 w-10 p-0 rounded-full">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      )}
      <div className="flex items-center justify-center gap-3">
        {!isComplete && (
          <>
            <Button variant="outline" size="icon" onClick={onReset} className="h-12 w-12 rounded-full"><RotateCcw className="w-5 h-5" /></Button>
            <Button size="lg" onClick={onToggle}
              className={cn("h-14 w-28 font-semibold transition-all rounded-full text-lg",
                isRunning ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600")}>
              {isRunning ? <><Pause className="w-6 h-6 mr-1" />Pausar</> : <><Play className="w-6 h-6 mr-1" fill="white" />Iniciar</>}
            </Button>
          </>
        )}
        {showSkip && (
          <Button variant={isComplete ? "default" : "outline"} size={isComplete ? "lg" : "icon"} onClick={onSkip}
            className={cn(isComplete ? "h-14 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg font-semibold" : "h-12 w-12 rounded-full")}>
            {isComplete ? <><Zap className="w-5 h-5 mr-2" />Próximo Exercício</> : <SkipForward className="w-5 h-5" />}
          </Button>
        )}
      </div>
    </div>
  );
};
