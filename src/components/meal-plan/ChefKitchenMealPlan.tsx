import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Sparkles, Calendar, Target, Heart, X, Plus, ChevronDown, ChevronUp, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMealPlanGeneratorV2 } from '@/hooks/useMealPlanGeneratorV2';
import { useUserFoodPreferences } from '@/hooks/useUserFoodPreferences';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { WeeklyMealPlanModal } from '@/components/meal-plan/WeeklyMealPlanModal';
import { MealPlanSuccessEffect } from '@/components/meal-plan/MealPlanSuccessEffect';
import { MealPlanLoadingExperience } from '@/components/meal-plan/creative/MealPlanLoadingExperience';
import { MealPlanHistoryDrawer } from '@/components/meal-plan/MealPlanHistoryDrawer';
import { NutritionObjective, calculateNutritionalGoals, PhysicalData } from '@/utils/macro-calculator';

// ============================================
// DADOS
// ============================================
const MEALS_DATA = [
  { key: 'café da manhã', emoji: '☕', shortLabel: 'Café' },
  { key: 'almoço', emoji: '🍽️', shortLabel: 'Almoço' },
  { key: 'lanche', emoji: '🍎', shortLabel: 'Lanche' },
  { key: 'jantar', emoji: '🌙', shortLabel: 'Jantar' },
  { key: 'ceia', emoji: '🌟', shortLabel: 'Ceia' },
];

const OBJECTIVES = [
  { value: NutritionObjective.LOSE, label: 'Emagrecer', emoji: '🔥', color: 'from-red-500 to-orange-500' },
  { value: NutritionObjective.MAINTAIN, label: 'Manter', emoji: '⚖️', color: 'from-blue-500 to-cyan-500' },
  { value: NutritionObjective.GAIN, label: 'Ganhar', emoji: '💪', color: 'from-green-500 to-emerald-500' },
  { value: NutritionObjective.LEAN_MASS, label: 'Hipertrofia', emoji: '🏋️', color: 'from-purple-500 to-violet-500' },
];

type SelectedMealsType = {
  'café da manhã': boolean;
  'almoço': boolean;
  'lanche': boolean;
  'jantar': boolean;
  'ceia': boolean;
};

