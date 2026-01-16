import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, X, Loader2, AlertTriangle, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDailyNutritionTracking } from '@/hooks/useDailyNutritionTracking';
import { useFoodRestrictionCheck } from '@/hooks/useFoodRestrictionCheck';
import { FoodRestrictionAlert } from './FoodRestrictionAlert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  proteins_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g?: number;
}

interface SelectedFood extends FoodItem {
  quantity: number;
}

interface QuickMealEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
}

const mealLabels = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
};

export const QuickMealEntry: React.FC<QuickMealEntryProps> = ({
  open,
  onOpenChange,
  mealType,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{ food: string; type: 'forbidden' | 'problematic' } | null>(null);
  
  const { addMeal } = useDailyNutritionTracking();
  const { checkRestriction } = useFoodRestrictionCheck();

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSearchResults([]);
      setSelectedFoods([]);
    }
  }, [open]);

  useEffect(() => {
    const searchFoods = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const { data, error } = await supabase
          .from('nutrition_foods')
          .select('id, name, calories_per_100g, proteins_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g')
          .ilike('name', `%${searchTerm}%`)
          .limit(20);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error('Erro na busca:', err);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchFoods, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleAddFood = (food: FoodItem) => {
    if (selectedFoods.find(f => f.id === food.id)) {
      toast.info('Alimento já adicionado');
      return;
    }

    // Verificar restrições
    const restriction = checkRestriction(food.name);
    if (restriction.isRestricted && restriction.type) {
      setActiveAlert({ food: food.name, type: restriction.type });
      
      if (restriction.type === 'forbidden') {
        toast.error(`⚠️ ${food.name} está na sua lista de alimentos proibidos!`);
      } else {
        toast.warning(`⚠️ ${food.name} pode causar desconforto.`);
      }
    }

    setSelectedFoods(prev => [...prev, { ...food, quantity: 100 }]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveFood = (id: string) => {
    setSelectedFoods(prev => prev.filter(f => f.id !== id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setSelectedFoods(prev =>
      prev.map(f => (f.id === id ? { ...f, quantity: Math.max(1, quantity) } : f))
    );
  };

  const calculateTotals = () => {
    return selectedFoods.reduce(
      (acc, food) => {
        const factor = food.quantity / 100;
        return {
          calories: acc.calories + food.calories_per_100g * factor,
          protein: acc.protein + food.proteins_per_100g * factor,
          carbs: acc.carbs + food.carbs_per_100g * factor,
          fat: acc.fat + food.fats_per_100g * factor,
          fiber: acc.fiber + (food.fiber_per_100g || 0) * factor,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  };

  const handleSave = async () => {
    if (selectedFoods.length === 0) {
      toast.error('Adicione pelo menos um alimento');
      return;
    }

    setSaving(true);
    try {
      const totals = calculateTotals();
      const foodItems = selectedFoods.map(f => ({
        name: f.name,
        quantity: f.quantity,
        unit: 'g',
        calories: Math.round(f.calories_per_100g * f.quantity / 100),
        protein: Math.round(f.proteins_per_100g * f.quantity / 100),
        carbs: Math.round(f.carbs_per_100g * f.quantity / 100),
        fat: Math.round(f.fats_per_100g * f.quantity / 100),
      }));

      await addMeal(mealType, foodItems, totals);
      onOpenChange(false);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast.error('Erro ao salvar refeição');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar {mealLabels[mealType]}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Busca de alimentos */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>

          {/* Alerta de restrição */}
          {activeAlert && (
            <FoodRestrictionAlert
              foodName={activeAlert.food}
              restrictionType={activeAlert.type}
              onDismiss={() => setActiveAlert(null)}
            />
          )}

          {/* Resultados da busca */}
          {searchResults.length > 0 && (
            <ScrollArea className="h-40 border rounded-lg p-2">
              {searchResults.map((food) => {
                const restriction = checkRestriction(food.name);
                const isForbidden = restriction.type === 'forbidden';
                const isProblematic = restriction.type === 'problematic';

                return (
                  <div
                    key={food.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded cursor-pointer",
                      isForbidden 
                        ? "bg-destructive/10 hover:bg-destructive/20 border border-destructive/30" 
                        : isProblematic 
                          ? "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
                          : "hover:bg-muted"
                    )}
                    onClick={() => handleAddFood(food)}
                  >
                    <div className="flex items-center gap-2">
                      {isForbidden && <Ban className="h-4 w-4 text-destructive" />}
                      {isProblematic && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      <div>
                        <div className="font-medium text-sm">{food.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {food.calories_per_100g} kcal/100g
                        </div>
                      </div>
                    </div>
                    <Plus className={cn(
                      "h-4 w-4",
                      isForbidden ? "text-destructive" : isProblematic ? "text-amber-500" : "text-primary"
                    )} />
                  </div>
                );
              })}
            </ScrollArea>
          )}

          {/* Alimentos selecionados */}
          {selectedFoods.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Alimentos selecionados</Label>
              <ScrollArea className="h-40 border rounded-lg p-2">
                {selectedFoods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded mb-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{food.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(food.calories_per_100g * food.quantity / 100)} kcal
                      </div>
                    </div>
                    <Input
                      type="number"
                      value={food.quantity}
                      onChange={(e) => handleQuantityChange(food.id, parseInt(e.target.value) || 0)}
                      className="w-20 h-8 text-right"
                      min={1}
                    />
                    <span className="text-xs text-muted-foreground">g</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleRemoveFood(food.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Totais */}
          {selectedFoods.length > 0 && (
            <div className="grid grid-cols-4 gap-2 p-3 bg-primary/10 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Calorias</div>
                <div className="font-bold">{Math.round(totals.calories)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Proteína</div>
                <div className="font-bold">{Math.round(totals.protein)}g</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Carbos</div>
                <div className="font-bold">{Math.round(totals.carbs)}g</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Gordura</div>
                <div className="font-bold">{Math.round(totals.fat)}g</div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || selectedFoods.length === 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salvar Refeição
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickMealEntry;
