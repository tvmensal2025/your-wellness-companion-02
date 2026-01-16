import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ExperienceStepProps {
  experience: string;
  onAnswer: (value: string) => void;
  onBack: () => void;
  canGoBack: boolean;
}

export const ExperienceStep: React.FC<ExperienceStepProps> = ({
  experience,
  onAnswer,
  onBack,
  canGoBack,
}) => {
  const options = [
    { 
      value: 'nenhuma', 
      emoji: '🌱', 
      title: 'Nenhuma', 
      desc: 'Nunca treinei com pesos', 
      color: 'from-green-500 to-teal-500' 
    },
    { 
      value: 'pouca', 
      emoji: '📚', 
      title: 'Pouca', 
      desc: 'Já fiz algumas vezes mas parei', 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      value: 'moderada', 
      emoji: '🎯', 
      title: 'Moderada', 
      desc: 'Conheço os exercícios básicos', 
      color: 'from-purple-500 to-indigo-500' 
    },
    { 
      value: 'avancada', 
      emoji: '🏆', 
      title: 'Avançada', 
      desc: 'Domino técnicas e periodização', 
      color: 'from-amber-500 to-yellow-500' 
    },
  ];

  return (
    <div className="space-y-6 py-4 relative">
      {canGoBack && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack} 
          className="absolute top-0 left-0 gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      )}
      
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
          Qual sua experiência com musculação?
        </h3>
        <p className="text-muted-foreground">Isso nos ajuda a definir a complexidade dos exercícios</p>
      </div>

      <div className="grid gap-3">
        {options.map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              experience === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onAnswer(option.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{option.title}</h4>
                  <p className="text-sm opacity-80">{option.desc}</p>
                </div>
                {experience === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
