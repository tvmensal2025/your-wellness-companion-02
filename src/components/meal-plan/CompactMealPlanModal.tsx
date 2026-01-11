import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { 
  Printer, 
  Leaf, 
  ChefHat, 
  Flame,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Meal {
  title: string;
  description: string;
  preparo?: string;
  modoPreparoElegante?: string;
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

interface CompactMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayPlan: DayPlan;
}

const MEAL_CONFIG = {
  breakfast: { 
    emoji: '🌅', 
    label: 'Café da Manhã',
    shortLabel: 'CAFÉ',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    bgGradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
    accentColor: 'text-orange-500',
    borderColor: 'border-orange-500',
    time: '07:00'
  },
  lunch: { 
    emoji: '☀️', 
    label: 'Almoço',
    shortLabel: 'ALMOÇO',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    bgGradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
    accentColor: 'text-green-500',
    borderColor: 'border-green-500',
    time: '12:00'
  },
  snack: { 
    emoji: '🍃', 
    label: 'Lanche',
    shortLabel: 'LANCHE',
    gradient: 'from-cyan-500 via-sky-500 to-blue-500',
    bgGradient: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    accentColor: 'text-cyan-500',
    borderColor: 'border-cyan-500',
    time: '15:30'
  },
  dinner: { 
    emoji: '🌆', 
    label: 'Jantar',
    shortLabel: 'JANTAR',
    gradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
    bgGradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
    accentColor: 'text-purple-500',
    borderColor: 'border-purple-500',
    time: '19:00'
  },
  supper: { 
    emoji: '🌙', 
    label: 'Ceia',
    shortLabel: 'CEIA',
    gradient: 'from-indigo-500 via-blue-600 to-slate-600',
    bgGradient: 'from-indigo-500/20 via-blue-600/10 to-transparent',
    accentColor: 'text-indigo-500',
    borderColor: 'border-indigo-500',
    time: '21:00'
  }
};

type MealType = keyof typeof MEAL_CONFIG;

// Animated Macro Ring with Emoji
const MacroRing: React.FC<{ 
  value: number; 
  label: string; 
  emoji: string;
  color: string;
  maxValue?: number;
  delay?: number;
}> = ({ value, label, emoji, color, maxValue = 100, delay = 0 }) => {
  const circumference = 2 * Math.PI * 18;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
    >
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
          {/* Background circle */}
          <circle 
            cx="20" cy="20" r="18" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            className="text-muted/20" 
          />
          {/* Progress circle */}
          <motion.circle 
            cx="20" cy="20" r="18" 
            fill="none" 
            stroke={color}
            strokeWidth="3" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut", delay: delay + 0.2 }}
          />
        </svg>
        {/* Emoji in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className="text-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.3, type: 'spring' }}
          >
            {emoji}
          </motion.span>
        </div>
      </div>
      {/* Value and label */}
      <motion.div 
        className="text-center mt-1"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: delay + 0.4 }}
      >
        <div className="text-sm font-bold text-foreground">
          {value}{label !== 'KCAL' && 'g'}
        </div>
        <div className="text-[8px] text-muted-foreground font-medium">{label}</div>
      </motion.div>
    </motion.div>
  );
};

// Macros Display with Rings
const MacrosDisplay: React.FC<{ macros: Meal['macros'] }> = ({ macros }) => {
  const items = [
    { value: macros.calories, label: 'KCAL', emoji: '🔥', color: '#f97316', maxValue: 800 },
    { value: macros.protein, label: 'PROT', emoji: '💪', color: '#ef4444', maxValue: 100 },
    { value: macros.carbs, label: 'CARB', emoji: '⚡', color: '#eab308', maxValue: 150 },
    { value: macros.fat, label: 'GORD', emoji: '🥑', color: '#22c55e', maxValue: 80 },
    { value: macros.fiber || 0, label: 'FIBRA', emoji: '🥬', color: '#8b5cf6', maxValue: 40 },
  ];

  return (
    <div className="flex items-center justify-between py-2">
      {items.map((item, idx) => (
        <MacroRing
          key={item.label}
          value={item.value}
          label={item.label}
          emoji={item.emoji}
          color={item.color}
          maxValue={item.maxValue}
          delay={idx * 0.1}
        />
      ))}
    </div>
  );
};

