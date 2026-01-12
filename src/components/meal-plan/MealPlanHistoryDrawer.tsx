import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Calendar, 
  Flame, 
  ChevronRight, 
  Trash2, 
  Eye,
  X,
  Clock,
  Utensils,
  TrendingUp,
  ChefHat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMealPlanHistory } from '@/hooks/useMealPlanHistory';
import { WeeklyMealPlanModal } from './WeeklyMealPlanModal';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ============================================
// TIPOS
// ============================================
interface MealPlanHistoryItem {
  id: string;
  title: string;
  plan_type: 'weekly' | 'daily';
  meal_plan_data: any;
  created_at: string;
}

// ============================================
// HELPERS
// ============================================
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short' 
  });
};

const calculateTotals = (mealPlanData: any) => {
  if (!mealPlanData || !Array.isArray(mealPlanData)) {
    return { calories: 0, meals: 0, days: 0 };
  }
  
  let totalCalories = 0;
  let totalMeals = 0;
  
  mealPlanData.forEach((day: any) => {
    if (day.dailyTotals?.calories) {
      totalCalories += day.dailyTotals.calories;
    }
    if (day.meals && Array.isArray(day.meals)) {
      totalMeals += day.meals.length;
    }
  });
  
  const avgCalories = mealPlanData.length > 0 
    ? Math.round(totalCalories / mealPlanData.length) 
    : 0;
  
  return { 
    calories: avgCalories, 
    meals: totalMeals, 
    days: mealPlanData.length 
  };
};

const getMealEmojis = (mealPlanData: any): string[] => {
  if (!mealPlanData || !Array.isArray(mealPlanData)) return ['🍽️'];
  
  const emojis: string[] = [];
  const firstDay = mealPlanData[0];
  
  if (firstDay?.meals && Array.isArray(firstDay.meals)) {
    firstDay.meals.slice(0, 4).forEach((meal: any) => {
      const type = meal.type?.toLowerCase() || '';
      if (type.includes('café') || type.includes('breakfast')) emojis.push('☕');
      else if (type.includes('almoço') || type.includes('lunch')) emojis.push('🍽️');
      else if (type.includes('lanche') || type.includes('snack')) emojis.push('🍎');
      else if (type.includes('jantar') || type.includes('dinner')) emojis.push('🌙');
      else if (type.includes('ceia')) emojis.push('🌟');
      else emojis.push('🥗');
    });
  }
  
  return emojis.length > 0 ? emojis : ['🍽️'];
};

// ============================================
// COMPONENTE DE CARD DO HISTÓRICO
// ============================================
interface HistoryCardProps {
  item: MealPlanHistoryItem;
  onView: () => void;
  onDelete: () => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item, onView, onDelete }) => {
  const totals = calculateTotals(item.meal_plan_data);
  const emojis = getMealEmojis(item.meal_plan_data);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all"
    >
      {/* Badge de tipo */}
      <div className="absolute -top-2 -right-2">
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-medium",
          item.plan_type === 'weekly' 
            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" 
            : "bg-green-500/20 text-green-600 dark:text-green-400"
        )}>
          {item.plan_type === 'weekly' ? '7 dias' : '1 dia'}
        </span>
      </div>
      
      <div className="flex items-start gap-3">
        {/* Preview de emojis */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center flex-shrink-0">
          <div className="flex flex-wrap justify-center gap-0.5">
            {emojis.slice(0, 4).map((emoji, idx) => (
              <span key={idx} className="text-sm">{emoji}</span>
            ))}
          </div>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDate(item.created_at)}
            </span>
          </div>
          
          <h4 className="font-medium text-sm truncate mb-2">
            {item.title || 'Cardápio sem título'}
          </h4>
          
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span>{totals.calories} kcal/dia</span>
            </div>
            <div className="flex items-center gap-1">
              <Utensils className="w-3 h-3 text-green-500" />
              <span>{totals.meals} refeições</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onView}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};


// ============================================
// COMPONENTE PRINCIPAL - DRAWER DE HISTÓRICO
// ============================================
interface MealPlanHistoryDrawerProps {
  trigger?: React.ReactNode;
}

export const MealPlanHistoryDrawer: React.FC<MealPlanHistoryDrawerProps> = ({ trigger }) => {
  const { history, loading, deleteMealPlan, refetch } = useMealPlanHistory();
  const [selectedPlan, setSelectedPlan] = useState<MealPlanHistoryItem | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Calcular estatísticas gerais
  const stats = React.useMemo(() => {
    if (!history.length) return { total: 0, avgCalories: 0, thisWeek: 0 };
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let totalCalories = 0;
    let thisWeekCount = 0;
    
    history.forEach(item => {
      const totals = calculateTotals(item.meal_plan_data);
      totalCalories += totals.calories;
      
      if (new Date(item.created_at) >= weekAgo) {
        thisWeekCount++;
      }
    });
    
    return {
      total: history.length,
      avgCalories: history.length > 0 ? Math.round(totalCalories / history.length) : 0,
      thisWeek: thisWeekCount
    };
  }, [history]);

  const handleView = (item: MealPlanHistoryItem) => {
    setSelectedPlan(item);
    setShowViewModal(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMealPlan(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <History className="w-4 h-4 mr-1" />
              Histórico
            </Button>
          )}
        </SheetTrigger>
        
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                Histórico de Cardápios
              </SheetTitle>
            </SheetHeader>

            {/* Stats Cards */}
            <div className="p-4 border-b border-border">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ChefHat className="w-3 h-3 text-amber-500" />
                  </div>
                  <p className="text-lg font-bold">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                  </div>
                  <p className="text-lg font-bold">{stats.avgCalories}</p>
                  <p className="text-[10px] text-muted-foreground">Média kcal</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  </div>
                  <p className="text-lg font-bold">{stats.thisWeek}</p>
                  <p className="text-[10px] text-muted-foreground">Esta semana</p>
                </div>
              </div>
            </div>

            {/* Lista de Histórico */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <ChefHat className="w-8 h-8 text-amber-500" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-1">Nenhum cardápio salvo</h4>
                  <p className="text-sm text-muted-foreground">
                    Gere seu primeiro cardápio para começar!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {history.map((item) => (
                      <HistoryCard
                        key={item.id}
                        item={item}
                        onView={() => handleView(item)}
                        onDelete={() => setDeleteId(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de Visualização */}
      {selectedPlan && (
        <WeeklyMealPlanModal
          open={showViewModal}
          onOpenChange={setShowViewModal}
          mealPlan={selectedPlan.meal_plan_data?.map((day: any) => ({
            ...day,
            dailyTotals: {
              calories: day.dailyTotals?.calories || 0,
              protein: day.dailyTotals?.protein || 0,
              carbs: day.dailyTotals?.carbs || 0,
              fat: day.dailyTotals?.fat || 0,
              fiber: day.dailyTotals?.fiber || 0
            }
          })) || []}
        />
      )}

      {/* Dialog de Confirmação de Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cardápio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cardápio será removido permanentemente do seu histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MealPlanHistoryDrawer;
