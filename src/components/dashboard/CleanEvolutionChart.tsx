import React, { useMemo, memo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSafeAnimation } from '@/hooks/useSafeAnimation';
import { cn } from '@/lib/utils';
import { Scale, ArrowDown, ArrowUp, Sparkles } from 'lucide-react';

interface WeightRecord {
  id: string;
  peso_kg: number;
  measurement_date: string;
  created_at: string;
}

interface CleanEvolutionChartProps {
  measurements: WeightRecord[];
  loading?: boolean;
  onRegisterClick?: () => void;
}

// Memoized mini stat component - cresce proporcionalmente
const MiniStat = memo(({ 
  label, 
  value, 
  highlight,
  icon: Icon,
  iconColor 
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
  icon?: React.ElementType;
  iconColor?: string;
}) => (
  <div className="py-1.5 min-[400px]:py-3 sm:py-4 text-center group hover:bg-muted/30 transition-colors">
    {Icon && (
      <div className={cn(
        "flex items-center justify-center mx-auto mb-0.5 min-[400px]:mb-1.5",
        "w-6 h-6 min-[400px]:w-10 min-[400px]:h-10 sm:w-11 sm:h-11 rounded-full",
        iconColor || "bg-muted"
      )}>
        <Icon className="w-3 h-3 min-[400px]:w-5 min-[400px]:h-5 sm:w-5 sm:h-5 text-white" />
      </div>
    )}
    <p className="text-[8px] min-[400px]:text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className={cn(
      "text-xs min-[400px]:text-lg sm:text-xl font-bold tabular-nums",
      highlight ? 'text-primary' : 'text-foreground'
    )}>
      {value}
    </p>
  </div>
));

MiniStat.displayName = 'MiniStat';

