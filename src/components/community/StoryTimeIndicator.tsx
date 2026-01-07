import React from 'react';
import { Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StoryTimeIndicatorProps {
  expiresAt: string;
  viewsCount?: number;
  className?: string;
}

export const StoryTimeIndicator: React.FC<StoryTimeIndicatorProps> = ({
  expiresAt,
  viewsCount = 0,
  className = '',
}) => {
  const calculateTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expirado';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h restantes`;
    }
    return `${minutes}min restantes`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="secondary" 
        className="bg-black/40 text-white border-0 backdrop-blur-sm text-[10px] sm:text-xs flex items-center gap-1"
      >
        <Clock className="w-3 h-3" />
        {calculateTimeRemaining()}
      </Badge>
      
      {viewsCount > 0 && (
        <Badge 
          variant="secondary" 
          className="bg-black/40 text-white border-0 backdrop-blur-sm text-[10px] sm:text-xs flex items-center gap-1"
        >
          <Eye className="w-3 h-3" />
          {viewsCount}
        </Badge>
      )}
    </div>
  );
};

// Category badge for stories
export const StoryCategoryBadge: React.FC<{
  category: string;
  className?: string;
}> = ({ category, className = '' }) => {
  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case 'treino':
        return { label: '🏋️ Treino', color: 'bg-orange-500/80' };
      case 'alimentacao':
        return { label: '🥗 Alimentação', color: 'bg-green-500/80' };
      case 'conquista':
        return { label: '🏆 Conquista', color: 'bg-yellow-500/80' };
      case 'motivacao':
        return { label: '✨ Motivação', color: 'bg-purple-500/80' };
      default:
        return { label: '📝 Geral', color: 'bg-primary/80' };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <Badge 
      className={`${config.color} text-white border-0 backdrop-blur-sm text-[10px] sm:text-xs ${className}`}
    >
      {config.label}
    </Badge>
  );
};
