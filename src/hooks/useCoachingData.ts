/**
 * useCoachingData Hook
 * Busca dados de coaching/sessões reais do Supabase para o dashboard do Rafael
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserDataCache } from './useUserDataCache';

interface CoachingData {
  missionsCompleted: number;
  missionsTotal: number;
  xpReward: number;
  streak: number;
  sessionsCompleted: number;
  sessionsTotal: number;
  recommendedSessions: Array<{
    id: string;
    title: string;
    description: string;
    duration: string;
    tag: string;
    tagIcon: string;
    type: string;
  }>;
  recentReflections: Array<{
    id: string;
    content: string;
    date: string;
  }>;
}

export function useCoachingData() {
  const { data: userData } = useUserDataCache();
  const [coachingData, setCoachingData] = useState<CoachingData>({
    missionsCompleted: 0,
    missionsTotal: 3,
    xpReward: 30,
    streak: 0,
    sessionsCompleted: 0,
    sessionsTotal: 0,
    recommendedSessions: [],
    recentReflections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoachingData = useCallback(async () => {
    const userId = userData.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Buscar missões do dia usando challenge_participations como fallback
      let dailyMissions: any[] = [];
      const { data: challengeData } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', userId)
        .gte('started_at', today)
        .limit(10);
      
      dailyMissions = challengeData || [];

      // Buscar sessões do usuário
      const { data: userSessions } = await supabase
        .from('user_sessions')
        .select(`
          *,
          sessions:session_id (
            id,
            title,
            description,
            type,
            estimated_time,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .order('assigned_at', { ascending: false })
        .limit(10);

      // Buscar sessões disponíveis (não atribuídas)
      const completedSessionIds = (userSessions || [])
        .filter(s => s.status === 'completed')
        .map(s => s.session_id);

      const { data: availableSessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', `(${completedSessionIds.length > 0 ? completedSessionIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)
        .limit(5);

      // Buscar reflexões recentes
      const { data: reflections } = await supabase
        .from('daily_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('section', 'reflection')
        .order('date', { ascending: false })
        .limit(3);

      // Buscar streak
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

      // Calcular missões
      const missionsCompleted = (dailyMissions || []).filter(m => m.is_completed).length;
      const missionsTotal = Math.max(3, dailyMissions?.length || 3);

      // Calcular sessões
      const sessionsCompleted = (userSessions || []).filter(s => s.status === 'completed').length;
      const sessionsTotal = userSessions?.length || 0;

      // Mapear sessões recomendadas
      const sessionTypeIcons: Record<string, { icon: string; tag: string }> = {
        'life-wheel': { icon: '📖', tag: 'Autoconhecimento' },
        'saboteur-test': { icon: '🧠', tag: 'Inteligência Emocional' },
        'anamnesis': { icon: '🌟', tag: 'Perfil Completo' },
        'daily-reflection': { icon: '✨', tag: 'Reflexão' },
        'symptoms': { icon: '💊', tag: 'Saúde' },
        default: { icon: '📋', tag: 'Desenvolvimento' },
      };

      const recommendedSessions = (availableSessions || []).slice(0, 3).map(s => {
        const typeInfo = sessionTypeIcons[s.type] || sessionTypeIcons.default;
        return {
          id: s.id,
          title: s.title,
          description: s.description || '',
          duration: `${s.estimated_time || 15} min`,
          tag: typeInfo.tag,
          tagIcon: typeInfo.icon,
          type: s.type,
        };
      });

      // Se não há sessões disponíveis, mostrar sessões padrão
      if (recommendedSessions.length === 0) {
        recommendedSessions.push(
          {
            id: 'life-wheel',
            title: 'Roda da Vida',
            description: 'Avalie suas áreas de desenvolvimento',
            duration: '15 min',
            tag: 'Autoconhecimento',
            tagIcon: '📖',
            type: 'life-wheel',
          },
          {
            id: 'saboteur-test',
            title: 'Teste de Sabotadores',
            description: 'Descubra seus padrões mentais limitantes',
            duration: '20 min',
            tag: 'Inteligência Emocional',
            tagIcon: '🧠',
            type: 'saboteur-test',
          },
          {
            id: 'anamnesis',
            title: 'Anamnese Completa',
            description: 'Conte sua história para personalizar sua jornada',
            duration: '30 min',
            tag: 'Perfil Completo',
            tagIcon: '🌟',
            type: 'anamnesis',
          }
        );
      }

      // Mapear reflexões
      const recentReflections = (reflections || []).map(r => ({
        id: r.id,
        content: r.answer || '',
        date: new Date(r.date).toLocaleDateString('pt-BR'),
      }));

      setCoachingData({
        missionsCompleted,
        missionsTotal,
        xpReward: missionsTotal * 10,
        streak: pointsData?.current_streak || 0,
        sessionsCompleted,
        sessionsTotal,
        recommendedSessions,
        recentReflections,
      });
    } catch (err: any) {
      console.error('Error fetching coaching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userData.user?.id]);

  useEffect(() => {
    fetchCoachingData();
  }, [fetchCoachingData]);

  return { coachingData, loading, error, refresh: fetchCoachingData };
}

export default useCoachingData;
