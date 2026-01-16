import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Star, Trophy, Timer } from 'lucide-react';

interface WelcomeStepProps {
  onStart: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart }) => {
  return (
    <div className="text-center py-6 space-y-6 md:py-8 md:space-y-8">
      <div className="relative">
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center animate-pulse shadow-2xl">
              <Sparkles className="w-10 h-10 md:w-16 md:h-16 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-800" />
            </div>
          </div>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Bem-vindo ao seu Início Saudável! 👋
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-md mx-auto">
            "Nunca é tarde para começar. Cada passo conta!"
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl">
        <CardContent className="p-4 md:p-8 space-y-3 md:space-y-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            <h3 className="text-lg md:text-xl font-bold text-emerald-800 dark:text-emerald-200">
              Programa Personalizado
            </h3>
          </div>
          
          <p className="font-medium text-center text-gray-700 dark:text-gray-300 text-sm md:text-base">
            Vamos descobrir o melhor programa para você!
          </p>
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            Responda algumas perguntas rápidas e criaremos um plano 100% personalizado
          </p>
          
          <div className="flex justify-center gap-3 md:gap-4 pt-1 md:pt-2">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[11px] md:text-xs px-2 py-1">
              <Timer className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              3 minutos
            </Badge>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 text-[11px] md:text-xs px-2 py-1">
              <Star className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Personalizado
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 md:pt-4">
        <Button 
          size="lg" 
          className="w-full max-w-md bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold py-4 md:py-6 text-base md:text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
          onClick={onStart}
        >
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 animate-pulse" />
          Começar minha jornada
          <ArrowRight className="ml-2 md:ml-3 w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </div>
    </div>
  );
};
