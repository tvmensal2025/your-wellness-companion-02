// ============================================
// 💬 USE EXERCISE FEEDBACK
// Lógica de feedback de dificuldade do exercício
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type DifficultyFeedback = 'facil' | 'medio' | 'dificil';

interface UseExerciseFeedbackProps {
  isOpen: boolean;
  exerciseId: string;
  exerciseName: string;
  expectedDifficulty: string;
}

export function useExerciseFeedback({
  isOpen,
  exerciseId,
  exerciseName,
  expectedDifficulty,
}: UseExerciseFeedbackProps) {
  const { toast } = useToast();
  const [userFeedback, setUserFeedback] = useState<DifficultyFeedback | null>(null);
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  // Load existing feedback
  useEffect(() => {
    if (!isOpen || !exerciseId) return;
    
    const loadFeedback = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('user_exercise_feedback')
          .select('perceived_difficulty')
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId)
          .maybeSingle();

        if (data?.perceived_difficulty) {
          setUserFeedback(data.perceived_difficulty as DifficultyFeedback);
        }
      } catch (error) {
        console.error('Error loading feedback:', error);
      }
    };
    
    loadFeedback();
  }, [isOpen, exerciseId]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setUserFeedback(null);
    }
  }, [isOpen]);

  const saveFeedback = useCallback(async (perceived: DifficultyFeedback) => {
    if (!exerciseId || feedbackSaving) return;
    
    setFeedbackSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_exercise_feedback')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          exercise_name: exerciseName,
          perceived_difficulty: perceived,
          expected_difficulty: expectedDifficulty,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,exercise_id' });

      if (error) throw error;
      
      setUserFeedback(perceived);
      toast({ 
        title: 'Feedback registrado!', 
        description: 'Obrigado por nos ajudar a personalizar seu treino.',
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: 'Erro ao salvar feedback',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setFeedbackSaving(false);
    }
  }, [exerciseId, exerciseName, expectedDifficulty, feedbackSaving, toast]);

  return {
    userFeedback,
    feedbackSaving,
    saveFeedback,
  };
}

export type ExerciseFeedbackReturn = ReturnType<typeof useExerciseFeedback>;
