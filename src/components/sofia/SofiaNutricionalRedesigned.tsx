import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coffee, UtensilsCrossed, Cookie, Moon, Flame, Target, TrendingUp, TrendingDown, Sparkles, Award, Calendar, ChevronRight, Zap, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { calculateTDEE, calculateNutritionalGoals, NutritionObjective, type PhysicalData } from '@/utils/macro-calculator';
import { WeeklyPlanCard } from '@/components/mealie/WeeklyPlanCard';

// ============================================
// TIPOS
// ============================================

interface MealData {
  id: string;
  meal_type: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  foods_detected: string[];
  created_at: string;
  confirmed_by_user: boolean;
}
interface UserGoals {
  objective: NutritionObjective;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

// ============================================
// CONSTANTES
// ============================================

// Função para normalizar meal_type (compatibilidade com dados antigos)
const normalizeMealType = (mealType: string): string => {
  const normalized = mealType?.toLowerCase().trim() || '';
  const mealTypeMap: Record<string, string> = {
    'breakfast': 'cafe_da_manha',
    'lunch': 'almoco',
    'dinner': 'jantar',
    'snack': 'lanche',
    'supper': 'ceia',
    'café da manhã': 'cafe_da_manha',
    'cafe da manha': 'cafe_da_manha',
    'café': 'cafe_da_manha',
    'cafe': 'cafe_da_manha',
    'almoço': 'almoco',
    'janta': 'jantar',
    'refeicao': 'almoco',
    'refeição': 'almoco'
  };
  return mealTypeMap[normalized] || normalized;
};
const MEAL_CONFIG = [{
  key: 'cafe_da_manha',
  label: 'Café',
  icon: Coffee,
  gradient: 'from-amber-400 to-orange-500',
  bgGlow: 'shadow-amber-500/20',
  emoji: '☕',
  time: '6h-10h'
}, {
  key: 'almoco',
  label: 'Almoço',
  icon: UtensilsCrossed,
  gradient: 'from-emerald-400 to-teal-500',
  bgGlow: 'shadow-emerald-500/20',
  emoji: '🍽️',
  time: '11h-14h'
}, {
  key: 'lanche',
  label: 'Lanche',
  icon: Cookie,
  gradient: 'from-purple-400 to-pink-500',
  bgGlow: 'shadow-purple-500/20',
  emoji: '🍎',
  time: '15h-17h'
}, {
  key: 'jantar',
  label: 'Jantar',
  icon: Moon,
  gradient: 'from-blue-400 to-indigo-500',
  bgGlow: 'shadow-blue-500/20',
  emoji: '🌙',
  time: '18h-21h'
}];

// Emojis inteligentes para alimentos
const getFoodEmoji = (food: string) => {
  const f = food.toLowerCase();
  if (f.includes('arroz')) return '🍚';
  if (f.includes('feijão') || f.includes('feijao')) return '🫘';
  if (f.includes('frango')) return '🍗';
  if (f.includes('carne') || f.includes('bife')) return '🥩';
  if (f.includes('salada') || f.includes('alface')) return '🥗';
  if (f.includes('ovo')) return '🥚';
  if (f.includes('pão') || f.includes('pao')) return '🍞';
  if (f.includes('banana')) return '🍌';
  if (f.includes('maçã') || f.includes('maca')) return '🍎';
  if (f.includes('café') || f.includes('cafe')) return '☕';
  if (f.includes('leite')) return '🥛';
  if (f.includes('queijo')) return '🧀';
  if (f.includes('peixe') || f.includes('salmão')) return '🐟';
  if (f.includes('massa') || f.includes('macarrão')) return '🍝';
  if (f.includes('batata')) return '🥔';
  if (f.includes('abacate')) return '🥑';
  if (f.includes('iogurte')) return '🥛';
  return '🍽️';
};

// ============================================
// COMPONENTE: Hero Card com Calorias Circular
// ============================================

interface HeroCaloriesProps {
  consumed: number;
  target: number;
  objective: NutritionObjective;
  streak: number;
  mealsLogged: number;
}
const HeroCaloriesCard: React.FC<HeroCaloriesProps> = ({
  consumed,
  target,
  objective,
  streak,
  mealsLogged
}) => {
  const percentage = Math.min(consumed / target * 100, 100);
  const remaining = target - consumed;
  const isOverTarget = consumed > target;
  const circumference = 2 * Math.PI * 85;
  const strokeDashoffset = circumference - percentage / 100 * circumference;
  const getObjectiveInfo = () => {
    switch (objective) {
      case NutritionObjective.LOSE:
        return {
          label: 'Emagrecendo',
          color: 'text-blue-400',
          icon: TrendingDown
        };
      case NutritionObjective.GAIN:
        return {
          label: 'Ganhando',
          color: 'text-green-400',
          icon: TrendingUp
        };
      case NutritionObjective.LEAN_MASS:
        return {
          label: 'Definindo',
          color: 'text-purple-400',
          icon: Zap
        };
      default:
        return {
          label: 'Mantendo',
          color: 'text-emerald-400',
          icon: Target
        };
    }
  };
  const objInfo = getObjectiveInfo();
  const ObjIcon = objInfo.icon;
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="relative flex items-center justify-between">
        {/* Circular Progress */}
        <div className="relative">
          <svg width="190" height="190" className="transform -rotate-90">
            {/* Background circle */}
            <circle cx="95" cy="95" r="85" stroke="currentColor" strokeWidth="12" fill="none" className="text-slate-700/50" />
            {/* Progress circle */}
            <motion.circle cx="95" cy="95" r="85" stroke="url(#calorieGradient)" strokeWidth="12" fill="none" strokeLinecap="round" initial={{
            strokeDashoffset: circumference
          }} animate={{
            strokeDashoffset
          }} transition={{
            duration: 1.5,
            ease: "easeOut"
          }} style={{
            strokeDasharray: circumference
          }} />
            <defs>
              <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isOverTarget ? "#ef4444" : "#10b981"} />
                <stop offset="100%" stopColor={isOverTarget ? "#f97316" : "#06b6d4"} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className={cn("font-bold text-5xl", isOverTarget ? "text-red-400" : "text-white")} initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            delay: 0.5,
            type: "spring"
          }}>
              {consumed.toFixed(0)}
            </motion.span>
            <span className="text-slate-400 text-xl">de {target} kcal</span>
            <div className={cn("mt-1 px-2 py-0.5 rounded-full text-xs font-medium", isOverTarget ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
              {isOverTarget ? `+${Math.abs(remaining).toFixed(0)}` : remaining.toFixed(0)} restam
            </div>
          </div>
        </div>

        {/* Stats lado direito */}
        <div className="flex flex-col gap-3">
          {/* Objetivo */}
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-2">
            <ObjIcon className={cn("w-4 h-4", objInfo.color)} />
            <span className="text-xs text-slate-300">{objInfo.label}</span>
          </div>
          
          {/* Streak */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl px-3 py-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-orange-300 font-medium">{streak} dias</span>
          </div>
          
          {/* Refeições */}
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300">{mealsLogged}/4 refeições</span>
          </div>
        </div>
      </div>
    </motion.div>;
};

// ============================================
// COMPONENTE: Macro Pills (Compacto e Bonito)
// ============================================

interface MacroPillsProps {
  protein: {
    current: number;
    target: number;
  };
  carbs: {
    current: number;
    target: number;
  };
  fat: {
    current: number;
    target: number;
  };
}
const MacroPills: React.FC<MacroPillsProps> = ({
  protein,
  carbs,
  fat
}) => {
  const macros = [{
    label: 'Proteína',
    current: protein.current,
    target: protein.target,
    color: 'from-orange-400 to-red-500',
    bg: 'bg-orange-500/10'
  }, {
    label: 'Carbos',
    current: carbs.current,
    target: carbs.target,
    color: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-500/10'
  }, {
    label: 'Gorduras',
    current: fat.current,
    target: fat.target,
    color: 'from-yellow-400 to-amber-500',
    bg: 'bg-yellow-500/10'
  }];
  return <div className="grid grid-cols-3 gap-2">
      {macros.map(macro => {
      const pct = Math.min(macro.current / macro.target * 100, 100);
      return <motion.div key={macro.label} initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} className={cn("rounded-2xl p-3", macro.bg)}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{macro.label}</span>
              <span className="text-xs font-bold">{pct.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div className={cn("h-full rounded-full bg-gradient-to-r", macro.color)} initial={{
            width: 0
          }} animate={{
            width: `${pct}%`
          }} transition={{
            duration: 1,
            delay: 0.3
          }} />
            </div>
            <p className="text-xs font-semibold mt-1.5">
              {macro.current.toFixed(0)}<span className="text-muted-foreground font-normal">/{macro.target}g</span>
            </p>
          </motion.div>;
    })}
    </div>;
};

// ============================================
// COMPONENTE: Timeline de Refeições (Estilo Stories)
// ============================================

interface MealTimelineProps {
  meals: MealData[];
  onMealClick: (meal: MealData) => void;
}
const MealTimeline: React.FC<MealTimelineProps> = ({
  meals,
  onMealClick
}) => {
  const getMealByType = (type: string) => meals.find(m => normalizeMealType(m.meal_type) === type);
  return <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {MEAL_CONFIG.map((config, idx) => {
      const meal = getMealByType(config.key);
      const isLogged = !!meal;
      const Icon = config.icon;
      return <motion.div key={config.key} initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: idx * 0.1
      }} onClick={() => meal && onMealClick(meal)} className={cn("flex-shrink-0 w-20 cursor-pointer transition-transform hover:scale-105", !isLogged && "opacity-60")}>
            {/* Circle com gradiente ou vazio */}
            <div className={cn("relative w-20 h-20 rounded-full p-1 mx-auto", isLogged ? `bg-gradient-to-br ${config.gradient} shadow-lg ${config.bgGlow}` : "bg-gradient-to-br from-slate-700 to-slate-800")}>
              <div className={cn("w-full h-full rounded-full flex items-center justify-center", isLogged ? "bg-slate-900" : "bg-slate-800/80")}>
                {isLogged ? <span className="text-3xl">{config.emoji}</span> : <Icon className="w-6 h-6 text-slate-500" />}
              </div>
              
              {/* Badge de check */}
              {isLogged && <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-3.5 h-3.5 text-white" />
                </motion.div>}
            </div>
            
            {/* Label */}
            <p className={cn("text-xs text-center mt-2 font-medium", isLogged ? "text-foreground" : "text-muted-foreground")}>
              {config.label}
            </p>
            
            {/* Calorias ou horário */}
            <p className="text-[10px] text-center text-muted-foreground">
              {isLogged ? `${meal.calories} kcal` : config.time}
            </p>
          </motion.div>;
    })}
    </div>;
};

