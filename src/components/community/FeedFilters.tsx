import React from 'react';
import { Button } from '@/components/ui/button';
import { Flame, Users, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeedFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'trending', label: 'Em alta', icon: Flame },
  { id: 'following', label: 'Seguindo', icon: Users },
  { id: 'achievements', label: 'Conquistas', icon: Trophy },
  { id: 'recent', label: 'Recentes', icon: Sparkles },
];

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  activeFilter,
  onFilterChange
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
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
  );
};
