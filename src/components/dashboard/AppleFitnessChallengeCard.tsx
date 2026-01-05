import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Play, Check } from 'lucide-react';

interface ChallengeCardProps {
  id: string;
  title: string;
  badgeIcon: string;
  progress: number;
  target: number;
  unit: string;
  pointsReward: number;
  isCompleted: boolean;
  isParticipating: boolean;
  isPublic?: boolean;
  participantsCount?: number;
  difficulty: string;
  onStart: () => void;
  onUpdate: () => void;
}

// Componente de anel de progresso circular estilo Apple Fitness
const ProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}> = ({ progress, size = 56, strokeWidth = 5, color = '#10b981', bgColor = '#e5e7eb' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-foreground">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

const getDifficultyConfig = (difficulty: string) => {
  switch (difficulty) {
    case 'facil':
      return { color: '#10b981', bgColor: '#d1fae5', label: 'Fácil' };
    case 'medio':
      return { color: '#f59e0b', bgColor: '#fef3c7', label: 'Médio' };
    case 'dificil':
      return { color: '#ef4444', bgColor: '#fee2e2', label: 'Difícil' };
    default:
      return { color: '#10b981', bgColor: '#d1fae5', label: 'Fácil' };
  }
};

export const AppleFitnessChallengeCard: React.FC<ChallengeCardProps> = ({
  id,
  title,
  badgeIcon,
  progress,
  target,
  unit,
  pointsReward,
  isCompleted,
  isParticipating,
  isPublic = false,
  participantsCount,
  difficulty,
  onStart,
  onUpdate,
}) => {
  const progressPercent = isParticipating ? Math.min((progress / target) * 100, 100) : 0;
  const difficultyConfig = getDifficultyConfig(difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
        isCompleted
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 ring-2 ring-emerald-400/50'
          : 'bg-card hover:bg-accent/50'
      } shadow-sm hover:shadow-md cursor-pointer`}
      onClick={isParticipating ? onUpdate : undefined}
    >
      <div className="flex items-center gap-4">
        {/* Progress Ring ou Ícone */}
        <div className="flex-shrink-0">
          {isParticipating ? (
            <ProgressRing
              progress={progressPercent}
              color={isCompleted ? '#10b981' : difficultyConfig.color}
              bgColor={isCompleted ? '#d1fae5' : '#e5e7eb'}
            />
          ) : (
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: difficultyConfig.bgColor }}
            >
              {badgeIcon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {title}
            </h3>
            {isCompleted && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {isParticipating ? (
              <>
                <span className="font-medium">
                  {progress}/{target} {unit}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  {pointsReward} pts
                </span>
              </>
            ) : (
              <>
                <span 
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ 
                    backgroundColor: difficultyConfig.bgColor, 
                    color: difficultyConfig.color 
                  }}
                >
                  {difficultyConfig.label}
                </span>
                <span>•</span>
                <span>{target} {unit}/dia</span>
                {isPublic && participantsCount && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {participantsCount}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {!isParticipating ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-shadow"
            >
              <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
            </motion.button>
          ) : !isCompleted ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate();
              }}
              className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              Atualizar
            </motion.button>
          ) : null}
        </div>
      </div>

      {/* Completed overlay glow */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pointer-events-none" />
      )}
    </motion.div>
  );
};

export default AppleFitnessChallengeCard;
