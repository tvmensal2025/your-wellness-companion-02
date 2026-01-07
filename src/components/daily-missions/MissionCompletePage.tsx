import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-muted flex items-start justify-center px-3 py-4">
      <main className="w-full max-w-md space-y-3 animate-fade-in">
        {/* Cartão principal "Missão do Dia" */}
        <section aria-label="Missão do Dia" className="space-y-2">
          <div className="relative rounded-2xl px-4 py-4 text-white bg-gradient-mission shadow-hero overflow-hidden">
            {/* brilho suave */}
            <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.35),_transparent_55%)]" />

            <div className="relative z-10 space-y-2">
              <header className="space-y-0.5">
                <h1 className="text-lg font-bold tracking-tight">Missão do Dia</h1>
                <p className="text-xs font-medium text-white/90 leading-snug">
                  🎉 Parabéns! Você completou todas as reflexões de hoje!
                </p>
              </header>

              {/* Subcartão de pontos */}
              <div className="rounded-xl bg-background/15 border border-white/40 px-3 py-2 flex items-center justify-between gap-2 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white/90">
                    Pontos ganhos
                  </span>
                </div>
                <span className="text-2xl font-extrabold leading-none">{totalPoints}</span>
              </div>
            </div>
          </div>

          {/* Barra gradiente decorativa abaixo do header */}
          <div className="h-2 rounded-full bg-gradient-mission opacity-70 shadow-card" aria-hidden="true" />
        </section>

        {/* Resumo das respostas */}
        <section aria-label="Resumo das suas respostas" className="space-y-2">
          <Card className="bg-card rounded-2xl shadow-card border-none">
            <CardContent className="p-3 space-y-2">
              <h2 className="text-center text-sm font-semibold text-foreground">
                📋 Resumo das suas Respostas
              </h2>

              <div className="space-y-2">
                {questions.map((question, index) => (
                  <article
                    key={question.id}
                    className="flex items-start gap-2 rounded-2xl bg-muted px-3 py-2.5"
                  >
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-mission text-[10px] font-bold text-primary-foreground shrink-0">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <h3 className="text-xs font-semibold leading-snug text-foreground">
                        {question.question}
                      </h3>
                      <Badge className="inline-flex max-w-full items-center justify-center rounded-full bg-secondary/80 text-secondary-foreground text-[10px] px-2 py-0.5 border border-border/40">
                        <span className="truncate">
                          {answers[question.id] || 'Não respondido'}
                        </span>
                      </Badge>
                    </div>
                  </article>
                ))}
              </div>

              <div className="rounded-xl bg-secondary px-3 py-2 text-center space-y-0.5">
                <p className="text-xs font-semibold text-secondary-foreground">
                  ✨ Você está no caminho certo!
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Continue registrando sua jornada todos os dias.
                </p>
              </div>

              <Button
                onClick={onContinue}
                className="w-full h-10 rounded-xl bg-gradient-mission text-primary-foreground text-xs font-semibold shadow-hero hover:opacity-95 transition-opacity flex items-center justify-center"
              >
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                🎉 Parabéns! Ir para o dashboard
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};
