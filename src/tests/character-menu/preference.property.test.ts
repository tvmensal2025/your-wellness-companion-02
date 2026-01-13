/**
 * Property Tests for Character Preference
 * Feature: character-menu-selector
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  savePreference,
  loadPreference,
  clearPreference,
  getVisibleFeatures,
  isFeatureVisible,
  getAllFeatures
} from '@/utils/characterPreference';
import { 
  CharacterId, 
  validCharacterIds, 
  featureRegistry 
} from '@/types/character-menu';

// Arbitrary para gerar CharacterIds válidos
const characterIdArb = fc.constantFrom(...validCharacterIds);

// Arbitrary para gerar strings inválidas (não são CharacterIds)
const invalidIdArb = fc.string().filter(s => !validCharacterIds.includes(s as CharacterId));

describe('Character Preference - Property Tests', () => {
  // Limpar localStorage antes e depois de cada teste
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Property 1: Preference Round-Trip Consistency
   * For any valid character ID, saving the preference and then loading it 
   * should return the same character ID.
   * 
   * **Validates: Requirements 6.1, 6.2, 6.3**
   */
  it('Property 1: Preference Round-Trip Consistency', () => {
    fc.assert(
      fc.property(characterIdArb, (characterId) => {
        // Arrange & Act
        savePreference(characterId);
        const loaded = loadPreference();

        // Assert
        expect(loaded).toBe(characterId);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1b: Clear preference removes saved value
   */
  it('Property 1b: Clear preference removes saved value', () => {
    fc.assert(
      fc.property(characterIdArb, (characterId) => {
        // Arrange
        savePreference(characterId);
        
        // Act
        clearPreference();
        const loaded = loadPreference();

        // Assert
        expect(loaded).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1c: Invalid preferences return null and are cleared
   */
  it('Property 1c: Invalid preferences return null', () => {
    fc.assert(
      fc.property(invalidIdArb, (invalidId) => {
        // Arrange - manually set invalid value
        localStorage.setItem('maxnutrition_selected_character', invalidId);
        
        // Act
        const loaded = loadPreference();

        // Assert
        expect(loaded).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature Visibility - Property Tests', () => {
  /**
   * Property 2: Feature Visibility by Style
   * For any character style (health, nutrition, exercise), only features 
   * belonging to that style plus shared features should be visible.
   * 
   * **Validates: Requirements 2.1, 2.3, 3.1, 3.3, 4.1, 4.3**
   */
  it('Property 2: Feature Visibility by Style', () => {
    const nonCompleteIds = fc.constantFrom<CharacterId>('health', 'nutrition', 'exercise');
    
    fc.assert(
      fc.property(nonCompleteIds, (characterId) => {
        const visibleFeatures = getVisibleFeatures(characterId);
        
        // Todas as features da categoria devem estar visíveis
        const categoryFeatures = featureRegistry[characterId];
        categoryFeatures.forEach(feature => {
          expect(visibleFeatures).toContain(feature);
        });
        
        // Todas as features shared devem estar visíveis
        featureRegistry.shared.forEach(feature => {
          expect(visibleFeatures).toContain(feature);
        });
        
        // Features de outras categorias NÃO devem estar visíveis
        const otherCategories = (['health', 'nutrition', 'exercise'] as const)
          .filter(cat => cat !== characterId);
        
        otherCategories.forEach(otherCat => {
          featureRegistry[otherCat].forEach(feature => {
            // Só verificar se não está em shared
            if (!featureRegistry.shared.includes(feature as any)) {
              expect(visibleFeatures).not.toContain(feature);
            }
          });
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2b: isFeatureVisible is consistent with getVisibleFeatures
   */
  it('Property 2b: isFeatureVisible is consistent with getVisibleFeatures', () => {
    const featureArb = fc.constantFrom(...getAllFeatures());
    
    fc.assert(
      fc.property(characterIdArb, featureArb, (characterId, featureId) => {
        const visibleFeatures = getVisibleFeatures(characterId);
        const isVisible = isFeatureVisible(characterId, featureId);
        
        expect(isVisible).toBe(visibleFeatures.includes(featureId));
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Complete Style Contains All Features
   * For any feature in the system, if the character style is "complete", 
   * that feature should be visible.
   * 
   * **Validates: Requirements 5.1, 5.2**
   */
  it('Property 3: Complete Style Contains All Features', () => {
    const allFeatures = getAllFeatures();
    const featureArb = fc.constantFrom(...allFeatures);
    
    fc.assert(
      fc.property(featureArb, (featureId) => {
        const isVisible = isFeatureVisible('complete', featureId);
        expect(isVisible).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3b: Complete style features is superset of all other styles
   */
  it('Property 3b: Complete style features is superset of all other styles', () => {
    const nonCompleteIds = fc.constantFrom<CharacterId>('health', 'nutrition', 'exercise');
    
    fc.assert(
      fc.property(nonCompleteIds, (characterId) => {
        const completeFeatures = getVisibleFeatures('complete');
        const styleFeatures = getVisibleFeatures(characterId);
        
        // Todas as features do estilo devem estar no complete
        styleFeatures.forEach(feature => {
          expect(completeFeatures).toContain(feature);
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Shared features are always visible
   */
  it('Shared features are always visible for any character', () => {
    const sharedFeatureArb = fc.constantFrom(...featureRegistry.shared);
    
    fc.assert(
      fc.property(characterIdArb, sharedFeatureArb, (characterId, sharedFeature) => {
        const isVisible = isFeatureVisible(characterId, sharedFeature);
        expect(isVisible).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Null character shows all features (fallback behavior)
   */
  it('Null character shows all features', () => {
    const featureArb = fc.constantFrom(...getAllFeatures());
    
    fc.assert(
      fc.property(featureArb, (featureId) => {
        const isVisible = isFeatureVisible(null, featureId);
        expect(isVisible).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
