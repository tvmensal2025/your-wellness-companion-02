import React from 'react';
import { useLocation } from 'react-router-dom';
import HealthChatBot from './HealthChatBot';
import { useAuth } from '@/hooks/useAuth';

const SofiaFloatingButton: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Não exibir Sofia flutuante em telas onde ela pode atrapalhar o layout (ex.: autenticação)
  if (
    location.pathname === '/sofia' ||
    location.pathname === '/sofia-voice' ||
    location.pathname === '/sofia-nutricional' ||
    location.pathname === '/auth'
  ) {
    return null;
  }

  return (
    <>
      {/* Sofia Flutuante Original - HealthChatBot */}
      <HealthChatBot user={user} />
    </>
  );
};

export default SofiaFloatingButton;
