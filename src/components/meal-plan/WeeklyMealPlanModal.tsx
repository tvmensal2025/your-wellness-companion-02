import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Printer, 
  CalendarDays, 
  Flame,
  ChevronDown,
  Sparkles,
  TrendingUp,
  ChefHat
} from 'lucide-react';
import { CompactMealPlanModal } from './CompactMealPlanModal';
import { supabase } from '@/integrations/supabase/client';

interface Meal {
  title: string;
  description: string;
  preparo?: string;
  modoPreparoElegante?: string;
  ingredients: string[];
  practicalSuggestion?: string;
  macros: { calories: number; protein: number; carbs: number; fat: number; fiber?: number; };
}

interface DayPlan {
  day: number;
  dailyTotals?: { calories: number; protein: number; carbs: number; fat: number; fiber: number; };
  meals: { breakfast?: Meal; lunch?: Meal; snack?: Meal; dinner?: Meal; supper?: Meal; };
}

interface WeeklyMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlan: DayPlan[];
  title?: string;
}

const MEAL_CONFIG = {
  breakfast: { 
    emoji: '🌅', 
    label: 'Café', 
    fullLabel: 'CAFÉ DA MANHÃ',
    gradient: 'from-orange-500 to-amber-500', 
    textColor: 'text-orange-500', 
    bgColor: 'bg-orange-500/10', 
    borderColor: 'border-l-orange-500',
    time: '07:00'
  },
  lunch: { 
    emoji: '☀️', 
    label: 'Almoço', 
    fullLabel: 'ALMOÇO',
    gradient: 'from-green-500 to-emerald-500', 
    textColor: 'text-green-500', 
    bgColor: 'bg-green-500/10', 
    borderColor: 'border-l-green-500',
    time: '12:00'
  },
  snack: { 
    emoji: '🍃', 
    label: 'Lanche', 
    fullLabel: 'LANCHE',
    gradient: 'from-cyan-500 to-sky-500', 
    textColor: 'text-cyan-500', 
    bgColor: 'bg-cyan-500/10', 
    borderColor: 'border-l-cyan-500',
    time: '15:30'
  },
  dinner: { 
    emoji: '🌆', 
    label: 'Jantar', 
    fullLabel: 'JANTAR',
    gradient: 'from-purple-500 to-violet-500', 
    textColor: 'text-purple-500', 
    bgColor: 'bg-purple-500/10', 
    borderColor: 'border-l-purple-500',
    time: '19:00'
  },
  supper: { 
    emoji: '🌙', 
    label: 'Ceia', 
    fullLabel: 'CEIA',
    gradient: 'from-indigo-500 to-blue-500', 
    textColor: 'text-indigo-500', 
    bgColor: 'bg-indigo-500/10', 
    borderColor: 'border-l-indigo-500',
    time: '21:00'
  }
};

// Circular Progress
const CircularProgress: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative w-14 h-14">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
        <motion.circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

