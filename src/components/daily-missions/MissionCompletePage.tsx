import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, CheckCircle } from 'lucide-react';

interface MissionCompletePageProps {
  answers: Record<string, string | number>;
  totalPoints: number;
  questions: Array<{
    id: string;
    question: string;
  }>;
  onContinue?: () => void;
}

export const MissionCompletePage: React.FC<MissionCompletePageProps> = ({
  answers,
  totalPoints,
  questions,
  onContinue,
}) => {
  return (
    <div className="min-h-screen bg-background px-4 py-6 flex items-start justify-center">
      <main className="w-full max-w-md space-y-5 animate-fade-in">
        {/* Header "cartão de pontos" */}
        <section
          aria-label="Resumo da missão do dia"
          className="relative rounded-[2rem] p-7 text-white bg-gradient-mission shadow-hero overflow-hidden"
        >
          {/* brilho suave de fundo */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.4),_transparent_55%)]" />

          <div className="relative z-10 space-y-5">
            <header className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Missão do Dia</h1>
              <p className="text-sm font-medium text-white/90">
                🎉 Parabéns! Você completou todas as reflexões de hoje!
              </p>
            </header>

            {/* Pontos ganhos */}
            <div className="mt-4 rounded-2xl border border-white/50 bg-background/10 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                <span className="text-sm font-medium">Pontos ganhos</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold leading-none">{totalPoints}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Resumo das respostas */}
        <section aria-label="Resumo das suas respostas">
          <Card className="bg-card/95 backdrop-blur-sm border-none rounded-3xl shadow-card">
            <CardContent className="p-6 space-y-5">
              <h2 className="text-center text-lg font-bold bg-gradient-mission bg-clip-text text-transparent">
                📋 Resumo das suas Respostas
              </h2>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {questions.map((question, index) => (
                  <article
                    key={question.id}
                    className="flex items-start gap-3 rounded-2xl bg-muted px-3 py-3 border border-border hover-lift"
                  >
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-mission text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-1">
                      <h3 className="text-sm font-semibold leading-snug text-foreground">
                        {question.question}
                      </h3>
                      <Badge className="bg-gradient-mission text-primary-foreground text-xs px-3 py-1 border-none rounded-full">
                        {answers[question.id] || 'Não respondido'}
                      </Badge>
                    </div>
                  </article>
                ))}
              </div>

              <div className="rounded-2xl bg-secondary px-4 py-3 text-center space-y-1">
                <p className="text-sm font-semibold text-secondary-foreground">
                  ✨ Você está no caminho certo!
                </p>
                <p className="text-xs text-muted-foreground">
                  Pequenas ações diárias constroem grandes transformações.
                </p>
              </div>

              <Button
                onClick={onContinue}
                className="mt-2 w-full h-12 rounded-2xl bg-gradient-mission text-primary-foreground text-sm font-semibold shadow-hero hover:opacity-95 transition-opacity flex items-center justify-center"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Continuar para o dashboard
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};
