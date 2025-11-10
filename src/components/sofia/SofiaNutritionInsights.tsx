import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, Pill, Salad, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSofiaAnalysis } from '@/hooks/useSofiaAnalysis';
import { useToast } from '@/hooks/use-toast';

export const SofiaNutritionInsights: React.FC = () => {
  const { isAnalyzing, currentAnalysis, performAnalysis } = useSofiaAnalysis();
  const { toast } = useToast();
  const [lastGeneratedDate, setLastGeneratedDate] = useState<Date | null>(null);
  const [canGenerate, setCanGenerate] = useState(true);
  const [daysUntilNext, setDaysUntilNext] = useState<number>(0);

  useEffect(() => {
    const lastGenerated = localStorage.getItem('sofia_insights_last_generated');
    if (lastGenerated) {
      const date = new Date(lastGenerated);
      setLastGeneratedDate(date);
      
      const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      const daysLeft = 30 - daysSince;
      
      if (daysSince < 30) {
        setCanGenerate(false);
        setDaysUntilNext(daysLeft);
      }
    }
  }, []);

  const loadInsights = async () => {
    if (!canGenerate) {
      toast({
        title: "Aguarde para gerar novos insights",
        description: `Você poderá gerar novos insights em ${daysUntilNext} ${daysUntilNext === 1 ? 'dia' : 'dias'}.`,
        variant: "destructive"
      });
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    
    await performAnalysis(uid, 'complete');
    
    const now = new Date();
    localStorage.setItem('sofia_insights_last_generated', now.toISOString());
    setLastGeneratedDate(now);
    setCanGenerate(false);
    setDaysUntilNext(30);
    
    toast({
      title: "Insights gerados com sucesso!",
      description: "Próxima análise disponível em 30 dias."
    });
  };

  const supplementKeywords = ['suplement', 'vitamina', 'vitamin', 'miner', 'ômega', 'omega', 'magnésio', 'zinco', 'ferro', 'creatina', 'whey'];
  const foodKeywords = ['alimenta', 'refei', 'comer', 'ingira', 'prato', 'dieta'];

  const recommendations = currentAnalysis?.recommendations || [];
  const tips = currentAnalysis?.personalized_tips || [];

  const supplementRecs = recommendations.filter(r =>
    supplementKeywords.some(k => r.toLowerCase().includes(k))
  );

  const foodSuggestions = [
    ...tips,
    ...recommendations.filter(r => foodKeywords.some(k => r.toLowerCase().includes(k)))
  ];

  return (
    <Card className="bg-white shadow-sm border-0">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-emerald-600" />
          Insights da Sofia
        </CardTitle>
        <div className="flex flex-col items-end gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={loadInsights} 
            disabled={isAnalyzing || !canGenerate}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Gerando...' : 'Gerar Insights'}
          </Button>
          {!canGenerate && lastGeneratedDate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Disponível em {daysUntilNext} {daysUntilNext === 1 ? 'dia' : 'dias'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentAnalysis ? (
          <div className="space-y-6">
            {currentAnalysis.insights?.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Principais insights</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {currentAnalysis.insights.slice(0, 6).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Pill className="w-4 h-4 text-emerald-600" /> Recomendações de suplementos
              </h3>
              {supplementRecs.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {supplementRecs.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma recomendação de suplemento no momento.</p>
              )}
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Salad className="w-4 h-4 text-emerald-600" /> Sugestões de alimentação
              </h3>
              {foodSuggestions.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {foodSuggestions.slice(0, 8).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Sem sugestões no momento — registre suas refeições para análises mais precisas.</p>
              )}
            </section>

            {currentAnalysis.predictions && (
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Tendências previstas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                  <div className="p-3 rounded-md bg-emerald-50/50">
                    <span className="font-medium">Peso:</span> {currentAnalysis.predictions.weight_trend}
                  </div>
                  <div className="p-3 rounded-md bg-emerald-50/50">
                    <span className="font-medium">Energia:</span> {currentAnalysis.predictions.energy_forecast}
                  </div>
                  <div className="p-3 rounded-md bg-emerald-50/50">
                    <span className="font-medium">Metas:</span> {currentAnalysis.predictions.goal_likelihood}
                  </div>
                </div>
              </section>
            )}

            <p className="text-xs text-muted-foreground">
              As recomendações são informativas e não substituem orientação profissional.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground mb-2">Sem insights ainda.</p>
            <p className="text-xs text-muted-foreground">
              {canGenerate 
                ? 'Clique em "Gerar Insights" para iniciar uma análise mensal.' 
                : `Próxima análise disponível em ${daysUntilNext} ${daysUntilNext === 1 ? 'dia' : 'dias'}.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SofiaNutritionInsights;
