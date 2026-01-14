/**
 * HeartRateCard Component
 * Exibe frequência cardíaca em tempo real com animação de pulso
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */

import React, { memo, useMemo } from 'react';
import { Heart, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHeartRate } from '@/hooks/cardio/useHeartRate';

interface HeartRateCardProps {
  className?: string;
  showStats?: boolean;
  compact?: boolean;
}

export const HeartRateCard: React.FC<HeartRateCardProps> = memo(({
  className,
  showStats = false,
  compact = false,
}) => {
  const {
    currentBpm,
    zone,
    zoneInfo,
    formattedLastUpdate,
    isConnected,
    isLoading,
    error,
    avgBpm,
    maxBpm,
    minBpm,
    refresh,
  } = useHeartRate();

  // Calcular duração da animação baseada no BPM
  const pulseAnimation = useMemo(() => {
    if (!currentBpm || currentBpm <= 0) return 'none';
    // 60 BPM = 1 segundo por batida, 120 BPM = 0.5 segundos
    const duration = 60 / currentBpm;
    return `pulse ${duration}s ease-in-out infinite`;
  }, [currentBpm]);

  // Skeleton loader
  if (isLoading) {
    return (
      <div className={cn(
        "bg-muted/30 animate-pulse",
        compact ? "rounded-xl p-3" : "rounded-2xl p-4",
        className
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className={cn("bg-muted rounded", compact ? "h-4 w-20" : "h-5 w-32")} />
          <div className={cn("bg-muted rounded", compact ? "h-3 w-10" : "h-4 w-16")} />
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("bg-muted rounded-full", compact ? "w-10 h-10" : "w-16 h-16")} />
          <div className="flex-1">
            <div className={cn("bg-muted rounded mb-1", compact ? "h-6 w-14" : "h-10 w-24")} />
            <div className={cn("bg-muted rounded", compact ? "h-3 w-12" : "h-4 w-20")} />
          </div>
        </div>
      </div>
    );
  }

  // Versão compacta - layout horizontal, expande verticalmente
  if (compact) {
    return (
      <div className={cn(
        "rounded-xl p-3 transition-all duration-300 flex flex-col justify-center",
        zoneInfo.bgColor,
        `border ${zoneInfo.borderColor}`,
        className
      )}>
        <div className="flex items-center gap-3 w-full">
          {/* Coração animado */}
          <div 
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
              zoneInfo.bgColor
            )}
            style={{ animation: pulseAnimation }}
          >
            <Heart 
              className={cn("w-6 h-6", zoneInfo.color)} 
              fill="currentColor"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="text-xs font-medium flex items-center gap-1">
                <Heart className={cn("w-3 h-3", zoneInfo.color)} />
                Batimentos
              </h4>
              {isConnected ? (
                <Wifi className="w-3 h-3 text-emerald-500" />
              ) : (
                <WifiOff className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            {error && !currentBpm ? (
              <div className="text-xs text-muted-foreground">Sem dados</div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold tabular-nums", zoneInfo.color)}>
                  {currentBpm || '--'}
                </span>
                <span className="text-xs text-muted-foreground">bpm</span>
                <span className={cn("text-[10px] font-medium ml-auto", zoneInfo.color)}>
                  {zoneInfo.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl p-4 transition-all duration-300",
      zoneInfo.bgColor,
      `border ${zoneInfo.borderColor}`,
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Heart className={cn("w-4 h-4", zoneInfo.color)} />
          Batimento Cardíaco
        </h4>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <button 
            onClick={refresh}
            className="p-1 hover:bg-muted/50 rounded transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center gap-4">
        {/* Animated Heart */}
        <div className="relative">
          <div 
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              zoneInfo.bgColor
            )}
            style={{ animation: pulseAnimation }}
          >
            <Heart 
              className={cn("w-8 h-8", zoneInfo.color)} 
              fill="currentColor"
            />
          </div>
          {/* Pulse rings */}
          {currentBpm && currentBpm > 0 && (
            <>
              <div 
                className={cn(
                  "absolute inset-0 rounded-full border-2 opacity-50",
                  zoneInfo.borderColor
                )}
                style={{ 
                  animation: pulseAnimation,
                  animationDelay: '0.1s'
                }}
              />
              <div 
                className={cn(
                  "absolute -inset-2 rounded-full border opacity-25",
                  zoneInfo.borderColor
                )}
                style={{ 
                  animation: pulseAnimation,
                  animationDelay: '0.2s'
                }}
              />
            </>
          )}
        </div>

        {/* BPM Display */}
        <div className="flex-1">
          {error && !currentBpm ? (
            <div className="text-sm text-muted-foreground">
              {error}
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "text-4xl font-bold tabular-nums",
                  zoneInfo.color
                )}>
                  {currentBpm || '--'}
                </span>
                <span className="text-lg text-muted-foreground">bpm</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  zoneInfo.bgColor,
                  zoneInfo.color
                )}>
                  {zoneInfo.label}
                </span>
                {formattedLastUpdate && (
                  <span className="text-xs text-muted-foreground">
                    {formattedLastUpdate}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats (optional) */}
      {showStats && currentBpm && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Média</div>
            <div className="text-sm font-semibold">{avgBpm || '--'}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Mín</div>
            <div className="text-sm font-semibold text-blue-500">{minBpm || '--'}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Máx</div>
            <div className="text-sm font-semibold text-orange-500">{maxBpm || '--'}</div>
          </div>
        </div>
      )}
    </div>
  );
});

HeartRateCard.displayName = 'HeartRateCard';

export default HeartRateCard;