// Premium Meal Tab Button - COMPACT
const MealTabButton: React.FC<{
  type: MealType;
  isActive: boolean;
  onClick: () => void;
  hasMeal: boolean;
}> = ({ type, isActive, onClick, hasMeal }) => {
  const config = MEAL_CONFIG[type];
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all min-w-[52px]",
        isActive 
          ? "bg-gradient-to-b from-primary/20 to-primary/5" 
          : "hover:bg-muted/50",
        !hasMeal && "opacity-30 pointer-events-none"
      )}
      whileHover={{ scale: hasMeal ? 1.05 : 1 }}
      whileTap={{ scale: hasMeal ? 0.95 : 1 }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className={cn("absolute inset-0 rounded-lg border-2", config.borderColor)}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      
      <motion.span 
        className={cn("text-xl relative z-10", isActive && "drop-shadow-lg")}
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {config.emoji}
      </motion.span>
      
      <span className={cn(
        "text-[9px] font-semibold relative z-10 transition-colors",
        isActive ? config.accentColor : "text-muted-foreground"
      )}>
        {config.shortLabel}
      </span>
      
      <span className="text-[7px] text-muted-foreground/60 relative z-10">
        {config.time}
      </span>
    </motion.button>
  );
};

// Premium Meal Content Card - ULTRA COMPACT
const MealContentCard: React.FC<{
  meal: Meal;
  type: MealType;
}> = ({ meal, type }) => {
  const config = MEAL_CONFIG[type];
  const [showIngredients, setShowIngredients] = useState(false);
  const [showPreparo, setShowPreparo] = useState(false);

  // Limpar ingredientes duplicados
  const cleanIngredients = meal.ingredients.map(ing => {
    return ing.replace(/\s*\([^)]+\)\s*\([^)]+\)$/, match => {
      const parts = match.split(') (');
      return parts[0] + ')';
    });
  });

  // Formatar modo de preparo em passos
  const preparoText = meal.modoPreparoElegante || meal.preparo || meal.description || '';
  const preparoSteps = preparoText
    .split(/\d+\.\s*/)
    .filter(s => s.trim())
    .map((step) => {
      const [title, ...rest] = step.split(':');
      const hasTitle = rest.length > 0 && title.length < 30;
      return {
        title: hasTitle ? title.trim() : null,
        text: hasTitle ? rest.join(':').trim() : step.trim()
      };
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      {/* Title + Calories - COMPACT */}
      <div className={cn(
        "rounded-xl p-3",
        "bg-gradient-to-br",
        config.bgGradient
      )}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <motion.div 
            className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
              "bg-gradient-to-r text-white font-medium text-xs",
              config.gradient
            )}
          >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </motion.div>
          
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur">
            <Flame className="w-3 h-3 text-orange-500" />
            <span className="font-bold text-sm">{meal.macros.calories}</span>
            <span className="text-[10px] text-muted-foreground">kcal</span>
          </div>
        </div>
        
        <h3 className="text-base font-bold text-foreground leading-tight">
          {meal.title}
        </h3>
      </div>

      {/* Macros with Animated Rings */}
      <MacrosDisplay macros={meal.macros} />

      {/* Collapsible Ingredients */}
      <button
        onClick={() => setShowIngredients(!showIngredients)}
        className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors"
      >
        <Leaf className="w-4 h-4 text-green-500" />
        <span className="font-medium text-sm">Ingredientes</span>
        <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {cleanIngredients.length}
        </span>
        <motion.div animate={{ rotate: showIngredients ? 180 : 0 }}>
          <ChevronLeft className="w-4 h-4 text-muted-foreground -rotate-90" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {showIngredients && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-gradient-to-b from-green-500/5 to-transparent border border-green-500/10 space-y-0">
              {cleanIngredients.map((ingredient, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-start gap-3 py-2",
                    idx !== cleanIngredients.length - 1 && "border-b border-green-500/10"
                  )}
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-foreground/90 leading-relaxed">{ingredient}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsible Preparation */}
      <button
        onClick={() => setShowPreparo(!showPreparo)}
        className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
      >
        <ChefHat className="w-4 h-4 text-amber-500" />
        <span className="font-medium text-sm">Modo de Preparo</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          15min
        </span>
        <motion.div animate={{ rotate: showPreparo ? 180 : 0 }}>
          <ChevronLeft className="w-4 h-4 text-muted-foreground -rotate-90" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {showPreparo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-gradient-to-b from-amber-500/5 to-transparent border border-amber-500/10 space-y-0">
              {preparoSteps.length > 0 ? preparoSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-start gap-3 py-2",
                    idx !== preparoSteps.length - 1 && "border-b border-amber-500/10"
                  )}
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    {step.title && (
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-0.5">
                        {step.title}
                      </span>
                    )}
                    <span className="text-xs text-foreground/90 leading-relaxed">{step.text}</span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {preparoText || 'Instruções não disponíveis'}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CompactMealPlanModal: React.FC<CompactMealPlanModalProps> = ({
  open,
  onOpenChange,
  dayPlan
}) => {
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner', 'supper'];
  const availableMeals = mealTypes.filter(type => dayPlan.meals[type]);
  const [activeTab, setActiveTab] = useState<MealType>(availableMeals[0] || 'breakfast');
  const [userName, setUserName] = useState('');
  
  // Get user name
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = (user.user_metadata as { full_name?: string })?.full_name || user.email?.split('@')[0] || '';
        setUserName(name);
      }
    };
    fetchUser();
  }, []);
  
  const currentMeal = dayPlan.meals[activeTab];
  const currentIndex = availableMeals.indexOf(activeTab);

  const goToPrev = () => {
    if (currentIndex > 0) {
      setActiveTab(availableMeals[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (currentIndex < availableMeals.length - 1) {
      setActiveTab(availableMeals[currentIndex + 1]);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const meal = currentMeal;
    if (!meal) return;
    
    const cfg = MEAL_CONFIG[activeTab];
    const macros = meal.macros || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const ingredients = meal.ingredients || [];
    
    const currentDate = new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Logo em base64 para garantir que apareça no PDF (imagens externas não carregam em window.open)
    const logoBase64 = 'data:image/jpeg;base64,/9j/4gJASUNDX1BST0ZJTEUAAQEAAAIwQURCRQIQAABtbnRyUkdCIFhZWiAHzwAGAAMAAAAAAABhY3NwQVBQTAAAAABub25lAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLUFEQkUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApjcHJ0AAAA/AAAADJkZXNjAAABMAAAAGt3dHB0AAABnAAAABRia3B0AAABsAAAABRyVFJDAAABxAAAAA5nVFJDAAAB1AAAAA5iVFJDAAAB5AAAAA5yWFlaAAAB9AAAABRnWFlaAAACCAAAABRiWFlaAAACHAAAABR0ZXh0AAAAAENvcHlyaWdodCAxOTk5IEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkAAAAZGVzYwAAAAAAAAARQWRvYmUgUkdCICgxOTk4KQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAPNRAAEAAAABFsxYWVogAAAAAAAAAAAAAAAAAAAAAGN1cnYAAAAAAAAAAQIzAABjdXJ2AAAAAAAAAAECMwAAY3VydgAAAAAAAAABAjMAAFhZWiAAAAAAAACcGAAAT6UAAAT8WFlaIAAAAAAAADSNAACgLAAAD5VYWVogAAAAAAAAJjEAABAvAAC+nP/bAIQACgcHBwgHCggICg8KCAoPEg0KCg0SFBAQEhAQFBQPEREREQ8UFBcYGhgXFB8fISEfHy0sLCwtMjIyMjIyMjIyMgELCgoLDAsODAwOEg4ODhIUDg4ODhQZERESEREZIBcUFBQUFyAcHhoaGh4cIyMgICMjKyspKysyMjIyMjIyMjIy/90ABAAL/+4ADkFkb2JlAGTAAAAAAf/AABEIALEAowMAIgABEQECEQH/xAGiAAEAAwACAQUAAAAAAAAAAAAABgcIBAUCAQMJCgsBAQAABAcAAAAAAAAAAAAAAAABAgMEBQYHCAkKCxAAAAQCAgQFCihfAAAAAAAAAAECAwQFBhEHNnSyEiE1QbMTFiIxQkNRc3WBCAkKFBUXGBkaIyQlJicoKSoyMzQ3ODk6REVGR0hJSlJVYWJykZOx0VNUVldYWVpjZGVmZ2hpanF2d3h5eoKDhIWGh4iJipKUlZaXmJmaoaKjpKWmp6ipqrS1tre4ubrBwsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vDx8vP09fb3+Pn6EQABAAAAAB6DAAAAAAAAAAAAAQIDBAUGBwgJChESExQVFhcYGRohIiMkJSYnKCkqMTIzNDU2Nzg5OkFCQ0RFRkdISUpRUlNUVVZXWFlaYWJjZGVmZ2hpanFyc3R1dnd4eXqBgoOEhYaHiImKkZKTlJWWl5iZmqGio6SlpqeoqaqxsrO0tba3uLm6wcLDxMXGx8jJytHS09TV1tfY2drh4uPk5ebn6Onq8PHy8/T19vf4+fr/2gAMAwAAARECEQA/ALmAAAAAAAAAAAAAAAAHXxs9lUE7lKIfInMdKSNRlhV5lgSOoQQUMgIVAVUMgoCBSSCCgoCA0oKCqUk7ABF36bwqXKmIZbiMOtSlEg68aoiwQ6uJpjNXVmbGAYRVUkiSSjLDLDrXXh6YUUMjpEkCGqtIQCmgouiaBDVWkExiJnBQ0SzCvOkl586m0+MKvQVnhEOWKofdfdeU6+pS3V4alKzZ6AWbLYtMZAMRKc04gjMqzOpRYSirPQGQgiCLrIhkMgKioqNKBSAiSKq9BQUBUVFR8HKAAFwVQAAAAAAAAAAD/0LmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9G5gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//Z';
    
    // Logo URL - usar logo-dark para fundo claro (print)
    const logoUrl = `${window.location.origin}/logo-dark.png`;
    
    // Limpar ingredientes duplicados (remove texto entre parênteses duplicado)
    const cleanIngredients = ingredients.map(ing => {
      // Remove duplicação tipo "Espaguete (75g) (Espaguete (75g))"
      const cleaned = ing.replace(/\s*\([^)]+\)\s*\([^)]+\)$/, match => {
        const parts = match.split(') (');
        return parts[0] + ')';
      });
      return cleaned;
    });
    
    const ingredientsHTML = cleanIngredients.map((ing, idx) => 
      `<div class="ing"><span class="ing-num">${idx + 1}</span><span class="ing-text">${ing}</span></div>`
    ).join('');
    
    // Formatar modo de preparo em passos
    const preparoText = meal.modoPreparoElegante || meal.preparo || meal.description || '';
    const preparoSteps = preparoText
      .split(/\d+\.\s*/)
      .filter(s => s.trim())
      .map((step, idx) => {
        const [title, ...rest] = step.split(':');
        const hasTitle = rest.length > 0 && title.length < 30;
        return `
          <div class="step">
            <div class="step-num">${idx + 1}</div>
            <div class="step-content">
              ${hasTitle ? `<div class="step-title">${title.trim()}</div>` : ''}
              <div class="step-text">${hasTitle ? rest.join(':').trim() : step.trim()}</div>
            </div>
          </div>
        `;
      }).join('');
    
    // Dicas nutricionais baseadas no tipo de refeição
    const tipsMap: Record<string, string[]> = {
      breakfast: [
        '🌅 Café da manhã é a refeição mais importante para ativar o metabolismo',
        '💧 Beba um copo de água ao acordar antes de comer',
        '🍳 Proteínas no café ajudam a manter a saciedade até o almoço'
      ],
      lunch: [
        '☀️ Almoce com calma, mastigue bem cada garfada',
        '🥗 Comece sempre pelos vegetais para melhor digestão',
        '⏰ Evite líquidos durante a refeição para não diluir enzimas'
      ],
      snack: [
        '🍃 Lanches saudáveis evitam exageros nas refeições principais',
        '🥜 Prefira snacks com proteína e fibra para saciedade',
        '⏱️ Coma a cada 3-4 horas para manter energia estável'
      ],
      dinner: [
        '🌆 Jante pelo menos 2h antes de dormir para boa digestão',
        '🥬 Prefira refeições mais leves à noite',
        '🍵 Chás digestivos após o jantar ajudam no relaxamento'
      ],
      supper: [
        '🌙 Ceia leve ajuda na qualidade do sono',
        '🥛 Proteínas de lenta absorção são ideais antes de dormir',
        '🧘 Evite alimentos estimulantes como café e chocolate'
      ]
    };
    
    const tips = tipsMap[activeTab] || tipsMap.lunch;
    const tipsHTML = tips.map(tip => `<div class="tip">${tip}</div>`).join('');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${cfg.label} - ${userName || 'MaxNutrition'}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            font-size: 10px;
            color: #1a1a1a;
            background: white;
            line-height: 1.4;
          }
          
          .watermark {
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 100px;
            font-weight: 900;
            color: rgba(34, 197, 94, 0.03);
            pointer-events: none;
            white-space: nowrap;
          }
          
          .page { 
            padding: 15px; 
            position: relative; 
            z-index: 1;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          /* Header Premium */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 12px;
            border-bottom: 3px solid #22c55e;
            margin-bottom: 15px;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-img {
            height: 40px;
            width: auto;
          }
          .header-text {}
          .header-title {
            font-size: 24px;
            font-weight: 900;
            color: #16a34a;
            letter-spacing: -0.5px;
          }
          .header-subtitle {
            font-size: 11px;
            color: #666;
            margin-top: 2px;
          }
          .header-right {
            text-align: right;
          }
          .header-date {
            font-size: 10px;
            color: #666;
            margin-bottom: 4px;
          }
          .header-user {
            font-size: 12px;
            font-weight: 600;
            color: #22c55e;
          }
          
          /* Meal Card */
          .meal-card {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 14px 18px;
            border-radius: 12px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
          }
          .meal-card.breakfast { background: linear-gradient(135deg, #f97316, #ea580c); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
          .meal-card.lunch { background: linear-gradient(135deg, #22c55e, #16a34a); }
          .meal-card.snack { background: linear-gradient(135deg, #06b6d4, #0891b2); box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3); }
          .meal-card.dinner { background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
          .meal-card.supper { background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
          
          .meal-left { display: flex; align-items: center; gap: 12px; }
          .meal-emoji { font-size: 32px; }
          .meal-type { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; }
          .meal-title { font-size: 18px; font-weight: 800; margin-top: 2px; }
          .meal-kcal { 
            text-align: right;
            background: rgba(255,255,255,0.25);
            padding: 8px 14px;
            border-radius: 10px;
          }
          .kcal-value { font-size: 22px; font-weight: 900; }
          .kcal-label { font-size: 9px; opacity: 0.9; text-transform: uppercase; }
          
          /* Macros Row */
          .macros {
            display: flex;
            gap: 10px;
            margin-bottom: 12px;
          }
          .macro {
            flex: 1;
            text-align: center;
            padding: 10px 8px;
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-radius: 10px;
            border: 1px solid #86efac;
          }
          .macro-emoji { font-size: 16px; }
          .macro-value { font-size: 16px; font-weight: 800; color: #16a34a; }
          .macro-label { font-size: 8px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          
          /* Two Column Layout */
          .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
            flex: 1;
          }
          
          .section {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
          }
          .section-head {
            background: #f8fafc;
            padding: 10px 12px;
            font-weight: 700;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .section-head-emoji { font-size: 14px; }
          .section-body { padding: 10px 12px; }
          
          /* Ingredients - Premium Style */
          .ing-section .section-body {
            background: linear-gradient(180deg, #f0fdf4 0%, white 100%);
          }
          .ing {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 6px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .ing:last-child { border-bottom: none; }
          .ing-num {
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 700;
            flex-shrink: 0;
          }
          .ing-text {
            font-size: 10px;
            color: #374151;
            line-height: 1.5;
          }
          
          /* Preparo - Premium Steps */
          .prep-section .section-body {
            background: linear-gradient(180deg, #fffbeb 0%, white 100%);
          }
          .step {
            display: flex;
            gap: 10px;
            padding: 7px 0;
            border-bottom: 1px solid #fde68a;
          }
          .step:last-child { border-bottom: none; }
          .step-num {
            width: 22px;
            height: 22px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            flex-shrink: 0;
          }
          .step-content { flex: 1; }
          .step-title {
            font-size: 10px;
            font-weight: 700;
            color: #92400e;
            margin-bottom: 3px;
          }
          .step-text {
            font-size: 10px;
            color: #374151;
            line-height: 1.5;
          }
          
          /* Tips Section */
          .tips-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 12px;
            border: 1px solid #fbbf24;
          }
          .tips-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            font-size: 12px;
            font-weight: 700;
            color: #92400e;
          }
          .tips-header-emoji { font-size: 16px; }
          .tip {
            font-size: 10px;
            color: #78350f;
            padding: 5px 0;
            border-bottom: 1px dashed #fbbf24;
            line-height: 1.5;
          }
          .tip:last-child { border-bottom: none; }
          
          /* Footer Premium */
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-radius: 10px;
            border: 2px solid #86efac;
            margin-top: auto;
          }
          .footer-left {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .footer-logo-img {
            height: 24px;
            width: auto;
          }
          .footer-brand {
            font-size: 14px;
            font-weight: 800;
            color: #16a34a;
          }
          .footer-right {
            text-align: right;
          }
          .footer-sofia {
            font-size: 10px;
            color: #22c55e;
            font-weight: 600;
          }
          .footer-user {
            font-size: 9px;
            color: #666;
          }
          .footer-slogan {
            font-size: 8px;
            color: #94a3b8;
            margin-top: 4px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="watermark">MAXNUTRITION</div>
        <div class="page">
          <!-- Header Premium com Logo -->
          <div class="header">
            <div class="header-left">
              <img src="${logoBase64}" alt="MaxNutrition" class="logo-img" />
              <div class="header-text">
                <div class="header-title">Seu Cardápio Personalizado</div>
                <div class="header-subtitle">Receita gerada pela Sofia Nutricional</div>
              </div>
            </div>
            <div class="header-right">
              <div class="header-date">📅 ${currentDate}</div>
              ${userName ? `<div class="header-user">👤 ${userName}</div>` : ''}
            </div>
          </div>
          
          <!-- Meal Card -->
          <div class="meal-card ${activeTab}">
            <div class="meal-left">
              <div class="meal-emoji">${cfg.emoji}</div>
              <div>
                <div class="meal-type">${cfg.label} • ${cfg.time}</div>
                <div class="meal-title">${meal.title || 'Refeição'}</div>
              </div>
            </div>
            <div class="meal-kcal">
              <div class="kcal-value">🔥 ${macros.calories}</div>
              <div class="kcal-label">calorias</div>
            </div>
          </div>
          
          <!-- Macros -->
          <div class="macros">
            <div class="macro">
              <div class="macro-emoji">💪</div>
              <div class="macro-value">${macros.protein}g</div>
              <div class="macro-label">Proteína</div>
            </div>
            <div class="macro">
              <div class="macro-emoji">⚡</div>
              <div class="macro-value">${macros.carbs}g</div>
              <div class="macro-label">Carboidrato</div>
            </div>
            <div class="macro">
              <div class="macro-emoji">🥑</div>
              <div class="macro-value">${macros.fat}g</div>
              <div class="macro-label">Gordura</div>
            </div>
            <div class="macro">
              <div class="macro-emoji">🥬</div>
              <div class="macro-value">${macros.fiber || 0}g</div>
              <div class="macro-label">Fibra</div>
            </div>
          </div>
          
          <!-- Content Grid -->
          <div class="content-grid">
            <div class="section ing-section">
              <div class="section-head">
                <span class="section-head-emoji">🥬</span>
                Ingredientes (${cleanIngredients.length})
              </div>
              <div class="section-body">
                ${ingredientsHTML || '<div class="ing">Ingredientes não disponíveis</div>'}
              </div>
            </div>
            
            <div class="section prep-section">
              <div class="section-head">
                <span class="section-head-emoji">👨‍🍳</span>
                Modo de Preparo
              </div>
              <div class="section-body">
                ${preparoSteps || '<div class="step"><div class="step-text">Instruções não disponíveis</div></div>'}
              </div>
            </div>
          </div>
          
          <!-- Tips Section -->
          <div class="tips-section">
            <div class="tips-header">
              <span class="tips-header-emoji">💡</span>
              Dicas da Sofia para esta refeição
            </div>
            ${tipsHTML}
          </div>
          
          <!-- Footer Premium -->
          <div class="footer">
            <div class="footer-left">
              <img src="${logoBase64}" alt="MaxNutrition" class="footer-logo-img" />
              <div class="footer-brand">MaxNutrition</div>
            </div>
            <div class="footer-right">
              <div class="footer-sofia">🤖 Sofia Nutricional</div>
              ${userName ? `<div class="footer-user">Preparado para: ${userName}</div>` : ''}
              <div class="footer-slogan">Sua jornada para uma vida mais saudável</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close(); };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg h-[85vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl overflow-hidden">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {/* Meal Tabs */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="flex-shrink-0 h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 flex justify-center gap-0.5 overflow-x-auto py-1 scrollbar-hide">
              {mealTypes.map((type) => (
                <MealTabButton
                  key={type}
                  type={type}
                  isActive={activeTab === type}
                  onClick={() => dayPlan.meals[type] && setActiveTab(type)}
                  hasMeal={!!dayPlan.meals[type]}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              disabled={currentIndex === availableMeals.length - 1}
              className="flex-shrink-0 h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Meal Content */}
          <AnimatePresence mode="wait">
            {currentMeal && (
              <MealContentCard 
                key={activeTab}
                meal={currentMeal} 
                type={activeTab} 
              />
            )}
          </AnimatePresence>
        </div>

        {/* Minimal Footer with print */}
        <div className="flex-shrink-0 py-2 px-3 border-t bg-muted/30 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            Sofia Nutricional
          </p>
          <Button variant="ghost" size="sm" onClick={handlePrint} className="h-7 px-2 text-xs gap-1">
            <Printer className="w-3 h-3" />
            PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
