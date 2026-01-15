// ========================================
// 🔧 SISTEMA APRIMORADO DE DETECÇÃO DE ALIMENTOS
// Usa tabela TACO para cálculos nutricionais precisos
// Prioridade: Lovable AI (google/gemini-2.5-pro) - MÁXIMA PRECISÃO VISUAL
// ========================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const RATE_LIMIT_DELAY = 500;
const MAX_RETRIES = 3; // 3 retries para garantir sucesso

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cache em memória para TACO (dura durante a requisição)
const tacoCache: Map<string, any> = new Map();

// Configuração de IA - Usando modelo PRO para MÁXIMA PRECISÃO em imagens
let AI_MODEL_CONFIG = {
  model: 'google/gemini-2.5-pro', // Modelo PRO = melhor para análise visual complexa
  max_tokens: 4000, // Mais tokens para análise detalhada
  temperature: 0.1 // Temperatura muito baixa = máxima precisão
};

// ========================================
// 🍽️ MAPEAMENTO PRECISO PARA TACO COM MÉTODO DE PREPARO
// ========================================

// Mapeamento de preparação específica
const TACO_PREPARO: Record<string, string> = {
  // BATATA - diferenciar preparo (CRÍTICO!)
  'batata frita': 'Batata, frita',
  'batata palha': 'Batata, frita',
  'batata chips': 'Batata, frita',
  'batata cozida': 'Batata, cozida',
  'batata assada': 'Batata, assada',
  'purê de batata': 'Batata, cozida',
  'batata': 'Batata, cozida', // default se não especificado
  
  // CARNE BOVINA - não confundir com frango!
  'bife': 'Carne, bovina, contra-filé, grelhado',
  'bife grelhado': 'Carne, bovina, contra-filé, grelhado',
  'bife frito': 'Carne, bovina, contra-filé, frito',
  'bife acebolado': 'Carne, bovina, contra-filé, grelhado',
  'carne bovina': 'Carne, bovina, contra-filé, grelhado',
  'carne vermelha': 'Carne, bovina, contra-filé, grelhado',
  'carne grelhada': 'Carne, bovina, contra-filé, grelhado',
  'carne frita': 'Carne, bovina, contra-filé, frito',
  'carne moída': 'Carne, bovina, moída, refogada',
  'carne assada': 'Carne, bovina, assada',
  'picanha': 'Carne, bovina, picanha, grelhada',
  'filé mignon': 'Carne, bovina, filé mignon, grelhado',
  'alcatra': 'Carne, bovina, alcatra, grelhada',
  'contra-filé': 'Carne, bovina, contra-filé, grelhado',
  'costela': 'Carne, bovina, costela, assada',
  'maminha': 'Carne, bovina, maminha, grelhada',
  'patinho': 'Carne, bovina, patinho, grelhado',
  'acém': 'Carne, bovina, acém, moído, refogado',
  'lagarto': 'Carne, bovina, lagarto, cozido',
  'cupim': 'Carne, bovina, cupim, cozido',
  'músculo': 'Carne, bovina, músculo, cozido',
  'carne': 'Carne, bovina, contra-filé, grelhado', // default = bovina
  
  // FRANGO - específico
  'frango grelhado': 'Frango, peito, sem pele, grelhado',
  'frango frito': 'Frango, coxa, com pele, frita',
  'frango assado': 'Frango, inteiro, assado',
  'frango desfiado': 'Frango, peito, sem pele, cozido',
  'peito de frango': 'Frango, peito, sem pele, grelhado',
  'coxa de frango': 'Frango, coxa, com pele, assada',
  'sobrecoxa': 'Frango, sobrecoxa, com pele, assada',
  'asa de frango': 'Frango, asa, com pele, assada',
  'file de frango': 'Frango, peito, sem pele, grelhado',
  'filé de frango': 'Frango, peito, sem pele, grelhado',
  'frango empanado': 'Frango, filé, à milanesa',
  'frango à milanesa': 'Frango, filé, à milanesa',
  'frango': 'Frango, peito, sem pele, grelhado', // default
  
  // OVO - diferente por preparo
  'ovo frito': 'Ovo, de galinha, inteiro, frito',
  'ovo cozido': 'Ovo, de galinha, inteiro, cozido',
  'ovo mexido': 'Ovo, de galinha, inteiro, mexido',
  'omelete': 'Ovo, de galinha, inteiro, mexido',
  'ovo': 'Ovo, de galinha, inteiro, cozido',
  'ovos': 'Ovo, de galinha, inteiro, cozido',
  
  // PEIXE
  'peixe frito': 'Peixe, frito',
  'peixe grelhado': 'Peixe, grelhado',
  'salmão': 'Salmão, filé, grelhado',
  'salmão grelhado': 'Salmão, filé, grelhado',
  'tilápia': 'Tilápia, filé, grelhado',
  'atum': 'Atum, enlatado',
  'sardinha': 'Sardinha, enlatada',
  'bacalhau': 'Bacalhau, salgado, cozido',
  'peixe': 'Peixe, grelhado',
  
  // PORCO
  'bacon': 'Bacon, grelhado',
  'linguiça': 'Lingüiça, de porco, frita',
  'pernil': 'Carne, suína, pernil, assado',
  'lombo': 'Carne, suína, lombo, assado',
  'torresmo': 'Torresmo',
  'costelinha': 'Carne, suína, costela, assada',
  
  // ARROZ
  'arroz branco': 'Arroz, tipo 1, cozido',
  'arroz': 'Arroz, tipo 1, cozido',
  'arroz integral': 'Arroz, integral, cozido',
  'arroz carreteiro': 'Arroz, tipo 1, cozido',
  'arroz de forno': 'Arroz, tipo 1, cozido',
  
  // FEIJÃO
  'feijão': 'Feijão, carioca, cozido',
  'feijão preto': 'Feijão, preto, cozido',
  'feijão carioca': 'Feijão, carioca, cozido',
  'feijoada': 'Feijoada',
  'tutu de feijão': 'Feijão, carioca, cozido',
  
  // SALGADOS E FRITURAS
  'coxinha': 'Coxinha de frango, frita',
  'pastel': 'Pastel, de carne, frito',
  'empada': 'Empada de frango, pré-cozida, assada',
  'kibe': 'Kibe, frito',
  'bolinha de queijo': 'Bolinha de queijo, frita',
  'risoles': 'Risoles, frito',
  
  // MASSAS
  'macarrão': 'Macarrão, trigo, cozido',
  'espaguete': 'Macarrão, trigo, cozido',
  'lasanha': 'Lasanha, à bolonhesa',
  'nhoque': 'Nhoque, de batata',
  'massa': 'Macarrão, trigo, cozido',
  
  // VEGETAIS
  'salada': 'Alface, crespa, crua',
  'alface': 'Alface, crespa, crua',
  'tomate': 'Tomate',
  'cenoura': 'Cenoura, crua',
  'brócolis': 'Brócolis, cozido',
  'couve': 'Couve, manteiga, crua',
  'couve refogada': 'Couve, manteiga, refogada',
  'repolho': 'Repolho, cru',
  'beterraba': 'Beterraba, crua',
  'pepino': 'Pepino, cru',
  'abobrinha': 'Abobrinha, crua',
  'berinjela': 'Berinjela, crua',
  
  // LANCHES
  'pizza': 'Pizza, de mussarela',
  'hambúrguer': 'Hambúrguer, bovino, grelhado',
  'hamburger': 'Hambúrguer, bovino, grelhado',
  'sanduíche': 'Sanduíche, hambúrguer',
  'hot dog': 'Cachorro-quente',
  'cachorro quente': 'Cachorro-quente',
  'pão de queijo': 'Pão de queijo, assado',
  'pão francês': 'Pão, francês',
  'pão': 'Pão, francês',
  'pão integral': 'Pão, de forma, integral',
  
  // FRUTAS
  'banana': 'Banana, prata, crua',
  'maçã': 'Maçã, fuji, crua',
  'laranja': 'Laranja, pêra, crua',
  'manga': 'Manga, palmer, crua',
  'mamão': 'Mamão, papaia, cru',
  'abacate': 'Abacate, cru',
  'melancia': 'Melancia, crua',
  'uva': 'Uva, itália, crua',
  'morango': 'Morango, cru',
  
  // BEBIDAS
  'café': 'Café, infusão',
  'suco': 'Suco de laranja, integral',
  'suco de laranja': 'Suco de laranja, integral',
  'leite': 'Leite, de vaca, integral',
  'refrigerante': 'Refrigerante, tipo cola',
  
  // LATICÍNIOS
  'queijo': 'Queijo, minas, frescal',
  'queijo minas': 'Queijo, minas, frescal',
  'queijo mussarela': 'Queijo, mussarela',
  'iogurte': 'Iogurte, natural',
  'requeijão': 'Requeijão, cremoso',
  
  // OUTROS
  'farofa': 'Farinha, de mandioca, torrada',
  'mandioca': 'Mandioca, cozida',
  'mandioca frita': 'Mandioca, frita',
  'milho': 'Milho, verde, cru',
  'polenta': 'Polenta, cozida'
};

