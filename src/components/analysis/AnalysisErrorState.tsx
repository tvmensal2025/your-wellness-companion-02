import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AnalysisErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function AnalysisErrorState({ error, onRetry }: AnalysisErrorStateProps) {
  const getErrorMessage = (error: Error): string => {
    if (error.message.includes('timeout')) {
      return 'A análise demorou mais do que o esperado. Por favor, tente novamente.';
    }
    if (error.message.includes('network')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    if (error.message.includes('YOLO')) {
      return 'Erro no serviço de detecção de objetos. Tentando novamente...';
    }
    return 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.';
  };

  const getErrorTips = (error: Error): string[] => {
    const tips: string[] = [];
    
    if (error.message.includes('timeout')) {
      tips.push('Tente com uma imagem menor');
      tips.push('Verifique sua conexão com a internet');
    }
    
    if (error.message.includes('image')) {
      tips.push('Certifique-se de que a imagem está clara');
      tips.push('Tente tirar outra foto com melhor iluminação');
    }

    tips.push('Se o problema persistir, entre em contato com o suporte');
    
    return tips;
  };

  return (
    <Card className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro na Análise</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>{getErrorMessage(error)}</p>
          
          <div className="mt-4">
            <p className="font-medium text-sm mb-2">Dicas:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {getErrorTips(error).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          {onRetry && (
            <Button
              onClick={onRetry}
              className="mt-4 w-full"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          )}

          <details className="mt-4">
            <summary className="text-xs cursor-pointer text-muted-foreground">
              Detalhes técnicos
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        </AlertDescription>
      </Alert>
    </Card>
  );
}
