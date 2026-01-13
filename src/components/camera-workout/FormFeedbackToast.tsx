/**
 * 💬 FormFeedbackToast - Toast de feedback de forma
 */

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lightbulb, PartyPopper, X } from 'lucide-react';

interface FormFeedbackToastProps {
  message: string;
  type: 'tip' | 'warning' | 'celebration';
  onDismiss?: () => void;
  duration?: number;
}

export function FormFeedbackToast({
  message,
  type,
  onDismiss,
  duration = 3000,
}: FormFeedbackToastProps) {
  useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss, message]);

  const config = {
    tip: {
      icon: Lightbulb,
      bg: 'bg-blue-500/90',
      border: 'border-blue-400',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-500/90',
      border: 'border-amber-400',
    },
    celebration: {
      icon: PartyPopper,
      bg: 'bg-emerald-500/90',
      border: 'border-emerald-400',
    },
  };

  const { icon: Icon, bg, border } = config[type];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.9 }}
      className={cn(
        "absolute bottom-24 left-4 right-4 mx-auto max-w-sm",
        "rounded-xl p-4 backdrop-blur-md shadow-lg",
        "border-2",
        bg,
        border
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-white font-medium flex-1 text-sm">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
