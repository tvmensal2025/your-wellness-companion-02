import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { UserInfo } from "../services/user-service.ts";
import { sendWhatsApp, sendWhatsAppWithFallback } from "../utils/whatsapp-sender.ts";
import { 
  sendInteractiveMessage, 
  sendTextMessage,
  sendFoodAnalysisConfirmation,
} from "../utils/whatsapp-interactive-sender.ts";
import { detectMealType, formatMealType } from "../utils/message-utils.ts";
import {
  saveToFoodHistory,
  updateFoodHistoryConfirmation,
} from "../services/pending-service.ts";
import { getDailyTotal } from "../services/user-service.ts";
import { withCache, generateTextHash, getCachedResponse, setCachedResponse } from "../services/cache-service.ts";
import { tryOllamaForSimpleMessage, isSimpleMessage, logOllamaSaving } from "../utils/ollama-helper.ts";

// 🚀 RESPOSTAS FAQ INSTANTÂNEAS - Resposta em <100ms para mensagens comuns
const INSTANT_FAQ_RESPONSES: Record<string, string> = {
  // Saudações
  'oi': '👋 Olá! Como posso ajudar?\n\n📸 Envie foto de refeição ou exame\n✍️ Ou me conta o que comeu\n\n_Sofia 💚_',
  'olá': '👋 Olá! Como posso ajudar?\n\n📸 Envie foto de refeição ou exame\n✍️ Ou me conta o que comeu\n\n_Sofia 💚_',
  'ola': '👋 Olá! Como posso ajudar?\n\n📸 Envie foto de refeição ou exame\n✍️ Ou me conta o que comeu\n\n_Sofia 💚_',
  'bom dia': '☀️ Bom dia! Pronta para te ajudar hoje!\n\n📸 Foto de refeição\n🩺 Foto de exame\n✍️ Ou me conta o que comeu\n\n_Sofia 💚_',
  'boa tarde': '🌤️ Boa tarde! Como posso ajudar?\n\n📸 Foto de refeição\n🩺 Foto de exame\n✍️ Ou me conta o que comeu\n\n_Sofia 💚_',
  'boa noite': '🌙 Boa noite! Estou aqui para ajudar!\n\n📸 Foto de refeição\n🩺 Foto de exame\n✍️ Ou me conta o que comeu\n\n_Sofia 💚_',
  'e aí': '👋 E aí! Tudo certo? Como posso ajudar?\n\n📸 Foto de refeição ou exame\n✍️ Ou descreva o que comeu\n\n_Sofia 💚_',
  'eae': '👋 E aí! Tudo certo? Como posso ajudar?\n\n📸 Foto de refeição ou exame\n✍️ Ou descreva o que comeu\n\n_Sofia 💚_',
  'hey': '👋 Hey! Como posso ajudar?\n\n📸 Foto de refeição ou exame\n✍️ Ou descreva o que comeu\n\n_Sofia 💚_',
  
  // Ajuda
  'ajuda': '📋 *O que posso fazer por você:*\n\n📸 *Foto de comida* → Analiso calorias e nutrientes\n🩺 *Foto de exame* → Interpreto resultados\n💧 *"Bebi 500ml de água"* → Registro hidratação\n⚖️ *"Peso 75kg"* → Registro peso\n✍️ *"Comi arroz e frango"* → Registro refeição\n\n_Sofia 💚_',
  'help': '📋 *O que posso fazer por você:*\n\n📸 *Foto de comida* → Analiso calorias e nutrientes\n🩺 *Foto de exame* → Interpreto resultados\n💧 *"Bebi 500ml de água"* → Registro hidratação\n⚖️ *"Peso 75kg"* → Registro peso\n✍️ *"Comi arroz e frango"* → Registro refeição\n\n_Sofia 💚_',
  '?': '📋 *O que posso fazer por você:*\n\n📸 *Foto de comida* → Analiso calorias e nutrientes\n🩺 *Foto de exame* → Interpreto resultados\n💧 *"Bebi água"* → Registro hidratação\n⚖️ *"Peso Xkg"* → Registro peso\n\n_Sofia 💚_',
  'como funciona': '📋 *Como funciona:*\n\n1️⃣ Envie foto da sua refeição\n2️⃣ Eu identifico os alimentos\n3️⃣ Você confirma ou corrige\n4️⃣ Registro automaticamente!\n\nTambém analiso exames médicos! 🩺\n\n_Sofia 💚_',
  
  // Agradecimentos
  'obrigado': '😊 De nada! Estou sempre aqui para ajudar!\n\n_Sofia 💚_',
  'obrigada': '😊 De nada! Estou sempre aqui para ajudar!\n\n_Sofia 💚_',
  'valeu': '😊 Por nada! Qualquer coisa é só chamar!\n\n_Sofia 💚_',
  'brigado': '😊 De nada! Estou sempre aqui!\n\n_Sofia 💚_',
  'brigada': '😊 De nada! Estou sempre aqui!\n\n_Sofia 💚_',
  'thanks': '😊 You\'re welcome! I\'m always here to help!\n\n_Sofia 💚_',
  
  // Confirmações órfãs
  'ok': '👍 Ok! Envie uma foto ou me conte o que comeu!\n\n_Sofia 💚_',
  'tá': '👍 Ok! Envie uma foto ou me conte o que comeu!\n\n_Sofia 💚_',
  'beleza': '👍 Beleza! O que você quer fazer agora?\n\n📸 Foto de refeição\n✍️ Descrever o que comeu\n\n_Sofia 💚_',
};

