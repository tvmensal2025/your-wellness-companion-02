import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Home, Building2, Info, Play } from 'lucide-react';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { exerciseInstructions } from '@/data/exercise-instructions';

interface ExerciseDashboardProps {
  user: User | null;
}

// Novo dashboard de exercícios
// Foco: lista simples de exercícios + modal detalhado individual (estilo print)
export const ExerciseDashboard: React.FC<ExerciseDashboardProps> = () => {
  const [location, setLocation] = useState<'casa' | 'academia'>('casa');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      {/* Cabeçalho simples mobile-first */}
      <header className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          Exercícios
        </p>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-orange-600" />
          Seu treino de hoje
        </h2>
        <p className="text-xs text-muted-foreground max-w-md">
          Escolha um exercício para ver os detalhes, vídeo e instruções passo a passo.
        </p>
      </header>

      {/* Filtro de localização (Em casa / Academia) */}
      <section className="flex gap-2">
        <Button
          size="sm"
          variant={location === 'casa' ? 'default' : 'outline'}
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => setLocation('casa')}
        >
          <Home className="w-4 h-4" />
          Em casa
        </Button>
        <Button
          size="sm"
          variant={location === 'academia' ? 'default' : 'outline'}
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => setLocation('academia')}
        >
          <Building2 className="w-4 h-4" />
          Academia
        </Button>
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
