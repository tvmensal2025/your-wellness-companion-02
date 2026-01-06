// Hook para buscar dados de gênero e idade do perfil para o sistema de exercícios
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AgeGroup = 'jovem' | 'adulto' | 'meia_idade' | 'senior';

export interface ExerciseProfileData {
  gender: string;
  birthDate: string | null;
  age: number | null;
  ageGroup: AgeGroup;
}

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const getAgeGroup = (age: number): AgeGroup => {
  if (age < 31) return 'jovem';
  if (age < 51) return 'adulto';
  if (age < 66) return 'meia_idade';
  return 'senior';
};

export const useExerciseProfileData = (userId: string | undefined) => {
  const [profileData, setProfileData] = useState<ExerciseProfileData>({
    gender: 'nao_informar',
    birthDate: null,
    age: null,
    ageGroup: 'adulto' // default
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('gender, birth_date')
          .eq('user_id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Erro ao buscar perfil para exercícios:', fetchError);
          setError(fetchError.message);
          setIsLoading(false);
          return;
        }

        if (data) {
          const age = data.birth_date ? calculateAge(data.birth_date) : null;
          const ageGroup = age ? getAgeGroup(age) : 'adulto';

          // Mapear gênero do banco para o formato esperado
          let gender = 'nao_informar';
          if (data.gender === 'female' || data.gender === 'feminino') {
            gender = 'feminino';
          } else if (data.gender === 'male' || data.gender === 'masculino') {
            gender = 'masculino';
          }

          setProfileData({
            gender,
            birthDate: data.birth_date,
            age,
            ageGroup
          });
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro ao buscar dados do perfil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profileData, isLoading, error };
};
