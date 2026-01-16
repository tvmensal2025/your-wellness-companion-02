import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMealPlanGeneratorV2 } from '@/hooks/useMealPlanGeneratorV2';
import { useUserFoodPreferences } from '@/hooks/useUserFoodPreferences';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { NutritionObjective, calculateNutritionalGoals, PhysicalData } from '@/utils/macro-calculator';
import type { SelectedMealsType } from '../CookingAnimation';
import type { NutritionalGoals } from '../RecipeCard';

/**
 * useChefKitchenLogic - Hook que gerencia toda a lógica do ChefKitchenMealPlan
 * 
 * Responsabilidades:
 * - Estado de seleção de refeições
 * - Cálculo de metas nutricionais
 * - Gerenciamento de preferências e restrições
 * - Geração de cardápio
 * 
 * @example
 * ```tsx
 * const logic = useChefKitchenLogic();
 * // Use logic.selectedMeals, logic.handleGenerate, etc.
 * ```
 */

const OBJECTIVES = [
  { value: NutritionObjective.LOSE, label: 'Emagrecer', emoji: '🔥', color: 'from-red-500 to-orange-500' },
  { value: NutritionObjective.MAINTAIN, label: 'Manter', emoji: '⚖️', color: 'from-blue-500 to-cyan-500' },
  { value: NutritionObjective.GAIN, label: 'Ganhar', emoji: '💪', color: 'from-green-500 to-emerald-500' },
  { value: NutritionObjective.LEAN_MASS, label: 'Hipertrofia', emoji: '🏋️', color: 'from-purple-500 to-violet-500' },
];

export interface UseChefKitchenLogicReturn {
  // Estado de refeições
  selectedMeals: SelectedMealsType;
  toggleMeal: (key: keyof SelectedMealsType) => void;
  selectedCount: number;
  
  // Estado de dias
  selectedDays: number;
  setSelectedDays: (days: number) => void;
  
  // Estado de objetivo
  selectedObjective: NutritionObjective;
  setSelectedObjective: (obj: NutritionObjective) => void;
  getObjectiveLabel: () => string;
  getObjectiveColor: () => string;
  
  // Metas nutricionais
  nutritionalGoals: NutritionalGoals;
  hasUserData: boolean;
  userWeight: number | undefined;
  loadingPhysical: boolean;
  
  // Preferências e restrições
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
  onTogglePreferences: () => void;
  localPreferences: string[];
  localRestrictions: string[];
  newPreference: string;
  setNewPreference: (value: string) => void;
  newRestriction: string;
  setNewRestriction: (value: string) => void;
  handleAddPreference: () => Promise<void>;
  handleRemovePreference: (food: string) => Promise<void>;
  handleAddRestriction: () => Promise<void>;
  handleRemoveRestriction: (food: string) => Promise<void>;
  
  // Geração de cardápio
  isGenerating: boolean;
  generatedPlan: any[];
  handleGenerate: () => Promise<void>;
  
  // Modal de resultado
  showResultModal: boolean;
  setShowResultModal: (show: boolean) => void;
  
  // Efeito de sucesso
  showSuccessEffect: boolean;
  setShowSuccessEffect: (show: boolean) => void;
}

