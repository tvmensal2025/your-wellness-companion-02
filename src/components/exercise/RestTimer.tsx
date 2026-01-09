import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RestTimerProps {
  defaultSeconds?: number;
  onComplete?: () => void;
  autoStart?: boolean;
  className?: string;
  // Callbacks externos para sincronizar som com o modal pai
  onCountdownBeep?: () => void;
  onFinishBeep?: () => void;
  externalSoundEnabled?: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  defaultSeconds = 60,
  onComplete,
  autoStart = false,
  className,
  onCountdownBeep,
  onFinishBeep,
  externalSoundEnabled
}) => {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [localSoundEnabled, setLocalSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Usar som externo se disponível, senão usar local
  const soundEnabled = externalSoundEnabled !== undefined ? externalSoundEnabled : localSoundEnabled;
  const setSoundEnabled = setLocalSoundEnabled;

  // Criar audio context para o beep (fallback se não tiver callbacks externos)
  const playLocalBeep = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  // Timer logic
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Usar callback externo se disponível
            if (onFinishBeep) {
              onFinishBeep();
            } else {
              playLocalBeep();
              playLocalBeep();
            }
            onComplete?.();
            return 0;
          }
          // Beep nos últimos 3 segundos
          if (prev <= 4) {
            if (onCountdownBeep) {
              onCountdownBeep();
            } else {
              playLocalBeep();
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds, playLocalBeep, onComplete, onCountdownBeep, onFinishBeep]);

  const toggleTimer = () => {
    if (seconds === 0) {
      setSeconds(defaultSeconds);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(defaultSeconds);
  };

  const adjustTime = (delta: number) => {
    if (isRunning) return;
    setSeconds((prev) => Math.max(5, Math.min(300, prev + delta)));
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (seconds / defaultSeconds) * 100;
  const isLow = seconds <= 10 && seconds > 0;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isLow && "animate-pulse",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Descanso</span>
          </div>
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
        </div>

        {/* Timer Display */}
        <div className="relative flex items-center justify-center py-4">
          {/* Progress Ring */}
          <svg className="absolute w-32 h-32" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/30"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              transform="rotate(-90 50 50)"
              initial={false}
              animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}` }}
              transition={{ duration: 0.3 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time Display */}
          <motion.div
            key={seconds}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={cn(
              "text-4xl font-bold font-mono z-10",
              isLow ? "text-red-500" : "text-foreground",
              seconds === 0 && "text-green-500"
            )}
          >
            {seconds === 0 ? (
              <div className="flex flex-col items-center">
                <Zap className="w-8 h-8 mb-1" />
                <span className="text-lg">GO!</span>
              </div>
            ) : (
              formatTime(seconds)
            )}
          </motion.div>
        </div>

        {/* Time Adjusters */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustTime(-15)}
            disabled={isRunning}
            className="h-8 w-8 p-0"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {formatTime(seconds)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustTime(15)}
            disabled={isRunning}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className="h-10 w-10"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            onClick={toggleTimer}
            className={cn(
              "h-12 w-24 font-semibold transition-all",
              isRunning 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            )}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 mr-1" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-1" fill="white" />
                {seconds === 0 ? 'Reset' : 'Iniciar'}
              </>
            )}
          </Button>
        </div>

        {/* Quick Presets */}
        <div className="flex justify-center gap-2 mt-4">
          {[30, 45, 60, 90, 120].map((preset) => (
            <Button
              key={preset}
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsRunning(false);
                setSeconds(preset);
              }}
              className={cn(
                "h-7 px-2 text-xs",
                seconds === preset && !isRunning && "bg-orange-100 text-orange-600 dark:bg-orange-950"
              )}
            >
              {preset}s
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Mini versão para uso inline
export const MiniRestTimer: React.FC<{
  seconds: number;
  onComplete?: () => void;
}> = ({ seconds: initialSeconds, onComplete }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds, onComplete]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (seconds === 0) setSeconds(initialSeconds);
        setIsRunning(!isRunning);
      }}
      className={cn(
        "h-8 px-3 font-mono",
        isRunning && "border-orange-500 text-orange-500"
      )}
    >
      <TimerIcon className="w-3 h-3 mr-1" />
      {seconds === 0 ? '✓' : `${seconds}s`}
    </Button>
  );
};
