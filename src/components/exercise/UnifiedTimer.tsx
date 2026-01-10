import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Plus,
  Minus,
  Timer as TimerIcon,
  Zap,
  SkipForward
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mensagens motivacionais para o timer
const motivationalMessages = [
  { emoji: "💪", text: "Você está arrasando!" },
  { emoji: "🔥", text: "Cada série conta!" },
  { emoji: "⚡", text: "Força! Próxima série vem aí!" },
  { emoji: "🎯", text: "Foco no objetivo!" },
  { emoji: "💚", text: "Seu corpo agradece!" },
  { emoji: "🏆", text: "Campeão em construção!" },
  { emoji: "✨", text: "Mais forte a cada dia!" },
  { emoji: "🚀", text: "Não pare agora!" },
  { emoji: "🌟", text: "Você consegue!" },
  { emoji: "💥", text: "Energia total!" },
];

export interface UnifiedTimerProps {
  // Timer básico
  seconds?: number;
  defaultSeconds?: number;
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  className?: string;
  
  // Variações de layout
  variant?: 'full' | 'compact' | 'inline' | 'mini';
  
  // Funcionalidades
  showSkip?: boolean;
  showAdjustments?: boolean;
  showPresets?: boolean;
  showMotivation?: boolean;
  showProgress?: boolean;
  
  // Som e vibração
  soundEnabled?: boolean;
  onCountdownBeep?: () => void;
  onFinishBeep?: () => void;
  
  // Contexto do exercício
  nextExerciseName?: string;
  nextSetNumber?: number;
  totalSets?: number;
  
  // Controle externo de som
  externalSoundEnabled?: boolean;
}

