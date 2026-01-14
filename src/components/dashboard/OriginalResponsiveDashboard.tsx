import React, { memo, useMemo, useState, useEffect } from 'react';
import { 
  TrendingDown, TrendingUp, Flame, Zap, Scale, 
  ChevronRight, RefreshCw, ArrowDown, ArrowUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OriginalResponsiveDashboardProps {
  currentWeight: number;
  targetWeight?: number;  
  weightChange?: number;
  totalLost?: number;
  healthScore: number;
  currentStreak: number;
  userName?: string;
  height?: number;
  age?: number;
  gender?: string;
  minWeight?: number;
  maxWeight?: number;
  measurements?: Array<{ peso_kg: number; measurement_date: string; created_at: string }>;
  onRegisterWeight?: () => void;
}

// ============================================
// RING DE PONTUAÇÃO - Estilo original
// ============================================
const ScoreRing = memo(({ score }: { score: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (Math.min(100, animatedScore) / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative flex-shrink-0">
      <svg className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="none" className="stroke-muted" strokeWidth="8" />
        <circle 
          cx="50" cy="50" r="38" 
          fill="none" 
          stroke="#3b82f6"
          strokeWidth="8" 
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums leading-none">
          {animatedScore}
        </span>
        <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
          PONTUAÇÃO
        </span>
      </div>
    </div>
  );
});

ScoreRing.displayName = 'ScoreRing';

// ============================================
// STAT ICON - Ícones coloridos
// ============================================
const StatIcon = memo(({ 
  icon: Icon, 
  color, 
  value, 
  label 
}: { 
  icon: React.ElementType; 
  color: string; 
  value: string | number; 
  label: string;
}) => (
  <div className="flex flex-col items-center">
    <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center", color)}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </div>
    <p className="text-foreground font-bold text-sm sm:text-base mt-1 tabular-nums">
      {value}<span className="text-muted-foreground text-xs sm:text-sm font-normal ml-0.5">{label.includes('dias') ? 'dias' : label.includes('kg') ? 'kg' : 'kcal'}</span>
    </p>
    <p className="text-muted-foreground text-[10px] sm:text-xs">{label.split(' ')[0]}</p>
  </div>
));

StatIcon.displayName = 'StatIcon';

// ============================================
// MINI CHART - Gráfico de evolução simples
// ============================================
const MiniChart = memo(({ 
  measurements,
  change
}: { 
  measurements: Array<{ peso_kg: number; measurement_date: string; created_at: string }>;
  change: number;
}) => {
  const chartData = useMemo(() => {
    if (!measurements || measurements.length === 0) return [];
    return measurements
      .slice(0, 14)
      .reverse()
      .map(m => ({
        date: format(new Date(m.measurement_date || m.created_at), 'dd/MM', { locale: ptBR }),
        weight: Number(m.peso_kg)
      }));
  }, [measurements]);

  if (chartData.length === 0) return null;

  const weights = chartData.map(d => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  // Criar pontos para o polyline
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * 280 + 10;
    const y = 55 - ((d.weight - minW) / range) * 45;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-card rounded-2xl p-3 sm:p-4 border border-border">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-foreground font-semibold text-sm sm:text-base">Evolução</p>
          <p className="text-muted-foreground text-[10px] sm:text-xs">Últimos {chartData.length} registros</p>
        </div>
        <span className={cn(
          "font-bold text-sm sm:text-base tabular-nums",
          change <= 0 ? "text-emerald-500" : "text-rose-500"
        )}>
          {change > 0 ? '+' : ''}{change.toFixed(1)} kg
        </span>
      </div>
      <svg className="w-full h-16 sm:h-20" viewBox="0 0 300 60" preserveAspectRatio="none">
        <polyline 
          fill="none" 
          stroke="hsl(var(--primary))" 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      <div className="flex justify-between text-muted-foreground text-[8px] sm:text-[10px] mt-1">
        {chartData.filter((_, i) => i % Math.ceil(chartData.length / 7) === 0 || i === chartData.length - 1)
          .map((d, i) => (
            <span key={i}>{d.date}</span>
          ))}
      </div>
    </div>
  );
});

MiniChart.displayName = 'MiniChart';

// ============================================
// MIN/REAL/MAX - Cards de peso
// ============================================
const WeightStats = memo(({ 
  minWeight, 
  currentWeight, 
  maxWeight 
}: { 
  minWeight: number; 
  currentWeight: number; 
  maxWeight: number;
}) => (
  <div className="flex justify-between gap-2 sm:gap-3">
    <div className="flex-1 text-center">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-1">
        <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <p className="text-muted-foreground text-[10px] sm:text-xs">MÍNIMO</p>
      <p className="text-foreground font-bold text-sm sm:text-base tabular-nums">{minWeight.toFixed(1)} kg</p>
    </div>
    <div className="flex-1 text-center">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center mx-auto mb-1">
        <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <p className="text-primary text-[10px] sm:text-xs">REAL</p>
      <p className="text-primary font-bold text-sm sm:text-base tabular-nums">{currentWeight.toFixed(1)} kg</p>
    </div>
    <div className="flex-1 text-center">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-1">
        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <p className="text-muted-foreground text-[10px] sm:text-xs">MÁXIMO</p>
      <p className="text-foreground font-bold text-sm sm:text-base tabular-nums">{maxWeight.toFixed(1)} kg</p>
    </div>
  </div>
));

WeightStats.displayName = 'WeightStats';

// ============================================
// BOTÃO REGISTRAR PESO
// ============================================
const RegisterWeightButton = memo(({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between",
      "bg-primary hover:bg-primary/90 active:scale-[0.98]",
      "rounded-2xl p-3 sm:p-4",
      "transition-all duration-200"
    )}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
        <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div className="text-left">
        <p className="text-white font-semibold text-sm sm:text-base">Registrar Peso ⚖️</p>
        <p className="text-white/70 text-xs sm:text-sm">sua evolução</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
  </button>
));

RegisterWeightButton.displayName = 'RegisterWeightButton';

// ============================================
// DR. VITAL CARD - Dicas de saúde
// ============================================
const DrVitalCard = memo(() => {
  const tips = [
    {
      title: "Proteína e Saciedade",
      content: "Consumir 25-30g de proteína por refeição aumenta a saciedade em até 60% e pode reduzir o consumo calórico diário.",
      source: "Revista da Academia de Nutrição e Dietética, 2015"
    },
    {
      title: "Hidratação e Metabolismo",
      content: "Beber 500ml de água pode aumentar temporariamente o metabolismo em 24-30% por cerca de uma hora.",
      source: "Journal of Clinical Endocrinology, 2003"
    },
    {
      title: "Sono e Peso",
      content: "Dormir menos de 7 horas por noite pode aumentar o risco de ganho de peso em até 55%.",
      source: "Sleep Medicine Reviews, 2017"
    }
  ];

  const [currentTip, setCurrentTip] = useState(0);
  const tip = tips[currentTip];

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-2xl p-3 sm:p-4 border border-purple-500/20">
      {/* Swipe indicator */}
      <div className="w-9 h-1 bg-white/30 rounded-full mx-auto mb-3" />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-sm sm:text-base">💡</span>
          </div>
          <div>
            <p className="text-foreground font-semibold text-sm sm:text-base">Dr. Vital</p>
            <p className="text-muted-foreground text-[10px] sm:text-xs">Nutrição e bem-estar</p>
          </div>
        </div>
        <button 
          onClick={() => setCurrentTip((currentTip + 1) % tips.length)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="flex gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-primary text-lg sm:text-xl">🛡️</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-medium text-sm sm:text-base">{tip.title}</p>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 leading-relaxed">{tip.content}</p>
          <p className="text-muted-foreground/70 text-[10px] sm:text-xs mt-2">📚 {tip.source}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1">
          {tips.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors",
                i === currentTip ? "bg-purple-400" : "bg-muted"
              )} 
            />
          ))}
        </div>
        <button 
          onClick={() => setCurrentTip((currentTip + 1) % tips.length)}
          className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm hover:text-foreground transition-colors"
        >
          <span>+{tips.length - 1}</span>
          <span>Próxima dica</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
});

