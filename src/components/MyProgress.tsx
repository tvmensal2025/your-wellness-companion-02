import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useGoogleFitData, Period } from '../hooks/useGoogleFitData';
import { motion } from 'framer-motion';
import { Skeleton } from './ui/skeleton';
import { GoogleFitCharts } from './progress/GoogleFitCharts';
import { OverviewWithGoogleFit } from './progress/OverviewWithGoogleFit';
import { AdvancedGoogleFitCharts } from './progress/AdvancedGoogleFitCharts';
import { AdvancedGoogleFitMetrics } from './progress/AdvancedGoogleFitMetrics';
import { GoogleFitInsights } from './progress/GoogleFitInsights';
import { HealthExecutiveSummary } from './progress/HealthExecutiveSummary';
import { MedicalHealthAnalysis } from './progress/MedicalHealthAnalysis';
import { ArrowLeft, Activity, Target, TrendingUp, RefreshCw, Clock, Heart, Zap, Moon, Flame, Footprints, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PremiumHealthScore } from './google-fit/PremiumHealthScore';
import { PremiumMetricCard } from './google-fit/PremiumMetricCard';
import { AIHealthAnalysis } from './google-fit/AIHealthAnalysis';
import { HealthReportExport } from './google-fit/HealthReportExport';
const MyProgress: React.FC = () => {
  const [period, setPeriod] = useState<Period>('week');
  const {
    loading,
    error,
    isConnected,
    syncData,
    data,
    lastSync,
    calculateStats,
    getPeriodRange,
    computeScoreForPeriod
  } = useGoogleFitData();

  // Auto-sync em background se último sync > 2h
  useEffect(() => {
    if (!isConnected || !lastSync) return;
    const ageMs = Date.now() - new Date(lastSync).getTime();
    const twoHours = 2 * 60 * 60 * 1000;
    if (ageMs > twoHours) {
      (async () => {
        try {
          await syncData();
        } catch {}
      })();
    }
  }, [isConnected, lastSync, syncData]);

  // Metas individuais (temporariamente salvas em localStorage)
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [stepsGoal, setStepsGoal] = useState<number>(10000);
  const [sleepGoal, setSleepGoal] = useState<number>(8);
  const [activeMinutesGoal, setActiveMinutesGoal] = useState<number>(30);
  const [caloriesGoal, setCaloriesGoal] = useState<number>(500);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_goals');
      if (raw) {
        const g = JSON.parse(raw);
        if (g.stepsGoal) setStepsGoal(g.stepsGoal);
        if (g.sleepGoal) setSleepGoal(g.sleepGoal);
        if (g.activeMinutesGoal) setActiveMinutesGoal(g.activeMinutesGoal);
        if (g.caloriesGoal) setCaloriesGoal(g.caloriesGoal);
      }
    } catch {}
  }, []);
  const saveGoals = () => {
    const g = {
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal
    };
    localStorage.setItem('user_goals', JSON.stringify(g));
    setGoalsOpen(false);
  };

  // Filtrar por período local
  const filteredData = useMemo(() => {
    if (!data?.length) return [] as typeof data;
    const {
      start,
      end
    } = getPeriodRange(period);
    return data.filter(r => r.date >= start && r.date <= end);
  }, [data, period]);
  const comparisonData = useMemo(() => {
    if (!data?.length) return [] as typeof data;
    const now = new Date();
    if (period === 'day') {
      const y = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const ds = y.toISOString().split('T')[0];
      return data.filter(r => r.date === ds);
    }
    if (period === 'week') {
      const {
        start,
        end
      } = getPeriodRange('week');
      const prevEnd = new Date(start + 'T00:00:00');
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevEnd.getDate() - 6);
      const s = prevStart.toISOString().split('T')[0];
      const e = prevEnd.toISOString().split('T')[0];
      return data.filter(r => r.date >= s && r.date <= e);
    }
    // month anterior
    const d = new Date();
    const prevStart = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const prevEnd = new Date(d.getFullYear(), d.getMonth(), 0);
    const s = prevStart.toISOString().split('T')[0];
    const e = prevEnd.toISOString().split('T')[0];
    return data.filter(r => r.date >= s && r.date <= e);
  }, [data, period]);
  const currentStats = useMemo(() => calculateStats(filteredData), [filteredData]);
  const comparisonStats = useMemo(() => comparisonData.length ? calculateStats(comparisonData) : null, [comparisonData]);
  const currentScore = useMemo(() => computeScoreForPeriod(filteredData), [filteredData]);
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  const fmtLastSync = lastSync ? new Date(lastSync).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }) : null;
  const renderValue = (val: number, unit?: string) => filteredData.length === 0 ? <span title="Sem dados no período">—</span> : <span>{unit ? `${val} ${unit}` : val}</span>;
  if (loading) {
    return <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardContent>
            </Card>)}
        </div>
      </div>;
  }

  // Experiência elegante quando não conectado (customizada)
  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-primary via-primary/90 to-accent">
            {/* Efeitos decorativos */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <motion.div 
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />

            <CardContent className="relative z-10 p-6 sm:p-8 space-y-6 text-white">
              {/* Logo e marca */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-3"
              >
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <img src="/favicon.png" alt="Instituto dos Sonhos" className="h-8 w-8 rounded" />
                </div>
                <span className="text-sm font-bold tracking-wide">Instituto dos Sonhos</span>
              </motion.div>

              {/* Título principal */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center space-y-3"
              >
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  Conecte o Google Fit e acompanhe sua evolução
                </h1>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  Sincronize automaticamente seus <span className="font-semibold text-white">passos</span>, 
                  <span className="font-semibold text-white"> calorias ativas</span>, 
                  <span className="font-semibold text-white"> minutos de intensidade</span>, 
                  <span className="font-semibold text-white"> sono</span> e 
                  <span className="font-semibold text-white"> frequência cardíaca</span> para análises inteligentes.
                </p>
              </motion.div>

              {/* Grid de funcionalidades */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { icon: Footprints, label: 'Passos e distância', color: 'bg-emerald-500/20' },
                  { icon: Flame, label: 'Calorias ativas', color: 'bg-orange-500/20' },
                  { icon: Heart, label: 'Frequência cardíaca', color: 'bg-rose-500/20' },
                  { icon: Moon, label: 'Qualidade do sono', color: 'bg-violet-500/20' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${item.color} backdrop-blur-sm`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Botões de ação */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                <Button 
                  size="lg" 
                  className="w-full h-12 bg-white text-primary hover:bg-white/90 font-bold text-base shadow-lg"
                  onClick={() => { window.location.href = '/google-fit-oauth'; }}
                >
                  <Activity className="w-5 h-5 mr-2" />
                  Conectar Google Fit
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="w-full h-11 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Já conectei, atualizar
                </Button>
              </motion.div>

              {/* Prévia do painel */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4"
              >
                <div className="text-xs text-white/70 mb-3 font-medium">📊 Prévia do seu painel</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Passos hoje', value: '—', icon: Footprints },
                    { label: 'Calorias', value: '—', icon: Flame },
                    { label: 'Minutos ativos', value: '—', icon: Zap },
                    { label: 'Sono', value: '—', icon: Moon },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-white/10 p-3 flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-white/60 shrink-0" />
                      <div>
                        <div className="text-[10px] text-white/60">{item.label}</div>
                        <div className="text-lg font-bold">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Nota de segurança */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center text-xs text-white/60"
              >
                🔒 Autorização única. Seus dados permanecem protegidos com criptografia.
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  if (error) {
    return <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">Erro ao carregar dados: {error}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>;
  }
  return <motion.div initial="hidden" animate="visible" variants={cardVariants} className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4">
      {/* Header compacto - título já aparece no header mobile */}
      <div className="flex flex-col gap-3">
        {/* Ações */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={async () => {
            try { await syncData(); } catch (e) { console.error(e); }
          }} className="flex items-center gap-1.5 px-2 sm:px-3">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sincronizar</span>
          </Button>
          <Button variant="default" size="sm" onClick={() => setGoalsOpen(true)} className="flex items-center gap-1.5 px-2 sm:px-3">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Definir Metas</span>
          </Button>
        </div>

        {/* Período - Centralizado */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">Período:</span>
          <ToggleGroup type="single" value={period} onValueChange={(value: Period) => setPeriod(value)} className="bg-muted rounded-lg p-1">
            <ToggleGroupItem value="day" className="text-xs sm:text-sm px-3 sm:px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm">Dia</ToggleGroupItem>
            <ToggleGroupItem value="week" className="text-xs sm:text-sm px-3 sm:px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm">Semana</ToggleGroupItem>
            <ToggleGroupItem value="month" className="text-xs sm:text-sm px-3 sm:px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm">Mês</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Score de Saúde - Centralizado */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <PremiumHealthScore 
            score={currentScore} 
            previousScore={comparisonStats ? computeScoreForPeriod(comparisonData) : undefined}
            label="Score de Saúde"
            description={`Baseado em ${filteredData.length} dia(s) de dados`}
          />
        </div>
      </div>

      {/* Cards Premium KPIs - Grid Responsivo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <PremiumMetricCard
          title="Passos"
          value={filteredData.length ? currentStats.totalSteps : 0}
          unit="passos"
          goal={stepsGoal}
          previousValue={comparisonStats?.totalSteps}
          icon={Footprints}
          color="hsl(142, 76%, 36%)"
          gradient="from-emerald-500 to-green-600"
          delay={0}
        />
        <PremiumMetricCard
          title="Calorias Ativas"
          value={filteredData.length ? currentStats.totalCalories : 0}
          unit="kcal"
          goal={caloriesGoal}
          previousValue={comparisonStats?.totalCalories}
          icon={Flame}
          color="hsl(25, 95%, 53%)"
          gradient="from-orange-500 to-red-500"
          delay={0.1}
        />
        <PremiumMetricCard
          title="Minutos Ativos"
          value={filteredData.length ? currentStats.totalActiveMinutes : 0}
          unit="min"
          goal={activeMinutesGoal}
          previousValue={comparisonStats?.totalActiveMinutes}
          icon={Zap}
          color="hsl(48, 96%, 53%)"
          gradient="from-yellow-500 to-amber-500"
          delay={0.2}
        />
        <PremiumMetricCard
          title="Freq. Cardíaca"
          value={filteredData.length ? currentStats.avgHeartRate : 0}
          unit="bpm"
          previousValue={comparisonStats?.avgHeartRate}
          icon={Heart}
          color="hsl(0, 84%, 60%)"
          gradient="from-red-500 to-rose-600"
          delay={0.3}
        />
        <PremiumMetricCard
          title="Sono"
          value={filteredData.length ? currentStats.avgSleepHours : 0}
          unit="horas"
          goal={sleepGoal}
          previousValue={comparisonStats?.avgSleepHours}
          icon={Moon}
          color="hsl(263, 70%, 50%)"
          gradient="from-violet-500 to-purple-600"
          delay={0.4}
        />
        <PremiumMetricCard
          title="Distância"
          value={filteredData.length ? parseFloat(currentStats.totalDistance.toFixed(1)) : 0}
          unit="km"
          previousValue={comparisonStats?.totalDistance}
          icon={Activity}
          color="hsl(199, 89%, 48%)"
          gradient="from-cyan-500 to-blue-600"
          delay={0.5}
        />
      </div>

      {/* Análise de IA com Insights */}
      <AIHealthAnalysis 
        metrics={{
          steps: currentStats.totalSteps,
          calories: currentStats.totalCalories,
          activeMinutes: currentStats.totalActiveMinutes,
          sleepHours: currentStats.avgSleepHours,
          heartRateAvg: currentStats.avgHeartRate,
          distance: currentStats.totalDistance * 1000
        }}
        period={period}
      />

      {/* Exportar Relatório para Médico */}
      <HealthReportExport 
        data={{
          metrics: {
            steps: currentStats.totalSteps,
            calories: currentStats.totalCalories,
            activeMinutes: currentStats.totalActiveMinutes,
            sleepHours: currentStats.avgSleepHours,
            heartRateAvg: currentStats.avgHeartRate,
            distance: currentStats.totalDistance * 1000
          },
          period,
          startDate: getPeriodRange(period).start,
          endDate: getPeriodRange(period).end
        }}
      />

      {/* Gráficos baseados no período */}
      <GoogleFitCharts chartData={filteredData as any} cardVariants={cardVariants} period={period} comparisonData={comparisonData as any} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal
    }} />

      <AdvancedGoogleFitMetrics data={filteredData as any} period={period} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal,
      heartRateGoal: 80,
      weightGoal: 70
    }} />

      {/* Resumo Executivo de Saúde - Componente Premium */}
      <HealthExecutiveSummary data={filteredData as any} period={period} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal,
      heartRateGoal: 80,
      weightGoal: 70
    }} />

      {/* Análise Médica Profissional */}
      <MedicalHealthAnalysis data={filteredData as any} period={period} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal,
      heartRateGoal: 80,
      weightGoal: 70
    }} />

      <GoogleFitInsights data={filteredData as any} period={period} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal,
      heartRateGoal: 80,
      weightGoal: 70
    }} />

      <AdvancedGoogleFitCharts data={filteredData as any} cardVariants={cardVariants} period={period} comparisonData={comparisonData as any} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal
    }} />

      {/* Overview com integração dos dados da balança */}
      <OverviewWithGoogleFit score={currentScore} currentWeight={75.8} weightTrend={-2.3} bmi={24.2} bodyFat={{
      value: 18.5,
      trend: -1.2
    }} muscleMass={{
      value: 58.2,
      trend: 0.8
    }} measurementDays={Math.max(filteredData.length, 0)} weeklyFitStats={{
      totalSteps: currentStats.totalSteps,
      totalDistance: currentStats.totalDistance * 1000,
      totalCalories: currentStats.totalCalories,
      avgHeartRate: currentStats.avgHeartRate,
      totalActiveMinutes: currentStats.totalActiveMinutes,
      avgSleepHours: currentStats.avgSleepHours
    }} isGoogleFitConnected={isConnected} getScoreGradient={(score: number) => score >= 80 ? 'from-green-400 to-green-600' : score >= 60 ? 'from-yellow-400 to-yellow-600' : score >= 40 ? 'from-orange-400 to-orange-600' : 'from-red-400 to-red-600'} cardVariants={cardVariants} scoreVariants={{
      hidden: {
        scale: 0.8,
        opacity: 0
      },
      visible: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: 'easeOut'
        }
      }
    }} />

      {/* Dialog: Definir Metas Individuais */}
      <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir metas</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>Passos por dia</Label>
              <Input type="number" value={stepsGoal} onChange={e => setStepsGoal(parseInt(e.target.value || '0'))} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Sono (horas/dia)</Label>
              <Input type="number" step="0.5" value={sleepGoal} onChange={e => setSleepGoal(parseFloat(e.target.value || '0'))} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Minutos ativos (dia)</Label>
              <Input type="number" value={activeMinutesGoal} onChange={e => setActiveMinutesGoal(parseInt(e.target.value || '0'))} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Calorias Ativas (dia)</Label>
              <Input type="number" value={caloriesGoal} onChange={e => setCaloriesGoal(parseInt(e.target.value || '0'))} min={0} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveGoals}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>;
};
export default MyProgress;