// Memoized tooltip component - defined outside to prevent re-creation
const CustomTooltip = memo(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-semibold text-foreground">
          {payload[0].value.toFixed(1)} kg
        </p>
        <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

// Empty state component - elegante e motivacional
const EmptyState = memo(({ onRegisterClick }: { onRegisterClick?: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5 sm:p-6 animate-fade-in overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 pointer-events-none" />
      
      <h3 className="text-sm font-medium text-foreground mb-4 relative">Evolução</h3>
      
      <div className="flex flex-col items-center justify-center gap-4 py-6 relative">
        {/* Animated chart illustration */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150 animate-pulse" />
          
          <svg 
            className="w-40 h-24 relative z-10" 
            viewBox="0 0 160 80" 
            fill="none"
          >
            {/* Grid lines */}
            <line x1="20" y1="15" x2="20" y2="65" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-muted-foreground/20" />
            <line x1="20" y1="65" x2="145" y2="65" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-muted-foreground/20" />
            
            {/* Animated path */}
            <path
              d="M 25 55 Q 45 50, 65 48 T 105 35 T 140 25"
              stroke="url(#emptyGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              className="animate-pulse"
              style={{
                strokeDasharray: '200',
                strokeDashoffset: '0',
                animation: 'dash 3s ease-in-out infinite'
              }}
            />
            
            {/* Animated dots */}
            <circle cx="25" cy="55" r="4" fill="hsl(var(--primary))" className="animate-pulse" style={{ animationDelay: '0ms' }} />
            <circle cx="65" cy="48" r="4" fill="hsl(var(--primary))" className="animate-pulse" style={{ animationDelay: '200ms' }} />
            <circle cx="105" cy="35" r="4" fill="hsl(var(--primary))" className="animate-pulse" style={{ animationDelay: '400ms' }} />
            <circle cx="140" cy="25" r="5" fill="hsl(var(--primary))" className="animate-bounce" />
            
            {/* Star at the end */}
            <g transform="translate(140, 15)">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </g>
            
            <defs>
              <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Motivational text */}
        <div className="text-center space-y-2">
          <h4 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <span className="text-2xl">🚀</span> 
            Sua Jornada Começa Aqui!
          </h4>
          <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
            Registre seu primeiro peso e acompanhe sua evolução com gráficos detalhados e insights personalizados
          </p>
        </div>

        {/* CTA Button with shimmer */}
        {onRegisterClick && (
          <button
            onClick={onRegisterClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              "relative mt-2 px-6 py-3 rounded-full font-semibold text-sm",
              "bg-gradient-to-r from-primary via-primary to-emerald-500",
              "text-primary-foreground",
              "shadow-lg shadow-primary/25",
              "overflow-hidden",
              "transition-all duration-300",
              "hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
              "active:scale-95"
            )}
          >
            {/* Shimmer effect */}
            <div 
              className={cn(
                "absolute inset-0 -translate-x-full",
                "bg-gradient-to-r from-transparent via-white/30 to-transparent",
                isHovered && "translate-x-full transition-transform duration-700"
              )}
            />
            
            <span className="relative flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Registrar Primeiro Peso
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
          </button>
        )}
        
        {/* Hint text */}
        <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
          <span>💡</span> Dica: Pese-se sempre no mesmo horário
        </p>
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// Loading skeleton - sem animações motion
const LoadingSkeleton = memo(() => (
  <div className="rounded-2xl bg-card border border-border/50 p-5 animate-fade-in">
    <h3 className="text-sm font-medium text-foreground mb-4">Evolução</h3>
    
    <div className="flex flex-col items-center justify-center h-32 gap-3">
      <div className="w-28 h-16 bg-muted/20 rounded-lg animate-pulse" />
      <p className="text-sm text-muted-foreground">
        Carregando seus dados...
      </p>
    </div>
    
    {/* Footer skeleton */}
    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/30">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-10 bg-muted/20 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export const CleanEvolutionChart: React.FC<CleanEvolutionChartProps> = memo(({
  measurements,
  loading = false,
  onRegisterClick
}) => {
  const { shouldAnimate, isLowEndDevice } = useSafeAnimation();

  // Em dispositivos fracos, limita a 10 pontos
  const maxDataPoints = isLowEndDevice ? 10 : 14;

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // Memoize all expensive computations
  const { chartData, minWeight, maxWeight, lastWeight, change } = useMemo(() => {
    if (!measurements || measurements.length === 0) {
      return {
        chartData: [],
        minWeight: 0,
        maxWeight: 0,
        lastWeight: 0,
        change: 0
      };
    }

    // Prepare chart data - últimos N entries
    const data = measurements
      .slice(0, maxDataPoints)
      .reverse()
      .map(m => ({
        date: format(new Date(m.measurement_date || m.created_at), 'dd/MM', { locale: ptBR }),
        weight: Number(m.peso_kg)
      }));

    const weights = data.map(d => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const last = weights[weights.length - 1];
    const first = weights[0];

    return {
      chartData: data,
      minWeight: min,
      maxWeight: max,
      lastWeight: last,
      change: last - first
    };
  }, [measurements, maxDataPoints]);

  // Early returns AFTER all hooks
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!measurements || measurements.length === 0) {
    return <EmptyState onRegisterClick={onRegisterClick} />;
  }

  return (
    <div
      className="rounded-xl sm:rounded-2xl bg-card border border-border/50 overflow-hidden animate-fade-in h-full flex flex-col"
    >
      {/* Header */}
      <div className="px-3 min-[400px]:px-5 pt-2 min-[400px]:pt-4 pb-1 flex items-center justify-between flex-shrink-0">
        <div className="min-w-0">
          <h3 className="text-sm min-[400px]:text-lg sm:text-xl font-semibold text-foreground leading-tight">Evolução</h3>
          <p className="text-[10px] min-[400px]:text-sm sm:text-base text-muted-foreground">
            {chartData.length} registros
          </p>
        </div>
        <div className={cn(
          "text-right flex-shrink-0",
          change <= 0 ? 'text-emerald-500' : 'text-rose-500'
        )}>
          <span className="text-sm min-[400px]:text-xl sm:text-2xl font-bold tabular-nums">
            {change > 0 ? '+' : ''}{change.toFixed(1)}
          </span>
          <span className="text-[10px] min-[400px]:text-sm ml-0.5">kg</span>
        </div>
      </div>

      {/* Chart - flex-1 para preencher espaço */}
      <div className="flex-1 min-h-[80px] px-1 sm:px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="cleanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
              dy={3}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[minWeight - 0.5, maxWeight + 0.5]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
              width={26}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#cleanGradient)"
              dot={false}
              activeDot={{
                r: 3,
                stroke: 'hsl(var(--primary))',
                strokeWidth: 2,
                fill: 'hsl(var(--background))'
              }}
              isAnimationActive={shouldAnimate}
              animationDuration={shouldAnimate ? 500 : 0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 divide-x divide-border/50 border-t border-border/50 flex-shrink-0">
        <MiniStat 
          label="Mínimo" 
          value={`${minWeight.toFixed(1)}kg`} 
          icon={ArrowDown}
          iconColor="bg-blue-500"
        />
        <MiniStat 
          label="Atual" 
          value={`${lastWeight.toFixed(1)}kg`} 
          highlight 
          icon={Scale}
          iconColor="bg-primary"
        />
        <MiniStat 
          label="Máximo" 
          value={`${maxWeight.toFixed(1)}kg`}
          icon={ArrowUp}
          iconColor="bg-amber-500"
        />
      </div>
    </div>
  );
});

CleanEvolutionChart.displayName = 'CleanEvolutionChart';
