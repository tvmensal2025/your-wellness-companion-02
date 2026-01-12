// =====================================================
// EVENT CHALLENGE LIST - LISTA DE DESAFIOS DO EVENTO
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SeasonalEvent } from '@/types/challenges-v2';

interface EventChallengeListProps {
  event: SeasonalEvent;
  completedChallenges?: string[];
  className?: string;
}

// Mock event challenges
const mockEventChallenges = [
  { id: '1', day: 1, title: '1.000 passos', emoji: '👟', xp: 50, isBonus: false },
  { id: '2', day: 2, title: '2L de água', emoji: '💧', xp: 50, isBonus: false },
  { id: '3', day: 3, title: '30min exercício', emoji: '🏃', xp: 75, isBonus: false },
  { id: '4', day: 4, title: 'Refeição saudável', emoji: '🥗', xp: 50, isBonus: false },
  { id: '5', day: 5, title: '5.000 passos', emoji: '👟', xp: 100, isBonus: true },
  { id: '6', day: 6, title: 'Meditação', emoji: '🧘', xp: 50, isBonus: false },
  { id: '7', day: 7, title: 'Desafio Final', emoji: '🏆', xp: 200, isBonus: true },
];

export const EventChallengeList: React.FC<EventChallengeListProps> = ({
  event,
  completedChallenges = [],
  className,
}) => {
  const today = new Date();
  const eventStart = new Date(event.starts_at);
  const currentDay = Math.floor((today.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className={cn("space-y-3", className)}>
      {mockEventChallenges.map((challenge, index) => {
        const isCompleted = completedChallenges.includes(challenge.id);
        const isAvailable = challenge.day <= currentDay;
        const isCurrent = challenge.day === currentDay && !isCompleted;

        return (
          <motion.div
            key={challenge.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              isCompleted && "bg-green-500/10 border-green-500/30",
              isCurrent && "bg-primary/10 border-primary/30 ring-2 ring-primary/20",
              !isAvailable && "opacity-50",
              isAvailable && !isCompleted && !isCurrent && "bg-muted/30 border-border/50"
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Day Badge */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              isCompleted && "bg-green-500",
              isCurrent && "bg-primary",
              !isAvailable && "bg-muted",
              isAvailable && !isCompleted && !isCurrent && "bg-muted"
            )}>
              {isCompleted ? (
                <Check className="w-5 h-5 text-white" />
              ) : !isAvailable ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <span className="text-lg">{challenge.emoji}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "font-medium text-sm",
                  isCompleted && "text-green-500",
                  isCurrent && "text-primary"
                )}>
                  Dia {challenge.day}: {challenge.title}
                </p>
                {challenge.isBonus && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isCompleted ? 'Completado!' : isAvailable ? 'Disponível' : `Libera no dia ${challenge.day}`}
              </p>
            </div>

            {/* XP */}
            <div className={cn(
              "text-right",
              isCompleted && "text-green-500",
              challenge.isBonus && !isCompleted && "text-yellow-500"
            )}>
              <p className="font-bold text-sm">+{challenge.xp}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default EventChallengeList;
