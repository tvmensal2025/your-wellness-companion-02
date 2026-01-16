import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Send, Award, TrendingUp } from 'lucide-react';

interface SaboteurType {
  name: string;
  description: string;
  characteristics: string[];
  impact: string;
  strategies: string[];
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ResultsStepProps {
  scores: Record<string, number>;
  saboteurTypes: Record<string, SaboteurType>;
  userName: string;
  onDownloadPDF: () => void;
  onSendWhatsApp: () => void;
  onRestart: () => void;
  isGeneratingPDF: boolean;
  isSendingWhatsApp: boolean;
}

export const ResultsStep: React.FC<ResultsStepProps> = ({
  scores,
  saboteurTypes,
  userName,
  onDownloadPDF,
  onSendWhatsApp,
  onRestart,
  isGeneratingPDF,
  isSendingWhatsApp
}) => {
  const sortedScores = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topSaboteur = sortedScores[0];
  const topSaboteurType = saboteurTypes[topSaboteur[0]];
  const TopIcon = topSaboteurType.icon;

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Seus Resultados
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Top Saboteur */}
          <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full bg-white ${topSaboteurType.color}`}>
                <TopIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{topSaboteurType.name}</h3>
                <p className="text-muted-foreground mb-4">{topSaboteurType.description}</p>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  Pontuação: {topSaboteur[1]}%
                </Badge>
              </div>
            </div>
          </div>

          {/* All Scores */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Todos os Sabotadores
            </h4>
            {sortedScores.map(([key, score]) => {
              const saboteur = saboteurTypes[key];
              const SaboteurIcon = saboteur.icon;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SaboteurIcon className={`w-4 h-4 ${saboteur.color}`} />
                      <span className="font-medium">{saboteur.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              );
            })}
          </div>

          {/* Characteristics */}
          <div className="space-y-3">
            <h4 className="font-semibold">Características Principais</h4>
            <ul className="space-y-2">
              {topSaboteurType.characteristics.map((char, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{char}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Impact */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-semibold mb-2 text-orange-900">Impacto</h4>
            <p className="text-sm text-orange-800">{topSaboteurType.impact}</p>
          </div>

          {/* Strategies */}
          <div className="space-y-3">
            <h4 className="font-semibold">Estratégias de Superação</h4>
            <ul className="space-y-2">
              {topSaboteurType.strategies.map((strategy, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">{strategy}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              onClick={onDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex-1"
            >
              {isGeneratingPDF ? (
                <>Gerando PDF...</>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Relatório
                </>
              )}
            </Button>

            <Button
              onClick={onSendWhatsApp}
              disabled={isSendingWhatsApp}
              variant="outline"
              className="flex-1"
            >
              {isSendingWhatsApp ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar WhatsApp
                </>
              )}
            </Button>

            <Button
              onClick={onRestart}
              variant="outline"
              className="w-full"
            >
              Refazer Teste
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
