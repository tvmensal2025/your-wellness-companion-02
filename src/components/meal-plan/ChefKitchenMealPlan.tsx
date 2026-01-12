import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Sparkles, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMealPlanGeneratorV2 } from '@/hooks/useMealPlanGeneratorV2';
import { WeeklyMealPlanModal } from '@/components/meal-plan/WeeklyMealPlanModal';
import { MealPlanSuccessEffect } from '@/components/meal-plan/MealPlanSuccessEffect';
import { MealPlanLoadingExperience } from '@/components/meal-plan/creative/MealPlanLoadingExperience';
import { MealPlanHistoryDrawer } from '@/components/meal-plan/MealPlanHistoryDrawer';

// ============================================
// DADOS
// ============================================
const MEALS_DATA = [
  { key: 'café da manhã', label: 'Café da Manhã', emoji: '☕', shortLabel: 'Café' },
  { key: 'almoço', label: 'Almoço', emoji: '🍽️', shortLabel: 'Almoço' },
  { key: 'lanche', label: 'Lanche', emoji: '🍎', shortLabel: 'Lanche' },
  { key: 'jantar', label: 'Jantar', emoji: '🌙', shortLabel: 'Jantar' },
  { key: 'ceia', label: 'Ceia', emoji: '🌟', shortLabel: 'Ceia' },
];

// MOCK_HISTORY removido - agora usa dados reais via MealPlanHistoryDrawer

// ============================================
// TIPO PARA REFEIÇÕES
// ============================================
type SelectedMealsType = {
  'café da manhã': boolean;
  'almoço': boolean;
  'lanche': boolean;
  'jantar': boolean;
  'ceia': boolean;
};

// ============================================
// COMPONENTE DE CHAMA
// ============================================
interface FlameProps {
  index: number;
  intensity: 'low' | 'medium' | 'high' | 'max';
}