/**
 * 🚀 Verifica se é uma mensagem FAQ e retorna resposta instantânea
 * Retorna null se não for FAQ
 */
export function getInstantFAQResponse(text: string): string | null {
  const normalized = text.toLowerCase().trim()
    .replace(/[!.,?]/g, '') // Remove pontuação
    .replace(/\s+/g, ' '); // Normaliza espaços
  
  // Check exact match first
  if (INSTANT_FAQ_RESPONSES[normalized]) {
    return INSTANT_FAQ_RESPONSES[normalized];
  }
  
  // Check if starts with greeting
  const greetingPrefixes = ['oi ', 'olá ', 'ola ', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'eae', 'hey '];
  for (const prefix of greetingPrefixes) {
    if (normalized.startsWith(prefix) || normalized === prefix.trim()) {
      return INSTANT_FAQ_RESPONSES[prefix.trim()] || INSTANT_FAQ_RESPONSES['oi'];
    }
  }
  
  return null;
}

// Fallback responses para quando IA falha
const FALLBACK_RESPONSES = {
  technical_error: (name: string) =>
    `Oi ${name}! 👋 Tive um probleminha técnico, mas estou aqui!\n\n` +
    `Como posso te ajudar?\n\n` +
    `📸 *Foto de refeição* → analiso calorias\n` +
    `🩺 *Foto de exame* → analiso resultados\n` +
    `💬 *Me conta o que comeu* → registro pra você\n\n` +
    `_Sofia 💚_`,
  
  generic_help: () =>
    `Oi! 👋 Estou aqui para ajudar com sua nutrição!\n\n` +
    `📸 Envie uma foto da refeição\n` +
    `✍️ Ou descreva o que comeu\n\n` +
    `_Sofia 🥗_`,
  
  rate_limited: (name: string) =>
    `${name}, estou um pouquinho ocupada! 😅\n\n` +
    `Me manda de novo em 1 minutinho? 🙏\n\n` +
    `_Sofia 💚_`,
};

/**
 * Handle AI-powered smart response com fallback robusto
 */
