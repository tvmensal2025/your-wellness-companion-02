import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export interface Reaction {
  type: string;
  emoji: string;
  label: string;
  color: string;
}

export const REACTION_TYPES: Reaction[] = [
  { type: 'like', emoji: '❤️', label: 'Adorei', color: 'text-red-500' },
  { type: 'strength', emoji: '💪', label: 'Força', color: 'text-orange-500' },
  { type: 'fire', emoji: '🔥', label: 'Motivador', color: 'text-amber-500' },
  { type: 'celebrate', emoji: '🎉', label: 'Parabéns', color: 'text-purple-500' },
  { type: 'support', emoji: '🙌', label: 'Apoio', color: 'text-blue-500' },
];

interface ReactionPickerProps {
  currentReaction?: string | null;
  onReact: (reactionType: string) => void;
  reactionsCount?: Record<string, number>;
  showCounts?: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  currentReaction,
  onReact,
  reactionsCount = {},
  showCounts = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const currentReactionData = currentReaction 
    ? REACTION_TYPES.find(r => r.type === currentReaction) 
    : null;

  const totalReactions = Object.values(reactionsCount).reduce((a, b) => a + b, 0);

  const handleReact = (type: string) => {
    onReact(type);
    setIsOpen(false);
  };

  // Get top 3 reactions for display
  const topReactions = Object.entries(reactionsCount)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => REACTION_TYPES.find(r => r.type === type))
    .filter(Boolean);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 gap-1.5 h-9 sm:h-10 transition-colors ${
            currentReaction 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
          }`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <motion.div
            whileTap={{ scale: 1.4 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {currentReactionData ? (
              <span className="text-lg">{currentReactionData.emoji}</span>
            ) : (
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${currentReaction ? 'fill-current' : ''}`} />
            )}
          </motion.div>
          <span className="text-xs sm:text-sm">
            {currentReactionData ? currentReactionData.label : 'Reagir'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-2 bg-background/95 backdrop-blur-sm border shadow-lg rounded-full"
        side="top"
        align="start"
      >
        <div className="flex gap-1">
          <AnimatePresence>
            {REACTION_TYPES.map((reaction, index) => (
              <motion.button
                key={reaction.type}
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 10 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.3, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReact(reaction.type)}
                className={`p-2 rounded-full hover:bg-muted/50 transition-colors ${
                  currentReaction === reaction.type ? 'bg-primary/10' : ''
                }`}
                title={reaction.label}
              >
                <span className="text-2xl">{reaction.emoji}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Component to display reaction counts with emojis
export const ReactionDisplay: React.FC<{
  reactionsCount: Record<string, number>;
  onClick?: () => void;
}> = ({ reactionsCount, onClick }) => {
  const totalReactions = Object.values(reactionsCount).reduce((a, b) => a + b, 0);
  
  if (totalReactions === 0) return null;

  const topReactions = Object.entries(reactionsCount)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => REACTION_TYPES.find(r => r.type === type))
    .filter(Boolean) as Reaction[];

  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-1 hover:underline"
    >
      <div className="flex -space-x-1">
        {topReactions.map((reaction) => (
          <span 
            key={reaction.type} 
            className="text-sm bg-background rounded-full p-0.5 shadow-sm"
          >
            {reaction.emoji}
          </span>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{totalReactions}</span>
    </button>
  );
};
