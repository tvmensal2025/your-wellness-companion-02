import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ExercisePreferences {
  level: string;
  experience: string;
  time: string;
  frequency: string;
  location: string;
  goal: string;
  limitation: string;
  bodyFocus: string;
  specialCondition: string;
  selectedDays: string[];
  trainingSplit: string;
  exercisesPerDay: string;
  completedAt: string;
}

export const useExercisePreferences = (userId: string | undefined) => {
  const [preferences, setPreferences] = useState<ExercisePreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('user_id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Erro ao buscar preferências de exercício:', fetchError);
          setError(fetchError.message);
          setIsLoading(false);
          return;
        }

        if (data?.preferences?.exercise) {
          setPreferences(data.preferences.exercise as ExercisePreferences);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro ao buscar preferências de exercício');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  const hasCompletedOnboarding = preferences?.completedAt != null;

  return { 
    preferences, 
    hasCompletedOnboarding,
    isLoading, 
    error 
  };
};