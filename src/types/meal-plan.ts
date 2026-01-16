/**
 * Tipos compartilhados para MealPlan
 * Usados por: CompactMealPlanModal, WeeklyMealPlanModal, ChefKitchenMealPlan, DailyMealPlanModal
 */

// Macronutrientes
export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

// Refeição individual
export interface Meal {
  title: string;
  description: string;
  preparo?: string;
  modoPreparoElegante?: string;
  ingredients: string[];
  practicalSuggestion?: string;
  macros: MacroNutrients;
}

// Plano de um dia
export interface DayPlan {
  day: number;
  dailyTotals?: MacroNutrients & { fiber: number };
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    snack?: Meal;
    dinner?: Meal;
    supper?: Meal;
  };
}

// Tipos de refeição
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'supper';

// Configuração visual de refeição
export interface MealConfig {
  emoji: string;
  label: string;
  shortLabel: string;
  gradient: string;
  bgGradient: string;
  accentColor: string;
  borderColor: string;
  time: string;
}

// Mapa de configurações por tipo de refeição
export const MEAL_CONFIGS: Record<MealType, MealConfig> = {
  breakfast: {
    emoji: '🌅',
    label: 'Café da Manhã',
    shortLabel: 'Café',
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
    accentColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
    time: '07:00',
  },
  lunch: {
    emoji: '☀️',
    label: 'Almoço',
    shortLabel: 'Almoço',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    accentColor: 'text-green-500',
    borderColor: 'border-green-500/30',
    time: '12:00',
  },
  snack: {
    emoji: '🍎',
    label: 'Lanche',
    shortLabel: 'Lanche',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    accentColor: 'text-purple-500',
    borderColor: 'border-purple-500/30',
    time: '15:00',
  },
  dinner: {
    emoji: '🌙',
    label: 'Jantar',
    shortLabel: 'Jantar',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-500/10 to-indigo-500/10',
    accentColor: 'text-blue-500',
    borderColor: 'border-blue-500/30',
    time: '19:00',
  },
  supper: {
    emoji: '🌜',
    label: 'Ceia',
    shortLabel: 'Ceia',
    gradient: 'from-slate-500 to-zinc-500',
    bgGradient: 'from-slate-500/10 to-zinc-500/10',
    accentColor: 'text-slate-500',
    borderColor: 'border-slate-500/30',
    time: '21:00',
  },
};

// Hook return types
export interface CompactMealPlanLogic {
  currentMealIndex: number;
  setCurrentMealIndex: (index: number) => void;
  availableMeals: Array<{ key: MealType; meal: Meal }>;
  currentMeal: Meal | null;
  currentMealConfig: MealConfig | null;
  handlePrint: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
}

export interface WeeklyPlanLogic {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  selectedDayPlan: DayPlan | null;
  weeklyTotals: MacroNutrients;
  showDayDetail: boolean;
  setShowDayDetail: (show: boolean) => void;
}

export interface ChefKitchenLogic {
  isAnimating: boolean;
  currentRecipeIndex: number;
  setCurrentRecipeIndex: (index: number) => void;
  recipes: Meal[];
  handleNextRecipe: () => void;
  handlePreviousRecipe: () => void;
}

export interface DailyPlanLogic {
  selectedMealType: MealType | null;
  setSelectedMealType: (type: MealType | null) => void;
  dailyMeals: Array<{ key: MealType; meal: Meal }>;
  dailyTotals: MacroNutrients;
}
