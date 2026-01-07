import React from 'react';
import { Button } from '@/components/ui/button';
import { Flame, Users, Trophy, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { SmartFeedToggle } from './SmartFeedToggle';
import { FeedAlgorithm } from '@/hooks/useSmartFeed';

interface FeedFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  algorithm?: FeedAlgorithm;
  onAlgorithmChange?: (algorithm: FeedAlgorithm) => void;
  showAlgorithmToggle?: boolean;
}

const filters = [
  { id: 'trending', label: 'Em alta', icon: Flame },
  { id: 'following', label: 'Seguindo', icon: Users },
  { id: 'achievements', label: 'Conquistas', icon: Trophy },
  { id: 'recent', label: 'Recentes', icon: Clock },
];

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  activeFilter,
  onFilterChange,
  algorithm = 'smart',
  onAlgorithmChange,
  showAlgorithmToggle = true,
}) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Smart Feed Algorithm Toggle */}
      {showAlgorithmToggle && onAlgorithmChange && (
        <div className="flex items-center gap-2">
          <SmartFeedToggle 
            algorithm={algorithm} 
            onAlgorithmChange={onAlgorithmChange} 
          />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Feed personalizado com IA
          </span>
        </div>
      )}
      
      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <motion.div
              key={filter.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange(filter.id)}
                className={`rounded-full flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'border-primary/30 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : 'text-primary'}`} />
                <span className="text-xs sm:text-sm">{filter.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