// Aliases adicionais (sinônimos regionais)
const TACO_SYNONYMS: Record<string, string> = {
  ...TACO_PREPARO,
  'macaxeira': 'mandioca',
  'aipim': 'mandioca',
  'churrasco': 'carne bovina',
  'steak': 'bife',
  'beef': 'carne bovina',
  'chicken': 'frango',
  'rice': 'arroz',
  'beans': 'feijão',
  'french fries': 'batata frita',
  'potato': 'batata',
  'egg': 'ovo',
  'eggs': 'ovos'
};

// ========================================
// 🧠 FALLBACK INTELIGENTE POR CATEGORIA
// ========================================
interface CategoryFallback {
  category: string;
  rate: number;      // kcal por grama
  protein: number;   // g por grama
  carbs: number;     // g por grama
  fat: number;       // g por grama
}

function detectFoodCategoryFallback(name: string): CategoryFallback {
  const n = name.toLowerCase();
  
  // Proteínas fritas/empanadas (alto valor calórico)
  if ((n.includes('empanado') || n.includes('frito') || n.includes('milanesa') || n.includes('nuggets') || n.includes('tiras')) 
      && (n.includes('frango') || n.includes('carne') || n.includes('peixe') || n.includes('chicken'))) {
    return { category: 'proteina_frita', rate: 2.8, protein: 0.18, carbs: 0.15, fat: 0.16 };
  }
  
  // Salgados fritos brasileiros
  if (n.includes('coxinha') || n.includes('pastel') || n.includes('kibe') || n.includes('risole') || n.includes('bolinho')) {
    return { category: 'fritura', rate: 3.0, protein: 0.10, carbs: 0.25, fat: 0.18 };
  }
  
  // Molhos cremosos
  if (n.includes('molho') && (n.includes('cremoso') || n.includes('rosê') || n.includes('rose') || n.includes('branco'))) {
    return { category: 'molho_cremoso', rate: 3.5, protein: 0.02, carbs: 0.05, fat: 0.35 };
  }
  
  // Molhos simples
  if (n.includes('molho')) {
    return { category: 'molho', rate: 0.8, protein: 0.01, carbs: 0.10, fat: 0.04 };
  }
  
  // Proteínas grelhadas/assadas
  if (n.includes('frango') || n.includes('carne') || n.includes('peixe') || n.includes('ovo') || n.includes('bife')) {
    return { category: 'proteina', rate: 2.0, protein: 0.25, carbs: 0, fat: 0.10 };
  }
  
  // Carboidratos
  if (n.includes('arroz') || n.includes('feijão') || n.includes('feijao') || n.includes('massa') || n.includes('macarrão') || n.includes('pão') || n.includes('batata')) {
    return { category: 'carboidrato', rate: 1.2, protein: 0.05, carbs: 0.25, fat: 0.02 };
  }
  
  // Vegetais e saladas
  if (n.includes('salada') || n.includes('alface') || n.includes('tomate') || n.includes('legume') || n.includes('vegetal') || n.includes('verdura')) {
    return { category: 'vegetal', rate: 0.3, protein: 0.02, carbs: 0.05, fat: 0.01 };
  }
  
  // Doces e sobremesas
  if (n.includes('bolo') || n.includes('doce') || n.includes('sobremesa') || n.includes('chocolate') || n.includes('pudim') || n.includes('sorvete')) {
    return { category: 'doce', rate: 4.0, protein: 0.04, carbs: 0.55, fat: 0.15 };
  }
  
  // Frutas
  if (n.includes('fruta') || n.includes('maçã') || n.includes('banana') || n.includes('laranja') || n.includes('morango')) {
    return { category: 'fruta', rate: 0.5, protein: 0.01, carbs: 0.12, fat: 0.005 };
  }
  
  // Default genérico
  return { category: 'default', rate: 1.5, protein: 0.08, carbs: 0.15, fat: 0.06 };
}

