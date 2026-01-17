import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DayPlan {
  dailyTotals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export const DailyTotalsCard: React.FC<{ totals: DayPlan['dailyTotals'] }> = ({ totals }) => {
  if (!totals) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-primary">Totais do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totals.calories}</div>
            <div className="text-xs text-muted-foreground">Kcal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totals.protein.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Proteínas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totals.carbs.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Carboidratos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totals.fat.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Gorduras</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totals.fiber.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Fibras</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
