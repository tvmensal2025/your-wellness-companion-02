import React, { useState, useEffect, Suspense } from 'react';
import { Calendar, MessageCircle, Bot, Utensils, Award, Target, Activity as ActivityIcon, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { useUserGender } from '@/hooks/useUserGender';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BodyEvolutionChart } from './BodyEvolutionChart';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import SimpleWeightForm from '@/components/weighing/SimpleWeightForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  PremiumMetricCard, 
  PremiumBodyMetricsCard, 
  PremiumWeeklyProgressCard,
  PremiumQuickActions 
} from './PremiumDashboardCards';
import { Scale, Activity, Droplets, Heart, Flame } from 'lucide-react';

const DashboardOverview: React.FC = () => {
  const {
    measurements,
    stats,
    loading
  } = useWeightMeasurement();
  const [weightData, setWeightData] = useState<any[]>([]);
  const [bodyComposition, setBodyComposition] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exerciseData, setExerciseData] = useState<any[]>([]);
  const [waterData, setWaterData] = useState<any[]>([]);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const { gender, loading: genderLoading } = useUserGender(user);

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
    const channel = supabase.channel('weight-measurements-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'weight_measurements'
    }, () => {
      console.log('Mudança detectada nas medições, atualizando dados...');
    }).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (measurements && measurements.length > 0) {
      const last7Days = measurements.slice(-7).map(m => ({
        date: format(new Date(m.measurement_date || m.created_at), 'dd/MM'),
        peso: Number(m.peso_kg) || 0,
        meta: 70
      }));
      setWeightData(last7Days);
    } else {
      setWeightData([]);
    }
  }, [measurements]);

  useEffect(() => {
    if (measurements && measurements.length > 0) {
      const latest = measurements[0];
      if (latest) {
        const composition = [{
          name: 'Massa Muscular',
          value: Number(latest.massa_muscular_kg) || 35,
          color: '#10B981'
        }, {
          name: 'Gordura',
          value: Number(latest.gordura_corporal_percent) || 20,
          color: '#F59E0B'
        }, {
          name: 'Água',
          value: Number(latest.agua_corporal_percent) || 45,
          color: '#3B82F6'
        }];
        setBodyComposition(composition);
      }
    } else {
      setBodyComposition([]);
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

  const getIMCClassification = (imc: number) => {
    if (!imc || isNaN(imc)) return "N/A";
    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidade";
  };

  const getWeeklyProgress = () => {
    if (!measurements || measurements.length === 0) {
      return {
        overallProgress: 0,
        weightChange: 0,
        exerciseDays: 0,
        hydrationProgress: 0,
        trend: 'neutral' as const,
        totalExerciseMinutes: 0
      };
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const currentWeight = Number(measurements[0]?.peso_kg) || 0;
    const weekAgoMeasurement = measurements.find(m => 
      new Date(m.measurement_date || m.created_at) <= weekAgo
    );
    const weekAgoWeight = Number(weekAgoMeasurement?.peso_kg) || currentWeight;
    const weightChange = currentWeight - weekAgoWeight;

    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const exerciseDaysThisWeek = exerciseData.filter(exercise => 
      exercise.date >= weekStartStr && exercise.date <= today && exercise.duration_minutes > 0
    ).length;

    const totalExerciseMinutes = exerciseData
      .filter(exercise => exercise.date >= weekStartStr && exercise.date <= today)
      .reduce((total, exercise) => total + (exercise.duration_minutes || 0), 0);

    const todayWaterTotal = waterData
      .filter(water => water.date === today)
      .reduce((total, water) => total + (water.amount_ml || 0), 0);
    
    const waterGoal = 2000;
    const hydrationProgress = Math.min(100, Math.round((todayWaterTotal / waterGoal) * 100));

    const weightProgress = weightChange <= 0 ? 80 : 40;
    const exerciseProgress = Math.min(100, (exerciseDaysThisWeek / 7) * 100);
    const overallProgress = Math.round((weightProgress + exerciseProgress + hydrationProgress) / 3);

    let trend: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (weightChange <= 0 && exerciseDaysThisWeek >= 4 && hydrationProgress >= 80) {
      trend = 'positive';
    } else if (weightChange > 1 || exerciseDaysThisWeek < 3) {
      trend = 'negative';
    }

    return {
      overallProgress,
      weightChange: parseFloat(weightChange.toFixed(1)),
      exerciseDays: exerciseDaysThisWeek,
      hydrationProgress,
      trend,
      totalExerciseMinutes
    };
  };

  const weeklyProgress = getWeeklyProgress();

  const addExercise = async (duration: number, type: string = 'caminhada') => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('exercise_tracking')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          exercise_type: type,
          duration_minutes: duration,
          source: 'manual'
        })
        .select()
        .single();

      if (error) throw error;
      setExerciseData(prev => [...prev, data]);
      
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

  const currentWeight = stats?.currentWeight || (measurements && measurements.length > 0 ? Number(measurements[0]?.peso_kg || 0).toFixed(1) : 'N/A');

  return (
    <div className="w-full space-y-4 p-3 md:p-4">
      {/* Header */}
      <div className="flex justify-end mb-2">
        <Button className="h-9 px-4 text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg">
          <Calendar className="w-4 h-4 mr-2" />
          Hoje
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <h3 className="text-sm font-medium text-red-800">Erro Detectado</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="mt-3 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg">
            Fechar
          </button>
        </div>
      )}

      {/* Premium Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <PremiumMetricCard
          title="Peso Atual"
          value={currentWeight}
          unit="kg"
          subtitle={weightChange()}
          icon={Scale}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          iconBg="bg-white/20"
          delay={0}
        />
        
        <PremiumBodyMetricsCard
          imc={stats?.currentIMC || 'N/A'}
          imcClass={stats?.currentIMC ? getIMCClassification(stats.currentIMC) : 'N/A'}
          muscleMass={stats?.muscleMass}
          metabolism={stats?.metabolism}
          fatPercentage={stats?.bodyFat}
          visceralFat={stats?.visceralFat}
          metabolicAge={stats?.metabolicAge}
          delay={0.1}
        />
      </div>

      {/* Weekly Progress Card */}
      <PremiumWeeklyProgressCard
        progress={weeklyProgress.overallProgress}
        exerciseDays={weeklyProgress.exerciseDays}
        hydrationProgress={weeklyProgress.hydrationProgress}
        weightChange={weeklyProgress.weightChange}
        totalExerciseMinutes={weeklyProgress.totalExerciseMinutes}
        delay={0.2}
      />

      {/* Quick Actions */}
      <PremiumQuickActions
        onAddWeight={() => setIsWeightModalOpen(true)}
        onAddExercise={() => addExercise(30, 'caminhada')}
        delay={0.3}
      />

      {/* Body Evolution Chart */}
      <div className="mt-4">
        <ErrorBoundary 
          onError={(error) => console.warn('Erro no personagem 3D:', error.message)}
          fallback={
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <p className="text-slate-400">Carregando visualização...</p>
                </div>
              </CardContent>
            </Card>
          }
        >
          <Suspense fallback={
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
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
                gordura: measurements[0]?.gordura_corporal_percent || 44.1,
                musculo: measurements[0]?.massa_muscular_kg || 24.0,
                agua: measurements[0]?.agua_corporal_percent || 39.9,
                osso: 15.0
              }} 
              userGender={gender} 
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <Card 
          className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => navigate('/sofia')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-semibold">Sofia Chat</span>
            </div>
            <p className="text-sm text-white/80">Converse com sua assistente IA</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs text-white/80">Online</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => navigate('/sofia-nutricional')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="font-semibold">Nutrição</span>
            </div>
            <p className="text-sm text-white/80">Planeje suas refeições</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs text-white/80">Disponível</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => navigate('/app/missions')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-semibold">Missões</span>
            </div>
            <p className="text-sm text-white/80">Complete e ganhe pontos</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs text-white/80">Nova missão</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goals - Compact */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-3 text-center">
            <Heart className="w-5 h-5 mx-auto mb-1 text-red-500" />
            <p className="text-lg font-bold text-foreground">45min</p>
            <p className="text-xs text-muted-foreground">Exercício</p>
            <Progress value={150} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-3 text-center">
            <Droplets className="w-5 h-5 mx-auto mb-1 text-cyan-500" />
            <p className="text-lg font-bold text-foreground">1.8L</p>
            <p className="text-xs text-muted-foreground">Água</p>
            <Progress value={90} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-3 text-center">
            <Timer className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-lg font-bold text-foreground">7.5h</p>
            <p className="text-xs text-muted-foreground">Sono</p>
            <Progress value={94} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Weight Modal */}
      <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar novo peso</DialogTitle>
            <DialogDescription>
              Informe seu peso atual para atualizar seus gráficos.
            </DialogDescription>
          </DialogHeader>
          <SimpleWeightForm
            onSubmit={async ({ weight, height, waist }) => {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                  toast({ title: 'Você precisa estar logado', variant: 'destructive' });
                  return;
                }

                const alturaM = height / 100;
                const imc = alturaM > 0 ? weight / (alturaM * alturaM) : undefined;

                const { error } = await supabase.from('weight_measurements').insert({
                  user_id: user.id,
                  peso_kg: weight,
                  circunferencia_abdominal_cm: waist,
                  measurement_date: new Date().toISOString(),
                  device_type: 'manual',
                  imc,
                });

                if (error) {
                  toast({ title: 'Erro ao registrar peso', variant: 'destructive' });
                  return;
                }

                toast({ title: 'Peso registrado com sucesso!' });
                setIsWeightModalOpen(false);
              } catch (error) {
                toast({ title: 'Erro inesperado', variant: 'destructive' });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardOverview;
