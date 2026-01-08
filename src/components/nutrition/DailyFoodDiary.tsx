import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, Plus, Coffee, UtensilsCrossed, Cookie, Moon, Droplets, TrendingUp } from 'lucide-react';
import { useDailyNutritionTracking } from '@/hooks/useDailyNutritionTracking';
import { cn } from '@/lib/utils';

interface DailyFoodDiaryProps {
  onAddMeal?: (mealType: string) => void;
  onTakePhoto?: () => void;
  compact?: boolean;
}

const mealConfig = {
  breakfast: { icon: Coffee, label: 'Café da Manhã', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  lunch: { icon: UtensilsCrossed, label: 'Almoço', color: 'text-green-500', bg: 'bg-green-500/10' },
  snack: { icon: Cookie, label: 'Lanche', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  dinner: { icon: Moon, label: 'Jantar', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
};

export const DailyFoodDiary: React.FC<DailyFoodDiaryProps> = ({ 
  onAddMeal, 
  onTakePhoto,
  compact = false 
}) => {
  const { goals, dailySummary, loading, getProgress, addWater } = useDailyNutritionTracking();

  const caloriesProgress = getProgress(dailySummary.calories, goals.target_calories);
  const proteinProgress = getProgress(dailySummary.protein, goals.target_protein_g);
  const carbsProgress = getProgress(dailySummary.carbs, goals.target_carbs_g);
  const fatProgress = getProgress(dailySummary.fat, goals.target_fats_g);
  const waterProgress = getProgress(dailySummary.water_ml, goals.target_water_ml);

  const handleWaterClick = (ml: number) => {
    addWater(ml);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          Meu Dia Alimentar
        </CardTitle>
        {onTakePhoto && (
          <Button size="sm" variant="outline" onClick={onTakePhoto} className="gap-1">
            <Camera className="h-4 w-4" />
            Foto
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progresso de Calorias */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">Progresso</span>
            </div>
            <Badge variant={caloriesProgress >= 100 ? "default" : "secondary"}>
              {caloriesProgress}%
            </Badge>
          </div>
          <div className="text-2xl font-bold mb-1">
            {Math.round(dailySummary.calories)} <span className="text-sm font-normal text-muted-foreground">/ {goals.target_calories} kcal</span>
          </div>
          <Progress value={caloriesProgress} className="h-2" />
        </div>

        {/* Macros resumidos */}
        {!compact && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-xs text-muted-foreground">Proteína</div>
              <div className="font-bold text-blue-600">{Math.round(dailySummary.protein)}g</div>
              <Progress value={proteinProgress} className="h-1 mt-1" />
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs text-muted-foreground">Carbos</div>
              <div className="font-bold text-amber-600">{Math.round(dailySummary.carbs)}g</div>
              <Progress value={carbsProgress} className="h-1 mt-1" />
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <div className="text-xs text-muted-foreground">Gordura</div>
              <div className="font-bold text-rose-600">{Math.round(dailySummary.fat)}g</div>
              <Progress value={fatProgress} className="h-1 mt-1" />
            </div>
          </div>
        )}

        {/* Lista de refeições */}
        <div className="space-y-2">
          {(Object.entries(mealConfig) as [keyof typeof mealConfig, typeof mealConfig.breakfast][]).map(([key, config]) => {
            const meal = dailySummary.meals[key];
            const Icon = config.icon;

            return (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  meal ? config.bg : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-full", config.bg)}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{config.label}</div>
                    {meal ? (
                      <div className="text-xs text-muted-foreground">
                        {Math.round(meal.total_calories)} kcal • {Math.round(meal.total_proteins)}g prot
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Não registrado</div>
                    )}
                  </div>
                </div>
                
                {meal ? (
                  <Badge variant="outline" className={config.color}>
                    ✓
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddMeal?.(key)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Água */}
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              <span className="font-medium text-sm">Água</span>
            </div>
            <span className="text-sm font-bold text-cyan-600">
              {dailySummary.water_ml}ml / {goals.target_water_ml}ml
            </span>
          </div>
          <Progress value={waterProgress} className="h-2 mb-2" />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => handleWaterClick(200)}
            >
              +200ml
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => handleWaterClick(500)}
            >
              +500ml
            </Button>
            <Button
              size="sm"
              variant="default"
              className="flex-1 text-xs bg-cyan-500 hover:bg-cyan-600"
              onClick={() => handleWaterClick(1000)}
            >
              +1L
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyFoodDiary;
