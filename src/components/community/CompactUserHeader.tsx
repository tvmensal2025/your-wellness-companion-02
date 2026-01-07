import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompactUserHeaderProps {
  userName: string;
  userPosition: number;
  totalPoints: number;
  streakDays: number;
}

const formatUserName = (name: string) => {
  if (!name) return 'Usuário';
  const firstName = name.split(' ')[0];
  const formatted = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  return formatted.length > 12 ? formatted.slice(0, 12) + '.' : formatted;
};

export const CompactUserHeader: React.FC<CompactUserHeaderProps> = ({
  userName,
  userPosition,
  totalPoints,
  streakDays,
}) => {
  const isTop3 = userPosition <= 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-2.5 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-xl border border-primary/20 mb-3"
    >
      {/* Left: Avatar + Name */}
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8 border-2 border-primary/30">
          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
            {userName?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm text-foreground">
          {formatUserName(userName)}
        </span>
      </div>
      
      {/* Right: Stats */}
      <div className="flex items-center gap-3">
        {/* Streak */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-medium">{streakDays}</span>
        </div>
        
        {/* Points */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-medium">{totalPoints.toLocaleString()}</span>
        </div>
        
        {/* Ranking Position */}
        <Badge 
          variant={isTop3 ? "default" : "secondary"}
          className={`text-[10px] px-2 py-0.5 ${isTop3 ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
        >
          {isTop3 && <Crown className="w-3 h-3 mr-1" />}
          #{userPosition}
        </Badge>
      </div>
    </motion.div>
  );
};
