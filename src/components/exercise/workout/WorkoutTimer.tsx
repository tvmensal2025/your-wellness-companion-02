import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Timer, 
  Play, 
  Pause, 
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutTimerProps {
  isRunning: boolean;
  seconds: number;
  onToggle: () => void;
  onReset: () => void;
  feedback: 'facil' | 'ok' | 'dificil' | null;
  onFeedbackChange: (feedback: 'facil' | 'ok' | 'dificil') => void;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  isRunning,
  seconds,
  onToggle,
  onReset,
  feedback,
  onFeedbackChange
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-primary/15 to-accent/15">
      <CardContent className="p-4 text-center space-y-3">
        <Timer className="w-8 h-8 mx-auto text-primary" />
        <div className="text-4xl font-bold text-primary font-mono">
          {formatTime(seconds)}
        </div>

        <div className="flex gap-2 justify-center">
          <Button size="sm" onClick={onToggle} className="px-6">
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Iniciar
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={onReset}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Como foi?</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onFeedbackChange('facil')}
              className={cn(
                "rounded-lg border p-2 text-center transition-colors",
                feedback === 'facil'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background/50 text-muted-foreground hover:bg-muted/30"
              )}
            >
              <ThumbsUp className="w-4 h-4 mx-auto mb-1" />
              <span className="text-[10px] font-medium">Fácil</span>
            </button>

            <button
              type="button"
              onClick={() => onFeedbackChange('ok')}
              className={cn(
                "rounded-lg border p-2 text-center transition-colors",
                feedback === 'ok'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background/50 text-muted-foreground hover:bg-muted/30"
              )}
            >
              <Minus className="w-4 h-4 mx-auto mb-1" />
              <span className="text-[10px] font-medium">OK</span>
            </button>

            <button
              type="button"
              onClick={() => onFeedbackChange('dificil')}
              className={cn(
                "rounded-lg border p-2 text-center transition-colors",
                feedback === 'dificil'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background/50 text-muted-foreground hover:bg-muted/30"
              )}
            >
              <ThumbsDown className="w-4 h-4 mx-auto mb-1" />
              <span className="text-[10px] font-medium">Difícil</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
