// =====================================================
// FLASH CHALLENGE BANNER - DESAFIO RELÂMPAGO
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Gift, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { FlashChallenge } from '@/types/challenges-v2';
import { calculateTimeRemaining, calculateProgress } from '@/types/challenges-v2';

interface FlashChallengeBannerProps {
  challenge: FlashChallenge;
  userProgress?: number;
  className?: string;
}

export const FlashChallengeBanner: React.FC<FlashChallengeBannerProps> = ({
  challenge,
  userProgress = 0,
  className,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(challenge.ends_at));
  const progress = calculateProgress(userProgress, challenge.target_value);
  const isCompleted = userProgress >= challenge.target_value;

  // Atualizar tempo restante
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(challenge.ends_at));
    }, 60000);
    return () => clearInterval(timer);
  }, [challenge.ends_at]);

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5",
        isCompleted
          ? "bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30"
          : "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-500/10 border border-amber-500/30",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Animated Glow Effect */}
      {!isCompleted && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                isCompleted
                  ? "bg-gradient-to-br from-emerald-500 to-green-500"
                  : "bg-gradient-to-br from-amber-500 to-orange-500"
              )}
              animate={!isCompleted ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">Desafio Relâmpago</h3>
                {!isCompleted && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse">
                    AO VIVO
                  </span>
                )}
              </div>
              <p className={cn(
                "text-sm",
                isCompleted ? "text-emerald-400" : "text-amber-400"
              )}>
                <Clock className="w-3 h-3 inline mr-1" />
                {isCompleted ? "Completado!" : `Expira em ${timeRemaining}`}
              </p>
            </div>
          </div>

          {/* Reward Badge */}
          <motion.div
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1.5",
              isCompleted
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            )}
            animate={!isCompleted ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">
              {isCompleted ? "Completo!" : `+${challenge.xp_reward} XP`}
            </span>
          </motion.div>
        </div>

        {/* Challenge Content */}
        <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-muted/30">
          <span className="text-4xl">{challenge.emoji}</span>
          <div className="flex-1">
            <h4 className="font-semibold">{challenge.title}</h4>
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {userProgress.toLocaleString()} / {challenge.target_value.toLocaleString()} {challenge.unit}
            </span>
          </div>
          
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                isCompleted
                  ? "bg-gradient-to-r from-emerald-500 to-green-400"
                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-background",
                    i === 1 && "bg-purple-500",
                    i === 2 && "bg-blue-500",
                    i === 3 && "bg-green-500"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              <Users className="w-3 h-3 inline mr-1" />
              +47 participando
            </span>
          </div>

          {!isCompleted && (
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Participar Agora
            </Button>
          )}
        </div>

        {/* Completed State */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 py-3"
          >
            <span className="text-xl">✓</span>
            <span className="font-semibold text-emerald-400">Desafio Completado!</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FlashChallengeBanner;
