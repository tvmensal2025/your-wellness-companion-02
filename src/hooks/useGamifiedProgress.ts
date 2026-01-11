import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleFitData } from '@/hooks/useGoogleFitData';
import { useGamificationUnified } from '@/hooks/useGamificationUnified';
import { useSocialRanking } from '@/hooks/useSocialRanking';
import { useUserGender } from '@/hooks/useUserGender';

// ============================================================================
// CONSTANTES
// ============================================================================

export const LEVEL_NAMES_MASC: Record<number, string> = {
  1: 'Iniciante', 2: 'Aprendiz', 3: 'Guerreiro', 4: 'Veterano',
  5: 'Elite', 6: 'Campeão', 7: 'Mestre', 8: 'Grão-Mestre',
  9: 'Lenda', 10: 'Imortal', 11: 'Divino', 12: 'Transcendente'
};

export const LEVEL_NAMES_FEM: Record<number, string> = {
  1: 'Iniciante', 2: 'Aprendiz', 3: 'Guerreira', 4: 'Veterana',
  5: 'Elite', 6: 'Campeã', 7: 'Mestra', 8: 'Grã-Mestra',
  9: 'Lenda', 10: 'Imortal', 11: 'Divina', 12: 'Transcendente'
};

export const LEVEL_COLORS: Record<number, string> = {
  1: 'from-slate-400 to-slate-500', 2: 'from-emerald-400 to-emerald-600',
  3: 'from-blue-400 to-blue-600', 4: 'from-purple-400 to-purple-600',
  5: 'from-amber-400 to-amber-600', 6: 'from-rose-400 to-rose-600',
  7: 'from-cyan-400 to-cyan-600', 8: 'from-fuchsia-400 to-fuchsia-600',
  9: 'from-orange-400 to-red-600', 10: 'from-yellow-300 to-yellow-500',
  11: 'from-indigo-400 to-purple-600', 12: 'from-pink-400 to-rose-600'
};

const MOTIVATIONAL_PHRASES = [
  'Hoje é dia de superar limites!',
  'Cada passo conta. Bora!',
  'Você está mais forte que ontem!',
  'A consistência vence o talento.',
  'Seu corpo agradece cada movimento.',
  'Foco no progresso, não na perfeição.'
];

// ============================================================================
// TIPOS
// ============================================================================

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  iconName: 'footprints' | 'flame' | 'moon' | 'zap';
  target: number;
  current: number;
  xp: number;
  completed: boolean;
  color: string;
}

export interface BattleData {
  todaySteps: number;
  yesterdaySteps: number;
  diff: number;
  winning: boolean;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useGamifiedProgress = () => {
  // Estado local
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [canClaimChest, setCanClaimChest] = useState(true);

  // Hooks externos
  const { data: fitData, isConnected, syncData, loading: fitLoading } = useGoogleFitData();
  const { gamificationData, isLoading: gamLoading } = useGamificationUnified(userId || undefined);
  const { rankingData } = useSocialRanking(userId || undefined);
  const { gender, loading: genderLoading } = useUserGender(user);

  // Gênero memoizado
  const isFeminine = useMemo(() => {
    return gender === 'feminino' || gender === 'female' || gender === 'f';
  }, [gender]);

  // Nomes de nível baseado no gênero
  const levelNames = useMemo(() => {
    return isFeminine ? LEVEL_NAMES_FEM : LEVEL_NAMES_MASC;
  }, [isFeminine]);

  // Verificar baú diário
  useEffect(() => {
    const lastClaim = localStorage.getItem('daily_chest_claimed');
    if (lastClaim) {
      const lastDate = new Date(lastClaim).toDateString();
      const today = new Date().toDateString();
      setCanClaimChest(lastDate !== today);
    }
  }, []);

  // Buscar usuário (apenas uma vez)
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!isMounted || !authUser) return;

