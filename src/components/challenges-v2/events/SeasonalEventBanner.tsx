// =====================================================
// SEASONAL EVENT BANNER - BANNER DE EVENTO SAZONAL
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Gift, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { SeasonalEvent } from '@/types/challenges-v2';
import { calculateTimeRemaining } from '@/types/challenges-v2';

interface SeasonalEventBannerProps {
  event: SeasonalEvent;
  userProgress?: number;
  className?: string;
}

export const SeasonalEventBanner: React.FC<SeasonalEventBannerProps> = ({
  event,
  userProgress = 0,
  className,
}) => {
  const timeRemaining = calculateTimeRemaining(event.ends_at);
  const progressPercent = (userProgress / event.total_challenges) * 100;

  return (
    <motion.div
      className={cn("relative overflow-hidden rounded-2xl", className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${event.primary_color}40, ${event.secondary_color}30)`,
        }}
      />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{event.emoji}</span>
              <span
                className="px-2 py-0.5 text-xs rounded-full font-medium"
                style={{ backgroundColor: `${event.primary_color}30`, color: event.primary_color }}
              >
                EVENTO ESPECIAL
              </span>
            </div>
            <h3 className="font-bold text-xl">{event.name}</h3>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Termina em</p>
            <p className="text-lg font-bold" style={{ color: event.primary_color }}>
              {timeRemaining}
            </p>
          </div>
        </div>

        {/* Exclusive Rewards */}
        <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm mb-4">
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <Gift className="w-3 h-3" />
            Recompensas Exclusivas
          </p>
          <div className="flex items-center gap-4">
            {event.exclusive_rewards.slice(0, 4).map((reward, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-1"
                  style={{
                    background: `linear-gradient(135deg, ${event.primary_color}, ${event.secondary_color})`,
                  }}
                >
                  {reward.icon || '🎁'}
                </div>
                <p className="text-xs">{reward.name}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Seu progresso no evento</span>
          <span className="text-sm font-bold">{userProgress}/{event.total_challenges} desafios</span>
        </div>
        <div className="h-3 bg-background/30 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${event.primary_color}, ${event.secondary_color})`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        {/* CTA */}
        <Button
          className="w-full"
          style={{
            background: `linear-gradient(90deg, ${event.primary_color}, ${event.secondary_color})`,
          }}
        >
          Ver Desafios do Evento
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default SeasonalEventBanner;
