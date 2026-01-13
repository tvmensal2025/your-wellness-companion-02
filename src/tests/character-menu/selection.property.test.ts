/**
 * Property Tests for Character Selection
 * Feature: character-menu-selector
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useMenuStyle } from '@/hooks/useMenuStyle';
import { 
  CharacterId, 
  validCharacterIds,
  characters 
} from '@/types/character-menu';
import { loadPreference } from '@/utils/characterPreference';

// Arbitrary para gerar CharacterIds válidos
const characterIdArb = fc.constantFrom(...validCharacterIds);

describe('Character Selection - Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Property 4: Character Selection Updates Preference
   * For any character selection action, the stored preference should match 
   * the selected character ID after the action completes.
   * 
   * **Validates: Requirements 7.2, 7.3**
   */
  it('Property 4: Character Selection Updates Preference', () => {
    fc.assert(
      fc.property(characterIdArb, (characterId) => {
        const { result } = renderHook(() => useMenuStyle());
        
        // Act - select character
        act(() => {
          result.current.setCharacter(characterId);
        });
        
        // Assert - hook state matches
        expect(result.current.selectedCharacter).toBe(characterId);
        
        // Assert - localStorage matches
        const storedPreference = loadPreference();
        expect(storedPreference).toBe(characterId);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4b: Changing character updates both state and storage
   */
  it('Property 4b: Changing character updates both state and storage', () => {
    const twoCharactersArb = fc.tuple(characterIdArb, characterIdArb);
    
    fc.assert(
      fc.property(twoCharactersArb, ([firstId, secondId]) => {
        const { result } = renderHook(() => useMenuStyle());
        
        // Select first character
        act(() => {
          result.current.setCharacter(firstId);
        });
        
        expect(result.current.selectedCharacter).toBe(firstId);
        
        // Change to second character
        act(() => {
          result.current.setCharacter(secondId);
        });
        
        // Assert - both state and storage updated
        expect(result.current.selectedCharacter).toBe(secondId);
        expect(loadPreference()).toBe(secondId);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4c: Clear preference resets state
   */
  it('Property 4c: Clear preference resets state', () => {
    fc.assert(
      fc.property(characterIdArb, (characterId) => {
        const { result } = renderHook(() => useMenuStyle());
        
        // Select character
        act(() => {
          result.current.setCharacter(characterId);
        });
        
        expect(result.current.selectedCharacter).toBe(characterId);
        
        // Clear preference
        act(() => {
          result.current.clearCharacterPreference();
        });
        
        // Assert - state is null
        expect(result.current.selectedCharacter).toBeNull();
        expect(loadPreference()).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: visibleFeatures is consistent with selectedCharacter
   */
  it('visibleFeatures is consistent with selectedCharacter', () => {
    fc.assert(
      fc.property(characterIdArb, (characterId) => {
        const { result } = renderHook(() => useMenuStyle());
        
        act(() => {
          result.current.setCharacter(characterId);
        });
        
        // visibleFeatures should not be empty
        expect(result.current.visibleFeatures.length).toBeGreaterThan(0);
        
        // All visible features should pass isFeatureVisible check
        result.current.visibleFeatures.forEach(feature => {
          expect(result.current.isFeatureVisible(feature)).toBe(true);
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: characterData matches selected character
   */
  it('characterData matches selected character', () => {
    fc.assert(
      fc.property(characterIdArb, (characterId) => {
        const { result } = renderHook(() => useMenuStyle());
        
        act(() => {
          result.current.setCharacter(characterId);
        });
        
        const expectedCharacter = characters.find(c => c.id === characterId);
        
        expect(result.current.characterData).not.toBeNull();
        expect(result.current.characterData?.id).toBe(characterId);
        expect(result.current.characterData?.name).toBe(expectedCharacter?.name);
      }),
      { numRuns: 100 }
    );
  });
});
