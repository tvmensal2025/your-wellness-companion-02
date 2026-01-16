import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, CheckCircle2, ArrowLeft } from 'lucide-react';

interface EquipmentStepProps {
  location: string;
  onAnswer: (value: string) => void;
  onBack: () => void;
  canGoBack: boolean;
}

export const EquipmentStep: React.FC<EquipmentStepProps> = ({
  location,
  onAnswer,
  onBack,
  canGoBack,
}) => {
  const options = [
    { 
      value: 'casa_basico', 
      emoji: '🏠', 
      title: 'Apenas móveis de casa', 
      desc: 'Cadeira, mesa, escada, parede, toalha', 
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      value: 'casa_elastico', 
      emoji: '🎯', 
      title: 'Tenho elástico de exercício', 
      desc: 'Móveis + elástico/faixa de resistência', 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      value: 'casa_completo', 
      emoji: '💪', 
      title: 'Tenho alguns equipamentos', 
      desc: 'Elástico + mochila com peso + barra de porta', 
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Home className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Quais itens você tem em casa?
        </h3>
        <p className="text-sm text-muted-foreground">Isso nos ajuda a personalizar seus exercícios</p>
      </div>

      <div className="grid gap-3">
        {options.map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              location === option.value 
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
                {location === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dica sobre equipamentos */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Dica:</strong> Você pode usar garrafas de água como peso, 
              uma mochila com livros, ou uma toalha para exercícios de resistência!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
