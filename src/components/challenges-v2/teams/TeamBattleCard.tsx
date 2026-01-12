// =====================================================
// TEAM BATTLE CARD - BATALHA TIME VS TIME
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Users, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { calculateTimeRemaining, calculateProgress } from '@/types/challenges-v2';

export interface TeamBattle {
  id: string;
  team_a_id: string;
  team_b_id: string;
  challenge_type: string;
  target_value: number;
  unit: string;
  team_a_progress: number;
  team_b_progress: number;
  status: 'pending' | 'active' | 'completed';
  winner_team_id?: string;
  xp_reward: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
  
  // Joined data
  team_a?: {
    id: string;
    name: string;
    avatar_emoji: string;
    color: string;
    member_count?: number;
  };
  team_b?: {
    id: string;
    name: string;
    avatar_emoji: string;
    color: string;
    member_count?: number;
  };
}

interface TeamBattleCardProps {
  battle: TeamBattle;
  currentTeamId?: string;
  className?: string;
}

export const TeamBattleCard: React.FC<TeamBattleCardProps> = ({
  battle,
  currentTeamId,
  className,
}) => {
  const teamA = battle.team_a;
  const teamB = battle.team_b;
  const isMyTeamA = currentTeamId === battle.team_a_id;
  const isMyTeamB = currentTeamId === battle.team_b_id;
  const myTeam = isMyTeamA ? 'A' : isMyTeamB ? 'B' : null;
  
  const totalProgress = battle.team_a_progress + battle.team_b_progress;
  const teamAPercent = totalProgress > 0 
    ? (battle.team_a_progress / totalProgress) * 100 
    : 50;
  const teamBPercent = 100 - teamAPercent;
  
  const isCompleted = battle.status === 'completed';
  const winner = battle.winner_team_id === battle.team_a_id ? 'A' : 
                 battle.winner_team_id === battle.team_b_id ? 'B' : null;

  return (
    <motion.div
      className={cn(
        "rounded-2xl overflow-hidden border bg-card",
        isCompleted && winner === myTeam && "border-green-500/50 bg-green-500/5",
        isCompleted && winner && winner !== myTeam && "border-red-500/50 bg-red-500/5",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-500/20 via-background to-blue-500/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-500" />
            <span className="font-bold">Batalha de Times</span>
          </div>
          {!isCompleted && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {calculateTimeRemaining(battle.ends_at)}
            </div>
          )}
          {isCompleted && (
            <span className="px-2 py-1 text-xs rounded-full bg-muted">
              Finalizada
            </span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          Meta: {battle.target_value.toLocaleString()} {battle.unit}
        </p>
      </div>

      {/* VS Display */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Team A */}
          <div className={cn(
            "flex-1 text-center",
            isMyTeamA && "ring-2 ring-primary rounded-xl p-2"
          )}>
            <div
              className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl mb-2"
              style={{ backgroundColor: `${teamA?.color || '#3B82F6'}30` }}
            >
              {teamA?.avatar_emoji || '👥'}
            </div>
            <p className="font-bold text-sm truncate">{teamA?.name || 'Time A'}</p>
            <p className="text-xs text-muted-foreground">
              {teamA?.member_count || 0} membros
            </p>
            {isMyTeamA && (
              <span className="text-[10px] text-primary">Seu time</span>
            )}
          </div>

          {/* VS */}
          <div className="px-4">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-white font-bold text-sm">VS</span>
            </motion.div>
          </div>

          {/* Team B */}
          <div className={cn(
            "flex-1 text-center",
            isMyTeamB && "ring-2 ring-primary rounded-xl p-2"
          )}>
            <div
              className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl mb-2"
              style={{ backgroundColor: `${teamB?.color || '#EF4444'}30` }}
            >
              {teamB?.avatar_emoji || '👥'}
            </div>
            <p className="font-bold text-sm truncate">{teamB?.name || 'Time B'}</p>
            <p className="text-xs text-muted-foreground">
              {teamB?.member_count || 0} membros
            </p>
            {isMyTeamB && (
              <span className="text-[10px] text-primary">Seu time</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: teamA?.color || '#3B82F6' }}>
              {battle.team_a_progress.toLocaleString()}
            </span>
            <span style={{ color: teamB?.color || '#EF4444' }}>
              {battle.team_b_progress.toLocaleString()}
            </span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden flex">
            <motion.div
              className="h-full"
              style={{ backgroundColor: teamA?.color || '#3B82F6' }}
              initial={{ width: '50%' }}
              animate={{ width: `${teamAPercent}%` }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="h-full"
              style={{ backgroundColor: teamB?.color || '#EF4444' }}
              initial={{ width: '50%' }}
              animate={{ width: `${teamBPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Winner Banner */}
        {isCompleted && winner && (
          <motion.div
            className={cn(
              "p-3 rounded-xl text-center mb-4",
              winner === 'A' 
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20" 
                : "bg-gradient-to-r from-red-500/20 to-orange-500/20"
            )}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <p className="font-bold">
              {winner === 'A' ? teamA?.name : teamB?.name} venceu!
            </p>
            {winner === myTeam && (
              <p className="text-sm text-green-500">+{battle.xp_reward} XP para o time!</p>
            )}
          </motion.div>
        )}

        {/* Reward */}
        <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">Prêmio: <strong>{battle.xp_reward} XP</strong> para o time vencedor</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamBattleCard;
