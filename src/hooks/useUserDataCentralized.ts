import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook centralizado de dados de usuário
 * 
 * Substitui múltiplos hooks que buscavam os mesmos dados:
 * - useUserProfile
 * - usePhysicalData
 * - useUserPoints
 * - useUserXP
 * - useUserStreak
 * 
 * Melhorias:
 * - Single roundtrip com Promise.all
 * - Cache otimizado (10 min staleTime)
 * - enabled para evitar queries desnecessárias
 */

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  gender: string | null;
  birth_date: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  updated_at: string;
}

interface UserPhysicalData {
  id: string;
  user_id: string;
  altura_cm: number | null;
  idade: number | null;
  sexo: string | null;
  nivel_atividade: string | null;
  created_at: string;
  updated_at: string;
}

interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  current_streak: number;
  best_streak: number;
  last_activity_date: string | null;
  level: number;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  id: string;
  user_id: string;
  sidebar_order: string[] | null;
  hidden_sidebar_items: string[] | null;
  hidden_dashboard_cards: string[] | null;
  dashboard_cards_order: string[] | null;
  default_section: string | null;
  created_at: string;
  updated_at: string;
}

export interface CentralizedUserData {
  profile: UserProfile | null;
  physicalData: UserPhysicalData | null;
  points: UserPoints | null;
  preferences: UserPreferences | null;
  // Dados derivados
  displayName: string;
  avatarUrl: string | null;
  level: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
}

export const useUserDataCentralized = (userId: string | undefined) => {
  const enabled = !!userId;

  return useQuery({
    queryKey: ['user-data-centralized', userId],
    queryFn: async (): Promise<CentralizedUserData | null> => {
      if (!userId) return null;

      // ✅ SINGLE ROUNDTRIP - Buscar tudo em paralelo
      const [
        { data: profile, error: profileError },
        { data: physicalData, error: physicalError },
        { data: points, error: pointsError },
        { data: preferences, error: preferencesError }
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('user_physical_data')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('user_layout_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      // Log errors but don't throw (dados podem não existir ainda)
      if (profileError) console.warn('Erro ao buscar profile:', profileError.message);
      if (physicalError) console.warn('Erro ao buscar physical data:', physicalError.message);
      if (pointsError) console.warn('Erro ao buscar points:', pointsError.message);
      if (preferencesError) console.warn('Erro ao buscar preferences:', preferencesError.message);

      // Dados derivados
      const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Usuário';
      const avatarUrl = profile?.avatar_url || null;
      const level = points?.level || 1;
      const totalXP = points?.total_points || 0;
      const currentStreak = points?.current_streak || 0;
      const bestStreak = points?.best_streak || 0;

      return {
        profile: profile as UserProfile | null,
        physicalData: physicalData as UserPhysicalData | null,
        points: points as UserPoints | null,
        preferences: preferences as UserPreferences | null,
        displayName,
        avatarUrl,
        level,
        totalXP,
        currentStreak,
        bestStreak,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 60 * 60 * 1000,    // 1 hora em memória
    enabled,
    refetchOnWindowFocus: false,
  });
};

// Hooks de conveniência para compatibilidade
export const useUserProfile = (userId: string | undefined) => {
  const { data, isLoading, error } = useUserDataCentralized(userId);
  return {
    profile: data?.profile,
    isLoading,
    error,
  };
};

export const useUserPhysicalData = (userId: string | undefined) => {
  const { data, isLoading, error } = useUserDataCentralized(userId);
  return {
    physicalData: data?.physicalData,
    isLoading,
    error,
  };
};

export const useUserPoints = (userId: string | undefined) => {
  const { data, isLoading, error } = useUserDataCentralized(userId);
  return {
    points: data?.points,
    level: data?.level || 1,
    totalXP: data?.totalXP || 0,
    currentStreak: data?.currentStreak || 0,
    bestStreak: data?.bestStreak || 0,
    isLoading,
    error,
  };
};

export default useUserDataCentralized;
