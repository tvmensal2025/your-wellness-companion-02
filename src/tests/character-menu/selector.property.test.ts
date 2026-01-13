/**
 * Property Tests for Character Selector
 * Feature: character-menu-selector
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { 
  characters, 
  validCharacterIds,
  CharacterId 
} from '@/types/character-menu';
import { 
  loadPreference, 
  savePreference, 
  clearPreference,
  hasPreference 
} from '@/utils/characterPreference';

// Arbitrary para gerar CharacterIds válidos
const characterIdArb = fc.constantFrom(...validCharacterIds);

describe('Character Selector Display Logic - Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Property 5: Selector Display Logic
   * For any app initialization, the CharacterSelector should be displayed 
   * if and only if no valid preference exists in storage.
   * 
   * **Validates: Requirements 1.1, 1.2**
   */
  it('Property 5: Selector should display when no preference exists', () => {
    // Sem preferência salva
    clearPreference();
    
    const shouldShowSelector = !hasPreference();
    expect(shouldShowSelector).toBe(true);
  });

  it('Property 5b: Selector should NOT display when preference exists', () => {
    fc.assert(
      fc.property(characterIdArb, (characterId) => {
        // Salvar preferência
        savePreference(characterId);
        
        // Verificar que não deve mostrar selector
        const shouldShowSelector = !hasPreference();
        expect(shouldShowSelector).toBe(false);
        
        // Verificar que preferência é válida
        const loaded = loadPreference();
        expect(loaded).toBe(characterId);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 5c: After clearing preference, selector should display', () => {
    fc.assert(
      fc.property(characterIdArb, (characterId) => {
        // Salvar e depois limpar
        savePreference(characterId);
        expect(hasPreference()).toBe(true);
        
        clearPreference();
        
        // Agora deve mostrar selector
        expect(hasPreference()).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Character Data Completeness - Property Tests', () => {
  /**
   * Property 6: Character Data Completeness
   * For any character in the characters array, it should have a non-empty 
   * name, description, imagePath, and at least one feature.
   * 
   * **Validates: Requirements 1.4**
   */
  it('Property 6: All characters have complete data', () => {
    // Testar todos os personagens
    characters.forEach(character => {
      // ID deve ser válido
      expect(validCharacterIds).toContain(character.id);
      
      // Nome não vazio
      expect(character.name).toBeTruthy();
      expect(character.name.length).toBeGreaterThan(0);
      
      // Descrição não vazia
      expect(character.description).toBeTruthy();
      expect(character.description.length).toBeGreaterThan(0);
      
      // ImagePath não vazio e começa com /
      expect(character.imagePath).toBeTruthy();
      expect(character.imagePath.startsWith('/')).toBe(true);
      
      // Pelo menos uma feature
      expect(character.features).toBeDefined();
      expect(Array.isArray(character.features)).toBe(true);
      expect(character.features.length).toBeGreaterThan(0);
    });
  });

  it('Property 6b: Each character ID is unique', () => {
    const ids = characters.map(c => c.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('Property 6c: All valid character IDs have corresponding character data', () => {
    fc.assert(
      fc.property(characterIdArb, (characterId) => {
        const character = characters.find(c => c.id === characterId);
        
        expect(character).toBeDefined();
        expect(character?.id).toBe(characterId);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 6d: Character image paths are valid format', () => {
    characters.forEach(character => {
      // Path deve ser formato válido
      expect(character.imagePath).toMatch(/^\/images\/[\w-]+\.(png|jpg|jpeg|svg)$/);
    });
  });

  it('Property 6e: Complete character has all features from other characters', () => {
    const completeCharacter = characters.find(c => c.id === 'complete');
    const otherCharacters = characters.filter(c => c.id !== 'complete');
    
    expect(completeCharacter).toBeDefined();
    
    // Todas as features dos outros personagens devem estar no complete
    otherCharacters.forEach(other => {
      other.features.forEach(feature => {
        // Ignorar features que são específicas de shared
        expect(completeCharacter?.features).toContain(feature);
      });
    });
  });
});
