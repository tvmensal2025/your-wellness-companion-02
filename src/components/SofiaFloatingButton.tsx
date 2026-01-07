import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HealthChatBot from './HealthChatBot';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const HIDDEN_ROUTES = [
  '/sofia',
  '/sofia-voice',
  '/sofia-nutricional',
  '/anamnesis',
  '/login',
  '/auth',
  '/onboarding',
  '/professional-evaluation'
];

const STORAGE_KEY = 'sofia-hidden';

const SofiaFloatingButton: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isHidden, setIsHidden] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  // Atalho de teclado Ctrl+Shift+S para alternar visibilidade
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsHidden(prev => {
          const newValue = !prev;
          localStorage.setItem(STORAGE_KEY, String(newValue));
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Não exibir Sofia flutuante em páginas específicas
  if (HIDDEN_ROUTES.some(route => location.pathname.startsWith(route))) {
    return null;
  }

  // Callback para esconder a Sofia
  const handleHide = () => {
    setIsHidden(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  // Se estiver escondida, mostrar mini-botão para reabrir
  if (isHidden) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                setIsHidden(false);
                localStorage.setItem(STORAGE_KEY, 'false');
              }}
              className="fixed bottom-16 right-2 z-40 h-6 w-6 rounded-full bg-purple-400/60 hover:bg-purple-500 shadow-sm opacity-50 hover:opacity-100 transition-all duration-200 lg:bottom-2"
              size="sm"
            >
              <MessageCircle className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Reabrir Sofia (Ctrl+Shift+S)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      {/* Sofia Flutuante Original - HealthChatBot */}
      <HealthChatBot user={user} onHide={handleHide} />
    </>
  );
};

export default SofiaFloatingButton;
