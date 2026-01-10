
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserDataFromCache, invalidateUserDataCache } from './useUserDataCache';

interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string | null;
  isActiveToday: boolean;
  streakExpiresIn: number;
}

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  bestStreak: 0,
  lastActivityDate: null,
  isActiveToday: false,
  streakExpiresIn: 24,
};

const toIsoDate = (value: any): string | null => {
  if (!value) return null;
  const str = String(value);
  return str.length >= 10 ? str.slice(0, 10) : str;
};

export const useUserStreak = () => {
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const fetchStreak = async () => {
    try {
      // Tenta usar cache centralizado primeiro
      const cachedData = getUserDataFromCache();
      
      if (cachedData?.points) {
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = toIsoDate(cachedData.points.lastActivityDate);
        const isActiveToday = lastActivity === today;

        let streakExpiresIn = 24;
        if (lastActivity) {
          const lastDate = new Date(lastActivity);
          const tomorrow = new Date(lastDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(23, 59, 59);
          const now = new Date();
          streakExpiresIn = Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60)));
        }

        setStreakData({
          currentStreak: cachedData.points.currentStreak,
          bestStreak: cachedData.points.bestStreak,
          lastActivityDate: lastActivity,
          isActiveToday,
          streakExpiresIn,
        });
        setLoading(false);
        return;
      }

      // Fallback: busca do DB se cache não disponível
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: userPoints } = await supabase
        .from('user_points')
        .select('current_streak, best_streak, last_activity_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userPoints) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = toIsoDate(userPoints.last_activity_date);
      const isActiveToday = lastActivity === today;

      let streakExpiresIn = 24;
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const tomorrow = new Date(lastDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59);
        const now = new Date();
        streakExpiresIn = Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60)));
      }

      setStreakData({
        currentStreak: userPoints.current_streak || 0,
        bestStreak: userPoints.best_streak || 0,
        lastActivityDate: lastActivity,
        isActiveToday,
        streakExpiresIn,
      });
    } catch (error) {
      console.error('Erro ao buscar streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { data: userPoints } = await supabase
        .from('user_points')
        .select('current_streak, best_streak, last_activity_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userPoints) return;

      const lastActivity = toIsoDate(userPoints.last_activity_date);
      if (lastActivity === today) return;

      const newStreak = lastActivity === yesterdayStr
        ? (userPoints.current_streak || 0) + 1
        : 1;

      const newBest = Math.max(newStreak, userPoints.best_streak || 0);

      await supabase
        .from('user_points')
        .update({
          current_streak: newStreak,
          best_streak: newBest,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // Invalida cache para próximo fetch
      invalidateUserDataCache();

      setStreakData((prev) => ({
        ...prev,
        currentStreak: newStreak,
        bestStreak: newBest,
        lastActivityDate: today,
        isActiveToday: true,
        streakExpiresIn: 24,
      }));
    } catch (error) {
      console.error('Erro ao atualizar streak:', error);
    }
  };

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchStreak();
    }
  }, []);

  return { ...streakData, loading, updateStreak, refetch: fetchStreak };
};
