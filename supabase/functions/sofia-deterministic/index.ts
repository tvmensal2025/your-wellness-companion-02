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

  console.log(`🔥 CÁLCULO NUTRICIONAL DIRETO TACO - Processando ${foods.length} alimentos`);

  for (const food of foods) {
    const grams = Number(food.grams) || 100;
    console.log(`🔍 Buscando na TACO: ${food.name} (${grams}g)`);

    const normalizedName = normalizeText(food.name);
    const { data: tacoData } = await supabase
      .from('taco_foods')
      .select('nome_alimento, energia_kcal, proteina_g, carboidratos_g, lipidios_g, fibra_alimentar_g, sodio_mg')
      .order('id');

    let selectedFood = null;
    
    if (tacoData && tacoData.length > 0) {
      selectedFood = tacoData.find((item: any) => {
        const itemName = normalizeText(item.nome_alimento);
        return itemName.includes(normalizedName) || normalizedName.includes(itemName);
      });
      
      if (!selectedFood) {
        const keywords = normalizedName.split(' ').filter(w => w.length > 2);
        selectedFood = tacoData.find((item: any) => {
          const itemName = normalizeText(item.nome_alimento);
          return keywords.some(keyword => itemName.includes(keyword));
        });
      }
    }

    if (selectedFood) {
      const factor = grams / 100.0;
      
      const item_kcal = Number(selectedFood.energia_kcal || 0) * factor;
      const item_protein = Number(selectedFood.proteina_g || 0) * factor;
      const item_carbs = Number(selectedFood.carboidratos_g || 0) * factor;
      const item_fat = Number(selectedFood.lipidios_g || 0) * factor;
      const item_fiber = Number(selectedFood.fibra_alimentar_g || 0) * factor;
      const item_sodium = Number(selectedFood.sodio_mg || 0) * factor;
      
      result.total_kcal += item_kcal;
      result.total_proteina += item_protein;
      result.total_carbo += item_carbs;
      result.total_gordura += item_fat;
      result.total_fibras += item_fiber;
      result.total_sodio += item_sodium;
      
      result.matched_count++;
      
      if (NUTRITION_DEBUG) {
        console.log(`✅ TACO: ${selectedFood.nome_alimento}`);
        console.log(`   ${grams}g = ${Math.round(item_kcal)} kcal, ${item_protein.toFixed(1)}g prot, ${item_carbs.toFixed(1)}g carb, ${item_fat.toFixed(1)}g gord`);
      }
    } else {
      result.unmatched_items.push(food.name);
      console.warn(`❌ NÃO ENCONTRADO: ${food.name}`);
    }
  }

  result.total_kcal = Math.round(result.total_kcal);
  result.total_proteina = Math.round(result.total_proteina * 10) / 10;
  result.total_carbo = Math.round(result.total_carbo * 10) / 10;
  result.total_gordura = Math.round(result.total_gordura * 10) / 10;
  result.total_fibras = Math.round(result.total_fibras * 10) / 10;
  result.total_sodio = Math.round(result.total_sodio);

  console.log('✅ RESUMO FINAL (Valores diretos TACO):');
  console.log(`   🔥 ${result.total_kcal} kcal`);
  console.log(`   💪 ${result.total_proteina}g proteínas`);
  console.log(`   🍞 ${result.total_carbo}g carboidratos`);
  console.log(`   🥑 ${result.total_gordura}g gorduras`);
  console.log(`   ✅ ${result.matched_count}/${result.total_count} alimentos encontrados`);
  
  return result;
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
    const { error } = await supabase
      .from('food_analysis_logs')
      .insert({
        user_id,
        detected_foods: foods,
        nutrition_data: nutrition,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erro ao salvar food_analysis_logs:', error);
    }
  } catch (error) {
    console.error('Erro inesperado ao salvar food_analysis_logs:', error);
  }
}
