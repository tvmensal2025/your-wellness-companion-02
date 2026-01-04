import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Activity, 
  Brain, 
  FileText, 
  RefreshCw,
  Calendar,
  Heart,
  Moon,
  Flame,
  TrendingUp,
  Footprints,
  Timer,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Premium Components
import { PremiumHealthScore } from '@/components/google-fit/PremiumHealthScore';
import { PremiumMetricCard } from '@/components/google-fit/PremiumMetricCard';
import { PremiumGaugeChart } from '@/components/google-fit/PremiumGaugeChart';
import { PremiumActivityChart } from '@/components/google-fit/PremiumActivityChart';
import { AIHealthAnalysis } from '@/components/google-fit/AIHealthAnalysis';
import { HealthReportExport } from '@/components/google-fit/HealthReportExport';

interface GoogleFitData {
  date: string;
  steps: number;
  calories: number;
  distance_meters: number;
  heart_rate_avg: number;
  active_minutes: number;
  sleep_hours: number;
}

export const GoogleFitPremiumDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [data, setData] = useState<GoogleFitData[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');

  // Carregar dados do Google Fit
  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Buscar nome do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      // Calcular datas baseado no período
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      // Buscar dados do Google Fit
      const { data: fitData, error } = await supabase
        .from('google_fit_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      if (fitData && fitData.length > 0) {
        setData(fitData as GoogleFitData[]);
      } else {
        // Gerar dados de demonstração se não houver dados reais
        setData(generateDemoData(period));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setData(generateDemoData(period));
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar dados de demonstração
  const generateDemoData = (period: 'day' | 'week' | 'month'): GoogleFitData[] => {
    const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const result: GoogleFitData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      result.push({
        date: date.toISOString().split('T')[0],
        steps: Math.floor(5000 + Math.random() * 10000),
        calories: Math.floor(200 + Math.random() * 400),
        distance_meters: Math.floor(3000 + Math.random() * 8000),
        heart_rate_avg: Math.floor(60 + Math.random() * 30),
        active_minutes: Math.floor(20 + Math.random() * 60),
        sleep_hours: 5 + Math.random() * 4
      });
    }
    
    return result;
  };

  // Sincronizar dados
  const syncData = async () => {
    setIsSyncing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        toast({
          title: "Faça login",
          description: "Você precisa estar logado para sincronizar",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-fit-sync', {
        body: { action: 'sync' },
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (error) throw error;

      toast({
        title: "✅ Sincronizado!",
        description: "Dados atualizados com sucesso"
      });

      loadData();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast({
        title: "Erro ao sincronizar",
        description: "Usando dados de demonstração",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  // Calcular métricas agregadas
  const aggregatedMetrics = {
    steps: data.reduce((sum, d) => sum + (d.steps || 0), 0),
    calories: data.reduce((sum, d) => sum + (d.calories || 0), 0),
    activeMinutes: data.reduce((sum, d) => sum + (d.active_minutes || 0), 0),
    sleepHours: data.length > 0 ? data.reduce((sum, d) => sum + (d.sleep_hours || 0), 0) / data.length : 0,
    heartRateAvg: data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.heart_rate_avg || 0), 0) / data.length) : 0,
    distance: data.reduce((sum, d) => sum + (d.distance_meters || 0), 0)
  };

  // Calcular score de saúde
  const calculateHealthScore = () => {
    let score = 50;
    
    // Passos (meta: 10000/dia)
    const avgSteps = aggregatedMetrics.steps / Math.max(data.length, 1);
    score += Math.min(20, (avgSteps / 10000) * 20);
    
    // Sono (meta: 7-8h)
    if (aggregatedMetrics.sleepHours >= 7 && aggregatedMetrics.sleepHours <= 9) {
      score += 15;
    } else if (aggregatedMetrics.sleepHours >= 6) {
      score += 10;
    }
    
    // Minutos ativos (meta: 30min/dia)
    const avgActive = aggregatedMetrics.activeMinutes / Math.max(data.length, 1);
    score += Math.min(15, (avgActive / 30) * 15);
    
    return Math.min(100, Math.round(score));
  };

  // Dados para gráficos
  const chartData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
    value: d.steps,
    date: d.date
  }));

  const caloriesChartData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
    value: d.calories
  }));

  const sleepChartData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
    value: parseFloat((d.sleep_hours || 0).toFixed(1))
  }));

  const healthScore = calculateHealthScore();

  // Metas baseadas no período
  const goals = {
    steps: period === 'day' ? 10000 : period === 'week' ? 70000 : 300000,
    calories: period === 'day' ? 500 : period === 'week' ? 3500 : 15000,
    activeMinutes: period === 'day' ? 30 : period === 'week' ? 150 : 600,
    sleep: 7.5
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Google Fit Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Análise premium de saúde e atividade física
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={syncData}
                disabled={isSyncing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Period selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Período de análise</span>
          </div>
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p === 'day' ? 'Hoje' : p === 'week' ? '7 dias' : '30 dias'}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Main dashboard tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="w-4 h-4" />
              Análise IA
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-2">
              <FileText className="w-4 h-4" />
              Relatório
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Health Score + Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PremiumHealthScore
                  score={healthScore}
                  previousScore={healthScore - 5}
                  label="Score de Saúde"
                />
              </div>

              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <PremiumMetricCard
                  title="Passos"
                  value={aggregatedMetrics.steps}
                  unit="passos"
                  goal={goals.steps}
                  previousValue={aggregatedMetrics.steps * 0.9}
                  icon={Footprints}
                  color="hsl(142, 76%, 36%)"
                  gradient="from-green-500 to-emerald-600"
                  delay={0.1}
                />
                <PremiumMetricCard
                  title="Calorias"
                  value={aggregatedMetrics.calories}
                  unit="kcal"
                  goal={goals.calories}
                  previousValue={aggregatedMetrics.calories * 0.85}
                  icon={Flame}
                  color="hsl(25, 95%, 53%)"
                  gradient="from-orange-500 to-red-500"
                  delay={0.2}
                />
                <PremiumMetricCard
                  title="Min. Ativos"
                  value={aggregatedMetrics.activeMinutes}
                  unit="min"
                  goal={goals.activeMinutes}
                  previousValue={aggregatedMetrics.activeMinutes * 0.95}
                  icon={Timer}
                  color="hsl(199, 89%, 48%)"
                  gradient="from-blue-500 to-cyan-500"
                  delay={0.3}
                />
                <PremiumMetricCard
                  title="Sono Médio"
                  value={parseFloat(aggregatedMetrics.sleepHours.toFixed(1))}
                  unit="horas"
                  goal={goals.sleep}
                  previousValue={aggregatedMetrics.sleepHours * 0.9}
                  icon={Moon}
                  color="hsl(262, 83%, 58%)"
                  gradient="from-purple-500 to-violet-600"
                  delay={0.4}
                />
              </div>
            </div>

            {/* Gauge Charts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PremiumGaugeChart
                title="Passos Hoje"
                value={data[data.length - 1]?.steps || 0}
                maxValue={15000}
                unit="passos"
                icon={Footprints}
                colors={{
                  primary: '#22c55e',
                  secondary: '#16a34a',
                  background: 'hsl(var(--muted))'
                }}
              />
              <PremiumGaugeChart
                title="Calorias Ativas"
                value={data[data.length - 1]?.calories || 0}
                maxValue={800}
                unit="kcal"
                icon={Flame}
                colors={{
                  primary: '#f97316',
                  secondary: '#ea580c',
                  background: 'hsl(var(--muted))'
                }}
              />
              <PremiumGaugeChart
                title="FC Média"
                value={aggregatedMetrics.heartRateAvg}
                maxValue={120}
                unit="BPM"
                icon={Heart}
                colors={{
                  primary: '#ef4444',
                  secondary: '#dc2626',
                  background: 'hsl(var(--muted))'
                }}
                zones={{ low: 50, medium: 80, high: 100 }}
              />
              <PremiumGaugeChart
                title="Sono"
                value={parseFloat((data[data.length - 1]?.sleep_hours || 0).toFixed(1))}
                maxValue={10}
                unit="horas"
                icon={Moon}
                colors={{
                  primary: '#8b5cf6',
                  secondary: '#7c3aed',
                  background: 'hsl(var(--muted))'
                }}
                zones={{ low: 40, medium: 70, high: 100 }}
              />
            </div>

            {/* Activity Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PremiumActivityChart
                title="Evolução de Passos"
                data={chartData}
                icon={TrendingUp}
                type="area"
                color="#22c55e"
                gradientId="stepsGradient"
                unit="passos"
                height={220}
              />
              <PremiumActivityChart
                title="Calorias Queimadas"
                data={caloriesChartData}
                icon={Flame}
                type="bar"
                color="#f97316"
                gradientId="caloriesGradient"
                unit="kcal"
                height={220}
              />
            </div>

            {/* Sleep Chart */}
            <PremiumActivityChart
              title="Qualidade do Sono"
              data={sleepChartData}
              icon={Moon}
              type="area"
              color="#8b5cf6"
              gradientId="sleepGradient"
              unit="horas"
              height={180}
            />
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai">
            <AIHealthAnalysis
              metrics={{
                steps: aggregatedMetrics.steps,
                calories: aggregatedMetrics.calories,
                activeMinutes: aggregatedMetrics.activeMinutes,
                sleepHours: aggregatedMetrics.sleepHours,
                heartRateAvg: aggregatedMetrics.heartRateAvg,
                distance: aggregatedMetrics.distance
              }}
              period={period}
              onAnalysisComplete={setAnalysis}
            />
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report">
            <HealthReportExport
              data={{
                metrics: {
                  steps: aggregatedMetrics.steps,
                  calories: aggregatedMetrics.calories,
                  activeMinutes: aggregatedMetrics.activeMinutes,
                  sleepHours: aggregatedMetrics.sleepHours,
                  heartRateAvg: aggregatedMetrics.heartRateAvg,
                  distance: aggregatedMetrics.distance
                },
                period,
                startDate: data[0]?.date || new Date().toISOString(),
                endDate: data[data.length - 1]?.date || new Date().toISOString(),
                userName,
                analysis
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GoogleFitPremiumDashboard;
