import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, UtensilsCrossed, Trophy, Sparkles, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StoryCategory = 'all' | 'treino' | 'alimentacao' | 'conquista' | 'motivacao' | 'geral';

interface StoryCategoryFilterProps {
  selectedCategory: StoryCategory;
  onCategoryChange: (category: StoryCategory) => void;
  className?: string;
}

const categories: { id: StoryCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'all', label: 'Todos', icon: <LayoutGrid className="w-3.5 h-3.5" />, color: 'bg-primary/80' },
  { id: 'treino', label: 'Treino', icon: <Dumbbell className="w-3.5 h-3.5" />, color: 'bg-orange-500/80' },
  { id: 'alimentacao', label: 'Alimentação', icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: 'bg-green-500/80' },
  { id: 'conquista', label: 'Conquista', icon: <Trophy className="w-3.5 h-3.5" />, color: 'bg-yellow-500/80' },
  { id: 'motivacao', label: 'Motivação', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'bg-purple-500/80' },
];

export const StoryCategoryFilter: React.FC<StoryCategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  className = '',
}) => {
  return (
    <div className={cn('flex gap-2 overflow-x-auto scrollbar-hide pb-2', className)}>
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              isSelected
                ? `${category.color} text-white shadow-md`
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {category.icon}
            {category.label}
          </motion.button>
        );
      })}
    </div>
  );
};
