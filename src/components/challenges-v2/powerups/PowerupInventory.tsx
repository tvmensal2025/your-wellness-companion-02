// =====================================================
// POWERUP INVENTORY - INVENTÁRIO DE POWER-UPS
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserPowerup } from '@/types/challenges-v2';
import { POWERUP_CONFIG } from '@/types/challenges-v2';

interface PowerupInventoryProps {
  powerups: UserPowerup[];
  onUsePowerup?: (powerupType: string) => void;
  className?: string;
}

export const PowerupInventory: React.FC<PowerupInventoryProps> = ({
  powerups,
  onUsePowerup,
  className,
}) => {
  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {powerups.map((powerup, index) => {
        const config = POWERUP_CONFIG[powerup.powerup_type];
        if (!config) return null;

        return (
          <motion.div
            key={powerup.id}
            className={cn(
              "text-center p-3 rounded-xl cursor-pointer transition-all",
              `bg-gradient-to-br ${config.color}`,
              "bg-opacity-20 border border-white/10",
              "hover:scale-105 hover:shadow-lg"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={() => onUsePowerup?.(powerup.powerup_type)}
          >
            <span className="text-3xl">{config.emoji}</span>
            <p className="text-xs mt-1 font-medium">{config.name}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
            <p className="text-xs mt-1 font-bold text-primary">x{powerup.quantity}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PowerupInventory;
