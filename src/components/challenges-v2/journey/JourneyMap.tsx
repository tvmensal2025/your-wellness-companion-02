// =====================================================
// JOURNEY MAP - MAPA VISUAL DA JORNADA
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Swords, Trophy, Lock } from 'lucide-react';

interface Checkpoint {
  day: number;
  completed: boolean;
  isBoss: boolean;
  isCurrent: boolean;
}

interface JourneyMapProps {
  checkpoints: Checkpoint[];
  className?: string;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ checkpoints, className }) => {
  const completedCount = checkpoints.filter(c => c.completed).length;
  const progressPercent = (completedCount / checkpoints.length) * 100;

  return (
    <div className={cn("relative py-6", className)}>
      {/* Linha de conexão (background) */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted rounded-full -translate-y-1/2" />
      
      {/* Linha de progresso (preenchida) */}
      <motion.div
        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full -translate-y-1/2"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Checkpoints */}
      <div className="relative flex justify-between">
        {checkpoints.map((checkpoint, index) => (
          <CheckpointNode
            key={checkpoint.day}
            checkpoint={checkpoint}
            index={index}
            isLast={index === checkpoints.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

interface CheckpointNodeProps {
  checkpoint: Checkpoint;
  index: number;
  isLast: boolean;
}

const CheckpointNode: React.FC<CheckpointNodeProps> = ({ checkpoint, index, isLast }) => {
  const { day, completed, isBoss, isCurrent } = checkpoint;

  // Determinar estilo baseado no estado
  const getNodeStyle = () => {
    if (completed) {
      return "bg-green-500 text-white shadow-lg shadow-green-500/30";
    }
    if (isCurrent) {
      if (isBoss) {
        return "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 animate-pulse";
      }
      return "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30";
    }
    return "bg-muted text-muted-foreground";
  };

  // Determinar ícone
  const getIcon = () => {
    if (completed) return <Check className="w-4 h-4" />;
    if (isLast) return <Trophy className="w-4 h-4" />;
    if (isBoss) return <Swords className="w-4 h-4" />;
    if (!completed && !isCurrent) return <Lock className="w-3 h-3" />;
    return <span className="text-xs font-bold">{day}</span>;
  };

  // Determinar label
  const getLabel = () => {
    if (isLast) return "Final";
    if (isBoss) return "BOSS";
    return `Dia ${day}`;
  };

  // XP do checkpoint
  const getXP = () => {
    if (isLast) return "+500 XP";
    if (isBoss) return "+150 XP";
    if (completed) return "+50 XP";
    return "";
  };

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.1 }}
    >
      {/* Node */}
      <motion.div
        className={cn(
          "flex items-center justify-center rounded-full transition-all",
          isBoss || isLast ? "w-14 h-14" : "w-12 h-12",
          getNodeStyle(),
          !completed && !isCurrent && "opacity-50"
        )}
      >
        {getIcon()}
      </motion.div>

      {/* Label */}
      <span className={cn(
        "text-xs mt-2 transition-colors",
        isCurrent && isBoss ? "text-orange-400 font-bold" : 
        isCurrent ? "text-blue-400 font-medium" :
        completed ? "text-green-400" : "text-muted-foreground"
      )}>
        {getLabel()}
      </span>

      {/* XP */}
      <span className={cn(
        "text-xs",
        completed ? "text-green-400" : 
        isCurrent ? "text-orange-300" : "text-muted-foreground/50"
      )}>
        {getXP()}
      </span>

      {/* Tooltip on hover */}
      {isBoss && isCurrent && (
        <motion.div
          className="absolute -top-8 bg-orange-500 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Meta especial hoje!
        </motion.div>
      )}
    </motion.div>
  );
};

export default JourneyMap;
