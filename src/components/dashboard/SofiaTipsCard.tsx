import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, AlertTriangle, ChevronRight, RefreshCw, Heart, Scale, Apple, Droplets, Moon, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserDataCache } from '@/hooks/useUserDataCache';
import { supabase } from '@/integrations/supabase/client';

interface HealthTip {
  id: string;
  category: 'nutrition' | 'weight' | 'hydration' | 'sleep' | 'exercise' | 'general';
  title: string;
  content: string;
  source?: string;
  icon: React.ElementType;
  priority: 'normal' | 'alert';
}

const categoryIcons = {
  nutrition: Apple,
  weight: Scale,
  hydration: Droplets,
  sleep: Moon,
  exercise: Activity,
  general: Heart,
};

const categoryColors = {
  nutrition: 'from-green-500 to-emerald-500',
  weight: 'from-orange-500 to-amber-500',
  hydration: 'from-blue-500 to-cyan-500',
  sleep: 'from-indigo-500 to-purple-500',
  exercise: 'from-red-500 to-pink-500',
  general: 'from-purple-500 to-pink-500',
};

// Dicas baseadas em evidências científicas
const baseTips: HealthTip[] = [
  {
    id: 'protein-satiety',
    category: 'nutrition',
    title: 'Proteína e Saciedade',
    content: 'Consumir 25-30g de proteína por refeição aumenta a saciedade em até 60% e pode reduzir o consumo calórico diário.',
    source: 'Journal of the Academy of Nutrition and Dietetics, 2015',
    icon: Apple,
    priority: 'normal',
  },
  {
    id: 'water-metabolism',
    category: 'hydration',
    title: 'Água e Metabolismo',
    content: 'Beber 500ml de água pode aumentar temporariamente o metabolismo em 24-30% por até 1 hora.',
    source: 'Journal of Clinical Endocrinology & Metabolism, 2003',
    icon: Droplets,
    priority: 'normal',
  },
  {
    id: 'sleep-weight',
    category: 'sleep',
    title: 'Sono e Controle de Peso',
    content: 'Dormir menos de 7 horas por noite aumenta em 41% o risco de obesidade. O sono regula hormônios da fome.',
    source: 'Obesity Reviews, 2017',
    icon: Moon,
    priority: 'normal',
  },
  {
    id: 'fiber-health',
    category: 'nutrition',
    title: 'Fibras para Saúde Intestinal',
    content: 'Consumir 25-30g de fibras por dia melhora a saúde intestinal e pode auxiliar na perda de peso.',
    source: 'The Lancet, 2019',
    icon: Apple,
    priority: 'normal',
  },
  {
    id: 'walking-benefits',
    category: 'exercise',
    title: 'Caminhada Diária',
    content: '30 minutos de caminhada por dia reduz risco cardiovascular em 35% e melhora o humor.',
    source: 'British Journal of Sports Medicine, 2020',
    icon: Activity,
    priority: 'normal',
  },
  {
    id: 'mindful-eating',
    category: 'nutrition',
    title: 'Comer com Atenção',
    content: 'Mastigar devagar e sem distrações pode reduzir a ingestão calórica em até 10% por refeição.',
    source: 'American Journal of Clinical Nutrition, 2014',
    icon: Apple,
    priority: 'normal',
  },
];

// Alertas específicos para sobrepeso/obesidade
const weightAlertTips: HealthTip[] = [
  {
    id: 'visceral-fat',
    category: 'weight',
    title: '⚠️ Gordura Visceral',
    content: 'A circunferência abdominal elevada está associada a maior risco de doenças cardíacas e diabetes tipo 2. Reduzir 5-10% do peso pode diminuir significativamente esse risco.',
    source: 'American Heart Association, 2021',
    icon: Scale,
    priority: 'alert',
  },
  {
    id: 'insulin-resistance',
    category: 'weight',
    title: '⚠️ Resistência à Insulina',
    content: 'O excesso de peso pode causar resistência à insulina. Exercícios de força e alimentação com baixo índice glicêmico ajudam a melhorar a sensibilidade.',
    source: 'Diabetes Care, 2020',
    icon: Scale,
    priority: 'alert',
  },
  {
    id: 'inflammation',
    category: 'weight',
    title: '⚠️ Inflamação Crônica',
    content: 'O tecido adiposo em excesso libera citocinas inflamatórias. Alimentos anti-inflamatórios como peixes, azeite e vegetais podem ajudar.',
    source: 'Nature Medicine, 2019',
    icon: Heart,
    priority: 'alert',
  },
  {
    id: 'metabolic-syndrome',
    category: 'weight',
    title: '⚠️ Síndrome Metabólica',
    content: 'IMC elevado combinado com circunferência abdominal alta aumenta risco de síndrome metabólica. Mudanças no estilo de vida são o tratamento primário.',
    source: 'Circulation, 2022',
    icon: Scale,
    priority: 'alert',
  },
];

