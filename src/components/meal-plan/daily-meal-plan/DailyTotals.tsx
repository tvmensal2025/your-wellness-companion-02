import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface DailyTotalsData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface DailyTotalsProps {
  totals: DailyTotalsData;
}

/**
 * Componente que exibe os totais nutricionais do dia
 * 
 * Exibe um card com gradiente mostrando:
 * - Calorias totais
 * - Proteínas (g)
 * - Carboidratos (g)
 * - Gorduras (g)
 * - Fibras (g)
 */
export const DailyTotals: React.FC<DailyTotalsProps> = ({ totals }) => {
  return (
    <Card className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white shadow-lg border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
          <Clock className="w-5 h-5" />
          Totais do Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{totals.calories}</div>
            <div className="text-sm text-emerald-100">Calorias</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totals.protein.toFixed(1)}</div>
            <div className="text-sm text-emerald-100">Proteínas (g)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totals.carbs.toFixed(1)}</div>
            <div className="text-sm text-emerald-100">Carboidratos (g)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totals.fat.toFixed(1)}</div>
            <div className="text-sm text-emerald-100">Gorduras (g)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totals.fiber.toFixed(1)}</div>
            <div className="text-sm text-emerald-100">Fibras (g)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export type { DailyTotalsData };
