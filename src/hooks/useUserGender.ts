import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useUserGender = (user: User | null) => {
  const [gender, setGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserGender();
    } else {
      setLoading(false);
      setGender(null);
    }
  }, [user?.id]);

  const loadUserGender = async () => {
    if (!user?.id) {
      setLoading(false);
      setGender(null);
      return;
    }

    try {
      setLoading(true);
      
      // Tentar buscar da tabela profiles primeiro
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .limit(1);

      const profile = profileData?.[0];

      if (!profileError && profile?.gender) {
        console.log('Gênero encontrado no perfil:', profile.gender);
        setGender(profile.gender);
        return;
      }

      // Se não encontrou na tabela profiles, tentar user_physical_data
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .select('sexo')
        .eq('user_id', user.id)
        .limit(1);

      const physical = physicalData?.[0];

      if (!physicalError && physical?.sexo) {
        console.log('Gênero encontrado em user_physical_data:', physical.sexo);
        setGender(physical.sexo);
        return;
      }

      // Se não encontrou em nenhuma tabela, usar metadata do usuário
      const userGender = user.user_metadata?.gender;
      if (userGender) {
        setGender(userGender);
        return;
      }

      // Padrão neutro se não encontrar
      console.log('Gênero não encontrado, usando padrão neutro');
      setGender(null); // Não definir padrão, deixar o usuário escolher
    } catch (error) {
      console.error('Erro ao carregar gênero do usuário:', error);
      setGender('neutral');
    } finally {
      setLoading(false);
    }
  };

  return { gender, loading };
}; 