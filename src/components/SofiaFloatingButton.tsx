import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HealthChatBot from './HealthChatBot';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { MessageCircle, Camera } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useActiveSection } from '@/contexts/ActiveSectionContext';
import QuickPhotoCapture from './nutrition/QuickPhotoCapture';

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

// Seções do dashboard onde a Sofia não deve aparecer
const HIDDEN_SECTIONS = ['comunidade'];

const STORAGE_KEY = 'sofia-hidden';

const SofiaFloatingButton: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { activeSection } = useActiveSection();
  const [isHidden, setIsHidden] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [showQuickPhoto, setShowQuickPhoto] = useState(false);

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

  // Não exibir Sofia em seções específicas do dashboard (ex: comunidade)
  if (HIDDEN_SECTIONS.includes(activeSection || '')) {
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
      {/* Botão de Foto Rápida - Acima do chat */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setShowQuickPhoto(true)}
              className="fixed bottom-32 right-4 z-40 h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 lg:bottom-24"
              size="icon"
            >
              <Camera className="w-5 h-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">📸 Foto rápida da refeição</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Sofia Flutuante Original - HealthChatBot */}
      <HealthChatBot user={user} onHide={handleHide} />

      {/* Modal de Foto Rápida */}
      <QuickPhotoCapture 
        isOpen={showQuickPhoto} 
        onClose={() => setShowQuickPhoto(false)}
        onSuccess={() => {
          // Pode adicionar lógica adicional aqui
        }}
      />
    </>
  );
};

export default SofiaFloatingButton;
