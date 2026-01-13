// ============================================
// 🤖 AI ENHANCED TIMER
// Timer com recursos de IA integrados
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Heart,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedTimer, type UnifiedTimerProps } from './UnifiedTimer';

// ============================================
// TYPES
// ============================================

interface AIRecommendation {
  type: 'rest_adjustment' | 'intensity' | 'swap' | 'encouragement';
  message: string;
  action?: {
    label: string;
    value: number | string;
  };
  priority: 'low' | 'medium' | 'high';
}

interface AIEnhancedTimerProps extends UnifiedTimerProps {
  // AI Features
  aiEnabled?: boolean;
  userFatigueLevel?: number; // 1-10
  userHeartRate?: number;
  exerciseCode?: string;
  setNumber?: number;
  
  // Gamification
  showPoints?: boolean;
  pointsForCompletion?: number;
  streakDays?: number;
  
  // Callbacks
  onAIRecommendationAccept?: (recommendation: AIRecommendation) => void;
  onAIRecommendationReject?: (recommendation: AIRecommendation) => void;
  onFeedback?: (rating: 'easy' | 'good' | 'hard') => void;
}

// ============================================
// AI RECOMMENDATION ENGINE (Local)
// ============================================

function generateAIRecommendation(
  fatigueLevel: number,
  heartRate: number | undefined,
  setNumber: number,
  defaultRestTime: number
): AIRecommendation | null {
  // Alta fadiga - sugerir mais descanso
  if (fatigueLevel >= 7) {
    const extraRest = Math.round(defaultRestTime * 0.3);
    return {
      type: 'rest_adjustment',
      message: `Detectamos fadiga elevada. Que tal +${extraRest}s de descanso?`,
      action: { label: `+${extraRest}s`, value: extraRest },
      priority: 'high',
    };
  }

  // Frequência cardíaca alta
  if (heartRate && heartRate > 160) {
    return {
      type: 'rest_adjustment',
      message: 'Sua frequência cardíaca está alta. Descanse um pouco mais.',
      action: { label: '+30s', value: 30 },
      priority: 'high',
    };
  }

  // Baixa fadiga após várias séries - pode reduzir descanso
  if (fatigueLevel <= 3 && setNumber >= 3) {
    const lessRest = Math.round(defaultRestTime * 0.2);
    return {
      type: 'rest_adjustment',
      message: `Você está bem! Pode reduzir ${lessRest}s do descanso.`,
      action: { label: `-${lessRest}s`, value: -lessRest },
      priority: 'low',
    };
  }

  // Mensagens motivacionais aleatórias
  const motivationalMessages = [
    { message: '💪 Você está arrasando! Continue assim!', priority: 'low' as const },
    { message: '🔥 Sua consistência está impressionante!', priority: 'low' as const },
    { message: '⚡ Energia positiva detectada!', priority: 'low' as const },
  ];

  if (Math.random() > 0.7) {
    const msg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    return {
      type: 'encouragement',
      message: msg.message,
      priority: msg.priority,
    };
  }

  return null;
}

// ============================================
// COMPONENT
// ============================================

export const AIEnhancedTimer: React.FC<AIEnhancedTimerProps> = ({
  aiEnabled = true,
  userFatigueLevel = 5,
  userHeartRate,
  exerciseCode,
  setNumber = 1,
  showPoints = true,
  pointsForCompletion = 10,
  streakDays,
  onAIRecommendationAccept,
  onAIRecommendationReject,
  onFeedback,
  seconds: defaultSeconds = 60,
  onComplete,
  ...timerProps
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [adjustedTime, setAdjustedTime] = useState(defaultSeconds);
  const [recommendationDismissed, setRecommendationDismissed] = useState(false);

  // Generate AI recommendation
  useEffect(() => {
    if (!aiEnabled || recommendationDismissed) return;

    const rec = generateAIRecommendation(
      userFatigueLevel,
      userHeartRate,
      setNumber,
      defaultSeconds
    );
    setRecommendation(rec);
  }, [aiEnabled, userFatigueLevel, userHeartRate, setNumber, defaultSeconds, recommendationDismissed]);

  // Handle recommendation accept
  const handleAcceptRecommendation = () => {
    if (!recommendation) return;

    if (recommendation.action && typeof recommendation.action.value === 'number') {
      const actionValue = recommendation.action.value as number;
      setAdjustedTime(prev => Math.max(15, prev + actionValue));
    }

    onAIRecommendationAccept?.(recommendation);
    setRecommendation(null);
    setRecommendationDismissed(true);
  };

  // Handle recommendation reject
  const handleRejectRecommendation = () => {
    if (!recommendation) return;
    onAIRecommendationReject?.(recommendation);
    setRecommendation(null);
    setRecommendationDismissed(true);
  };

  // Handle timer complete
  const handleComplete = () => {
    setShowFeedback(true);
    // Delay actual completion to show feedback
    setTimeout(() => {
      onComplete?.();
    }, 100);
  };

  // Handle feedback
  const handleFeedback = (rating: 'easy' | 'good' | 'hard') => {
    onFeedback?.(rating);
    setShowFeedback(false);
  };

  // Priority colors
  const priorityColors = {
    low: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    medium: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
    high: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
  };

  return (
    <div className="space-y-3">
      {/* AI Header */}
      {aiEnabled && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-muted-foreground">
              IA Ativa
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Heart Rate */}
            {userHeartRate && (
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                <span className="text-xs font-mono">{userHeartRate} bpm</span>
              </div>
            )}
            
            {/* Fatigue Level */}
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-mono">Fadiga: {userFatigueLevel}/10</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendation Card */}
      <AnimatePresence>
        {recommendation && !recommendationDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className={cn(
              "rounded-lg border p-3",
              priorityColors[recommendation.priority]
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {recommendation.priority === 'high' ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{recommendation.message}</p>
                
                {recommendation.action && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleAcceptRecommendation}
                      className="h-7 text-xs"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {recommendation.action.label}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRejectRecommendation}
                      className="h-7 text-xs"
                    >
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      Ignorar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Timer */}
      <UnifiedTimer
        {...timerProps}
        seconds={adjustedTime}
        onComplete={handleComplete}
      />

      {/* Points & Gamification */}
      {showPoints && (
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              +{pointsForCompletion} pts
            </span>
          </div>
          
          {streakDays && streakDays > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                {streakDays} dias
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3 bg-muted/50 rounded-lg"
          >
            <p className="text-sm text-center mb-2 text-muted-foreground">
              Como foi o descanso?
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFeedback('easy')}
                className="h-8"
              >
                😊 Fácil
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFeedback('good')}
                className="h-8"
              >
                👍 Bom
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFeedback('hard')}
                className="h-8"
              >
                😤 Difícil
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIEnhancedTimer;
