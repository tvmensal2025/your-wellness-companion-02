/**
 * @file DayDetailModal Component
 * @description Modal mostrando detalhes completos de um dia específico
 * 
 * Funcionalidade:
 * - Mostra todas as 4 refeições do dia
 * - Totais de calorias e macros
 * - Botão para gerar lista de compras
 * - Comparação com metas
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coffee, UtensilsCrossed, Cookie, Moon, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDayMeals } from '@/hooks/mealie/useDayMeals';
import type { WeekDay, MealItem } from '@/types/mealie';

interface DayDetailModalProps {
  day: WeekDay;
  userId?: string;
  onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  day,
  userId,
  onClose,
}) => {
  const { dayMeals, loading } = useDayMeals(day.date, userId);

  // Formatar data
  const dateStr = day.date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg capitalize">{dateStr}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {dayMeals && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                🎯 Meta: {dayMeals.targetCalories} kcal
              </span>
              <span>•</span>
              <span>
                📊 Planejado: {Math.round(dayMeals.totalCalories)} kcal
              </span>
              <Badge
                variant={
                  dayMeals.totalCalories >= dayMeals.targetCalories * 0.9
                    ? 'default'
                    : 'secondary'
                }
              >
                {Math.round((dayMeals.totalCalories / dayMeals.targetCalories) * 100)}%
              </Badge>
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !dayMeals ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma refeição registrada neste dia</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Café da Manhã */}
            <MealSection
              title="Café da Manhã"
              icon={Coffee}
              gradient="from-amber-400 to-orange-500"
              meals={dayMeals.breakfast}
              time="7h00"
            />

            {/* Almoço */}
            <MealSection
              title="Almoço"
              icon={UtensilsCrossed}
              gradient="from-emerald-400 to-teal-500"
              meals={dayMeals.lunch}
              time="12h30"
            />

            {/* Lanche */}
            <MealSection
              title="Lanche"
              icon={Cookie}
              gradient="from-purple-400 to-pink-500"
              meals={dayMeals.snack}
              time="16h00"
            />

            {/* Jantar */}
            <MealSection
              title="Jantar"
              icon={Moon}
              gradient="from-blue-400 to-indigo-500"
              meals={dayMeals.dinner}
              time="19h30"
            />

            {/* Totais do Dia */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold mb-3">📊 Totais do Dia</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Calorias</span>
                    <span className="font-medium">
                      {Math.round(dayMeals.totalCalories)} / {dayMeals.targetCalories} kcal
                    </span>
                  </div>
                  <Progress
                    value={(dayMeals.totalCalories / dayMeals.targetCalories) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            {/* Nota: Lista de compras será gerada no Cardápio Chef */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// COMPONENTE: Seção de Refeição
// ============================================

interface MealSectionProps {
  title: string;
  icon: React.ElementType;
  gradient: string;
  meals: MealItem[];
  time: string;
}

const MealSection: React.FC<MealSectionProps> = ({
  title,
  icon: Icon,
  gradient,
  meals,
  time,
}) => {
  if (meals.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-border">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-xs text-muted-foreground ml-auto">{time}</span>
        </div>
        <p className="text-xs text-muted-foreground">Nenhuma refeição registrada</p>
      </div>
    );
  }

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein_g, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs_g, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat_g, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-xl border',
        'bg-gradient-to-br',
        gradient,
        'bg-opacity-10'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('p-1.5 rounded-lg bg-gradient-to-br', gradient)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground ml-auto">{time}</span>
        <Badge variant="secondary" className="text-xs">
          {Math.round(totalCalories)} kcal
        </Badge>
      </div>

      <div className="space-y-2">
        {meals.map((meal, index) => (
          <div
            key={meal.id}
            className="flex items-start gap-2 p-2 rounded-lg bg-background/50"
          >
            <span className="text-xs text-muted-foreground mt-0.5">•</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{meal.name}</p>
              <p className="text-xs text-muted-foreground">{meal.time}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(meal.calories)} kcal
            </span>
          </div>
        ))}
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs font-medium text-orange-500">
            {Math.round(totalProtein)}g
          </p>
          <p className="text-[10px] text-muted-foreground">Proteína</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-blue-500">
            {Math.round(totalCarbs)}g
          </p>
          <p className="text-[10px] text-muted-foreground">Carbos</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-yellow-500">
            {Math.round(totalFat)}g
          </p>
          <p className="text-[10px] text-muted-foreground">Gorduras</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DayDetailModal;
