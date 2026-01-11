/**
 * Match Score Calculator Service
 * Calcula a compatibilidade entre produtos e perfil do usuário
 */

import { UserHealthProfile, getTopHealthIssues } from './userProfileAnalyzer';
import { 
  INGREDIENT_CONDITION_MAP, 
  GOAL_CONDITION_MAP, 
  HEALTH_ISSUE_CONDITION_MAP,
  normalizeIngredient,
  getConditionsForIngredient 
} from '@/data/ingredientConditionMap';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface MatchScoreBreakdown {
  goalAlignment: number;      // 40% weight - Alinhamento com objetivo
  problemResolution: number;  // 30% weight - Resolução de problemas
  deficiencyFill: number;     // 20% weight - Preenchimento de deficiências
  purchaseHistory: number;    // 10% weight - Histórico de compras
}

export interface MatchScoreResult {
  totalScore: number; // 0-100
  breakdown: MatchScoreBreakdown;
  badge: 'ideal' | 'recommended' | 'may_help';
  badgeLabel: string;
  badgeColor: string;
  matchedConditions: string[]; // Condições que o produto resolve para o usuário
  matchedIngredients: string[]; // Ingredientes relevantes
}

export interface Supplement {
  id: string;
  name: string;
  external_id?: string;
  category: string;
  categories?: string[];
  brand?: string;
  image_url?: string;
  original_price?: number;
  discount_price?: number;
  description?: string;
  active_ingredients?: string[];
  benefits?: string[];
  benefit_tags?: string[];
  target_conditions?: string[];
  target_goals?: string[];
  recommended_dosage?: string;
  scientific_studies?: string[];
}

// ============================================
// CONSTANTES
// ============================================

const WEIGHTS = {
  GOAL_ALIGNMENT: 0.40,
  PROBLEM_RESOLUTION: 0.30,
  DEFICIENCY_FILL: 0.20,
  PURCHASE_HISTORY: 0.10,
};