export async function handleSmartResponse(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  text: string
): Promise<void> {
  const userName = user.full_name?.split(' ')[0] || 'Querido(a)';
  
  try {
    console.log("[SmartResponse] Chamando IA inteligente...");

    // Check if this is first message today
    const today = new Date().toISOString().split("T")[0];
    const { data: todayMessages } = await supabase
      .from("whatsapp_message_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("message_type", "outbound")
      .gte("sent_at", today)
      .limit(1);

    const isFirstMessageToday = !todayMessages || todayMessages.length === 0;

    // Timeout para a chamada de IA
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const { data: aiResponse, error } = await supabase.functions.invoke(
      "whatsapp-ai-assistant",
      {
        body: {
          userId: user.id,
          message: text,
          conversationHistory: [],
          isFirstMessage: isFirstMessageToday,
        },
      }
    );
    
    clearTimeout(timeoutId);

    if (error) {
      console.error("[SmartResponse] Erro na IA:", error);
      
      // Detectar tipo de erro para fallback apropriado
      const errorMsg = error.message || '';
      if (errorMsg.includes('429') || errorMsg.includes('rate')) {
        await sendTextMessage(phone, FALLBACK_RESPONSES.rate_limited(userName));
      } else {
        await sendInteractiveMessage(phone, {
          headerText: '👋 Oi!',
          bodyText: `${userName}, tive um probleminha técnico, mas estou aqui!\n\nComo posso te ajudar?`,
          footerText: 'Sofia 💚',
          buttons: [
            { id: 'sofia_new_photo', title: '📸 Analisar Foto' },
            { id: 'sofia_meal_plan', title: '🍽️ Cardápio' },
            { id: 'help', title: '❓ Ajuda' },
          ],
        });
      }
      return;
    }

    const responseText = aiResponse?.response || "Estou aqui para ajudar! 💚";

    // Avoid duplicate signature
    const hasSignature =
      responseText.includes("_Sofia") || responseText.includes("_Dr. Vital");
    const personality = aiResponse?.personality || "sofia";
    const signature = hasSignature
      ? ""
      : personality === "drvital"
      ? "\n\n_Dr. Vital 🩺_"
      : "\n\n_Sofia 🥗_";

    await sendTextMessage(phone, responseText + signature);

    console.log("[SmartResponse] Resposta IA enviada:", responseText.slice(0, 100));
  } catch (error) {
    const err = error as Error;
    console.error("[SmartResponse] Erro na resposta inteligente:", err.message);
    
    // Fallback determinístico com botões
    await sendInteractiveMessage(phone, {
      headerText: '👋 Oi!',
      bodyText: 'Estou aqui para ajudar com sua nutrição!',
      footerText: 'Sofia 🥗',
      buttons: [
        { id: 'sofia_new_photo', title: '📸 Enviar Foto' },
        { id: 'sofia_meal_plan', title: '🍽️ Cardápio' },
        { id: 'help', title: '❓ Ajuda' },
      ],
    });
  }
}

/**
 * Handle smart response with pending nutrition reminder
 */
export async function handleSmartResponseWithPending(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  text: string,
  pendingFoods: any[]
): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data: todayMessages } = await supabase
      .from("whatsapp_message_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("message_type", "outbound")
      .gte("sent_at", today)
      .limit(1);

    const isFirstMessageToday = !todayMessages || todayMessages.length === 0;

    const { data: aiResponse } = await supabase.functions.invoke(
      "whatsapp-ai-assistant",
      {
        body: {
          userId: user.id,
          message: text,
          conversationHistory: [],
          isFirstMessage: isFirstMessageToday,
        },
      }
    );

    let responseText = aiResponse?.response || "Estou aqui para ajudar! 💚";

    // Remove existing signature to add consolidated one
    responseText = responseText
      .replace(/\n*_Sofia 🥗_\s*$/g, "")
      .replace(/\n*_Dr\. Vital 🩺_\s*$/g, "");

    const foodsList = pendingFoods
      .slice(0, 4)
      .map((f: any) => f.nome || f.name)
      .join(", ");
    
    if (pendingFoods.length > 0) {
      // Send AI response first
      await sendTextMessage(phone, responseText);
      
      // Then send interactive buttons for pending
      await sendInteractiveMessage(phone, {
        headerText: '⚠️ Pendência ativa',
        bodyText: `📋 ${foodsList}${pendingFoods.length > 4 ? '...' : ''}\n\n*O que deseja fazer?*`,
        footerText: 'Sofia 🥗',
        buttons: [
          { id: 'sofia_confirm', title: '✅ Confirmar' },
          { id: 'sofia_edit', title: '✏️ Corrigir' },
          { id: 'sofia_cancel', title: '❌ Cancelar' },
        ],
      });
    } else {
      await sendTextMessage(phone, responseText + "\n\n_Sofia 🥗_");
    }

    console.log("[SmartResponse] Resposta IA com pendência enviada");
  } catch (error) {
    console.error("[SmartResponse] Erro na resposta com pendência:", error);
    await handleSmartResponse(supabase, user, phone, text);
  }
}

