import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  Trophy,
  Bot,
  ChevronRight,
  Scale,
  Plus
} from 'lucide-react';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { useUserGender } from '@/hooks/useUserGender';
import { useUserStreak } from '@/hooks/useUserStreak';
import { useUserXP } from '@/hooks/useUserXP';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import SimpleWeightForm from '@/components/weighing/SimpleWeightForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AvatarHeroCard } from './AvatarHeroCard';
import { EvolutionChartPremium } from './EvolutionChartPremium';
import { SofiaInsightsCard } from './SofiaInsightsCard';
import { FlashChallengeCard } from '@/components/gamification/FlashChallengeCard';

const DashboardOverview: React.FC = () => {
  const { measurements, stats, loading } = useWeightMeasurement();
  const { currentStreak } = useUserStreak();
  const { totalXP, level, levelTitle } = useUserXP();
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const { gender } = useUserGender(user);
  const [waistCircumference, setWaistCircumference] = useState<number>(0);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [targetWeight, setTargetWeight] = useState<number | undefined>();
  const [lastMeasurementDays, setLastMeasurementDays] = useState<number>(0);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  // Buscar dados de saúde do usuário
  useEffect(() => {
    const fetchHealthData = async () => {
      if (!user) return;
      
      // Buscar cintura do advanced_daily_tracking mais recente
      const { data: trackingData } = await supabase
        .from('advanced_daily_tracking')
        .select('waist_cm')
        .eq('user_id', user.id)
        .order('tracking_date', { ascending: false })
        .limit(1)
        .single();

      if (trackingData?.waist_cm) {
        setWaistCircumference(trackingData.waist_cm);
      }

      // Buscar altura e meta do perfil
      const { data: profileData } = await supabase
        .from('dados_físicos_do_usuário')
        .select('altura_cm')
        .eq('user_id', user.id)
        .single();

      if (profileData?.altura_cm) {
        setHeightCm(profileData.altura_cm);
      }

      // Buscar meta de peso
      const { data: goalData } = await supabase
        .from('user_goals')
        .select('target_value')
        .eq('user_id', user.id)
        .eq('goal_type', 'weight')
        .eq('status', 'active')
        .limit(1)
        .single();

      if (goalData?.target_value) {
        setTargetWeight(goalData.target_value);
      }
    };

    fetchHealthData();
  }, [user]);

  // Calculate days since last measurement
  useEffect(() => {
    if (measurements && measurements.length > 0) {
      const lastDate = new Date(measurements[0].measurement_date || measurements[0].created_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setLastMeasurementDays(diffDays);
    }
  }, [measurements]);

  // Calcular Health Score baseado nos dados
  useEffect(() => {
    let score = 50; // Base score
    
    // Peso: bonus se perdendo peso
    if (measurements && measurements.length >= 2) {
      const current = Number(measurements[0]?.peso_kg) || 0;
      const previous = Number(measurements[1]?.peso_kg) || 0;
      if (current < previous) score += 15;
      else if (current > previous + 1) score -= 10;
    }
    
    // Cintura: bonus se RCEst saudável
    if (waistCircumference && heightCm) {
      const ratio = waistCircumference / heightCm;
      if (ratio < 0.5) score += 25;
      else if (ratio < 0.55) score += 10;
      else if (ratio >= 0.6) score -= 15;
    }
    
    // Constância: bonus se tem medições recentes
    if (measurements && measurements.length >= 3) score += 10;
    
    // Streak bonus
    if (currentStreak >= 7) score += 10;
    else if (currentStreak >= 3) score += 5;
    
    setHealthScore(Math.max(0, Math.min(100, score)));
  }, [measurements, waistCircumference, heightCm, currentStreak]);

  const weightChange = () => {
    if (measurements && measurements.length >= 2) {
      const current = Number(measurements[0]?.peso_kg) || 0;
      const previous = Number(measurements[1]?.peso_kg) || 0;
      return current - previous;
    }
    return 0;
  };

  const currentWeight = stats?.currentWeight || (measurements?.[0]?.peso_kg ? Number(measurements[0].peso_kg) : 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-lg space-y-4 px-3 sm:px-4 pb-24 pt-3">
        
        {/* 1. HERO: Avatar com métricas principais */}
        <AvatarHeroCard
          gender={gender === 'feminino' ? 'female' : 'male'}
          currentWeight={typeof currentWeight === 'number' ? currentWeight : parseFloat(String(currentWeight)) || 0}
          targetWeight={targetWeight}
          weightChange={weightChange()}
          healthScore={healthScore}
          level={level}
          levelTitle={levelTitle}
          currentStreak={currentStreak}
        />

        {/* 2. SOFIA INSIGHTS: Dicas personalizadas da IA */}
        <SofiaInsightsCard
          healthScore={healthScore}
          weightChange={weightChange()}
          currentStreak={currentStreak}
          lastMeasurementDays={lastMeasurementDays}
        />

        {/* 3. EVOLUÇÃO: Gráfico premium */}
        <EvolutionChartPremium
          measurements={measurements || []}
          loading={loading}
          onViewFullHistory={() => navigate('/tracking')}
        />

        {/* 4. CTA: Registrar Peso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => setIsWeightModalOpen(true)}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 text-white font-semibold shadow-lg shadow-primary/30"
          >
            <Scale className="h-5 w-5 mr-2" />
            Registrar Peso
            <Plus className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>

        {/* 5. DESAFIO RELÂMPAGO */}
        <FlashChallengeCard />

        {/* 6. Acesso Rápido - Cards menores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          <QuickAccessButton
            icon={Bot}
            label="Sofia IA"
            gradient="from-violet-600 to-purple-700"
            onClick={() => navigate('/sofia')}
          />
          <QuickAccessButton
            icon={Utensils}
            label="Nutrição"
            gradient="from-emerald-500 to-teal-600"
            onClick={() => navigate('/nutricao')}
          />
          <QuickAccessButton
            icon={Trophy}
            label="Desafios"
            gradient="from-amber-500 to-orange-600"
            onClick={() => navigate('/goals')}
          />
        </motion.div>

        {/* Ver mais métricas */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate('/tracking')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-muted/50 border border-border/30 text-sm text-muted-foreground hover:bg-muted/70 transition-colors"
        >
          Ver histórico completo
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Weight Modal */}
      <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Peso</DialogTitle>
            <DialogDescription>
              Informe seu peso atual
            </DialogDescription>
          </DialogHeader>
          <SimpleWeightForm 
            onSubmit={() => setIsWeightModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Botão de Acesso Rápido Compacto
const QuickAccessButton: React.FC<{
  icon: React.ElementType;
  label: string;
  gradient: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, gradient, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg min-h-[80px]`}
  >
    <Icon className="h-5 w-5" />
    <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
  </motion.button>
);

export default DashboardOverview;
