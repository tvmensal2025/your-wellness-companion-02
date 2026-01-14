/**
 * CardioSkeleton Component
 * Skeleton loaders reutilizáveis para componentes cardio
 * 
 * Validates: Requirements 6.4
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface CardioSkeletonProps {
  variant: 'heartRate' | 'trend' | 'points';
  className?: string;
}

export function CardioSkeleton({ variant, className }: CardioSkeletonProps) {
  if (variant === 'heartRate') {
    return (
      <div className={cn("bg-muted/30 rounded-2xl p-4 animate-pulse", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-full" />
          <div className="flex-1">
            <div className="h-10 w-24 bg-muted rounded mb-2" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'trend') {
    return (
      <div className={cn("bg-muted/30 rounded-2xl p-4 animate-pulse", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-36 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="h-12 bg-muted rounded mb-2" />
        <div className="h-4 w-full bg-muted rounded" />
      </div>
    );
  }

  if (variant === 'points') {
    return (
      <div className={cn("bg-muted/30 rounded-2xl p-4 animate-pulse", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-28 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-muted rounded-full" />
          <div className="flex-1">
            <div className="h-8 w-20 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Skeleton para o grid completo de cards cardio
 */
export function CardioGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <CardioSkeleton variant="heartRate" />
      <div className="grid grid-cols-1 gap-3">
        <CardioSkeleton variant="trend" />
        <CardioSkeleton variant="points" />
      </div>
    </div>
  );
}

export default CardioSkeleton;