const BADGE_THRESHOLDS = {
  IDEAL: 80,
  RECOMMENDED: 60,
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Extrai condições que um produto pode resolver baseado em seus ingredientes
 */
const extractProductConditions = (product: Supplement): string[] => {
  const conditions = new Set<string>();
  
  // 1. Condições explícitas do produto
  if (product.target_conditions) {
    product.target_conditions.forEach(c => conditions.add(normalizeIngredient(c)));
  }
  
  // 2. Condições baseadas nos ingredientes ativos
  if (product.active_ingredients) {
    product.active_ingredients.forEach(ingredient => {
      const ingredientConditions = getConditionsForIngredient(ingredient);
      ingredientConditions.forEach(c => conditions.add(c));
    });
  }
  
  // 3. Condições baseadas nos benefícios
  if (product.benefits) {
    product.benefits.forEach(benefit => {
      const normalized = normalizeIngredient(benefit);
      // Mapear benefícios comuns para condições
      if (normalized.includes('sono') || normalized.includes('dormir')) conditions.add('sono');
      if (normalized.includes('energia') || normalized.includes('disposicao')) conditions.add('energia');
      if (normalized.includes('estresse') || normalized.includes('ansiedade')) conditions.add('estresse');
      if (normalized.includes('imunidade') || normalized.includes('defesa')) conditions.add('imunidade');
      if (normalized.includes('digestao') || normalized.includes('intestino')) conditions.add('digestao');
      if (normalized.includes('foco') || normalized.includes('concentracao')) conditions.add('foco');
      if (normalized.includes('emagrecimento') || normalized.includes('peso')) conditions.add('emagrecimento');
      if (normalized.includes('musculo') || normalized.includes('massa')) conditions.add('musculos');
      if (normalized.includes('pele') || normalized.includes('colageno')) conditions.add('pele');
      if (normalized.includes('articulacao') || normalized.includes('dor')) conditions.add('articulacoes');
    });
  }
  
  // 4. Condições baseadas na categoria
  const category = normalizeIngredient(product.category || '');
  if (category.includes('emagrecimento')) conditions.add('emagrecimento');
  if (category.includes('energia')) conditions.add('energia');
  if (category.includes('sono')) conditions.add('sono');
  if (category.includes('imunidade')) conditions.add('imunidade');
  if (category.includes('beleza')) {
    conditions.add('pele');
    conditions.add('cabelo');
  }
  
  return Array.from(conditions);
};

/**
 * Calcula score de alinhamento com objetivo (40%)
 */
const calculateGoalAlignment = (product: Supplement, profile: UserHealthProfile): number => {
  const goalConditions = GOAL_CONDITION_MAP[profile.primaryGoal] || [];
  const productConditions = extractProductConditions(product);
  
  if (goalConditions.length === 0) return 50; // Score neutro se não há objetivo definido
  
  // Contar quantas condições do objetivo o produto atende
  const matchCount = goalConditions.filter(gc => 
    productConditions.some(pc => pc.includes(gc) || gc.includes(pc))
  ).length;
  
  // Score proporcional ao match
  return Math.min(100, (matchCount / Math.min(goalConditions.length, 3)) * 100);
};

/**
 * Calcula score de resolução de problemas (30%)
 */
const calculateProblemResolution = (product: Supplement, profile: UserHealthProfile): number => {
  const userProblems = getTopHealthIssues(profile, 5);
  const productConditions = extractProductConditions(product);
  
  if (userProblems.length === 0) return 50; // Score neutro se não há problemas
  
  let totalScore = 0;
  let matchedProblems = 0;
  
  userProblems.forEach((problem, index) => {
    const problemConditions = HEALTH_ISSUE_CONDITION_MAP[problem] || [problem];
    const hasMatch = problemConditions.some(pc => 
      productConditions.some(prodC => prodC.includes(pc) || pc.includes(prodC))
    );
    
    if (hasMatch) {
      // Problemas mais severos (primeiros na lista) têm mais peso
      const weight = 1 - (index * 0.15);
      totalScore += 100 * weight;
      matchedProblems++;
    }
  });
  
  if (matchedProblems === 0) return 20; // Score baixo se não resolve nenhum problema
  
  return Math.min(100, totalScore / userProblems.length);
};

/**
 * Calcula score de preenchimento de deficiências (20%)
 */
const calculateDeficiencyFill = (product: Supplement, profile: UserHealthProfile): number => {
  const deficiencies = profile.nutritionalDeficiencies;
  const productConditions = extractProductConditions(product);
  const ingredients = product.active_ingredients || [];
  
  if (deficiencies.length === 0) return 60; // Score médio-alto se não há deficiências
  
  let matchCount = 0;
  
  deficiencies.forEach(deficiency => {
    const normalized = normalizeIngredient(deficiency);
    
    // Verificar se produto resolve a deficiência
    const hasMatch = 
      productConditions.some(pc => pc.includes(normalized) || normalized.includes(pc)) ||
      ingredients.some(ing => {
        const normIng = normalizeIngredient(ing);
        return normIng.includes(normalized) || normalized.includes(normIng);
      });
    
    if (hasMatch) matchCount++;
  });
  
  return Math.min(100, (matchCount / deficiencies.length) * 100);
};

/**
 * Calcula score baseado em histórico de compras (10%)
 * Por enquanto retorna score neutro - será implementado com tracking
 */
const calculatePurchaseHistory = (_product: Supplement, _profile: UserHealthProfile): number => {
  // TODO: Implementar quando tivermos tracking de compras
  // - Se já comprou e recomprou: 100
  // - Se comprou uma vez: 70
  // - Se nunca comprou: 50
  // - Se comprou e não recomprou há muito tempo: 30
  return 50;
};

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Calcula o Match Score entre um produto e o perfil do usuário
 */
export const calculateMatchScore = (
  product: Supplement, 
  userProfile: UserHealthProfile
): MatchScoreResult => {
  // Calcular cada componente
  const goalAlignment = calculateGoalAlignment(product, userProfile);
  const problemResolution = calculateProblemResolution(product, userProfile);
  const deficiencyFill = calculateDeficiencyFill(product, userProfile);
  const purchaseHistory = calculatePurchaseHistory(product, userProfile);
  
  // Calcular score total ponderado
  const totalScore = Math.round(
    goalAlignment * WEIGHTS.GOAL_ALIGNMENT +
    problemResolution * WEIGHTS.PROBLEM_RESOLUTION +
    deficiencyFill * WEIGHTS.DEFICIENCY_FILL +
    purchaseHistory * WEIGHTS.PURCHASE_HISTORY
  );
  
  // Determinar badge
  const badge = getBadgeForScore(totalScore);
  
  // Identificar condições e ingredientes matched
  const productConditions = extractProductConditions(product);
  const userProblems = getTopHealthIssues(userProfile, 5);
  const goalConditions = GOAL_CONDITION_MAP[userProfile.primaryGoal] || [];
  
  const matchedConditions = productConditions.filter(pc => 
    userProblems.some(up => {
      const problemConditions = HEALTH_ISSUE_CONDITION_MAP[up] || [up];
      return problemConditions.some(prc => pc.includes(prc) || prc.includes(pc));
    }) ||
    goalConditions.some(gc => pc.includes(gc) || gc.includes(pc))
  );
  
  const matchedIngredients = (product.active_ingredients || []).filter(ing => {
    const conditions = getConditionsForIngredient(ing);
    return conditions.some(c => matchedConditions.includes(c));
  });
  
  return {
    totalScore,
    breakdown: {
      goalAlignment,
      problemResolution,
      deficiencyFill,
      purchaseHistory,
    },
    badge: badge.type,
    badgeLabel: badge.label,
    badgeColor: badge.color,
    matchedConditions,
    matchedIngredients,
  };
};

/**
 * Retorna badge baseado no score
 */
export const getBadgeForScore = (score: number): {
  type: 'ideal' | 'recommended' | 'may_help';
  label: string;
  color: string;
} => {
  if (score >= BADGE_THRESHOLDS.IDEAL) {
    return {
      type: 'ideal',
      label: 'Ideal para você',
      color: 'bg-emerald-500',
    };
  }
  
  if (score >= BADGE_THRESHOLDS.RECOMMENDED) {
    return {
      type: 'recommended',
      label: 'Recomendado',
      color: 'bg-blue-500',
    };
  }
  
  return {
    type: 'may_help',
    label: 'Pode ajudar',
    color: 'bg-gray-500',
  };
};

/**
 * Ordena produtos por Match Score (maior primeiro)
 */
export const sortByMatchScore = (
  products: Supplement[],
  userProfile: UserHealthProfile
): Array<{ product: Supplement; matchScore: MatchScoreResult }> => {
  return products
    .map(product => ({
      product,
      matchScore: calculateMatchScore(product, userProfile),
    }))
    .sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore);
};

/**
 * Filtra produtos com score mínimo
 */
export const filterByMinScore = (
  products: Supplement[],
  userProfile: UserHealthProfile,
  minScore: number = 40
): Array<{ product: Supplement; matchScore: MatchScoreResult }> => {
  return sortByMatchScore(products, userProfile)
    .filter(item => item.matchScore.totalScore >= minScore);
};

export default {
  calculateMatchScore,
  getBadgeForScore,
  sortByMatchScore,
  filterByMinScore,
};
