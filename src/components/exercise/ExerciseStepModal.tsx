import React from 'react';
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
  onCompleteWorkout,
}) => {
  const videoId = extractYouTubeId(activity + ' ' + (description || ''));

  const handleFinish = async () => {
    await onCompleteWorkout();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-[3fr,2fr]">
          <div className="p-6 space-y-4 bg-card">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold">
                {title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Vamos fazer este treino com calma, um passo de cada vez.
              </p>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Exercício de hoje
              </p>
              <div className="rounded-xl border bg-muted/40 p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base mb-1">{activity}</p>
                  {description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use um espaço seguro e confortável.</li>
                <li>Se sentir dor forte ou falta de ar, pare e descanse.</li>
                <li>Faça no seu ritmo – o importante é se movimentar.</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 text-base py-5 hover-scale"
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

          <div className="bg-muted/40 border-l p-4 flex flex-col gap-3">
            <p className="text-sm font-medium">Vídeo de apoio</p>
            {videoId ? (
              <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-black/80">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Vídeo do treino"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex-1 rounded-lg border border-dashed flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
                Adicione um link do YouTube na descrição do treino para exibir o vídeo aqui.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
