import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/utils/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // 🔥 ACEITAR TANTO imageUrl QUANTO imageBase64
    const imageUrl = body.imageUrl;
    const imageBase64 = body.imageBase64;
    
    // Determinar qual usar (prioriza base64 para evitar timeout)
    let imageSource: string;
    if (imageBase64) {
      // Se é base64, formatar como data URL se necessário
      imageSource = imageBase64.startsWith("data:") 
        ? imageBase64 
        : `data:image/jpeg;base64,${imageBase64}`;
      console.log("[Detect Image Type] Usando base64 (mais robusto)");
    } else if (imageUrl) {
      imageSource = imageUrl;
      console.log("[Detect Image Type] Usando URL:", imageUrl.slice(0, 100));
    } else {
      return new Response(
        JSON.stringify({ error: "imageUrl ou imageBase64 é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error("[Detect Image Type] OPENAI_API_KEY não configurada");
      return new Response(
        JSON.stringify({ type: "OTHER", confidence: 0, details: "API key não configurada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[Detect Image Type] Analisando imagem...");

    // Chamar GPT-4o Vision para classificar a imagem
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Modelo mais barato para classificação
        messages: [
          {
            role: "system",
            content: `Você é um classificador de imagens preciso. Sua única função é analisar imagens e classificá-las em uma das três categorias.

CATEGORIAS:
1. FOOD - Fotos de comida, refeições, alimentos, pratos de comida, ingredientes culinários, bebidas, frutas, verduras
2. MEDICAL - Exames médicos, resultados de laboratório, laudos, receitas médicas, documentos de saúde, hemogramas, exames de sangue, raio-x, ultrassom, qualquer documento com valores de referência médicos
3. OTHER - Qualquer outra coisa (selfies, paisagens, documentos não médicos, objetos, animais, etc)

REGRAS CRÍTICAS:
- Se a imagem contém texto com valores numéricos + "valores de referência" ou "resultado" = MEDICAL
- Se a imagem mostra um prato, comida, alimentos = FOOD
- Se contém termos como "hemoglobina", "leucócitos", "glicose", "colesterol" = MEDICAL
- Se é uma foto de pessoa, lugar, objeto = OTHER
- Em caso de dúvida entre FOOD e MEDICAL, prefira MEDICAL (é mais crítico não errar exames)

Responda APENAS com JSON válido no formato:
{"type": "FOOD" | "MEDICAL" | "OTHER", "confidence": 0.0-1.0, "details": "breve descrição do que viu"}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Classifique esta imagem. Responda APENAS com o JSON."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageSource,
                  detail: "high" // 🔥 Usar HIGH para detectar documentos/exames com precisão
                }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.1, // Baixa temperatura para consistência
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Detect Image Type] Erro OpenAI:", response.status, errorText);
      
      // Fallback: retornar OTHER em caso de erro
      return new Response(
        JSON.stringify({ type: "OTHER", confidence: 0.5, details: "Erro na análise, assumindo OTHER" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("[Detect Image Type] Resposta GPT-4o:", content);

    // Tentar parsear JSON da resposta
    let result = { type: "OTHER", confidence: 0.5, details: "Não foi possível classificar" };
    
    try {
      // Limpar resposta (remover markdown se houver)
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      const parsed = JSON.parse(cleanContent);
      
      // Validar tipo
      const validTypes = ["FOOD", "MEDICAL", "OTHER"];
      if (validTypes.includes(parsed.type?.toUpperCase())) {
        result = {
          type: parsed.type.toUpperCase(),
          confidence: Number(parsed.confidence) || 0.8,
          details: parsed.details || "Classificado com sucesso",
        };
      }
    } catch (parseError) {
      console.error("[Detect Image Type] Erro ao parsear JSON:", parseError);
      
      // Tentar extrair tipo do texto
      const upperContent = content.toUpperCase();
      if (upperContent.includes("FOOD")) {
        result = { type: "FOOD", confidence: 0.7, details: "Detectado como comida" };
      } else if (upperContent.includes("MEDICAL")) {
        result = { type: "MEDICAL", confidence: 0.7, details: "Detectado como exame médico" };
      }
    }

    console.log("[Detect Image Type] Resultado final:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Detect Image Type] Erro:", error);
    return new Response(
      JSON.stringify({ 
        type: "OTHER", 
        confidence: 0, 
        details: error instanceof Error ? error.message : "Erro desconhecido" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