// ========================================
// 🔍 BUSCAR DADOS NUTRICIONAIS NA TACO (OTIMIZADO)
// ========================================

// Valores TACO pré-carregados com PREPARO específico (por 100g)
// ⚠️ IMPORTANTE: Leguminosas usam valores COZIDOS (não crus!)
const TACO_QUICK_LOOKUP: Record<string, { kcal: number; protein: number; carbs: number; fat: number; fiber: number }> = {
  // ARROZ
  'arroz': { kcal: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6 },
  'arroz branco': { kcal: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6 },
  'arroz integral': { kcal: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7 },
  'arroz integral cozido': { kcal: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7 },
  'arroz cozido': { kcal: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6 },
  
  // LEGUMINOSAS COZIDAS (valores corretos - NÃO usar valores crus!)
  'grão de bico': { kcal: 128, protein: 8.5, carbs: 20.5, fat: 2.0, fiber: 6.0 },
  'grão de bico cozido': { kcal: 128, protein: 8.5, carbs: 20.5, fat: 2.0, fiber: 6.0 },
  'grao de bico': { kcal: 128, protein: 8.5, carbs: 20.5, fat: 2.0, fiber: 6.0 },
  'grao de bico cozido': { kcal: 128, protein: 8.5, carbs: 20.5, fat: 2.0, fiber: 6.0 },
  'grão-de-bico': { kcal: 128, protein: 8.5, carbs: 20.5, fat: 2.0, fiber: 6.0 },
  'grão-de-bico cozido': { kcal: 128, protein: 8.5, carbs: 20.5, fat: 2.0, fiber: 6.0 },
  'lentilha': { kcal: 93, protein: 6.3, carbs: 16.3, fat: 0.5, fiber: 7.9 },
  'lentilha cozida': { kcal: 93, protein: 6.3, carbs: 16.3, fat: 0.5, fiber: 7.9 },
  'ervilha': { kcal: 72, protein: 5.0, carbs: 12.6, fat: 0.4, fiber: 4.3 },
  'ervilha cozida': { kcal: 72, protein: 5.0, carbs: 12.6, fat: 0.4, fiber: 4.3 },
  'soja': { kcal: 151, protein: 14.0, carbs: 8.0, fat: 6.8, fiber: 5.6 },
  'soja cozida': { kcal: 151, protein: 14.0, carbs: 8.0, fat: 6.8, fiber: 5.6 },
  
  // FEIJÃO (valores cozidos)
  'feijão': { kcal: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 8.5 },
  'feijão carioca': { kcal: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 8.5 },
  'feijão preto': { kcal: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 8.4 },
  'feijão cozido': { kcal: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 8.5 },
  
  // CARNE BOVINA (DIFERENTE DE FRANGO!)
  'bife': { kcal: 219, protein: 32.8, carbs: 0, fat: 9.3, fiber: 0 },
  'bife grelhado': { kcal: 219, protein: 32.8, carbs: 0, fat: 9.3, fiber: 0 },
  'bife frito': { kcal: 289, protein: 28.9, carbs: 3.2, fat: 17.5, fiber: 0 },
  'carne': { kcal: 219, protein: 32.8, carbs: 0, fat: 9.3, fiber: 0 },
  'carne bovina': { kcal: 219, protein: 32.8, carbs: 0, fat: 9.3, fiber: 0 },
  'carne vermelha': { kcal: 219, protein: 32.8, carbs: 0, fat: 9.3, fiber: 0 },
  'carne grelhada': { kcal: 219, protein: 32.8, carbs: 0, fat: 9.3, fiber: 0 },
  'carne moída': { kcal: 212, protein: 26.7, carbs: 0, fat: 11.5, fiber: 0 },
  'picanha': { kcal: 289, protein: 27.0, carbs: 0, fat: 20.0, fiber: 0 },
  
  // FRANGO (SEPARADO!)
  'frango': { kcal: 159, protein: 32, carbs: 0, fat: 3.2, fiber: 0 },
  'frango grelhado': { kcal: 159, protein: 32, carbs: 0, fat: 3.2, fiber: 0 },
  'peito de frango': { kcal: 159, protein: 32, carbs: 0, fat: 3.2, fiber: 0 },
  'frango frito': { kcal: 249, protein: 26.8, carbs: 7.5, fat: 12.4, fiber: 0 },
  'frango assado': { kcal: 215, protein: 28.6, carbs: 0, fat: 10.8, fiber: 0 },
  'coxa de frango': { kcal: 215, protein: 28.6, carbs: 0, fat: 10.8, fiber: 0 },
  // FRANGO EMPANADO/FRITO (alimentos frequentemente não encontrados)
  'frango empanado': { kcal: 280, protein: 18, carbs: 15, fat: 16, fiber: 0.5 },
  'tiras de frango empanadas': { kcal: 280, protein: 18, carbs: 15, fat: 16, fiber: 0.5 },
  'tiras de frango empanadas fritas': { kcal: 280, protein: 18, carbs: 15, fat: 16, fiber: 0.5 },
  'tiras de frango': { kcal: 280, protein: 18, carbs: 15, fat: 16, fiber: 0.5 },
  'frango à milanesa': { kcal: 280, protein: 18, carbs: 15, fat: 16, fiber: 0.5 },
  'frango a milanesa': { kcal: 280, protein: 18, carbs: 15, fat: 16, fiber: 0.5 },
  'filé de frango empanado': { kcal: 280, protein: 18, carbs: 15, fat: 16, fiber: 0.5 },
  'nuggets': { kcal: 260, protein: 14, carbs: 18, fat: 14, fiber: 0 },
  'nuggets de frango': { kcal: 260, protein: 14, carbs: 18, fat: 14, fiber: 0 },
  'isca de frango': { kcal: 280, protein: 18, carbs: 15, fat: 16, fiber: 0.5 },
  'steak de frango': { kcal: 220, protein: 25, carbs: 10, fat: 10, fiber: 0 },
  'steak de frango empanado': { kcal: 280, protein: 18, carbs: 15, fat: 16, fiber: 0.5 },
  // MOLHOS CREMOSOS
  'molho cremoso': { kcal: 350, protein: 2, carbs: 5, fat: 35, fiber: 0 },
  'molho rosê': { kcal: 300, protein: 1, carbs: 8, fat: 30, fiber: 0 },
  'molho rose': { kcal: 300, protein: 1, carbs: 8, fat: 30, fiber: 0 },
  'molho branco': { kcal: 180, protein: 3, carbs: 8, fat: 15, fiber: 0 },
  'molho de queijo': { kcal: 220, protein: 5, carbs: 4, fat: 20, fiber: 0 },
  'maionese': { kcal: 680, protein: 1, carbs: 2, fat: 75, fiber: 0 },
  // SALGADOS BRASILEIROS
  'coxinha': { kcal: 300, protein: 10, carbs: 25, fat: 18, fiber: 1 },
  'pastel': { kcal: 280, protein: 8, carbs: 22, fat: 18, fiber: 1 },
  'kibe': { kcal: 250, protein: 12, carbs: 18, fat: 14, fiber: 2 },
  'risole': { kcal: 270, protein: 8, carbs: 20, fat: 17, fiber: 1 },
  'bolinho de bacalhau': { kcal: 240, protein: 12, carbs: 15, fat: 15, fiber: 0 },
  'esfiha': { kcal: 230, protein: 9, carbs: 22, fat: 12, fiber: 1 },
  
  // BATATA (CRÍTICO: FRITA ≠ COZIDA!)
  'batata frita': { kcal: 267, protein: 4.1, carbs: 36, fat: 12.4, fiber: 3.3 },
  'batata palha': { kcal: 540, protein: 4.8, carbs: 52, fat: 35, fiber: 4.0 },
  'batata': { kcal: 52, protein: 1.2, carbs: 11.9, fat: 0.1, fiber: 1.3 },
  'batata cozida': { kcal: 52, protein: 1.2, carbs: 11.9, fat: 0.1, fiber: 1.3 },
  'batata assada': { kcal: 86, protein: 2.0, carbs: 18.5, fat: 0.4, fiber: 1.8 },
  'purê de batata': { kcal: 83, protein: 2.0, carbs: 12, fat: 3.0, fiber: 1.0 },
  
  // OVO
  'ovo': { kcal: 146, protein: 13.3, carbs: 0.6, fat: 9.5, fiber: 0 },
  'ovos': { kcal: 146, protein: 13.3, carbs: 0.6, fat: 9.5, fiber: 0 },
  'ovo frito': { kcal: 240, protein: 15.6, carbs: 1.2, fat: 19.4, fiber: 0 },
  'ovo cozido': { kcal: 146, protein: 13.3, carbs: 0.6, fat: 9.5, fiber: 0 },
  'omelete': { kcal: 180, protein: 12.0, carbs: 1.5, fat: 14.0, fiber: 0 },
  
  // VEGETAIS
  'salada': { kcal: 11, protein: 1.3, carbs: 1.7, fat: 0.2, fiber: 1.8 },
  'alface': { kcal: 11, protein: 1.3, carbs: 1.7, fat: 0.2, fiber: 1.8 },
  'tomate': { kcal: 15, protein: 1.1, carbs: 3.1, fat: 0.2, fiber: 1.2 },
  'tomate picado': { kcal: 15, protein: 1.1, carbs: 3.1, fat: 0.2, fiber: 1.2 },
  'brócolis': { kcal: 25, protein: 2.1, carbs: 4.4, fat: 0.5, fiber: 3.4 },
  'couve': { kcal: 27, protein: 2.9, carbs: 4.3, fat: 0.5, fiber: 3.1 },
  'pepino': { kcal: 10, protein: 0.7, carbs: 2.0, fat: 0.1, fiber: 0.5 },
  'pepino picado': { kcal: 10, protein: 0.7, carbs: 2.0, fat: 0.1, fiber: 0.5 },
  'repolho': { kcal: 17, protein: 0.9, carbs: 3.9, fat: 0.1, fiber: 1.9 },
  'repolho roxo': { kcal: 17, protein: 0.9, carbs: 3.9, fat: 0.1, fiber: 1.9 },
  'repolho roxo picado': { kcal: 17, protein: 0.9, carbs: 3.9, fat: 0.1, fiber: 1.9 },
  'milho': { kcal: 96, protein: 3.2, carbs: 19.0, fat: 1.3, fiber: 2.7 },
  'milho cozido': { kcal: 96, protein: 3.2, carbs: 19.0, fat: 1.3, fiber: 2.7 },
  'cenoura': { kcal: 34, protein: 1.3, carbs: 7.7, fat: 0.2, fiber: 3.2 },
  'cebolinha': { kcal: 20, protein: 2.0, carbs: 3.3, fat: 0.2, fiber: 2.4 },
  'cebolinha picada': { kcal: 20, protein: 2.0, carbs: 3.3, fat: 0.2, fiber: 2.4 },
  'edamame': { kcal: 121, protein: 11.9, carbs: 8.9, fat: 5.2, fiber: 5.2 },
  'edamame cozido': { kcal: 121, protein: 11.9, carbs: 8.9, fat: 5.2, fiber: 5.2 },
  'tofu': { kcal: 64, protein: 6.6, carbs: 2.2, fat: 3.9, fiber: 0 },
  'tofu grelhado': { kcal: 64, protein: 6.6, carbs: 2.2, fat: 3.9, fiber: 0 },
  
  // MASSAS E PÃES
  'macarrão': { kcal: 102, protein: 3.4, carbs: 19.9, fat: 0.5, fiber: 1.5 },
  'macarrão cozido': { kcal: 102, protein: 3.4, carbs: 19.9, fat: 0.5, fiber: 1.5 },
  'pão': { kcal: 300, protein: 8, carbs: 58.6, fat: 3.1, fiber: 2.3 },
  'pão francês': { kcal: 300, protein: 8, carbs: 58.6, fat: 3.1, fiber: 2.3 },
  
  // SALGADOS E FRITURAS (valores TACO - pizza, hambúrguer, pão de queijo)
  'pizza': { kcal: 247, protein: 10.9, carbs: 29.3, fat: 9.5, fiber: 2.1 },
  'hambúrguer': { kcal: 258, protein: 17, carbs: 3.3, fat: 20, fiber: 0 },
  'hamburger': { kcal: 258, protein: 17, carbs: 3.3, fat: 20, fiber: 0 },
  'pão de queijo': { kcal: 363, protein: 5.2, carbs: 34.2, fat: 22.7, fiber: 0.5 },
  
  // FRUTAS
  'banana': { kcal: 98, protein: 1.3, carbs: 26, fat: 0.1, fiber: 2 },
  'maçã': { kcal: 56, protein: 0.3, carbs: 15.2, fat: 0, fiber: 1.3 },
  
  // BEBIDAS
  'café': { kcal: 9, protein: 0.5, carbs: 1.5, fat: 0, fiber: 0 },
  'leite': { kcal: 61, protein: 3, carbs: 4.5, fat: 3.5, fiber: 0 },
  'suco': { kcal: 45, protein: 0.8, carbs: 10.4, fat: 0.1, fiber: 0.1 },
  
  // MANDIOCA/AIPIM
  'mandioca': { kcal: 125, protein: 0.6, carbs: 30.1, fat: 0.3, fiber: 1.9 },
  'mandioca cozida': { kcal: 125, protein: 0.6, carbs: 30.1, fat: 0.3, fiber: 1.9 },
  'mandioca frita': { kcal: 304, protein: 1.1, carbs: 42, fat: 14.5, fiber: 2.1 },
  'farofa': { kcal: 365, protein: 1.2, carbs: 82, fat: 0.7, fiber: 4.5 },
  
  // PORCO
  'bacon': { kcal: 541, protein: 37, carbs: 0, fat: 42, fiber: 0 },
  'linguiça': { kcal: 230, protein: 16, carbs: 2, fat: 18, fiber: 0 }
};

