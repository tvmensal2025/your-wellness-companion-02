/**
 * Personalized Argument Generator Service
 * Gera textos persuasivos personalizados para cada produto baseado no perfil do usuário
 */

import { UserHealthProfile, getTopHealthIssues } from './userProfileAnalyzer';
import { MatchScoreResult, Supplement } from './matchScoreCalculator';
import { GOAL_CONDITION_MAP } from '@/data/ingredientConditionMap';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface PersonalizedArgument {
  mainText: string;           // Texto principal personalizado
  userDataMentioned: string[]; // Dados do usuário mencionados
  benefitsHighlighted: string[]; // Benefícios destacados
  emotionalTone: 'empathetic' | 'motivational' | 'informative';
  shortText: string;          // Versão curta para cards compactos
}

// ============================================
// TEMPLATES DE ARGUMENTOS
// ============================================

const GOAL_TEMPLATES: Record<string, string[]> = {
  lose_weight: [
    "Como você está focado em {goal}, {product} pode acelerar seus resultados com {ingredient} que {benefit}.",
    "Para quem busca {goal} como você, {product} oferece {ingredient} - comprovado cientificamente para {benefit}.",
    "Seu objetivo de {goal} fica mais alcançável com {product}. O {ingredient} ajuda a {benefit}.",
  ],
  gain_mass: [
    "Para construir massa muscular como você deseja, {product} fornece {ingredient} essencial para {benefit}.",
    "Seu objetivo de ganhar massa é potencializado com {product}. O {ingredient} é fundamental para {benefit}.",
    "Como você quer {goal}, {product} com {ingredient} vai ajudar a {benefit}.",
  ],
  maintain: [
    "Para manter sua saúde em dia, {product} oferece {ingredient} que ajuda a {benefit}.",
    "Seu foco em manutenção da saúde combina perfeitamente com {product} e seu {ingredient}.",
  ],
  health: [
    "Para melhorar sua saúde geral, {product} traz {ingredient} que {benefit}.",
    "Cuidar da saúde como você faz fica mais fácil com {product} e seu {ingredient}.",
  ],
};

const PROBLEM_TEMPLATES: Record<string, string[]> = {
  sono: [
    "Notei que você tem dificuldades com o sono. {product} contém {ingredient} que ajuda a {benefit}.",
    "Para melhorar a qualidade do seu sono, {product} com {ingredient} pode fazer diferença.",
    "Suas noites podem melhorar com {product}. O {ingredient} é conhecido por {benefit}.",
  ],
  estresse: [
    "Sei que o estresse tem sido um desafio para você. {product} com {ingredient} ajuda a {benefit}.",
    "Para lidar melhor com o estresse do dia a dia, {product} oferece {ingredient}.",
    "O {ingredient} em {product} é ideal para quem, como você, enfrenta estresse elevado.",
  ],
  energia: [
    "Percebi que você sente falta de energia. {product} pode ajudar com {ingredient} que {benefit}.",
    "Para ter mais disposição no seu dia, {product} traz {ingredient} - perfeito para {benefit}.",
    "Sua energia pode aumentar com {product}. O {ingredient} é comprovado para {benefit}.",
  ],
  digestão: [
    "Para melhorar sua digestão, {product} contém {ingredient} que {benefit}.",
    "Seus problemas digestivos podem melhorar com {product} e seu {ingredient}.",
  ],
  digestao: [
    "Para melhorar sua digestão, {product} contém {ingredient} que {benefit}.",
    "Seus problemas digestivos podem melhorar com {product} e seu {ingredient}.",
  ],
  imunidade: [
    "Para fortalecer sua imunidade, {product} oferece {ingredient} que {benefit}.",
    "Sua defesa natural fica mais forte com {product} e seu {ingredient}.",
  ],
  foco: [
    "Notei que você busca melhorar o foco. {product} com {ingredient} pode ajudar a {benefit}.",
    "Para mais concentração no dia a dia, {product} traz {ingredient}.",
  ],
  dor: [
    "Para aliviar desconfortos, {product} contém {ingredient} que {benefit}.",
    "O {ingredient} em {product} pode ajudar com as dores que você mencionou.",
  ],
};

