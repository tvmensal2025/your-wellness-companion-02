import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
}) => {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || refreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, [disabled, refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || disabled || refreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      isDragging.current = false;
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance to the pull
      const resistance = Math.min(diff * 0.4, threshold * 1.5);
      setPullDistance(resistance);
      setPulling(true);

      // Prevent default scroll when pulling
      if (diff > 10) {
        e.preventDefault();
      }
    }
  }, [disabled, refreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setRefreshing(false);
      }
    }

    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, refreshing, onRefresh]);

  const showIndicator = pulling || refreshing;
  const indicatorProgress = Math.min(pullDistance / threshold, 1);
  const rotation = refreshing ? 'animate-spin' : `rotate-[${indicatorProgress * 180}deg]`;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-50 transition-all duration-200",
          showIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{ 
          top: Math.max(pullDistance - 40, 8),
          transform: `translateX(-50%) scale(${0.8 + indicatorProgress * 0.2})`
        }}
      >
        <div className={cn(
          "flex items-center justify-center",
          "h-10 w-10 rounded-full bg-card shadow-lg border border-border/50",
          "transition-transform duration-200"
        )}>
          <RefreshCw 
            className={cn(
              "h-5 w-5 text-primary transition-transform",
              refreshing && "animate-spin"
            )}
            style={{ 
              transform: refreshing ? undefined : `rotate(${indicatorProgress * 180}deg)` 
            }}
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        style={{ 
          transform: pulling ? `translateY(${pullDistance}px)` : undefined,
          transition: pulling ? undefined : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
