/**
 * MenuStyle Context
 * Provê estado global do estilo de menu baseado no personagem selecionado
 * 
 * IMPORTANTE: O seletor só aparece se não houver personagem salvo
 */

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useMenuStyle, UseMenuStyleReturn } from '@/hooks/useMenuStyle';
import { CharacterId, characters, Character } from '@/types/character-menu';
import { loadPreference } from '@/utils/characterPreference';

interface MenuStyleContextValue extends UseMenuStyleReturn {
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
}

const MenuStyleContext = createContext<MenuStyleContextValue | null>(null);

interface MenuStyleProviderProps {
  children: ReactNode;
}

export function MenuStyleProvider({ children }: MenuStyleProviderProps) {
  const menuStyle = useMenuStyle();
  
  // Verificar se já tem personagem salvo para decidir se mostra o seletor
  const [showSelector, setShowSelector] = React.useState(() => {
    // Só mostra o seletor se NÃO tiver personagem salvo
    const saved = loadPreference();
    return !saved;
  });

  // Atualizar showSelector quando o personagem mudar
  useEffect(() => {
    if (menuStyle.selectedCharacter) {
      setShowSelector(false);
    }
  }, [menuStyle.selectedCharacter]);

  const value: MenuStyleContextValue = {
    ...menuStyle,
    showSelector,
    setShowSelector
  };

  return (
    <MenuStyleContext.Provider value={value}>
      {children}
    </MenuStyleContext.Provider>
  );
}

// Re-export types for convenience
export type { MenuStyleContextValue };

/**
 * Hook para consumir o contexto de MenuStyle
 * @throws Error se usado fora do MenuStyleProvider
 */
export function useMenuStyleContext(): MenuStyleContextValue {
  const context = useContext(MenuStyleContext);
  
  if (!context) {
    throw new Error('useMenuStyleContext must be used within a MenuStyleProvider');
  }
  
  return context;
}

/**
 * Hook seguro que não lança erro se usado fora do provider
 * Retorna valores padrão se não houver provider
 */
export function useMenuStyleContextSafe(): MenuStyleContextValue | null {
  return useContext(MenuStyleContext);
}

export { MenuStyleContext };
export type { MenuStyleContextValue };
