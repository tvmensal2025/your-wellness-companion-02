/**
 * Mapeamento de Ingredientes para Condições de Saúde
 * Usado pelo sistema de recomendação inteligente de suplementos
 */

// Mapeamento: ingrediente → condições que resolve
export const INGREDIENT_CONDITION_MAP: Record<string, string[]> = {
  // Sono e Relaxamento
  'melatonina': ['sono', 'insonia', 'jet_lag', 'ritmo_circadiano'],
  'valeriana': ['sono', 'ansiedade', 'relaxamento'],
  'passiflora': ['sono', 'ansiedade', 'estresse'],
  'camomila': ['sono', 'digestao', 'relaxamento'],
  'gaba': ['sono', 'ansiedade', 'estresse'],
  'l-teanina': ['sono', 'foco', 'relaxamento', 'ansiedade'],
  
  // Estresse e Ansiedade
  'ashwagandha': ['estresse', 'ansiedade', 'cortisol', 'energia', 'libido'],
  'rhodiola': ['estresse', 'fadiga', 'performance_mental'],
  'magnésio': ['estresse', 'sono', 'musculos', 'energia', 'enxaqueca'],
  'magnesio': ['estresse', 'sono', 'musculos', 'energia', 'enxaqueca'],
  
  // Energia e Performance
  'cafeina': ['energia', 'foco', 'termogenico', 'performance'],
  'guarana': ['energia', 'foco', 'termogenico'],
  'taurina': ['energia', 'performance', 'cardiovascular'],
  'coenzima_q10': ['energia', 'cardiovascular', 'antioxidante'],
  'coq10': ['energia', 'cardiovascular', 'antioxidante'],
  'creatina': ['musculos', 'energia', 'performance', 'forca'],
  'beta_alanina': ['performance', 'resistencia', 'musculos'],
  
  // Imunidade
  'vitamina_c': ['imunidade', 'antioxidante', 'colageno', 'pele'],
  'vitamina_d': ['imunidade', 'ossos', 'humor', 'musculos'],
  'vitamina_d3': ['imunidade', 'ossos', 'humor', 'musculos'],
  'zinco': ['imunidade', 'testosterona', 'pele', 'cicatrizacao'],
  'selenio': ['imunidade', 'tireoide', 'antioxidante'],
  'propolis': ['imunidade', 'garganta', 'antibacteriano'],
  'equinacea': ['imunidade', 'gripe', 'resfriado'],
  
  // Digestão e Intestino
  'probioticos': ['digestao', 'imunidade', 'intestino', 'humor'],
  'prebioticos': ['digestao', 'intestino', 'saciedade'],
  'enzimas_digestivas': ['digestao', 'inchaco', 'absorcao'],
  'glutamina': ['intestino', 'musculos', 'imunidade'],
  'fibras': ['digestao', 'saciedade', 'colesterol'],
  
  // Emagrecimento e Metabolismo
  'moro_complex': ['emagrecimento', 'metabolismo', 'gordura_abdominal'],
  'laranja_moro': ['emagrecimento', 'metabolismo', 'gordura_abdominal'],
  'cromo': ['glicemia', 'diabetes', 'compulsao', 'emagrecimento'],
  'picolinato_cromo': ['glicemia', 'diabetes', 'compulsao', 'emagrecimento'],
  'cha_verde': ['termogenico', 'antioxidante', 'emagrecimento'],
  'capsaicina': ['termogenico', 'metabolismo', 'dor'],
  'l_carnitina': ['emagrecimento', 'energia', 'performance'],
  'cla': ['emagrecimento', 'composicao_corporal'],
  'quitosana': ['emagrecimento', 'colesterol', 'gordura'],
  
  // Beleza e Pele
  'colageno': ['pele', 'articulacoes', 'cabelo', 'unhas'],
  'colageno_hidrolisado': ['pele', 'articulacoes', 'cabelo', 'unhas'],
  'biotina': ['cabelo', 'unhas', 'pele'],
  'acido_hialuronico': ['pele', 'hidratacao', 'articulacoes'],
  'silicio': ['cabelo', 'unhas', 'ossos', 'pele'],
  
  // Cardiovascular
  'omega_3': ['cardiovascular', 'cerebro', 'inflamacao', 'triglicerides'],
  'omega3': ['cardiovascular', 'cerebro', 'inflamacao', 'triglicerides'],
  'oleo_peixe': ['cardiovascular', 'cerebro', 'inflamacao'],
  'fitosterois': ['colesterol', 'cardiovascular'],
  'resveratrol': ['cardiovascular', 'antioxidante', 'longevidade'],
  
  // Articulações e Ossos
  'glucosamina': ['articulacoes', 'cartilagem', 'dor'],
  'condroitina': ['articulacoes', 'cartilagem'],
  'msm': ['articulacoes', 'inflamacao', 'dor'],
  'calcio': ['ossos', 'dentes', 'musculos'],
  'vitamina_k2': ['ossos', 'cardiovascular', 'calcio'],
  
  // Foco e Cognição
  'ginkgo_biloba': ['foco', 'memoria', 'circulacao'],
  'fosfatidilserina': ['foco', 'memoria', 'estresse'],
  'bacopa': ['memoria', 'foco', 'ansiedade'],
  'lion_mane': ['foco', 'memoria', 'neuroprotetor'],
  
  // Detox e Antioxidantes
  'spirulina': ['detox', 'energia', 'nutrientes', 'imunidade'],
  'chlorella': ['detox', 'metais_pesados', 'imunidade'],
  'curcuma': ['inflamacao', 'articulacoes', 'digestao', 'antioxidante'],
  'curcumina': ['inflamacao', 'articulacoes', 'digestao', 'antioxidante'],
  'acai': ['antioxidante', 'energia', 'imunidade'],
  'cha_amargo': ['detox', 'digestao', 'figado'],
  
  // Hormonal
  'maca_peruana': ['libido', 'energia', 'hormonal', 'fertilidade'],
  'tribulus': ['libido', 'testosterona', 'performance'],
  'saw_palmetto': ['prostata', 'cabelo', 'hormonal'],
  'dong_quai': ['hormonal_feminino', 'menopausa', 'tpm'],
  
  // Proteínas e Aminoácidos
  'whey_protein': ['musculos', 'recuperacao', 'saciedade'],
  'bcaa': ['musculos', 'recuperacao', 'energia'],
  'arginina': ['circulacao', 'performance', 'libido'],
  'citrulina': ['circulacao', 'performance', 'energia'],
};

