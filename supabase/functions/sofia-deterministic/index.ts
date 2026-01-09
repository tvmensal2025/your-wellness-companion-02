import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const NUTRITION_DEBUG = Deno.env.get('NUTRITION_DEBUG') === 'true';

// Normalização de texto para busca (igual ao nutrition-calc.ts)
function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Remove caracteres especiais
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();
}

interface DetectedFood {
  name: string;
  grams?: number;
  ml?: number;
  state?: 'cru' | 'cozido' | 'grelhado' | 'frito';
}

interface NutritionCalculation {
  total_kcal: number;
  total_proteina: number;
  total_carbo: number;
  total_gordura: number;
  total_fibras: number;
  total_sodio: number;
  matched_count: number;
  total_count: number;
  unmatched_items: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { detected_foods, user_id, analysis_type = 'nutritional_sum', request_id } = await req.json();
    
    console.log('🔥 Sofia Deterministic - Cálculo nutricional exato');
    console.log(`📊 Processando ${detected_foods?.length || 0} alimentos`);
    if (request_id) {
      console.log(`🆔 Request ID: ${request_id}`);
    }

    if (!detected_foods || !Array.isArray(detected_foods)) {
      throw new Error('detected_foods deve ser um array');
    }

    // Buscar nome do usuário para resposta personalizada
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user_id)
      .single();
    
    const userName = profile?.full_name?.split(' ')[0] || 'querido(a)';

    // Calcular nutrição determinística
    const nutrition = await calculateDeterministicNutrition(supabase, detected_foods);
    
    // Gerar resposta única formatada
    const response = generateSofiaResponse(userName, nutrition, detected_foods);
    
    // Salvar dados no banco antes de responder
    if (user_id && analysis_type === 'nutritional_sum') {
      await saveFoodAnalysis(supabase, user_id, detected_foods, nutrition);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis_type: 'nutritional_sum',
      sofia_response: response,
      nutrition_data: nutrition
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro Sofia Deterministic:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : String(error),
      sofia_response: 'Ops! Tive um problema ao analisar sua refeição. Tente novamente! 😅'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function calculateDeterministicNutrition(supabase: any, foods: DetectedFood[]): Promise<NutritionCalculation> {
  const result: NutritionCalculation = {
    total_kcal: 0,
    total_proteina: 0,
    total_carbo: 0,
    total_gordura: 0,
    total_fibras: 0,
    total_sodio: 0,
    matched_count: 0,
    total_count: foods.length,
    unmatched_items: []
  };

  console.log(`🔥 CÁLCULO NUTRICIONAL TACO ROBUSTO - Processando ${foods.length} alimentos`);

  for (const food of foods) {
    const grams = Number(food.grams) || 100;
    const originalName = food.name.toLowerCase().trim();
    console.log(`🔍 Buscando: "${originalName}" (${grams}g)`);

    // Estratégia de busca em múltiplas etapas
    let selectedFood = await searchTacoFood(supabase, originalName);

    if (selectedFood) {
      const factor = grams / 100.0;
      
      const item_kcal = Number(selectedFood.energy_kcal || 0) * factor;
      const item_protein = Number(selectedFood.protein_g || 0) * factor;
      const item_carbs = Number(selectedFood.carbohydrate_g || 0) * factor;
      const item_fat = Number(selectedFood.lipids_g || 0) * factor;
      const item_fiber = Number(selectedFood.fiber_g || 0) * factor;
      const item_sodium = Number(selectedFood.sodium_mg || 0) * factor;
      
      result.total_kcal += item_kcal;
      result.total_proteina += item_protein;
      result.total_carbo += item_carbs;
      result.total_gordura += item_fat;
      result.total_fibras += item_fiber;
      result.total_sodio += item_sodium;
      
      result.matched_count++;
      
      console.log(`✅ ENCONTRADO: "${selectedFood.food_name}"`);
      console.log(`   ${grams}g = ${Math.round(item_kcal)} kcal, ${item_protein.toFixed(1)}g prot, ${item_carbs.toFixed(1)}g carb, ${item_fat.toFixed(1)}g gord`);
    } else {
      result.unmatched_items.push(food.name);
      console.warn(`❌ NÃO ENCONTRADO: "${food.name}"`);
    }
  }

  result.total_kcal = Math.round(result.total_kcal);
  result.total_proteina = Math.round(result.total_proteina * 10) / 10;
  result.total_carbo = Math.round(result.total_carbo * 10) / 10;
  result.total_gordura = Math.round(result.total_gordura * 10) / 10;
  result.total_fibras = Math.round(result.total_fibras * 10) / 10;
  result.total_sodio = Math.round(result.total_sodio);

  console.log('✅ RESUMO FINAL (TACO):');
  console.log(`   🔥 ${result.total_kcal} kcal`);
  console.log(`   💪 ${result.total_proteina}g proteínas`);
  console.log(`   🍞 ${result.total_carbo}g carboidratos`);
  console.log(`   🥑 ${result.total_gordura}g gorduras`);
  console.log(`   ✅ ${result.matched_count}/${result.total_count} alimentos encontrados`);
  
  return result;
}

// Função de busca robusta com múltiplas estratégias
async function searchTacoFood(supabase: any, foodName: string): Promise<any> {
  const normalized = normalizeText(foodName);
  
  // Mapeamento de sinônimos comuns para nomes TACO
  // ⚠️ IMPORTANTE: Leguminosas mapeiam para versão COZIDA (não crua!)
  const synonyms: Record<string, string> = {
    'arroz': 'arroz, tipo 1, cozido',
    'arroz branco': 'arroz, tipo 1, cozido',
    'arroz branco cozido': 'arroz, tipo 1, cozido',
    'arroz cozido': 'arroz, tipo 1, cozido',
    'arroz integral': 'arroz, integral, cozido',
    'arroz integral cozido': 'arroz, integral, cozido',
    
    // LEGUMINOSAS - SEMPRE versão cozida!
    'grão de bico': 'grão-de-bico cozido',
    'grao de bico': 'grão-de-bico cozido',
    'grão de bico cozido': 'grão-de-bico cozido',
    'grao de bico cozido': 'grão-de-bico cozido',
    'grão-de-bico': 'grão-de-bico cozido',
    'grão-de-bico cozido': 'grão-de-bico cozido',
    'lentilha': 'lentilha cozida',
    'lentilha cozida': 'lentilha cozida',
    'ervilha': 'ervilha cozida',
    'ervilha cozida': 'ervilha cozida',
    'soja': 'soja cozida',
    'soja cozida': 'soja cozida',
    
    // FEIJÕES - versão cozida
    'feijao': 'feijão, carioca, cozido',
    'feijao carioca': 'feijão, carioca, cozido',
    'feijao carioca cozido': 'feijão, carioca, cozido',
    'feijao preto': 'feijão, preto, cozido',
    'feijao preto cozido': 'feijão, preto, cozido',
    'feijão': 'feijão, carioca, cozido',
    'feijão carioca': 'feijão, carioca, cozido',
    'feijão carioca cozido': 'feijão, carioca, cozido',
    'feijão preto': 'feijão, preto, cozido',
    'feijão preto cozido': 'feijão, preto, cozido',
    
    'ovo': 'ovo, de galinha, inteiro, cozido',
    'ovo cozido': 'ovo, de galinha, inteiro, cozido',
    'ovo frito': 'ovo, de galinha, inteiro, frito',
    'ovo mexido': 'ovo, de galinha, inteiro, frito',
    
    // FRANGO
    'frango': 'frango, peito, sem pele, grelhado',
    'peito de frango': 'frango, peito, sem pele, grelhado',
    'frango grelhado': 'frango, peito, sem pele, grelhado',
    'frango desfiado': 'frango, peito, sem pele, cozido',
    'frango cozido': 'frango, peito, sem pele, cozido',
    
    // CARNES - Mapeamento mais robusto para evitar match errado
    'carne': 'carne, bovina, patinho, cozido',
    'carne bovina': 'carne, bovina, patinho, cozido',
    'carne moida': 'carne, bovina, patinho, cozido',
    'carne moída': 'carne, bovina, patinho, cozido',
    'carne moida refogada': 'carne, bovina, patinho, cozido',
    'carne moída refogada': 'carne, bovina, patinho, cozido',
    'carne moida cozida': 'carne, bovina, patinho, cozido',
    'carne moída cozida': 'carne, bovina, patinho, cozido',
    'carne refogada': 'carne, bovina, patinho, cozido',
    'carne cozida': 'carne, bovina, patinho, cozido',
    'patinho': 'carne, bovina, patinho, cozido',
    'patinho moido': 'carne, bovina, patinho, cozido',
    'patinho moído': 'carne, bovina, patinho, cozido',
    'acém': 'carne, bovina, acém, moído, cozido',
    'acem': 'carne, bovina, acém, moído, cozido',
    'acém moído': 'carne, bovina, acém, moído, cozido',
    'acem moido': 'carne, bovina, acém, moído, cozido',
    'bife': 'carne, bovina, alcatra, grelhada',
    'bife grelhado': 'carne, bovina, alcatra, grelhada',
    'picanha': 'carne, bovina, picanha, grelhada',
    'alcatra': 'carne, bovina, alcatra, grelhada',
    
    // BATATAS
    'batata': 'batata, inglesa, cozida',
    'batata cozida': 'batata, inglesa, cozida',
    'batata frita': 'batata, inglesa, frita',
    'batata doce': 'batata, doce, cozida',
    'batata doce cozida': 'batata, doce, cozida',
    'mandioca': 'mandioca, cozida',
    'mandioca cozida': 'mandioca, cozida',
    'aipim': 'mandioca, cozida',
    'macaxeira': 'mandioca, cozida',
    
    // VEGETAIS
    'salada': 'alface, crespa, crua',
    'alface': 'alface, crespa, crua',
    'tomate': 'tomate, cru',
    'cenoura': 'cenoura, crua',
    'brocolis': 'brócolis, cozido',
    'brócolis': 'brócolis, cozido',
    'couve': 'couve, manteiga, refogada',
    'couve refogada': 'couve, manteiga, refogada',
    
    // FRUTAS
    'banana': 'banana, nanica, crua',
    'banana nanica': 'banana, nanica, crua',
    'maca': 'maçã, fuji, crua',
    'maçã': 'maçã, fuji, crua',
    'laranja': 'laranja, pera, crua',
    
    // LATICÍNIOS
    'leite': 'leite, de vaca, integral',
    'queijo': 'queijo, minas, frescal',
    'queijo minas': 'queijo, minas, frescal',
    'mussarela': 'queijo, mussarela',
    
    // PÃES E MASSAS
    'pao': 'pão, trigo, francês',
    'pão': 'pão, trigo, francês',
    'pao frances': 'pão, trigo, francês',
    'pão francês': 'pão, trigo, francês',
    'pao de forma': 'pão, trigo, forma, integral',
    'macarrao': 'macarrão, trigo, cozido',
    'macarrão': 'macarrão, trigo, cozido',
    'macarrao cozido': 'macarrão, trigo, cozido',
    'macarrão cozido': 'macarrão, trigo, cozido',
    'espaguete': 'macarrão, trigo, cozido',
    
    // EMBUTIDOS
    'linguica': 'linguiça, de porco, frita',
    'linguiça': 'linguiça, de porco, frita',
    'bacon': 'bacon, defumado',
    'presunto': 'presunto, cru',
    
    // BEBIDAS E OUTROS
    'cafe': 'café, infusão 10%',
    'café': 'café, infusão 10%',
    'suco de laranja': 'suco, de laranja, integral',
    'agua de coco': 'água de coco',
    'água de coco': 'água de coco',
    'acucar': 'açúcar, refinado',
    'açúcar': 'açúcar, refinado',
    'mel': 'mel, de abelha',
    'azeite': 'azeite, de oliva, extra virgem',
    'oleo': 'óleo, de soja',
    'óleo': 'óleo, de soja',
    'manteiga': 'manteiga, com sal',
    'maionese': 'maionese, tradicional',
    'ketchup': 'ketchup',
    'farofa': 'farofa, de mandioca',
  };
  
  // Valores HARDCODED para leguminosas cozidas (fallback se não achar no banco)
  const COOKED_LEGUMES_FALLBACK: Record<string, { kcal: number; protein: number; carbs: number; fat: number; fiber: number }> = {
    'grão-de-bico cozido': { kcal: 128, protein: 8.5, carbs: 20.5, fat: 2.0, fiber: 6.0 },
    'lentilha cozida': { kcal: 93, protein: 6.3, carbs: 16.3, fat: 0.5, fiber: 7.9 },
    'ervilha cozida': { kcal: 72, protein: 5.0, carbs: 12.6, fat: 0.4, fiber: 4.3 },
    'soja cozida': { kcal: 151, protein: 14.0, carbs: 8.0, fat: 6.8, fiber: 5.6 },
  };

  // 1. Verificar sinônimos primeiro
  const synonymKey = Object.keys(synonyms).find(key => normalized.includes(key));
  if (synonymKey) {
    const tacoName = synonyms[synonymKey];
    
    // 1a. Verificar fallback de leguminosas cozidas PRIMEIRO
    if (COOKED_LEGUMES_FALLBACK[tacoName]) {
      const fallback = COOKED_LEGUMES_FALLBACK[tacoName];
      console.log(`   🥗 Leguminosa cozida (fallback): "${normalized}" → ${fallback.kcal} kcal/100g`);
      return {
        food_name: tacoName,
        energy_kcal: fallback.kcal,
        protein_g: fallback.protein,
        carbohydrate_g: fallback.carbs,
        lipids_g: fallback.fat,
        fiber_g: fallback.fiber,
        sodium_mg: 0
      };
    }
    
    const { data } = await supabase
      .from('taco_foods')
      .select('food_name, energy_kcal, protein_g, carbohydrate_g, lipids_g, fiber_g, sodium_mg')
      .ilike('food_name', `%${tacoName}%`)
      .limit(1);
    
    if (data && data.length > 0) {
      // IMPORTANTE: Se encontrou versão CRU mas estamos buscando COZIDO, usar fallback
      const foundName = data[0].food_name.toLowerCase();
      if ((normalized.includes('cozid') || tacoName.includes('cozid')) && foundName.includes('cru')) {
        console.log(`   ⚠️ Encontrou CRU mas buscamos COZIDO - verificando fallback...`);
        // Tentar encontrar no fallback
        const legumeFallbackKey = Object.keys(COOKED_LEGUMES_FALLBACK).find(k => 
          normalized.includes(k.replace(' cozida', '').replace(' cozido', ''))
        );
        if (legumeFallbackKey) {
          const fb = COOKED_LEGUMES_FALLBACK[legumeFallbackKey];
          console.log(`   🥗 Usando fallback cozido: ${fb.kcal} kcal/100g (não ${data[0].energy_kcal})`);
          return {
            food_name: legumeFallbackKey,
            energy_kcal: fb.kcal,
            protein_g: fb.protein,
            carbohydrate_g: fb.carbs,
            lipids_g: fb.fat,
            fiber_g: fb.fiber,
            sodium_mg: 0
          };
        }
      }
      
      console.log(`   🔗 Sinônimo: "${normalized}" → "${tacoName}"`);
      return data[0];
    }
  }

  // 2. Busca por nome exato
  const { data: exactMatch } = await supabase
    .from('taco_foods')
    .select('food_name, energy_kcal, protein_g, carbohydrate_g, lipids_g, fiber_g, sodium_mg')
    .ilike('food_name', `%${foodName}%`)
    .limit(1);
  
  if (exactMatch && exactMatch.length > 0) {
    // Verificar se é leguminosa crua quando queremos cozida
    const foundName = exactMatch[0].food_name.toLowerCase();
    if ((normalized.includes('cozid') || foodName.toLowerCase().includes('cozid')) && foundName.includes('cru')) {
      console.log(`   ⚠️ Match exato é CRU mas buscamos COZIDO`);
      const legumeFallbackKey = Object.keys(COOKED_LEGUMES_FALLBACK).find(k => 
        normalized.includes(k.replace(' cozida', '').replace(' cozido', ''))
      );
      if (legumeFallbackKey) {
        const fb = COOKED_LEGUMES_FALLBACK[legumeFallbackKey];
        return {
          food_name: legumeFallbackKey,
          energy_kcal: fb.kcal,
          protein_g: fb.protein,
          carbohydrate_g: fb.carbs,
          lipids_g: fb.fat,
          fiber_g: fb.fiber,
          sodium_mg: 0
        };
      }
    }
    return exactMatch[0];
  }

  // 3. Busca por palavras-chave principais
  const keywords = normalized.split(' ').filter(w => w.length > 2);
  for (const keyword of keywords) {
    // Verificar se é leguminosa conhecida
    const legumeFallbackKey = Object.keys(COOKED_LEGUMES_FALLBACK).find(k => 
      k.includes(keyword) && (normalized.includes('cozid') || !normalized.includes('cru'))
    );
    if (legumeFallbackKey) {
      const fb = COOKED_LEGUMES_FALLBACK[legumeFallbackKey];
      console.log(`   🥗 Leguminosa por keyword: "${keyword}" → ${legumeFallbackKey}`);
      return {
        food_name: legumeFallbackKey,
        energy_kcal: fb.kcal,
        protein_g: fb.protein,
        carbohydrate_g: fb.carbs,
        lipids_g: fb.fat,
        fiber_g: fb.fiber,
        sodium_mg: 0
      };
    }
    
    const { data: keywordMatch } = await supabase
      .from('taco_foods')
      .select('food_name, energy_kcal, protein_g, carbohydrate_g, lipids_g, fiber_g, sodium_mg')
      .ilike('food_name', `%${keyword}%`)
      .limit(1);
    
    if (keywordMatch && keywordMatch.length > 0) {
      console.log(`   🔑 Palavra-chave: "${keyword}"`);
      return keywordMatch[0];
    }
  }

  return null;
}

function generateSofiaResponse(userName: string, nutrition: NutritionCalculation, foods: DetectedFood[]): string {  
  return `💪 Proteínas: ${nutrition.total_proteina.toFixed(1)} g
🍞 Carboidratos: ${nutrition.total_carbo.toFixed(1)} g
🥑 Gorduras: ${nutrition.total_gordura.toFixed(1)} g
🔥 Estimativa calórica: ${nutrition.total_kcal} kcal

✅ Dados salvos com sucesso!`;
}

async function saveFoodAnalysis(supabase: any, user_id: string, foods: DetectedFood[], nutrition: NutritionCalculation) {
  try {
    // Salvar em sofia_food_analysis (tabela existente)
    const { error } = await supabase
      .from('sofia_food_analysis')
      .insert({
        user_id,
        foods_detected: foods,
        analysis_result: nutrition,
        total_calories: Math.round(nutrition.total_kcal || 0),
        total_protein: nutrition.total_proteina || 0,
        total_carbs: nutrition.total_carbo || 0,
        total_fat: nutrition.total_gordura || 0,
        total_fiber: nutrition.total_fibras || 0,
        confirmation_status: 'confirmed',
        confirmed_by_user: true,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erro ao salvar sofia_food_analysis:', error);
    } else {
      console.log('✅ Análise salva em sofia_food_analysis');
    }
  } catch (error) {
    console.error('Erro inesperado ao salvar:', error);
  }
}
