import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Info, Play } from 'lucide-react';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { exerciseInstructions } from '@/data/exercise-instructions';
import { useExerciseProgram } from '@/hooks/useExerciseProgram';

interface ExerciseDashboardProps {
  user: User | null;
}

// Novo dashboard de exercícios
// Foco: lista simples de exercícios + modal detalhado individual (estilo print)
export const ExerciseDashboard: React.FC<ExerciseDashboardProps> = ({ user }) => {
  const { activeProgram } = useExerciseProgram(user?.id);
  const [location, setLocation] = useState<'casa' | 'academia'>('casa');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Define a localização com base no programa ativo salvo
  React.useEffect(() => {
    if (!activeProgram) return;

    // Alguns programas usam `exercises.location`, outros `plan_data.location`
    const rawLocation =
      (activeProgram as any).exercises?.location ||
      (activeProgram as any).plan_data?.location ||
      (activeProgram as any).planData?.location;

    if (!rawLocation) return;

    const loc = String(rawLocation).toLowerCase();

    // Qualquer coisa que comece com "casa" vira treino em casa (casa_sem, casa_equip, etc.)
    if (loc.startsWith('casa')) {
      setLocation('casa');
    } else if (loc.includes('academia')) {
      setLocation('academia');
    }
  }, [activeProgram]);

  const exerciseList =
    location === 'casa'
      ? Object.entries(exerciseInstructions.casa)
      : Object.entries(exerciseInstructions.academia);

  const openExercise = (name: string, details: any) => {
    setSelectedExercise({ name, ...details });
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-background border border-border/40 px-4 py-6 md:py-8 flex items-center gap-4 md:gap-6 animate-fade-in">
        {/* Camadas de fundo para dar sensação de imagem/padrão */}
        <div className="absolute inset-y-0 right-[-30%] w-56 opacity-25 pointer-events-none bg-[radial-gradient(circle_at_center,hsl(var(--primary))/0.45,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary))/0.35,transparent_55%),radial-gradient(circle_at_100%_100%,hsl(var(--primary))/0.25,transparent_55%)]" />
        <div className="relative z-10 flex items-center md:items-start gap-3 md:gap-4 w-full">
          <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-primary/15 text-primary shadow-sm">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div className="space-y-1 md:space-y-2 max-w-xl">
            <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.22em] uppercase text-primary/80">
              Treino focado em você
            </p>
            <h2 className="text-lg md:text-2xl font-bold leading-snug md:leading-snug">
              Cada treino é um passo a mais na sua melhor versão.
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
              Mantenha o foco hoje. Um treino curto e bem feito vale mais do que a perfeição que nunca começa.
            </p>
          </div>
        </div>
      </section>

      {/* Ambiente definido automaticamente pelo programa salvo */}
      <section className="flex justify-between items-center">
        <Badge variant="outline" className="text-primary text-xs">
          {location === 'casa' ? '🏠 Em casa' : '🏋️ Academia'}
        </Badge>
      </section>

      {/* Lista compacta de exercícios (mobile-first) */}
      <main className="space-y-3">
        {exerciseList.map(([name, details]: [string, any]) => (
          <Card
            key={name}
            className="border rounded-xl hover:shadow-sm transition cursor-pointer"
            onClick={() => openExercise(name, details)}
          >
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold leading-tight">{name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {details.descricao}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="outline" className="text-primary">
                    {location === 'casa' ? '🏠 Em casa' : '🏋️ Academia'}
                  </Badge>
                  {details.nivel && (
                    <Badge variant="outline" className="text-xs">
                      {details.nivel}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs flex items-center gap-1"
                >
                  <Info className="w-3 h-3" />
                  Detalhes
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  Começar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      {selectedExercise && (
        <ExerciseDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          exerciseData={selectedExercise}
          location={location}
        />
      )}
    </div>
  );
};
