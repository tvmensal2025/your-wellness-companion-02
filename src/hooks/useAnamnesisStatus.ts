import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAnamnesisStatusProps {
  userId?: string;
}

export const useAnamnesisStatus = (props?: UseAnamnesisStatusProps) => {
  const [hasCompletedAnamnesis, setHasCompletedAnamnesis] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const checkAnamnesisStatus = async (userId: string) => {
      // Avoid duplicate checks for the same user
      if (currentUserIdRef.current === userId && hasCheckedRef.current) {
        return;
      }

      try {
        currentUserIdRef.current = userId;
        hasCheckedRef.current = true;

        const { data: anamnesis, error } = await supabase
          .from('user_anamnesis')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar anamnese:', error);
          setHasCompletedAnamnesis(false);
        } else {
          setHasCompletedAnamnesis(!!anamnesis);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao verificar anamnese:', error);
        setHasCompletedAnamnesis(false);
        setIsLoading(false);
      }
    };

    // If userId is provided via props, use it directly
    if (props?.userId) {
      checkAnamnesisStatus(props.userId);
      return;
    }

    // Only fetch user if not provided via props
    const fetchUserAndCheck = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          checkAnamnesisStatus(user.id);
        } else {
          setHasCompletedAnamnesis(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
        setHasCompletedAnamnesis(false);
        setIsLoading(false);
      }
    };

    fetchUserAndCheck();
  }, [props?.userId]);

  const refetch = async () => {
    hasCheckedRef.current = false;
    currentUserIdRef.current = null;
    setIsLoading(true);

    const userId = props?.userId;
    if (userId) {
      const { data: anamnesis, error } = await supabase
        .from('user_anamnesis')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error) {
        setHasCompletedAnamnesis(!!anamnesis);
      }
      setIsLoading(false);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: anamnesis, error } = await supabase
          .from('user_anamnesis')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error) {
          setHasCompletedAnamnesis(!!anamnesis);
        }
      }
      setIsLoading(false);
    }
  };

  return { hasCompletedAnamnesis, isLoading, refetch };
};
