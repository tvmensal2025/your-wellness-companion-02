// =====================================================
// JOURNEY CARD - CARD DE JORNADA ÉPICA
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { IndividualParticipation } from '@/types/challenges-v2';
import { CATEGORY_CONFIG, calculateProgress } from '@/types/challenges-v2';
import { JourneyMap } from './JourneyMap';
import { ChallengeProgressModal } from '../individual/ChallengeProgressModal';

interface JourneyCardProps {
  participation: IndividualParticipation;
  className?: string;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({ participation, className }) => {
  const [showProgressModal, setShowProgressModal] = useState(false);
  
  const challenge = participation.challenge;
  if (!challenge) return null;

  // Usar challenge_type (coluna real do banco) em vez de category
  const category = CATEGORY_CONFIG[challenge.challenge_type] || CATEGORY_CONFIG.exercicio;
  
  // Usar target_value da participação ou do desafio, com fallback para daily_log_target
  const targetValue = participation.target_value || challenge.target_value || challenge.daily_log_target || 100;
  const progress = calculateProgress(participation.progress, targetValue);
  const comboMultiplier = participation.combo_multiplier || 1;
  const comboDays = participation.combo_days || 0;

  // Simular checkpoints da jornada (7 dias)
  const totalDays = challenge.duration_days || 7;
  const currentDay = Math.min(Math.ceil((participation.progress / targetValue) * totalDays), totalDays);
  const bossDays = [5, 7]; // Dias com boss

  const checkpoints = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    completed: i + 1 <= currentDay,
    isBoss: bossDays.includes(i + 1),
    isCurrent: i + 1 === currentDay + 1,
  }));

  // Determinar unidade baseada no tipo de desafio
  const getUnit = () => {
    if (challenge.daily_log_unit) return challenge.daily_log_unit;
    if (challenge.challenge_type === 'hidratacao') return 'ml';
    if (challenge.challenge_type === 'passos') return 'passos';
    return 'un';
  };

  return (
    <>
      <motion.div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-gradient-to-br from-background to-muted/30",
          "border-2 border-transparent",
          "hover:border-primary/30 transition-all duration-300",
          className
        )}
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.9)), linear-gradient(135deg, ${category.color.replace('from-', '').replace(' to-', ', ')})`,
        }}
        whileHover={{ scale: 1.01 }}
      >
        {/* Gradient Border Effect */}
        <div className={cn(
          "absolute inset-0 rounded-2xl p-[2px]",
          `bg-gradient-to-br ${category.color}`,
          "opacity-50"
        )} />
        
        <div className="relative bg-background/95 dark:bg-background/80 rounded-[14px] p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
                  `bg-gradient-to-br ${category.color}`
                )}
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                {category.emoji}
              </motion.div>
              <div>
                <h3 className="font-bold text-lg line-clamp-1">{challenge.title}</h3>
                <p className="text-muted-foreground text-sm">
                  Jornada de {totalDays} dias
                </p>
              </div>
            </div>
            
            {/* Combo Badge */}
            {comboDays > 0 && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Combo</div>
                <div className="text-xl font-bold text-orange-400 flex items-center gap-1">
                  <Flame className="w-5 h-5" />
                  x{comboMultiplier.toFixed(1)}
                </div>
              </div>
            )}
          </div>

          {/* Journey Map */}
          <JourneyMap checkpoints={checkpoints} />

          {/* Progress Section */}
          <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso de Hoje</span>
              <span className="text-sm font-bold">
                {participation.progress} / {targetValue} {getUnit()}
              </span>
            </div>
            
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("absolute inset-y-0 left-0 rounded-full", `bg-gradient-to-r ${category.color}`)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setShowProgressModal(true)}
              >
                <Plus className="w-4 h-4" />
                Adicionar Progresso
              </Button>
              
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Tempo restante</p>
                <p className="text-sm font-bold text-orange-400">
                  <Clock className="w-3 h-3 inline mr-1" />
                  8h 32min
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-green-500">✓</span>
                <span>{currentDay} dias</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{participation.current_streak || 0} streak</span>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              Ver Detalhes
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Modal de Progresso */}
      <ChallengeProgressModal
        open={showProgressModal}
        onOpenChange={setShowProgressModal}
        participation={participation}
      />
    </>
  );
};

export default JourneyCard;