async function findInTaco(foodName: string): Promise<{
  found: boolean;
  food_name: string;
  energy_kcal: number;
  protein_g: number;
  carbohydrate_g: number;
  lipids_g: number;
  fiber_g: number;
} | null> {
  const normalizedName = foodName.toLowerCase().trim();
  
  // 1. BUSCA RÁPIDA: lookup em memória (instantâneo)
  const quickData = TACO_QUICK_LOOKUP[normalizedName];
  if (quickData) {
    console.log(`⚡ TACO Quick: ${normalizedName}`);
    return {
      found: true,
      food_name: normalizedName,
      energy_kcal: quickData.kcal,
      protein_g: quickData.protein,
      carbohydrate_g: quickData.carbs,
      lipids_g: quickData.fat,
      fiber_g: quickData.fiber
    };
  }
  
  // 2. Verificar cache de requisição
  if (tacoCache.has(normalizedName)) {
    console.log(`💾 TACO Cache: ${normalizedName}`);
    return tacoCache.get(normalizedName);
  }
  
  // 3. Busca única no banco (otimizada)
  const synonym = TACO_SYNONYMS[normalizedName] || normalizedName;
  const keyword = normalizedName.split(' ')[0]; // Primeira palavra apenas
  
  const { data } = await supabase
    .from('taco_foods')
    .select('food_name, energy_kcal, protein_g, carbohydrate_g, lipids_g, fiber_g')
    .or(`food_name.ilike.%${synonym}%,food_name.ilike.%${keyword}%`)
    .limit(1);
  
  if (data && data.length > 0) {
    const result = { found: true, ...data[0] };
    tacoCache.set(normalizedName, result);
    return result;
  }
  
  tacoCache.set(normalizedName, null);
  return null;
}

