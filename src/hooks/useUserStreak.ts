// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string | null;
  isActiveToday: boolean;
  streakExpiresIn: number; // horas até expirar
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
  // normaliza date/time → YYYY-MM-DD
  return str.length >= 10 ? str.slice(0, 10) : str;
};

const ensureUserPointsRow = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_points')
    .select('current_streak, best_streak, last_activity_date')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  if (data) return data;

  const { data: inserted, error: insertError } = await supabase
    .from('user_points')
    .insert({
      user_id: userId,
      total_points: 0,
      daily_points: 0,
      weekly_points: 0,
      monthly_points: 0,
      current_streak: 0,
      best_streak: 0,
      completed_challenges: 0,
      level: 1,
      last_activity_date: null,
    })
    .select('current_streak, best_streak, last_activity_date')
    .single();

  if (insertError) throw insertError;
  return inserted;
};

export const useUserStreak = () => {
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK);
  const [loading, setLoading] = useState(true);

  const fetchStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userPoints = await ensureUserPointsRow(user.id);

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = toIsoDate(userPoints.last_activity_date);
      const isActiveToday = lastActivity === today;

      // Calcular horas até expirar o streak
      let streakExpiresIn = 24;
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const tomorrow = new Date(lastDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59);
        const now = new Date();
        streakExpiresIn = Math.max(
          0,
          Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60))
        );
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

      const userPoints = await ensureUserPointsRow(user.id);

      const lastActivity = toIsoDate(userPoints.last_activity_date);

      if (lastActivity === today) {
        // Já registrou hoje
        return;
      }

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
    fetchStreak();
  }, []);

  return { ...streakData, loading, updateStreak, refetch: fetchStreak };
};
