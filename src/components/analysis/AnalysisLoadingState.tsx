import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

interface AnalysisLoadingStateProps {
  status: 'enqueuing' | 'pending' | 'processing';
  estimatedTime?: number;
  onCancel?: () => void;
}

export function AnalysisLoadingState({ status, estimatedTime = 10, onCancel }: AnalysisLoadingStateProps) {
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
      
      // Simulate progress
      if (status === 'enqueuing') {
        setProgress(10);
      } else if (status === 'pending') {
        setProgress(30);
      } else if (status === 'processing') {
        setProgress(prev => Math.min(prev + 5, 90));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const statusMessages = {
    enqueuing: 'Enviando para análise...',
    pending: 'Na fila de processamento...',
    processing: 'Analisando...'
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        
        <div className="text-center space-y-2 w-full">
          <p className="font-medium text-lg">{statusMessages[status]}</p>
          <p className="text-sm text-muted-foreground">
            Tempo estimado: {estimatedTime}s | Decorrido: {elapsed}s
          </p>
        </div>

        <Progress value={progress} className="w-full" />

        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="mt-2"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Estamos processando sua solicitação na nossa VPS de alta performance.
          Você receberá o resultado em breve!
        </p>
      </div>
    </Card>
  );
}
