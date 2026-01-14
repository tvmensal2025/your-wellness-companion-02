/**
 * Character Preference Utilities
 * Gerencia persistência e visibilidade de features baseado no personagem selecionado
 * 
 * IMPORTANTE: 
 * - Preferência atual usa localStorage (persiste entre sessões)
 * - Histórico de escolhas usa localStorage (persiste para ordenação inteligente)
 */

import { 
  CharacterId, 
  featureRegistry, 
  isValidCharacterId,
  characters,
  Character
} from '@/types/character-menu';

const STORAGE_KEY = 'maxnutrition_selected_character';
const HISTORY_KEY = 'maxnutrition_character_history';

interface CharacterHistory {
  [key: string]: number; // characterId -> número de vezes escolhido
}

/**
 * Salva a preferência de personagem no localStorage (persistente)
 * E incrementa o contador no histórico
 */
export function savePreference(characterId: CharacterId): void {
  try {
    // Salva preferência atual (persistente)
    localStorage.setItem(STORAGE_KEY, characterId);
    
    // Incrementa histórico
    const history = getHistory();
    history[characterId] = (history[characterId] || 0) + 1;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Could not save character preference:', error);
  }
}

/**
 * Carrega a preferência de personagem do localStorage
 * Retorna null se não existir ou for inválida
 */
export function loadPreference(): CharacterId | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    if (!isValidCharacterId(saved)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return saved;
  } catch (error) {
    console.warn('Could not access localStorage:', error);
    return null;
  }
}

/**
 * Remove a preferência de personagem do localStorage
 */
export function clearPreference(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Could not clear character preference:', error);
  }
}

/**
 * Obtém o histórico de escolhas do localStorage
 */
export function getHistory(): CharacterHistory {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (!saved) return {};
    return JSON.parse(saved);
  } catch (error) {
    console.warn('Could not load character history:', error);
    return {};
  }
}

/**
 * Retorna o personagem mais escolhido pelo usuário
 */
export function getMostChosenCharacter(): CharacterId | null {
  const history = getHistory();
  let maxCount = 0;
  let mostChosen: CharacterId | null = null;
  
  for (const [id, count] of Object.entries(history)) {
    if (count > maxCount && isValidCharacterId(id)) {
      maxCount = count;
      mostChosen = id;
    }
  }
  
  return mostChosen;
}

/**
 * Retorna os personagens ordenados pelo mais escolhido primeiro
 */
export function getCharactersSortedByPopularity(): Character[] {
  const history = getHistory();
  
  return [...characters].sort((a, b) => {
    const countA = history[a.id] || 0;
    const countB = history[b.id] || 0;
    return countB - countA; // Maior primeiro
  });
}

/**
 * Retorna o índice inicial do carousel (personagem mais escolhido)
 */
export function getInitialCarouselIndex(): number {
  const sortedCharacters = getCharactersSortedByPopularity();
  const mostChosen = getMostChosenCharacter();
  
  if (!mostChosen) return 0;
  
  const index = sortedCharacters.findIndex(c => c.id === mostChosen);
  return index >= 0 ? index : 0;
}

/**
 * Retorna lista de features visíveis para um personagem
 */
export function getVisibleFeatures(characterId: CharacterId): string[] {
  if (characterId === 'complete') {
    return [
      ...featureRegistry.health,
      ...featureRegistry.nutrition,
      ...featureRegistry.exercise,
      ...featureRegistry.shared
    ];
  }
  
  const categoryFeatures = featureRegistry[characterId] || [];
  return [...categoryFeatures, ...featureRegistry.shared];
}

/**
 * Verifica se uma feature específica está visível para o personagem
 */
export function isFeatureVisible(characterId: CharacterId | null, featureId: string): boolean {
  if (!characterId) return true;
  if (characterId === 'complete') return true;
  
  const visibleFeatures = getVisibleFeatures(characterId);
  return visibleFeatures.includes(featureId);
}

/**
 * Retorna todas as features do sistema (para testes)
 */
export function getAllFeatures(): string[] {
  return [
    ...featureRegistry.health,
    ...featureRegistry.nutrition,
    ...featureRegistry.exercise,
    ...featureRegistry.shared
  ];
}

/**
 * Retorna features de uma categoria específica
 */
export function getFeaturesByCategory(category: keyof typeof featureRegistry): readonly string[] {
  return featureRegistry[category];
}

/**
 * Verifica se o personagem tem preferência salva na sessão atual
 */
export function hasPreference(): boolean {
  return loadPreference() !== null;
}
