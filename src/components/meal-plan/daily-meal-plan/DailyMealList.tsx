import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, User, FileText } from 'lucide-react';
import type { Meal, DayPlan } from './hooks/useDailyPlanLogic';

// ============================================
// MealCard - Componente interno para cada refeição
// ============================================

interface MealCardProps {
  meal: Meal;
  mealType: string;
}

const getMealTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    breakfast: 'from-emerald-500 to-green-600',
    lunch: 'from-blue-500 to-cyan-600',
    snack: 'from-amber-500 to-orange-600',
    dinner: 'from-violet-500 to-purple-600',
    supper: 'from-indigo-500 to-blue-600'
  };
  return colors[type] || 'from-gray-500 to-gray-600';
};

const getMealTypeTitle = (type: string): string => {
  const titles: Record<string, string> = {
    breakfast: 'CAFÉ DA MANHÃ',
    lunch: 'ALMOÇO',
    snack: 'LANCHE DA TARDE',
    dinner: 'JANTAR',
    supper: 'CEIA'
  };
  return titles[type] || type.toUpperCase();
};

const getMealIcon = (type: string): string => {
  const icons: Record<string, string> = {
    breakfast: '🌅',
    lunch: '🍽️',
    snack: '🥪',
    dinner: '🌙',
    supper: '🌙'
  };
  return icons[type] || '🍴';
};

const MealCard: React.FC<MealCardProps> = ({ meal, mealType }) => {
  return (
    <Card className="overflow-hidden shadow-lg border-0 hover:shadow-xl transition-all duration-300">
      <CardHeader className={`bg-gradient-to-r ${getMealTypeColor(mealType)} text-white p-4`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">{getMealIcon(mealType)}</span>
            {getMealTypeTitle(mealType)}
          </CardTitle>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-sm font-bold">{meal.macros.calories} kcal</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Título da Refeição */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-primary mb-2">{meal.title}</h3>
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alimentos */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-emerald-200">
              <Leaf className="w-4 h-4 text-emerald-600" />
              ALIMENTOS
            </h4>
            <ul className="space-y-2">
              {meal.ingredients.map((ingredient, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Sugestão Prática */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-emerald-200">
              <User className="w-4 h-4 text-emerald-600" />
              SUGESTÃO PRÁTICA
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {meal.practicalSuggestion || 'Não especificado'}
            </p>
          </div>
        </div>

        {/* Macronutrientes */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-lg p-4">
          <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3 text-center">
            Informação Nutricional
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {meal.macros.protein.toFixed(1)}g
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Proteínas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {meal.macros.carbs.toFixed(1)}g
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Carboidratos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {meal.macros.fat.toFixed(1)}g
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Gorduras</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {meal.macros.fiber?.toFixed(1) || '0'}g
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Fibras</div>
            </div>
          </div>
        </div>

        {/* Modo de Preparo */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-emerald-200">
            <FileText className="w-4 h-4 text-emerald-600" />
            MODO DE PREPARO
          </h4>
          <div className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg whitespace-pre-line">
            {meal.preparo || meal.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// DailyMealList - Lista de refeições do dia
// ============================================

interface DailyMealListProps {
  meals: DayPlan['meals'];
}

export const DailyMealList: React.FC<DailyMealListProps> = ({ meals }) => {
  return (
    <div className="space-y-6">
      {meals?.breakfast && (
        <MealCard meal={meals.breakfast} mealType="breakfast" />
      )}
      {meals?.lunch && (
        <MealCard meal={meals.lunch} mealType="lunch" />
      )}
      {meals?.snack && (
        <MealCard meal={meals.snack} mealType="snack" />
      )}
      {meals?.dinner && (
        <MealCard meal={meals.dinner} mealType="dinner" />
      )}
      {meals?.supper && (
        <MealCard meal={meals.supper} mealType="supper" />
      )}
    </div>
  );
};

export { MealCard };
