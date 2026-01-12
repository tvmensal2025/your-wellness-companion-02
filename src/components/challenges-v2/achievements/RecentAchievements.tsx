// =====================================================
// RECENT ACHIEVEMENTS - CONQUISTAS RECENTES
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserAchievementV2 } from '@/types/challenges-v2';

interface RecentAchievementsProps {
  userId: string | undefined;
  limit?: number;
  className?: string;
}

export const RecentAchievements: React.FC<RecentAchievementsProps> = ({
  userId,
  limit = 3,
  className,
}) => {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('user_achievements_v2')
          .select('*')
          .eq('user_id', userId)
          .order('achieved_at', { ascending: false })
          .limit(limit);
        
        if (error) {
          console.warn('Achievements table may not exist:', error.message);
          return [];
        }
        return data as UserAchievementV2[];
      } catch (e) {
        console.warn('Error fetching achievements:', e);
        return [];
      }
    },
    enabled: !!userId,
  });

  // Mock data para demonstração
  const mockAchievements = [
    {
      id: '1',
      title: 'Streak de 7 dias!',
      description: 'Hidratação Diária',
      icon: '🔥',
      xp_earned: 100,
      achieved_at: new Date().toISOString(),
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: '2',
      title: 'Desafio Completado',
      description: '10.000 Passos',
      icon: '✓',
      xp_earned: 250,
      achieved_at: new Date(Date.now() - 86400000).toISOString(),
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: '3',
      title: 'Duelo Vencido!',
      description: 'vs João Pedro',
      icon: '⚔️',
      xp_earned: 200,
      achieved_at: new Date(Date.now() - 172800000).toISOString(),
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const displayAchievements = achievements?.length ? achievements : mockAchievements;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {displayAchievements.map((achievement, index) => (
        <AchievementRow
          key={achievement.id}
          achievement={achievement}
          index={index}
        />
      ))}
    </div>
  );
};

interface AchievementRowProps {
  achievement: any;
  index: number;
}

const AchievementRow: React.FC<AchievementRowProps> = ({ achievement, index }) => {
  const timeAgo = getTimeAgo(achievement.achieved_at);
  const color = achievement.color || 'from-blue-500 to-cyan-500';

  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl",
        `bg-gradient-to-r ${color}`,
        "bg-opacity-10 border border-white/10"
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center text-xl",
        `bg-gradient-to-br ${color}`
      )}>
        {achievement.icon}
      </div>
      
      <div className="flex-1">
        <p className="font-medium text-sm">{achievement.title}</p>
        <p className="text-xs text-muted-foreground">{achievement.description}</p>
      </div>
      
      <div className="text-right">
        <p className="text-xs text-primary font-medium">+{achievement.xp_earned} XP</p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </motion.div>
  );
};

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return `${diffDays} dias`;
}

export default RecentAchievements;
