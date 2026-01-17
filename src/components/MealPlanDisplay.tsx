import { DailyTotalsCard } from './meal-plan/DailyTotalsCard';
import { MealCard } from './meal-plan/MealCard';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  CalendarDays, 
  Calendar, 
  Save, 
  History, 
  Eye,
  FileText
} from 'lucide-react';
import { WeeklyMealPlanModal } from '@/components/meal-plan/WeeklyMealPlanModal';
import { DailyMealPlanModal } from '@/components/meal-plan/DailyMealPlanModal';
import { MealPlanHistoryModal } from '@/components/meal-plan/MealPlanHistoryModal';
import { CompactMealPlanModal } from '@/components/meal-plan/CompactMealPlanModal';
import { useMealPlanHistory } from '@/hooks/useMealPlanHistory';
import { adaptHistoryData } from '@/utils/meal-plan-adapter';
import { toast } from '@/hooks/use-toast';

interface Meal {
  title: string;
  description: string;
  preparo?: string; // Instruções detalhadas da Mealie
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

interface DayPlan {
  day: number;
  dailyTotals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    snack?: Meal;
    dinner?: Meal;
    supper?: Meal;
  };
}

interface MealPlanDisplayProps {
  plan: DayPlan[];
}





export const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ plan }) => {
  const [weeklyModalOpen, setWeeklyModalOpen] = useState(false);
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [savePlanType, setSavePlanType] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDayPlan, setSelectedDayPlan] = useState<DayPlan | null>(null);
  const [compactModalOpen, setCompactModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<'weekly' | 'daily' | null>(null);
  
  const { saveMealPlan, history } = useMealPlanHistory();

  if (plan.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-muted-foreground">
          Nenhum cardápio gerado ainda.
        </div>
        
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setHistoryModalOpen(true)}>
            <History className="w-4 h-4 mr-2" />
            Ver Histórico
          </Button>
        </div>

        {historyModalOpen && <MealPlanHistoryModal />}
      </div>
    );
  }

  const handleSave = async () => {
    if (!saveTitle.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um título para o cardápio',
        variant: 'destructive',
      });
      return;
    }

    const dataToSave = savePlanType === 'weekly' ? plan : selectedDayPlan;
    await saveMealPlan(saveTitle, savePlanType, dataToSave);
    setSaveModalOpen(false);
    setSaveTitle('');
  };

  const openDailyModal = (dayPlan: DayPlan) => {
    setSelectedDayPlan(dayPlan);
    setDailyModalOpen(true);
  };

  const openSaveModal = (type: 'weekly' | 'daily', dayPlan?: DayPlan) => {
    setSavePlanType(type);
    if (type === 'daily' && dayPlan) {
      setSelectedDayPlan(dayPlan);
      setSaveTitle(`Cardápio Dia ${dayPlan.day} - ${new Date().toLocaleDateString('pt-BR')}`);
    } else {
      setSaveTitle(`Cardápio Semanal - ${new Date().toLocaleDateString('pt-BR')}`);
    }
    setSaveModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Controles de Visualização */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button 
          variant="outline" 
          onClick={() => setWeeklyModalOpen(true)}
          className="flex items-center gap-2"
        >
          <CalendarDays className="w-4 h-4" />
          Ver Cardápio Semanal
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => openSaveModal('weekly')}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Semanal
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setHistoryModalOpen(true)}
          className="flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          Histórico
        </Button>
      </div>

      {/* Planos Diários */}
      {plan.map((dayPlan) => (
        <div key={dayPlan.day} className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-2xl font-bold text-primary">
                Plano Alimentar — Dia {dayPlan.day}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDailyModal(dayPlan)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Detalhes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openSaveModal('daily', dayPlan)}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Salvar Dia
                </Button>
              </div>
            </div>
            <div className="text-lg text-secondary font-semibold">
              PLANO ALIMENTAR
            </div>
            <div className="text-sm text-muted-foreground">
              Dieta com meta diária {dayPlan.dailyTotals?.calories || 2000} kcal
            </div>
          </div>

          <div className="space-y-4">
            {dayPlan.meals.breakfast && (
              <MealCard meal={dayPlan.meals.breakfast} mealType="breakfast" />
            )}
            {dayPlan.meals.lunch && (
              <MealCard meal={dayPlan.meals.lunch} mealType="lunch" />
            )}
            {dayPlan.meals.snack && (
              <MealCard meal={dayPlan.meals.snack} mealType="snack" />
            )}
            {dayPlan.meals.dinner && (
              <MealCard meal={dayPlan.meals.dinner} mealType="dinner" />
            )}
            {dayPlan.meals.supper && (
              <MealCard meal={dayPlan.meals.supper} mealType="supper" />
            )}
          </div>

          <DailyTotalsCard totals={dayPlan.dailyTotals} />

          {/* Botão Compacto para cada dia */}
          <div className="flex gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedPlan([dayPlan]); // Array com um dia para o modal compacto
                setSelectedPlanType('daily');
                setCompactModalOpen(true);
              }}
              className="flex-1 text-xs"
            >
              <FileText className="w-3 h-3 mr-1" />
              Compacto
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-2">
            Sofia Nutricional — documento educativo
          </div>
        </div>
      ))}

      {/* Modais */}
      <WeeklyMealPlanModal
        open={weeklyModalOpen}
        onOpenChange={setWeeklyModalOpen}
        mealPlan={plan}
      />

      {selectedDayPlan && (
        <DailyMealPlanModal
          open={dailyModalOpen}
          onOpenChange={setDailyModalOpen}
          dayPlan={selectedDayPlan}
        />
      )}

      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Cardápios
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Abrir o primeiro plano do histórico em modo compacto
                  if (history && history.length > 0) {
                    const firstPlan = history[0];
                    const adaptedData = adaptHistoryData(firstPlan);
                    setSelectedPlan(adaptedData);
                    setSelectedPlanType(firstPlan.plan_type);
                    setHistoryModalOpen(false);
                    setCompactModalOpen(true);
                  }
                }}
                className="print:hidden"
                title="Visualização compacta com abas"
              >
                <FileText className="w-4 h-4 mr-2" />
                Compacto
              </Button>
            </DialogTitle>
          </DialogHeader>
          <MealPlanHistoryModal />
        </DialogContent>
      </Dialog>

      {/* Modal de Salvar */}
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Cardápio</DialogTitle>
            <DialogDescription>
              Escolha um título para salvar este cardápio no seu histórico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título do cardápio</Label>
              <Input
                id="title"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Ex: Cardápio Semanal - Janeiro 2024"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaveModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Compacto */}
      {selectedPlanType === 'weekly' && selectedPlan && (
        <CompactMealPlanModal
          open={compactModalOpen}
          onOpenChange={setCompactModalOpen}
          dayPlan={selectedPlan[0]} // Pega o primeiro dia para o modal compacto
          title="Cardápio Semanal - Histórico"
        />
      )}

      {selectedPlanType === 'daily' && selectedPlan && (
        <CompactMealPlanModal
          open={compactModalOpen}
          onOpenChange={setCompactModalOpen}
          dayPlan={selectedPlan}
          title="Cardápio Diário - Histórico"
        />
      )}
    </div>
  );
};