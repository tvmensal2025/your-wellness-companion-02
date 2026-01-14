// ============================================
// 📚 FEATURE TUTORIAL POPUP
// Popup explicativo com opção "não mostrar novamente"
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Trophy, 
  UserPlus, 
  Radio, 
  Heart,
  Dumbbell,
  Target,
  Zap,
  Crown,
  Medal,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type TutorialFeature = 
  | 'ranking_treino'
  | 'ranking_grupo'
  | 'ranking_parceiro'
  | 'grupos_treino'
  | 'parceiro_treino'
  | 'sessao_ao_vivo'
  | 'encorajamentos';

interface TutorialContent {
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  color: string;
}

const TUTORIAL_CONTENT: Record<TutorialFeature, TutorialContent> = {
  ranking_treino: {
    title: '🏆 Ranking de Treino',
    description: 'Veja sua posição no ranking geral de treinos! Quanto mais você treina, mais pontos ganha.',
    icon: <Trophy className="w-8 h-8" />,
    tips: [
      'Complete treinos para ganhar pontos',
      'Mantenha dias seguidos treinando para bônus',
      'Treinos mais longos = mais pontos',
      'Bata recordes pessoais para pontos extras'
    ],
    color: 'from-yellow-500 to-amber-600'
  },
  ranking_grupo: {
    title: '👥 Ranking do Grupo',
    description: 'Compare seu desempenho com os membros do seu grupo de treino!',
    icon: <Users className="w-8 h-8" />,
    tips: [
      'Entre em um grupo para competir',
      'Grupos podem ter até 50 membros',
      'Participe de desafios em grupo',
      'Motive seus colegas de treino'
    ],
    color: 'from-blue-500 to-indigo-600'
  },
  ranking_parceiro: {
    title: '🤝 Ranking com Parceiro',
    description: 'Acompanhe o progresso do seu parceiro de treino e compitam juntos!',
    icon: <UserPlus className="w-8 h-8" />,
    tips: [
      'Encontre um parceiro compatível',
      'Treinem nos mesmos horários',
      'Enviem encorajamentos mútuos',
      'Compitam de forma saudável'
    ],
    color: 'from-purple-500 to-pink-600'
  },
  grupos_treino: {
    title: '👥 Grupos de Treino',
    description: 'Participe de grupos para treinar com pessoas com objetivos similares!',
    icon: <Users className="w-8 h-8" />,
    tips: [
      'Crie seu próprio grupo ou entre em um existente',
      'Grupos públicos são abertos a todos',
      'Participe de desafios exclusivos do grupo',
      'Converse e motive outros membros'
    ],
    color: 'from-emerald-500 to-teal-600'
  },
  parceiro_treino: {
    title: '🤝 Parceiro de Treino',
    description: 'Encontre um parceiro compatível para treinar junto e se motivar!',
    icon: <UserPlus className="w-8 h-8" />,
    tips: [
      'O sistema encontra parceiros com objetivos similares',
      'Compatibilidade baseada em horários e nível',
      'Envie convites para potenciais parceiros',
      'Treinem juntos mesmo à distância'
    ],
    color: 'from-rose-500 to-red-600'
  },
  sessao_ao_vivo: {
    title: '📡 Sessão ao Vivo',
    description: 'Participe de treinos ao vivo com outros usuários em tempo real!',
    icon: <Radio className="w-8 h-8" />,
    tips: [
      'Entre em sessões ativas para treinar junto',
      'Crie sua própria sessão e convide amigos',
      'Veja quem está treinando agora',
      'Receba motivação em tempo real'
    ],
    color: 'from-red-500 to-orange-600'
  },
  encorajamentos: {
    title: '💪 Encorajamentos',
    description: 'Envie e receba motivação de outros usuários da comunidade!',
    icon: <Heart className="w-8 h-8" />,
    tips: [
      'Envie "high fives" para motivar',
      'Celebre conquistas de outros',
      'Receba notificações de apoio',
      'Construa uma comunidade positiva'
    ],
    color: 'from-pink-500 to-rose-600'
  }
};

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

const STORAGE_KEY = 'exercise_tutorial_dismissed';

export const getTutorialDismissed = (feature: TutorialFeature): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const dismissed = JSON.parse(stored) as string[];
    return dismissed.includes(feature);
  } catch {
    return false;
  }
};

export const setTutorialDismissed = (feature: TutorialFeature, dismissed: boolean): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let dismissedList: string[] = stored ? JSON.parse(stored) : [];
    
    if (dismissed && !dismissedList.includes(feature)) {
      dismissedList.push(feature);
    } else if (!dismissed) {
      dismissedList = dismissedList.filter(f => f !== feature);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissedList));
  } catch {
    // Ignore storage errors
  }
};

export const resetAllTutorials = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
};

// ============================================
// HOOK
// ============================================

export const useFeatureTutorial = (feature: TutorialFeature) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dismissed = getTutorialDismissed(feature);
    setShouldShow(!dismissed);
  }, [feature]);

  const showTutorial = () => {
    if (shouldShow) {
      setIsOpen(true);
    }
  };

  const closeTutorial = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      setTutorialDismissed(feature, true);
      setShouldShow(false);
    }
    setIsOpen(false);
  };

  return {
    shouldShow,
    isOpen,
    showTutorial,
    closeTutorial,
    content: TUTORIAL_CONTENT[feature]
  };
};

// ============================================
// COMPONENT
// ============================================

interface FeatureTutorialPopupProps {
  feature: TutorialFeature;
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export const FeatureTutorialPopup: React.FC<FeatureTutorialPopupProps> = ({
  feature,
  isOpen,
  onClose
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const content = TUTORIAL_CONTENT[feature];

  const handleClose = () => {
    onClose(dontShowAgain);
    setDontShowAgain(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-md p-0 overflow-hidden">
        {/* Header com gradiente */}
        <div className={cn(
          "p-6 text-white bg-gradient-to-br",
          content.color
        )}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              {content.icon}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {content.title}
              </DialogTitle>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          <DialogDescription className="text-base text-foreground">
            {content.description}
          </DialogDescription>

          {/* Dicas */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">
              💡 Dicas:
            </h4>
            <ul className="space-y-2">
              {content.tips.map((tip, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm"
                >
                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Checkbox "Não mostrar novamente" */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label 
              htmlFor="dont-show-again"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Não mostrar novamente
            </label>
          </div>

          {/* Botão */}
          <Button 
            className={cn(
              "w-full text-white bg-gradient-to-r",
              content.color
            )}
            onClick={handleClose}
          >
            Entendi! 👍
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureTutorialPopup;
