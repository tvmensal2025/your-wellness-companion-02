import { useState, useEffect, useCallback } from 'react';

export const useWelcomeOnboarding = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Verificar se usuário já viu o modal
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    
    if (!hasSeenWelcome) {
      // Pequeno delay para não aparecer junto com o carregamento
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    setHasChecked(true);
  }, []);

  const dismissWelcome = useCallback(() => {
    localStorage.setItem('hasSeenWelcomeModal', 'true');
    setShowWelcomeModal(false);
    setHasChecked(true);
  }, []);

  const resetWelcome = useCallback(() => {
    localStorage.removeItem('hasSeenWelcomeModal');
    setShowWelcomeModal(true);
    setHasChecked(false);
  }, []);

  return {
    showWelcomeModal,
    setShowWelcomeModal,
    dismissWelcome,
    resetWelcome,
    hasChecked,
  };
};
