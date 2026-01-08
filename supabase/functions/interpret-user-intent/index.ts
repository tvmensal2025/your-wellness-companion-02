import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntentResult {
  intent: string;
  confidence: number;
  details: {
    action?: string;
    foodIndex?: number;
    newFood?: { name: string; grams: number };
    foodsDescribed?: string[];
    questionType?: string;
  };
  originalText: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, context, pendingFoods } = await req.json();
    
    console.log("[interpret-user-intent] Entrada:", { text, context, pendingFoodsCount: pendingFoods?.length });
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ 
        intent: "unknown", 
        confidence: 0,
        details: {},
        originalText: text || ""
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Usar Lovable AI (já configurado, sem necessidade de API key do usuário)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("[interpret-user-intent] LOVABLE_API_KEY não configurada, usando fallback");
      return new Response(JSON.stringify(fallbackInterpretation(text)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const pendingFoodsContext = pendingFoods && Array.isArray(pendingFoods) && pendingFoods.length > 0
      ? `\n\nALIMENTOS PENDENTES DE CONFIRMAÇÃO:\n${pendingFoods.map((f: any, i: number) => 
          `${i + 1}. ${f.nome || f.name || 'alimento'} (${f.quantidade || f.grams || '?'}g)`
        ).join('\n')}`
      : "";

    const systemPrompt = `Você é um interpretador de intenções para um app de nutrição brasileiro.
Analise a mensagem do usuário e identifique a intenção.

CONTEXTO ATUAL: ${context || "chat livre"}${pendingFoodsContext}

INTENÇÕES POSSÍVEIS:
- confirm: usuário quer confirmar (sim, ok, beleza, pode, manda, tá certo, confirmo, isso aí, perfeito, exato, certo, fechou, bora, vamos, pode salvar, salva, registra, correto, isso mesmo, é isso, esse mesmo, tá ótimo, tá bom, show, massa, legal, pode ser, tudo certo)
- cancel: usuário quer cancelar (não, cancela, errado, esquece, deixa pra lá, não quero, para, anula, não era isso)
- edit: usuário quer entrar no modo edição genérico (editar, corrigir, mudar, ajustar, quero mudar)
- add_food: adicionar alimento específico (adiciona X, faltou Y, coloca mais Z, também comi W, esqueceu de colocar, põe também)
- remove_food: remover alimento específico (tira o X, remove o Y, sem o Z, não comi X, não tinha, remove isso)
- replace_food: substituir alimento (troca X por Y, não era X era Y, na verdade era Z, era X não Y, muda de X para Y)
- describe_meal: usuário está descrevendo uma refeição nova (comi arroz e feijão, almocei frango com salada)
- question: usuário está fazendo uma pergunta sobre nutrição/saúde
- greeting: saudação simples (oi, olá, bom dia, boa tarde, boa noite, e aí)
- unknown: não foi possível identificar

REGRAS:
1. Para add_food: extraia nome do alimento e gramas se mencionado
2. Para remove_food: identifique qual alimento (por nome ou número) remover
3. Para replace_food: identifique qual alimento substituir e qual é o novo
4. Se houver alimentos pendentes e usuário mencionar número, relacione ao índice
5. Priorize interpretações mais específicas (add_food > edit)
6. "também comi X" = add_food, não describe_meal
7. Se já há alimentos pendentes e usuário só fala algo simples como "beleza", é confirm

Responda APENAS com JSON válido no formato:
{
  "intent": "...",
  "confidence": 0.0-1.0,
  "details": { 
    "action": "add|remove|replace",
    "foodIndex": número (se aplicável),
    "newFood": { "name": "...", "grams": número },
    "foodsDescribed": ["alimento1", "alimento2"]
  },
  "originalText": "..."
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.1, // Baixa para respostas consistentes
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[interpret-user-intent] Erro da API:", response.status, errorText);
      
      // Rate limit ou pagamento
      if (response.status === 429) {
        console.warn("[interpret-user-intent] Rate limit, usando fallback");
      } else if (response.status === 402) {
        console.warn("[interpret-user-intent] Créditos insuficientes, usando fallback");
      }
      
      return new Response(JSON.stringify(fallbackInterpretation(text)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("[interpret-user-intent] Resposta da IA:", content);
    
    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as IntentResult;
        parsed.originalText = text;
        
        console.log("[interpret-user-intent] Intenção identificada:", parsed.intent, "confiança:", parsed.confidence);
        
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (parseError) {
        console.error("[interpret-user-intent] Erro ao parsear JSON:", parseError);
      }
    }

    // Se não conseguiu parsear, usar fallback
    console.warn("[interpret-user-intent] Não foi possível parsear resposta, usando fallback");
    return new Response(JSON.stringify(fallbackInterpretation(text)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[interpret-user-intent] Erro:", error);
    return new Response(JSON.stringify({ 
      intent: "unknown", 
      confidence: 0,
      details: {},
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

// Fallback para quando a IA falhar - usa regras simples
function fallbackInterpretation(text: string): IntentResult {
  const lower = text.toLowerCase().trim();
  
  // Confirmações positivas
  const positivePatterns = [
    "sim", "s", "yes", "y", "ok", "1", "✅", "confirmo", "confirma", "certo", "isso",
    "beleza", "pode", "manda", "tá certo", "perfeito", "exato", "fechou", "bora",
    "vamos", "pode salvar", "salva", "registra", "correto", "isso mesmo", "é isso",
    "show", "massa", "legal", "pode ser", "tudo certo", "tá bom", "tá ótimo"
  ];
  if (positivePatterns.some(p => lower === p || lower.includes(p))) {
    return { intent: "confirm", confidence: 0.85, details: {}, originalText: text };
  }
  
  // Cancelamento
  const negativePatterns = [
    "não", "nao", "n", "no", "2", "❌", "errado", "incorreto", "0", "cancelar",
    "cancela", "esquece", "deixa pra lá", "não quero", "para", "anula"
  ];
  if (negativePatterns.some(p => lower === p || lower.includes(p))) {
    return { intent: "cancel", confidence: 0.85, details: {}, originalText: text };
  }
  
  // Edição genérica
  const editPatterns = ["editar", "edit", "3", "✏️", "corrigir", "mudar", "alterar", "edita", "ajustar"];
  if (editPatterns.some(p => lower === p || lower.includes(p))) {
    return { intent: "edit", confidence: 0.85, details: {}, originalText: text };
  }
  
  // Adicionar alimento
  const addMatch = lower.match(/(?:adiciona|incluir|acrescenta|faltou|também\s+comi|coloca\s+mais|põe\s+também|add)\s+(.+)/i);
  if (addMatch) {
    const foodPart = addMatch[1].trim();
    const gramsMatch = foodPart.match(/(\d+)\s*g?$/);
    const grams = gramsMatch ? parseInt(gramsMatch[1]) : 100;
    const name = foodPart.replace(/\d+\s*g?$/, '').trim() || foodPart;
    return { 
      intent: "add_food", 
      confidence: 0.8, 
      details: { action: "add", newFood: { name, grams } },
      originalText: text 
    };
  }
  
  // Remover alimento
  const removeMatch = lower.match(/(?:tira|remove|sem|não\s+comi|não\s+tinha)\s+(?:o\s+)?(.+)/i);
  if (removeMatch) {
    const foodPart = removeMatch[1].trim();
    const indexMatch = foodPart.match(/^(\d+)$/);
    if (indexMatch) {
      return { 
        intent: "remove_food", 
        confidence: 0.8, 
        details: { action: "remove", foodIndex: parseInt(indexMatch[1]) - 1 },
        originalText: text 
      };
    }
    return { 
      intent: "remove_food", 
      confidence: 0.75, 
      details: { action: "remove", newFood: { name: foodPart, grams: 0 } },
      originalText: text 
    };
  }
  
  // Substituir alimento
  const replaceMatch = lower.match(/(?:troca|substitui|muda|na\s+verdade\s+era|não\s+era\s+.+\s+era)\s+(.+)/i);
  if (replaceMatch) {
    const parts = replaceMatch[1].split(/\s+(?:por|para|era)\s+/);
    if (parts.length >= 2) {
      const gramsMatch = parts[1].match(/(\d+)\s*g?$/);
      const grams = gramsMatch ? parseInt(gramsMatch[1]) : 100;
      const name = parts[1].replace(/\d+\s*g?$/, '').trim();
      return { 
        intent: "replace_food", 
        confidence: 0.75, 
        details: { action: "replace", newFood: { name, grams } },
        originalText: text 
      };
    }
  }
  
  // Saudação
  const greetingPatterns = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "e aí", "eae", "opa"];
  if (greetingPatterns.some(p => lower === p || lower.startsWith(p + " ") || lower.startsWith(p + "!"))) {
    return { intent: "greeting", confidence: 0.9, details: {}, originalText: text };
  }
  
  // Descrição de refeição (palavras-chave de comida)
  const foodKeywords = ["comi", "almocei", "jantei", "tomei", "bebi", "café da manhã", "almoço", "jantar", "lanche"];
  if (foodKeywords.some(k => lower.includes(k))) {
    return { intent: "describe_meal", confidence: 0.7, details: {}, originalText: text };
  }
  
  // Pergunta
  if (lower.includes("?") || lower.startsWith("como") || lower.startsWith("qual") || lower.startsWith("quanto") || lower.startsWith("o que")) {
    return { intent: "question", confidence: 0.7, details: {}, originalText: text };
  }
  
  return { intent: "unknown", confidence: 0, details: {}, originalText: text };
}