export const SofiaTipsCard: React.FC = () => {
  const { data: userData } = useUserDataCache();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tips, setTips] = useState<HealthTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userBmi, setUserBmi] = useState<number | null>(null);
  const [isOverweight, setIsOverweight] = useState(false);

  useEffect(() => {
    const loadUserHealthData = async () => {
      setIsLoading(true);
      
      const user = userData.user;
      if (!user) {
        setTips(baseTips);
        setIsLoading(false);
        return;
      }

      try {
        // Buscar última medição de peso
        const { data: weightData } = await supabase
          .from('weight_measurements')
          .select('imc, risco_metabolico')
          .eq('user_id', user.id)
          .order('measurement_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        let personalized: HealthTip[] = [...baseTips];
        
        if (weightData) {
          const bmi = weightData.imc;
          setUserBmi(bmi);
          
          // Verificar se está acima do peso (IMC >= 25)
          if (bmi && bmi >= 25) {
            setIsOverweight(true);
            // Adicionar alertas específicos para sobrepeso
            personalized = [...weightAlertTips, ...baseTips];
          } else {
            setIsOverweight(false);
          }
        }
        
        // Embaralhar dicas mantendo alertas no topo
        const alerts = personalized.filter(t => t.priority === 'alert');
        const normal = personalized.filter(t => t.priority === 'normal');
        const shuffledNormal = normal.sort(() => Math.random() - 0.5);
        
        setTips([...alerts, ...shuffledNormal]);
      } catch (error) {
        console.error('Error loading health data:', error);
        setTips(baseTips);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserHealthData();
  }, [userData.user]);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const refreshTips = () => {
    const alerts = tips.filter(t => t.priority === 'alert');
    const normal = tips.filter(t => t.priority === 'normal').sort(() => Math.random() - 0.5);
    setTips([...alerts, ...normal]);
    setCurrentTipIndex(0);
  };

  if (isLoading || tips.length === 0) {
    return (
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-purple-200 dark:bg-purple-800 rounded w-1/3"></div>
          <div className="h-4 bg-purple-100 dark:bg-purple-900 rounded w-full"></div>
          <div className="h-4 bg-purple-100 dark:bg-purple-900 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  const currentTip = tips[currentTipIndex];
  const IconComponent = categoryIcons[currentTip.category];
  const gradientColor = categoryColors[currentTip.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`relative overflow-hidden ${
        currentTip.priority === 'alert' 
          ? 'border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30' 
          : 'border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30'
      } rounded-xl sm:rounded-2xl`}>
        {/* Header */}
        <div className="p-4 sm:p-5 pb-2 sm:pb-3">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradientColor} flex-shrink-0`}>
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-foreground truncate">Dr. Vital</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {isOverweight ? 'Dicas personalizadas para você' : 'Nutrição e bem-estar'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshTips}
              className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Alert Badge */}
          {isOverweight && currentTip.priority === 'alert' && (
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-lg w-fit">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">
                Alerta de Saúde
              </span>
            </div>
          )}
        </div>

        {/* Tip Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="px-4 sm:px-5 pb-4 sm:pb-5"
          >
            <div className="flex gap-3 sm:gap-4">
              <div className={`flex-shrink-0 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradientColor} shadow-sm`}>
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm sm:text-base text-foreground mb-1 sm:mb-1.5 leading-tight">
                  {currentTip.title}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2 sm:mb-3 line-clamp-3">
                  {currentTip.content}
                </p>
                {currentTip.source && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70 italic truncate">
                    📚 {currentTip.source}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {tips.slice(0, Math.min(5, tips.length)).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTipIndex(idx)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                  idx === currentTipIndex 
                    ? currentTip.priority === 'alert' ? 'bg-orange-500 w-4 sm:w-5' : 'bg-purple-500 w-4 sm:w-5'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
            {tips.length > 5 && (
              <span className="text-[10px] sm:text-xs text-muted-foreground ml-1.5">
                +{tips.length - 5}
              </span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextTip}
            className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-900"
          >
            Próxima dica
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-1.5" />
          </Button>
        </div>

        {/* BMI indicator for overweight users */}
        {isOverweight && userBmi && (
          <div className="mx-4 mb-4 p-3 rounded-xl bg-orange-100/50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                  Seu IMC: {userBmi.toFixed(1)}
                </span>
              </div>
              <span className="text-[10px] text-orange-600/80 dark:text-orange-400/80">
                {userBmi >= 30 ? 'Obesidade' : 'Sobrepeso'}
              </span>
            </div>
            <p className="text-[10px] text-orange-600/70 dark:text-orange-400/70 mt-1">
              Dicas personalizadas baseadas no seu perfil de saúde
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default SofiaTipsCard;