// ========================================
// 📊 CALCULAR NUTRIENTES COM TACO (PARALELO)
// ========================================
async function calculateNutritionFromTaco(foods: Array<{ name: string; grams: number; confidence: number }>): Promise<{
  total_kcal: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  foods_matched: number;
  foods_details: Array<{
    name: string;
    grams: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    taco_match: string | null;
  }>;
}> {
  // Buscar TODOS os alimentos em paralelo (muito mais rápido)
  const tacoResults = await Promise.all(
    foods.map(async food => ({
      food,
      tacoData: await findInTaco(food.name)
    }))
  );

  let total_kcal = 0;
  let total_protein = 0;
  let total_carbs = 0;
  let total_fat = 0;
  let total_fiber = 0;
  let foods_matched = 0;
  const foods_details: Array<any> = [];

  for (const { food, tacoData } of tacoResults) {
    const grams = food.grams;
    const factor = grams / 100;
    
    if (tacoData) {
      foods_matched++;
      const kcal = (tacoData.energy_kcal || 0) * factor;
      const protein = (tacoData.protein_g || 0) * factor;
      const carbs = (tacoData.carbohydrate_g || 0) * factor;
      const fat = (tacoData.lipids_g || 0) * factor;
      const fiber = (tacoData.fiber_g || 0) * factor;
      
      total_kcal += kcal;
      total_protein += protein;
      total_carbs += carbs;
      total_fat += fat;
      total_fiber += fiber;
      
      foods_details.push({
        name: food.name,
        grams,
        kcal: Math.round(kcal),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        taco_match: tacoData.food_name
      });
    } else {
      // Fallback inteligente por categoria (kcal/g)
      const categoryFallback = detectFoodCategoryFallback(food.name);
      const estimatedKcal = grams * categoryFallback.rate;
      const estimatedProtein = grams * categoryFallback.protein;
      const estimatedCarbs = grams * categoryFallback.carbs;
      const estimatedFat = grams * categoryFallback.fat;
      
      total_kcal += estimatedKcal;
      total_protein += estimatedProtein;
      total_carbs += estimatedCarbs;
      total_fat += estimatedFat;
      
      foods_details.push({
        name: food.name,
        grams,
        kcal: Math.round(estimatedKcal),
        protein: Math.round(estimatedProtein * 10) / 10,
        carbs: Math.round(estimatedCarbs * 10) / 10,
        fat: Math.round(estimatedFat * 10) / 10,
        taco_match: `ESTIMATIVA (${categoryFallback.category})`
      });
      
      console.log(`⚠️ TACO não encontrou "${food.name}" - usando fallback ${categoryFallback.category}: ${Math.round(estimatedKcal)} kcal`);
    }
  }

  console.log(`⚡ TACO Paralelo: ${foods_matched}/${foods.length} encontrados | ${Math.round(total_kcal)} kcal`);

  return {
    total_kcal: Math.round(total_kcal),
    total_protein: Math.round(total_protein * 10) / 10,
    total_carbs: Math.round(total_carbs * 10) / 10,
    total_fat: Math.round(total_fat * 10) / 10,
    total_fiber: Math.round(total_fiber * 10) / 10,
    foods_matched,
    foods_details
  };
}

