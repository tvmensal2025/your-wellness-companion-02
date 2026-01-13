/**
 * useMenuStyle Hook
 * Gerencia o estilo de menu baseado no personagem selecionado
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  CharacterId, 
  characters, 
  getCharacterById,
  isMenuEnabledForCharacter,
  getEnabledMenus,
  getDisabledMenus
} from '@/types/character-menu';
import {
  savePreference,
  loadPreference,
  clearPreference,
  getVisibleFeatures,
  isFeatureVisible as checkFeatureVisible
} from '@/utils/characterPreference';

export interface UseMenuStyleReturn {
  selectedCharacter: CharacterId | null;
  isFeatureVisible: (featureId: string) => boolean;
  isMenuEnabled: (menuId: string) => boolean;
  setCharacter: (id: CharacterId) => void;
  clearCharacterPreference: () => void;
  isLoading: boolean;
  visibleFeatures: string[];
  enabledMenus: readonly string[];
  disabledMenus: string[];
  characterData: typeof characters[0] | null;
}

export function useMenuStyle(): UseMenuStyleReturn {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferência do localStorage na inicialização
  useEffect(() => {
    const saved = loadPreference();
    setSelectedCharacter(saved);
    setIsLoading(false);
  }, []);

  // Função para definir o personagem
  const setCharacter = useCallback((id: CharacterId) => {
    savePreference(id);
    setSelectedCharacter(id);
  }, []);

  // Função para limpar preferência
  const clearCharacterPreference = useCallback(() => {
    clearPreference();
    setSelectedCharacter(null);
  }, []);

  // Função para verificar visibilidade de feature
  const isFeatureVisible = useCallback((featureId: string): boolean => {
    return checkFeatureVisible(selectedCharacter, featureId);
  }, [selectedCharacter]);

  // Função para verificar se menu está habilitado
  const isMenuEnabled = useCallback((menuId: string): boolean => {
    return isMenuEnabledForCharacter(selectedCharacter, menuId);
  }, [selectedCharacter]);

  // Obter lista de features visíveis
  const visibleFeatures = selectedCharacter 
    ? getVisibleFeatures(selectedCharacter) 
    : [];

  // Obter lista de menus habilitados
  const enabledMenus = selectedCharacter 
    ? getEnabledMenus(selectedCharacter) 
    : [];

  // Obter lista de menus desabilitados
  const disabledMenus = selectedCharacter 
    ? getDisabledMenus(selectedCharacter) 
    : [];

  // Obter dados do personagem selecionado
  const characterData = selectedCharacter 
    ? getCharacterById(selectedCharacter) || null
    : null;

  return {
    selectedCharacter,
    isFeatureVisible,
    isMenuEnabled,
    setCharacter,
    clearCharacterPreference,
    isLoading,
    visibleFeatures,
    enabledMenus,
    disabledMenus,
    characterData
  };
}

export default useMenuStyle;
