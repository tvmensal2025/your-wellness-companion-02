// ========================================
// 🔧 SISTEMA APRIMORADO DE DETECÇÃO DE ALIMENTOS
// Usa tabela TACO para cálculos nutricionais precisos
// Prioridade: Lovable AI (google/gemini-2.5-flash-lite) - MAIS RÁPIDO
// ========================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const RATE_LIMIT_DELAY = 500; // Reduzido de 1000ms
const MAX_RETRIES = 1; // Apenas 1 retry para velocidade

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cache em memória para TACO (dura durante a requisição)
const tacoCache: Map<string, any> = new Map();

// Configuração de IA - Usando modelo LITE para velocidade
let AI_MODEL_CONFIG = {
  model: 'google/gemini-2.5-flash-lite', // Modelo mais rápido
  max_tokens: 1500, // Reduzido para respostas mais rápidas
  temperature: 0.2 // Menos criativo = mais rápido
};

// ========================================
// 🍽️ MAPEAMENTO DE SINÔNIMOS PARA TACO
// ========================================
const TACO_SYNONYMS: Record<string, string> = {
  // Proteínas
  'frango': 'Frango',
  'frango grelhado': 'Frango, peito, sem pele, grelhado',
  'peito de frango': 'Frango, peito, sem pele, grelhado',
  'carne': 'Carne, bovina',
  'carne bovina': 'Carne, bovina, contra-filé, grelhado',
  'bife': 'Carne, bovina, contra-filé, grelhado',
  'picanha': 'Carne, bovina, picanha, grelhada',
  'carne moída': 'Carne, bovina, moída, cozida',
  'peixe': 'Peixe',
  'salmão': 'Salmão, filé, grelhado',
  'atum': 'Atum, enlatado',
  'ovo': 'Ovo, de galinha, inteiro, cozido',
  'ovos': 'Ovo, de galinha, inteiro, cozido',
  'ovo frito': 'Ovo, de galinha, inteiro, frito',
  'omelete': 'Ovo, de galinha, inteiro, mexido',
  
  // Carboidratos
  'arroz': 'Arroz, tipo 1, cozido',
  'arroz branco': 'Arroz, tipo 1, cozido',
  'arroz integral': 'Arroz, integral, cozido',
  'feijão': 'Feijão, carioca, cozido',
  'feijão preto': 'Feijão, preto, cozido',
  'feijão carioca': 'Feijão, carioca, cozido',
  'batata': 'Batata, cozida',
  'batata frita': 'Batata, frita',
  'batata doce': 'Batata doce, cozida',
  'macarrão': 'Macarrão, trigo, cozido',
  'massa': 'Macarrão, trigo, cozido',
  'pão': 'Pão, francês',
  'pão francês': 'Pão, francês',
  'pão integral': 'Pão, de forma, integral',
  
  // Vegetais
  'salada': 'Alface, crespa, crua',
  'alface': 'Alface, crespa, crua',
  'tomate': 'Tomate',
  'cenoura': 'Cenoura, crua',
  'brócolis': 'Brócolis, cozido',
  'couve': 'Couve, manteiga, crua',
  'repolho': 'Repolho, cru',
  'beterraba': 'Beterraba, crua',
  'pepino': 'Pepino, cru',
  
  // Lanches e salgados
  'pizza': 'Pizza, de mussarela',
  'hambúrguer': 'Hambúrguer, bovino, grelhado',
  'hamburger': 'Hambúrguer, bovino, grelhado',
  'coxinha': 'Coxinha de frango, frita',
  'pastel': 'Pastel, de carne, frito',
  'empada': 'Empada de frango, pré-cozida, assada',
  'pão de queijo': 'Pão de queijo, assado',
  
  // Bebidas
  'café': 'Café, infusão',
  'suco': 'Suco de laranja, integral',
  'suco de laranja': 'Suco de laranja, integral',
  'leite': 'Leite, de vaca, integral',
  'refrigerante': 'Refrigerante, tipo cola',
  
  // Frutas
  'banana': 'Banana, prata, crua',
  'maçã': 'Maçã, fuji, crua',
  'laranja': 'Laranja, pêra, crua',
  'manga': 'Manga, palmer, crua',
  'mamão': 'Mamão, papaia, cru',
  
  // Laticínios
  'queijo': 'Queijo, minas, frescal',
  'queijo minas': 'Queijo, minas, frescal',
  'queijo mussarela': 'Queijo, mussarela',
  'iogurte': 'Iogurte, natural',
  
  // Outros
  'farofa': 'Farinha, de mandioca, torrada',
  'mandioca': 'Mandioca, cozida',
  'milho': 'Milho, verde, cru'
};

// ========================================
// 🔍 BUSCAR DADOS NUTRICIONAIS NA TACO (OTIMIZADO)
// ========================================