// ========================================
// 🤖 PROMPTS PARA DETECÇÃO COM MÁXIMA PRECISÃO
// ========================================
const FOOD_DETECTION_PROMPT = `Você é um NUTRICIONISTA CERTIFICADO especialista em análise visual de refeições.

🎯 TAREFA: Analise esta foto de refeição com MÁXIMA PRECISÃO e identifique TODOS os alimentos visíveis.

📏 REGRAS DE ESTIMATIVA DE PESO (OBRIGATÓRIO):
1. Use referências visuais do prato/recipiente para estimar gramas
2. Prato raso padrão = 22-26cm de diâmetro
3. Colher de sopa cheia ≈ 15g (sólidos) ou 15ml (líquidos)
4. Porção que ocupa 1/4 do prato ≈ 80-100g
5. Porção que ocupa 1/3 do prato ≈ 100-130g
6. Porção que ocupa 1/2 do prato ≈ 150-200g

🍖 IDENTIFICAÇÃO DE PROTEÍNAS (CRÍTICO):
- CARNE BOVINA: cor marrom/escura, textura fibrosa, pode ter gordura branca
- FRANGO: cor clara/branca, textura lisa, sem veios de gordura
- PEIXE: cor clara, textura em lascas, pode ser rosado (salmão)
- PORCO: cor rosada clara, pode ter camada de gordura

🥔 IDENTIFICAÇÃO DE PREPAROS (CRÍTICO):
- FRITO: superfície dourada/crocante, brilho de óleo, bordas irregulares
- GRELHADO: marcas de grelha, superfície seca, listras escuras
- COZIDO: aparência úmida, cor mais clara, textura macia
- ASSADO: superfície tostada uniforme, cor dourada

🍳 OVOS:
- FRITO: gema amarela visível, clara com bordas crocantes, brilho de óleo
- COZIDO: formato oval perfeito, sem óleo, cor uniforme
- MEXIDO: pedaços irregulares amarelos, textura cremosa

📋 FORMATO DE RESPOSTA (JSON VÁLIDO OBRIGATÓRIO):
{
  "foods": [
    {"name": "nome_alimento_com_preparo", "grams": 150, "confidence": 0.95}
  ],
  "meal_type": "cafe_da_manha|almoco|jantar|lanche",
  "needs_confirmation": false,
  "ambiguous_items": [],
  "notes": "observações sobre a análise"
}

⚠️ REGRAS IMPORTANTES:
1. SEMPRE inclua o método de preparo no nome: "bife grelhado", "ovo frito", "batata frita"
2. Estime gramas com base no tamanho visual - NÃO use valores genéricos
3. Confidence > 0.8 = certeza alta, 0.6-0.8 = média, < 0.6 = baixa
4. Se não conseguir identificar um alimento, defina confidence baixa
5. Inclua TODOS os itens visíveis: molhos, temperos, acompanhamentos

ANALISE A IMAGEM AGORA E RETORNE APENAS O JSON:`;

