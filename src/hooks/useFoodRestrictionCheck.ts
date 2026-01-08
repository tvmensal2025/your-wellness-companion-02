import { useCallback } from 'react';
import { useUserRestrictions } from './useUserRestrictions';

interface RestrictionCheckResult {
  isRestricted: boolean;
  type: 'forbidden' | 'problematic' | null;
  matchedItem?: string;
}

export const useFoodRestrictionCheck = () => {
  const { restrictions, isLoading } = useUserRestrictions();

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const checkRestriction = useCallback((foodName: string): RestrictionCheckResult => {
    if (isLoading || !foodName) {
      return { isRestricted: false, type: null };
    }

    const normalizedFood = normalizeText(foodName);

    // Verificar alimentos proibidos
    for (const forbidden of restrictions.forbidden_foods) {
      const normalizedForbidden = normalizeText(forbidden);
      if (
        normalizedFood.includes(normalizedForbidden) ||
        normalizedForbidden.includes(normalizedFood)
      ) {
        return {
          isRestricted: true,
          type: 'forbidden',
          matchedItem: forbidden,
        };
      }
    }

    // Verificar alimentos problemáticos
    for (const problematic of restrictions.problematic_foods) {
      const normalizedProblematic = normalizeText(problematic);
      if (
        normalizedFood.includes(normalizedProblematic) ||
        normalizedProblematic.includes(normalizedFood)
      ) {
        return {
          isRestricted: true,
          type: 'problematic',
          matchedItem: problematic,
        };
      }
    }

    return { isRestricted: false, type: null };
  }, [restrictions, isLoading]);

  const checkMultipleFoods = useCallback((foodNames: string[]): RestrictionCheckResult[] => {
    return foodNames.map(name => checkRestriction(name));
  }, [checkRestriction]);

  const getRestrictedFromList = useCallback((foodNames: string[]): {
    forbidden: string[];
    problematic: string[];
  } => {
    const results = checkMultipleFoods(foodNames);
    
    return {
      forbidden: foodNames.filter((_, i) => results[i].type === 'forbidden'),
      problematic: foodNames.filter((_, i) => results[i].type === 'problematic'),
    };
  }, [checkMultipleFoods]);

  return {
    checkRestriction,
    checkMultipleFoods,
    getRestrictedFromList,
    restrictions,
    isLoading,
  };
};

export default useFoodRestrictionCheck;
