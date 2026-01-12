// =====================================================
// DUEL CARD - CARD DE DUELO 1V1
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Clock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ChallengeDuel } from '@/types/challenges-v2';
import { calculateTimeRemaining, calculateProgress } from '@/types/challenges-v2';

interface DuelCardProps {
  duel: ChallengeDuel;
  currentUserId: string;
  className?: string;
}

export const DuelCard: React.FC<DuelCardProps> = ({ duel, currentUserId, className }) => {
  const isChallenger = duel.challenger_id === currentUserId;
  const myProgress = isChallenger ? duel.challenger_progress : duel.opponent_progress;
  const opponentProgress = isChallenger ? duel.opponent_progress : duel.challenger_progress;
  
  const myProfile = isChallenger ? null : duel.opponent;
  const opponentProfile = isChallenger ? duel.opponent : duel.challenger;
  
  const isWinning = myProgress > opponentProgress;
  const isDraw = myProgress === opponentProgress;
  const timeRemaining = calculateTimeRemaining(duel.ends_at);

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5",
        "bg-gradient-to-br from-purple-500/10 via-background to-pink-500/10",
        "border border-purple-500/30",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      style={{
        boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Swords className="w-5 h-5 text-purple-400" />
          Duelo Ativo
        </h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Termina em {timeRemaining}
        </span>
      </div>

      {/* VS Display */}
      <div className="flex items-center justify-between">
        {/* Você */}
        <PlayerDisplay
          name="Você"
          avatarUrl={undefined}
          progress={myProgress}
          isCurrentUser
          isWinning={isWinning && !isDraw}
        />

        {/* VS */}
        <div className="flex flex-col items-center px-4">
          <motion.div
            className="text-3xl font-black text-purple-400"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            VS
          </motion.div>
          <div className="text-xs text-muted-foreground mt-1">
            {getDuelTypeLabel(duel.challenge_type)}
          </div>
          
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-2 px-3 py-1 rounded-full text-xs font-medium",
              isWinning && "bg-green-500/20 text-green-400",
              !isWinning && !isDraw && "bg-red-500/20 text-red-400",
              isDraw && "bg-yellow-500/20 text-yellow-400"
            )}
          >
            {isWinning ? "Você lidera! 🎉" : isDraw ? "Empate!" : "Atrás..."}
          </motion.div>
        </div>

        {/* Oponente */}
        <PlayerDisplay
          name={opponentProfile?.full_name || "Oponente"}
          avatarUrl={opponentProfile?.avatar_url}
          progress={opponentProgress}
          isWinning={!isWinning && !isDraw}
        />
      </div>

      {/* Prêmio */}
      <div className="mt-4 p-3 bg-purple-500/10 rounded-xl text-center">
        <p className="text-sm text-purple-300 flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4" />
          Prêmio: <span className="font-bold">{duel.xp_reward} XP</span>
          {duel.badge_reward && <span>+ Badge "{duel.badge_reward}"</span>}
        </p>
      </div>
    </motion.div>
  );
};

// Player Display Component
interface PlayerDisplayProps {
  name: string;
  avatarUrl?: string;
  progress: number;
  isCurrentUser?: boolean;
  isWinning?: boolean;
}

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({
  name,
  avatarUrl,
  progress,
  isCurrentUser,
  isWinning,
}) => (
  <div className="text-center">
    <motion.div
      className={cn(
        "w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center",
        isCurrentUser 
          ? "bg-gradient-to-br from-green-500 to-emerald-400"
          : "bg-gradient-to-br from-red-500 to-orange-400",
        isWinning && "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background"
      )}
      animate={isWinning ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      {avatarUrl ? (
        <Avatar className="w-14 h-14">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <span className="text-2xl">{isCurrentUser ? "😎" : "🔥"}</span>
      )}
    </motion.div>
    
    <p className="font-bold text-sm">{name}</p>
    
    <motion.p
      className={cn(
        "text-2xl font-bold",
        isCurrentUser ? "text-green-400" : "text-red-400"
      )}
      key={progress}
      initial={{ scale: 1.2 }}
      animate={{ scale: 1 }}
    >
      {progress.toLocaleString()}
    </motion.p>
    
    <p className="text-xs text-muted-foreground">pontos</p>
  </div>
);

// Helper
function getDuelTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    steps: "Quem anda mais?",
    water: "Quem bebe mais água?",
    exercise: "Quem treina mais?",
    calories: "Quem queima mais?",
  };
  return labels[type] || "Quem vence?";
}

export default DuelCard;