export const useChefKitchenLogic = (): UseChefKitchenLogicReturn => {
  // Estado de seleção de refeições
  const [selectedMeals, setSelectedMeals] = useState<SelectedMealsType>({
    'café da manhã': true,
    'almoço': true,
    'lanche': false,
    'jantar': true,
    'ceia': false
  });
  
  // Estado de configuração
  const [selectedDays, setSelectedDays] = useState(7);
  const [selectedObjective, setSelectedObjective] = useState<NutritionObjective>(NutritionObjective.MAINTAIN);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // Estado de preferências
  const [showPreferences, setShowPreferences] = useState(false);
  const [newPreference, setNewPreference] = useState('');
  const [newRestriction, setNewRestriction] = useState('');
  const [localPreferences, setLocalPreferences] = useState<string[]>([]);
  const [localRestrictions, setLocalRestrictions] = useState<string[]>([]);

  // Hooks externos
  const { 
    generateMealPlan, 
    isGenerating, 
    generatedPlan, 
    showSuccessEffect, 
    setShowSuccessEffect 
  } = useMealPlanGeneratorV2();
  
  const { 
    getRestrictionsArray, 
    getPreferencesArray, 
    addPreference, 
    removePreference, 
    restrictions, 
    preferences, 
    loading: loadingPreferences 
  } = useUserFoodPreferences();
  
  const { 
    physicalData, 
    measurements, 
    loading: loadingPhysical 
  } = useWeightMeasurement();

  // Valores computados
  const selectedCount = Object.values(selectedMeals).filter(Boolean).length;
  
  // Carregar preferências salvas
  useEffect(() => {
    if (!loadingPreferences) {
      setLocalRestrictions(getRestrictionsArray() || []);
      setLocalPreferences(getPreferencesArray() || []);
    }
  }, [loadingPreferences, getRestrictionsArray, getPreferencesArray]);

  // Calcular metas nutricionais personalizadas
  const nutritionalGoals = useMemo((): NutritionalGoals => {
    const latestWeight = measurements?.[0]?.peso_kg || physicalData?.peso_kg;
    
    if (!latestWeight) {
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

  // Handlers
  const getObjectiveLabel = useCallback(() => {
    return OBJECTIVES.find(o => o.value === selectedObjective)?.label || 'Manter';
  }, [selectedObjective]);

  const getObjectiveColor = useCallback(() => {
    return OBJECTIVES.find(o => o.value === selectedObjective)?.color || 'from-blue-500 to-cyan-500';
  }, [selectedObjective]);

  const toggleMeal = useCallback((key: keyof SelectedMealsType) => {
    setSelectedMeals(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const onTogglePreferences = useCallback(() => {
    setShowPreferences(prev => !prev);
  }, []);

  const handleAddPreference = useCallback(async () => {
    const food = newPreference.trim().toLowerCase();
    if (food && !localPreferences.includes(food)) {
      await addPreference(food, 'preference');
      setLocalPreferences(prev => [...prev, food]);
      setNewPreference('');
    }
  }, [newPreference, localPreferences, addPreference]);

  const handleRemovePreference = useCallback(async (food: string) => {
    const pref = preferences?.find(p => p.food_name === food);
    if (pref) await removePreference(pref.id);
    setLocalPreferences(prev => prev.filter(f => f !== food));
  }, [preferences, removePreference]);

  const handleAddRestriction = useCallback(async () => {
    const food = newRestriction.trim().toLowerCase();
    if (food && !localRestrictions.includes(food)) {
      await addPreference(food, 'restriction');
      setLocalRestrictions(prev => [...prev, food]);
      setNewRestriction('');
    }
  }, [newRestriction, localRestrictions, addPreference]);

  const handleRemoveRestriction = useCallback(async (food: string) => {
    const rest = restrictions?.find(r => r.food_name === food);
    if (rest) await removePreference(rest.id);
    setLocalRestrictions(prev => prev.filter(f => f !== food));
  }, [restrictions, removePreference]);

  const handleGenerate = useCallback(async () => {
    if (selectedCount === 0) return;
    
    const refeicoes = Object.entries(selectedMeals)
      .filter(([_, v]) => v)
      .map(([k]) => k);
    
    try {
      const result = await generateMealPlan({
        calorias: nutritionalGoals.calories,
        dias: selectedDays,
        restricoes: localRestrictions,
        preferencias: localPreferences,
        refeicoes_selecionadas: refeicoes
      });
      
      if (result?.length > 0) {
        setTimeout(() => setShowResultModal(true), 500);
      }
    } catch (e) {
      console.error('Erro ao gerar cardápio:', e);
    }
  }, [
    selectedCount, 
    selectedMeals, 
    nutritionalGoals.calories, 
    selectedDays, 
    localRestrictions, 
    localPreferences, 
    generateMealPlan
  ]);

  return {
    // Estado de refeições
    selectedMeals,
    toggleMeal,
    selectedCount,
    
    // Estado de dias
    selectedDays,
    setSelectedDays,
    
    // Estado de objetivo
    selectedObjective,
    setSelectedObjective,
    getObjectiveLabel,
    getObjectiveColor,
    
    // Metas nutricionais
    nutritionalGoals,
    hasUserData,
    userWeight,
    loadingPhysical,
    
    // Preferências e restrições
    showPreferences,
    setShowPreferences,
    onTogglePreferences,
    localPreferences,
    localRestrictions,
    newPreference,
    setNewPreference,
    newRestriction,
    setNewRestriction,
    handleAddPreference,
    handleRemovePreference,
    handleAddRestriction,
    handleRemoveRestriction,
    
    // Geração de cardápio
    isGenerating,
    generatedPlan,
    handleGenerate,
    
    // Modal de resultado
    showResultModal,
    setShowResultModal,
    
    // Efeito de sucesso
    showSuccessEffect,
    setShowSuccessEffect,
  };
};

export default useChefKitchenLogic;
