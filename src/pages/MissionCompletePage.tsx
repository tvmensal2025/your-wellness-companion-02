import React, { useEffect, useState } from 'react';
import { MissionCompletePage } from '@/components/daily-missions/MissionCompletePage';
import { supabase } from '@/integrations/supabase/client';

// Dados de exemplo para demonstração
const mockAnswers = {
  'first_liquid': 'Água morna com limão',
  'internal_connection': 'Oração',
  'energy_level': '1',
  'sleep_hours': '4h ou menos',
  'water_intake': 'Menos de 500ml',
  'physical_activity': 'Sim'
};

const mockQuestions = [
  { id: 'first_liquid', question: 'Qual foi o primeiro líquido que consumiu?' },
  { id: 'internal_connection', question: 'Praticou algum momento de conexão interna?' },
  { id: 'energy_level', question: 'Como você classificaria sua energia ao acordar?' },
  { id: 'sleep_hours', question: 'Quantas horas você dormiu?' },
  { id: 'water_intake', question: 'Quanto de água você bebeu hoje?' },
  { id: 'physical_activity', question: 'Praticou atividade física hoje?' }
];

const mockTotalPoints = 120;

export const MissionCompletePageRoute: React.FC = () => {
  const [userId, setUserId] = useState<string | undefined>();
  const [streakDays, setStreakDays] = useState(1);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Buscar streak atual
        const { data: session } = await supabase
          .from('daily_mission_sessions')
          .select('streak_days')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (session?.streak_days) {
          setStreakDays(session.streak_days);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleContinue = () => {
    // Redirecionar para a página principal ou dashboard
    window.location.href = '/dashboard';
  };

  return (
    <MissionCompletePage
      answers={mockAnswers}
      totalPoints={mockTotalPoints}
      questions={mockQuestions}
      onContinue={handleContinue}
      userId={userId}
      streakDays={streakDays}
    />
  );
};
