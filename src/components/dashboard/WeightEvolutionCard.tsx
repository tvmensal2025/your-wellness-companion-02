import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Scale, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SimpleCharacter3D } from '@/components/ui/simple-character-3d';

interface WeightRecord {
  id: string;
  peso_kg: number;
  measurement_date: string;
  created_at: string;
}

interface WeightEvolutionCardProps {
  measurements: WeightRecord[];
  loading?: boolean;
  gender?: 'male' | 'female';
}

export const WeightEvolutionCard: React.FC<WeightEvolutionCardProps> = ({
  measurements,
  loading = false,
  gender = 'male'
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl bg-card border border-border/40 p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-20 bg-muted rounded mb-4" />
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!measurements || measurements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border/40 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Evolução do Peso</span>
        </div>
        <div className="flex items-center justify-center py-4">
          <SimpleCharacter3D 
            width={120} 
            height={150} 
            gender={gender} 
            autoRotate={true}
            backgroundColor="transparent"
            className="opacity-50"
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Nenhum registro ainda. Comece a acompanhar!
        </p>
      </motion.div>
    );
  }

  // Preparar dados para o gráfico (últimos 30 dias ou menos)
  const chartData = measurements.slice(0, 30).reverse();
  const weights = chartData.map(m => Number(m.peso_kg));
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;

  // Calcular evolução total
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const totalChange = lastWeight - firstWeight;
  const percentChange = ((totalChange / firstWeight) * 100).toFixed(1);

  // Gerar path do gráfico
  const generatePath = () => {
    if (weights.length < 2) return '';
    
    const width = 100;
    const height = 40;
    const padding = 2;
    
    const points = weights.map((weight, index) => {
      const x = (index / (weights.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((weight - minWeight) / range) * (height - padding * 2) - padding;
      return { x, y };
    });
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };

  // Gerar área preenchida
  const generateArea = () => {
    if (weights.length < 2) return '';
    
    const width = 100;
    const height = 40;
    const padding = 2;
    
    const points = weights.map((weight, index) => {
      const x = (index / (weights.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((weight - minWeight) / range) * (height - padding * 2) - padding;
      return { x, y };
    });
    
    let path = `M ${points[0].x} ${height}`;
    path += ` L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    path += ` L ${points[points.length - 1].x} ${height} Z`;
    
    return path;
  };

  const getTrendIcon = () => {
    if (totalChange < -0.5) return <TrendingDown className="h-4 w-4 text-emerald-500" />;
    if (totalChange > 0.5) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (totalChange < -0.5) return 'text-emerald-500';
    if (totalChange > 0.5) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border/40 overflow-hidden"
    >
      {/* Hero com personagem 3D e métricas */}
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex items-center gap-4">
          {/* Personagem 3D */}
          <div className="flex-shrink-0">
            <SimpleCharacter3D 
              width={100} 
              height={130} 
              gender={gender} 
              autoRotate={true}
              backgroundColor="transparent"
            />
          </div>
          
          {/* Métricas principais */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Sua Evolução</span>
            </div>
            
            {/* Peso atual */}
            <div className="text-3xl font-bold text-foreground">
              {lastWeight.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">kg</span>
            </div>
            
            {/* Variação */}
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-xs font-semibold">
                {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)}kg
              </span>
              <span className="text-[10px] opacity-70">({percentChange}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">

      {/* Mini Chart */}
      <div className="relative h-16 w-full">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 100 40" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Área preenchida */}
          <path
            d={generateArea()}
            fill="url(#weightGradient)"
          />
          {/* Linha */}
          <path
            d={generatePath()}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Labels de min/max */}
        <div className="absolute right-0 top-0 text-[10px] text-muted-foreground">
          {maxWeight.toFixed(1)}kg
        </div>
        <div className="absolute right-0 bottom-0 text-[10px] text-muted-foreground">
          {minWeight.toFixed(1)}kg
        </div>
      </div>

      {/* Lista de registros */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {measurements.slice(0, 10).map((record, index) => {
          const prevRecord = measurements[index + 1];
          const change = prevRecord 
            ? Number(record.peso_kg) - Number(prevRecord.peso_kg) 
            : 0;
          
          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">
                    {format(new Date(record.measurement_date || record.created_at), "dd MMM", { locale: ptBR })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {index < measurements.length - 1 && change !== 0 && (
                  <span className={`text-xs font-medium ${
                    change < 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}
                  </span>
                )}
                <span className="text-sm font-semibold text-foreground">
                  {Number(record.peso_kg).toFixed(1)} kg
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

        {/* Footer com período */}
        {measurements.length > 1 && (
          <div className="text-center text-[10px] text-muted-foreground pt-2 border-t border-border/30">
            {measurements.length} registros • {format(new Date(measurements[measurements.length - 1].measurement_date || measurements[measurements.length - 1].created_at), "dd/MM", { locale: ptBR })} a {format(new Date(measurements[0].measurement_date || measurements[0].created_at), "dd/MM", { locale: ptBR })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