const DEFICIENCY_TEMPLATES: Record<string, string[]> = {
  proteina: [
    "Sua alimentação pode estar baixa em proteína. {product} ajuda a complementar com {ingredient}.",
    "Para suprir a necessidade de proteína, {product} é uma excelente opção.",
  ],
  omega3: [
    "Notei que você pode precisar de mais ômega-3. {product} oferece {ingredient} de qualidade.",
    "Para equilibrar seus ácidos graxos, {product} com {ingredient} é ideal.",
  ],
  vitaminas_frutas: [
    "Sua dieta pode estar carente de vitaminas de frutas. {product} ajuda a complementar.",
  ],
  vitaminas_vegetais: [
    "Para compensar a falta de vegetais, {product} oferece nutrientes essenciais.",
  ],
  fibras: [
    "Sua alimentação pode precisar de mais fibras. {product} ajuda nesse equilíbrio.",
  ],
};

const GENERIC_TEMPLATES = [
  "{product} é especialmente indicado para o seu perfil. Com {ingredient}, você pode {benefit}.",
  "Baseado no seu histórico, {product} pode trazer benefícios significativos com {ingredient}.",
  "Para alguém com seu perfil, {product} oferece {ingredient} que ajuda a {benefit}.",
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Mapeia objetivo para texto legível
 */
const goalToText = (goal: string): string => {
  const map: Record<string, string> = {
    lose_weight: 'perder peso',
    gain_mass: 'ganhar massa muscular',
    maintain: 'manter a saúde',
    health: 'melhorar a saúde',
  };
  return map[goal] || 'melhorar sua saúde';
};

/**
 * Seleciona template aleatório de uma lista
 */
const selectTemplate = (templates: string[]): string => {
  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * Extrai ingrediente principal do produto
 */
const getMainIngredient = (product: Supplement): string => {
  if (product.active_ingredients && product.active_ingredients.length > 0) {
    return product.active_ingredients[0];
  }
  // Tentar extrair do nome
  const name = product.name.toLowerCase();
  if (name.includes('colageno') || name.includes('colágeno')) return 'Colágeno';
  if (name.includes('creatina')) return 'Creatina';
  if (name.includes('omega') || name.includes('ômega')) return 'Ômega-3';
  if (name.includes('vitamina')) return 'Vitaminas';
  if (name.includes('spirulina')) return 'Spirulina';
  if (name.includes('moro')) return 'Laranja Moro';
  if (name.includes('cromo')) return 'Cromo';
  if (name.includes('amargo')) return 'Ervas Amargas';
  if (name.includes('dtox') || name.includes('detox')) return 'Complexo Detox';
  
  return product.category || 'ingredientes naturais';
};

/**
 * Extrai benefício principal do produto
 */
const getMainBenefit = (product: Supplement, matchScore: MatchScoreResult): string => {
  // Priorizar benefícios que matcham com condições do usuário
  if (product.benefits && product.benefits.length > 0) {
    const matchedBenefit = product.benefits.find(b => 
      matchScore.matchedConditions.some(mc => 
        b.toLowerCase().includes(mc) || mc.includes(b.toLowerCase().split(' ')[0])
      )
    );
    if (matchedBenefit) return matchedBenefit.toLowerCase();
    return product.benefits[0].toLowerCase();
  }
  
  // Benefícios baseados na categoria
  const category = (product.category || '').toLowerCase();
  if (category.includes('emagrecimento')) return 'acelerar o metabolismo';
  if (category.includes('energia')) return 'aumentar a disposição';
  if (category.includes('sono')) return 'melhorar a qualidade do sono';
  if (category.includes('imunidade')) return 'fortalecer as defesas';
  if (category.includes('beleza')) return 'melhorar pele e cabelos';
  
  return 'melhorar sua saúde';
};

/**
 * Determina tom emocional baseado no perfil
 */
const determineEmotionalTone = (
  profile: UserHealthProfile, 
  matchScore: MatchScoreResult
): 'empathetic' | 'motivational' | 'informative' => {
  // Se tem problemas de saúde significativos, ser empático
  const topIssues = getTopHealthIssues(profile, 3);
  if (topIssues.includes('estresse') || topIssues.includes('sono') || topIssues.includes('dor')) {
    return 'empathetic';
  }
  
  // Se objetivo é ganhar massa ou perder peso, ser motivacional
  if (profile.primaryGoal === 'gain_mass' || profile.primaryGoal === 'lose_weight') {
    return 'motivational';
  }
  
  // Caso contrário, ser informativo
  return 'informative';
};

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

/**
 * Gera argumento personalizado para um produto
 */
export const generatePersonalizedArgument = (
  product: Supplement,
  userProfile: UserHealthProfile,
  matchScore: MatchScoreResult
): PersonalizedArgument => {
  const userDataMentioned: string[] = [];
  const benefitsHighlighted: string[] = [];
  
  const ingredient = getMainIngredient(product);
  const benefit = getMainBenefit(product, matchScore);
  const goal = goalToText(userProfile.primaryGoal);
  const topIssues = getTopHealthIssues(userProfile, 3);
  
  let template = '';
  let mainText = '';
  
  // 1. Tentar template baseado em problema de saúde (mais personalizado)
  if (topIssues.length > 0 && matchScore.matchedConditions.length > 0) {
    const matchedProblem = topIssues.find(issue => 
      PROBLEM_TEMPLATES[issue] && 
      matchScore.matchedConditions.some(mc => mc.includes(issue) || issue.includes(mc))
    );
    
    if (matchedProblem && PROBLEM_TEMPLATES[matchedProblem]) {
      template = selectTemplate(PROBLEM_TEMPLATES[matchedProblem]);
      userDataMentioned.push(`problema: ${matchedProblem}`);
    }
  }
  
  // 2. Se não encontrou, tentar template baseado em objetivo
  if (!template && GOAL_TEMPLATES[userProfile.primaryGoal]) {
    template = selectTemplate(GOAL_TEMPLATES[userProfile.primaryGoal]);
    userDataMentioned.push(`objetivo: ${goal}`);
  }
  
  // 3. Se não encontrou, tentar template baseado em deficiência
  if (!template && userProfile.nutritionalDeficiencies.length > 0) {
    const deficiency = userProfile.nutritionalDeficiencies[0];
    if (DEFICIENCY_TEMPLATES[deficiency]) {
      template = selectTemplate(DEFICIENCY_TEMPLATES[deficiency]);
      userDataMentioned.push(`deficiência: ${deficiency}`);
    }
  }
  
  // 4. Fallback para template genérico
  if (!template) {
    template = selectTemplate(GENERIC_TEMPLATES);
    userDataMentioned.push(`perfil geral`);
  }
  
  // Substituir placeholders
  mainText = template
    .replace(/{product}/g, product.name)
    .replace(/{ingredient}/g, ingredient)
    .replace(/{benefit}/g, benefit)
    .replace(/{goal}/g, goal);
  
  // Adicionar dados extras se o texto ficou muito genérico
  if (userDataMentioned.length < 2) {
    // Adicionar menção ao IMC se relevante
    if (userProfile.bmi > 25 && userProfile.primaryGoal === 'lose_weight') {
      userDataMentioned.push(`IMC: ${userProfile.bmi.toFixed(1)}`);
    }
    // Adicionar menção à idade se relevante
    if (userProfile.age > 40) {
      userDataMentioned.push(`idade: ${userProfile.age} anos`);
    }
  }
  
  // Extrair benefícios destacados
  if (product.benefits) {
    benefitsHighlighted.push(...product.benefits.slice(0, 3));
  }
  
  // Gerar versão curta
  const shortText = `${ingredient} para ${benefit}`;
  
  return {
    mainText,
    userDataMentioned,
    benefitsHighlighted,
    emotionalTone: determineEmotionalTone(userProfile, matchScore),
    shortText,
  };
};

/**
 * Gera argumentos para múltiplos produtos
 */
export const generateArgumentsForProducts = (
  products: Array<{ product: Supplement; matchScore: MatchScoreResult }>,
  userProfile: UserHealthProfile
): Array<{ product: Supplement; matchScore: MatchScoreResult; argument: PersonalizedArgument }> => {
  return products.map(({ product, matchScore }) => ({
    product,
    matchScore,
    argument: generatePersonalizedArgument(product, userProfile, matchScore),
  }));
};

export default {
  generatePersonalizedArgument,
  generateArgumentsForProducts,
};
