/**
 * MenuStyle Context
 * Provê estado global do estilo de menu baseado no personagem selecionado
 * 
 * IMPORTANTE: O seletor SEMPRE aparece quando o app inicia (showSelector = true por padrão)
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useMenuStyle, UseMenuStyleReturn } from '@/hooks/useMenuStyle';
import { CharacterId, characters, Character } from '@/types/character-menu';

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
  // SEMPRE mostrar o seletor quando o app inicia
  const [showSelector, setShowSelector] = React.useState(true);

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