DrVitalCard.displayName = 'DrVitalCard';

// ============================================
// MAIN COMPONENT
// ============================================
export const OriginalResponsiveDashboard: React.FC<OriginalResponsiveDashboardProps> = memo(({
  currentWeight,
  targetWeight,
  weightChange = 0,
  totalLost = 0,
  healthScore,
  currentStreak,
  userName = 'Usuário',
  height = 170,
  age = 30,
  gender = 'F',
  minWeight = 0,
  maxWeight = 0,
  measurements = [],
  onRegisterWeight
}) => {
  // TMB (Taxa Metabólica Basal)
  const tmb = useMemo(() => {
    if (!currentWeight || currentWeight === 0) return 0;
    const isMale = gender?.toLowerCase() === 'm' || gender?.toLowerCase() === 'masculino';
    return Math.round(isMale 
      ? 10 * currentWeight + 6.25 * height - 5 * age + 5
      : 10 * currentWeight + 6.25 * height - 5 * age - 161
    );
  }, [currentWeight, height, age, gender]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: `Bom dia !`, emoji: '☀️' };
    if (hour >= 12 && hour < 18) return { text: `Boa tarde !`, emoji: '🌤️' };
    return { text: `Boa noite !`, emoji: '🌙' };
  }, []);

  // Calcular min/max se não fornecidos
  const calculatedMinWeight = useMemo(() => {
    if (minWeight > 0) return minWeight;
    if (!measurements || measurements.length === 0) return currentWeight;
    return Math.min(...measurements.map(m => Number(m.peso_kg)));
  }, [minWeight, measurements, currentWeight]);

  const calculatedMaxWeight = useMemo(() => {
    if (maxWeight > 0) return maxWeight;
    if (!measurements || measurements.length === 0) return currentWeight;
    return Math.max(...measurements.map(m => Number(m.peso_kg)));
  }, [maxWeight, measurements, currentWeight]);

  // Calcular change total
  const totalChange = useMemo(() => {
    if (!measurements || measurements.length < 2) return weightChange;
    const first = Number(measurements[measurements.length - 1]?.peso_kg) || 0;
    const current = Number(measurements[0]?.peso_kg) || 0;
    return current - first;
  }, [measurements, weightChange]);

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* === HEADER: Saudação === */}
      <div className="px-1">
        <p className="text-muted-foreground text-xs sm:text-sm">{greeting.emoji} {greeting.text}</p>
        <p className="text-foreground text-xl sm:text-2xl font-bold">{userName.split(' ')[0]} 👋</p>
      </div>

      {/* === HERO: Score + Peso === */}
      <div className="bg-card rounded-2xl p-3 sm:p-4 border border-border">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Ring de pontuação */}
          <ScoreRing score={healthScore} />

          {/* Peso atual */}
          <div className="flex-1 min-w-0">
            <p className="text-muted-foreground text-[10px] sm:text-xs">Peso atual</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-bold text-foreground tabular-nums leading-none">
                {currentWeight === 0 ? '--' : currentWeight.toFixed(1)}
              </span>
              <span className="text-base sm:text-lg text-muted-foreground">kg</span>
            </div>
            {/* Badge de tendência */}
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-2 text-xs sm:text-sm",
              totalChange <= 0 
                ? "bg-emerald-500/20 text-emerald-500" 
                : "bg-rose-500/20 text-rose-500"
            )}>
              {totalChange <= 0 ? (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="font-medium tabular-nums">
                {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-between mt-4 pt-3 border-t border-border">
          <StatIcon 
            icon={Flame} 
            color="bg-orange-500" 
            value={currentStreak} 
            label="dias Sequência" 
          />
          <StatIcon 
            icon={TrendingDown} 
            color="bg-blue-500" 
            value={totalLost > 0 ? totalLost.toFixed(1) : '0'} 
            label="kg Total" 
          />
          <StatIcon 
            icon={Zap} 
            color="bg-amber-500" 
            value={tmb > 0 ? tmb.toLocaleString('pt-BR') : '--'} 
            label="kcal Em" 
          />
        </div>
      </div>

      {/* === GRÁFICO DE EVOLUÇÃO === */}
      {measurements && measurements.length > 0 && (
        <MiniChart measurements={measurements} change={totalChange} />
      )}

      {/* === MIN / REAL / MAX === */}
      <WeightStats 
        minWeight={calculatedMinWeight} 
        currentWeight={currentWeight} 
        maxWeight={calculatedMaxWeight} 
      />

      {/* === BOTÃO REGISTRAR PESO === */}
      <RegisterWeightButton onClick={onRegisterWeight} />

      {/* === DR. VITAL === */}
      <DrVitalCard />
    </div>
  );
});

OriginalResponsiveDashboard.displayName = 'OriginalResponsiveDashboard';

export default OriginalResponsiveDashboard;
