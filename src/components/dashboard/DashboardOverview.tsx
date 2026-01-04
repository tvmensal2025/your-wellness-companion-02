import React, { useState, useEffect, Suspense } from 'react';
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
import { useTrackingData } from '@/hooks/useTrackingData';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { User } from '@supabase/supabase-js';
import SimpleWeightForm from '@/components/weighing/SimpleWeightForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { PremiumQuickActions } from './PremiumDashboardCards';
import { CompactGamificationBar } from './CompactGamificationBar';
import { VitalHealthCard } from './VitalHealthCard';
import { SofiaEmotionalBanner } from '@/components/sofia/SofiaEmotionalBanner';
import { FlashChallengeCard } from '@/components/gamification/FlashChallengeCard';

const DashboardOverview: React.FC = () => {
  const { measurements, stats, loading } = useWeightMeasurement();
  const { trackingData, refreshData: refreshTrackingData } = useTrackingData();
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const { gender } = useUserGender(user);
  const [waistCircumference, setWaistCircumference] = useState<number>(0);
  const [heightCm, setHeightCm] = useState<number>(170);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-lg space-y-3 px-4 pb-28 pt-2">
        
        {/* Sofia - Mensagem personalizada */}
        <SofiaEmotionalBanner />

        {/* Gamificação Compacta - Streak, Level, XP em uma linha */}
        <CompactGamificationBar />

        {/* MÉTRICAS VITAIS - Foco principal */}
        <VitalHealthCard 
          weight={currentWeight}
          weightChange={weightChange()}
          waistCircumference={waistCircumference}
          heightCm={heightCm}
        />

        {/* Ação Rápida - Registrar Peso */}
        <PremiumQuickActions 
          onAddWeight={() => setIsWeightModalOpen(true)}
        />

        {/* Desafio do Dia - Compacto */}
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