// Mini Timeline - Visual horizontal do dia
const MiniDayTimeline: React.FC<{ meals: DayPlan['meals'] }> = ({ meals }) => {
  const mealTypes: (keyof typeof MEAL_CONFIG)[] = ['breakfast', 'lunch', 'snack', 'dinner', 'supper'];
  
  return (
    <div className="flex items-center gap-1 py-2">
      {mealTypes.map((type, index) => {
        const meal = meals[type];
        const config = MEAL_CONFIG[type];
        const hasMeal = !!meal;
        
        return (
          <React.Fragment key={type}>
            {/* Meal dot */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative group cursor-pointer",
                "flex flex-col items-center"
              )}
            >
              {/* Time label */}
              <span className="text-[9px] text-muted-foreground mb-1">{config.time}</span>
              
              {/* Dot with emoji */}
              <motion.div
                whileHover={{ scale: 1.2 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  "transition-all duration-300",
                  hasMeal 
                    ? `bg-gradient-to-br ${config.gradient} shadow-lg` 
                    : "bg-muted/50 border-2 border-dashed border-muted-foreground/30"
                )}
              >
                <span className={cn("text-lg", !hasMeal && "opacity-30")}>
                  {config.emoji}
                </span>
              </motion.div>
              
              {/* Label */}
              <span className={cn(
                "text-[10px] mt-1 font-medium",
                hasMeal ? config.textColor : "text-muted-foreground/50"
              )}>
                {config.label}
              </span>
              
              {/* Calories tooltip on hover */}
              {hasMeal && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-primary whitespace-nowrap">
                    {meal.macros.calories} kcal
                  </span>
                </div>
              )}
            </motion.div>
            
            {/* Connector line */}
            {index < mealTypes.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 min-w-4 max-w-8 mt-3",
                hasMeal && meals[mealTypes[index + 1]]
                  ? "bg-gradient-to-r from-primary/50 to-primary/30"
                  : "bg-muted/30"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Meal Card - Balanceado: título + descrição curta + calorias
const MealCard: React.FC<{ meal: Meal; type: keyof typeof MEAL_CONFIG; index: number }> = ({ meal, type, index }) => {
  const config = MEAL_CONFIG[type];
  // Pegar descrição curta (máx 80 chars)
  const shortDesc = meal.practicalSuggestion || meal.description || meal.ingredients.slice(0, 3).join(', ');
  const truncatedDesc = shortDesc.length > 80 ? shortDesc.substring(0, 80) + '...' : shortDesc;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "p-3 rounded-xl border-l-4",
        config.borderColor,
        config.bgColor,
        "hover:shadow-md transition-shadow"
      )}
    >
      {/* Header: Emoji + Label + Calorias */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.emoji}</span>
          <div className="flex flex-col">
            <span className={cn("font-bold text-xs uppercase tracking-wide", config.textColor)}>
              {config.fullLabel}
            </span>
            <span className="text-[10px] text-muted-foreground">{config.time}</span>
          </div>
        </div>
        <motion.div
          className={cn("px-2.5 py-1 rounded-full text-xs font-bold text-white shadow", `bg-gradient-to-r ${config.gradient}`)}
          whileHover={{ scale: 1.05 }}
        >
          <Flame className="w-3 h-3 inline mr-1" />{meal.macros.calories} kcal
        </motion.div>
      </div>

      {/* Título */}
      <h4 className="font-semibold text-sm text-foreground mb-1">{meal.title}</h4>

      {/* Descrição curta */}
      <p className="text-xs text-muted-foreground line-clamp-2">{truncatedDesc}</p>
      
      {/* Mini macros */}
      <div className="flex gap-2 mt-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 font-medium">
          {meal.macros.protein}g P
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">
          {meal.macros.carbs}g C
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 font-medium">
          {meal.macros.fat}g G
        </span>
      </div>
    </motion.div>
  );
};

// Summary Card
const SummaryCard: React.FC<{ macros: { calories: number; protein: number; carbs: number; fat: number; fiber: number } }> = ({ macros }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }} 
    animate={{ opacity: 1, y: 0 }} 
    className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-primary/20">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-base">Média Diária</h3>
          <p className="text-xs text-muted-foreground">Valores nutricionais do plano</p>
        </div>
      </div>
      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
        <Sparkles className="w-3 h-3" />
        Personalizado
      </div>
    </div>

    {/* Layout responsivo: em telas pequenas empilha, em maiores fica lado a lado */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Calorias com progresso circular */}
      <div className="flex items-center gap-3 pb-3 sm:pb-0 sm:pr-4 border-b sm:border-b-0 sm:border-r border-border/50">
        <CircularProgress value={macros.calories} max={2000} />
        <div>
          <div className="text-2xl font-bold text-primary leading-tight">{macros.calories}</div>
          <div className="text-xs text-muted-foreground">kcal/dia</div>
        </div>
      </div>

      {/* Outros macros - grid responsivo */}
      <div className="flex-1 grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Proteína', value: macros.protein, icon: '💪', color: 'text-red-500' },
          { label: 'Carbos', value: macros.carbs, icon: '⚡', color: 'text-amber-500' },
          { label: 'Gordura', value: macros.fat, icon: '🥑', color: 'text-yellow-500' },
          { label: 'Fibras', value: macros.fiber, icon: '🥬', color: 'text-green-500' }
        ].map((m) => (
          <div key={m.label} className="text-center">
            <div className="text-base sm:text-lg mb-0.5">{m.icon}</div>
            <div className={cn("text-sm sm:text-base font-bold leading-tight", m.color)}>{m.value}g</div>
            <div className="text-[8px] sm:text-[9px] text-muted-foreground leading-tight mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

// Day Card
const DayCard: React.FC<{
  dayPlan: DayPlan;
  isExpanded: boolean;
  onToggle: () => void;
  onViewDetailed: () => void;
  getDayName: (d: number) => string;
}> = ({ dayPlan, isExpanded, onToggle, onViewDetailed, getDayName }) => {
  const mealTypes: (keyof typeof MEAL_CONFIG)[] = ['breakfast', 'lunch', 'snack', 'dinner', 'supper'];
  const mealsCount = Object.values(dayPlan.meals).filter(Boolean).length;

  return (
    <motion.div 
      layout 
      className={cn(
        "rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden",
        isExpanded && "shadow-lg border-primary/30"
      )}
    >
      {/* Header - Clicável */}
      <button 
        onClick={onToggle} 
        className="w-full p-4 flex flex-col hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {/* Badge do dia */}
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30"
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <span className="text-2xl font-bold text-primary-foreground">{dayPlan.day}</span>
            </motion.div>

            <div className="text-left">
              <h3 className="font-bold text-lg text-foreground">{getDayName(dayPlan.day)}</h3>
              <p className="text-sm text-muted-foreground">
                {mealsCount} refeições
                {dayPlan.dailyTotals && (
                  <span className="text-primary font-semibold ml-1">• {dayPlan.dailyTotals.calories} kcal</span>
                )}
              </p>
            </div>
          </div>

          <motion.div 
            animate={{ rotate: isExpanded ? 180 : 0 }} 
            transition={{ duration: 0.2 }}
            className="p-2 rounded-full bg-muted/50"
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
        
        {/* Mini Timeline - sempre visível */}
        <div className="mt-3 w-full overflow-x-auto">
          <MiniDayTimeline meals={dayPlan.meals} />
        </div>
      </button>

      {/* Conteúdo expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Divider elegante */}
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Cards de refeição */}
              {mealTypes.map((type, i) => {
                const meal = dayPlan.meals[type];
                return meal ? <MealCard key={type} meal={meal} type={type} index={i} /> : null;
              })}

              {/* Botão Ver Detalhado */}
              <Button 
                onClick={onViewDetailed} 
                className="w-full gap-2 mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
              >
                <ChefHat className="w-4 h-4" />
                Ver Receitas Completas
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const WeeklyMealPlanModal: React.FC<WeeklyMealPlanModalProps> = ({ 
  open, 
  onOpenChange, 
  mealPlan, 
  title = "Cardápio Semanal" 
}) => {
  const [compactModalOpen, setCompactModalOpen] = useState(false);
  const [selectedDayForCompact, setSelectedDayForCompact] = useState<DayPlan | null>(null);
  const [userFullName, setUserFullName] = useState('');
  const [expandedDays, setExpandedDays] = useState<number[]>([1]); // Primeiro dia expandido

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUserFullName((data.user?.user_metadata as any)?.full_name || '');
      } catch {}
    })();
  }, []);

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[(day - 1) % 7];
  };

  const toggleDay = (day: number) => {
    setExpandedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  // Calcular média de macros
  const avgMacros = (() => {
    if (!mealPlan.length) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const t = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    
    mealPlan.forEach(d => {
      if (d.dailyTotals) {
        t.calories += d.dailyTotals.calories;
        t.protein += d.dailyTotals.protein;
        t.carbs += d.dailyTotals.carbs;
        t.fat += d.dailyTotals.fat;
        t.fiber += d.dailyTotals.fiber;
      } else {
        (Object.values(d.meals).filter(Boolean) as Meal[]).forEach(m => {
          t.calories += m.macros.calories;
          t.protein += m.macros.protein;
          t.carbs += m.macros.carbs;
          t.fat += m.macros.fat;
          t.fiber += m.macros.fiber || 0;
        });
      }
    });
    
    const n = mealPlan.length;
    return {
      calories: Math.round(t.calories / n),
      protein: Math.round(t.protein / n),
      carbs: Math.round(t.carbs / n),
      fat: Math.round(t.fat / n),
      fiber: Math.round(t.fiber / n)
    };
  })();

  const handlePrint = () => {
    onOpenChange(false);
    setTimeout(() => {
      const w = window.open('', '_blank');
      if (w) {
        // Logo em base64 para garantir que apareça no PDF (imagens externas não carregam em window.open)
        const logoBase64 = 'data:image/jpeg;base64,/9j/4gJASUNDX1BST0ZJTEUAAQEAAAIwQURCRQIQAABtbnRyUkdCIFhZWiAHzwAGAAMAAAAAAABhY3NwQVBQTAAAAABub25lAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLUFEQkUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApjcHJ0AAAA/AAAADJkZXNjAAABMAAAAGt3dHB0AAABnAAAABRia3B0AAABsAAAABRyVFJDAAABxAAAAA5nVFJDAAAB1AAAAA5iVFJDAAAB5AAAAA5yWFlaAAAB9AAAABRnWFlaAAACCAAAABRiWFlaAAACHAAAABR0ZXh0AAAAAENvcHlyaWdodCAxOTk5IEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkAAAAZGVzYwAAAAAAAAARQWRvYmUgUkdCICgxOTk4KQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAPNRAAEAAAABFsxYWVogAAAAAAAAAAAAAAAAAAAAAGN1cnYAAAAAAAAAAQIzAABjdXJ2AAAAAAAAAAECMwAAY3VydgAAAAAAAAABAjMAAFhZWiAAAAAAAACcGAAAT6UAAAT8WFlaIAAAAAAAADSNAACgLAAAD5VYWVogAAAAAAAAJjEAABAvAAC+nP/bAIQACgcHBwgHCggICg8KCAoPEg0KCg0SFBAQEhAQFBQPEREREQ8UFBcYGhgXFB8fISEfHy0sLCwtMjIyMjIyMjIyMgELCgoLDAsODAwOEg4ODhIUDg4ODhQZERESEREZIBcUFBQUFyAcHhoaGh4cIyMgICMjKyspKysyMjIyMjIyMjIy/90ABAAL/+4ADkFkb2JlAGTAAAAAAf/AABEIALEAowMAIgABEQECEQH/xAGiAAEAAwACAQUAAAAAAAAAAAAABgcIBAUCAQMJCgsBAQAABAcAAAAAAAAAAAAAAAABAgMEBQYHCAkKCxAAAAQCAgQFCihfAAAAAAAAAAECAwQFBhEHNnSyEiE1QbMTFiIxQkNRc3WBCAkKFBUXGBkaIyQlJicoKSoyMzQ3ODk6REVGR0hJSlJVYWJykZOx0VNUVldYWVpjZGVmZ2hpanF2d3h5eoKDhIWGh4iJipKUlZaXmJmaoaKjpKWmp6ipqrS1tre4ubrBwsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vDx8vP09fb3+Pn6EQABAAAAAB6DAAAAAAAAAAAAAQIDBAUGBwgJChESExQVFhcYGRohIiMkJSYnKCkqMTIzNDU2Nzg5OkFCQ0RFRkdISUpRUlNUVVZXWFlaYWJjZGVmZ2hpanFyc3R1dnd4eXqBgoOEhYaHiImKkZKTlJWWl5iZmqGio6SlpqeoqaqxsrO0tba3uLm6wcLDxMXGx8jJytHS09TV1tfY2drh4uPk5ebn6Onq8PHy8/T19vf4+fr/2gAMAwAAARECEQA/ALmAAAAAAAAAAAAAAAAHXxs9lUE7lKIfInMdKSNRlhV5lgSOoQQUMgIVAVUMgoCBSSCCgoCA0oKCqUk7ABF36bwqXKmIZbiMOtSlEg68aoiwQ6uJpjNXVmbGAYRVUkiSSjLDLDrXXh6YUUMjpEkCGqtIQCmgouiaBDVWkExiJnBQ0SzCvOkl586m0+MKvQVnhEOWKofdfdeU6+pS3V4alKzZ6AWbLYtMZAMRKc04gjMqzOpRYSirPQGQgiCLrIhkMgKioqNKBSAiSKq9BQUBUVFR8HKAAFwVQAAAAAAAAAAD/0LmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9G5gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//Z';
        const currentDate = new Date().toLocaleDateString('pt-BR', { 
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
          @page { size: A4; margin: 12mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 15px; max-width: 800px; margin: 0 auto; color: #1a1a1a; font-size: 11px; }
          
          /* Header Premium */
          .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 3px solid #22c55e; margin-bottom: 15px; }
          .header-left { display: flex; align-items: center; gap: 12px; }
          .logo-img { height: 36px; width: auto; }
          .header-title { font-size: 22px; font-weight: 900; color: #16a34a; }
          .header-subtitle { font-size: 10px; color: #666; margin-top: 2px; }
          .header-right { text-align: right; }
          .header-date { font-size: 10px; color: #666; }
          .header-user { font-size: 11px; font-weight: 600; color: #22c55e; margin-top: 2px; }
          
          /* Summary */
          .summary { background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 15px 20px; border-radius: 12px; margin: 15px 0; display: flex; justify-content: space-around; text-align: center; border: 1px solid #86efac; }
          .summary div { }
          .summary .value { font-size: 22px; font-weight: 800; color: #16a34a; }
          .summary .label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          
          /* Day Card */
          .day { border: 1px solid #e5e7eb; border-left: 5px solid #22c55e; padding: 12px 15px; margin: 12px 0; border-radius: 10px; background: white; }
          .day h3 { color: #16a34a; margin: 0 0 10px 0; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
          .day-badge { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px; }
          
          /* Meal Card */
          .meal { padding: 10px 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid; }
          .meal.breakfast { background: linear-gradient(135deg, #fff7ed, #ffedd5); border-color: #f97316; }
          .meal.lunch { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-color: #22c55e; }
          .meal.snack { background: linear-gradient(135deg, #ecfeff, #cffafe); border-color: #06b6d4; }
          .meal.dinner { background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-color: #8b5cf6; }
          .meal.supper { background: linear-gradient(135deg, #eef2ff, #e0e7ff); border-color: #6366f1; }
          
          .meal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
          .meal-title { font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 6px; }
          .meal-kcal { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; }
          .meal-name { font-size: 12px; font-weight: 600; margin-bottom: 3px; color: #1a1a1a; }
          .meal-desc { font-size: 10px; color: #666; line-height: 1.4; }
          
          /* Tips Section */
          .tips { background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 10px; padding: 12px 15px; margin: 15px 0; border: 1px solid #fbbf24; }
          .tips-header { font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
          .tip { font-size: 10px; color: #78350f; padding: 4px 0; border-bottom: 1px dashed #fbbf24; }
          .tip:last-child { border-bottom: none; }
          
          /* Footer */
          .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 12px 15px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 10px; border: 2px solid #86efac; }
          .footer-left { display: flex; align-items: center; gap: 10px; }
          .footer-logo { height: 20px; width: auto; }
          .footer-brand { font-size: 14px; font-weight: 800; color: #16a34a; }
          .footer-right { text-align: right; }
          .footer-sofia { font-size: 10px; color: #22c55e; font-weight: 600; }
          .footer-user { font-size: 9px; color: #666; }
          .footer-slogan { font-size: 8px; color: #94a3b8; font-style: italic; margin-top: 2px; }
        </style></head><body>
          <!-- Header Premium -->
          <div class="header">
            <div class="header-left">
              <img src="${logoBase64}" alt="MaxNutrition" class="logo-img" />
              <div>
                <div class="header-title">${title}</div>
                <div class="header-subtitle">Plano alimentar personalizado por Sofia Nutricional</div>
              </div>
            </div>
            <div class="header-right">
              <div class="header-date">📅 ${currentDate}</div>
              ${userFullName ? `<div class="header-user">👤 ${userFullName}</div>` : ''}
            </div>
          </div>
          
          <!-- Summary -->
          <div class="summary">
            <div><div class="value">🔥 ${avgMacros.calories}</div><div class="label">kcal/dia</div></div>
            <div><div class="value">💪 ${avgMacros.protein}g</div><div class="label">Proteína</div></div>
            <div><div class="value">⚡ ${avgMacros.carbs}g</div><div class="label">Carboidratos</div></div>
            <div><div class="value">🥑 ${avgMacros.fat}g</div><div class="label">Gordura</div></div>
            <div><div class="value">🥬 ${avgMacros.fiber}g</div><div class="label">Fibras</div></div>
          </div>
          
          <!-- Days -->
          ${mealPlan.map(d => `<div class="day"><h3>${getDayName(d.day)} <span class="day-badge">Dia ${d.day} ${d.dailyTotals ? `• ${d.dailyTotals.calories} kcal` : ''}</span></h3>${Object.entries(d.meals).filter(([,m]) => m).map(([k,m]) => {const meal = m as Meal; const cfg = MEAL_CONFIG[k as keyof typeof MEAL_CONFIG]; return `<div class="meal ${k}"><div class="meal-header"><span class="meal-title">${cfg?.emoji} ${cfg?.fullLabel}</span><span class="meal-kcal">🔥 ${meal.macros.calories} kcal</span></div><div class="meal-name">${meal.title}</div><div class="meal-desc">${meal.practicalSuggestion || meal.ingredients.slice(0,3).join(', ')}</div></div>`;}).join('')}</div>`).join('')}
          
          <!-- Tips -->
          <div class="tips">
            <div class="tips-header">💡 Dicas da Sofia para seu cardápio</div>
            <div class="tip">🥗 Varie as cores dos vegetais para garantir diferentes nutrientes</div>
            <div class="tip">💧 Beba pelo menos 2 litros de água por dia entre as refeições</div>
            <div class="tip">⏰ Mantenha horários regulares para as refeições</div>
          </div>
          
          <!-- Footer Premium -->
          <div class="footer">
            <div class="footer-left">
              <img src="${logoBase64}" alt="MaxNutrition" class="footer-logo" />
              <div class="footer-brand">MaxNutrition</div>
            </div>
            <div class="footer-right">
              <div class="footer-sofia">🤖 Sofia Nutricional</div>
              ${userFullName ? `<div class="footer-user">Preparado para: ${userFullName}</div>` : ''}
              <div class="footer-slogan">Sua jornada para uma vida mais saudável</div>
            </div>
          </div>
        </body></html>`);
        w.document.close();
        w.onload = () => { w.print(); w.close(); };
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl h-[90vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <CalendarDays className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h2 className="font-bold text-xl flex items-center gap-2">
                  {title}
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </h2>
                <p className="text-sm text-muted-foreground">{mealPlan.length} dias • Plano personalizado</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Card de resumo */}
          <SummaryCard macros={avgMacros} />

          {/* Cards dos dias */}
          {mealPlan.map((d, i) => (
            <motion.div 
              key={d.day} 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
            >
              <DayCard
                dayPlan={d}
                isExpanded={expandedDays.includes(d.day)}
                onToggle={() => toggleDay(d.day)}
                onViewDetailed={() => {
                  setSelectedDayForCompact(d);
                  setCompactModalOpen(true);
                }}
                getDayName={getDayName}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 border-t bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" />
            Cardápio gerado por Sofia Nutricional
            <Sparkles className="w-3 h-3 text-primary" />
          </p>
        </div>
      </DialogContent>

      {/* Modal Detalhado */}
      {selectedDayForCompact && (
        <CompactMealPlanModal
          open={compactModalOpen}
          onOpenChange={setCompactModalOpen}
          dayPlan={selectedDayForCompact}
        />
      )}
    </Dialog>
  );
};
