import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  variant?: 'dashboard' | 'mission' | 'stat' | 'chat' | 'list' | 'profile';
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  variant = 'dashboard',
  className 
}) => {
  const baseClasses = "bg-card rounded-2xl overflow-hidden animate-pulse";
  
  switch (variant) {
    case 'dashboard':
      return (
        <div className={cn(baseClasses, "p-5 space-y-4", className)}>
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-muted/40 rounded-lg" />
            <div className="h-8 w-8 bg-muted/40 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-20 bg-muted/40 rounded-lg" />
            <div className="h-3 w-32 bg-muted/30 rounded" />
          </div>
          <div className="h-2 w-full bg-muted/30 rounded-full" />
        </div>
      );

    case 'mission':
      return (
        <div className={cn(baseClasses, "p-4 flex items-center gap-4", className)}>
          <div className="h-12 w-12 bg-muted/40 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-muted/40 rounded" />
            <div className="h-3 w-1/2 bg-muted/30 rounded" />
          </div>
          <div className="h-10 w-10 bg-muted/40 rounded-full shrink-0" />
        </div>
      );

    case 'stat':
      return (
        <div className={cn(baseClasses, "p-4 space-y-3", className)}>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted/40 rounded" />
            <div className="h-4 w-16 bg-muted/40 rounded" />
          </div>
          <div className="h-7 w-20 bg-muted/40 rounded-lg" />
          <div className="h-2 w-full bg-muted/30 rounded-full" />
        </div>
      );

    case 'chat':
      return (
        <div className={cn("space-y-4 p-4", className)}>
          {/* AI Message */}
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 bg-muted/40 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted/40 rounded" />
              <div className="h-4 w-1/2 bg-muted/30 rounded" />
            </div>
          </div>
          {/* User Message */}
          <div className="flex items-start gap-3 justify-end">
            <div className="flex-1 space-y-2 max-w-[80%]">
              <div className="h-4 w-2/3 bg-primary/20 rounded ml-auto" />
              <div className="h-4 w-1/3 bg-primary/15 rounded ml-auto" />
            </div>
            <div className="h-9 w-9 bg-primary/30 rounded-full shrink-0" />
          </div>
        </div>
      );

    case 'list':
      return (
        <div className={cn("space-y-3", className)}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn(baseClasses, "p-4 flex items-center gap-3")}>
              <div className="h-10 w-10 bg-muted/40 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted/40 rounded" />
                <div className="h-3 w-1/2 bg-muted/30 rounded" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'profile':
      return (
        <div className={cn(baseClasses, "p-6 space-y-4", className)}>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-muted/40 rounded-full" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted/40 rounded" />
              <div className="h-4 w-24 bg-muted/30 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-muted/20 rounded-xl space-y-2">
                <div className="h-6 w-12 bg-muted/40 rounded mx-auto" />
                <div className="h-3 w-16 bg-muted/30 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className={cn(baseClasses, "p-4 space-y-3", className)}>
          <div className="h-4 w-3/4 bg-muted/40 rounded" />
          <div className="h-4 w-1/2 bg-muted/30 rounded" />
        </div>
      );
  }
};

// Skeleton for dashboard grid
export const SkeletonDashboardGrid: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:gap-4", className)}>
      <SkeletonCard variant="stat" />
      <SkeletonCard variant="stat" />
      <SkeletonCard variant="dashboard" className="col-span-2" />
      <SkeletonCard variant="mission" className="col-span-2" />
      <SkeletonCard variant="mission" className="col-span-2" />
    </div>
  );
};

// Skeleton for mission list
export const SkeletonMissionList: React.FC<{ count?: number; className?: string }> = ({ 
  count = 3,
  className 
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant="mission" />
      ))}
    </div>
  );
};

export default SkeletonCard;
