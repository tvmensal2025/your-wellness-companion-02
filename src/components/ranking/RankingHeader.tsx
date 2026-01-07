import { motion } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

export function RankingHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border border-primary/20 p-4 sm:p-6"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.5, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ 
              duration: 3 + i, 
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center gap-4">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
        >
          <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Ranking da Comunidade
            </h2>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </motion.div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Top 10 membros mais engajados da semana
          </p>
        </div>
      </div>
    </motion.div>
  );
}
