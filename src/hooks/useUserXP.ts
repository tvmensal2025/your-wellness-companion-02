// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface XPData {
  currentXP: number;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  xpProgress: number; // 0-100%
  levelTitle: string;
}

const LEVEL_TITLES = [
  'Iniciante',
  'Explorador',
  'Dedicado',
  'Comprometido',
  'Focado',
  'Guerreiro',
  'Mestre',
  'Campeão',
  'Lenda',
  'Imortal'
];

const calculateLevel = (totalXP: number): { level: number; xpInLevel: number; xpToNext: number } => {
  // Fórmula: XP necessário = level * 100 + (level - 1) * 50
  let level = 1;
  let xpNeeded = 0;
  
  while (totalXP >= xpNeeded + (level * 100)) {
    xpNeeded += level * 100;
    level++;
  }
  
  const xpInLevel = totalXP - xpNeeded;
  const xpToNext = level * 100;
  
  return { level, xpInLevel, xpToNext };
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

  const fetchXP = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userPoints } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', user.id)
        .single();

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
        .single();

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

      // Mostrar animação de XP ganho
      setXPGained(amount);
      setTimeout(() => setXPGained(null), 3000);

      // Atualizar estado
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
    fetchXP();
  }, [fetchXP]);

  return { ...xpData, loading, addXP, xpGained, refetch: fetchXP };
};
