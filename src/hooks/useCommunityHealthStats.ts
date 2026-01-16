import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CommunityStats {
  totalWeightLost: number;
  usersLosing: number;
  usersGaining: number;
  avgBodyFatChange: number;
}

interface TopLoser {
  name: string;
  weightLost: number;
  avatarUrl: string | null;
}

export function useCommunityHealthStats() {
  const [stats, setStats] = useState<CommunityStats>({
    totalWeightLost: 0,
    usersLosing: 0,
    usersGaining: 0,
    avgBodyFatChange: 0,
  });
  const [topLoser, setTopLoser] = useState<TopLoser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  const fetchCommunityStats = async () => {
    try {
      setLoading(true);

      // Get weight measurements from users who allow showing results
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .eq('show_weight_results', true)
        .limit(500);

      if (!profiles || profiles.length === 0) {
        setLoading(false);
        return;
      }

      const allowedUserIds = profiles.map(p => p.user_id);
      const userInfo: Record<string, { name: string; avatarUrl: string | null }> = {};
      profiles.forEach(p => {
        userInfo[p.user_id] = { 
          name: p.full_name || 'Usuário',
          avatarUrl: p.avatar_url 
        };
      });

      // Get all weight measurements for allowed users
      const { data: weightData } = await supabase
        .from('weight_measurements')
        .select('user_id, peso_kg, gordura_corporal_percent, measurement_date')
        .in('user_id', allowedUserIds)
        .order('measurement_date', { ascending: true });

      if (!weightData || weightData.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate stats per user
      const userStats: Record<string, { 
        firstWeight: number; 
        lastWeight: number; 
        firstFat: number | null; 
        lastFat: number | null;
      }> = {};

      weightData.forEach(w => {
        if (!userStats[w.user_id]) {
          userStats[w.user_id] = {
            firstWeight: w.peso_kg,
            lastWeight: w.peso_kg,
            firstFat: w.gordura_corporal_percent,
            lastFat: w.gordura_corporal_percent,
          };
        } else {
          userStats[w.user_id].lastWeight = w.peso_kg;
          if (w.gordura_corporal_percent !== null) {
            userStats[w.user_id].lastFat = w.gordura_corporal_percent;
          }
        }
      });

      // Calculate aggregates
      let totalWeightLost = 0;
      let usersLosing = 0;
      let usersGaining = 0;
      let totalFatChange = 0;
      let fatChangeCount = 0;
      let maxWeightLost = 0;
      let topLoserId = '';

      Object.entries(userStats).forEach(([userId, data]) => {
        const weightChange = data.lastWeight - data.firstWeight;
        totalWeightLost += weightChange;

        if (weightChange < 0) {
          usersLosing++;
          if (weightChange < maxWeightLost) {
            maxWeightLost = weightChange;
            topLoserId = userId;
          }
        } else if (weightChange > 0) {
          usersGaining++;
        }

        if (data.firstFat !== null && data.lastFat !== null) {
          totalFatChange += (data.lastFat - data.firstFat);
          fatChangeCount++;
        }
      });

      setStats({
        totalWeightLost: Math.abs(totalWeightLost),
        usersLosing,
        usersGaining,
        avgBodyFatChange: fatChangeCount > 0 ? totalFatChange / fatChangeCount : 0,
      });

      if (topLoserId && maxWeightLost < 0) {
        const info = userInfo[topLoserId];
        setTopLoser({
          name: info?.name || 'Usuário',
          weightLost: maxWeightLost,
          avatarUrl: info?.avatarUrl || null,
        });
      }
    } catch (error) {
      console.error('Error fetching community stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, topLoser, loading, refetch: fetchCommunityStats };
}
