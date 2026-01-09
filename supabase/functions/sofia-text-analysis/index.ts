import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Banco de alimentos comum com calorias aproximadas
const FOOD_DATABASE: Record<string, { kcal_per_100g: number; portion_g: number }> = {
  "arroz": { kcal_per_100g: 130, portion_g: 150 },
  "arroz branco": { kcal_per_100g: 130, portion_g: 150 },
  "arroz integral": { kcal_per_100g: 111, portion_g: 150 },
  "feijão": { kcal_per_100g: 77, portion_g: 100 },
  "feijao": { kcal_per_100g: 77, portion_g: 100 },
  "feijão preto": { kcal_per_100g: 77, portion_g: 100 },
  "feijão carioca": { kcal_per_100g: 76, portion_g: 100 },
  "frango": { kcal_per_100g: 165, portion_g: 120 },
  "frango grelhado": { kcal_per_100g: 165, portion_g: 120 },
  "peito de frango": { kcal_per_100g: 165, portion_g: 120 },
  "carne": { kcal_per_100g: 250, portion_g: 120 },
  "carne bovina": { kcal_per_100g: 250, portion_g: 120 },
  "bife": { kcal_per_100g: 250, portion_g: 120 },
  "ovo": { kcal_per_100g: 155, portion_g: 50 },
  "ovos": { kcal_per_100g: 155, portion_g: 100 },
  "ovo frito": { kcal_per_100g: 196, portion_g: 50 },
  "ovo cozido": { kcal_per_100g: 155, portion_g: 50 },
  "salada": { kcal_per_100g: 20, portion_g: 100 },
  "alface": { kcal_per_100g: 15, portion_g: 50 },
  "tomate": { kcal_per_100g: 18, portion_g: 80 },
  "batata": { kcal_per_100g: 77, portion_g: 150 },
  "batata frita": { kcal_per_100g: 312, portion_g: 150 },
  "pure": { kcal_per_100g: 83, portion_g: 150 },
  "purê": { kcal_per_100g: 83, portion_g: 150 },
  "macarrão": { kcal_per_100g: 131, portion_g: 200 },
  "macarrao": { kcal_per_100g: 131, portion_g: 200 },
  "pão": { kcal_per_100g: 265, portion_g: 50 },
  "pao": { kcal_per_100g: 265, portion_g: 50 },
  "pão francês": { kcal_per_100g: 300, portion_g: 50 },
  "pão de forma": { kcal_per_100g: 250, portion_g: 25 },
  "café": { kcal_per_100g: 2, portion_g: 100 },
  "cafe": { kcal_per_100g: 2, portion_g: 100 },
  "leite": { kcal_per_100g: 61, portion_g: 200 },
  "suco": { kcal_per_100g: 45, portion_g: 250 },
  "suco de laranja": { kcal_per_100g: 45, portion_g: 250 },
  "banana": { kcal_per_100g: 89, portion_g: 100 },
  "maçã": { kcal_per_100g: 52, portion_g: 150 },
  "maca": { kcal_per_100g: 52, portion_g: 150 },
  "laranja": { kcal_per_100g: 47, portion_g: 150 },
  "queijo": { kcal_per_100g: 350, portion_g: 30 },
  "queijo minas": { kcal_per_100g: 264, portion_g: 30 },
  "manteiga": { kcal_per_100g: 717, portion_g: 10 },
  "margarina": { kcal_per_100g: 717, portion_g: 10 },
  "açúcar": { kcal_per_100g: 387, portion_g: 10 },
  "acucar": { kcal_per_100g: 387, portion_g: 10 },
  "refrigerante": { kcal_per_100g: 42, portion_g: 350 },
  "coca": { kcal_per_100g: 42, portion_g: 350 },
  "cerveja": { kcal_per_100g: 43, portion_g: 350 },
  "pizza": { kcal_per_100g: 266, portion_g: 100 },
  "hamburguer": { kcal_per_100g: 295, portion_g: 150 },
  "hamburger": { kcal_per_100g: 295, portion_g: 150 },
  "sanduíche": { kcal_per_100g: 250, portion_g: 150 },
  "sanduiche": { kcal_per_100g: 250, portion_g: 150 },
  "lanche": { kcal_per_100g: 250, portion_g: 150 },
  "farofa": { kcal_per_100g: 403, portion_g: 50 },
  "vinagrete": { kcal_per_100g: 60, portion_g: 50 },
  "molho": { kcal_per_100g: 80, portion_g: 30 },
  "legumes": { kcal_per_100g: 50, portion_g: 100 },
  "verduras": { kcal_per_100g: 25, portion_g: 100 },
  "cebola": { kcal_per_100g: 40, portion_g: 50 },
  "alho": { kcal_per_100g: 149, portion_g: 5 },
  "azeite": { kcal_per_100g: 884, portion_g: 10 },
  "óleo": { kcal_per_100g: 884, portion_g: 10 },
  "oleo": { kcal_per_100g: 884, portion_g: 10 },
  "iogurte": { kcal_per_100g: 59, portion_g: 170 },
  "granola": { kcal_per_100g: 471, portion_g: 40 },
  "aveia": { kcal_per_100g: 389, portion_g: 30 },
  "cereal": { kcal_per_100g: 379, portion_g: 40 },
  "tapioca": { kcal_per_100g: 130, portion_g: 50 },
  "cuscuz": { kcal_per_100g: 112, portion_g: 135 },
  "peixe": { kcal_per_100g: 206, portion_g: 120 },
  "camarão": { kcal_per_100g: 99, portion_g: 100 },
  "camarao": { kcal_per_100g: 99, portion_g: 100 },
  "carne de porco": { kcal_per_100g: 242, portion_g: 120 },
  "linguiça": { kcal_per_100g: 296, portion_g: 100 },
  "linguica": { kcal_per_100g: 296, portion_g: 100 },
  "bacon": { kcal_per_100g: 541, portion_g: 30 },
  "presunto": { kcal_per_100g: 145, portion_g: 30 },
  "mortadela": { kcal_per_100g: 311, portion_g: 30 },
  "salsicha": { kcal_per_100g: 257, portion_g: 50 },
  "torrada": { kcal_per_100g: 313, portion_g: 20 },
  "biscoito": { kcal_per_100g: 502, portion_g: 30 },
  "bolacha": { kcal_per_100g: 502, portion_g: 30 },
  "bolo": { kcal_per_100g: 347, portion_g: 60 },
  "chocolate": { kcal_per_100g: 546, portion_g: 30 },
  "doce": { kcal_per_100g: 300, portion_g: 50 },
  "sorvete": { kcal_per_100g: 207, portion_g: 100 },
  "pudim": { kcal_per_100g: 140, portion_g: 100 },
  "brigadeiro": { kcal_per_100g: 410, portion_g: 20 },
  "açaí": { kcal_per_100g: 58, portion_g: 200 },
  "acai": { kcal_per_100g: 58, portion_g: 200 },
  "agua": { kcal_per_100g: 0, portion_g: 200 },
  "água": { kcal_per_100g: 0, portion_g: 200 },
  "chá": { kcal_per_100g: 1, portion_g: 200 },
  "cha": { kcal_per_100g: 1, portion_g: 200 },
};

