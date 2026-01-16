import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TimerPresetsProps {
  currentSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
  onSelectPreset: (seconds: number) => void;
  presets?: number[];
}

const DEFAULT_PRESETS = [30, 45, 60, 90, 120];

export const TimerPresets: React.FC<TimerPresetsProps> = ({
  currentSeconds,
  isRunning,
  isComplete,
  onSelectPreset,
  presets = DEFAULT_PRESETS,
}) => {
  if (isComplete) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      {presets.map((preset) => (
        <Button
          key={preset}
          variant="ghost"
          size="sm"
          onClick={() => onSelectPreset(preset)}
          disabled={isRunning}
          className={cn(
            "h-8 px-3 text-xs rounded-full",
            currentSeconds === preset && !isRunning && "bg-emerald-100 text-emerald-600 dark:bg-emerald-950"
          )}
        >
          {preset}s
        </Button>
      ))}
    </div>
  );
};
