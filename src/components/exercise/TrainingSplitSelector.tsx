import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export type TrainingSplit = 'AB' | 'ABC' | 'ABCD' | 'ABCDE' | 'fullbody';

interface TrainingSplitSelectorProps {
  value: TrainingSplit | '';
  onChange: (split: TrainingSplit) => void;
  frequency: string;
  level: string;
}

const SPLITS = [
  {
    value: 'fullbody' as TrainingSplit,
    emoji: '🔄',
    title: 'Full Body',
    desc: 'Corpo todo a cada treino',
    color: 'from-green-500 to-emerald-500',
    recommended: ['2-3x'],
    levels: ['sedentario', 'leve']
  },
  {
    value: 'AB' as TrainingSplit,
    emoji: '🅰️🅱️',
    title: 'AB (2 divisões)',
    desc: 'Push/Pull ou Superior/Inferior',
    color: 'from-blue-500 to-cyan-500',
    recommended: ['2-3x', '4-5x'],
    levels: ['leve', 'moderado']
  },
  {
    value: 'ABC' as TrainingSplit,
    emoji: '🔤',
    title: 'ABC (3 divisões)',
    desc: 'Peito+Tríceps / Costas+Bíceps / Pernas',
    color: 'from-purple-500 to-indigo-500',
    recommended: ['2-3x', '4-5x', '6x'],
    levels: ['moderado', 'avancado']
  },
  {
    value: 'ABCD' as TrainingSplit,
    emoji: '📊',
    title: 'ABCD (4 divisões)',
    desc: 'Peito / Costas / Pernas / Ombros+Braços',
    color: 'from-orange-500 to-red-500',
    recommended: ['4-5x', '6x'],
    levels: ['moderado', 'avancado']
  },
  {
    value: 'ABCDE' as TrainingSplit,
    emoji: '🏆',
    title: 'ABCDE (5 divisões)',
    desc: 'Um grupo muscular por dia',
    color: 'from-pink-500 to-rose-500',
    recommended: ['4-5x', '6x'],
    levels: ['avancado']
  },
];

export const TrainingSplitSelector: React.FC<TrainingSplitSelectorProps> = ({
  value,
  onChange,
  frequency,
  level
}) => {
  // Filtrar splits disponíveis baseado na frequência e nível
  const availableSplits = SPLITS.filter(split => {
    const frequencyMatch = split.recommended.includes(frequency);
    const levelMatch = split.levels.includes(level);
    return frequencyMatch || levelMatch;
  });

  // Se não há splits disponíveis, mostrar todos exceto ABCDE para iniciantes
  const splitsToShow = availableSplits.length > 0 
    ? availableSplits 
    : SPLITS.filter(s => level !== 'sedentario' || s.value !== 'ABCDE');

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          Baseado na sua frequência ({frequency}) e nível
        </p>
      </div>

      <div className="grid gap-3">
        {splitsToShow.map((split) => {
          const isRecommended = split.recommended.includes(frequency) && split.levels.includes(level);
          
          return (
            <Card 
              key={split.value}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                value === split.value 
                  ? `bg-gradient-to-r ${split.color} text-white shadow-2xl` 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onChange(split.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{split.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{split.title}</h4>
                      {isRecommended && value !== split.value && (
                        <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <p className="text-sm opacity-80">{split.desc}</p>
                  </div>
                  {value === split.value && <CheckCircle2 className="w-5 h-5" />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Explicação do split selecionado */}
      {value && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">Como funciona o {value}:</h4>
            {value === 'fullbody' && (
              <p className="text-sm text-muted-foreground">
                Treina todos os grupos musculares em cada sessão. Ideal para 2-3x/semana com recuperação entre dias.
              </p>
            )}
            {value === 'AB' && (
              <p className="text-sm text-muted-foreground">
                Alterna entre dois treinos: A (Superior/Push) e B (Inferior/Pull). Ideal para 3-4x/semana.
              </p>
            )}
            {value === 'ABC' && (
              <p className="text-sm text-muted-foreground">
                Três treinos diferentes: A (Peito+Tríceps), B (Costas+Bíceps), C (Pernas+Ombros). Repete o ciclo.
              </p>
            )}
            {value === 'ABCD' && (
              <p className="text-sm text-muted-foreground">
                Quatro treinos: A (Peito), B (Costas), C (Pernas), D (Ombros+Braços). Mais volume por grupo.
              </p>
            )}
            {value === 'ABCDE' && (
              <p className="text-sm text-muted-foreground">
                Cinco treinos dedicados: A (Peito), B (Costas), C (Pernas), D (Ombros), E (Braços). Máximo volume.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrainingSplitSelector;