// Detectar alimentos no texto usando matching simples
function detectFoodsFromText(text: string): Array<{ nome: string; grams: number; kcal: number }> {
  const normalizedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ");
  
  const words = normalizedText.split(/\s+/);
  const detectedFoods: Array<{ nome: string; grams: number; kcal: number }> = [];
  const usedIndices = new Set<number>();

  // Primeiro, tentar encontrar combinações de 2-3 palavras
  for (let i = 0; i < words.length; i++) {
    if (usedIndices.has(i)) continue;
    
    // Tentar 3 palavras
    if (i + 2 < words.length) {
      const threeWords = `${words[i]} ${words[i+1]} ${words[i+2]}`;
      if (FOOD_DATABASE[threeWords]) {
        const food = FOOD_DATABASE[threeWords];
        const kcal = Math.round((food.kcal_per_100g * food.portion_g) / 100);
        detectedFoods.push({ nome: threeWords, grams: food.portion_g, kcal });
        usedIndices.add(i); usedIndices.add(i+1); usedIndices.add(i+2);
        continue;
      }
    }
    
    // Tentar 2 palavras
    if (i + 1 < words.length) {
      const twoWords = `${words[i]} ${words[i+1]}`;
      if (FOOD_DATABASE[twoWords]) {
        const food = FOOD_DATABASE[twoWords];
        const kcal = Math.round((food.kcal_per_100g * food.portion_g) / 100);
        detectedFoods.push({ nome: twoWords, grams: food.portion_g, kcal });
        usedIndices.add(i); usedIndices.add(i+1);
        continue;
      }
    }
    
    // Tentar 1 palavra
    const oneWord = words[i];
    if (FOOD_DATABASE[oneWord]) {
      const food = FOOD_DATABASE[oneWord];
      const kcal = Math.round((food.kcal_per_100g * food.portion_g) / 100);
      detectedFoods.push({ nome: oneWord, grams: food.portion_g, kcal });
      usedIndices.add(i);
    }
  }

  return detectedFoods;
}

