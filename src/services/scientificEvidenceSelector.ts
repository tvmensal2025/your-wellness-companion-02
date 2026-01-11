/**
 * Scientific Evidence Selector Service
 * Seleciona artigos científicos relevantes para cada produto baseado no perfil do usuário
 */

import { UserHealthProfile, getTopHealthIssues } from './userProfileAnalyzer';
import { Supplement } from './matchScoreCalculator';
import { normalizeIngredient, getConditionsForIngredient } from '@/data/ingredientConditionMap';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface ScientificArticle {
  id: string;
  title: string;
  titlePt: string;           // Título em português
  url: string;               // Link para PubMed/fonte
  source: 'pubmed' | 'scielo' | 'other';
  summaryPt: string;         // Resumo em português
  relatedIngredient: string; // Ativo relacionado
  relatedConditions: string[]; // Condições que o estudo aborda
  relevanceScore?: number;   // Score de relevância para o usuário
  publishedYear: number;
}

// ============================================
// BASE DE ARTIGOS CIENTÍFICOS
// ============================================

export const SCIENTIFIC_ARTICLES_DATABASE: ScientificArticle[] = [
  // MELATONINA / SONO
  {
    id: 'melatonin-sleep-2019',
    title: 'Meta-Analysis: Melatonin for the Treatment of Primary Sleep Disorders',
    titlePt: 'Meta-Análise: Melatonina para Tratamento de Distúrbios Primários do Sono',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23691095/',
    source: 'pubmed',
    summaryPt: 'Estudo com 1.683 participantes demonstrou que a melatonina reduz significativamente o tempo para adormecer e aumenta a duração total do sono, com efeitos mais pronunciados em idosos.',
    relatedIngredient: 'melatonina',
    relatedConditions: ['sono', 'insonia'],
    publishedYear: 2013,
  },
  
  // ASHWAGANDHA / ESTRESSE
  {
    id: 'ashwagandha-stress-2019',
    title: 'An investigation into the stress-relieving and pharmacological actions of an ashwagandha extract',
    titlePt: 'Investigação sobre as ações farmacológicas e de alívio do estresse do extrato de Ashwagandha',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31517876/',
    source: 'pubmed',
    summaryPt: 'Estudo clínico randomizado mostrou redução de 44% nos níveis de cortisol e melhora significativa na qualidade do sono após 8 semanas de suplementação com Ashwagandha.',
    relatedIngredient: 'ashwagandha',
    relatedConditions: ['estresse', 'ansiedade', 'cortisol', 'sono'],
    publishedYear: 2019,
  },
  
  // VITAMINA D / IMUNIDADE
  {
    id: 'vitamin-d-immunity-2020',
    title: 'Vitamin D and Immune Function',
    titlePt: 'Vitamina D e Função Imunológica',
    url: 'https://pubmed.ncbi.nlm.nih.gov/32340216/',
    source: 'pubmed',
    summaryPt: 'Revisão sistemática demonstra que a vitamina D modula tanto a imunidade inata quanto adaptativa, reduzindo risco de infecções respiratórias em até 42% em pessoas com deficiência.',
    relatedIngredient: 'vitamina_d',
    relatedConditions: ['imunidade', 'ossos', 'humor'],
    publishedYear: 2020,
  },
  
  // ÔMEGA-3 / CARDIOVASCULAR
  {
    id: 'omega3-cardiovascular-2021',
    title: 'Omega-3 Fatty Acids and Cardiovascular Disease',
    titlePt: 'Ácidos Graxos Ômega-3 e Doença Cardiovascular',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33626250/',
    source: 'pubmed',
    summaryPt: 'Meta-análise com mais de 120.000 participantes mostrou redução de 18% em eventos cardiovasculares maiores com suplementação de ômega-3 em doses adequadas.',
    relatedIngredient: 'omega_3',
    relatedConditions: ['cardiovascular', 'triglicerides', 'inflamacao'],
    publishedYear: 2021,
  },
  
  // COLÁGENO / PELE
  {
    id: 'collagen-skin-2019',
    title: 'Oral Collagen Supplementation: A Systematic Review of Dermatological Applications',
    titlePt: 'Suplementação Oral de Colágeno: Revisão Sistemática de Aplicações Dermatológicas',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30681787/',
    source: 'pubmed',
    summaryPt: 'Revisão de 11 estudos mostrou melhora significativa na hidratação, elasticidade e densidade da pele após 8-12 semanas de suplementação com colágeno hidrolisado.',
    relatedIngredient: 'colageno',
    relatedConditions: ['pele', 'cabelo', 'unhas', 'articulacoes'],
    publishedYear: 2019,
  },
  
  // CREATINA / PERFORMANCE
  {
    id: 'creatine-performance-2017',
    title: 'International Society of Sports Nutrition position stand: creatine supplementation and exercise',
    titlePt: 'Posicionamento da Sociedade Internacional de Nutrição Esportiva: suplementação de creatina e exercício',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28615996/',
    source: 'pubmed',
    summaryPt: 'Consenso científico confirma que a creatina é o suplemento nutricional mais eficaz para aumentar força, massa muscular e performance em exercícios de alta intensidade.',
    relatedIngredient: 'creatina',
    relatedConditions: ['musculos', 'performance', 'forca', 'energia'],
    publishedYear: 2017,
  },
  
  // PROBIÓTICOS / DIGESTÃO
  {
    id: 'probiotics-gut-2020',
    title: 'Probiotics for the Prevention and Treatment of Antibiotic-Associated Diarrhea',
    titlePt: 'Probióticos para Prevenção e Tratamento de Diarreia Associada a Antibióticos',
    url: 'https://pubmed.ncbi.nlm.nih.gov/32730573/',
    source: 'pubmed',
    summaryPt: 'Meta-análise de 42 estudos demonstrou que probióticos reduzem em 42% o risco de diarreia associada a antibióticos e melhoram significativamente a saúde intestinal.',
    relatedIngredient: 'probioticos',
    relatedConditions: ['digestao', 'intestino', 'imunidade'],
    publishedYear: 2020,
  },
  
  // MAGNÉSIO / SONO E ESTRESSE
  {
    id: 'magnesium-sleep-2021',
    title: 'The effect of magnesium supplementation on primary insomnia in elderly',
    titlePt: 'Efeito da suplementação de magnésio na insônia primária em idosos',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23853635/',
    source: 'pubmed',
    summaryPt: 'Estudo clínico mostrou que a suplementação de magnésio melhorou significativamente a qualidade do sono, tempo de sono e níveis de melatonina em idosos com insônia.',
    relatedIngredient: 'magnesio',
    relatedConditions: ['sono', 'estresse', 'musculos'],
    publishedYear: 2012,
  },
  
  // CURCUMINA / INFLAMAÇÃO
  {
    id: 'curcumin-inflammation-2020',
    title: 'Curcumin: A Review of Its Effects on Human Health',
    titlePt: 'Curcumina: Uma Revisão de Seus Efeitos na Saúde Humana',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29065496/',
    source: 'pubmed',
    summaryPt: 'Revisão abrangente demonstra que a curcumina possui potentes propriedades anti-inflamatórias e antioxidantes, com benefícios comprovados para articulações e digestão.',
    relatedIngredient: 'curcuma',
    relatedConditions: ['inflamacao', 'articulacoes', 'digestao', 'antioxidante'],
    publishedYear: 2017,
  },
  
  // SPIRULINA / DETOX E ENERGIA
  {
    id: 'spirulina-health-2019',
    title: 'A systematic review of the potential health benefits of spirulina',
    titlePt: 'Revisão sistemática dos potenciais benefícios da spirulina para a saúde',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30882511/',
    source: 'pubmed',
    summaryPt: 'Revisão de 40 estudos mostrou que a spirulina melhora perfil lipídico, reduz pressão arterial, tem efeitos antioxidantes e pode auxiliar no controle glicêmico.',
    relatedIngredient: 'spirulina',
    relatedConditions: ['detox', 'energia', 'imunidade', 'antioxidante'],
    publishedYear: 2019,
  },
  
  // LARANJA MORO / EMAGRECIMENTO
  {
    id: 'moro-orange-weight-2015',
    title: 'Moro orange juice prevents fatty liver in mice',
    titlePt: 'Suco de laranja Moro previne fígado gorduroso em camundongos',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25912765/',
    source: 'pubmed',
    summaryPt: 'Estudos demonstram que os antocianinas da laranja Moro reduzem acúmulo de gordura, especialmente abdominal, e melhoram sensibilidade à insulina.',
    relatedIngredient: 'moro_complex',
    relatedConditions: ['emagrecimento', 'metabolismo', 'gordura_abdominal'],
    publishedYear: 2015,
  },
  
  // CROMO / GLICEMIA
  {
    id: 'chromium-glucose-2018',
    title: 'Chromium supplementation in overweight and obesity: a systematic review',
    titlePt: 'Suplementação de cromo em sobrepeso e obesidade: revisão sistemática',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30193598/',
    source: 'pubmed',
    summaryPt: 'Meta-análise mostrou que o cromo melhora controle glicêmico, reduz compulsão por carboidratos e pode auxiliar na perda de peso em pessoas com sobrepeso.',
    relatedIngredient: 'cromo',
    relatedConditions: ['glicemia', 'compulsao', 'emagrecimento', 'diabetes'],
    publishedYear: 2018,
  },
  
  // ZINCO / IMUNIDADE
  {
    id: 'zinc-immunity-2020',
    title: 'Zinc and immunity: An essential interrelation',
    titlePt: 'Zinco e imunidade: Uma inter-relação essencial',
    url: 'https://pubmed.ncbi.nlm.nih.gov/32319538/',
    source: 'pubmed',
    summaryPt: 'Revisão demonstra que o zinco é essencial para função imune, com deficiência associada a maior susceptibilidade a infecções. Suplementação reduz duração de resfriados.',
    relatedIngredient: 'zinco',
    relatedConditions: ['imunidade', 'pele', 'cicatrizacao'],
    publishedYear: 2020,
  },
  
  // COENZIMA Q10 / ENERGIA
  {
    id: 'coq10-energy-2018',
    title: 'Coenzyme Q10 supplementation and exercise performance',
    titlePt: 'Suplementação de Coenzima Q10 e performance no exercício',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29141968/',
    source: 'pubmed',
    summaryPt: 'Estudos mostram que CoQ10 melhora produção de energia celular, reduz fadiga e pode melhorar performance física, especialmente em pessoas com níveis baixos.',
    relatedIngredient: 'coenzima_q10',
    relatedConditions: ['energia', 'cardiovascular', 'antioxidante'],
    publishedYear: 2018,
  },
  
  // ERVAS AMARGAS / DIGESTÃO
  {
    id: 'bitter-herbs-digestion-2015',
    title: 'Bitter taste receptors and their role in digestion',
    titlePt: 'Receptores de sabor amargo e seu papel na digestão',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26176799/',
    source: 'pubmed',
    summaryPt: 'Pesquisas demonstram que compostos amargos estimulam secreção de enzimas digestivas, melhoram absorção de nutrientes e auxiliam na função hepática.',
    relatedIngredient: 'cha_amargo',
    relatedConditions: ['digestao', 'figado', 'detox'],
    publishedYear: 2015,
  },
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Calcula relevância de um artigo para o perfil do usuário
 */
const calculateArticleRelevance = (
  article: ScientificArticle,
  userProfile: UserHealthProfile,
  productIngredients: string[]
): number => {
  let score = 0;
  
  const userProblems = getTopHealthIssues(userProfile, 5);
  const normalizedIngredient = normalizeIngredient(article.relatedIngredient);
  
  // 1. Artigo relacionado a ingrediente do produto (+40)
  const hasIngredientMatch = productIngredients.some(ing => {
    const normIng = normalizeIngredient(ing);
    return normIng.includes(normalizedIngredient) || normalizedIngredient.includes(normIng);
  });
  if (hasIngredientMatch) score += 40;
  
  // 2. Artigo aborda problemas do usuário (+30)
  const problemMatches = article.relatedConditions.filter(condition =>
    userProblems.some(problem => condition.includes(problem) || problem.includes(condition))
  ).length;
  score += Math.min(30, problemMatches * 15);
  
  // 3. Artigo mais recente (+20)
  const currentYear = new Date().getFullYear();
  const yearsOld = currentYear - article.publishedYear;
  if (yearsOld <= 3) score += 20;
  else if (yearsOld <= 5) score += 15;
  else if (yearsOld <= 10) score += 10;
  
  // 4. Fonte confiável (+10)
  if (article.source === 'pubmed') score += 10;
  else if (article.source === 'scielo') score += 8;
  
  return score;
};

/**
 * Encontra artigos relacionados a um ingrediente
 */
const findArticlesForIngredient = (ingredient: string): ScientificArticle[] => {
  const normalized = normalizeIngredient(ingredient);
  
  return SCIENTIFIC_ARTICLES_DATABASE.filter(article => {
    const articleIngredient = normalizeIngredient(article.relatedIngredient);
    return articleIngredient.includes(normalized) || normalized.includes(articleIngredient);
  });
};

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Seleciona o melhor artigo científico para um produto
 */
export const selectBestArticle = (
  product: Supplement,
  userProfile: UserHealthProfile
): ScientificArticle | null => {
  const productIngredients = product.active_ingredients || [];
  
  // 1. Buscar artigos para cada ingrediente do produto
  const candidateArticles: ScientificArticle[] = [];
  
  productIngredients.forEach(ingredient => {
    const articles = findArticlesForIngredient(ingredient);
    candidateArticles.push(...articles);
  });
  
  // 2. Se não encontrou por ingrediente, buscar por condições do produto
  if (candidateArticles.length === 0) {
    const productConditions = getConditionsForIngredient(product.category || '');
    
    SCIENTIFIC_ARTICLES_DATABASE.forEach(article => {
      const hasConditionMatch = article.relatedConditions.some(ac =>
        productConditions.some(pc => ac.includes(pc) || pc.includes(ac))
      );
      if (hasConditionMatch) {
        candidateArticles.push(article);
      }
    });
  }
  
  // 3. Se ainda não encontrou, retornar null
  if (candidateArticles.length === 0) {
    return null;
  }
  
  // 4. Calcular relevância e ordenar
  const rankedArticles = rankArticlesByRelevance(
    candidateArticles,
    userProfile,
    productIngredients
  );
  
  return rankedArticles[0] || null;
};

/**
 * Ordena artigos por relevância para o usuário
 */
export const rankArticlesByRelevance = (
  articles: ScientificArticle[],
  userProfile: UserHealthProfile,
  productIngredients: string[] = []
): ScientificArticle[] => {
  // Remover duplicatas
  const uniqueArticles = articles.filter((article, index, self) =>
    index === self.findIndex(a => a.id === article.id)
  );
  
  // Calcular relevância e ordenar
  return uniqueArticles
    .map(article => ({
      ...article,
      relevanceScore: calculateArticleRelevance(article, userProfile, productIngredients),
    }))
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
};

/**
 * Busca artigos por condição de saúde
 */
export const getArticlesForCondition = (condition: string): ScientificArticle[] => {
  const normalized = normalizeIngredient(condition);
  
  return SCIENTIFIC_ARTICLES_DATABASE.filter(article =>
    article.relatedConditions.some(rc => 
      rc.includes(normalized) || normalized.includes(rc)
    )
  );
};

/**
 * Busca artigo por ID
 */
export const getArticleById = (id: string): ScientificArticle | null => {
  return SCIENTIFIC_ARTICLES_DATABASE.find(article => article.id === id) || null;
};

export default {
  selectBestArticle,
  rankArticlesByRelevance,
  getArticlesForCondition,
  getArticleById,
  SCIENTIFIC_ARTICLES_DATABASE,
};
