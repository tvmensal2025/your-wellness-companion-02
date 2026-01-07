import React from 'react';
import { Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PinnedBadgeProps {
  className?: string;
}

export const PinnedBadge: React.FC<PinnedBadgeProps> = ({ className = '' }) => {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px] flex items-center gap-1 ${className}`}
    >
      <Pin className="w-3 h-3" />
      Fixado
    </Badge>
  );
};