// ========================================
// 🤖 FUNÇÃO PRINCIPAL
// ========================================
export async function analyzeWithEnhancedAI(
  imageUrl: string, 
  attempt = 1, 
  config?: { model: string; max_tokens: number; temperature: number }
): Promise<{
  foods: Array<{ name: string; grams: number; confidence: number }>;
  total_calories: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  attempt_used: number;
  detection_method: string;
  success: boolean;
  provider?: string;
  taco_details?: any;
  needs_confirmation?: boolean;
  confirmation_message?: string;
  ambiguous_items?: string[];
}> {
  if (config) {
    AI_MODEL_CONFIG = { ...AI_MODEL_CONFIG, ...config };
  }

  if (!LOVABLE_API_KEY) {
    console.error('❌ LOVABLE_API_KEY não configurada!');
    return createFallbackAnalysis();
  }

  console.log(`🤖 Análise com Lovable AI - Tentativa ${attempt}/${MAX_RETRIES}`);

  try {
    const body = {
      model: AI_MODEL_CONFIG.model,
      max_tokens: AI_MODEL_CONFIG.max_tokens,
      temperature: AI_MODEL_CONFIG.temperature,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: FOOD_DETECTION_PROMPT },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    };

    console.log(`🔗 Chamando Lovable AI: ${AI_MODEL_CONFIG.model}`);
    
    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`❌ Lovable AI Error ${resp.status}:`, errorText.substring(0, 200));
      
      if (resp.status === 429 && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY * attempt));
        return analyzeWithEnhancedAI(imageUrl, attempt + 1, config);
      }
      
      throw new Error(`API error: ${resp.status}`);
    }

    const data = await resp.json();
    const responseText = data.choices?.[0]?.message?.content ?? '';

    if (!responseText) {
      throw new Error('Resposta vazia');
    }

    console.log(`📝 Resposta IA:`, responseText.substring(0, 300) + '...');

    // Parsear resposta
    const parsed = parseAIResponse(responseText);
    const foods = normalizeDetectedFoods(parsed.foods || []);
    
    // Verificar se precisa confirmação
    const needsConfirmation = parsed.needs_confirmation === true;
    const ambiguousItems = parsed.ambiguous_items || [];

    if (foods.length === 0) {
      console.log('⚠️ Nenhum alimento detectado');
      return createFallbackAnalysis();
    }

    // 🎯 CALCULAR NUTRIENTES COM TABELA TACO
    console.log(`📊 Calculando nutrientes para ${foods.length} alimentos com tabela TACO...`);
    const tacoNutrition = await calculateNutritionFromTaco(foods);
    
    console.log(`✅ RESULTADO TACO: ${tacoNutrition.total_kcal} kcal | P: ${tacoNutrition.total_protein}g | C: ${tacoNutrition.total_carbs}g | G: ${tacoNutrition.total_fat}g`);
    console.log(`   ${tacoNutrition.foods_matched}/${foods.length} alimentos encontrados na TACO`);

    // Gerar mensagem de confirmação se necessário
    let confirmationMessage: string | undefined;
    if (needsConfirmation && ambiguousItems.length > 0) {
      confirmationMessage = generateConfirmationMessage(foods, ambiguousItems);
      console.log(`⚠️ Confirmação necessária: ${confirmationMessage}`);
    }

    // Detectar automaticamente se há itens que podem causar confusão
    const autoDetectedAmbiguous = detectAmbiguousItems(foods);
    if (!needsConfirmation && autoDetectedAmbiguous.length > 0) {
      confirmationMessage = generateConfirmationMessage(foods, autoDetectedAmbiguous);
      console.log(`🔍 Auto-detecção de ambiguidade: ${confirmationMessage}`);
    }

    return {
      foods,
      total_calories: tacoNutrition.total_kcal,
      total_protein: tacoNutrition.total_protein,
      total_carbs: tacoNutrition.total_carbs,
      total_fat: tacoNutrition.total_fat,
      attempt_used: attempt,
      detection_method: 'lovable_taco_precision',
      success: true,
      provider: 'lovable_ai',
      taco_details: tacoNutrition.foods_details,
      needs_confirmation: needsConfirmation || autoDetectedAmbiguous.length > 0,
      confirmation_message: confirmationMessage,
      ambiguous_items: ambiguousItems.length > 0 ? ambiguousItems : autoDetectedAmbiguous
    };

  } catch (error) {
    console.error(`❌ Erro na tentativa ${attempt}:`, error);
    
    if (attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY));
      return analyzeWithEnhancedAI(imageUrl, attempt + 1, config);
    }
    
    return createFallbackAnalysis();
  }
}

