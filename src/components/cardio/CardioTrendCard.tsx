/**
 * CardioTrendCard Component
 * Exibe tendência cardiovascular com sparkline
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import React, { memo } from 'react';
import { TrendingUp, TrendingDown, Minus, HelpCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCardioTrend } from '@/hooks/cardio/useCardioTrend';

interface CardioTrendCardProps {
  className?: string;
  compact?: boolean;
}

export const CardioTrendCard: React.FC<CardioTrendCardProps> = memo(({
  className,
  compact = false,
}) => {
  const {
    trend,
    sparklinePoints,
    sparklinePath,
    hasEnoughData,
    isLoading,
    trendMessage,
    daysWithData,
  } = useCardioTrend();

  // Ícone baseado na direção
  const TrendIcon = {
    improving: TrendingUp,
    declining: TrendingDown,
    stable: Minus,
    insufficient: HelpCircle,
  }[trend.direction];

  // Skeleton loader
  if (isLoading) {
    return (
      <div className={cn(
        "bg-muted/30 animate-pulse",
        compact ? "rounded-xl p-3" : "rounded-2xl p-4",
        className
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className={cn("bg-muted rounded", compact ? "h-4 w-24" : "h-5 w-36")} />
          <div className={cn("bg-muted rounded", compact ? "h-3 w-16" : "h-4 w-20")} />
        </div>
        <div className={cn("bg-muted rounded mb-2", compact ? "h-8" : "h-12")} />
      </div>
    );
  }

  // Versão compacta - layout horizontal com sparkline, expande verticalmente
  if (compact) {
    return (
      <div className={cn(
        "bg-muted/30 rounded-xl p-3 border border-border flex flex-col",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium flex items-center gap-1">
            <Activity className="w-3 h-3 text-purple-500" />
            Tendência Cardiovascular
          </h4>
          <div className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
            trend.direction === 'improving' && "bg-emerald-500/20 text-emerald-500",
            trend.direction === 'declining' && "bg-red-500/20 text-red-500",
            trend.direction === 'stable' && "bg-yellow-500/20 text-yellow-500",
            trend.direction === 'insufficient' && "bg-muted text-muted-foreground"
          )}>
            <TrendIcon className="w-2.5 h-2.5" />
            {trend.direction === 'improving' && 'Melhorando'}
            {trend.direction === 'declining' && 'Atenção'}
            {trend.direction === 'stable' && 'Estável'}
            {trend.direction === 'insufficient' && 'Aguardando'}
          </div>
        </div>

        {/* Sparkline - expande para preencher espaço */}
        <div className="flex-1 min-h-[40px]">
          {hasEnoughData && sparklinePath ? (
            <svg 
              className="w-full h-full" 
              viewBox="0 0 100 30" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="trendGradientCompact" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop 
                    offset="0%" 
                    stopColor={
                      trend.direction === 'improving' ? '#10B981' :
                      trend.direction === 'declining' ? '#EF4444' :
                      '#F59E0B'
                    } 
                    stopOpacity="0.3" 
                  />
                  <stop 
                    offset="100%" 
                    stopColor={
                      trend.direction === 'improving' ? '#10B981' :
                      trend.direction === 'declining' ? '#EF4444' :
                      '#F59E0B'
                    } 
                    stopOpacity="0" 
                  />
                </linearGradient>
              </defs>
              <path
                d={`${sparklinePath} L 100 30 L 0 30 Z`}
                fill="url(#trendGradientCompact)"
              />
              <path
                d={sparklinePath}
                fill="none"
                stroke={
                  trend.direction === 'improving' ? '#10B981' :
                  trend.direction === 'declining' ? '#EF4444' :
                  '#F59E0B'
                }
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground">
                Sincronize +{3 - daysWithData} dia(s) para ver o gráfico
              </span>
            </div>
          )}
        </div>

        {/* Footer com dias */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-0.5 flex-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i < daysWithData ? "bg-purple-500" : "bg-muted"
                )}
              />
            ))}
          </div>
          <span className="text-[9px] text-muted-foreground ml-2">
            {daysWithData}/7 dias
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-muted/30 rounded-2xl p-4 border border-border",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          Tendência Cardiovascular
        </h4>
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
          trend.direction === 'improving' && "bg-emerald-500/20 text-emerald-500",
          trend.direction === 'declining' && "bg-red-500/20 text-red-500",
          trend.direction === 'stable' && "bg-yellow-500/20 text-yellow-500",
          trend.direction === 'insufficient' && "bg-muted text-muted-foreground"
        )}>
          <TrendIcon className="w-3 h-3" />
          {trend.direction === 'improving' && 'Melhorando'}
          {trend.direction === 'declining' && 'Atenção'}
          {trend.direction === 'stable' && 'Estável'}
          {trend.direction === 'insufficient' && 'Dados insuficientes'}
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-12 mb-3 relative">
        {hasEnoughData && sparklinePath ? (
          <svg 
            className="w-full h-full" 
            viewBox="0 0 100 40" 
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" strokeWidth="0.5" className="text-muted/30" />
            <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" className="text-muted/30" />
            <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="0.5" className="text-muted/30" />
            
            {/* Gradient fill */}
            <defs>
              <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop 
                  offset="0%" 
                  stopColor={
                    trend.direction === 'improving' ? '#10B981' :
                    trend.direction === 'declining' ? '#EF4444' :
                    '#F59E0B'
                  } 
                  stopOpacity="0.3" 
                />
                <stop 
                  offset="100%" 
                  stopColor={
                    trend.direction === 'improving' ? '#10B981' :
                    trend.direction === 'declining' ? '#EF4444' :
                    '#F59E0B'
                  } 
                  stopOpacity="0" 
                />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d={`${sparklinePath} L 100 40 L 0 40 Z`}
              fill="url(#trendGradient)"
            />
            
            {/* Line */}
            <path
              d={sparklinePath}
              fill="none"
              stroke={
                trend.direction === 'improving' ? '#10B981' :
                trend.direction === 'declining' ? '#EF4444' :
                '#F59E0B'
              }
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {sparklinePoints.map((point, i) => {
              const x = sparklinePoints.length > 1 
                ? (i / (sparklinePoints.length - 1)) * 100 
                : 50;
              const y = 40 - (point.normalizedValue / 100) * 40;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={
                    trend.direction === 'improving' ? '#10B981' :
                    trend.direction === 'declining' ? '#EF4444' :
                    '#F59E0B'
                  }
                />
              );
            })}
          </svg>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center">
              <HelpCircle className="w-6 h-6 mx-auto mb-1 opacity-50" />
              <span>Sincronize {3 - daysWithData} dia(s) para ver o gráfico</span>
            </div>
          </div>
        )}
      </div>

      {/* Message */}
      <div className="flex items-center justify-between">
        <p className={cn("text-sm", trend.color)}>
          {trendMessage}
        </p>
        {hasEnoughData && trend.changeBpm !== 0 && (
          <span className={cn(
            "text-xs font-medium",
            trend.changeBpm < 0 ? "text-emerald-500" : "text-red-500"
          )}>
            {trend.changeBpm > 0 ? '+' : ''}{trend.changeBpm} bpm
          </span>
        )}
      </div>

      {/* Days indicator */}
      <div className="flex items-center gap-1 mt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i < daysWithData ? "bg-purple-500" : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
        {daysWithData}/7 dias com dados
      </p>
    </div>
  );
});

CardioTrendCard.displayName = 'CardioTrendCard';

export default CardioTrendCard;
