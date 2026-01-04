import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Zap, Crown, Target, Flame, Award } from 'lucide-react';
import { useCelebration } from '@/hooks/useCelebration';

interface AchievementPopupProps {
  show: boolean;
  type: 'streak' | 'level' | 'challenge' | 'xp' | 'badge';
  title: string;
  description: string;
  value?: number;
  onClose: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  show,
  type,
  title,
  description,
  value,
  onClose
}) => {
  const { celebrate } = useCelebration();

  React.useEffect(() => {
    if (show) {
      // Trigger celebration based on type
      switch (type) {
        case 'streak':
          celebrate({ type: 'confetti', intensity: 'high' });
          break;
        case 'level':
          celebrate({ type: 'fireworks', intensity: 'high', duration: 4000 });
          break;
        case 'challenge':
          celebrate({ type: 'stars', intensity: 'high' });
          break;
        case 'xp':
          celebrate({ type: 'coins', intensity: 'medium' });
          break;
        case 'badge':
          celebrate({ type: 'stars', intensity: 'medium' });
          break;
      }

      // Auto-close after 5 seconds
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, type, celebrate, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'streak': return <Flame className="h-8 w-8 text-orange-500" />;
      case 'level': return <Crown className="h-8 w-8 text-yellow-500" />;
      case 'challenge': return <Target className="h-8 w-8 text-emerald-500" />;
      case 'xp': return <Zap className="h-8 w-8 text-primary" />;
      case 'badge': return <Award className="h-8 w-8 text-violet-500" />;
      default: return <Trophy className="h-8 w-8 text-amber-500" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'streak': return 'from-orange-500 to-red-500';
      case 'level': return 'from-yellow-500 to-amber-500';
      case 'challenge': return 'from-emerald-500 to-green-500';
      case 'xp': return 'from-violet-500 to-purple-500';
      case 'badge': return 'from-fuchsia-500 to-pink-500';
      default: return 'from-primary to-violet-500';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${getGradient()} blur-2xl opacity-50`} />
            
            <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 text-center shadow-2xl max-w-sm">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
              
              {/* Icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${getGradient()} shadow-2xl`}
              >
                {getIcon()}
              </motion.div>

              {/* Stars decoration */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="absolute top-4 right-4"
              >
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute top-8 left-6"
              >
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </motion.div>

              {/* Content */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                {title}
              </motion.h2>

              {value !== undefined && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${getGradient()} px-4 py-2 mb-3`}
                >
                  <span className="text-2xl font-bold text-white">+{value}</span>
                  {type === 'xp' && <span className="text-white/80">XP</span>}
                  {type === 'streak' && <span className="text-white/80">dias</span>}
                </motion.div>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground"
              >
                {description}
              </motion.p>

              {/* Tap to close */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 text-xs text-muted-foreground/50"
              >
                Toque para fechar
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
