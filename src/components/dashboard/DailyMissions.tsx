import React from 'react';
import { User } from '@supabase/supabase-js';
import { DailyMissionsLight } from '@/components/daily-missions/DailyMissionsLight';

interface DailyMissionsProps {
  user: User | null;
}

const DailyMissions = ({ user }: DailyMissionsProps) => {
  // Nova versão Light - mais leve e acolhedora (7 perguntas vs 17)
  return <DailyMissionsLight user={user} />;
};

export default DailyMissions;