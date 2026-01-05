// ========================================
// 🔧 SISTEMA APRIMORADO DE DETECÇÃO DE ALIMENTOS
// Prioridade: Google Gemini Vision API direto (mais preciso)
// Fallback: Lovable AI
// ========================================

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const RATE_LIMIT_DELAY = 1500; // 1.5 segundos entre requests
const MAX_RETRIES = 3;

// Configuração de IA (pode ser sobrescrita via parâmetro)
let AI_MODEL_CONFIG = {
  model: 'gemini-2.0-flash',  // Modelo mais recente e preciso
  max_tokens: 2500,
  temperature: 0.3
};

// ========================================
// 🤖 PROMPTS MELHORADOS PARA DETECÇÃO
// ========================================

export const ENHANCED_FOOD_PROMPTS = {
  // Prompt principal - foco em precisão e estrutura
  primary: `
Você é um especialista em análise nutricional visual de alimentos brasileiros.
Analise esta imagem com MÁXIMA PRECISÃO.

🎯 INSTRUÇÕES CRÍTICAS:
1. Identifique TODOS os alimentos visíveis na imagem
2. Estime as porções em gramas com base no tamanho aparente
3. Seja ESPECÍFICO: "bife grelhado" em vez de "carne"
4. Para líquidos, estime em ml e converta (1ml ≈ 1g para água/sucos)
5. Considere o contexto cultural brasileiro

📋 CATEGORIAS PARA IDENTIFICAR:
- Proteínas: carnes, frango, peixe, ovos, queijos
- Carboidratos: arroz, feijão, batata, massas, pães
- Vegetais: saladas, legumes cozidos ou crus
- Frutas: in natura ou processadas
- Bebidas: sucos, refrigerantes, café, água
- Lanches: pizza, hambúrguer, salgados, sanduíches
- Doces: sobremesas, bolos, brigadeiros

⚠️ REGRAS OBRIGATÓRIAS:
- Responda APENAS com JSON válido
- Mínimo de 30g por item identificado
- Confidence entre 0.1 e 1.0
- Se não houver alimentos, retorne foods: [] com is_food_detected: false

🔄 FORMATO DE RESPOSTA (JSON puro, sem markdown):
{
  "foods": [
    {"name": "nome_do_alimento", "grams": 150, "confidence": 0.85}
  ],
  "is_food_detected": true,
  "meal_type": "almoco|jantar|lanche|cafe_manha",
  "total_items": 3
}`,

  // Prompt contextual - usa quando o primeiro falha
  contextual: `
Você é um nutricionista brasileiro analisando uma foto de refeição.
FOQUE em encontrar QUALQUER alimento visível, mesmo parcialmente.

🍽️ CONTEXTO BRASILEIRO:
- Refeições típicas: arroz + feijão + proteína + salada
- Lanches: pizza, hambúrguer, salgados (coxinha, pastel, empada)
- Café da manhã: pão, queijo, café com leite, frutas
- Sobremesas: pudim, brigadeiro, bolo

🔍 ESTRATÉGIA DE DETECÇÃO:
1. Examine cada parte da imagem sistematicamente
2. Identifique recipientes/pratos que indicam comida
3. Reconheça texturas e cores típicas de alimentos
4. Use inferência para alimentos parcialmente visíveis

RESPONDA APENAS EM JSON:
{
  "foods": [{"name": "alimento", "grams": 100, "confidence": 0.7}],
  "is_food_detected": true,
  "meal_type": "tipo_refeicao"
}`,

  // Prompt de emergência - última tentativa
  emergency: `
ANÁLISE DE EMERGÊNCIA - Encontre QUALQUER elemento comestível.

Identifique pela forma/cor:
- Redondo marrom = coxinha, hambúrguer, bolo
- Redondo vermelho = pizza, tomate
- Branco granulado = arroz
- Escuro granulado = feijão
- Folhas verdes = salada
- Líquido = bebida

RESPOSTA JSON OBRIGATÓRIA:
{"foods": [{"name": "item", "grams": 100, "confidence": 0.5}], "is_food_detected": true}`
};

// ========================================
// 🤖 FUNÇÃO PRINCIPAL COM GOOGLE GEMINI
// ========================================

