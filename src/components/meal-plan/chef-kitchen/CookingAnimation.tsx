import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================
export type SelectedMealsType = {
  'café da manhã': boolean;
  'almoço': boolean;
  'lanche': boolean;
  'jantar': boolean;
  'ceia': boolean;
};

export interface CookingAnimationProps {
  selectedMeals: SelectedMealsType;
  onToggleMeal: (key: keyof SelectedMealsType) => void;
  isGenerating: boolean;
  selectedCount: number;
  onGenerate: () => void;
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================
const MEALS_DATA = [
  { key: 'café da manhã', emoji: '☕', shortLabel: 'Café' },
  { key: 'almoço', emoji: '🍽️', shortLabel: 'Almoço' },
  { key: 'lanche', emoji: '🍎', shortLabel: 'Lanche' },
  { key: 'jantar', emoji: '🌙', shortLabel: 'Jantar' },
  { key: 'ceia', emoji: '🌟', shortLabel: 'Ceia' },
];

// ============================================
// INTERNAL COMPONENTS
// ============================================

/**
 * AnimatedFlame - Componente interno para renderizar chamas animadas
 */
const AnimatedFlame: React.FC<{ index: number; intensity: number }> = ({ index, intensity }) => {
  const baseHeight = 8 + (intensity * 4) + (Math.random() * 8);
  const duration = 0.3 - (intensity * 0.05);
  
  return (
    <motion.div
      animate={{ scaleY: [1, 1.4 + (intensity * 0.2), 1], opacity: [0.7, 1, 0.7] }}
      transition={{ repeat: Infinity, duration: duration + Math.random() * 0.1, delay: index * 0.02 }}
      className="w-1.5 rounded-full origin-bottom"
      style={{
        height: `${baseHeight}px`,
        background: intensity > 3 
          ? 'linear-gradient(to top, #dc2626, #ea580c, #f59e0b, #fde047)'
          : 'linear-gradient(to top, #ea580c, #f59e0b, #fde047)'
      }}
    />
  );
};

/**
 * MealIngredientButton - Botão de seleção de refeição (ingrediente)
 */
const MealIngredientButton: React.FC<{
  meal: typeof MEALS_DATA[0];
  isSelected: boolean;
  isGenerating: boolean;
  onToggle: () => void;
}> = ({ meal, isSelected, isGenerating, onToggle }) => {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => !isGenerating && onToggle()}
      disabled={isGenerating}
      className={cn(
        "relative flex flex-col items-center p-2.5 rounded-xl transition-all min-w-[56px]",
        isSelected ? "bg-white/20 ring-2 ring-amber-400 shadow-lg" : "bg-white/5 hover:bg-white/10"
      )}
    >
      <motion.span 
        className="text-2xl"
        animate={isSelected && isGenerating ? { y: [0, -6, 0], rotate: [0, -8, 8, 0] } : isSelected ? { y: [0, -2, 0] } : {}}
        transition={{ repeat: Infinity, duration: isGenerating ? 0.3 : 2 }}
      >
        {meal.emoji}
      </motion.span>
      <span className="text-[10px] font-medium text-white/80 mt-1">{meal.shortLabel}</span>
      {isSelected && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center"
        >
          <span className="text-[10px] text-white">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
};

/**
 * CookingPot - Componente da panela com chamas e vapor
 */
const CookingPot: React.FC<{
  selectedMeals: SelectedMealsType;
  selectedCount: number;
  isGenerating: boolean;
}> = ({ selectedMeals, selectedCount, isGenerating }) => {
  const flameIntensity = Math.min(5, selectedCount);

  return (
    <div className="flex justify-center">
      <div className="relative">
        {/* Chamas */}
        <motion.div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 z-0">
          {Array.from({ length: 12 + (flameIntensity * 2) }).map((_, i) => (
            <AnimatedFlame key={i} index={i} intensity={isGenerating ? 5 : flameIntensity} />
          ))}
        </motion.div>

        {/* Corpo da panela */}
        <motion.div
          animate={isGenerating ? { y: [0, -2, 0], rotate: [0, -1, 1, 0] } : {}}
          transition={{ repeat: Infinity, duration: 0.15 }}
          className="relative z-10"
        >
          <div className="w-28 h-16 bg-gradient-to-b from-slate-500 to-slate-700 rounded-b-[45%] rounded-t-lg shadow-xl flex items-center justify-center overflow-hidden border-t-2 border-slate-400/30">
            <div className="flex flex-wrap justify-center gap-0.5 p-1">
              {MEALS_DATA.filter(m => selectedMeals[m.key as keyof SelectedMealsType]).map((meal) => (
                <motion.span 
                  key={meal.key} 
                  className="text-lg"
                  animate={isGenerating ? { y: [0, -4, 0], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                >
                  {meal.emoji}
                </motion.span>
              ))}
              {selectedCount === 0 && <span className="text-slate-400 text-[10px]">Vazio</span>}
            </div>
            
            {/* Vapor */}
            {selectedCount > 0 && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-1">
                {Array.from({ length: isGenerating ? 5 : 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [-4, isGenerating ? -25 : -15], opacity: [0.6, 0], scale: [1, 1.3] }}
                    transition={{ repeat: Infinity, duration: isGenerating ? 0.4 : 0.8, delay: i * 0.1 }}
                    className="w-2 h-4 bg-white/40 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Alças */}
          <div className="absolute top-2 -left-1.5 w-3 h-1.5 bg-slate-600 rounded-full" />
          <div className="absolute top-2 -right-1.5 w-3 h-1.5 bg-slate-600 rounded-full" />
        </motion.div>

        {/* Base do fogão */}
        <div className="w-32 h-2.5 bg-slate-600 rounded-b-lg mx-auto -mt-0.5 shadow-inner" />
      </div>
    </div>
  );
};

/**
 * GenerateButton - Botão de gerar cardápio
 */
const GenerateButton: React.FC<{
  selectedCount: number;
  isGenerating: boolean;
  onGenerate: () => void;
}> = ({ selectedCount, isGenerating, onGenerate }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onGenerate}
      disabled={selectedCount === 0 || isGenerating}
      className={cn(
        "w-full py-3.5 rounded-xl font-bold text-base",
        "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
        "shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2",
        "disabled:opacity-50"
      )}
    >
      <ChefHat className="w-5 h-5" />
      {isGenerating ? 'Cozinhando...' : 'Gerar Cardápio'}
      <Sparkles className="w-4 h-4" />
    </motion.button>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * CookingAnimation - Componente de animação de cozinha
 * 
 * Inclui:
 * - Panela animada com chamas
 * - Botões de seleção de refeições (ingredientes)
 * - Vapor e efeitos visuais
 * - Botão de gerar cardápio
 * 
 * @example
 * ```tsx
 * <CookingAnimation
 *   selectedMeals={selectedMeals}
 *   onToggleMeal={toggleMeal}
 *   isGenerating={isGenerating}
 *   selectedCount={selectedCount}
 *   onGenerate={handleGenerate}
 * />
 * ```
 */
export const CookingAnimation: React.FC<CookingAnimationProps> = ({
  selectedMeals,
  onToggleMeal,
  isGenerating,
  selectedCount,
  onGenerate,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* PANELA COM FOGO - Design Criativo */}
      <motion.div 
        className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-5 overflow-hidden"
        animate={isGenerating ? { boxShadow: ['0 0 0 rgba(251,146,60,0)', '0 0 30px rgba(251,146,60,0.5)', '0 0 0 rgba(251,146,60,0)'] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        {/* Glow de fundo */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          selectedCount > 0 ? "opacity-30" : "opacity-0"
        )} style={{ background: 'radial-gradient(ellipse at bottom, rgba(251,146,60,0.4), transparent 70%)' }} />

        {/* Ingredientes (Refeições) */}
        <div className="relative flex justify-center gap-2.5 mb-4">
          {MEALS_DATA.map((meal) => (
            <MealIngredientButton
              key={meal.key}
              meal={meal}
              isSelected={selectedMeals[meal.key as keyof SelectedMealsType]}
              isGenerating={isGenerating}
              onToggle={() => onToggleMeal(meal.key as keyof SelectedMealsType)}
            />
          ))}
        </div>

        {/* Panela */}
        <CookingPot
          selectedMeals={selectedMeals}
          selectedCount={selectedCount}
          isGenerating={isGenerating}
        />

        <p className="text-center text-xs text-white/60 mt-3">
          {isGenerating ? '🔥 Cozinhando...' : `${selectedCount} refeições na panela`}
        </p>
      </motion.div>

      {/* BOTÃO GERAR */}
      <GenerateButton
        selectedCount={selectedCount}
        isGenerating={isGenerating}
        onGenerate={onGenerate}
      />
    </div>
  );
};

export default CookingAnimation;