const Flame: React.FC<FlameProps> = ({ index, intensity }) => {
  const heights = {
    low: { min: 6, max: 12 },
    medium: { min: 10, max: 18 },
    high: { min: 16, max: 28 },
    max: { min: 24, max: 40 },
  };
  
  const speeds = {
    low: 0.5,
    medium: 0.35,
    high: 0.25,
    max: 0.15,
  };

  const h = heights[intensity];
  const baseHeight = h.min + (Math.random() * (h.max - h.min));
  
  return (
    <motion.div
      animate={{ 
        scaleY: [1, 1.5, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{ 
        repeat: Infinity, 
        duration: speeds[intensity] + Math.random() * 0.15,
        delay: index * 0.03
      }}
      className={cn(
        "rounded-full origin-bottom",
        intensity === 'max' ? "w-2.5" : intensity === 'high' ? "w-2" : "w-1.5"
      )}
      style={{
        height: `${baseHeight}px`,
        background: intensity === 'max' 
          ? 'linear-gradient(to top, #dc2626, #ea580c, #f59e0b, #fde047, #fef9c3)'
          : 'linear-gradient(to top, #ea580c, #f59e0b, #fde047)'
      }}
    />
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export const ChefKitchenMealPlan: React.FC = () => {
  const [selectedMeals, setSelectedMeals] = useState<SelectedMealsType>({
    'café da manhã': true,
    'almoço': true,
    'lanche': false,
    'jantar': true,
    'ceia': false
  });
  const [selectedDays, setSelectedDays] = useState(7);
  const [showResultModal, setShowResultModal] = useState(false);

  const { 
    generateMealPlan, 
    isGenerating, 
    generatedPlan,
    showSuccessEffect,
    setShowSuccessEffect 
  } = useMealPlanGeneratorV2();

  const selectedCount = Object.values(selectedMeals).filter(Boolean).length;

  const toggleMeal = (key: keyof SelectedMealsType) => {
    setSelectedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getFlameIntensity = (): 'low' | 'medium' | 'high' | 'max' => {
    if (isGenerating) return 'max';
    if (selectedCount >= 4) return 'medium';
    return 'low';
  };

  const getFlameCount = (): number => {
    if (isGenerating) return 20;
    return Math.max(6, selectedCount * 3);
  };

  const handleGenerate = async () => {
    if (selectedCount === 0) return;

    // Gerar cardápio
    const refeicoesSelecionadas = Object.entries(selectedMeals)
      .filter(([_, selected]) => selected)
      .map(([key]) => key);

    try {
      const result = await generateMealPlan({
        calorias: 2000,
        dias: selectedDays,
        restricoes: [],
        preferencias: [],
        refeicoes_selecionadas: refeicoesSelecionadas
      });

      if (result && result.length > 0) {
        // Mostrar modal com resultado após pequeno delay
        setTimeout(() => {
          setShowResultModal(true);
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao gerar cardápio:', error);
    }
  };

  const flameIntensity = getFlameIntensity();
  const flameCount = getFlameCount();
  const isCooking = isGenerating;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={isCooking ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg"
          >
            <ChefHat className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="font-bold text-lg">Cardápio Personalizado</h2>
            <p className="text-xs text-muted-foreground">
              {isCooking ? '🔥 Preparando seu cardápio...' : 'Selecione as refeições'}
            </p>
          </div>
        </div>
        
        <MealPlanHistoryDrawer />
      </div>

      {/* Área do Fogão com Panela */}
      <motion.div 
        animate={isCooking ? {
          boxShadow: ['0 0 0px rgba(251, 146, 60, 0)', '0 0 30px rgba(251, 146, 60, 0.5)', '0 0 0px rgba(251, 146, 60, 0)']
        } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className="relative bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 overflow-hidden"
      >
        {/* Glow de fundo quando cozinhando */}
        {isCooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-orange-500/30 via-transparent to-transparent"
          />
        )}

        <div className="relative">
          {/* Ingredientes (Refeições) */}
          <div className="flex justify-center gap-2 mb-4">
            {MEALS_DATA.map((meal) => {
              const isSelected = selectedMeals[meal.key as keyof SelectedMealsType];
              return (
                <motion.button
                  key={meal.key}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !isCooking && toggleMeal(meal.key as keyof SelectedMealsType)}
                  disabled={isCooking}
                  className={cn(
                    "relative flex flex-col items-center p-2 rounded-xl transition-all min-w-[56px]",
                    isSelected 
                      ? "bg-white dark:bg-slate-700 shadow-md ring-2 ring-amber-400" 
                      : "bg-white/60 dark:bg-slate-700/60",
                    isCooking && "opacity-70"
                  )}
                >
                  <motion.span 
                    className="text-2xl"
                    animate={isSelected && isCooking ? { 
                      y: [0, -8, 0],
                      rotate: [0, -10, 10, 0]
                    } : isSelected ? {
                      y: [0, -3, 0]
                    } : {}}
                    transition={{ repeat: Infinity, duration: isCooking ? 0.3 : 2 }}
                  >
                    {meal.emoji}
                  </motion.span>
                  <span className="text-[9px] font-medium mt-1 text-center leading-tight">
                    {meal.shortLabel}
                  </span>
                  
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Panela com Fogo */}
          <div className="flex justify-center">
            <div className="relative">
              {/* CHAMAS */}
              <motion.div 
                animate={{ gap: isCooking ? '2px' : '1px' }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex z-0"
              >
                {Array.from({ length: flameCount }).map((_, i) => (
                  <Flame key={i} index={i} intensity={flameIntensity} />
                ))}
              </motion.div>

              {/* Panela */}
              <motion.div
                animate={isCooking ? { 
                  y: [0, -3, 0],
                  rotate: [0, -2, 2, 0]
                } : {}}
                transition={{ repeat: isCooking ? Infinity : 0, duration: 0.15 }}
                className="relative z-10"
              >
                <motion.div 
                  animate={isCooking ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  className="w-32 h-20 bg-gradient-to-b from-slate-500 to-slate-700 dark:from-slate-600 dark:to-slate-800 rounded-b-[40%] rounded-t-lg shadow-xl flex items-center justify-center overflow-hidden"
                >
                  <div className="flex flex-wrap justify-center gap-0.5 p-2">
                    {MEALS_DATA.filter(m => selectedMeals[m.key as keyof SelectedMealsType]).map((meal) => (
                      <motion.span 
                        key={meal.key} 
                        className="text-xl"
                        animate={isCooking ? {
                          y: [0, -5, 0],
                          rotate: [0, 15, -15, 0]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 0.4 }}
                      >
                        {meal.emoji}
                      </motion.span>
                    ))}
                    
                    {selectedCount === 0 && (
                      <span className="text-slate-400 text-xs">Vazio</span>
                    )}
                  </div>
                  
                  {/* Vapor */}
                  {(isCooking || selectedCount > 0) && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
                      {Array.from({ length: isCooking ? 5 : 3 }).map((_, idx) => (
                        <motion.div
                          key={idx}
                          animate={{ 
                            y: [-5, isCooking ? -35 : -20], 
                            opacity: [isCooking ? 0.8 : 0.4, 0],
                            scale: [1, isCooking ? 1.5 : 1.2]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: isCooking ? 0.5 : 1, 
                            delay: idx * 0.15 
                          }}
                          className={cn(
                            "rounded-full",
                            isCooking ? "w-3 h-6 bg-white/60" : "w-2 h-4 bg-white/30"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
                
                <div className="absolute top-3 -left-2 w-4 h-2 bg-slate-600 dark:bg-slate-700 rounded-full shadow" />
                <div className="absolute top-3 -right-2 w-4 h-2 bg-slate-600 dark:bg-slate-700 rounded-full shadow" />
              </motion.div>

              <motion.div 
                animate={isCooking ? {
                  backgroundColor: ['rgb(203 213 225)', 'rgb(251 146 60)', 'rgb(203 213 225)']
                } : {}}
                transition={{ repeat: Infinity, duration: 0.3 }}
                className="w-36 h-3 bg-slate-300 dark:bg-slate-600 rounded-b-lg mx-auto -mt-1 shadow-inner" 
              />
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-3">
            {isCooking 
              ? '👨‍🍳 Preparando seu cardápio personalizado!'
              : `${selectedCount} ${selectedCount === 1 ? 'refeição selecionada' : 'refeições selecionadas'}`
            }
          </p>
        </div>
      </motion.div>

      {/* Seletor de Dias */}
      <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Duração:</span>
        </div>
        
        <div className="flex gap-1">
          {[1, 3, 7].map((days) => (
            <motion.button
              key={days}
              whileTap={{ scale: 0.95 }}
              onClick={() => !isCooking && setSelectedDays(days)}
              disabled={isCooking}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                selectedDays === days
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-background hover:bg-muted"
              )}
            >
              {days} {days === 1 ? 'dia' : 'dias'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Botão Gerar */}
      <motion.button
        whileHover={!isCooking ? { scale: 1.01 } : {}}
        whileTap={!isCooking ? { scale: 0.99 } : {}}
        onClick={handleGenerate}
        disabled={selectedCount === 0 || isCooking}
        className={cn(
          "w-full py-4 rounded-xl font-bold text-base transition-all",
          "bg-gradient-to-r from-amber-500 to-orange-500",
          "text-white shadow-lg shadow-amber-500/25",
          "flex items-center justify-center gap-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isCooking && "animate-pulse"
        )}
      >
        {isCooking ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
            >
              <ChefHat className="w-5 h-5" />
            </motion.div>
            Cozinhando...
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
            >
              🔥
            </motion.span>
          </>
        ) : (
          <>
            <ChefHat className="w-5 h-5" />
            Gerar Cardápio
            <Sparkles className="w-4 h-4" />
          </>
        )}
      </motion.button>

      <p className="text-center text-[11px] text-muted-foreground">
        💡 Quanto mais refeições, mais completo seu cardápio!
      </p>

      {/* Loading Experience - Tela cheia durante geração */}
      <MealPlanLoadingExperience
        isLoading={isGenerating}
        days={selectedDays}
        calories={2000}
        objective="Alimentação saudável"
      />

      {/* Modal com Resultado */}
      <WeeklyMealPlanModal
        open={showResultModal}
        onOpenChange={setShowResultModal}
        mealPlan={generatedPlan.map(day => ({
          ...day,
          dailyTotals: {
            calories: day.dailyTotals?.calories || 0,
            protein: day.dailyTotals?.protein || 0,
            carbs: day.dailyTotals?.carbs || 0,
            fat: day.dailyTotals?.fat || 0,
            fiber: day.dailyTotals?.fiber || 0
          }
        }))}
      />

      {/* Efeito de Sucesso */}
      <MealPlanSuccessEffect
        isVisible={showSuccessEffect}
        onClose={() => setShowSuccessEffect(false)}
        mealPlanData={generatedPlan.length > 0 ? {
          type: generatedPlan.length > 1 ? 'weekly' : 'daily',
          title: `Cardápio ${generatedPlan.length > 1 ? 'Semanal' : 'Diário'}`,
          summary: {
            calories: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.calories, 0) / generatedPlan.length),
            protein: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.protein, 0) / generatedPlan.length),
            carbs: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.carbs, 0) / generatedPlan.length),
            fat: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.fat, 0) / generatedPlan.length),
            fiber: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.fiber, 0) / generatedPlan.length)
          }
        } : undefined}
      />
    </div>
  );
};

export default ChefKitchenMealPlan;