export async function analyzeWithEnhancedAI(
  imageUrl: string, 
  attempt = 1, 
  config?: { model: string; max_tokens: number; temperature: number }
): Promise<{
  foods: Array<{ name: string; grams: number; confidence: number }>;
  total_calories: number;
  attempt_used: number;
  detection_method: string;
  success: boolean;
  provider?: string;
}> {
  // Aplicar configuração se fornecida
  if (config) {
    AI_MODEL_CONFIG = { ...AI_MODEL_CONFIG, ...config };
    console.log('🔧 Enhanced Detection config:', AI_MODEL_CONFIG);
  }

  // Verificar disponibilidade das APIs
  const hasGoogleAI = !!GOOGLE_AI_API_KEY;
  const hasLovableAI = !!LOVABLE_API_KEY;

  if (!hasGoogleAI && !hasLovableAI) {
    console.error('❌ Nenhuma IA configurada!');
    return createFallbackAnalysis();
  }

  console.log(`🤖 Análise aprimorada - Tentativa ${attempt}/${MAX_RETRIES}`);
  console.log(`   Google AI: ${hasGoogleAI ? '✅' : '❌'} | Lovable AI: ${hasLovableAI ? '✅' : '❌'}`);

  // PRIORIDADE: Google Gemini Vision direto (mais preciso para imagens)
  if (hasGoogleAI) {
    try {
      const result = await analyzeWithGoogleGemini(imageUrl, attempt);
      if (result.success && result.foods.length > 0) {
        return { ...result, provider: 'google_gemini' };
      }
    } catch (error) {
      console.error('❌ Erro no Google Gemini:', error);
    }
  }

  // FALLBACK: Lovable AI
  if (hasLovableAI) {
    try {
      const result = await analyzeWithLovableAI(imageUrl, attempt);
      if (result.success && result.foods.length > 0) {
        return { ...result, provider: 'lovable_ai' };
      }
    } catch (error) {
      console.error('❌ Erro no Lovable AI:', error);
    }
  }

  // Último recurso
  console.log('🆘 Todas as tentativas falharam, usando fallback...');
  return createFallbackAnalysis();
}

// ========================================
// 🌐 GOOGLE GEMINI VISION API (PRIORIDADE)
// ========================================

