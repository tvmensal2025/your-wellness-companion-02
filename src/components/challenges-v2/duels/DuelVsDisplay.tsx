// =====================================================
// DUEL VS DISPLAY - DISPLAY VISUAL DO DUELO
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DuelVsDisplayProps {
  player1: {
    name: string;
    avatarUrl?: string;
    progress: number;
    isCurrentUser?: boolean;
  };
  player2: {
    name: string;
    avatarUrl?: string;
    progress: number;
  };
  unit?: string;
  className?: string;
}

export const DuelVsDisplay: React.FC<DuelVsDisplayProps> = ({
  player1,
  player2,
  unit = 'pts',
  className,
}) => {
  const isPlayer1Winning = player1.progress > player2.progress;
  const isDraw = player1.progress === player2.progress;

  return (
    <div className={cn("flex items-center justify-between py-4", className)}>
      {/* Player 1 */}
      <PlayerSide
        player={player1}
        unit={unit}
        isWinning={isPlayer1Winning && !isDraw}
        side="left"
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
        
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-2 px-3 py-1 rounded-full text-xs font-medium",
            isPlayer1Winning && "bg-green-500/20 text-green-400",
            !isPlayer1Winning && !isDraw && "bg-red-500/20 text-red-400",
            isDraw && "bg-yellow-500/20 text-yellow-400"
          )}
        >
          {isPlayer1Winning ? "Você lidera! 🎉" : isDraw ? "Empate!" : "Atrás..."}
        </motion.div>
      </div>

      {/* Player 2 */}
      <PlayerSide
        player={player2}
        unit={unit}
        isWinning={!isPlayer1Winning && !isDraw}
        side="right"
      />
    </div>
  );
};

interface PlayerSideProps {
  player: {
    name: string;
    avatarUrl?: string;
    progress: number;
    isCurrentUser?: boolean;
  };
  unit: string;
  isWinning: boolean;
  side: 'left' | 'right';
}

const PlayerSide: React.FC<PlayerSideProps> = ({ player, unit, isWinning, side }) => {
  const isLeft = side === 'left';
  
  return (
    <div className="text-center">
      <motion.div
        className={cn(
          "w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center",
          player.isCurrentUser
            ? "bg-gradient-to-br from-green-500 to-emerald-400"
            : "bg-gradient-to-br from-red-500 to-orange-400",
          isWinning && "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background"
        )}
        animate={isWinning ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {player.avatarUrl ? (
          <Avatar className="w-14 h-14">
            <AvatarImage src={player.avatarUrl} />
            <AvatarFallback>{player.name[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <span className="text-2xl">{player.isCurrentUser ? "😎" : "🔥"}</span>
        )}
      </motion.div>
      
      <p className="font-bold text-sm">{player.name}</p>
      
      <motion.p
        className={cn(
          "text-2xl font-bold",
          player.isCurrentUser ? "text-green-400" : "text-red-400"
        )}
        key={player.progress}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
      >
        {player.progress.toLocaleString()}
      </motion.p>
      
      <p className="text-xs text-muted-foreground">{unit}</p>
    </div>
  );
};

export default DuelVsDisplay;