// Valores pré-carregados para alimentos mais comuns (evita consulta ao banco)
const TACO_QUICK_LOOKUP: Record<string, { kcal: number; protein: number; carbs: number; fat: number; fiber: number }> = {
  'arroz': { kcal: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6 },
  'arroz branco': { kcal: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6 },
  'feijão': { kcal: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 8.5 },
  'feijão carioca': { kcal: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 8.5 },
  'feijão preto': { kcal: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 8.4 },
  'frango': { kcal: 159, protein: 32, carbs: 0, fat: 3.2, fiber: 0 },
  'frango grelhado': { kcal: 159, protein: 32, carbs: 0, fat: 3.2, fiber: 0 },
  'peito de frango': { kcal: 159, protein: 32, carbs: 0, fat: 3.2, fiber: 0 },
  'carne': { kcal: 219, protein: 32.8, carbs: 0, fat: 9.3, fiber: 0 },
  'carne bovina': { kcal: 219, protein: 32.8, carbs: 0, fat: 9.3, fiber: 0 },
  'bife': { kcal: 219, protein: 32.8, carbs: 0, fat: 9.3, fiber: 0 },
  'ovo': { kcal: 146, protein: 13.3, carbs: 0.6, fat: 9.5, fiber: 0 },
  'ovos': { kcal: 146, protein: 13.3, carbs: 0.6, fat: 9.5, fiber: 0 },
  'salada': { kcal: 11, protein: 1.3, carbs: 1.7, fat: 0.2, fiber: 1.8 },
  'alface': { kcal: 11, protein: 1.3, carbs: 1.7, fat: 0.2, fiber: 1.8 },
  'tomate': { kcal: 15, protein: 1.1, carbs: 3.1, fat: 0.2, fiber: 1.2 },
  'batata frita': { kcal: 267, protein: 4.1, carbs: 36, fat: 12, fiber: 3.3 },
  'batata': { kcal: 52, protein: 1.2, carbs: 11.9, fat: 0.1, fiber: 1.3 },
  'pão': { kcal: 300, protein: 8, carbs: 58.6, fat: 3.1, fiber: 2.3 },
  'pão francês': { kcal: 300, protein: 8, carbs: 58.6, fat: 3.1, fiber: 2.3 },
  'macarrão': { kcal: 102, protein: 3.4, carbs: 19.9, fat: 0.5, fiber: 1.5 },
  'pizza': { kcal: 247, protein: 10.9, carbs: 29.3, fat: 9.5, fiber: 2.1 },
  'hambúrguer': { kcal: 258, protein: 17, carbs: 3.3, fat: 20, fiber: 0 },
  'hamburger': { kcal: 258, protein: 17, carbs: 3.3, fat: 20, fiber: 0 },
  'banana': { kcal: 98, protein: 1.3, carbs: 26, fat: 0.1, fiber: 2 },
  'maçã': { kcal: 56, protein: 0.3, carbs: 15.2, fat: 0, fiber: 1.3 },
  'café': { kcal: 9, protein: 0.5, carbs: 1.5, fat: 0, fiber: 0 },
  'leite': { kcal: 61, protein: 3, carbs: 4.5, fat: 3.5, fiber: 0 },
  'suco': { kcal: 45, protein: 0.8, carbs: 10.4, fat: 0.1, fiber: 0.1 },
  'coxinha': { kcal: 279, protein: 9.4, carbs: 27.4, fat: 14.7, fiber: 0.8 },
  'pastel': { kcal: 342, protein: 8.7, carbs: 28.2, fat: 21.7, fiber: 1.4 },
  'pão de queijo': { kcal: 363, protein: 5.2, carbs: 34.2, fat: 22.7, fiber: 0.5 }
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
      const estimatedKcal = grams * 1.5;
      total_kcal += estimatedKcal;
      
      foods_details.push({
        name: food.name,
        grams,
        kcal: Math.round(estimatedKcal),
        protein: 0,
        carbs: 0,
        fat: 0,
        taco_match: null
      });
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
// 🤖 PROMPTS PARA DETECÇÃO
// ========================================
// Prompt otimizado e mais curto para resposta mais rápida
const FOOD_DETECTION_PROMPT = `Analise esta foto de refeição brasileira.

RESPONDA APENAS JSON (sem explicação):
{"foods":[{"name":"alimento","grams":100,"confidence":0.9}],"meal_type":"refeicao"}

Porções típicas: arroz 120g, feijão 80g, carne 120g, salada 50g, batata frita 80g, pizza fatia 120g.
Use nomes simples: arroz, feijão, frango, carne, salada, tomate.`;

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

    console.log(`📝 Resposta IA:`, responseText.substring(0, 200) + '...');

    // Parsear resposta
    const parsed = parseAIResponse(responseText);
    const foods = normalizeDetectedFoods(parsed.foods || []);

    if (foods.length === 0) {
      console.log('⚠️ Nenhum alimento detectado');
      return createFallbackAnalysis();
    }

    // 🎯 CALCULAR NUTRIENTES COM TABELA TACO
    console.log(`📊 Calculando nutrientes para ${foods.length} alimentos com tabela TACO...`);
    const tacoNutrition = await calculateNutritionFromTaco(foods);
    
    console.log(`✅ RESULTADO TACO: ${tacoNutrition.total_kcal} kcal | P: ${tacoNutrition.total_protein}g | C: ${tacoNutrition.total_carbs}g | G: ${tacoNutrition.total_fat}g`);
    console.log(`   ${tacoNutrition.foods_matched}/${foods.length} alimentos encontrados na TACO`);

    return {
      foods,
      total_calories: tacoNutrition.total_kcal,
      total_protein: tacoNutrition.total_protein,
      total_carbs: tacoNutrition.total_carbs,
      total_fat: tacoNutrition.total_fat,
      attempt_used: attempt,
      detection_method: 'lovable_taco',
      success: true,
      provider: 'lovable_ai',
      taco_details: tacoNutrition.foods_details
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
// 🛠️ FUNÇÕES AUXILIARES
// ========================================

function parseAIResponse(text: string): any {
  try {
    let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
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
    .map(food => ({
      name: String(food.name || food.nome || 'alimento').toLowerCase().trim(),
      grams: Math.max(Number(food.grams || food.gramas || food.quantidade) || 100, 30),
      confidence: Math.min(Math.max(Number(food.confidence || food.confianca) || 0.7, 0.1), 1.0)
    }))
    .filter(f => f.name.length > 1 && f.name !== 'undefined');
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
    success: false
  };
}
