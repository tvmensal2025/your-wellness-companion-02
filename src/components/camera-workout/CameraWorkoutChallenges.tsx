/**
 * Camera Workout Challenges Component
 * 
 * Displays available camera workout challenges and user progress.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Camera, Trophy, Target, Zap } from 'lucide-react';
import {
  getAvailableCameraWorkoutChallenges,
  joinCameraWorkoutChallenge,
  type CameraWorkoutChallenge,
} from '@/services/camera-workout/challengeIntegration';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChallengeWithProgress extends CameraWorkoutChallenge {
  participation?: {
    id: string;
    progress: number;
    target_value: number;
    is_completed: boolean;
    started_at: string;
  };
}

export function CameraWorkoutChallenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get all camera workout challenges
      const availableChallenges = await getAvailableCameraWorkoutChallenges(user.id);

      // Get user's participations
      const { data: participations } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user.id)
        .in('challenge_id', availableChallenges.map(c => c.id));

      // Merge challenges with participations
      const challengesWithProgress: ChallengeWithProgress[] = availableChallenges.map(challenge => {
        const participation = participations?.find(p => p.challenge_id === challenge.id);
        return {
          ...challenge,
          participation: participation ? {
            id: participation.id,
            progress: participation.progress || 0,
            target_value: participation.target_value || 100,
            is_completed: participation.is_completed || false,
            started_at: participation.started_at || '',
          } : undefined,
        };
      });

      setChallenges(challengesWithProgress);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os desafios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const success = await joinCameraWorkoutChallenge(user.id, challengeId);
      
      if (success) {
        toast({
          title: 'Desafio Aceito! 🎯',
          description: 'Você entrou no desafio. Boa sorte!',
        });
        await loadChallenges();
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível entrar no desafio',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível entrar no desafio',
        variant: 'destructive',
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'hard':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Camera className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Desafios de Treino com Câmera</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map(challenge => {
          const participation = challenge.participation;
          const progressPercentage = participation
            ? Math.min(100, (participation.progress / participation.target_value) * 100)
            : 0;

          return (
            <Card key={challenge.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-foreground">{challenge.title}</CardTitle>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {getDifficultyLabel(challenge.difficulty)}
                  </Badge>
                </div>
                <CardDescription className="text-muted-foreground">
                  {challenge.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Challenge Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {challenge.target_reps && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>{challenge.target_reps} reps</span>
                    </div>
                  )}
                  {challenge.target_sessions && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span>{challenge.target_sessions} sessões</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span>{challenge.points_reward} pts</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>{challenge.xp_reward} XP</span>
                  </div>
                </div>

                {/* Progress or Join Button */}
                {participation ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium text-foreground">
                        {participation.progress} / {participation.target_value}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    {participation.is_completed && (
                      <Badge className="w-full justify-center bg-green-500/10 text-green-500 border-green-500/20">
                        ✓ Completo
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => handleJoinChallenge(challenge.id)}
                    className="w-full"
                    variant="default"
                  >
                    Aceitar Desafio
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum desafio disponível no momento
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
