
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserDataFromCache, invalidateUserDataCache } from './useUserDataCache';

interface XPData {
  currentXP: number;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  xpProgress: number;
  levelTitle: string;
}

const LEVEL_TITLES = [
  'Iniciante', 'Explorador', 'Dedicado', 'Comprometido', 'Focado',
  'Guerreiro', 'Mestre', 'Campeão', 'Lenda', 'Imortal'
];

const calculateLevel = (totalXP: number): { level: number; xpInLevel: number; xpToNext: number } => {
  let level = 1;
  let xpNeeded = 0;
  
  while (totalXP >= xpNeeded + (level * 100)) {
    xpNeeded += level * 100;
    level++;
  }
  
  return { level, xpInLevel: totalXP - xpNeeded, xpToNext: level * 100 };
};

export const useUserXP = () => {
  const [xpData, setXPData] = useState<XPData>({
    currentXP: 0,
    totalXP: 0,
    level: 1,
    xpToNextLevel: 100,
    xpProgress: 0,
    levelTitle: 'Iniciante'
  });
  const [loading, setLoading] = useState(true);
  const [xpGained, setXPGained] = useState<number | null>(null);
  const initializedRef = useRef(false);

  const fetchXP = useCallback(async () => {
    try {
      // Tenta cache primeiro
      const cachedData = getUserDataFromCache();
      
      if (cachedData?.points) {
        const totalXP = cachedData.points.totalPoints;
        const { level, xpInLevel, xpToNext } = calculateLevel(totalXP);
        const xpProgress = Math.round((xpInLevel / xpToNext) * 100);

        setXPData({
          currentXP: xpInLevel,
          totalXP,
          level,
          xpToNextLevel: xpToNext,
          xpProgress,
          levelTitle: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
        });
        setLoading(false);
        return;
      }

      // Fallback: busca do DB
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: userPoints } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', user.id)
        .maybeSingle();

      const totalXP = userPoints?.total_points || 0;
      const { level, xpInLevel, xpToNext } = calculateLevel(totalXP);
      const xpProgress = Math.round((xpInLevel / xpToNext) * 100);

      setXPData({
        currentXP: xpInLevel,
        totalXP,
        level,
        xpToNextLevel: xpToNext,
        xpProgress,
        levelTitle: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
      });
    } catch (error) {
      console.error('Erro ao buscar XP:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addXP = useCallback(async (amount: number, reason?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userPoints } = await supabase
        .from('user_points')
        .select('total_points, daily_points')
        .eq('user_id', user.id)
        .maybeSingle();

      const newTotal = (userPoints?.total_points || 0) + amount;
      const newDaily = (userPoints?.daily_points || 0) + amount;

      await supabase
        .from('user_points')
        .update({
          total_points: newTotal,
          daily_points: newDaily,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Invalida cache
      invalidateUserDataCache();

      setXPGained(amount);
      setTimeout(() => setXPGained(null), 3000);

      const { level, xpInLevel, xpToNext } = calculateLevel(newTotal);
      const xpProgress = Math.round((xpInLevel / xpToNext) * 100);

      setXPData({
        currentXP: xpInLevel,
        totalXP: newTotal,
        level,
        xpToNextLevel: xpToNext,
        xpProgress,
        levelTitle: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
      });

      return { success: true, newLevel: level };
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
      return { success: false };
    }
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchXP();
    }
  }, [fetchXP]);

  return { ...xpData, loading, addXP, xpGained, refetch: fetchXP };
};
