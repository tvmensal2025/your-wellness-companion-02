// ========================================
// 🔧 SISTEMA APRIMORADO DE DETECÇÃO DE ALIMENTOS
// Usa tabela TACO para cálculos nutricionais precisos
// Prioridade: Lovable AI (google/gemini-2.5-flash)
// ========================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const RATE_LIMIT_DELAY = 1000;
const MAX_RETRIES = 2;

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuração de IA
let AI_MODEL_CONFIG = {
  model: 'google/gemini-2.5-flash',
  max_tokens: 2000,
  temperature: 0.3
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
// 🔍 BUSCAR DADOS NUTRICIONAIS NA TACO
// ========================================
async function findInTaco(foodName: string): Promise<{
  found: boolean;
  food_name: string;
  energy_kcal: number;
  protein_g: number;
  carbohydrate_g: number;
  lipids_g: number;
  fiber_g: number;
  sodium_mg: number;
} | null> {
  const normalizedName = foodName.toLowerCase().trim();
  
  // 1. Tentar sinônimo direto
  const synonym = TACO_SYNONYMS[normalizedName];
  if (synonym) {
    const { data } = await supabase
      .from('taco_foods')
      .select('food_name, energy_kcal, protein_g, carbohydrate_g, lipids_g, fiber_g, sodium_mg')
      .ilike('food_name', `%${synonym}%`)
      .limit(1);
    
    if (data && data.length > 0) {
      return { found: true, ...data[0] };
    }
  }
  
  // 2. Busca direta pelo nome
  const { data: directMatch } = await supabase
    .from('taco_foods')
    .select('food_name, energy_kcal, protein_g, carbohydrate_g, lipids_g, fiber_g, sodium_mg')
    .ilike('food_name', `%${normalizedName}%`)
    .limit(1);
  
  if (directMatch && directMatch.length > 0) {
    return { found: true, ...directMatch[0] };
  }
  
  // 3. Busca por palavras-chave
  const keywords = normalizedName.split(' ').filter(k => k.length > 3);
  for (const keyword of keywords) {
    const { data: keywordMatch } = await supabase
      .from('taco_foods')
      .select('food_name, energy_kcal, protein_g, carbohydrate_g, lipids_g, fiber_g, sodium_mg')
      .ilike('food_name', `%${keyword}%`)
      .limit(1);
    
    if (keywordMatch && keywordMatch.length > 0) {
      return { found: true, ...keywordMatch[0] };
    }
  }
  
  return null;
}

// ========================================
// 📊 CALCULAR NUTRIENTES COM TACO
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
  let total_kcal = 0;
  let total_protein = 0;
  let total_carbs = 0;
  let total_fat = 0;
  let total_fiber = 0;
  let foods_matched = 0;
  const foods_details: Array<any> = [];

  for (const food of foods) {
    const tacoData = await findInTaco(food.name);
    const grams = food.grams;
    const factor = grams / 100; // TACO é por 100g
    
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
        grams: grams,
        kcal: Math.round(kcal),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        taco_match: tacoData.food_name
      });
      
      console.log(`✅ TACO: ${food.name} (${grams}g) → ${tacoData.food_name}: ${Math.round(kcal)} kcal`);
    } else {
      // Estimativa fallback se não encontrar na TACO
      const estimatedKcal = grams * 1.5; // ~150 kcal/100g média
      total_kcal += estimatedKcal;
      
      foods_details.push({
        name: food.name,
        grams: grams,
        kcal: Math.round(estimatedKcal),
        protein: 0,
        carbs: 0,
        fat: 0,
        taco_match: null
      });
      
      console.log(`⚠️ TACO: ${food.name} não encontrado, usando estimativa: ${Math.round(estimatedKcal)} kcal`);
    }
  }

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
const FOOD_DETECTION_PROMPT = `
Você é um especialista em nutrição brasileira analisando uma foto de refeição.

🎯 INSTRUÇÕES:
1. Identifique TODOS os alimentos visíveis
2. Estime as porções em GRAMAS baseado no tamanho visual
3. Use nomes específicos (ex: "arroz branco", "frango grelhado", "feijão carioca")

📋 PORÇÕES TÍPICAS BRASILEIRAS:
- Arroz: 100-150g (4-6 colheres de sopa)
- Feijão: 80-100g (concha média)
- Carne/Frango: 100-150g (bife médio)
- Salada: 50-80g
- Batata frita: 60-100g
- Pizza (fatia): 100-130g
- Hambúrguer: 150-200g

⚠️ RESPONDA APENAS COM JSON:
{
  "foods": [
    {"name": "nome_alimento", "grams": 150, "confidence": 0.9}
  ],
  "is_food_detected": true,
  "meal_type": "almoco"
}`;

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
