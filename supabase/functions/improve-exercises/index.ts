import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/utils/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { batchSize = 5 } = await req.json().catch(() => ({}));

    // Buscar APENAS exercícios SEM tips (que ainda não foram melhorados)
    const { data: exercises, error: fetchError } = await supabase
      .from("exercises_library")
      .select("id, name, description, instructions, muscle_group, difficulty, sets, reps, rest_time, tips, equipment_needed, location")
      .or("tips.is.null,tips.eq.[]")
      .order("name")
      .limit(batchSize);

    if (fetchError) throw fetchError;
    
    // Contar quantos ainda faltam
    const { count: remaining } = await supabase
      .from("exercises_library")
      .select("*", { count: "exact", head: true })
      .or("tips.is.null,tips.eq.[]");

    if (!exercises || exercises.length === 0) {
      return new Response(JSON.stringify({ 
        message: "Todos os 285 exercícios foram melhorados!", 
        completed: true,
        remaining: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const improvedExercises = [];

    for (const exercise of exercises) {
      const prompt = `Você é um personal trainer especialista. Melhore este exercício para iniciantes que NÃO sabem treinar.

EXERCÍCIO ATUAL:
- Nome: ${exercise.name}
- Descrição: ${exercise.description || "Sem descrição"}
- Grupo muscular: ${exercise.muscle_group}
- Dificuldade: ${exercise.difficulty}
- Séries: ${exercise.sets}
- Repetições: ${exercise.reps}
- Descanso: ${exercise.rest_time}
- Local: ${exercise.location || "academia"}
- Equipamento: ${JSON.stringify(exercise.equipment_needed || [])}
- Instruções atuais: ${JSON.stringify(exercise.instructions || [])}

RETORNE um JSON válido com EXATAMENTE esta estrutura:
{
  "description": "Descrição completa de 2-3 frases explicando o que o exercício trabalha, benefícios e para quem é indicado",
  "instructions": [
    "Passo 1 detalhado com posição inicial exata",
    "Passo 2 com movimento principal",
    "Passo 3 com ponto de contração",
    "Passo 4 com retorno controlado",
    "Passo 5 com respiração correta",
    "Passo 6 com dica de segurança"
  ],
  "tips": [
    "⚠️ ERRO COMUM: [descreva o erro mais frequente e como evitar]",
    "💡 DICA PRO: [dica avançada de performance]",
    "🫁 RESPIRAÇÃO: [quando inspirar e expirar durante o movimento]",
    "🎯 FOCO: [onde concentrar a atenção durante a execução]"
  ]
}

IMPORTANTE:
- Instruções devem ter 6-8 passos MUITO DETALHADOS
- Incluir posição dos pés, mãos, costas, olhar
- Explicar a respiração (inspire ao descer, expire ao subir, etc)
- Mencionar erros comuns a evitar
- Usar linguagem simples para iniciantes
- Tips deve ser um ARRAY com 4 dicas usando os emojis indicados`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Você é um personal trainer brasileiro especialista. Responda APENAS com JSON válido, sem markdown." },
              { role: "user", content: prompt }
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          console.error(`AI error for ${exercise.name}:`, response.status);
          continue;
        }

        const aiData = await response.json();
        let content = aiData.choices?.[0]?.message?.content || "";
        
        // Limpar markdown se presente
        content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        
        const improved = JSON.parse(content);

        // Garantir que tips seja array
        let tipsArray = improved.tips;
        if (typeof tipsArray === 'string') {
          tipsArray = [tipsArray];
        }

        // Atualizar no banco
        const { error: updateError } = await supabase
          .from("exercises_library")
          .update({
            description: improved.description,
            instructions: improved.instructions,
            tips: tipsArray,
            updated_at: new Date().toISOString()
          })
          .eq("id", exercise.id);

        if (updateError) {
          console.error(`Update error for ${exercise.name}:`, updateError);
        } else {
          improvedExercises.push({ id: exercise.id, name: exercise.name, success: true });
        }

        // Delay para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (parseError) {
        console.error(`Parse error for ${exercise.name}:`, parseError);
        improvedExercises.push({ id: exercise.id, name: exercise.name, success: false, error: String(parseError) });
      }
    }

    const newRemaining = (remaining || 0) - improvedExercises.filter(e => e.success).length;

    return new Response(JSON.stringify({
      processed: improvedExercises.length,
      improved: improvedExercises,
      remaining: Math.max(0, newRemaining),
      completed: newRemaining <= 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});