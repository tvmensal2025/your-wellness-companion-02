import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client-fixed';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;

      return { success: true, data };
      
    } catch (error) {
      console.error('Erro no login Google:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, isLoading };
};
