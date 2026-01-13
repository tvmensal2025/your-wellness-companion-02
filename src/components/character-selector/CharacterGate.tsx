/**
 * CharacterGate Component
 * Renderiza o app por trás e o CharacterSelector como overlay transparente
 * 
 * IMPORTANTE: O seletor SEMPRE aparece quando o app inicia
 */

import { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMenuStyleContext } from '@/contexts/MenuStyleContext';
import { CharacterSelector } from './CharacterSelector';

interface CharacterGateProps {
  children: ReactNode;
}

export function CharacterGate({ children }: CharacterGateProps) {
  const { 
    selectedCharacter, 
    isLoading, 
    setCharacter,
    showSelector,
    setShowSelector 
  } = useMenuStyleContext();

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* App sempre renderiza por trás */}
      {children}
      
      {/* Selector como overlay - SEMPRE aparece no início */}
      <AnimatePresence>
        {showSelector && (
          <CharacterSelector
            onSelect={(id) => {
              setCharacter(id);
              setShowSelector(false);
            }}
            isChanging={!!selectedCharacter}
            onCancel={selectedCharacter ? () => setShowSelector(false) : undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default CharacterGate;