// Usar IA para análise mais sofisticada quando banco local não encontra
async function analyzeWithAI(text: string, supabaseUrl: string): Promise<any> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/lovable-ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Você é um analisador de alimentos. Extraia APENAS os alimentos mencionados no texto.
            
Responda SOMENTE em JSON válido, sem markdown, no formato:
{"foods":[{"nome":"arroz","grams":150,"kcal":195},{"nome":"feijão","grams":100,"kcal":77}]}

Regras:
- Use porções típicas brasileiras
- Estime calorias baseado na tabela TACO
- Se não encontrar alimentos, retorne {"foods":[]}
- NUNCA inclua explicações, apenas o JSON`
          },
          {
            role: "user",
            content: `Analise: "${text}"`
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error("[sofia-text-analysis] AI error:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error("[sofia-text-analysis] AI analysis error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, userId, contextType } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Texto não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[sofia-text-analysis] Analisando: "${text.slice(0, 100)}..."`);

    // Primeiro, tentar detecção local (mais rápida)
    let detectedFoods = detectFoodsFromText(text);
    let usedAI = false;

    // Se não encontrou nada localmente, usar IA
    if (detectedFoods.length === 0) {
      console.log("[sofia-text-analysis] Banco local vazio, usando IA...");
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const aiResult = await analyzeWithAI(text, supabaseUrl);
      
      if (aiResult?.foods && aiResult.foods.length > 0) {
        detectedFoods = aiResult.foods.map((f: any) => ({
          nome: f.nome || f.name,
          grams: f.grams || f.quantidade || 100,
          kcal: f.kcal || f.calorias || 0,
        }));
        usedAI = true;
      }
    }

    // Calcular totais
    const totalKcal = detectedFoods.reduce((sum, f) => sum + (f.kcal || 0), 0);

    const result = {
      detected_foods: detectedFoods.map(f => ({
        name: f.nome,
        nome: f.nome,
        grams: f.grams,
        quantidade: f.grams,
        kcal: f.kcal,
        calorias: f.kcal,
      })),
      foods: detectedFoods,
      nutrition_data: {
        total_kcal: totalKcal,
        foods_count: detectedFoods.length,
      },
      total_kcal: totalKcal,
      source: usedAI ? "ai" : "local_database",
      analyzed_text: text.slice(0, 200),
    };

    console.log(`[sofia-text-analysis] Resultado: ${detectedFoods.length} alimentos, ${totalKcal} kcal`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[sofia-text-analysis] Erro:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro na análise",
        detected_foods: [],
        foods: [],
        nutrition_data: { total_kcal: 0 },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
