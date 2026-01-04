import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Utensils, 
  Trophy,
  Bot
} from 'lucide-react';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { useUserGender } from '@/hooks/useUserGender';
import { useTrackingData } from '@/hooks/useTrackingData';
import { useHealthScore } from '@/hooks/useHealthScore';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BodyEvolutionChart } from './BodyEvolutionChart';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { User } from '@supabase/supabase-js';
import SimpleWeightForm from '@/components/weighing/SimpleWeightForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  PremiumHeroCard,
  PremiumHealthRing,
  PremiumWeeklyMini,
  PremiumQuickActions,
  PremiumFeatureCard,
  PremiumDailyStats
} from './PremiumDashboardCards';
import { QuickWaterModal, QuickSleepModal, QuickExerciseModal } from '@/components/tracking';
import { SofiaProactiveCard } from '@/components/sofia/SofiaProactiveCard';

const DashboardOverview: React.FC = () => {
  const { measurements, stats, loading } = useWeightMeasurement();
  const { trackingData } = useTrackingData();
  const [weightData, setWeightData] = useState<any[]>([]);
  const [exerciseData, setExerciseData] = useState<any[]>([]);
  const [waterData, setWaterData] = useState<any[]>([]);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const { gender } = useUserGender(user);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const loadWeeklyData = async () => {
      if (!user) return;
      try {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        const { data: exerciseWeekData } = await supabase
          .from('exercise_tracking')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', weekStartStr)
          .lte('date', todayStr);

        const { data: waterWeekData } = await supabase
          .from('water_tracking')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', weekStartStr)
          .lte('date', todayStr);

        setExerciseData(exerciseWeekData || []);
        setWaterData(waterWeekData || []);
      } catch (error) {
        console.error('Erro ao carregar dados semanais:', error);
      }
    };
    loadWeeklyData();
  }, [user]);

  useEffect(() => {
    if (measurements && measurements.length > 0) {
      const last7Days = measurements.slice(-7).map(m => ({
        date: format(new Date(m.measurement_date || m.created_at), 'dd/MM'),
        peso: Number(m.peso_kg) || 0,
        meta: 70
      }));
      setWeightData(last7Days);
    }
  }, [measurements]);

  const weightChange = () => {
    if (measurements && measurements.length >= 2) {
      const current = Number(measurements[0]?.peso_kg) || 0;
      const previous = Number(measurements[1]?.peso_kg) || 0;
      const change = current - previous;
      return change > 0 ? `+${change.toFixed(1)}kg` : `${change.toFixed(1)}kg`;
    }
    return "Primeiro registro";
  };

  const getWeeklyStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const exerciseDaysThisWeek = exerciseData.filter(e => 
      e.date >= weekStartStr && e.date <= today && e.duration_minutes > 0
    ).length;

    const totalExerciseMinutes = exerciseData
      .filter(e => e.date >= weekStartStr && e.date <= today)
      .reduce((total, e) => total + (e.duration_minutes || 0), 0);

    const todayWaterTotal = waterData
      .filter(w => w.date === today)
      .reduce((total, w) => total + (w.amount_ml || 0), 0);
    
    const hydrationProgress = Math.min(100, Math.round((todayWaterTotal / 2000) * 100));

    return {
      exerciseDays: exerciseDaysThisWeek,
      totalMinutes: totalExerciseMinutes,
      hydrationProgress,
      waterLiters: (todayWaterTotal / 1000).toFixed(1)
    };
  };

  const addExercise = async (duration: number, type: string = 'caminhada') => {
    if (!user) return;
    try {
      await supabase
        .from('exercise_tracking')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          exercise_type: type,
          duration_minutes: duration,
          source: 'manual'
        });

      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];

      const { data: exerciseWeekData } = await supabase
        .from('exercise_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .lte('date', todayStr);

      setExerciseData(exerciseWeekData || []);
    } catch (error) {
      console.error('Erro ao registrar exercício:', error);
    }
  };

  const weeklyStats = getWeeklyStats();
  const currentWeight = stats?.currentWeight || (measurements?.[0]?.peso_kg ? Number(measurements[0].peso_kg).toFixed(1) : '--');
  
  // Dados de sono do tracking
  const sleepHours = trackingData?.sleep?.lastNight?.hours || 0;
  const sleepQuality = trackingData?.sleep?.lastNight?.quality || 3;
  
  // Health Score dinâmico
  const healthScoreData = useHealthScore({
    waterTodayMl: Number(weeklyStats.waterLiters) * 1000,
    waterGoalMl: 2000,
    sleepHours: sleepHours,
    sleepQuality: sleepQuality,
    sleepGoalHours: 8,
    exerciseMinutesToday: weeklyStats.totalMinutes,
    exerciseGoalMinutes: 30,
    moodRating: trackingData?.mood?.today?.day_rating || 3,
    stressLevel: trackingData?.mood?.today?.stress_level || 3,
    currentStreak: 0, // TODO: calcular streak real
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-lg space-y-5 px-4 pb-28 pt-2">
        
        {/* Hero Card */}
        <PremiumHeroCard 
          weight={currentWeight}
          calories={1850}
          water={Number(weeklyStats.waterLiters) * 1000}
          sleep={sleepHours || undefined}
          weightChange={weightChange()}
        />

        {/* Health Score + Weekly Progress */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <PremiumHealthRing score={healthScoreData.score} label={healthScoreData.label} />
          </div>
          <div className="col-span-3">
            <PremiumWeeklyMini 
              exerciseDays={weeklyStats.exerciseDays}
              hydrationProgress={weeklyStats.hydrationProgress}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <PremiumQuickActions 
          onAddWeight={() => setIsWeightModalOpen(true)}
          onAddExercise={() => setIsExerciseModalOpen(true)}
          onAddWater={() => setIsWaterModalOpen(true)}
          onAddSleep={() => setIsSleepModalOpen(true)}
        />

        {/* Daily Stats */}
        <PremiumDailyStats 
          exerciseMinutes={weeklyStats.totalMinutes}
          waterLiters={Number(weeklyStats.waterLiters)}
          sleepHours={sleepHours || 0}
        />

        {/* Sofia Proactive Insights */}
        <SofiaProactiveCard />

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Acesso Rápido</h3>
          
          <PremiumFeatureCard
            icon={Bot}
            title="Sofia IA"
            subtitle="Sua assistente de saúde"
            gradient="from-violet-600 to-purple-700"
            shadowColor="shadow-violet-500/25"
            onClick={() => navigate('/sofia')}
          />
          
          <PremiumFeatureCard
            icon={Utensils}
            title="Nutrição"
            subtitle="Plano alimentar"
            gradient="from-emerald-500 to-teal-600"
            shadowColor="shadow-emerald-500/25"
            onClick={() => navigate('/nutricao')}
          />
          
          <PremiumFeatureCard
            icon={Trophy}
            title="Desafios"
            subtitle="Ganhe pontos"
            gradient="from-amber-500 to-orange-600"
            shadowColor="shadow-amber-500/25"
            onClick={() => navigate('/goals')}
          />
        </motion.div>

        {/* Body Evolution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ErrorBoundary 
            onError={(error) => console.warn('Erro no gráfico:', error.message)}
            fallback={
              <Card className="bg-card/80 backdrop-blur-md border border-border/40 shadow-lg rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="w-14 h-14 bg-muted/50 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                </CardContent>
              </Card>
            }
          >
            <Suspense fallback={
              <Card className="bg-card/80 backdrop-blur-md border border-border/40 shadow-lg rounded-2xl">
                <CardContent className="p-4 flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            }>
              <BodyEvolutionChart 
                weightData={weightData.length > 0 ? weightData.map((item) => ({
                  date: item.date,
                  time: '08:30',
                  value: item.peso,
                  type: 'peso' as const
                })) : [{ date: 'Hoje', time: '08:30', value: 70.0, type: 'peso' as const }]} 
                bodyCompositionData={{
                  gordura: measurements?.[0]?.gordura_corporal_percent || 25,
                  musculo: measurements?.[0]?.massa_muscular_kg || 30,
                  agua: measurements?.[0]?.agua_corporal_percent || 55,
                  osso: 15.0
                }} 
                userGender={gender} 
              />
            </Suspense>
          </ErrorBoundary>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-violet-500/5 p-4 text-center border border-primary/10"
        >
          <p className="text-sm italic text-muted-foreground">
            "Cada pequeno passo te aproxima do seu objetivo."
          </p>
        </motion.div>
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

      {/* Water Modal */}
      <QuickWaterModal 
        open={isWaterModalOpen} 
        onOpenChange={setIsWaterModalOpen} 
      />

      {/* Sleep Modal */}
      <QuickSleepModal 
        open={isSleepModalOpen} 
        onOpenChange={setIsSleepModalOpen} 
      />

      {/* Exercise Modal */}
      <QuickExerciseModal 
        open={isExerciseModalOpen} 
        onOpenChange={setIsExerciseModalOpen} 
      />
    </div>
  );
};

export default DashboardOverview;
