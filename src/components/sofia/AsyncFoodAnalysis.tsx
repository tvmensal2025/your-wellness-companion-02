import { useState } from 'react';
import { useAsyncAnalysis } from '@/hooks/useAsyncAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function AsyncFoodAnalysis() {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const {
    status,
    result,
    error,
    progress,
    enqueueAnalysis,
    cancelAnalysis,
    reset,
    isProcessing,
    isCompleted,
    hasError
  } = useAsyncAnalysis(user?.id, {
    onComplete: (result) => {
      console.log('✅ Análise completa:', result);
    },
    onError: (error) => {
      console.error('❌ Erro na análise:', error);
    },
    autoRetry: true,
    maxRetries: 3
  });

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    
    await enqueueAnalysis(
      'food_image',
      imageUrl,
      { userName: user?.email?.split('@')[0] || 'usuário' },
      'almoco'
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Análise Assíncrona de Alimentos 🍽️</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input de URL da imagem */}
        <div className="space-y-2">
          <label className="text-sm font-medium">URL da Imagem</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="w-full px-3 py-2 border rounded-md"
            disabled={isProcessing}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={!imageUrl || isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Analisar Foto
              </>
            )}
          </Button>

          {isProcessing && (
            <Button
              onClick={cancelAnalysis}
              variant="outline"
            >
              Cancelar
            </Button>
          )}

          {(isCompleted || hasError) && (
            <Button
              onClick={reset}
              variant="outline"
            >
              Nova Análise
            </Button>
          )}
        </div>

        {/* Status e progresso */}
        {status === 'uploading' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enviando imagem...</span>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sofia está analisando sua foto...</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(progress)}% completo
            </p>
            <p className="text-sm text-muted-foreground text-center">
              💡 Você pode continuar usando o app! Vamos te notificar quando estiver pronto 🔔
            </p>
          </div>
        )}

        {/* Resultado */}
        {isCompleted && result && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Análise completa!</span>
            </div>

            {result.foods && result.foods.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Alimentos detectados:</h3>
                <ul className="space-y-1">
                  {result.foods.map((food: any, index: number) => (
                    <li key={index} className="text-sm">
                      • {food.nome} - {food.quantidade}g
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.nutrition && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Calorias</p>
                  <p className="text-lg font-bold">{result.nutrition.calories} kcal</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proteínas</p>
                  <p className="text-lg font-bold">{result.nutrition.protein}g</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Carboidratos</p>
                  <p className="text-lg font-bold">{result.nutrition.carbs}g</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gorduras</p>
                  <p className="text-lg font-bold">{result.nutrition.fat}g</p>
                </div>
              </div>
            )}

            {result.message && (
              <p className="text-sm text-muted-foreground italic">
                {result.message}
              </p>
            )}
          </div>
        )}

        {/* Erro */}
        {hasError && error && (
          <div className="space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Erro na análise</span>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Informações sobre a arquitetura */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
          <h4 className="text-sm font-medium">⚡ Arquitetura Assíncrona</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✅ Resposta imediata (~200ms)</li>
            <li>✅ Processamento em background</li>
            <li>✅ Notificação em tempo real via Supabase Realtime</li>
            <li>✅ Cache automático de resultados</li>
            <li>✅ Retry automático em caso de falha</li>
            <li>✅ Você pode continuar usando o app enquanto processa</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
