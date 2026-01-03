import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Play, SkipForward } from 'lucide-react';

interface ExerciseStepModalProps {
  open: boolean;
  onClose: () => void;
  planId: string;
  weekNumber: number;
  dayNumber: number;
  title: string;
  description?: string;
  activity: string;
  currentIndex: number;
  totalWorkouts: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenDetailed?: () => void;
  onCompleteWorkout: () => Promise<void>;
}

function extractYouTubeId(text: string): string | null {
  const urlMatch = text.match(/https?:\/\/[\w./?=&%-]+/i);
  if (!urlMatch) return null;
  const url = new URL(urlMatch[0]);
  if (url.hostname.includes('youtube.com')) {
    return url.searchParams.get('v');
  }
  if (url.hostname.includes('youtu.be')) {
    return url.pathname.replace('/', '');
  }
  return null;
}

export const ExerciseStepModal: React.FC<ExerciseStepModalProps> = ({
  open,
  onClose,
  title,
  description,
  activity,
  currentIndex,
  totalWorkouts,
  onPrev,
  onNext,
  onOpenDetailed,
  onCompleteWorkout,
}) => {
  const videoId = extractYouTubeId(activity + ' ' + (description || ''));

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!open) {
      setSeconds(0);
      setIsRunning(false);
      return;
    }
    setSeconds(0);
    setIsRunning(false);
  }, [open, activity]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleFinish = async () => {
    await onCompleteWorkout();
    onClose();
  };

  const minutesDisplay = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secondsDisplay = String(seconds % 60).padStart(2, '0');

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="flex flex-col bg-gradient-to-br from-background via-background to-muted/60">
          {/* Cabeçalho + navegação entre treinos */}
          <div className="px-6 pt-5 pb-3 border-b">
            <DialogHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <DialogTitle className="text-2xl md:text-3xl font-bold tracking-tight">
                  {title}
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="text-muted-foreground">
                    {currentIndex + 1} de {totalWorkouts}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={currentIndex === 0}
                      onClick={onPrev}
                    >
                      ‹
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={currentIndex === totalWorkouts - 1}
                      onClick={onNext}
                    >
                      ›
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Vamos fazer este treino com calma, no seu ritmo. Você pode pausar sempre que precisar.
              </p>
            </DialogHeader>
          </div>

          {/* Player de vídeo no topo */}
          <div className="w-full border-b bg-muted/60 px-6 pt-4 pb-5">
            <p className="text-sm font-medium mb-2">Vídeo do exercício</p>
            {videoId ? (
              <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-black/80 shadow-md">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Vídeo do treino"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed flex items-center justify-center text-xs text-muted-foreground p-4 text-center bg-background/60">
                Adicione um link do YouTube na descrição do treino para exibir o vídeo aqui.
              </div>
            )}
          </div>

          {/* Conteúdo do exercício, cuidados e timer */}
          <div className="px-6 py-4 space-y-4">
            {/* Bloco principal do exercício */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Exercício de hoje
              </p>
              <div className="rounded-2xl border bg-card/90 backdrop-blur-sm p-4 flex items-start gap-3 shadow-sm">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-base md:text-lg leading-snug">{activity}</p>
                  {description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {/* Orientações de segurança */}
              <div className="rounded-xl border bg-muted/50 p-3 space-y-1 text-xs md:text-sm text-muted-foreground">
                <p className="font-semibold text-foreground text-sm">Cuidados importantes</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use um espaço seguro e confortável.</li>
                  <li>Se sentir dor forte, tontura ou falta de ar, pare imediatamente.</li>
                  <li>Faça no seu ritmo – o importante é se movimentar com segurança.</li>
                </ul>
              </div>

              {/* Timer elegante */}
              <div className="mt-2 flex flex-col md:flex-row items-center gap-4 p-3 rounded-2xl border bg-background/80">
                <div className="flex-1 flex flex-col items-center md:items-start gap-1">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Tempo de treino</span>
                  <span className="font-mono text-3xl md:text-4xl font-semibold">
                    {minutesDisplay}:{secondsDisplay}
                  </span>
                  <span className="text-xs text-muted-foreground">Use o timer apenas como referência. Respeite seus limites.</span>
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-center">
                  <Button
                    type="button"
                    variant={isRunning ? 'outline' : 'default'}
                    className="flex-1 md:flex-none min-w-[120px]"
                    onClick={() => setIsRunning((prev) => !prev)}
                  >
                    {isRunning ? 'Pausar' : 'Iniciar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 md:flex-none min-w-[100px]"
                    onClick={() => {
                      setSeconds(0);
                      setIsRunning(false);
                    }}
                  >
                    Zerar
                  </Button>
                </div>
              </div>

              {/* Ações finais */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 text-base py-5"
                  onClick={handleFinish}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Marcar treino como concluído
                </Button>
                <Button
                  variant="outline"
                  className="sm:w-auto"
                  onClick={onClose}
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Fazer depois
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
