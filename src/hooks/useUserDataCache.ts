import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Tipos centralizados
interface UserDataCache {
  user: User | null;
  profile: {
    fullName: string;
    email: string;
    avatarUrl: string;
    gender: string | null;
    phone: string;
    birthDate: string;
    city: string;
    state: string;
  } | null;
  physicalData: {
    altura_cm: number;
    idade: number;
    sexo: string;
    nivel_atividade: string;
  } | null;
  points: {
    totalPoints: number;
    currentStreak: number;
    bestStreak: number;
    lastActivityDate: string | null;
    level: number;
  } | null;
  layoutPreferences: {
    sidebarOrder: string[];
    hiddenSidebarItems: string[];
    defaultSection: string;
  } | null;
  lastFetched: number;
}

interface UseUserDataCacheReturn {
  data: UserDataCache;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Cache global em memória - singleton
let globalCache: UserDataCache | null = null;
let globalCacheTimestamp = 0;
const CACHE_TTL = 600000; // 10 minutos - dados de perfil mudam raramente
const fetchPromise: { current: Promise<void> | null } = { current: null };

// Default values
const DEFAULT_SIDEBAR_ORDER = [
  'dashboard', 'missions', 'progress', 'goals', 'courses', 
  'sessions', 'comunidade', 'challenges', 'saboteur-test', 
  'sofia-nutricional', 'dr-vital', 'exercicios', 'subscriptions'
];

export const useUserDataCache = (): UseUserDataCacheReturn => {
  const [data, setData] = useState<UserDataCache>({
    user: null,
    profile: null,
    physicalData: null,
    points: null,
    layoutPreferences: null,
    lastFetched: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchAllData = useCallback(async () => {
    // Se já está buscando, aguarda a promise existente
    if (fetchPromise.current) {
      await fetchPromise.current;
      return;
    }

    // Check cache validity
    const now = Date.now();
    if (globalCache && (now - globalCacheTimestamp) < CACHE_TTL) {
      if (mountedRef.current) {
        setData(globalCache);
        setLoading(false);
      }
      return;
    }

    const doFetch = async () => {
      // Timeout de segurança para evitar loading infinito em redes lentas
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => {
        console.warn('[useUserDataCache] Timeout de 10s - abortando');
        controller.abort();
      }, 10000);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;

        if (!user) {
          const emptyData: UserDataCache = {
            user: null,
            profile: null,
            physicalData: null,
            points: null,
            layoutPreferences: null,
            lastFetched: now,
          };
          globalCache = emptyData;
          globalCacheTimestamp = now;
          if (mountedRef.current) {
            setData(emptyData);
            setLoading(false);
          }
          clearTimeout(fetchTimeout);
          return;
        }

        // TODAS as queries em paralelo - single roundtrip
        const [
          profileResult,
          physicalResult,
          pointsResult,
          layoutResult
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('user_id, full_name, email, phone, birth_date, city, state, avatar_url, gender')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('user_physical_data')
            .select('altura_cm, idade, sexo, nivel_atividade')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('user_points')
            .select('total_points, current_streak, best_streak, last_activity_date, level')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('user_layout_preferences')
            .select('sidebar_order, hidden_sidebar_items, default_section')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        const cachedData: UserDataCache = {
          user,
          profile: profileResult.data ? {
            fullName: profileResult.data.full_name || user.user_metadata?.full_name || '',
            email: user.email || '',
            avatarUrl: profileResult.data.avatar_url || user.user_metadata?.avatar_url || '',
            gender: profileResult.data.gender || physicalResult.data?.sexo || user.user_metadata?.gender || null,
            phone: profileResult.data.phone || user.user_metadata?.phone || '',
            birthDate: profileResult.data.birth_date || user.user_metadata?.birth_date || '',
            city: profileResult.data.city || user.user_metadata?.city || '',
            state: profileResult.data.state || user.user_metadata?.state || '',
          } : null,
          physicalData: physicalResult.data ? {
            altura_cm: Number(physicalResult.data.altura_cm) || 170,
            idade: Number(physicalResult.data.idade) || 30,
            sexo: physicalResult.data.sexo || 'masculino',
            nivel_atividade: physicalResult.data.nivel_atividade || 'moderado',
          } : null,
          points: pointsResult.data ? {
            totalPoints: Number(pointsResult.data.total_points) || 0,
            currentStreak: Number(pointsResult.data.current_streak) || 0,
            bestStreak: Number(pointsResult.data.best_streak) || 0,
            lastActivityDate: pointsResult.data.last_activity_date || null,
            level: Number(pointsResult.data.level) || 1,
          } : { totalPoints: 0, currentStreak: 0, bestStreak: 0, lastActivityDate: null, level: 1 },
          layoutPreferences: layoutResult.data ? {
            sidebarOrder: layoutResult.data.sidebar_order || DEFAULT_SIDEBAR_ORDER,
            hiddenSidebarItems: layoutResult.data.hidden_sidebar_items || [],
            defaultSection: layoutResult.data.default_section || 'dashboard',
          } : {
            sidebarOrder: DEFAULT_SIDEBAR_ORDER,
            hiddenSidebarItems: [],
            defaultSection: 'dashboard',
          },
          lastFetched: now,
        };

        globalCache = cachedData;
        globalCacheTimestamp = now;

        if (mountedRef.current) {
          setData(cachedData);
          setLoading(false);
        }
        clearTimeout(fetchTimeout);
      } catch (err: any) {
        clearTimeout(fetchTimeout);
        
        // Se foi abortado por timeout, apenas logar
        if (err?.name === 'AbortError' || err?.message?.includes('abort')) {
          console.warn('[useUserDataCache] Timeout - continuando sem dados completos');
        } else {
          console.error('[useUserDataCache] Erro ao buscar dados:', err);
        }
        
        if (mountedRef.current) {
          setError(err?.message || 'Erro de conexão');
          setLoading(false);
        }
      }
    };

    fetchPromise.current = doFetch();
    await fetchPromise.current;
    fetchPromise.current = null;
  }, []);

  const refresh = useCallback(async () => {
    // Força atualização invalidando o cache
    globalCacheTimestamp = 0;
    setLoading(true);
    await fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    mountedRef.current = true;
    fetchAllData();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchAllData]);

  return { data, loading, error, refresh };
};

// Função para invalidar o cache externamente (após updates)
export const invalidateUserDataCache = () => {
  globalCacheTimestamp = 0;
};

// Função para obter dados do cache sem re-fetch
export const getUserDataFromCache = (): UserDataCache | null => globalCache;

export default useUserDataCache;
