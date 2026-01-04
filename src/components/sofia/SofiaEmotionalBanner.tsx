import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSofiaEmotional } from '@/hooks/useSofiaEmotional';
import { Button } from '@/components/ui/button';

export const SofiaEmotionalBanner: React.FC = () => {
  const { message, dismissed, dismiss, loading } = useSofiaEmotional();
  const navigate = useNavigate();

  if (loading || dismissed || !message) return null;

  const getGradient = () => {
    switch (message.type) {
      case 'celebration':
        return 'from-emerald-500/20 via-green-500/10 to-teal-500/20 border-emerald-500/30';
      case 'alert':
        return 'from-red-500/20 via-orange-500/10 to-amber-500/20 border-red-500/30';
      case 'reminder':
        return 'from-blue-500/20 via-cyan-500/10 to-sky-500/20 border-blue-500/30';
      case 'motivation':
        return 'from-violet-500/20 via-purple-500/10 to-fuchsia-500/20 border-violet-500/30';
      default:
        return 'from-primary/20 via-primary/10 to-violet-500/20 border-primary/30';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getGradient()} border p-4`}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          className="absolute right-2 top-2 p-1.5 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="relative flex items-start gap-3">
          {/* Sofia Avatar */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
          >
            <span className="text-2xl">{message.emoji}</span>
          </motion.div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground">{message.title}</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{message.message}</p>
            
            {message.action && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs"
                onClick={() => {
                  navigate(message.action!.route);
                  dismiss();
                }}
              >
                {message.action.label}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Sofia signature */}
        <div className="absolute bottom-1 right-3 flex items-center gap-1 text-[10px] text-muted-foreground/50">
          <span>Sofia</span>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
