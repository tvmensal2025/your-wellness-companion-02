import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  MinimalMealLoading,
  CookingMealLoading,
  IngredientsCarouselLoading,
  MacroBarsLoading,
  PlateBuildingLoading,
  PulseRingLoading
} from './MealPlanLoadingVariants';
import { MealPlanLoadingExperience } from './MealPlanLoadingExperience';

// Tipos de loading disponíveis
type LoadingVariant = 
  | 'timeline' 
  | 'minimal' 
  | 'cooking' 
  | 'carousel' 
  | 'macros' 
  | 'plate' 
  | 'pulse';

interface RandomizedMealPlanLoadingProps {
  isLoading: boolean;
  userName?: string;
  objective?: string;
  days?: number;
  calories?: number;
  onComplete?: () => void;
  className?: string;
  // Se quiser forçar uma variante específica
  forceVariant?: LoadingVariant;
}

// Configuração das variantes com pesos (algumas podem aparecer mais)
const LOADING_VARIANTS: { variant: LoadingVariant; weight: number; name: string }[] = [
  { variant: 'timeline', weight: 3, name: 'Timeline Premium' },      // Aparece mais (3x)
  { variant: 'cooking', weight: 2, name: 'Cozinhando' },             // Aparece 2x
  { variant: 'carousel', weight: 2, name: 'Carrossel de Ingredientes' },
  { variant: 'macros', weight: 2, name: 'Barras de Macros' },
  { variant: 'plate', weight: 2, name: 'Montando Prato' },
  { variant: 'minimal', weight: 1, name: 'Minimal' },
  { variant: 'pulse', weight: 1, name: 'Pulse Ring' },
];

// Função para sortear com peso
const getWeightedRandomVariant = (): LoadingVariant => {
  const totalWeight = LOADING_VARIANTS.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of LOADING_VARIANTS) {
    random -= item.weight;
    if (random <= 0) {
      return item.variant;
    }
  }
  
  return 'timeline'; // fallback
};

export const RandomizedMealPlanLoading: React.FC<RandomizedMealPlanLoadingProps> = ({
  isLoading,
  userName = 'você',
  objective = 'seu objetivo',
  days = 7,
  calories = 2000,
  onComplete,
  className,
  forceVariant
}) => {
  // Sorteia a variante apenas quando o loading INICIA
  const [currentVariant, setCurrentVariant] = useState<LoadingVariant>('timeline');
  const [variantName, setVariantName] = useState('');

  useEffect(() => {
    if (isLoading) {
      const selected = forceVariant || getWeightedRandomVariant();
      setCurrentVariant(selected);
      
      const variantInfo = LOADING_VARIANTS.find(v => v.variant === selected);
      setVariantName(variantInfo?.name || '');
      
      console.log(`🎲 Loading sorteado: ${variantInfo?.name || selected}`);
    }
  }, [isLoading, forceVariant]);

  if (!isLoading) return null;

  // Renderiza a variante sorteada
  const renderLoadingVariant = () => {
    switch (currentVariant) {
      case 'timeline':
        return (
          <MealPlanLoadingExperience
            isLoading={isLoading}
            userName={userName}
            objective={objective}
            days={days}
            calories={calories}
            onComplete={onComplete}
          />
        );

      case 'minimal':
        return (
          <LoadingWrapper title="Preparando cardápio..." subtitle={`${days} dias • ${calories} kcal/dia`}>
            <MinimalMealLoading isLoading={isLoading} />
          </LoadingWrapper>
        );

      case 'cooking':
        return (
          <LoadingWrapper title="Cozinhando seu cardápio..." subtitle={`${days} dias • ${calories} kcal/dia`}>
            <CookingMealLoading isLoading={isLoading} />
          </LoadingWrapper>
        );

      case 'carousel':
        return (
          <LoadingWrapper title="Selecionando ingredientes..." subtitle={`${days} dias • ${calories} kcal/dia`}>
            <IngredientsCarouselLoading isLoading={isLoading} />
          </LoadingWrapper>
        );

      case 'macros':
        return (
          <LoadingWrapper title="Calculando nutrientes..." subtitle={`${days} dias • ${calories} kcal/dia`}>
            <MacroBarsLoading isLoading={isLoading} />
          </LoadingWrapper>
        );

      case 'plate':
        return (
          <LoadingWrapper title="Montando suas refeições..." subtitle={`${days} dias • ${calories} kcal/dia`}>
            <PlateBuildingLoading isLoading={isLoading} />
          </LoadingWrapper>
        );

      case 'pulse':
        return (
          <LoadingWrapper title="Gerando cardápio..." subtitle={`${days} dias • ${calories} kcal/dia`}>
            <PulseRingLoading isLoading={isLoading} />
          </LoadingWrapper>
        );

      default:
        return (
          <MealPlanLoadingExperience
            isLoading={isLoading}
            userName={userName}
            objective={objective}
            days={days}
            calories={calories}
            onComplete={onComplete}
          />
        );
    }
  };

  // Usa Portal para renderizar FORA do contexto do Dialog, diretamente no body
  const loadingContent = (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("fixed inset-0 z-[9999]", className)}
          style={{ isolation: 'isolate' }}
        >
          {renderLoadingVariant()}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Renderiza via Portal no document.body para ficar por cima de TUDO
  if (typeof document !== 'undefined') {
    return createPortal(loadingContent, document.body);
  }
  
  return loadingContent;
};

// Wrapper para as variantes menores (centraliza e adiciona contexto)
interface LoadingWrapperProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ title, subtitle, children }) => {
  const [tip, setTip] = useState(0);
  
  const tips = [
    "💡 Dica: Cardápios personalizados consideram suas restrições",
    "🥗 Cada refeição é balanceada para seus objetivos",
    "⚡ A IA analisa milhares de combinações",
    "🎯 Macros calculados com precisão",
    "🍎 Ingredientes frescos e nutritivos"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTip(prev => (prev + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/98 backdrop-blur-md" style={{ isolation: 'isolate' }}>
      <div className="flex flex-col items-center justify-center max-w-md mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            👨‍🍳
          </motion.div>
          <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </motion.div>

        {/* Animation */}
        <div className="mb-6">
          {children}
        </div>

        {/* Rotating tips */}
        <AnimatePresence mode="wait">
          <motion.p
            key={tip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-xs text-muted-foreground"
          >
            {tips[tip]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Export para uso direto das variantes se necessário
export { getWeightedRandomVariant, LOADING_VARIANTS };
export type { LoadingVariant };