        setUserId(authUser.id);
        setUser(authUser);

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authUser.id)
          .single();

        if (isMounted && profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };

    fetchUser();
    return () => { isMounted = false; };
  }, []);

  // Nome padrão quando gênero carregar
  useEffect(() => {
    if (!userName && !genderLoading) {
      setUserName(isFeminine ? 'Campeã' : 'Campeão');
    }
  }, [isFeminine, genderLoading, userName]);

  // Dados de hoje
  const todayData = useMemo(() => {
    if (!fitData?.length) return null;
    const today = new Date().toISOString().split('T')[0];
    return fitData.find(d => d.date === today) || fitData[fitData.length - 1];
  }, [fitData]);

  // Dados de ontem
  const yesterdayData = useMemo(() => {
    if (!fitData?.length) return null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    return fitData.find(d => d.date === yesterday);
  }, [fitData]);

  // Dados de gamificação
  const streak = gamificationData?.currentStreak || 0;
  const level = gamificationData?.currentLevel || 1;
  const currentXP = gamificationData?.currentXP || 0;
  const xpToNext = gamificationData?.xpToNextLevel || 1000;
  const totalXP = gamificationData?.totalXP || 0;
  const badges = gamificationData?.badges || [];

  // Missões diárias
  const dailyMissions: DailyMission[] = useMemo(() => {
    const steps = todayData?.steps || 0;
    const calories = todayData?.calories || 0;
    const sleep = todayData?.sleep_hours || 0;
    const activeMin = todayData?.active_minutes || 0;

    return [
      {
        id: 'steps',
        title: 'Caminhante',
        description: 'Caminhe 5.000 passos',
        iconName: 'footprints',
        target: 5000,
        current: steps,
        xp: 50,
        completed: steps >= 5000,
        color: 'text-emerald-500'
      },
      {
        id: 'calories',
        title: isFeminine ? 'Queimadora' : 'Queimador',
        description: 'Queime 300 kcal ativas',
        iconName: 'flame',
        target: 300,
        current: calories,
        xp: 40,
        completed: calories >= 300,
        color: 'text-orange-500'
      },
      {
        id: 'sleep',
        title: isFeminine ? 'Dorminhoca' : 'Dorminhoco',
        description: 'Durma 7+ horas',
        iconName: 'moon',
        target: 7,
        current: sleep,
        xp: 30,
        completed: sleep >= 7,
        color: 'text-indigo-500'
      },
      {
        id: 'active',
        title: isFeminine ? 'Ativa' : 'Ativo',
        description: '30 min de atividade',
        iconName: 'zap',
        target: 30,
        current: activeMin,
        xp: 35,
        completed: activeMin >= 30,
        color: 'text-yellow-500'
      }
    ];
  }, [todayData, isFeminine]);

  const completedMissions = dailyMissions.filter(m => m.completed).length;
  const totalMissionXP = dailyMissions.reduce((sum, m) => sum + (m.completed ? m.xp : 0), 0);

  // Batalha do dia
  const battleData: BattleData = useMemo(() => {
    const todaySteps = todayData?.steps || 0;
    const yesterdaySteps = yesterdayData?.steps || 0;
    const diff = todaySteps - yesterdaySteps;
    return { todaySteps, yesterdaySteps, diff, winning: diff >= 0 };
  }, [todayData, yesterdayData]);

  // Saudação
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Bom dia';
    if (hour < 18) return '☀️ Boa tarde';
    return '🌙 Boa noite';
  }, []);

  // Frase motivacional (consistente durante o dia)
  const motivationalPhrase = useMemo(() => {
    const dayIndex = new Date().getDate() % MOTIVATIONAL_PHRASES.length;
    return MOTIVATIONAL_PHRASES[dayIndex];
  }, []);

  // Handler para resgatar baú
  const handleChestClaim = (reward: any) => {
    localStorage.setItem('daily_chest_claimed', new Date().toISOString());
    setCanClaimChest(false);
    console.log('Recompensa recebida:', reward);
  };

  return {
    // Estado
    userId,
    userName,
    isLoading: fitLoading || gamLoading,
    isFeminine,
    
    // Gamificação
    level,
    levelNames,
    currentXP,
    xpToNext,
    totalXP,
    streak,
    badges,
    
    // Missões
    dailyMissions,
    completedMissions,
    totalMissionXP,
    
    // Batalha
    battleData,
    
    // UI
    greeting,
    motivationalPhrase,
    
    // Baú
    canClaimChest,
    handleChestClaim,
    
    // Google Fit
    isConnected,
    syncData,
    
    // Ranking
    rankingData,
  };
};

export default useGamifiedProgress;
