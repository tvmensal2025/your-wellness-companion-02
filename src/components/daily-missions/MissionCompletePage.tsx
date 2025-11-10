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
  onContinue
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-3xl">
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl p-8 text-center text-white relative overflow-hidden shadow-2xl mb-6">
          {/* Efeitos de fundo animados */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6 animate-scale-in">
              <Trophy className="h-12 w-12 text-yellow-300 animate-bounce" />
              <h1 className="text-4xl font-bold">Missão Completa!</h1>
              <Trophy className="h-12 w-12 text-yellow-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            
            <p className="text-xl text-white/90 font-medium mb-4">
              🎉 Parabéns! Você completou todas as reflexões de hoje!
            </p>
            
            {/* Pontos ganhos - Destaque */}
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-2xl border-2 border-white/30">
              <Star className="h-8 w-8 text-yellow-300 fill-yellow-300 animate-pulse" />
              <span className="text-3xl font-bold">{totalPoints}</span>
              <span className="text-xl">pontos ganhos!</span>
              <Star className="h-8 w-8 text-yellow-300 fill-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            {/* Título do resumo */}
            <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              📋 Resumo das suas Respostas
            </h3>

            {/* Lista de respostas em grid */}
            <div className="grid gap-4 mb-8 max-h-[400px] overflow-y-auto pr-2">
              {questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 border-2 border-purple-100 dark:border-gray-600 hover:shadow-lg transition-all duration-200 animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2 leading-tight">
                        {question.question}
                      </p>
                      <Badge 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-3 py-1 border-0 font-medium"
                      >
                        {answers[question.id] || 'Não respondido'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mensagem motivacional */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-6 mb-6 text-center">
              <p className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                ✨ Você está no caminho certo!
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Continue assim e alcance seus objetivos dia após dia
              </p>
            </div>

            {/* Botão de continuar */}
            <Button 
              onClick={onContinue}
              className="w-full h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white text-lg font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
            >
              <CheckCircle className="mr-3 h-6 w-6" />
              Continuar para o Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Efeito de confete melhorado */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              <div className={`w-3 h-3 rounded-full shadow-lg ${
                ['bg-yellow-400', 'bg-purple-400', 'bg-pink-400', 'bg-orange-400', 'bg-green-400'][
                  Math.floor(Math.random() * 5)
                ]
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
