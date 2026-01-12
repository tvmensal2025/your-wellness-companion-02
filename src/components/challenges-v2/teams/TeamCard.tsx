// =====================================================
// TEAM CARD - CARD DE TIME/CLÃ
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ChallengeTeam, TeamChallenge } from '@/types/challenges-v2';
import { calculateProgress } from '@/types/challenges-v2';

interface TeamCardProps {
  team: ChallengeTeam;
  activeChallenge?: TeamChallenge;
  currentUserId: string;
  className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  activeChallenge,
  currentUserId,
  className,
}) => {
  const progress = activeChallenge 
    ? calculateProgress(activeChallenge.current_progress, activeChallenge.target_value)
    : 0;

  return (
    <motion.div
      className={cn(
        "rounded-2xl p-5 border",
        "bg-gradient-to-br from-blue-500/10 via-background to-purple-500/10",
        className
      )}
      style={{ borderColor: `${team.color}50` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${team.color}30` }}
          >
            {team.avatar_emoji}
          </div>
          <div>
            <h3 className="font-bold">Desafio de Time</h3>
            <p className="text-sm" style={{ color: team.color }}>
              {team.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Posição</p>
          <p className="text-xl font-bold" style={{ color: team.color }}>
            #{team.current_rank || '?'}
          </p>
        </div>
      </div>

      {/* Active Challenge */}
      {activeChallenge && (
        <div className="p-4 rounded-xl bg-muted/30 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">
              Meta coletiva: {activeChallenge.title}
            </span>
            <span className="font-bold" style={{ color: team.color }}>
              {activeChallenge.current_progress.toLocaleString()}{activeChallenge.unit}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${team.color}, #8B5CF6)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      )}

      {/* Member Contributions */}
      {activeChallenge?.contributions && (
        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground">Contribuição dos membros</p>
          {activeChallenge.contributions.slice(0, 4).map((contribution, index) => {
            const memberProgress = calculateProgress(
              contribution.contribution_value,
              activeChallenge.target_value
            );
            const isCurrentUser = contribution.user_id === currentUserId;
            const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
            
            return (
              <div key={contribution.user_id} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs",
                  colors[index % colors.length]
                )}>
                  {isCurrentUser ? '😎' : contribution.profile?.full_name?.[0] || '?'}
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", colors[index % colors.length])}
                    style={{ width: `${memberProgress}%` }}
                  />
                </div>
                <span className={cn(
                  "text-xs",
                  isCurrentUser ? "text-purple-400" : "text-muted-foreground"
                )}>
                  {contribution.contribution_value.toLocaleString()}{activeChallenge.unit}
                  {isCurrentUser && " (você)"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Chat Button */}
      <Button
        variant="outline"
        className="w-full gap-2"
        style={{ borderColor: `${team.color}50`, color: team.color }}
      >
        <MessageCircle className="w-4 h-4" />
        Chat do Time
      </Button>
    </motion.div>
  );
};

export default TeamCard;