export const UnifiedTimer: React.FC<UnifiedTimerProps> = ({
  seconds: propSeconds,
  defaultSeconds = 60,
  onComplete,
  onSkip,
  autoStart = false,
  className,
  variant = 'full',
  showSkip = true,
  showAdjustments = true,
  showPresets = true,
  showMotivation = true,
  showProgress = true,
  soundEnabled: propSoundEnabled,
  onCountdownBeep,
  onFinishBeep,
  nextExerciseName,
  nextSetNumber,
  totalSets,
  externalSoundEnabled
}) => {
  // Estado do timer
  const initialSeconds = propSeconds || defaultSeconds;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [localSoundEnabled, setLocalSoundEnabled] = useState(propSoundEnabled ?? true);
  const [showPulse, setShowPulse] = useState(false);
  
  // Mensagem motivacional aleatória (memoizada)
  const currentMessage = useMemo(() => {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  }, []);
  
  // Refs para precisão do timer
  const startTimestampRef = useRef<number | null>(null);
  const pausedSecondsRef = useRef<number>(initialSeconds);
  const animationFrameRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const hasCompletedRef = useRef<boolean>(false);

  // Controle de som (externo ou local)
  const soundEnabled = externalSoundEnabled !== undefined ? externalSoundEnabled : localSoundEnabled;
  const setSoundEnabled = setLocalSoundEnabled;

  // ===== FUNÇÕES DE ÁUDIO E VIBRAÇÃO =====
  
  const playLocalBeep = useCallback((frequency = 800, duration = 0.15) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (err) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  const vibrate = useCallback((pattern: number | number[] = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // ===== LÓGICA DO TIMER =====
  
  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    if (!startTimestampRef.current) {
      startTimestampRef.current = Date.now();
      hasCompletedRef.current = false;
    }

    const tick = () => {
      if (!startTimestampRef.current || hasCompletedRef.current) return;

      const elapsed = (Date.now() - startTimestampRef.current) / 1000;
      const remaining = Math.max(0, Math.ceil(pausedSecondsRef.current - elapsed));
      
      setSeconds(remaining);

      // Timer completou
      if (remaining <= 0 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setIsRunning(false);
        startTimestampRef.current = null;
        
        // Som e vibração de finalização
        if (onFinishBeep) {
          onFinishBeep();
        } else {
          // Acorde de vitória
          playLocalBeep(523, 0.15);
          setTimeout(() => playLocalBeep(659, 0.15), 100);
          setTimeout(() => playLocalBeep(784, 0.2), 200);
        }
        vibrate([100, 50, 100, 50, 200]);
        
        // Auto-completar após delay baseado na variante
        const delay = variant === 'mini' ? 500 : variant === 'compact' ? 800 : 1500;
        setTimeout(() => {
          onComplete?.();
        }, delay);
        return;
      }

      // Beep nos últimos 3 segundos
      if (remaining <= 3 && remaining > 0 && remaining !== lastBeepSecondRef.current) {
        lastBeepSecondRef.current = remaining;
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), variant === 'mini' ? 100 : 200);
        
        if (onCountdownBeep) {
          onCountdownBeep();
        } else {
          playLocalBeep(remaining === 1 ? 880 : 660, variant === 'mini' ? 0.08 : 0.1);
        }
        vibrate(variant === 'mini' ? 40 : 50);
      }

      if (remaining > 0) {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, playLocalBeep, vibrate, onComplete, onCountdownBeep, onFinishBeep, variant]);

  // Auto-start
  useEffect(() => {
    if (autoStart && !isRunning && seconds > 0) {
      setIsRunning(true);
    }
  }, [autoStart]);

  // ===== CONTROLES DO TIMER =====
  
  const toggleTimer = () => {
    if (seconds === 0) {
      pausedSecondsRef.current = initialSeconds;
      setSeconds(initialSeconds);
      lastBeepSecondRef.current = null;
      hasCompletedRef.current = false;
    }
    
    if (isRunning) {
      pausedSecondsRef.current = seconds;
      startTimestampRef.current = null;
    } else {
      startTimestampRef.current = Date.now();
    }
    
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(initialSeconds);
    pausedSecondsRef.current = initialSeconds;
    startTimestampRef.current = null;
    lastBeepSecondRef.current = null;
    hasCompletedRef.current = false;
  };

  const adjustTime = (delta: number) => {
    if (isRunning) return;
    const maxTime = variant === 'mini' ? 120 : 300;
    const newSeconds = Math.max(5, Math.min(maxTime, seconds + delta));
    setSeconds(newSeconds);
    pausedSecondsRef.current = newSeconds;
  };

  // ===== UTILITÁRIOS =====
  
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (seconds / initialSeconds) * 100;
  const isLow = seconds <= 3 && seconds > 0;
  const isComplete = seconds === 0;

  // ===== VARIANTES DE RENDERIZAÇÃO =====

  // Versão MINI (botão simples)
  if (variant === 'mini') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTimer}
        className={cn(
          "h-8 px-3 font-mono rounded-full transition-all",
          isRunning && "border-emerald-500 text-emerald-500",
          isLow && "border-red-500 text-red-500 animate-pulse",
          isComplete && "border-green-500 text-green-500",
          className
        )}
      >
        <TimerIcon className="w-3 h-3 mr-1" />
        {isComplete ? '✓ GO!' : `${seconds}s`}
      </Button>
    );
  }

  // Versão COMPACT (inline horizontal)
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <motion.div
          animate={isLow ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full font-mono text-sm font-bold",
            isComplete 
              ? "bg-green-500 text-white" 
              : isLow 
                ? "bg-red-500 text-white" 
                : "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
          )}
        >
          <TimerIcon className="w-4 h-4" />
          {isComplete ? "GO!" : formatTime(seconds)}
        </motion.div>
        
        {!isComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTimer}
            className="h-8 w-8 p-0"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        )}
        
        {showSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip || onComplete}
            className="h-8 w-8 p-0"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Versão INLINE (card compacto)
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className={cn(
          "rounded-2xl p-4 border-2 transition-all",
          isLow && "border-red-400 bg-red-50 dark:bg-red-950/30",
          isComplete && "border-green-400 bg-green-50 dark:bg-green-950/30",
          !isLow && !isComplete && "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isRunning && !isComplete ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              className={cn(
                "w-2 h-2 rounded-full",
                isLow ? "bg-red-500" : isComplete ? "bg-green-500" : "bg-emerald-500"
              )}
            />
            <span className="text-sm font-medium">
              {isComplete ? "Pronto!" : "Descansando..."}
            </span>
          </div>
          {nextSetNumber && totalSets && !isComplete && (
            <span className="text-xs text-muted-foreground">
              Próxima: Série {nextSetNumber}/{totalSets}
            </span>
          )}
        </div>

        {/* Timer circular */}
        <div className="flex items-center justify-center gap-4">
          {/* Ajuste de tempo */}
          {showAdjustments && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => adjustTime(-15)}
              disabled={isRunning || isComplete}
              className="h-10 w-10 rounded-full"
            >
              <Minus className="w-4 h-4" />
            </Button>
          )}

          {/* Display do timer */}
          <div className="relative">
            {showProgress && (
              <svg className="w-24 h-24" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={isLow ? "#ef4444" : isComplete ? "#22c55e" : "#10b981"}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                  transform="rotate(-90 50 50)"
                  animate={{ 
                    scale: showPulse ? 1.05 : 1
                  }}
                  transition={{ duration: 0.15 }}
                />
              </svg>
            )}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={isComplete ? 'done' : seconds}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.1 }}
                className={cn(
                  "absolute inset-0 flex items-center justify-center font-mono font-bold",
                  !showProgress && "relative",
                  isLow && "text-red-500",
                  isComplete && "text-green-500",
                  !isLow && !isComplete && "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {isComplete ? (
                  <span className="text-xl">GO! 💪</span>
                ) : (
                  <span className="text-3xl">{seconds}</span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Ajuste de tempo */}
          {showAdjustments && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => adjustTime(15)}
              disabled={isRunning || isComplete}
              className="h-10 w-10 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {!isComplete && (
            <Button
              variant={isRunning ? "destructive" : "default"}
              size="sm"
              onClick={toggleTimer}
              className="rounded-full px-4"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Continuar
                </>
              )}
            </Button>
          )}
          
          {showSkip && (
            <Button
              variant={isComplete ? "default" : "outline"}
              size="sm"
              onClick={onSkip || onComplete}
              className={cn(
                "rounded-full",
                isComplete && "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6"
              )}
            >
              <SkipForward className="w-4 h-4 mr-1" />
              {isComplete ? "Próxima Série" : "Pular"}
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // Versão FULL (card completo) - DEFAULT
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 border-2",
      isLow && "border-red-500 animate-pulse",
      isComplete && "border-green-500",
      !isLow && !isComplete && "border-emerald-200 dark:border-emerald-800",
      className
    )}>
      <CardContent className="p-4">
        {/* Mensagem motivacional */}
        {showMotivation && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-3 py-2 px-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800"
          >
            <span className="text-lg mr-2">{currentMessage.emoji}</span>
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{currentMessage.text}</span>
          </motion.div>
        )}

        {/* Próximo exercício */}
        {nextExerciseName && (
          <div className="text-center mb-3 text-sm text-muted-foreground">
            Próximo: <span className="font-medium text-foreground">{nextExerciseName}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">Descanso</span>
          </div>
          {externalSoundEnabled === undefined && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>

        {/* Timer Display */}
        <div className="relative flex items-center justify-center py-4">
          {/* Progress Ring */}
          {showProgress && (
            <svg className="absolute w-36 h-36" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isLow ? "#ef4444" : isComplete ? "#22c55e" : "url(#timerGradient)"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                transform="rotate(-90 50 50)"
                initial={false}
                animate={{ 
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
                  scale: showPulse ? 1.05 : 1
                }}
                transition={{ duration: 0.3 }}
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {/* Time Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isComplete ? 'complete' : seconds}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "text-5xl font-bold font-mono z-10",
                isLow && "text-red-500",
                isComplete && "text-green-500",
                !isLow && !isComplete && "text-foreground"
              )}
            >
              {isComplete ? (
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <Zap className="w-10 h-10 mb-1" />
                  <span className="text-2xl">VAMOS!</span>
                </motion.div>
              ) : (
                formatTime(seconds)
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Time Adjusters */}
        {!isComplete && showAdjustments && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustTime(-15)}
              disabled={isRunning}
              className="h-10 w-10 p-0 rounded-full"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-lg font-mono min-w-[80px] text-center font-medium">
              {formatTime(seconds)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustTime(15)}
              disabled={isRunning}
              className="h-10 w-10 p-0 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isComplete && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
                className="h-12 w-12 rounded-full"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                onClick={toggleTimer}
                className={cn(
                  "h-14 w-28 font-semibold transition-all rounded-full text-lg",
                  isRunning 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                )}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-6 h-6 mr-1" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-1" fill="white" />
                    Iniciar
                  </>
                )}
              </Button>
            </>
          )}
          
          {showSkip && (
            <Button
              variant={isComplete ? "default" : "outline"}
              size={isComplete ? "lg" : "icon"}
              onClick={onSkip || onComplete}
              className={cn(
                isComplete 
                  ? "h-14 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg font-semibold"
                  : "h-12 w-12 rounded-full"
              )}
            >
              {isComplete ? (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Próximo Exercício
                </>
              ) : (
                <SkipForward className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>

        {/* Quick Presets */}
        {!isComplete && showPresets && (
          <div className="flex justify-center gap-2 mt-4">
            {[30, 45, 60, 90, 120].map((preset) => (
              <Button
                key={preset}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!isRunning) {
                    setSeconds(preset);
                    pausedSecondsRef.current = preset;
                  }
                }}
                disabled={isRunning}
                className={cn(
                  "h-8 px-3 text-xs rounded-full",
                  seconds === preset && !isRunning && "bg-emerald-100 text-emerald-600 dark:bg-emerald-950"
                )}
              >
                {preset}s
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ===== EXPORTS PARA COMPATIBILIDADE =====

// Mantém compatibilidade com RestTimer existente
export const RestTimer: React.FC<UnifiedTimerProps> = (props) => (
  <UnifiedTimer {...props} variant="full" />
);

// Mantém compatibilidade com InlineRestTimer existente
export const InlineRestTimer: React.FC<UnifiedTimerProps> = (props) => (
  <UnifiedTimer {...props} variant="inline" />
);

// Versão compacta
export const CompactTimer: React.FC<UnifiedTimerProps> = (props) => (
  <UnifiedTimer {...props} variant="compact" />
);

// Versão mini
export const MiniTimer: React.FC<UnifiedTimerProps> = (props) => (
  <UnifiedTimer {...props} variant="mini" />
);

// Export padrão
export default UnifiedTimer;