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

// 🌟 RESPOSTAS FAQ PREMIUM - Nível Premium com Negrito e Formatação Bonita
const INSTANT_FAQ_RESPONSES: Record<string, string> = {
  // ========== SAUDAÇÕES ==========
  'oi': `👋 *Olá! Bem-vindo ao MaxNutrition!* 💚

*Como posso ajudar você hoje?*

📸 *Foto de Refeição* → Analiso calorias e nutrientes
🩺 *Foto de Exame* → Interpreto resultados
✍️ *Descrever Comida* → Registro automático

_Sofia 💚_`,

  'olá': `👋 *Olá! Bem-vindo ao MaxNutrition!* 💚

*Como posso ajudar você hoje?*

📸 *Foto de Refeição* → Analiso calorias e nutrientes
🩺 *Foto de Exame* → Interpreto resultados
✍️ *Descrever Comida* → Registro automático

_Sofia 💚_`,

  'ola': `👋 *Olá! Bem-vindo ao MaxNutrition!* 💚

*Como posso ajudar você hoje?*

📸 *Foto de Refeição* → Analiso calorias e nutrientes
🩺 *Foto de Exame* → Interpreto resultados
✍️ *Descrever Comida* → Registro automático

_Sofia 💚_`,

  'bom dia': `☀️ *Bom dia! Que dia lindo para cuidar da sua saúde!* 💚

*Estou pronta para te ajudar hoje!*

📸 *Foto de Refeição* → Análise completa
🩺 *Foto de Exame* → Interpretação
💧 *Água* → Registro de hidratação
⚖️ *Peso* → Acompanhamento

_Sofia 💚_`,

  'boa tarde': `🌤️ *Boa tarde! Espero que esteja tendo um ótimo dia!* 💚

*Como posso ajudar você agora?*

📸 *Foto de Refeição* → Análise completa
🩺 *Foto de Exame* → Interpretação
💧 *Água* → Registro de hidratação
⚖️ *Peso* → Acompanhamento

_Sofia 💚_`,

  'boa noite': `🌙 *Boa noite! Que noite tranquila para você!* 💚

*Estou aqui para ajudar com sua saúde!*

📸 *Foto de Refeição* → Análise completa
🩺 *Foto de Exame* → Interpretação
💧 *Água* → Registro de hidratação
⚖️ *Peso* → Acompanhamento

_Sofia 💚_`,

  'e aí': `👋 *E aí! Tudo certo com você?* 💚

*Vamos cuidar da sua saúde juntos!*

📸 *Foto de Refeição* → Análise completa
🩺 *Foto de Exame* → Interpretação
✍️ *Descrever Comida* → Registro automático

_Sofia 💚_`,

  'eae': `👋 *E aí! Tudo certo com você?* 💚

*Vamos cuidar da sua saúde juntos!*

📸 *Foto de Refeição* → Análise completa
🩺 *Foto de Exame* → Interpretação
✍️ *Descrever Comida* → Registro automático

_Sofia 💚_`,

  'hey': `👋 *Hey! Bem-vindo ao MaxNutrition!* 💚

*Como posso ajudar você?*

📸 *Foto de Refeição* → Análise completa
🩺 *Foto de Exame* → Interpretação
✍️ *Descrever Comida* → Registro automático

_Sofia 💚_`,

  // ========== AJUDA ==========
  'ajuda': `📋 *O que posso fazer por você:*

✨ *Análise de Alimentos*
📸 Envie foto da refeição
🔍 Identifico todos os alimentos
📊 Calculo calorias e nutrientes
✅ Você confirma ou corrige

🏥 *Análise de Exames*
🩺 Envie foto do exame
📖 Interpreto os resultados
💡 Dou recomendações
📋 Gero relatório completo

📱 *Outros Registros*
💧 Hidratação (água)
⚖️ Peso corporal
😊 Humor e energia
😴 Qualidade do sono

_Sofia 💚_`,

  'help': `📋 *O que posso fazer por você:*

✨ *Análise de Alimentos*
📸 Envie foto da refeição
🔍 Identifico todos os alimentos
📊 Calculo calorias e nutrientes
✅ Você confirma ou corrige

🏥 *Análise de Exames*
🩺 Envie foto do exame
📖 Interpreto os resultados
💡 Dou recomendações
📋 Gero relatório completo

📱 *Outros Registros*
💧 Hidratação (água)
⚖️ Peso corporal
😊 Humor e energia
😴 Qualidade do sono

_Sofia 💚_`,

  '?': `📋 *O que posso fazer por você:*

✨ *Análise de Alimentos*
📸 Envie foto da refeição
🔍 Identifico todos os alimentos
📊 Calculo calorias e nutrientes

🏥 *Análise de Exames*
🩺 Envie foto do exame
📖 Interpreto os resultados
💡 Dou recomendações

📱 *Outros Registros*
💧 Hidratação (água)
⚖️ Peso corporal

_Sofia 💚_`,

  'como funciona': `📋 *Como funciona o MaxNutrition:*

*Passo 1️⃣ - Envie a Foto*
📸 Tire foto da sua refeição ou exame

*Passo 2️⃣ - Análise Inteligente*
🤖 Sofia analisa com IA avançada
🔍 Identifica todos os alimentos
📊 Calcula nutrientes completos

*Passo 3️⃣ - Confirmação*
✅ Você confirma ou corrige
🎯 Ajusta se necessário

*Passo 4️⃣ - Registro Automático*
💾 Tudo salvo no seu histórico
📈 Acompanhe seu progresso

_Sofia 💚_`,

  // ========== AGRADECIMENTOS ==========
  'obrigado': `😊 *De nada! Fico feliz em ajudar!* 💚

*Estou sempre aqui para você!*

_Sofia 💚_`,

  'obrigada': `😊 *De nada! Fico feliz em ajudar!* 💚

*Estou sempre aqui para você!*

_Sofia 💚_`,

  'valeu': `😊 *Por nada! Qualquer coisa é só chamar!* 💚

*Vamos cuidar da sua saúde juntos!*

_Sofia 💚_`,

  'brigado': `😊 *De nada! Fico feliz em ajudar!* 💚

*Estou sempre aqui para você!*

_Sofia 💚_`,

  'brigada': `😊 *De nada! Fico feliz em ajudar!* 💚

*Estou sempre aqui para você!*

_Sofia 💚_`,

  'thanks': `😊 *You're welcome! Happy to help!* 💚

*I'm always here for you!*

_Sofia 💚_`,

  // ========== CONFIRMAÇÕES ==========
  'ok': `👍 *Perfeito! Vamos começar!* 💚

*O que você gostaria de fazer?*

📸 *Enviar Foto* → Refeição ou Exame
✍️ *Descrever* → Contar o que comeu
💧 *Água* → Registrar hidratação
⚖️ *Peso* → Registrar peso

_Sofia 💚_`,

  'tá': `👍 *Perfeito! Vamos começar!* 💚

*O que você gostaria de fazer?*

📸 *Enviar Foto* → Refeição ou Exame
✍️ *Descrever* → Contar o que comeu
💧 *Água* → Registrar hidratação
⚖️ *Peso* → Registrar peso

_Sofia 💚_`,

  'beleza': `👍 *Beleza! Vamos lá!* 💚

*O que você quer fazer agora?*

📸 *Foto de Refeição* → Análise completa
🩺 *Foto de Exame* → Interpretação
✍️ *Descrever Comida* → Registro rápido

_Sofia 💚_`,

  // ========== BOAS VINDAS ==========
  'bem vindo': `🎉 *Bem-vindo ao MaxNutrition!* 💚

*Fico feliz em conhecer você!*

Sou a *Sofia*, sua assistente de nutrição e saúde! 

*Como posso ajudar você hoje?*

📸 *Foto de Refeição* → Análise de calorias
🩺 *Foto de Exame* → Interpretação de resultados
💧 *Água* → Registro de hidratação
⚖️ *Peso* → Acompanhamento

_Sofia 💚_`,

  'bem vinda': `🎉 *Bem-vinda ao MaxNutrition!* 💚

*Fico feliz em conhecer você!*

Sou a *Sofia*, sua assistente de nutrição e saúde! 

*Como posso ajudar você hoje?*

📸 *Foto de Refeição* → Análise de calorias
🩺 *Foto de Exame* → Interpretação de resultados
💧 *Água* → Registro de hidratação
⚖️ *Peso* → Acompanhamento

_Sofia 💚_`,
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

// 🌟 Fallback responses premium - Nível Premium com Negrito
const FALLBACK_RESPONSES = {
  technical_error: (name: string) =>
    `Oi *${name}*! 👋 💚

Tive um pequeno probleminha técnico, mas já estou resolvendo!

*Como posso te ajudar?*

📸 *Foto de Refeição* → Análise completa
🩺 *Foto de Exame* → Interpretação
✍️ *Descrever Comida* → Registro rápido

_Sofia 💚_`,
  
  generic_help: () =>
    `👋 *Olá! Bem-vindo ao MaxNutrition!* 💚

Sou a *Sofia*, sua assistente de nutrição!

*Como posso ajudar você?*

📸 *Enviar Foto* → Refeição ou Exame
✍️ *Descrever* → Contar o que comeu
💧 *Água* → Registrar hidratação
⚖️ *Peso* → Registrar peso

_Sofia 💚_`,
  
  rate_limited: (name: string) =>
    `*${name}*, estou um pouquinho ocupada agora! 😅 💚

*Me manda de novo em 1 minutinho?* 🙏

Prometo responder rapidinho!

_Sofia 💚_`,
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
