import React from 'react';
import { useLocation } from 'react-router-dom';
import HealthChatBot from './HealthChatBot';
import { useAuth } from '@/hooks/useAuth';

const SofiaFloatingButton: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const path = location.pathname;

  // Não exibir Sofia flutuante em telas onde ela pode atrapalhar o layout (ex.: autenticação)
  if (
    path === '/sofia' ||
    path === '/sofia-voice' ||
    path === '/sofia-nutricional' ||
    path.startsWith('/auth')
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
