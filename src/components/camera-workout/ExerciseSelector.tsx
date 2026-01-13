/**
 * 🏋️ ExerciseSelector - Seletor de exercícios para treino com câmera
 * Validates: Requirements 11.3, 11.7
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ExerciseType } from '@/types/camera-workout';
import { EXERCISE_NAMES_PT } from '@/types/camera-workout';

interface ExerciseOption {
  type: ExerciseType;
  icon: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  muscleGroups: string[];
  isAvailable: boolean;
}

const EXERCISES: ExerciseOption[] = [
  {
    type: 'squat',
    icon: '🦵',
    description: 'Fortalece pernas e glúteos',
    difficulty: 'easy',
    muscleGroups: ['Quadríceps', 'Glúteos', 'Core'],
    isAvailable: true,
  },
  {
    type: 'pushup',
    icon: '💪',
    description: 'Trabalha peito, ombros e tríceps',
    difficulty: 'medium',
    muscleGroups: ['Peito', 'Ombros', 'Tríceps'],
    isAvailable: true,
  },
  {
    type: 'situp',
    icon: '🔥',
    description: 'Fortalece abdômen',
    difficulty: 'easy',
    muscleGroups: ['Abdômen', 'Core'],
    isAvailable: true,
  },
  {
    type: 'plank',
    icon: '🧘',
    description: 'Isometria para core completo',
    difficulty: 'medium',
    muscleGroups: ['Core', 'Ombros', 'Glúteos'],
    isAvailable: true,
  },
  {
    type: 'lunge',
    icon: '🚶',
    description: 'Trabalha pernas unilateralmente',
    difficulty: 'medium',
    muscleGroups: ['Quadríceps', 'Glúteos', 'Equilíbrio'],
    isAvailable: false,
  },
  {
    type: 'jumping_jack',
    icon: '⭐',
    description: 'Cardio e coordenação',
    difficulty: 'easy',
    muscleGroups: ['Cardio', 'Corpo inteiro'],
    isAvailable: false,
  },
];

const DIFFICULTY_COLORS = {
  easy: 'bg-green-500/10 text-green-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  hard: 'bg-red-500/10 text-red-500',
};

const DIFFICULTY_LABELS = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

interface ExerciseSelectorProps {
  selectedExercise?: ExerciseType;
  onSelect: (exercise: ExerciseType) => void;
  showUnavailable?: boolean;
}

export function ExerciseSelector({
  selectedExercise,
  onSelect,
  showUnavailable = true,
}: ExerciseSelectorProps) {
  const availableExercises = showUnavailable 
    ? EXERCISES 
    : EXERCISES.filter(e => e.isAvailable);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {availableExercises.map((exercise) => (
        <Card
          key={exercise.type}
          className={cn(
            "cursor-pointer transition-all duration-200",
            "hover:shadow-md hover:scale-[1.02]",
            selectedExercise === exercise.type && "ring-2 ring-primary",
            !exercise.isAvailable && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => exercise.isAvailable && onSelect(exercise.type)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Ícone */}
              <div className="text-4xl">{exercise.icon}</div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">
                    {EXERCISE_NAMES_PT[exercise.type]}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", DIFFICULTY_COLORS[exercise.difficulty])}
                  >
                    {DIFFICULTY_LABELS[exercise.difficulty]}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  {exercise.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {exercise.muscleGroups.map((muscle) => (
                    <Badge 
                      key={muscle} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {muscle}
                    </Badge>
                  ))}
                </div>

                {!exercise.isAvailable && (
                  <p className="text-xs text-muted-foreground mt-2">
                    🔒 Em breve
                  </p>
                )}
              </div>

              {/* Indicador de seleção */}
              {selectedExercise === exercise.type && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm">✓</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Versão compacta do seletor
 */
export function ExerciseSelectorCompact({
  selectedExercise,
  onSelect,
}: ExerciseSelectorProps) {
  const availableExercises = EXERCISES.filter(e => e.isAvailable);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {availableExercises.map((exercise) => (
        <button
          key={exercise.type}
          onClick={() => onSelect(exercise.type)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "border transition-all whitespace-nowrap",
            selectedExercise === exercise.type
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background hover:bg-muted border-border"
          )}
        >
          <span>{exercise.icon}</span>
          <span className="text-sm font-medium">
            {EXERCISE_NAMES_PT[exercise.type]}
          </span>
        </button>
      ))}
    </div>
  );
}
