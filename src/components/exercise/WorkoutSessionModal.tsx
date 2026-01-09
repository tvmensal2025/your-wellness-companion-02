import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Play,
  Pause,
  Check,
  X,
  Clock,
  Star,
  MessageSquare
} from 'lucide-react';

interface WorkoutSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutName: string;
  startedAt: string;
  onFinish: (rating?: number, notes?: string) => void;
  onCancel: () => void;
}

export const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({
  isOpen,
  onClose,
  workoutName,
  startedAt,
  onFinish,
  onCancel
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      const start = new Date(startedAt).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, startedAt, isPaused]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    onFinish(rating > 0 ? rating : undefined, notes || undefined);
    setRating(0);
    setNotes('');
  };

  const handleCancel = () => {
    onCancel();
    setRating(0);
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-16px)] max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-orange-600" />
            Treino em Andamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timer */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-4 text-center">
            <h3 className="text-base font-semibold mb-2 truncate">{workoutName}</h3>
            <div className="text-4xl font-bold text-orange-600 mb-3">
              {formatTime(elapsedTime)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="gap-2"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  Retomar
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar
                </>
              )}
            </Button>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Como foi o treino?
            </Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className="transition-all"
                >
                  <Star
                    className={`w-8 h-8 ${
                      value <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Observações (opcional)
            </Label>
            <Textarea
              placeholder="Como você se sentiu? Pesos usados, dificuldades, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleFinish}
              className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Check className="w-4 h-4" />
              Finalizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
