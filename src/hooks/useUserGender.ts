import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { getUserDataFromCache } from './useUserDataCache';

export const useUserGender = (user: User | null) => {
  const [gender, setGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setGender(null);
      return;
    }

    // Tenta obter do cache centralizado primeiro (sem network request)
    const cachedData = getUserDataFromCache();
    
    if (cachedData?.profile?.gender) {
      setGender(cachedData.profile.gender);
      setLoading(false);
      return;
    }

    if (cachedData?.physicalData?.sexo) {
      setGender(cachedData.physicalData.sexo);
      setLoading(false);
      return;
    }

    // Fallback para user_metadata
    const userGender = user.user_metadata?.gender;
    if (userGender) {
      setGender(userGender);
      setLoading(false);
      return;
    }

    // Padrão neutro se não encontrar
    setGender(null);
    setLoading(false);
  }, [user?.id]);

  return { gender, loading };
};