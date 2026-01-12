// =====================================================
// INDIVIDUAL CHALLENGE CARD - CARD DE DESAFIO INDIVIDUAL
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Clock, Trophy, Zap, Users, 
  ChevronRight, Play, CheckCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { IndividualChallenge, IndividualParticipation } from '@/types/challenges-v2';
import { 
  CATEGORY_CONFIG, 
  DIFFICULTY_CONFIG, 
  calculateProgress,
  calculateTimeRemaining 
} from '@/types/challenges-v2';
import { useJoinChallenge } from '@/hooks/challenges/useChallengesV2';

interface IndividualChallengeCardProps {
  challenge: IndividualChallenge;
  participation?: IndividualParticipation;
  className?: string;
}

export const IndividualChallengeCard: React.FC<IndividualChallengeCardProps> = ({
  challenge,
  participation,
  className,
}) => {
  const joinChallenge = useJoinChallenge();
  
  // Usar challenge_type (coluna real do banco) em vez de category
  const category = CATEGORY_CONFIG[challenge.challenge_type] || CATEGORY_CONFIG.exercicio;
  const difficulty = DIFFICULTY_CONFIG[challenge.difficulty] || DIFFICULTY_CONFIG.medium;
  
  const isParticipating = !!participation;
  const isCompleted = participation?.is_completed || false;
  const targetValue = participation?.target_value || challenge.target_value || challenge.daily_log_target || 100;
  const progress = participation 
    ? calculateProgress(participation.progress, targetValue)
    : 0;

  const handleJoin = async () => {
    await joinChallenge.mutateAsync(challenge.id);
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-card border border-border/50",
        "hover:border-primary/30 hover:shadow-lg transition-all duration-300",
        isCompleted && "border-green-500/50 bg-green-500/5",
        className
      )}
      whileHover={{ scale: 1.01 }}
    >
      {/* Completed Overlay */}
      {isCompleted && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-green-500 text-white gap-1">
            <CheckCircle className="w-3 h-3" />
            Completo
          </Badge>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <motion.div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0",
              `bg-gradient-to-br ${category.color}`
            )}
            whileHover={{ rotate: [0, -10, 10, 0] }}
          >
            {category.emoji}
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg line-clamp-1">{challenge.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {challenge.description}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={cn(difficulty.color, "text-white border-0")}>
            {difficulty.emoji} {difficulty.label}
          </Badge>
          
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {challenge.duration_days} dias
          </Badge>
          
          <Badge variant="outline" className="gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            {challenge.xp_reward || challenge.points_reward || 100} XP
          </Badge>
          
          {challenge.combo_enabled && (
            <Badge variant="outline" className="gap-1 text-orange-500 border-orange-500/30">
              🔥 Combo até {challenge.max_combo_multiplier}x
            </Badge>
          )}
        </div>

        {/* Progress (if participating) */}
        {isParticipating && !isCompleted && participation && (
          <div className="mb-4 p-3 rounded-xl bg-muted/30">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">
                {participation.progress} / {targetValue}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {(participation.combo_days || 0) > 0 && (
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-muted-foreground">
                  Streak: {participation.current_streak || 0} dias
                </span>
                <span className="text-orange-400 font-medium">
                  🔥 Combo x{(participation.combo_multiplier || 1).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Completed Stats */}
        {isCompleted && participation && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400 font-medium">Desafio Completado!</p>
                <p className="text-xs text-muted-foreground">
                  Melhor streak: {participation.best_streak || 0} dias
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-400">
                  +{Math.round((challenge.xp_reward || challenge.points_reward || 100) * (participation.combo_multiplier || 1))} XP
                </p>
                <p className="text-xs text-muted-foreground">ganhos</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-2">
          {!isParticipating ? (
            <Button
              className={cn("flex-1 gap-2", `bg-gradient-to-r ${category.color}`)}
              onClick={handleJoin}
              disabled={joinChallenge.isPending}
            >
              <Play className="w-4 h-4" />
              {joinChallenge.isPending ? "Entrando..." : "Começar Jornada"}
            </Button>
          ) : isCompleted ? (
            <Button variant="outline" className="flex-1 gap-2">
              <Trophy className="w-4 h-4" />
              Ver Conquista
            </Button>
          ) : (
            <>
              <Button variant="outline" className="flex-1 gap-2">
                Atualizar Progresso
              </Button>
              <Button variant="ghost" size="icon">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default IndividualChallengeCard;
