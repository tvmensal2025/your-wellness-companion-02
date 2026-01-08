import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, Apple, UtensilsCrossed, Cookie, Moon, MoonStar, CheckCircle, Clock } from "lucide-react";

interface MealSlot {
  type: string;
  label: string;
  icon: React.ReactNode;
  meals: any[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

interface DailyMealsPanelProps {
  date?: string;
  userId?: string;
}

export const DailyMealsPanel = ({ date, userId }: DailyMealsPanelProps) => {
  const today = date || new Date().toISOString().split("T")[0];

  const { data: meals, isLoading } = useQuery({
    queryKey: ["daily-meals", today, userId],
    queryFn: async () => {
      let query = supabase
        .from("food_history")
        .select("*")
        .eq("meal_date", today)
        .order("meal_time", { ascending: true });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const mealSlots: MealSlot[] = [
    { type: "cafe_da_manha", label: "Café da Manhã", icon: <Coffee className="h-4 w-4" />, meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
    { type: "lanche_manha", label: "Lanche da Manhã", icon: <Apple className="h-4 w-4" />, meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
    { type: "almoco", label: "Almoço", icon: <UtensilsCrossed className="h-4 w-4" />, meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
    { type: "lanche_tarde", label: "Lanche da Tarde", icon: <Cookie className="h-4 w-4" />, meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
    { type: "jantar", label: "Jantar", icon: <Moon className="h-4 w-4" />, meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
    { type: "ceia", label: "Ceia", icon: <MoonStar className="h-4 w-4" />, meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
  ];

  // Populate meal slots
  if (meals) {
    meals.forEach((meal) => {
      const slot = mealSlots.find((s) => s.type === meal.meal_type);
      if (slot) {
        slot.meals.push(meal);
        slot.totalCalories += Number(meal.total_calories) || 0;
        slot.totalProtein += Number(meal.total_proteins) || 0;
        slot.totalCarbs += Number(meal.total_carbs) || 0;
        slot.totalFats += Number(meal.total_fats) || 0;
      }
    });
  }

  const totalDay = mealSlots.reduce(
    (acc, slot) => ({
      calories: acc.calories + slot.totalCalories,
      protein: acc.protein + slot.totalProtein,
      carbs: acc.carbs + slot.totalCarbs,
      fats: acc.fats + slot.totalFats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Refeições do Dia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>🍽️ Refeições de {today === new Date().toISOString().split("T")[0] ? "Hoje" : today}</span>
          <Badge variant="outline" className="text-xs">
            {Math.round(totalDay.calories)} kcal
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mealSlots.map((slot) => (
          <div
            key={slot.type}
            className={`p-3 rounded-lg border ${
              slot.meals.length > 0 ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-muted"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {slot.icon}
                <span className="font-medium text-sm">{slot.label}</span>
                {slot.meals.length > 0 && (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                )}
              </div>
              {slot.meals.length > 0 ? (
                <div className="text-xs text-muted-foreground">
                  {Math.round(slot.totalCalories)} kcal
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Aguardando</span>
                </div>
              )}
            </div>

            {slot.meals.length > 0 && (
              <div className="space-y-1.5">
                {slot.meals.map((meal, idx) => {
                  const foods = (meal.food_items as any[]) || [];
                  return (
                    <div key={idx} className="text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                        <span>{meal.meal_time?.slice(0, 5)}</span>
                        {meal.user_confirmed ? (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">✓</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">pendente</Badge>
                        )}
                      </div>
                      <div className="text-foreground">
                        {foods.map((f: any, i: number) => (
                          <span key={i}>
                            {f.nome || f.name}
                            {f.quantidade || f.grams ? ` (${f.quantidade || f.grams}g)` : ""}
                            {i < foods.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Macros resumidos */}
                <div className="flex gap-3 mt-2 pt-2 border-t border-border/50 text-xs">
                  <span className="text-blue-600 dark:text-blue-400">
                    P: {Math.round(slot.totalProtein)}g
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">
                    C: {Math.round(slot.totalCarbs)}g
                  </span>
                  <span className="text-pink-600 dark:text-pink-400">
                    G: {Math.round(slot.totalFats)}g
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Total do dia */}
        <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">📊 Total do Dia</span>
            <span className="font-bold text-primary">{Math.round(totalDay.calories)} kcal</span>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {Math.round(totalDay.protein)}g
              </span>
              <span className="text-muted-foreground">Proteína</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {Math.round(totalDay.carbs)}g
              </span>
              <span className="text-muted-foreground">Carboidratos</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-pink-600 dark:text-pink-400 font-medium">
                {Math.round(totalDay.fats)}g
              </span>
              <span className="text-muted-foreground">Gorduras</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