// ============================================
// COMPONENTE: Card de Refeição Expandido (Modal-like)
// ============================================

interface MealDetailCardProps {
  meal: MealData | null;
  config: typeof MEAL_CONFIG[0] | null;
  onClose: () => void;
}
const MealDetailCard: React.FC<MealDetailCardProps> = ({
  meal,
  config,
  onClose
}) => {
  if (!meal || !config) return null;
  const foodsWithEmoji = meal.foods_detected.map((food, idx) => ({
    name: food,
    emoji: getFoodEmoji(food),
    index: idx + 1,
    estimatedCal: Math.round(meal.calories / meal.foods_detected.length)
  }));
  return <AnimatePresence>
      {/* Overlay que cobre a tela */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
      
      {/* Card centralizado no topo da tela */}
      <motion.div initial={{
      opacity: 0,
      y: -50,
      scale: 0.95
    }} animate={{
      opacity: 1,
      y: 0,
      scale: 1
    }} exit={{
      opacity: 0,
      y: -50,
      scale: 0.95
    }} className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
        <Card className={cn("overflow-hidden border-0 shadow-xl", `bg-gradient-to-br ${config.gradient}`)}>
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{config.emoji}</span>
                <div>
                  <h3 className="font-bold text-white text-lg">{config.label}</h3>
                  <p className="text-white/70 text-sm">
                    {new Date(meal.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{meal.calories}</p>
                <p className="text-white/70 text-sm">kcal</p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="bg-card rounded-t-3xl p-4 space-y-4">
              {/* Lista de alimentos */}
              <div>
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Sofia detectou {meal.foods_detected.length} alimentos
                </p>
                <div className="space-y-2">
                  {foodsWithEmoji.map(item => <motion.div key={item.index} initial={{
                  opacity: 0,
                  x: -10
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  delay: item.index * 0.05
                }} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                          {item.index}
                        </span>
                        <span className="text-xl">{item.emoji}</span>
                        <span className="text-sm font-medium capitalize">{item.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">~{item.estimatedCal} kcal</span>
                    </motion.div>)}
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                <div className="text-center p-2 rounded-xl bg-orange-500/10">
                  <p className="text-lg font-bold text-orange-500">{meal.protein_g}g</p>
                  <p className="text-[10px] text-muted-foreground">Proteína</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-blue-500/10">
                  <p className="text-lg font-bold text-blue-500">{meal.carbs_g}g</p>
                  <p className="text-[10px] text-muted-foreground">Carbos</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-yellow-500/10">
                  <p className="text-lg font-bold text-yellow-500">{meal.fat_g}g</p>
                  <p className="text-[10px] text-muted-foreground">Gorduras</p>
                </div>
              </div>

              {/* Botão fechar */}
              <button onClick={onClose} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Fechar detalhes
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>;
};

// ============================================
// COMPONENTE: Dica da Sofia (Sutil)
// ============================================

const SofiaTip: React.FC<{
  mealsLogged: number;
}> = ({
  mealsLogged
}) => {
  const getMessage = () => {
    const hour = new Date().getHours();
    if (mealsLogged === 0) {
      if (hour < 10) return {
        text: "Bom dia! Me manda uma foto do café ☕",
        emoji: "👋"
      };
      if (hour < 14) return {
        text: "Hora do almoço! Registra pra mim? 🍽️",
        emoji: "😊"
      };
      return {
        text: "Como foi a alimentação hoje?",
        emoji: "🤔"
      };
    }
    if (mealsLogged === 4) {
      return {
        text: "Dia completo! Você arrasou! 🎉",
        emoji: "🏆"
      };
    }
    const pending = 4 - mealsLogged;
    if (pending === 1) return {
      text: "Falta só mais uma refeição!",
      emoji: "💪"
    };
    return {
      text: `Faltam ${pending} refeições hoje`,
      emoji: "📸"
    };
  };
  const tip = getMessage();
  return <motion.div initial={{
    opacity: 0,
    y: -10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-lg shadow-lg">
        {tip.emoji}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{tip.text}</p>
        <p className="text-[10px] text-muted-foreground text-center">
          Envie fotos pelo WhatsApp • Sofia analisa automaticamente
        </p>
      </div>
    </motion.div>;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface SofiaNutricionalRedesignedProps {
  userId?: string;
}
export const SofiaNutricionalRedesigned: React.FC<SofiaNutricionalRedesignedProps> = ({
  userId
}) => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [physicalData, setPhysicalData] = useState<PhysicalData | null>(null);
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [streak, setStreak] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null);

  // Carregar dados
  useEffect(() => {
    if (userId) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [userId]);
  const loadAllData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await Promise.all([loadPhysicalData(), loadTodayMeals(), loadStreak()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadPhysicalData = async () => {
    if (!userId) return;
    const {
      data: physical
    } = await supabase.from('user_physical_data').select('*').eq('user_id', userId).maybeSingle();
    const {
      data: weightData
    } = await supabase.from('weight_measurements').select('weight_kg').eq('user_id', userId).order('measurement_date', {
      ascending: false
    }).limit(1);
    const peso = (weightData as any)?.[0]?.weight_kg || (physical as any)?.peso_atual_kg || 70;
    if (physical) {
      const data: PhysicalData = {
        peso_kg: peso,
        altura_cm: physical.altura_cm,
        idade: physical.idade,
        sexo: physical.sexo,
        nivel_atividade: physical.nivel_atividade
      };
      setPhysicalData(data);
      const {
        data: goalsData
      } = await (supabase as any).from('nutritional_goals').select('*').eq('user_id', userId).eq('status', 'active').maybeSingle();
      const objective = (goalsData as any)?.objective as NutritionObjective || NutritionObjective.MAINTAIN;
      const calculatedGoals = calculateNutritionalGoals(objective, data);
      setUserGoals({
        objective,
        target_calories: (goalsData as any)?.target_calories || calculatedGoals.calories,
        target_protein: (goalsData as any)?.target_protein_g || calculatedGoals.protein,
        target_carbs: (goalsData as any)?.target_carbs_g || calculatedGoals.carbs,
        target_fat: (goalsData as any)?.target_fats_g || calculatedGoals.fat
      });
    } else {
      // Valores padrão se não tiver dados físicos
      setUserGoals({
        objective: NutritionObjective.MAINTAIN,
        target_calories: 2000,
        target_protein: 150,
        target_carbs: 250,
        target_fat: 65
      });
    }
  };
  const loadTodayMeals = async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const {
      data
    } = await supabase.from('sofia_food_analysis').select('*').eq('user_id', userId).gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`).order('created_at', {
      ascending: true
    });
    if (data) {
      const formattedMeals: MealData[] = data.map((item: any) => {
        // ✅ FORMATO CORRETO: Dados estão diretamente na tabela, não em analysis_result
        
        // Extrair lista de alimentos de foods_detected (array de objetos)
        let foodsList: string[] = [];
        if (Array.isArray(item.foods_detected)) {
          foodsList = item.foods_detected.map((f: any) => 
            typeof f === 'string' ? f : f.nome || f.name || f.food || 'Alimento'
          );
        }
        
        return {
          id: item.id,
          meal_type: item.meal_type || 'outro',
          calories: item.total_calories || 0,
          protein_g: item.total_protein || 0,
          carbs_g: item.total_carbs || 0,
          fat_g: item.total_fat || 0,
          foods_detected: foodsList.length > 0 ? foodsList : ['Alimento'],
          created_at: item.created_at,
          confirmed_by_user: item.confirmed_by_user || false
        };
      });
      
      setMeals(formattedMeals);
    }
  };
  const loadStreak = async () => {
    if (!userId) return;
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const {
        data
      } = await supabase.from('sofia_food_analysis').select('id').eq('user_id', userId).gte('created_at', `${dateStr}T00:00:00`).lte('created_at', `${dateStr}T23:59:59`).limit(1);
      if (data && data.length > 0) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    setStreak(currentStreak);
  };

  // Cálculos derivados
  const dailyStats = useMemo(() => {
    return {
      calories: meals.reduce((sum, m) => sum + m.calories, 0),
      protein: meals.reduce((sum, m) => sum + m.protein_g, 0),
      carbs: meals.reduce((sum, m) => sum + m.carbs_g, 0),
      fat: meals.reduce((sum, m) => sum + m.fat_g, 0),
      mealsLogged: meals.length
    };
  }, [meals]);
  const selectedMealConfig = selectedMeal ? MEAL_CONFIG.find(c => c.key === normalizeMealType(selectedMeal.meal_type)) : null;

  // Loading state
  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <motion.div animate={{
          rotate: 360
        }} transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }} className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>;
  }

  // Sem userId
  if (!userId) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="text-5xl">👩‍⚕️</div>
          <p className="text-sm text-muted-foreground">Faça login para ver seus dados</p>
        </div>
      </div>;
  }
  return <div className="space-y-4 pb-4">
      {/* Dica da Sofia */}
      <SofiaTip mealsLogged={dailyStats.mealsLogged} />

      {/* Card Semanal - NOVO! */}
      <WeeklyPlanCard userId={userId} />

      {/* Hero Card com Calorias */}
      <HeroCaloriesCard consumed={dailyStats.calories} target={userGoals?.target_calories || 2000} objective={userGoals?.objective || NutritionObjective.MAINTAIN} streak={streak} mealsLogged={dailyStats.mealsLogged} />

      {/* Macro Pills */}
      <MacroPills protein={{
      current: dailyStats.protein,
      target: userGoals?.target_protein || 150
    }} carbs={{
      current: dailyStats.carbs,
      target: userGoals?.target_carbs || 250
    }} fat={{
      current: dailyStats.fat,
      target: userGoals?.target_fat || 65
    }} />

      {/* Timeline de Refeições (Estilo Stories) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Refeições de Hoje
          </h3>
          <span className="text-xs text-muted-foreground">
            Toque para ver detalhes
          </span>
        </div>
        <MealTimeline meals={meals} onMealClick={meal => setSelectedMeal(selectedMeal?.id === meal.id ? null : meal)} />
        
        {/* Card de Detalhe da Refeição Selecionada - Logo abaixo da timeline */}
        {selectedMeal && <MealDetailCard meal={selectedMeal} config={selectedMealConfig} onClose={() => setSelectedMeal(null)} />}
      </div>

      {/* Card Semanal Interativo - NOVO! */}
      <WeeklyPlanCard userId={userId} />
    </div>;
};
export default SofiaNutricionalRedesigned;