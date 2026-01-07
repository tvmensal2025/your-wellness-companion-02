import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy, Award, Star, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  description?: string;
  earned_at?: string;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  maxDisplay?: number;
  className?: string;
}

const getRarityConfig = (rarity?: string) => {
  switch (rarity) {
    case 'legendary':
      return {
        bgGradient: 'from-primary via-primary/80 to-primary/60',
        borderColor: 'border-primary/50',
        textColor: 'text-primary-foreground',
        shadowColor: 'shadow-primary/20',
        icon: Crown,
        label: 'Lendário'
      };
    case 'epic':
      return {
        bgGradient: 'from-secondary via-secondary/80 to-secondary/60',
        borderColor: 'border-secondary/50',
        textColor: 'text-secondary-foreground',
        shadowColor: 'shadow-secondary/20',
        icon: Trophy,
        label: 'Épico'
      };
    case 'rare':
      return {
        bgGradient: 'from-primary/80 via-primary/60 to-primary/40',
        borderColor: 'border-primary/40',
        textColor: 'text-primary-foreground',
        shadowColor: 'shadow-primary/15',
        icon: Award,
        label: 'Raro'
      };
    default: // common
      return {
        bgGradient: 'from-muted-foreground/80 via-muted-foreground/60 to-muted-foreground/40',
        borderColor: 'border-muted/50',
        textColor: 'text-background',
        shadowColor: 'shadow-muted/10',
        icon: Star,
        label: 'Comum'
      };
  }
};

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ 
  achievements, 
  maxDisplay = 3,
  className = '' 
}) => {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  const displayAchievements = achievements.slice(0, maxDisplay);

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {displayAchievements.map((achievement, index) => {
          const config = getRarityConfig(achievement.rarity);
          const IconComponent = config.icon;

          return (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: index * 0.1, 
                    type: "spring", 
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.3 }
                  }}
                  className={`
                    relative w-9 h-9 rounded-full 
                    bg-gradient-to-br ${config.bgGradient}
                    border-2 ${config.borderColor}
                    flex items-center justify-center
                    cursor-pointer
                    shadow-lg ${config.shadowColor}
                    ${config.textColor}
                    group/badge
                  `}
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover/badge:opacity-40 blur-md transition-opacity duration-300`} />
                  
                  {/* Sparkle effect on legendary - subtle pulse instead of rotation */}
                  {achievement.rarity === 'legendary' && (
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-0.5 -right-0.5"
                    >
                      <Sparkles className="w-3 h-3 text-primary" />
                    </motion.div>
                  )}
                  
                  {/* Icon */}
                  <div className="relative z-10">
                    {achievement.icon ? (
                      <span className="text-sm">{achievement.icon}</span>
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="max-w-[220px] bg-popover/95 backdrop-blur-sm border border-border shadow-xl"
              >
                <div className="flex items-start gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.bgGradient} flex items-center justify-center ${config.textColor} shadow-md`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-foreground">{achievement.name}</p>
                    {achievement.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {achievement.description}
                      </p>
                    )}
                    <div className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gradient-to-r ${config.bgGradient} ${config.textColor}`}>
                      <IconComponent className="w-2.5 h-2.5" />
                      {config.label}
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {/* More achievements indicator */}
        {achievements.length > maxDisplay && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: maxDisplay * 0.1 }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-muted/60 to-muted/30 border-2 border-muted/50 flex items-center justify-center shadow-md backdrop-blur-sm"
          >
            <span className="text-xs text-muted-foreground font-bold">
              +{achievements.length - maxDisplay}
            </span>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
};
