import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoogleFitData, Period } from '@/hooks/useGoogleFitData';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Activity, Target, RefreshCw, Heart, Zap, Moon, Flame, Footprints, 
  Gamepad2, TrendingUp, TrendingDown, Calendar, ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import GamifiedProgressPage from '@/components/progress/GamifiedProgressPage';
import { Logo } from '@/components/ui/logo';

// ============================================================================
// COMPONENTES AUXILIARES - MODO DETALHADO LIMPO
// ============================================================================

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  goal?: number;
  previousValue?: number;
  icon: React.ElementType;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, unit, goal, previousValue, icon: Icon, color 
}) => {
  const progress = goal ? Math.min(100, (value / goal) * 100) : 0;
  const trend = previousValue ? value - previousValue : 0;
  const trendPercent = previousValue ? ((trend / previousValue) * 100).toFixed(0) : '0';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className={cn("p-2 rounded-lg", color)}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            {previousValue !== undefined && trend !== 0 && (
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                trend > 0 ? "text-emerald-500" : "text-red-500"
              )}>
                {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(Number(trendPercent))}%
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{unit}</p>
          </div>
          
          {goal && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Meta: {goal.toLocaleString()}</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-xs font-medium text-center mt-1.5 text-muted-foreground">{title}</p>
    </motion.div>
  );
};

interface ScoreRingProps {
  score: number;
  label: string;
}

const ScoreRing: React.FC<ScoreRingProps> = ({ score, label }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-yellow-500';
    if (s >= 40) return 'text-orange-500';
    return 'text-red-500';
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/30"
          />
          <motion.circle
            cx="56"
            cy="56"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={getColor(score)}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold", getColor(score))}>{score}</span>
        </div>
      </div>
      <p className="text-sm font-medium mt-2">{label}</p>
    </div>
  );
};


// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const MyProgress: React.FC = () => {
  const [viewMode, setViewMode] = useState<'gamified' | 'detailed'>('gamified');
  const [period, setPeriod] = useState<Period>('week');
  const [goalsOpen, setGoalsOpen] = useState(false);
  
  // Metas
  const [stepsGoal, setStepsGoal] = useState(10000);
  const [sleepGoal, setSleepGoal] = useState(8);
  const [activeMinutesGoal, setActiveMinutesGoal] = useState(30);
  const [caloriesGoal, setCaloriesGoal] = useState(500);

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

  // Carregar metas do localStorage
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
    localStorage.setItem('user_goals', JSON.stringify({
      stepsGoal, sleepGoal, activeMinutesGoal, caloriesGoal
    }));
    setGoalsOpen(false);
  };

  // Filtrar dados por período
  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    const { start, end } = getPeriodRange(period);
    return data.filter(r => r.date >= start && r.date <= end);
  }, [data, period, getPeriodRange]);

  // Dados do período anterior para comparação
  const comparisonData = useMemo(() => {
    if (!data?.length) return [];
    const now = new Date();
    
    if (period === 'day') {
      const y = new Date(now.getTime() - 86400000);
      const ds = y.toISOString().split('T')[0];
      return data.filter(r => r.date === ds);
    }
    
    if (period === 'week') {
      const { start } = getPeriodRange('week');
      const prevEnd = new Date(start + 'T00:00:00');
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevEnd.getDate() - 6);
      return data.filter(r => 
        r.date >= prevStart.toISOString().split('T')[0] && 
        r.date <= prevEnd.toISOString().split('T')[0]
      );
    }
    
    // Mês anterior
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    return data.filter(r => 
      r.date >= prevStart.toISOString().split('T')[0] && 
      r.date <= prevEnd.toISOString().split('T')[0]
    );
  }, [data, period, getPeriodRange]);

  const currentStats = useMemo(() => calculateStats(filteredData), [filteredData, calculateStats]);
  const comparisonStats = useMemo(() => 
    comparisonData.length ? calculateStats(comparisonData) : null, 
    [comparisonData, calculateStats]
  );
  const currentScore = useMemo(() => computeScoreForPeriod(filteredData), [filteredData, computeScoreForPeriod]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Não conectado - Tela elegante
  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden relative">
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            
            <CardContent className="relative z-10 p-6 space-y-6 text-white">
              <div className="flex items-center justify-center gap-3">
                <Logo className="h-8 w-8" variant="icon" />
                <span className="font-bold">MaxNutrition</span>
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Conecte o Google Fit</h1>
                <p className="text-white/80 text-sm">
                  Sincronize seus dados de atividade para acompanhar sua evolução
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Footprints, label: 'Passos' },
                  { icon: Flame, label: 'Calorias' },
                  { icon: Heart, label: 'Frequência' },
                  { icon: Moon, label: 'Sono' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full bg-white text-primary hover:bg-white/90 font-bold"
                onClick={() => window.location.href = '/google-fit-oauth'}
              >
                <Activity className="w-5 h-5 mr-2" />
                Conectar Google Fit
              </Button>

              <p className="text-center text-xs text-white/60">
                🔒 Seus dados permanecem protegidos
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Erro ao carregar dados</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  // Modo Gamificado (padrão)
  if (viewMode === 'gamified') {
    return (
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('detailed')}
            className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Estatísticas</span>
          </Button>
        </div>
        <GamifiedProgressPage />
      </div>
    );
  }


  // ============================================================================
  // MODO DETALHADO - LIMPO E FOCADO
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24">
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode('gamified')}
            className="flex items-center gap-1.5"
          >
            <Gamepad2 className="w-4 h-4" />
            Jornada
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => syncData()}
              className="px-2"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setGoalsOpen(true)}
              className="px-2"
            >
              <Target className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Seletor de Período */}
        <div className="flex justify-center">
          <ToggleGroup 
            type="single" 
            value={period} 
            onValueChange={(v: Period) => v && setPeriod(v)}
            className="bg-muted rounded-lg p-1"
          >
            <ToggleGroupItem value="day" className="text-sm px-4">Dia</ToggleGroupItem>
            <ToggleGroupItem value="week" className="text-sm px-4">Semana</ToggleGroupItem>
            <ToggleGroupItem value="month" className="text-sm px-4">Mês</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Score de Saúde */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-8">
                <ScoreRing score={currentScore} label="Score de Saúde" />
                
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredData.length}</p>
                    <p className="text-xs text-muted-foreground">dias de dados</p>
                  </div>
                  
                  {lastSync && (
                    <p className="text-xs text-muted-foreground text-center">
                      Sync: {new Date(lastSync).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Passos"
            value={currentStats.totalSteps}
            unit="passos"
            goal={stepsGoal}
            previousValue={comparisonStats?.totalSteps}
            icon={Footprints}
            color="bg-emerald-500"
          />
          <MetricCard
            title="Calorias"
            value={currentStats.totalCalories}
            unit="kcal ativas"
            goal={caloriesGoal}
            previousValue={comparisonStats?.totalCalories}
            icon={Flame}
            color="bg-orange-500"
          />
          <MetricCard
            title="Minutos Ativos"
            value={currentStats.totalActiveMinutes}
            unit="minutos"
            goal={activeMinutesGoal}
            previousValue={comparisonStats?.totalActiveMinutes}
            icon={Zap}
            color="bg-yellow-500"
          />
          <MetricCard
            title="Sono"
            value={Number(currentStats.avgSleepHours.toFixed(1))}
            unit="horas/noite"
            goal={sleepGoal}
            previousValue={comparisonStats?.avgSleepHours}
            icon={Moon}
            color="bg-violet-500"
          />
          <MetricCard
            title="Freq. Cardíaca"
            value={currentStats.avgHeartRate}
            unit="bpm média"
            previousValue={comparisonStats?.avgHeartRate}
            icon={Heart}
            color="bg-rose-500"
          />
          <MetricCard
            title="Distância"
            value={Number(currentStats.totalDistance.toFixed(1))}
            unit="km"
            previousValue={comparisonStats?.totalDistance}
            icon={Activity}
            color="bg-cyan-500"
          />
        </div>

        {/* Dica */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-md bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Relatório Médico Completo</p>
                  <p className="text-xs text-muted-foreground">
                    Acesse o Dr. Vital para análises detalhadas e PDF
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dialog de Metas */}
      <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir Metas</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>Passos/dia</Label>
              <Input 
                type="number" 
                value={stepsGoal} 
                onChange={e => setStepsGoal(parseInt(e.target.value || '0'))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Sono (horas)</Label>
              <Input 
                type="number" 
                step="0.5"
                value={sleepGoal} 
                onChange={e => setSleepGoal(parseFloat(e.target.value || '0'))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Min. ativos</Label>
              <Input 
                type="number" 
                value={activeMinutesGoal} 
                onChange={e => setActiveMinutesGoal(parseInt(e.target.value || '0'))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Calorias</Label>
              <Input 
                type="number" 
                value={caloriesGoal} 
                onChange={e => setCaloriesGoal(parseInt(e.target.value || '0'))} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveGoals}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyProgress;
