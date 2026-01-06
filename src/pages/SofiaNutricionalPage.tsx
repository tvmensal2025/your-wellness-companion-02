import React from 'react';
import { SofiaNutricionalSection } from '@/components/sofia/SofiaNutricionalSection';

/**
 * Página shell para a rota direta /sofia-nutricional
 * Quando acessada diretamente (fora do dashboard), mostra header e padding completos
 */
export const SofiaNutricionalPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <SofiaNutricionalSection embedded={false} />
    </div>
  );
};
