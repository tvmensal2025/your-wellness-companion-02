import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy, Award, Star, Crown } from 'lucide-react';

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
        bgColor: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
        borderColor: 'border-yellow-500/50',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        icon: Crown,
      };
    case 'epic':
      return {
        bgColor: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple-500/50',
        textColor: 'text-purple-600 dark:text-purple-400',
        icon: Trophy,
      };
    case 'rare':
      return {
        bgColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-500/50',
        textColor: 'text-blue-600 dark:text-blue-400',
        icon: Award,
      };
    default: // common
      return {
        bgColor: 'bg-muted/50',
        borderColor: 'border-muted',
        textColor: 'text-muted-foreground',
        icon: Star,
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
      <div className={`flex items-center gap-1.5 ${className}`}>
        {displayAchievements.map((achievement) => {
          const config = getRarityConfig(achievement.rarity);
          const IconComponent = config.icon;

          return (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>
                <div
                  className={`
                    w-7 h-7 rounded-full 
                    ${config.bgColor} 
                    border ${config.borderColor}
                    flex items-center justify-center
                    cursor-pointer
                    hover:scale-110 transition-transform
                    ${config.textColor}
                  `}
                >
                  {achievement.icon ? (
                    <span className="text-xs">{achievement.icon}</span>
                  ) : (
                    <IconComponent className="w-3.5 h-3.5" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="font-semibold text-xs">{achievement.name}</p>
                {achievement.description && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {achievement.description}
                  </p>
                )}
                {achievement.rarity && (
                  <p className="text-[10px] text-muted-foreground mt-1 capitalize">
                    {achievement.rarity}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {achievements.length > maxDisplay && (
          <div className="w-7 h-7 rounded-full bg-muted/30 border border-muted flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">
              +{achievements.length - maxDisplay}
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

