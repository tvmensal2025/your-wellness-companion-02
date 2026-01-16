import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle2, ArrowLeft } from 'lucide-react';

interface GoalsStepProps {
  level: string;
  onAnswer: (value: string) => void;
  onBack: () => void;
  canGoBack: boolean;
}

export const GoalsStep: React.FC<GoalsStepProps> = ({
  level,
  onAnswer,
  onBack,
  canGoBack,
}) => {
  const options = [
    { 
      value: 'sedentario', 
      emoji: '🛋️', 
      title: 'Sedentário', 
      desc: 'Não faço atividades físicas regularmente', 
      color: 'from-slate-500 to-gray-500' 
    },
    { 
      value: 'leve', 
      emoji: '🚶', 
      title: 'Caminho às vezes', 
      desc: 'Faço caminhadas ocasionais', 
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      value: 'moderado', 
      emoji: '🏃', 
      title: 'Faço alguma atividade', 
      desc: 'Já tenho algum condicionamento básico', 
      color: 'from-blue-500 to-purple-500' 
    },
    { 
      value: 'avancado', 
      emoji: '💪', 
      title: 'Treino regularmente', 
      desc: 'Já tenho experiência com exercícios', 
      color: 'from-purple-500 to-pink-500' 
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Qual é o seu nível atual?
        </h3>
        <p className="text-muted-foreground">Seja honesto! Isso nos ajuda a criar o melhor plano para você</p>
      </div>

      <div className="grid gap-3">
        {options.map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              level === option.value 
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
                {level === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
