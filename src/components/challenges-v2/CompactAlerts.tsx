// =====================================================
// COMPACT ALERTS - Alertas Compactos (Sino)
// Evento Sazonal e Flash Challenge em formato mini
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, Clock, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { FlashChallenge, SeasonalEvent } from '@/types/challenges-v2';
import { calculateTimeRemaining } from '@/types/challenges-v2';

interface CompactAlertsProps {
  flashChallenge?: FlashChallenge | null;
  seasonalEvent?: SeasonalEvent | null;
  className?: string;
}

export const CompactAlerts: React.FC<CompactAlertsProps> = ({
  flashChallenge,
  seasonalEvent,
  className,
}) => {
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const hasAlerts = !!flashChallenge || !!seasonalEvent;

  if (!hasAlerts) return null;

  return (
    <>
      {/* Compact Alert Bar */}
      <div className={cn("flex gap-2", className)}>
        {/* Flash Challenge Mini */}
        {flashChallenge && (
          <motion.button
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-all"
            onClick={() => setShowFlashModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 2 }}
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>
            <div className="text-left">
              <p className="text-xs font-bold text-amber-400">⚡ RELÂMPAGO</p>
              <p className="text-[10px] text-muted-foreground">
                {calculateTimeRemaining(flashChallenge.ends_at)}
              </p>
            </div>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full animate-pulse">
              AO VIVO
            </span>
          </motion.button>
        )}

        {/* Seasonal Event Mini */}
        {seasonalEvent && (
          <motion.button
            className="flex items-center gap-2 px-3 py-2 rounded-full border hover:border-primary/50 transition-all"
            style={{ 
              backgroundColor: `${seasonalEvent.primary_color}15`,
              borderColor: `${seasonalEvent.primary_color}30`
            }}
            onClick={() => setShowEventModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: `${seasonalEvent.primary_color}30` }}
            >
              {seasonalEvent.emoji}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold" style={{ color: seasonalEvent.primary_color }}>
                EVENTO
              </p>
              <p className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                {seasonalEvent.name.split(' ').slice(0, 2).join(' ')}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}
      </div>

      {/* Flash Challenge Modal */}
      <Dialog open={showFlashModal} onOpenChange={setShowFlashModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block">Desafio Relâmpago</span>
                <span className="text-xs font-normal text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Expira em {calculateTimeRemaining(flashChallenge?.ends_at || '')}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {flashChallenge && (
            <div className="space-y-4 mt-2">
              {/* Challenge Info */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{flashChallenge.emoji}</span>
                  <div>
                    <h3 className="font-bold">{flashChallenge.title}</h3>
                    <p className="text-sm text-muted-foreground">{flashChallenge.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Meta:</span>
                  <span className="font-bold">
                    {flashChallenge.target_value.toLocaleString()} {flashChallenge.unit}
                  </span>
                </div>
              </div>

              {/* Reward */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Recompensa</span>
                </div>
                <span className="font-bold text-yellow-500">
                  +{flashChallenge.xp_reward} XP ({flashChallenge.bonus_multiplier}x bônus!)
                </span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Seu progresso</span>
                  <span>0 / {flashChallenge.target_value.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                </div>
              </div>

              {/* Action */}
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                ⚡ Participar Agora
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Seasonal Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${seasonalEvent?.primary_color}30` }}
              >
                {seasonalEvent?.emoji}
              </div>
              <div>
                <span className="block">{seasonalEvent?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Evento Especial
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {seasonalEvent && (
            <div className="space-y-4 mt-2">
              {/* Event Info */}
              <div 
                className="p-4 rounded-xl border"
                style={{ 
                  backgroundColor: `${seasonalEvent.primary_color}10`,
                  borderColor: `${seasonalEvent.primary_color}30`
                }}
              >
                <p className="text-sm text-muted-foreground mb-3">
                  {seasonalEvent.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Termina em:</span>
                  <span className="font-bold" style={{ color: seasonalEvent.primary_color }}>
                    {calculateTimeRemaining(seasonalEvent.ends_at)}
                  </span>
                </div>
              </div>

              {/* Rewards */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Recompensas Exclusivas
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {(seasonalEvent.exclusive_rewards as any[])?.map((reward, i) => (
                    <div 
                      key={i}
                      className="text-center p-3 rounded-xl"
                      style={{ backgroundColor: `${seasonalEvent.primary_color}15` }}
                    >
                      <span className="text-2xl">{reward.icon || '🎁'}</span>
                      <p className="text-xs mt-1 truncate">{reward.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="flex justify-between text-sm mb-1">
                  <span>Seu progresso</span>
                  <span className="font-bold">0/{seasonalEvent.total_challenges} desafios</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full w-0 rounded-full"
                    style={{ backgroundColor: seasonalEvent.primary_color }}
                  />
                </div>
              </div>

              {/* Action */}
              <Button 
                className="w-full"
                style={{ backgroundColor: seasonalEvent.primary_color }}
              >
                Ver Desafios do Evento
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompactAlerts;
