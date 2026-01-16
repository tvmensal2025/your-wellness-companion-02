// ============================================
// CREATE CHALLENGE DIALOG
// Dialog para criar novo desafio
// ============================================

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Swords, 
  Loader2, 
  Flame, 
  Trophy, 
  Dumbbell, 
  Calendar,
  TrendingUp,
  Plus
} from 'lucide-react';
import { FollowingUser } from '@/hooks/exercise/useFollowingWithStats';
import { EXERCISE_OPTIONS, CHALLENGE_TYPES } from './constants';
import { WeeklyCalendar } from './WeeklyCalendar';

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: FollowingUser | null;
  selectedExercise: string;
  onExerciseChange: (exercise: string) => void;
  challengeType: string;
  onChallengeTypeChange: (type: string) => void;
  targetValue: number;
  onTargetValueChange: (value: number) => void;
  onCreateChallenge: () => void;
  isCreating: boolean;
}

export const CreateChallengeDialog: React.FC<CreateChallengeDialogProps> = ({
  open,
  onOpenChange,
  selectedUser,
  selectedExercise,
  onExerciseChange,
  challengeType,
  onChallengeTypeChange,
  targetValue,
  onTargetValueChange,
  onCreateChallenge,
  isCreating,
}) => {
  const [showCustomExercise, setShowCustomExercise] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [showCustomType, setShowCustomType] = useState(false);
  const [customTypeName, setCustomTypeName] = useState('');

  const handleExerciseChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomExercise(true);
    } else {
      setShowCustomExercise(false);
      onExerciseChange(value);
    }
  };

  const handleCustomExerciseConfirm = () => {
    if (customExerciseName.trim()) {
      onExerciseChange(`custom:${customExerciseName.trim()}`);
      setShowCustomExercise(false);
    }
  };

  const handleChallengeTypeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomType(true);
    } else {
      setShowCustomType(false);
      onChallengeTypeChange(value);
    }
  };

  const handleCustomTypeConfirm = () => {
    if (customTypeName.trim()) {
      onChallengeTypeChange(`custom:${customTypeName.trim()}`);
      setShowCustomType(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-orange-500" />
            Criar Desafio
          </DialogTitle>
          {selectedUser && (
            <DialogDescription>
              Desafie {selectedUser.name} para um X1!
            </DialogDescription>
          )}
        </DialogHeader>

        {selectedUser && (
          <div className="space-y-4">
            {/* Card do Oponente com Estatísticas Completas */}
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-orange-500/10 rounded-xl border border-purple-500/20">
              {/* Header com Avatar e Nome */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-14 h-14 border-2 border-purple-500/50">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback className="bg-purple-500/20 text-purple-500 text-lg font-bold">
                    {selectedUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-lg">{selectedUser.name}</p>
                  {selectedUser.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{selectedUser.bio}</p>
                  )}
                </div>
              </div>

              {/* Grid de Estatísticas */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="font-bold text-lg">{selectedUser.consecutiveDays}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Dias seguidos</p>
                </div>

                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold text-lg">{selectedUser.weeklyPoints}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Pontos semanais</p>
                </div>

                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                    <Dumbbell className="w-4 h-4" />
                    <span className="font-bold text-lg">{selectedUser.workoutsThisWeek}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Treinos/semana</p>
                </div>

                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold text-lg">{selectedUser.workoutsThisMonth}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Treinos/mês</p>
                </div>
              </div>

              {/* Total de Treinos (destaque) */}
              <div className="mt-3 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span className="font-bold text-2xl text-purple-500">{selectedUser.totalWorkouts}</span>
                </div>
                <p className="text-xs text-muted-foreground">treinos no total</p>
              </div>

              {/* Calendário Semanal de Treinos */}
              {selectedUser.weeklyWorkoutDays && (
                <div className="mt-3 p-3 bg-background/50 rounded-lg">
                  <WeeklyCalendar workoutDays={selectedUser.weeklyWorkoutDays} size="md" />
                </div>
              )}

              {/* Último treino */}
              {selectedUser.lastWorkoutDate && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Último treino: {new Date(selectedUser.lastWorkoutDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            {/* Exercício */}
            <div>
              <label className="text-sm font-medium mb-2 block">Exercício</label>
              {showCustomExercise ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do exercício..."
                    value={customExerciseName}
                    onChange={(e) => setCustomExerciseName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    onClick={handleCustomExerciseConfirm}
                    disabled={!customExerciseName.trim()}
                  >
                    OK
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowCustomExercise(false)}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <Select value={selectedExercise} onValueChange={handleExerciseChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o exercício" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_OPTIONS.map((ex) => (
                      <SelectItem key={ex.value} value={ex.value}>
                        <span className="flex items-center gap-2">
                          <span>{ex.emoji}</span>
                          <span>{ex.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      <span className="flex items-center gap-2 text-purple-500">
                        <Plus className="w-4 h-4" />
                        <span>Criar exercício personalizado</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              {selectedExercise.startsWith('custom:') && (
                <p className="text-xs text-purple-500 mt-1">
                  ✨ Exercício personalizado: {selectedExercise.replace('custom:', '')}
                </p>
              )}
            </div>

            {/* Tipo de desafio */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              {showCustomType ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Quem perder mais peso, Quem correr mais km..."
                    value={customTypeName}
                    onChange={(e) => setCustomTypeName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    onClick={handleCustomTypeConfirm}
                    disabled={!customTypeName.trim()}
                  >
                    OK
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowCustomType(false)}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <Select value={challengeType.startsWith('custom:') ? '' : challengeType} onValueChange={handleChallengeTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o tipo de desafio" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHALLENGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      <span className="flex items-center gap-2 text-purple-500">
                        <Plus className="w-4 h-4" />
                        <span>Criar tipo personalizado</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              {challengeType.startsWith('custom:') && (
                <p className="text-xs text-purple-500 mt-1">
                  ✨ Tipo personalizado: {challengeType.replace('custom:', '')}
                </p>
              )}
            </div>

            {/* Meta (se aplicável) */}
            {challengeType === 'first_to' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Meta de repetições</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onTargetValueChange(Math.max(10, targetValue - 10))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={targetValue}
                    onChange={(e) => onTargetValueChange(Number(e.target.value))}
                    className="text-center text-xl font-bold"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onTargetValueChange(targetValue + 10)}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            {challengeType === 'timed' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Tempo (segundos)</label>
                <div className="flex gap-2">
                  {[30, 60, 90, 120].map((time) => (
                    <Button
                      key={time}
                      variant={targetValue === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onTargetValueChange(time)}
                      className="flex-1"
                    >
                      {time}s
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-red-500"
              onClick={onCreateChallenge}
              disabled={isCreating || !selectedExercise}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Swords className="w-4 h-4 mr-2" />
              )}
              Desafiar!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
