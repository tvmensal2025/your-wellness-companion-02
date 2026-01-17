/**
 * Camera Workout Challenge Integration
 * 
 * Integrates camera workout sessions with the existing challenges system.
 * Creates specific challenges for camera-based exercises and tracks progress.
 */

import { supabase } from '@/integrations/supabase/client';

export interface CameraWorkoutChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'camera_workout';
  difficulty: 'easy' | 'medium' | 'hard';
  target_reps?: number;
  target_sessions?: number;
  target_form_score?: number;
  duration_days: number;
  points_reward: number;
  xp_reward: number;
}

/**
 * Pre-defined camera workout challenges
 */
export const CAMERA_WORKOUT_CHALLENGES: Omit<CameraWorkoutChallenge, 'id'>[] = [
  {
    title: '🎯 Primeiro Treino com Câmera',
    description: 'Complete seu primeiro treino usando a câmera com pelo menos 10 repetições',
    challenge_type: 'camera_workout',
    difficulty: 'easy',
    target_reps: 10,
    target_sessions: 1,
    duration_days: 7,
    points_reward: 100,
    xp_reward: 50,
  },
  {
    title: '💪 Mestre do Agachamento',
    description: 'Complete 100 agachamentos com boa forma (score >= 80)',
    challenge_type: 'camera_workout',
    difficulty: 'medium',
    target_reps: 100,
    target_form_score: 80,
    duration_days: 14,
    points_reward: 300,
    xp_reward: 150,
  },
  {
    title: '🔥 Sequência de 7 Dias',
    description: 'Treine com a câmera por 7 dias consecutivos',
    challenge_type: 'camera_workout',
    difficulty: 'medium',
    target_sessions: 7,
    duration_days: 7,
    points_reward: 500,
    xp_reward: 250,
  },
  {
    title: '⭐ Forma Perfeita',
    description: 'Complete 50 repetições com score de forma >= 90',
    challenge_type: 'camera_workout',
    difficulty: 'hard',
    target_reps: 50,
    target_form_score: 90,
    duration_days: 30,
    points_reward: 800,
    xp_reward: 400,
  },
  {
    title: '🏆 Campeão do Mês',
    description: 'Complete 20 sessões de treino com câmera em 30 dias',
    challenge_type: 'camera_workout',
    difficulty: 'hard',
    target_sessions: 20,
    duration_days: 30,
    points_reward: 1000,
    xp_reward: 500,
  },
];

/**
 * Initialize camera workout challenges in the database
 */
export async function initializeCameraWorkoutChallenges(): Promise<void> {
  try {
    // Check if challenges already exist
    const { data: existing } = await supabase
      .from('challenges')
      .select('id')
      .eq('challenge_type', 'camera_workout')
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('Camera workout challenges already initialized');
      return;
    }

    // Insert challenges
    const { error } = await supabase
      .from('challenges')
      .insert(
        CAMERA_WORKOUT_CHALLENGES.map(challenge => ({
          ...challenge,
          is_active: true,
          created_at: new Date().toISOString(),
        }))
      );

    if (error) {
      console.error('Error initializing camera workout challenges:', error);
      throw error;
    }

    console.log('Camera workout challenges initialized successfully');
  } catch (error) {
    console.error('Failed to initialize camera workout challenges:', error);
    throw error;
  }
}

/**
 * Update challenge progress after a camera workout session
 */
export async function updateCameraWorkoutChallengeProgress(
  userId: string,
  sessionData: {
    totalReps: number;
    avgFormScore: number;
    exerciseType: string;
  }
): Promise<void> {
  try {
    // Get active camera workout challenges for this user
    const { data: participations, error: fetchError } = await supabase
      .from('challenge_participations')
      .select(`
        id,
        challenge_id,
        progress,
        target_value,
        is_completed,
        challenges!inner (
          challenge_type,
          target_reps,
          target_sessions,
          target_form_score,
          points_reward,
          xp_reward
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', false)
      .eq('challenges.challenge_type', 'camera_workout');

    if (fetchError) {
      console.error('Error fetching challenge participations:', fetchError);
      return;
    }

    if (!participations || participations.length === 0) {
      return;
    }

    // Update progress for each relevant challenge
    for (const participation of participations) {
      const challenge = participation.challenges as any;
      let progressIncrement = 0;
      let shouldUpdate = false;

      // Check if this session contributes to the challenge
      if (challenge.target_form_score && sessionData.avgFormScore < challenge.target_form_score) {
        // Form score doesn't meet requirement, skip
        continue;
      }

      // Calculate progress increment
      if (challenge.target_reps) {
        // Rep-based challenge
        progressIncrement = sessionData.totalReps;
        shouldUpdate = true;
      } else if (challenge.target_sessions) {
        // Session-based challenge
        progressIncrement = 1;
        shouldUpdate = true;
      }

      if (!shouldUpdate) continue;

      const newProgress = (participation.progress || 0) + progressIncrement;
      const targetValue = participation.target_value || challenge.target_reps || challenge.target_sessions || 100;
      const isCompleted = newProgress >= targetValue;

      // Update participation
      const { error: updateError } = await supabase
        .from('challenge_participations')
        .update({
          progress: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', participation.id);

      if (updateError) {
        console.error('Error updating challenge progress:', updateError);
        continue;
      }

      // If completed, award points and XP
      if (isCompleted && !participation.is_completed) {
        await awardChallengeRewards(userId, challenge.points_reward, challenge.xp_reward);
      }
    }
  } catch (error) {
    console.error('Error updating camera workout challenge progress:', error);
  }
}

/**
 * Award points and XP for completing a challenge
 */
async function awardChallengeRewards(
  userId: string,
  points: number,
  xp: number
): Promise<void> {
  try {
    // Update user points
    const { error: pointsError } = await supabase.rpc('add_user_points', {
      p_user_id: userId,
      p_points: points,
      p_source: 'camera_workout_challenge',
    });

    if (pointsError) {
      console.error('Error awarding points:', pointsError);
    }

    // Update user XP
    const { error: xpError } = await supabase.rpc('add_user_xp', {
      p_user_id: userId,
      p_xp: xp,
      p_source: 'camera_workout_challenge',
    });

    if (xpError) {
      console.error('Error awarding XP:', xpError);
    }
  } catch (error) {
    console.error('Error awarding challenge rewards:', error);
  }
}

/**
 * Get available camera workout challenges for a user
 */
export async function getAvailableCameraWorkoutChallenges(
  userId: string
): Promise<CameraWorkoutChallenge[]> {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('challenge_type', 'camera_workout')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching camera workout challenges:', error);
      return [];
    }

    return data as CameraWorkoutChallenge[];
  } catch (error) {
    console.error('Error getting available camera workout challenges:', error);
    return [];
  }
}

/**
 * Join a camera workout challenge
 */
export async function joinCameraWorkoutChallenge(
  userId: string,
  challengeId: string
): Promise<boolean> {
  try {
    // Get challenge details
    const { data: challenge, error: fetchError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (fetchError || !challenge) {
      console.error('Error fetching challenge:', fetchError);
      return false;
    }

    // Create participation
    const { error: insertError } = await supabase
      .from('challenge_participations')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        target_value: challenge.target_reps || challenge.target_sessions || 100,
        started_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error joining challenge:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error joining camera workout challenge:', error);
    return false;
  }
}
