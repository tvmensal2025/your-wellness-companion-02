// =====================================================
// POWERUP CARD - CARD INDIVIDUAL DE POWER-UP
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { PowerupType } from '@/types/challenges-v2';
import { POWERUP_CONFIG } from '@/types/challenges-v2';

interface PowerupCardProps {
  type: PowerupType;
  quantity: number;
  onUse?: () => void;
  disabled?: boolean;
  className?: string;
}

export const PowerupCard: React.FC<PowerupCardProps> = ({
  type,
  quantity,
  onUse,
  disabled,
  className,
}) => {
  const config = POWERUP_CONFIG[type];
  if (!config) return null;

  return (
    <motion.div
      className={cn(
        "p-4 rounded-xl border",
        `bg-gradient-to-br ${config.color}`,
        "bg-opacity-10",
        className
      )}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
            `bg-gradient-to-br ${config.color}`
          )}
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {config.emoji}
        </motion.div>
        
        <div className="flex-1">
          <h4 className="font-bold">{config.name}</h4>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-bold">x{quantity}</p>
          {onUse && (
            <Button
              size="sm"
              variant="outline"
              onClick={onUse}
              disabled={disabled || quantity <= 0}
              className="mt-1"
            >
              Usar
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PowerupCard;