/**
 * Process text message for food analysis
 */
/**
 * Main handler for text messages
 */
export async function handleTextMessage(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  text: string
): Promise<void> {
  try {
    // 🚀 OTIMIZAÇÃO 1: Verificar FAQ instantâneo primeiro (<100ms)
    const instantResponse = getInstantFAQResponse(text);
    if (instantResponse) {
      console.log("[TextHandler] FAQ instantâneo detectado:", text.slice(0, 20));
      await sendTextMessage(phone, instantResponse);
      return;
    }
    
    // 🦙 OTIMIZAÇÃO 2: Tentar Ollama para mensagens simples (GRÁTIS!)
    if (isSimpleMessage(text)) {
      console.log("[TextHandler] 🦙 Mensagem simples detectada, tentando Ollama...");
      const ollamaResult = await tryOllamaForSimpleMessage(text, user);
      if (ollamaResult) {
        console.log("[TextHandler] ✅ Ollama respondeu (GRÁTIS!)");
        logOllamaSaving(user.id);
        await sendTextMessage(phone, ollamaResult.response);
        return;
      }
      console.log("[TextHandler] Ollama indisponível, continuando fluxo normal...");
    }
    
    // Try to analyze as food first
    const wasFood = await processTextForFood(supabase, user, phone, text);
    if (!wasFood) {
      // Fall back to smart response
      await handleSmartResponse(supabase, user, phone, text);
    }
  } catch (error) {
    console.error("[TextHandler] Erro:", error);
    await handleSmartResponse(supabase, user, phone, text);
  }
}

/**
 * Process text message for food analysis
 */
async function processTextForFood(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  text: string
): Promise<boolean> {
  try {
    let analysis: any = null;
    
    // Tentar sofia-text-analysis primeiro
    try {
      const { data, error } = await supabase.functions.invoke(
        "sofia-text-analysis",
        {
          body: {
            text,
            userId: user.id,
            contextType: "meal_log",
          },
        }
      );
      
      if (!error && data) {
        analysis = data;
        console.log("[TextHandler] sofia-text-analysis OK:", data.detected_foods?.length || 0, "alimentos");
      }
    } catch (sofiaError) {
      console.log("[TextHandler] sofia-text-analysis falhou, tentando fallback...");
    }

    // Fallback: usar whatsapp-ai-assistant se sofia falhar
    if (!analysis || !analysis.detected_foods?.length) {
      console.log("[TextHandler] Usando fallback whatsapp-ai-assistant");
      return false; // Deixa o handleSmartResponse cuidar
    }

    const foods = analysis.detected_foods || analysis.foods || [];
    if (foods.length === 0) {
      return false;
    }

    const totalCalories =
      analysis.nutrition_data?.total_kcal || analysis.total_kcal || 0;
    const mealType = detectMealType();

    // Save to food history immediately
    const foodHistoryId = await saveToFoodHistory(
      supabase,
      user.id,
      mealType,
      null, // no photo
      foods,
      { total_kcal: totalCalories },
      JSON.stringify(analysis).slice(0, 5000),
      false,
      "whatsapp_text"
    );

    console.log("[TextHandler] Refeição (texto) salva IMEDIATAMENTE:", foodHistoryId);

    // Send interactive buttons for food confirmation
    await sendFoodAnalysisConfirmation(phone, foods, totalCalories);

    // Clear old pendings
    await supabase
      .from("whatsapp_pending_nutrition")
      .delete()
      .eq("user_id", user.id)
      .eq("waiting_confirmation", true);

    // Create new pending
    await supabase.from("whatsapp_pending_nutrition").insert({
      user_id: user.id,
      phone: phone,
      meal_type: mealType,
      analysis_result: { detectedFoods: foods, totalCalories, food_history_id: foodHistoryId },
      waiting_confirmation: true,
      waiting_edit: false,
      confirmed: null,
      is_processed: false,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

    return true;
  } catch (error) {
    console.error("[TextHandler] Erro ao processar texto:", error);
    return false;
  }
}
