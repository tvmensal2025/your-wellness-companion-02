// ============================================
// 📝 EXERCISE INSTRUCTIONS
// Instruções detalhadas do exercício
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Lightbulb,
  Play,
} from 'lucide-react';

interface ExerciseInstructionsProps {
  name: string;
  instructions: string[];
  tips: string[];
  instructionsSummary: string;
  tipsSummary: string;
  showDetailedInstructions: boolean;
  showDetailedTips: boolean;
  onToggleDetailedInstructions: () => void;
  onToggleDetailedTips: () => void;
  onGoBack: () => void;
  onStartExecution: () => void;
}

export const ExerciseInstructions: React.FC<ExerciseInstructionsProps> = ({
  name,
  instructions,
  tips,
  instructionsSummary,
  tipsSummary,
  showDetailedInstructions,
  showDetailedTips,
  onToggleDetailedInstructions,
  onToggleDetailedTips,
  onGoBack,
  onStartExecution,
}) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{name}</h2>
        <Button variant="ghost" size="sm" onClick={onGoBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      {/* Instruções - Passo a Passo */}
      {instructions.length > 0 && (
        <Card className="border border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/20 overflow-hidden shadow-sm">
          <CardContent className="p-0">
            {/* Header com toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-green-700 dark:text-green-300 text-base">
                    Passo a Passo
                  </span>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">
                    {instructions.length} etapas
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleDetailedInstructions}
                className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
              >
                {showDetailedInstructions ? (
                  <>Resumo <ChevronUp className="w-4 h-4 ml-1" /></>
                ) : (
                  <>Detalhado <ChevronDown className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>

            {/* Conteúdo - Resumo ou Detalhado */}
            <div className="px-4 pb-4">
              {!showDetailedInstructions ? (
                <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-green-100 dark:border-green-900/50">
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                    {instructionsSummary}
                    {instructions.length > 2 && (
                      <span className="text-green-600 dark:text-green-400 font-medium"> +{instructions.length - 2} passos...</span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-0 relative">
                  <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-green-400 via-green-500 to-emerald-500 rounded-full" />
                  
                  {instructions.map((step, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 relative group"
                    >
                      <div className="relative z-10 flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-110 transition-transform duration-200">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-white/80 dark:bg-black/30 rounded-xl p-4 mb-3 border border-green-100 dark:border-green-900/50 shadow-sm group-hover:shadow-md group-hover:bg-white dark:group-hover:bg-black/40 transition-all duration-200">
                        <p className="text-sm text-foreground leading-relaxed">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas do Personal */}
      {tips.length > 0 && (
        <Card className="border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 overflow-hidden shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-blue-700 dark:text-blue-300 text-base">
                    Dicas do Personal
                  </span>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                    {tips.length} {tips.length === 1 ? 'dica' : 'dicas'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleDetailedTips}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                {showDetailedTips ? (
                  <>Resumo <ChevronUp className="w-4 h-4 ml-1" /></>
                ) : (
                  <>Detalhado <ChevronDown className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>

            <div className="px-4 pb-4">
              {!showDetailedTips ? (
                <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                    💡 {tipsSummary}
                    {tips.length > 1 && (
                      <span className="text-blue-600 dark:text-blue-400 font-medium"> +{tips.length - 1} {tips.length === 2 ? 'dica' : 'dicas'}...</span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tips.map((tip, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 bg-white/80 dark:bg-black/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Flame className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed flex-1">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Começar */}
      <Button
        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-200"
        onClick={onStartExecution}
      >
        <Play className="w-4 h-4 mr-2" />
        Começar Exercício
      </Button>
    </div>
  );
};