// ========================================
// 🔍 DETECTAR ITENS AMBÍGUOS AUTOMATICAMENTE
// ========================================
function detectAmbiguousItems(foods: Array<{ name: string; grams: number; confidence: number }>): string[] {
  const ambiguous: string[] = [];
  
  for (const food of foods) {
    const name = food.name.toLowerCase();
    
    // Carne genérica sem especificar tipo
    if (name === 'carne' && food.confidence < 0.85) {
      ambiguous.push('carne (bovina ou frango?)');
    }
    
    // Batata sem especificar preparo
    if (name === 'batata' && food.confidence < 0.85) {
      ambiguous.push('batata (frita ou cozida?)');
    }
    
    // Ovo sem especificar preparo
    if (name === 'ovo' || name === 'ovos') {
      if (food.confidence < 0.85) {
        ambiguous.push('ovo (frito, cozido ou mexido?)');
      }
    }
    
    // Baixa confiança geral
    if (food.confidence < 0.6) {
      ambiguous.push(`${food.name} (confirmação necessária)`);
    }
  }
  
  return [...new Set(ambiguous)]; // Remove duplicatas
}

// ========================================
// 💬 GERAR MENSAGEM DE CONFIRMAÇÃO
// ========================================
function generateConfirmationMessage(
  foods: Array<{ name: string; grams: number; confidence: number }>,
  ambiguousItems: string[]
): string {
  const foodList = foods.map(f => `${f.name} (~${f.grams}g)`).join(', ');
  
  if (ambiguousItems.length === 0) {
    return `Identifiquei: ${foodList}. Está correto?`;
  }
  
  const ambiguousList = ambiguousItems.join(', ');
  return `Identifiquei: ${foodList}.\n\n⚠️ **Preciso confirmar:** ${ambiguousList}\n\nPode me dizer qual está certo?`;
}

// ========================================
// 🛠️ FUNÇÕES AUXILIARES
// ========================================

function parseAIResponse(text: string): any {
  try {
    const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    const jsonMatch = clean.match(/\{[\s\S]*"foods"[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(clean);
  } catch (e) {
    console.error('❌ Erro ao parsear JSON:', e);
    return { foods: [] };
  }
}

function normalizeDetectedFoods(foods: any[]): Array<{ name: string; grams: number; confidence: number }> {
  if (!Array.isArray(foods)) return [];
  
  return foods
    .filter(f => f && (f.name || f.nome))
    .map(food => {
      let name = String(food.name || food.nome || 'alimento').toLowerCase().trim();
      
      // Aplicar correções de preparo automáticas
      name = applyPreparationCorrections(name);
      
      return {
        name,
        grams: Math.max(Number(food.grams || food.gramas || food.quantidade) || 100, 30),
        confidence: Math.min(Math.max(Number(food.confidence || food.confianca) || 0.7, 0.1), 1.0)
      };
    })
    .filter(f => f.name.length > 1 && f.name !== 'undefined');
}

// ========================================
// 🔧 CORREÇÕES AUTOMÁTICAS DE PREPARO
// ========================================
function applyPreparationCorrections(name: string): string {
  // Se mencionou "frito/frita" no contexto, garantir que fica no nome
  if (name.includes('frit')) {
    // Já tem frito, ok
    return name;
  }
  
  // Correções específicas baseadas em contexto comum
  const corrections: Record<string, string> = {
    // Se alguém diz apenas "batatas" em refeição de lanchonete, provavelmente são fritas
    'batatas': 'batata frita',
    'french fries': 'batata frita',
    'chips': 'batata frita',
    // Mandioca em restaurante geralmente é frita
    'macaxeira': 'mandioca frita',
    'aipim': 'mandioca frita',
  };
  
  return corrections[name] || name;
}

function createFallbackAnalysis() {
  return {
    foods: [{ name: 'refeição mista', grams: 300, confidence: 0.3 }],
    total_calories: 450,
    total_protein: 20,
    total_carbs: 50,
    total_fat: 15,
    attempt_used: MAX_RETRIES,
    detection_method: 'fallback',
    success: false,
    needs_confirmation: true,
    confirmation_message: 'Não consegui identificar os alimentos com precisão. Pode descrever o que está no prato?'
  };
}
