import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface GenerateMealPlanRequest {
  userId?: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  dias: number;
  objetivo?: string;
  restricoes?: string[];
  preferencias?: string[];
  observacoes?: string;
  refeicoes_selecionadas?: string[];
  distribuicao_calorias?: { [key: string]: number };
}

function clampDays(dias: number): number {
  if (!Number.isFinite(dias)) return 7;
  return Math.min(30, Math.max(1, Math.round(dias)));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GenerateMealPlanRequest;

    const dias = clampDays(body.dias);
    const totalKcal = Number(body.calorias) || 2000;
    const totalProt = Number(body.proteinas) || 120;
    const totalCarb = Number(body.carboidratos) || 220;
    const totalFat = Number(body.gorduras) || 60;

    const refeicoes = body.refeicoes_selecionadas?.length
      ? body.refeicoes_selecionadas
      : ["café da manhã", "almoço", "lanche", "jantar"];

    const defaultDistrib: Record<string, number> = {
      "café da manhã": 0.25,
      "almoço": 0.35,
      "lanche": 0.15,
      "jantar": 0.20,
      "ceia": 0.05,
    };

    const distrib = body.distribuicao_calorias ?? defaultDistrib;

    const cardapio: Record<string, any> = {};

    for (let i = 1; i <= dias; i++) {
      const diaKey = `dia${i}`;

      const diaData: any = {
        totais_do_dia: {
          calorias: totalKcal,
          proteinas: totalProt,
          carboidratos: totalCarb,
          gorduras: totalFat,
          fibras: 25,
        },
      };

      const addMeal = (key: keyof typeof diaData, nome: string, baseFoods: string[]) => {
        const weight = distrib[nome.toLowerCase()] ?? defaultDistrib[nome.toLowerCase()] ?? 0.25;
        const kcal = Math.round(totalKcal * weight);
        const prot = Math.round(totalProt * weight * 100) / 100;
        const carb = Math.round(totalCarb * weight * 100) / 100;
        const fat = Math.round(totalFat * weight * 100) / 100;

        diaData[key] = {
          nome,
          description: nome,
          preparo: "Preparar os alimentos de forma simples, preferindo grelhados, cozidos ou assados.",
          preparo_detalhado:
            "1. Separe todos os ingredientes.\n2. Prepare os alimentos com pouco óleo.\n3. Tempere com sal moderado e ervas naturais.\n4. Monte o prato priorizando metade com vegetais.",
          instrucoes_completas:
            "Siga o modo de preparo básico, ajustando quantidades conforme sua fome e saciedade.",
          ingredientes: baseFoods.map((f) => ({ nome: f })),
          totais: {
            calorias: kcal,
            proteinas: prot,
            carboidratos: carb,
            gorduras: fat,
            fibras: 3,
          },
          dica_nutricional:
            "Mastigue devagar, priorize alimentos in natura e beba água ao longo do dia.",
        };
      };

      if (refeicoes.includes("café da manhã")) {
        addMeal("cafe_manha", "Café da Manhã", ["Fruta", "Aveia", "Iogurte ou ovo"]);
      }
      if (refeicoes.includes("almoço")) {
        addMeal("almoco", "Almoço", ["Arroz ou tubérculo", "Feijão ou leguminosa", "Proteína magra", "Legumes"]);
      }
      if (refeicoes.includes("lanche")) {
        addMeal("cafe_tarde", "Lanche", ["Fruta", "Oleaginosas", "Iogurte ou bebida vegetal"]);
      }
      if (refeicoes.includes("jantar")) {
        addMeal("jantar", "Jantar", ["Proteína magra", "Legumes", "Fonte de carboidrato leve"]);
      }

      cardapio[diaKey] = diaData;
    }

    const response = {
      success: true,
      cardapio: {
        cardapio,
      },
      metadata: {
        fonte: "nutrition-planner-lite",
        objetivo: body.objetivo ?? null,
        dias,
        restricoes: body.restricoes ?? [],
        preferencias: body.preferencias ?? [],
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Erro em generate-meal-plan-taco:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ success: false, metadata: { error: message } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
