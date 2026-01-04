import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  Trophy,
  Bot,
  ChevronRight
} from 'lucide-react';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { useUserGender } from '@/hooks/useUserGender';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import SimpleWeightForm from '@/components/weighing/SimpleWeightForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PremiumQuickActions } from './PremiumDashboardCards';
import { CompactGamificationBar } from './CompactGamificationBar';
import { HealthScoreGauge } from './HealthScoreGauge';
import { PremiumVitalCards } from './PremiumVitalCards';
import { MiniHealthAlerts, useHealthAlerts } from './MiniHealthAlerts';
import { SofiaEmotionalBanner } from '@/components/sofia/SofiaEmotionalBanner';
import { FlashChallengeCard } from '@/components/gamification/FlashChallengeCard';
import { WeightEvolutionCard } from './WeightEvolutionCard';
const DashboardOverview: React.FC = () => {
  const { measurements, stats, loading } = useWeightMeasurement();
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const { gender } = useUserGender(user);
  const [waistCircumference, setWaistCircumference] = useState<number>(0);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightHistory, setWeightHistory] = useState<number[]>([]);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [previousHealthScore, setPreviousHealthScore] = useState<number | undefined>();

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

      // Buscar altura do perfil
      const { data: profileData } = await supabase
        .from('dados_físicos_do_usuário')
        .select('altura_cm')
        .eq('user_id', user.id)
        .single();

      if (profileData?.altura_cm) {
        setHeightCm(profileData.altura_cm);
      }
    };

    fetchHealthData();
  }, [user]);

  // Buscar histórico de peso para sparkline
  useEffect(() => {
    if (measurements && measurements.length > 0) {
      const history = measurements
        .slice(0, 10)
        .map(m => Number(m.peso_kg) || 0)
        .reverse();
      setWeightHistory(history);
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
    
    setHealthScore(Math.max(0, Math.min(100, score)));
  }, [measurements, waistCircumference, heightCm]);

  const weightChange = () => {
    if (measurements && measurements.length >= 2) {
      const current = Number(measurements[0]?.peso_kg) || 0;
      const previous = Number(measurements[1]?.peso_kg) || 0;
      const change = current - previous;
      return change > 0 ? `+${change.toFixed(1)}kg` : `${change.toFixed(1)}kg`;
    }
    return "Primeiro registro";
  };

  const currentWeight = stats?.currentWeight || (measurements?.[0]?.peso_kg ? Number(measurements[0].peso_kg).toFixed(1) : '--');
  const previousWeight = measurements?.[1]?.peso_kg ? Number(measurements[1].peso_kg) : undefined;

  // Health alerts
  const alerts = useHealthAlerts({
    weight: typeof currentWeight === 'number' ? currentWeight : parseFloat(String(currentWeight)) || undefined,
    previousWeight,
    waistCircumference,
    heightCm
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-lg space-y-4 px-4 pb-28 pt-2">
        
        {/* Sofia - Mensagem personalizada */}
        <SofiaEmotionalBanner />

        {/* Gamificação Compacta */}
        <CompactGamificationBar />

        {/* HEALTH SCORE GAUGE - Principal */}
        <HealthScoreGauge 
          score={healthScore}
          previousScore={previousHealthScore}
        />

        {/* ALERTAS DE SAÚDE */}
        <MiniHealthAlerts alerts={alerts} />

        {/* MÉTRICAS VITAIS PREMIUM */}
        <PremiumVitalCards 
          weight={currentWeight}
          weightChange={weightChange()}
          waistCircumference={waistCircumference}
          heightCm={heightCm}
          weightHistory={weightHistory}
        />

        {/* Ação Rápida - Registrar Peso */}
        <PremiumQuickActions 
          onAddWeight={() => setIsWeightModalOpen(true)}
        />

        {/* EVOLUÇÃO DO PESO - Gráfico e histórico com personagem 3D */}
        <WeightEvolutionCard 
          measurements={measurements || []}
          loading={loading}
          gender={gender === 'feminino' ? 'female' : 'male'}
        />
        <FlashChallengeCard />

        {/* Acesso Rápido - Cards menores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-2"
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
    className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
  >
    <Icon className="h-5 w-5" />
    <span className="text-[10px] font-medium">{label}</span>
  </motion.button>
);

export default DashboardOverview;
