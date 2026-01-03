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
    <div className="min-h-screen bg-muted flex items-start justify-center px-4 py-6">
      <main className="w-full max-w-md space-y-5 animate-fade-in">
        {/* Cartão principal "Missão do Dia" */}
        <section aria-label="Missão do Dia" className="space-y-4">
          <div className="relative rounded-[2rem] px-6 py-7 text-white bg-gradient-mission shadow-hero overflow-hidden">
            {/* brilho suave */}
            <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.35),_transparent_55%)]" />

            <div className="relative z-10 space-y-4">
              <header className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Missão do Dia</h1>
                <p className="text-sm font-medium text-white/90 leading-snug">
                  🎉 Parabéns! Você completou todas as reflexões de hoje!
                </p>
              </header>

              {/* Subcartão de pontos */}
              <div className="mt-3 rounded-2xl bg-background/15 border border-white/40 px-5 py-3 flex items-center justify-between gap-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/90">
                    Pontos ganhos
                  </span>
                </div>
                <span className="text-3xl font-extrabold leading-none">{totalPoints}</span>
              </div>
            </div>
          </div>

          {/* Barra gradiente decorativa abaixo do header */}
          <div className="h-3 rounded-full bg-gradient-mission opacity-70 shadow-card" aria-hidden="true" />
        </section>

        {/* Resumo das respostas */}
        <section aria-label="Resumo das suas respostas" className="space-y-4">
          <Card className="bg-card rounded-[2rem] shadow-card border-none">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-center text-base font-semibold text-foreground">
                📋 Resumo das suas Respostas
              </h2>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {questions.map((question, index) => (
                  <article
                    key={question.id}
                    className="flex items-start gap-3 rounded-3xl bg-muted px-4 py-4 shadow-sm"
                  >
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-mission text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="text-sm font-semibold leading-snug text-foreground">
                        {question.question}
                      </h3>
                      <Badge className="inline-flex max-w-full items-center justify-center rounded-full bg-gradient-mission text-primary-foreground text-xs px-3 py-1 border-none">
                        <span className="truncate">
                          {answers[question.id] || 'Não respondido'}
                        </span>
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
                  Continue registrando sua jornada todos os dias.
                </p>
              </div>

              <Button
                onClick={onContinue}
                className="mt-1 w-full h-12 rounded-2xl bg-gradient-mission text-primary-foreground text-sm font-semibold shadow-hero hover:opacity-95 transition-opacity flex items-center justify-center"
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
