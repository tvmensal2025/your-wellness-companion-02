import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Timer as TimerIcon, Volume2, VolumeX, Pause, Play, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimerLogic } from './hooks/useTimerLogic';
import { useTimerSound } from './hooks/useTimerSound';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerPresets } from './TimerPresets';
import { MotivationalMessage } from './MotivationalMessage';

export interface UnifiedTimerProps {
  seconds?: number; defaultSeconds?: number; onComplete?: () => void; onSkip?: () => void;
  autoStart?: boolean; className?: string; variant?: 'full' | 'compact' | 'inline' | 'mini';
  showSkip?: boolean; showAdjustments?: boolean; showPresets?: boolean; showMotivation?: boolean;
  showProgress?: boolean; soundEnabled?: boolean; onCountdownBeep?: () => void; onFinishBeep?: () => void;
  nextExerciseName?: string; nextSetNumber?: number; totalSets?: number; externalSoundEnabled?: boolean;
}

export const UnifiedTimer: React.FC<UnifiedTimerProps> = ({
  seconds: propSeconds, defaultSeconds = 60, onComplete, onSkip, autoStart = false, className,
  variant = 'full', showSkip = true, showAdjustments = true, showPresets = true, showMotivation = true,
  showProgress = true, soundEnabled: propSoundEnabled, onCountdownBeep, onFinishBeep,
  nextExerciseName, nextSetNumber, totalSets, externalSoundEnabled
}) => {
  const initialSeconds = propSeconds || defaultSeconds;
  const sound = useTimerSound({ enabled: propSoundEnabled, externalEnabled: externalSoundEnabled, onCountdownBeep, onFinishBeep, variant });
  const timer = useTimerLogic({
    initialSeconds, autoStart, variant,
    onComplete: () => { sound.playFinishBeep(); onComplete?.(); },
    onCountdownTick: (remaining) => { sound.playCountdownBeep(remaining); },
  });
  const handleSkip = onSkip || onComplete;

  // ===== VARIANT: MINI =====
  if (variant === 'mini') {
    return (
      <Button variant="outline" size="sm" onClick={timer.toggleTimer}
        className={cn("h-8 px-3 font-mono rounded-full transition-all",
          timer.isRunning && "border-emerald-500 text-emerald-500",
          timer.isLow && "border-red-500 text-red-500 animate-pulse",
          timer.isComplete && "border-green-500 text-green-500", className)}>
        <TimerIcon className="w-3 h-3 mr-1" />
        {timer.isComplete ? '✓ GO!' : `${timer.seconds}s`}
      </Button>
    );
  }

  // ===== VARIANT: COMPACT =====
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <motion.div animate={timer.isLow ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 0.5 }}
          className={cn("flex items-center gap-2 px-3 py-2 rounded-full font-mono text-sm font-bold",
            timer.isComplete ? "bg-green-500 text-white" : timer.isLow ? "bg-red-500 text-white" 
            : "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300")}>
          <TimerIcon className="w-4 h-4" />
          {timer.isComplete ? "GO!" : timer.formatTime(timer.seconds)}
        </motion.div>
        {!timer.isComplete && (
          <Button variant="ghost" size="sm" onClick={timer.toggleTimer} className="h-8 w-8 p-0">
            {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        )}
        {showSkip && <Button variant="ghost" size="sm" onClick={handleSkip} className="h-8 w-8 p-0"><SkipForward className="w-4 h-4" /></Button>}
      </div>
    );
  }

  // ===== VARIANT: INLINE =====
  if (variant === 'inline') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className={cn("rounded-2xl p-4 border-2 transition-all",
          timer.isLow && "border-red-400 bg-red-50 dark:bg-red-950/30",
          timer.isComplete && "border-green-400 bg-green-50 dark:bg-green-950/30",
          !timer.isLow && !timer.isComplete && "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div animate={timer.isRunning && !timer.isComplete ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}
              className={cn("w-2 h-2 rounded-full", timer.isLow ? "bg-red-500" : timer.isComplete ? "bg-green-500" : "bg-emerald-500")} />
            <span className="text-sm font-medium">{timer.isComplete ? "Pronto!" : "Descansando..."}</span>
          </div>
          {nextSetNumber && totalSets && !timer.isComplete && <span className="text-xs text-muted-foreground">Próxima: Série {nextSetNumber}/{totalSets}</span>}
        </div>
        <div className="flex items-center justify-center gap-4"><TimerDisplay {...timer} showProgress={showProgress} variant="inline" /></div>
        <TimerControls {...timer} variant="inline" showSkip={showSkip} showAdjustments={showAdjustments}
          onToggle={timer.toggleTimer} onReset={timer.resetTimer} onSkip={handleSkip} onAdjustTime={timer.adjustTime} />
      </motion.div>
    );
  }

  // ===== VARIANT: FULL (DEFAULT) =====
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 border-2",
      timer.isLow && "border-red-500 animate-pulse", timer.isComplete && "border-green-500",
      !timer.isLow && !timer.isComplete && "border-emerald-200 dark:border-emerald-800", className)}>
      <CardContent className="p-4">
        {showMotivation && <MotivationalMessage />}
        {nextExerciseName && <div className="text-center mb-3 text-sm text-muted-foreground">Próximo: <span className="font-medium text-foreground">{nextExerciseName}</span></div>}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><TimerIcon className="w-4 h-4 text-emerald-500" /><span className="text-sm font-medium">Descanso</span></div>
          {externalSoundEnabled === undefined && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={sound.toggleSound}>
              {sound.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
            </Button>
          )}
        </div>
        <TimerDisplay {...timer} showProgress={showProgress} variant="full" />
        <TimerControls {...timer} variant="full" showSkip={showSkip} showAdjustments={showAdjustments}
          onToggle={timer.toggleTimer} onReset={timer.resetTimer} onSkip={handleSkip} onAdjustTime={timer.adjustTime} />
        {showPresets && <TimerPresets currentSeconds={timer.seconds} isRunning={timer.isRunning} isComplete={timer.isComplete} onSelectPreset={timer.setPreset} />}
      </CardContent>
    </Card>
  );
};

// ===== EXPORTS PARA COMPATIBILIDADE =====
export const RestTimer: React.FC<UnifiedTimerProps> = (props) => <UnifiedTimer {...props} variant="full" />;
export const InlineRestTimer: React.FC<UnifiedTimerProps> = (props) => <UnifiedTimer {...props} variant="inline" />;
export const CompactTimer: React.FC<UnifiedTimerProps> = (props) => <UnifiedTimer {...props} variant="compact" />;
export const MiniTimer: React.FC<UnifiedTimerProps> = (props) => <UnifiedTimer {...props} variant="mini" />;

export default UnifiedTimer;