// ============================================
// COMPONENTE DE CHAMA ANIMADA
// ============================================
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
  const [selectedObjective, setSelectedObjective] = useState<NutritionObjective>(NutritionObjective.MAINTAIN);
  const [showPreferences, setShowPreferences] = useState(false);
  const [newPreference, setNewPreference] = useState('');
  const [newRestriction, setNewRestriction] = useState('');
  const [localPreferences, setLocalPreferences] = useState<string[]>([]);
  const [localRestrictions, setLocalRestrictions] = useState<string[]>([]);

  const { generateMealPlan, isGenerating, generatedPlan, showSuccessEffect, setShowSuccessEffect } = useMealPlanGeneratorV2();
  const { getRestrictionsArray, getPreferencesArray, addPreference, removePreference, restrictions, preferences, loading: loadingPreferences } = useUserFoodPreferences();
  const { physicalData, measurements, loading: loadingPhysical } = useWeightMeasurement();

  const selectedCount = Object.values(selectedMeals).filter(Boolean).length;
  const flameIntensity = Math.min(5, selectedCount);
  
  // Carregar preferências salvas
  useEffect(() => {
    if (!loadingPreferences) {
      setLocalRestrictions(getRestrictionsArray() || []);
      setLocalPreferences(getPreferencesArray() || []);
    }
  }, [loadingPreferences]);

  // Calcular metas nutricionais personalizadas baseadas nos dados do usuário
  const nutritionalGoals = useMemo(() => {
    // Pegar peso mais recente das medições ou dos dados físicos
    const latestWeight = measurements?.[0]?.peso_kg || physicalData?.peso_kg;
    
    if (!latestWeight) {
      // Valores padrão se não tiver dados
      return { calories: 2000, protein: 150, carbs: 200, fat: 65, fiber: 25 };
    }

    const userData: PhysicalData = {
      peso_kg: latestWeight,
      altura_cm: physicalData?.altura_cm,
      idade: physicalData?.idade,
      sexo: physicalData?.sexo,
      nivel_atividade: physicalData?.nivel_atividade
    };

    return calculateNutritionalGoals(selectedObjective, userData);
  }, [selectedObjective, physicalData, measurements]);

  // Verificar se tem dados do usuário
  const hasUserData = !!(measurements?.[0]?.peso_kg || physicalData?.peso_kg);
  const userWeight = measurements?.[0]?.peso_kg || physicalData?.peso_kg;

  const getObjectiveLabel = () => OBJECTIVES.find(o => o.value === selectedObjective)?.label || 'Manter';
  const getObjectiveColor = () => OBJECTIVES.find(o => o.value === selectedObjective)?.color || 'from-blue-500 to-cyan-500';

  const toggleMeal = (key: keyof SelectedMealsType) => setSelectedMeals(prev => ({ ...prev, [key]: !prev[key] }));
  
  const handleAddPreference = async () => {
    const food = newPreference.trim().toLowerCase();
    if (food && !localPreferences.includes(food)) {
      await addPreference(food, 'preference');
      setLocalPreferences(prev => [...prev, food]);
      setNewPreference('');
    }
  };
  
  const handleRemovePreference = async (food: string) => {
    const pref = preferences?.find(p => p.food_name === food);
    if (pref) await removePreference(pref.id);
    setLocalPreferences(prev => prev.filter(f => f !== food));
  };
  
  const handleAddRestriction = async () => {
    const food = newRestriction.trim().toLowerCase();
    if (food && !localRestrictions.includes(food)) {
      await addPreference(food, 'restriction');
      setLocalRestrictions(prev => [...prev, food]);
      setNewRestriction('');
    }
  };
  
  const handleRemoveRestriction = async (food: string) => {
    const rest = restrictions?.find(r => r.food_name === food);
    if (rest) await removePreference(rest.id);
    setLocalRestrictions(prev => prev.filter(f => f !== food));
  };

  const handleGenerate = async () => {
    if (selectedCount === 0) return;
    const refeicoes = Object.entries(selectedMeals).filter(([_, v]) => v).map(([k]) => k);
    try {
      const result = await generateMealPlan({
        calorias: nutritionalGoals.calories,
        dias: selectedDays,
        restricoes: localRestrictions,
        preferencias: localPreferences,
        refeicoes_selecionadas: refeicoes
      });
      if (result?.length > 0) setTimeout(() => setShowResultModal(true), 500);
    } catch (e) {
      console.error('Erro:', e);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div 
            animate={isGenerating ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg"
          >
            <ChefHat className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <h2 className="font-bold text-base">Cardápio Chef</h2>
            <p className="text-[10px] text-muted-foreground">Personalizado para você</p>
          </div>
        </div>
        <MealPlanHistoryDrawer />
      </div>

      {/* Aviso se não tiver dados do usuário */}
      {!hasUserData && !loadingPhysical && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-[10px] text-amber-600 dark:text-amber-400">
            Complete seu perfil físico para cálculos mais precisos
          </p>
        </div>
      )}

      {/* OBJETIVO - Cards horizontais */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold">Objetivo</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {OBJECTIVES.map((obj) => (
            <motion.button
              key={obj.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedObjective(obj.value)}
              className={cn(
                "p-2 rounded-xl text-center transition-all border",
                selectedObjective === obj.value
                  ? `bg-gradient-to-br ${obj.color} text-white border-transparent shadow-lg`
                  : "bg-card border-border hover:border-amber-500/50"
              )}
            >
              <span className="text-lg block">{obj.emoji}</span>
              <span className="text-[10px] font-medium block mt-0.5">{obj.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* PANELA COM FOGO - Design Criativo */}
      <motion.div 
        className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-4 overflow-hidden"
        animate={isGenerating ? { boxShadow: ['0 0 0 rgba(251,146,60,0)', '0 0 30px rgba(251,146,60,0.5)', '0 0 0 rgba(251,146,60,0)'] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        {/* Glow de fundo */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          selectedCount > 0 ? "opacity-30" : "opacity-0"
        )} style={{ background: 'radial-gradient(ellipse at bottom, rgba(251,146,60,0.4), transparent 70%)' }} />

        {/* Ingredientes (Refeições) */}
        <div className="relative flex justify-center gap-2 mb-3">
          {MEALS_DATA.map((meal) => {
            const isSelected = selectedMeals[meal.key as keyof SelectedMealsType];
            return (
              <motion.button
                key={meal.key}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !isGenerating && toggleMeal(meal.key as keyof SelectedMealsType)}
                disabled={isGenerating}
                className={cn(
                  "relative flex flex-col items-center p-2 rounded-xl transition-all min-w-[52px]",
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
                <span className="text-[9px] font-medium text-white/80 mt-0.5">{meal.shortLabel}</span>
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
          })}
        </div>

        {/* Panela */}
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

        <p className="text-center text-[10px] text-white/60 mt-2">
          {isGenerating ? '🔥 Cozinhando...' : `${selectedCount} refeições na panela`}
        </p>
      </motion.div>

      {/* DURAÇÃO + META PERSONALIZADA */}
      <div className="flex gap-2">
        <div className="flex-1 bg-muted/50 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-medium">Duração</span>
          </div>
          <div className="flex gap-1">
            {[1, 3, 7].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDays(d)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                  selectedDays === d ? "bg-amber-500 text-white" : "bg-background hover:bg-muted"
                )}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        
        {/* Meta Personalizada */}
        <div className={cn("flex-1 rounded-xl p-2.5 bg-gradient-to-br", getObjectiveColor())}>
          <div className="flex items-center gap-1 text-white/80 text-[10px] font-medium">
            <User className="w-3 h-3" />
            <span>Sua meta</span>
          </div>
          <div className="text-white text-lg font-bold">{nutritionalGoals.calories}</div>
          <div className="text-white/70 text-[10px]">
            kcal • {getObjectiveLabel()}
            {userWeight && <span className="ml-1">({userWeight}kg)</span>}
          </div>
        </div>
      </div>

      {/* Info dos macros calculados */}
      {hasUserData && (
        <div className="flex justify-between text-[10px] text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          <span>🥩 {nutritionalGoals.protein}g prot</span>
          <span>🍚 {nutritionalGoals.carbs}g carb</span>
          <span>🥑 {nutritionalGoals.fat}g gord</span>
          <span>🌾 {nutritionalGoals.fiber}g fibra</span>
        </div>
      )}

      {/* PREFERÊNCIAS E RESTRIÇÕES */}
      <div className="bg-muted/50 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className="w-full flex items-center justify-between p-2.5 hover:bg-muted/70"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-medium">Preferências & Restrições</span>
            {(localPreferences.length + localRestrictions.length) > 0 && (
              <Badge variant="secondary" className="text-[9px] h-4">{localPreferences.length + localRestrictions.length}</Badge>
            )}
          </div>
          {showPreferences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <AnimatePresence>
          {showPreferences && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2.5 pt-0 space-y-3">
                {/* Preferidos */}
                <div>
                  <label className="text-[10px] font-medium text-emerald-500 mb-1 block">❤️ Preferidos</label>
                  <div className="flex gap-1.5">
                    <Input placeholder="frango, peixe..." value={newPreference} onChange={(e) => setNewPreference(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddPreference()} className="h-7 text-xs" />
                    <Button onClick={handleAddPreference} size="sm" variant="outline" className="h-7 px-2" disabled={!newPreference.trim()}><Plus className="w-3 h-3" /></Button>
                  </div>
                  {localPreferences.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {localPreferences.map(f => (
                        <Badge key={f} variant="secondary" className="text-[9px] gap-0.5">{f}<button onClick={() => handleRemovePreference(f)}><X className="w-2.5 h-2.5" /></button></Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Excluídos */}
                <div>
                  <label className="text-[10px] font-medium text-red-500 mb-1 block">🚫 Excluídos</label>
                  <div className="flex gap-1.5">
                    <Input placeholder="lactose, glúten..." value={newRestriction} onChange={(e) => setNewRestriction(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddRestriction()} className="h-7 text-xs" />
                    <Button onClick={handleAddRestriction} size="sm" variant="outline" className="h-7 px-2" disabled={!newRestriction.trim()}><Plus className="w-3 h-3" /></Button>
                  </div>
                  {localRestrictions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {localRestrictions.map(f => (
                        <Badge key={f} variant="destructive" className="text-[9px] gap-0.5">{f}<button onClick={() => handleRemoveRestriction(f)}><X className="w-2.5 h-2.5" /></button></Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTÃO GERAR */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleGenerate}
        disabled={selectedCount === 0 || isGenerating}
        className={cn(
          "w-full py-3 rounded-xl font-bold text-sm",
          "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
          "shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2",
          "disabled:opacity-50"
        )}
      >
        <ChefHat className="w-5 h-5" />
        {isGenerating ? 'Cozinhando...' : 'Gerar Cardápio'}
        <Sparkles className="w-4 h-4" />
      </motion.button>

      {/* Loading */}
      <MealPlanLoadingExperience isLoading={isGenerating} days={selectedDays} calories={nutritionalGoals.calories} objective={getObjectiveLabel()} />

      {/* Modais */}
      <WeeklyMealPlanModal open={showResultModal} onOpenChange={setShowResultModal} mealPlan={generatedPlan.map(d => ({ ...d, dailyTotals: { calories: d.dailyTotals?.calories || 0, protein: d.dailyTotals?.protein || 0, carbs: d.dailyTotals?.carbs || 0, fat: d.dailyTotals?.fat || 0, fiber: d.dailyTotals?.fiber || 0 } }))} />
      <MealPlanSuccessEffect isVisible={showSuccessEffect} onClose={() => setShowSuccessEffect(false)} mealPlanData={generatedPlan.length > 0 ? { type: generatedPlan.length > 1 ? 'weekly' : 'daily', title: `Cardápio ${generatedPlan.length > 1 ? 'Semanal' : 'Diário'}`, summary: { calories: Math.round(generatedPlan.reduce((a, d) => a + d.dailyTotals.calories, 0) / generatedPlan.length), protein: Math.round(generatedPlan.reduce((a, d) => a + d.dailyTotals.protein, 0) / generatedPlan.length), carbs: Math.round(generatedPlan.reduce((a, d) => a + d.dailyTotals.carbs, 0) / generatedPlan.length), fat: Math.round(generatedPlan.reduce((a, d) => a + d.dailyTotals.fat, 0) / generatedPlan.length), fiber: Math.round(generatedPlan.reduce((a, d) => a + d.dailyTotals.fiber, 0) / generatedPlan.length) } } : undefined} />
    </div>
  );
};

export default ChefKitchenMealPlan;
