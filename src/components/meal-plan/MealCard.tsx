import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Meal {
  title: string;
  description: string;
  preparo?: string;
  ingredients: string[];
  practicalSuggestion?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
}

export const MealCard: React.FC<{ meal: Meal; mealType: string }> = ({ meal, mealType }) => {
  const getMealTypeColor = (type: string) => {
    const colors = {
      breakfast: 'border-l-green-500 bg-green-50',
      lunch: 'border-l-blue-500 bg-blue-50', 
      snack: 'border-l-orange-500 bg-orange-50',
      dinner: 'border-l-purple-500 bg-purple-50',
      supper: 'border-l-indigo-500 bg-indigo-50'
    };
    return colors[type as keyof typeof colors] || 'border-l-gray-500 bg-gray-50';
  };

  const getMealTypeTitle = (type: string) => {
    const titles = {
      breakfast: 'DESJEJUM / CAFÉ DA MANHÃ',
      lunch: 'ALMOÇO',
      snack: 'LANCHE', 
      dinner: 'JANTAR',
      supper: 'CEIA'
    };
    return titles[type as keyof typeof titles] || type.toUpperCase();
  };

  return (
    <Card className={`border-l-4 ${getMealTypeColor(mealType)}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold text-white bg-primary px-3 py-1 rounded">
            {getMealTypeTitle(mealType)}
          </CardTitle>
          <div className="text-sm font-bold text-white bg-primary px-3 py-1 rounded">
            {meal.macros.calories} kcal
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-primary mb-2">{meal.title}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-foreground mb-2 border-b border-gray-200 pb-1">ALIMENTOS</h4>
            <ul className="space-y-1">
              {meal.ingredients.map((ingredient, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2 border-b border-gray-200 pb-1">**SUGESTÃO PRÁTICA**</h4>
            <p className="text-sm text-muted-foreground">
              {meal.practicalSuggestion || 'Não especificado'}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-foreground mb-3">MODO DE PREPARO</h4>
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {meal.preparo || meal.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
