import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Clock, 
  Flame, 
  Users,
  ChevronDown,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { FeedAlgorithm } from '@/hooks/useSmartFeed';

interface SmartFeedToggleProps {
  algorithm: FeedAlgorithm;
  onAlgorithmChange: (algorithm: FeedAlgorithm) => void;
}

const algorithms = [
  { 
    id: 'smart' as FeedAlgorithm, 
    label: 'Inteligente', 
    description: 'Personalizado para você',
    icon: Sparkles,
    color: 'text-primary'
  },
  { 
    id: 'recent' as FeedAlgorithm, 
    label: 'Recentes', 
    description: 'Ordem cronológica',
    icon: Clock,
    color: 'text-blue-500'
  },
  { 
    id: 'trending' as FeedAlgorithm, 
    label: 'Em Alta', 
    description: 'Mais engajamento agora',
    icon: Flame,
    color: 'text-orange-500'
  },
  { 
    id: 'following' as FeedAlgorithm, 
    label: 'Seguindo', 
    description: 'Apenas quem você segue',
    icon: Users,
    color: 'text-emerald-500'
  },
];

export const SmartFeedToggle: React.FC<SmartFeedToggleProps> = ({
  algorithm,
  onAlgorithmChange
}) => {
  const currentAlgorithm = algorithms.find(a => a.id === algorithm) || algorithms[0];
  const Icon = currentAlgorithm.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 rounded-full border-primary/30 hover:border-primary hover:bg-primary/5"
        >
          <Icon className={`w-4 h-4 ${currentAlgorithm.color}`} />
          <span className="hidden sm:inline">{currentAlgorithm.label}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Ordenar feed por
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {algorithms.map((algo) => {
          const AlgoIcon = algo.icon;
          const isActive = algorithm === algo.id;
          
          return (
            <DropdownMenuItem
              key={algo.id}
              onClick={() => onAlgorithmChange(algo.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                  <AlgoIcon className={`w-4 h-4 ${algo.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{algo.label}</p>
                  <p className="text-xs text-muted-foreground">{algo.description}</p>
                </div>
                {isActive && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Inline button variant for mobile
export const SmartFeedButtons: React.FC<SmartFeedToggleProps> = ({
  algorithm,
  onAlgorithmChange
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {algorithms.map((algo, index) => {
        const AlgoIcon = algo.icon;
        const isActive = algorithm === algo.id;
        
        return (
          <motion.div
            key={algo.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onAlgorithmChange(algo.id)}
              className={`rounded-full whitespace-nowrap gap-1.5 transition-all ${
                isActive 
                  ? 'shadow-md' 
                  : 'border-muted-foreground/20 hover:border-primary/50'
              }`}
            >
              <AlgoIcon className={`w-4 h-4 ${isActive ? '' : algo.color}`} />
              <span className="text-xs sm:text-sm">{algo.label}</span>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
};
