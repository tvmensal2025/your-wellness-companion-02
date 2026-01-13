import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Gift, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Reward {
  type: 'xp' | 'coins' | 'badge' | 'boost';
  value: number;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic';
}

interface DailyRewardChestProps {
  canClaim: boolean;
  streak: number;
  onClaim: (reward: Reward) => void;
}

const POSSIBLE_REWARDS: Reward[] = [
  { type: 'xp', value: 25, name: '+25 XP', icon: '⚡', rarity: 'common' },
  { type: 'xp', value: 50, name: '+50 XP', icon: '⚡', rarity: 'common' },
  { type: 'xp', value: 100, name: '+100 XP', icon: '💫', rarity: 'rare' },
  { type: 'xp', value: 250, name: '+250 XP', icon: '🌟', rarity: 'epic' },
  { type: 'coins', value: 10, name: '+10 Moedas', icon: '🪙', rarity: 'common' },
  { type: 'coins', value: 25, name: '+25 Moedas', icon: '🪙', rarity: 'common' },
  { type: 'coins', value: 50, name: '+50 Moedas', icon: '💰', rarity: 'rare' },
  { type: 'coins', value: 100, name: '+100 Moedas', icon: '💎', rarity: 'epic' },
  { type: 'boost', value: 2, name: '2x XP (1h)', icon: '🚀', rarity: 'rare' },
  { type: 'boost', value: 3, name: '3x XP (1h)', icon: '🔥', rarity: 'epic' },
];

const RARITY_WEIGHTS = {
  common: 60,
  rare: 30,
  epic: 10,
};

const RARITY_COLORS = {
  common: 'from-slate-400 to-slate-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-pink-500',
};

export const DailyRewardChest: React.FC<DailyRewardChestProps> = ({
  canClaim,
  streak,
  onClaim
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const [showReward, setShowReward] = useState(false);

  // Aumentar chances de recompensas melhores com streak
  const getRandomReward = (): Reward => {
    const streakBonus = Math.min(streak * 2, 20); // Até 20% de bônus
    const adjustedWeights = {
      common: Math.max(RARITY_WEIGHTS.common - streakBonus, 30),
      rare: RARITY_WEIGHTS.rare + streakBonus / 2,
      epic: RARITY_WEIGHTS.epic + streakBonus / 2,
    };

    const total = adjustedWeights.common + adjustedWeights.rare + adjustedWeights.epic;
    const random = Math.random() * total;

    let rarity: 'common' | 'rare' | 'epic';
    if (random < adjustedWeights.common) {
      rarity = 'common';
    } else if (random < adjustedWeights.common + adjustedWeights.rare) {
      rarity = 'rare';
    } else {
      rarity = 'epic';
    }

    const possibleRewards = POSSIBLE_REWARDS.filter(r => r.rarity === rarity);
    return possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
  };

  const handleOpenChest = async () => {
    if (!canClaim || isOpening) return;

    setIsOpening(true);

    // Animação de abertura
    await new Promise(resolve => setTimeout(resolve, 1500));

    const selectedReward = getRandomReward();
    setReward(selectedReward);
    setShowReward(true);

    // Confetti para recompensas raras/épicas
    if (selectedReward.rarity !== 'common') {
      const colors = selectedReward.rarity === 'epic' 
        ? ['#a855f7', '#ec4899', '#f472b6']
        : ['#3b82f6', '#60a5fa', '#93c5fd'];
      
      confetti({
        particleCount: selectedReward.rarity === 'epic' ? 100 : 50,
        spread: 70,
        origin: { y: 0.6 },
        colors
      });
    }

    onClaim(selectedReward);
    setIsOpening(false);
  };

  const closeRewardModal = () => {
    setShowReward(false);
    setReward(null);
  };

  return (
    <>
      <Card className={cn(
        "border-0 shadow-lg overflow-hidden transition-all",
        canClaim 
          ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30" 
          : "bg-muted/30 opacity-60"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={canClaim ? { 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                } : {}}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                className={cn(
                  "p-3 rounded-xl",
                  canClaim 
                    ? "bg-gradient-to-br from-amber-500 to-yellow-500" 
                    : "bg-muted"
                )}
              >
                <Gift className={cn(
                  "w-6 h-6",
                  canClaim ? "text-white" : "text-muted-foreground"
                )} />
              </motion.div>
              <div>
                <p className="font-semibold">Baú Diário</p>
                <p className="text-xs text-muted-foreground">
                  {canClaim 
                    ? `🔥 Streak ${streak}x aumenta suas chances!` 
                    : 'Volte amanhã para mais recompensas'}
                </p>
              </div>
            </div>

            <Button
              onClick={handleOpenChest}
              disabled={!canClaim || isOpening}
              className={cn(
                "relative overflow-hidden",
                canClaim && "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              )}
            >
              {isOpening ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  {canClaim ? 'Abrir!' : 'Resgatado'}
                </>
              )}
            </Button>
          </div>

          {/* Prévia das possíveis recompensas */}
          {canClaim && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-amber-500/20"
            >
              <p className="text-xs text-muted-foreground mb-2">Possíveis recompensas:</p>
              <div className="flex gap-2 flex-wrap">
                {['⚡ XP', '🪙 Moedas', '🚀 Boost'].map((item) => (
                  <span 
                    key={item}
                    className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Recompensa */}
      <AnimatePresence>
        {showReward && reward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={closeRewardModal}
          >
            <motion.div
              initial={{ scale: 0.5, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className={cn(
                "relative w-full max-w-xs p-6 rounded-3xl text-white text-center",
                "bg-gradient-to-br shadow-2xl",
                RARITY_COLORS[reward.rarity]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeRewardModal}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30"
              >
                <X className="w-4 h-4" />
              </button>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-6xl mb-4"
              >
                {reward.icon}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm opacity-80 mb-1">Você ganhou:</p>
                <h2 className="text-2xl font-bold mb-2">{reward.name}</h2>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  "bg-white/20 backdrop-blur-sm capitalize"
                )}>
                  {reward.rarity === 'common' ? 'Comum' : reward.rarity === 'rare' ? 'Raro' : 'Épico'}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4"
              >
                <Button
                  onClick={closeRewardModal}
                  className="w-full bg-white/20 hover:bg-white/30 text-white"
                >
                  Incrível! 🎉
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DailyRewardChest;