// Mapeamento: condição → ingredientes que ajudam
export const CONDITION_INGREDIENT_MAP: Record<string, string[]> = {};

// Gerar mapeamento reverso automaticamente
Object.entries(INGREDIENT_CONDITION_MAP).forEach(([ingredient, conditions]) => {
  conditions.forEach(condition => {
    if (!CONDITION_INGREDIENT_MAP[condition]) {
      CONDITION_INGREDIENT_MAP[condition] = [];
    }
    if (!CONDITION_INGREDIENT_MAP[condition].includes(ingredient)) {
      CONDITION_INGREDIENT_MAP[condition].push(ingredient);
    }
  });
});

// Mapeamento de objetivos para condições relacionadas
export const GOAL_CONDITION_MAP: Record<string, string[]> = {
  'lose_weight': ['emagrecimento', 'metabolismo', 'termogenico', 'saciedade', 'gordura_abdominal', 'compulsao'],
  'gain_mass': ['musculos', 'performance', 'recuperacao', 'energia', 'forca', 'proteina'],
  'maintain': ['energia', 'imunidade', 'antioxidante', 'cardiovascular'],
  'health': ['imunidade', 'antioxidante', 'cardiovascular', 'digestao', 'energia'],
};

// Mapeamento de problemas de saúde para condições
export const HEALTH_ISSUE_CONDITION_MAP: Record<string, string[]> = {
  'sono': ['sono', 'insonia', 'relaxamento', 'ritmo_circadiano'],
  'estresse': ['estresse', 'ansiedade', 'cortisol', 'relaxamento'],
  'energia': ['energia', 'fadiga', 'performance', 'metabolismo'],
  'digestão': ['digestao', 'intestino', 'inchaco', 'absorcao'],
  'digestao': ['digestao', 'intestino', 'inchaco', 'absorcao'],
  'imunidade': ['imunidade', 'gripe', 'resfriado', 'antibacteriano'],
  'foco': ['foco', 'memoria', 'concentracao', 'performance_mental'],
  'dor': ['dor', 'inflamacao', 'articulacoes', 'musculos'],
};

/**
 * Normaliza nome do ingrediente para busca no mapa
 */
export const normalizeIngredient = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '_') // Substitui caracteres especiais
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_|_$/g, ''); // Remove underscores no início/fim
};

/**
 * Busca condições que um ingrediente resolve
 */
export const getConditionsForIngredient = (ingredient: string): string[] => {
  const normalized = normalizeIngredient(ingredient);
  
  // Busca exata
  if (INGREDIENT_CONDITION_MAP[normalized]) {
    return INGREDIENT_CONDITION_MAP[normalized];
  }
  
  // Busca parcial
  for (const [key, conditions] of Object.entries(INGREDIENT_CONDITION_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return conditions;
    }
  }
  
  return [];
};

/**
 * Busca ingredientes que ajudam uma condição
 */
export const getIngredientsForCondition = (condition: string): string[] => {
  const normalized = normalizeIngredient(condition);
  return CONDITION_INGREDIENT_MAP[normalized] || [];
};

export default {
  INGREDIENT_CONDITION_MAP,
  CONDITION_INGREDIENT_MAP,
  GOAL_CONDITION_MAP,
  HEALTH_ISSUE_CONDITION_MAP,
  normalizeIngredient,
  getConditionsForIngredient,
  getIngredientsForCondition,
};