async function analyzeWithGoogleGemini(imageUrl: string, attempt = 1): Promise<{
  foods: Array<{ name: string; grams: number; confidence: number }>;
  total_calories: number;
  attempt_used: number;
  detection_method: string;
  success: boolean;
}> {
  console.log(`🌐 Google Gemini Vision - Tentativa ${attempt}/${MAX_RETRIES}`);

  // Escolher prompt baseado na tentativa
  const prompts = [
    ENHANCED_FOOD_PROMPTS.primary,
    ENHANCED_FOOD_PROMPTS.contextual,
    ENHANCED_FOOD_PROMPTS.emergency
  ];
  const prompt = prompts[Math.min(attempt - 1, 2)];

  try {
    // Delay para evitar rate limit
    if (attempt > 1) {
      const delay = RATE_LIMIT_DELAY * attempt;
      console.log(`⏳ Aguardando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Converter imagem para base64
    const imageBase64 = await fetchImageAsBase64(imageUrl);
    
    // Usar gemini-1.5-flash por ter mais cota disponível
    const modelName = 'gemini-1.5-flash';
    
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          { 
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: attempt >= 3 ? 0.6 : AI_MODEL_CONFIG.temperature,
        maxOutputTokens: AI_MODEL_CONFIG.max_tokens,
        topP: 0.95,
        topK: 40
      },
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };

    console.log(`🔗 Chamando Google Gemini: ${modelName}`);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Google API Error ${response.status}:`, errorText.substring(0, 200));
      
      // Rate limit - retry com backoff
      if (response.status === 429 && attempt < MAX_RETRIES) {
        const backoffDelay = RATE_LIMIT_DELAY * Math.pow(2, attempt);
        console.log(`⏳ Rate limit! Aguardando ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return analyzeWithGoogleGemini(imageUrl, attempt + 1);
      }
      
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.log('⚠️ Resposta vazia do Google Gemini');
      if (attempt < MAX_RETRIES) {
        return analyzeWithGoogleGemini(imageUrl, attempt + 1);
      }
      throw new Error('Resposta vazia');
    }

    console.log(`📝 Resposta Gemini (${responseText.length} chars):`, responseText.substring(0, 150) + '...');

    // Parsear resposta JSON
    const parsed = parseAIResponse(responseText);
    
    if (!parsed.foods || parsed.foods.length === 0) {
      console.log('⚠️ Nenhum alimento detectado');
      if (attempt < MAX_RETRIES) {
        return analyzeWithGoogleGemini(imageUrl, attempt + 1);
      }
    }

    const foods = normalizeDetectedFoods(parsed.foods || []);
    const totalCalories = estimateCalories(foods);

    console.log(`✅ Google Gemini detectou ${foods.length} alimentos`);

    return {
      foods,
      total_calories: totalCalories,
      attempt_used: attempt,
      detection_method: attempt === 1 ? 'primary' : attempt === 2 ? 'contextual' : 'emergency',
      success: foods.length > 0
    };

  } catch (error) {
    console.error(`❌ Erro na tentativa ${attempt} (Google):`, error);
    
    if (attempt < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * attempt));
      return analyzeWithGoogleGemini(imageUrl, attempt + 1);
    }
    
    throw error;
  }
}

// ========================================
// 🔗 LOVABLE AI (FALLBACK)
// ========================================

async function analyzeWithLovableAI(imageUrl: string, attempt = 1): Promise<{
  foods: Array<{ name: string; grams: number; confidence: number }>;
  total_calories: number;
  attempt_used: number;
  detection_method: string;
  success: boolean;
}> {
  console.log(`🔗 Lovable AI - Tentativa ${attempt}/${MAX_RETRIES}`);

  const prompts = [
    ENHANCED_FOOD_PROMPTS.primary,
    ENHANCED_FOOD_PROMPTS.contextual,
    ENHANCED_FOOD_PROMPTS.emergency
  ];
  const prompt = prompts[Math.min(attempt - 1, 2)];

  try {
    if (attempt > 1) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * attempt));
    }

    const body = {
      model: AI_MODEL_CONFIG.model || 'google/gemini-2.5-flash',
      max_tokens: AI_MODEL_CONFIG.max_tokens,
      temperature: AI_MODEL_CONFIG.temperature,
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em nutrição brasileira. Responda APENAS com JSON válido.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    };

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
      
      if ((resp.status === 429 || resp.status === 402) && attempt < MAX_RETRIES) {
        const backoffDelay = RATE_LIMIT_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return analyzeWithLovableAI(imageUrl, attempt + 1);
      }
      
      throw new Error(`Lovable AI error: ${resp.status}`);
    }

    const data = await resp.json();
    const responseText = data.choices?.[0]?.message?.content ?? '';

    if (!responseText) {
      if (attempt < MAX_RETRIES) {
        return analyzeWithLovableAI(imageUrl, attempt + 1);
      }
      throw new Error('Resposta vazia');
    }

    console.log(`📝 Resposta Lovable AI:`, responseText.substring(0, 150) + '...');

    const parsed = parseAIResponse(responseText);
    const foods = normalizeDetectedFoods(parsed.foods || []);
    const totalCalories = estimateCalories(foods);

    console.log(`✅ Lovable AI detectou ${foods.length} alimentos`);

    return {
      foods,
      total_calories: totalCalories,
      attempt_used: attempt,
      detection_method: `lovable_${attempt === 1 ? 'primary' : 'contextual'}`,
      success: foods.length > 0
    };

  } catch (error) {
    console.error(`❌ Erro Lovable AI tentativa ${attempt}:`, error);
    
    if (attempt < MAX_RETRIES) {
      return analyzeWithLovableAI(imageUrl, attempt + 1);
    }
    
    throw error;
  }
}

// ========================================
// 🛠️ FUNÇÕES AUXILIARES
// ========================================

function parseAIResponse(text: string): any {
  try {
    // Remover markdown code blocks
    let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    // Tentar encontrar JSON no texto
    const jsonPatterns = [
      /\{[\s\S]*"foods"[\s\S]*\}/,
      /\{[\s\S]*\}/
    ];
    
    for (const pattern of jsonPatterns) {
      const match = clean.match(pattern);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          continue;
        }
      }
    }
    
    // Tentar parsear diretamente
    return JSON.parse(clean);
  } catch (e) {
    console.error('❌ Erro ao parsear JSON:', e);
    // Tentar extrair alimentos do texto
    return { foods: extractFoodsFromText(text) };
  }
}

function normalizeDetectedFoods(foods: any[]): Array<{ name: string; grams: number; confidence: number }> {
  if (!Array.isArray(foods)) return [];
  
  return foods
    .filter(f => f && (f.name || f.nome))
    .map(food => ({
      name: String(food.name || food.nome || 'alimento').toLowerCase().trim(),
      grams: Math.max(Number(food.grams || food.gramas || food.quantidade) || 80, 30),
      confidence: Math.min(Math.max(Number(food.confidence || food.confianca) || 0.5, 0.1), 1.0)
    }))
    .filter(f => f.name.length > 1 && f.name !== 'undefined');
}

function estimateCalories(foods: Array<{ name: string; grams: number; confidence: number }>): number {
  // Estimativa simples: média de 2 kcal/g para refeições mistas
  const caloriesPerGram: Record<string, number> = {
    'arroz': 1.3, 'feijão': 0.77, 'carne': 2.5, 'frango': 1.9,
    'peixe': 1.5, 'salada': 0.2, 'vegetais': 0.3, 'legumes': 0.4,
    'pizza': 2.7, 'hambúrguer': 2.5, 'pão': 2.6, 'macarrão': 1.3,
    'bolo': 3.5, 'refrigerante': 0.4, 'suco': 0.45, 'café': 0.02,
    'ovo': 1.5, 'queijo': 3.5, 'batata': 0.9, 'banana': 0.9
  };
  
  let total = 0;
  for (const food of foods) {
    const name = food.name.toLowerCase();
    let cal = 2.0; // default
    
    for (const [key, value] of Object.entries(caloriesPerGram)) {
      if (name.includes(key)) {
        cal = value;
        break;
      }
    }
    
    total += food.grams * cal;
  }
  
  return Math.round(total);
}

function createFallbackAnalysis() {
  console.log('🔄 Criando análise de fallback...');
  
  return {
    foods: [
      { name: 'refeição mista', grams: 200, confidence: 0.3 }
    ],
    total_calories: 400,
    attempt_used: MAX_RETRIES,
    detection_method: 'fallback',
    success: false
  };
}

function extractFoodsFromText(text: string): Array<{ name: string; grams: number; confidence: number }> {
  const commonFoods = [
    'arroz', 'feijão', 'carne', 'frango', 'peixe', 'ovo', 'salada',
    'batata', 'macarrão', 'pão', 'pizza', 'hambúrguer', 'bolo', 'torta',
    'coxinha', 'pastel', 'empada', 'suco', 'café', 'leite', 'queijo',
    'tomate', 'alface', 'cenoura', 'banana', 'maçã', 'laranja',
    'refrigerante', 'água', 'legumes', 'vegetais'
  ];
  
  const portions: Record<string, number> = {
    'arroz': 150, 'feijão': 100, 'carne': 150, 'frango': 150,
    'pizza': 150, 'hambúrguer': 200, 'bolo': 100, 'pão': 50,
    'suco': 250, 'café': 100, 'salada': 80
  };
  
  const detected: Array<{ name: string; grams: number; confidence: number }> = [];
  const lowerText = text.toLowerCase();
  
  for (const food of commonFoods) {
    if (lowerText.includes(food)) {
      detected.push({
        name: food,
        grams: portions[food] || 100,
        confidence: 0.4
      });
    }
  }
  
  return detected.length > 0 ? detected : [{ name: 'refeição', grams: 200, confidence: 0.2 }];
}

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  console.log('📥 Baixando imagem para análise...');
  
  try {
    // Adicionar headers para evitar bloqueios
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NutritionBot/1.0)',
        'Accept': 'image/*',
        'Referer': imageUrl
      }
    });
    
    if (!response.ok) {
      console.error(`❌ Erro HTTP ${response.status} ao baixar imagem`);
      throw new Error(`HTTP ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('image')) {
      console.error(`❌ Tipo de conteúdo inválido: ${contentType}`);
      throw new Error(`Tipo inválido: ${contentType}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    if (uint8Array.length < 1000) {
      throw new Error('Imagem muito pequena ou inválida');
    }
    
    // Converter para base64 em chunks
    let binary = '';
    const chunkSize = 32768;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode(...chunk);
    }
    
    const base64 = btoa(binary);
    console.log(`✅ Imagem convertida: ${Math.round(base64.length / 1024)}KB`);
    
    return base64;
  } catch (error) {
    console.error('❌ Erro ao converter imagem:', error);
    throw error;
  }
}
