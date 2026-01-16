import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Services
import { findUserByPhone, UserInfo } from "./services/user-service.ts";
import { getPendingConfirmation, getPendingMedical, checkAndClearExpiredPending, getStuckMedicalBatches, cancelAllMedicalBatches, cleanupStuckMedicalBatches } from "./services/pending-service.ts";
import { interpretUserIntent } from "./services/intent-service.ts";

// Handlers
import { handleTextMessage } from "./handlers/text-handler.ts";
import { handleConfirmation } from "./handlers/confirmation-handler.ts";
import { handleEdit } from "./handlers/edit-handler.ts";
import { handleMedicalResponse, processMedicalImage } from "./handlers/medical-handler.ts";
import { processAndUploadImage } from "./handlers/image-upload.ts";

// Button handler
import { handleButtonClick } from "./handlers/button-handler.ts";

// Utils
import {
  extractText,
  extractButtonId,
  hasButtonReply,
  hasImage,
  hasDocument,
  isConfirmationPositive,
  detectMealType,
  isMedicalCancel,
  isMedicalReset,
  isMedicalRetry,
} from "./utils/message-utils.ts";
import { sendWhatsApp } from "./utils/whatsapp-sender.ts";
import { 
  sendInteractiveMessage, 
  sendFoodAnalysisConfirmation, 
  sendMedicalAnalysisPrompt,
  sendPostConfirmation,
  sendTextMessage,
} from "./utils/whatsapp-interactive-sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhook = await req.json();
    console.log("[WhatsApp] Webhook recebido:", JSON.stringify(webhook).slice(0, 800));

    // Detect webhook format: Evolution vs Whapi
    const isWhapiFormat = !!(webhook.messages || webhook.event?.type === "messages");
    const isEvolutionFormat = !!(webhook.data?.key || webhook.event === "messages.upsert");
    
    console.log("[WhatsApp] Formato detectado:", isWhapiFormat ? "WHAPI" : "EVOLUTION");

    let message: any;
    let phone: string;
    let pushName: string;
    let isFromMe: boolean;
    let isGroup: boolean;

    if (isWhapiFormat) {
      // ========== WHAPI FORMAT ==========
      // Whapi: { messages: [...], event: {...} }
      const msg = webhook.messages?.[0] || webhook;
      
      // Ignore status updates (ack, read, etc)
      if (webhook.event?.type === "statuses" || !msg) {
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }
      
      message = msg;
      isFromMe = msg.from_me === true;
      
      // Extract phone from chat_id or from
      const chatId = msg.chat_id || msg.from || "";
      phone = chatId.replace("@s.whatsapp.net", "").replace("@c.us", "").replace(/\D/g, "");
      pushName = msg.from_name || msg.pushName || "Usuário";
      isGroup = chatId.includes("@g.us");
      
      console.log("[WhatsApp] Whapi - phone:", phone, "pushName:", pushName, "isFromMe:", isFromMe);
    } else {
      // ========== EVOLUTION FORMAT ==========
      // Validar evento
      const event = String(webhook.event || "").toLowerCase();
      const isUpsert = event === "messages.upsert" || event === "messages_upsert";
      if (!isUpsert) {
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      const key = webhook.data?.key || {};
      isFromMe = key.fromMe === true;
      
      const jid = key.remoteJidAlt || key.remoteJid || "";
      phone = String(jid).replace("@s.whatsapp.net", "").replace("@lid", "").replace(/\D/g, "");
      
      message = webhook.data?.message || {};
      pushName = webhook.data?.pushName || "Usuário";
      isGroup = jid.includes("@g.us");
      
      console.log("[WhatsApp] Evolution - phone:", phone, "pushName:", pushName);
    }

    // Ignorar mensagem própria
    if (isFromMe) {
      console.log("[WhatsApp] Ignorando mensagem própria");
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // Ignorar grupos
    if (isGroup) {
      console.log("[WhatsApp] Ignorando grupo");
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // Validar phone
    if (!phone || phone.length < 8) {
      console.log("[WhatsApp] Phone inválido:", phone);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    console.log(`[WhatsApp] 📩 Mensagem de ${phone} (${pushName})`);

    // Buscar usuário
    const user = await findUserByPhone(supabase, phone);
    if (!user) {
      console.log(`[WhatsApp] ⚠️ Usuário NÃO ENCONTRADO: ${phone}`);
      console.log(`[WhatsApp] 📤 Enviando mensagem de boas-vindas para usuário não cadastrado...`);
      
      // Enviar mensagem de boas-vindas para usuário não cadastrado
      const welcomeMessage = 
        `👋 *Olá! Prazer em conhecê-lo(a)!*\n\n` +
        `Sou a *Sofia* 🥗, sua nutricionista virtual, e trabalho junto com o *Dr. Vital* 🩺 para análise de exames.\n\n` +
        `📱 Para usar nossos serviços, você precisa criar uma conta:\n` +
        `🔗 https://app.oficialmaxnutrition.com.br\n\n` +
        `*Depois de se cadastrar:*\n` +
        `1️⃣ Vá em Configurações > Perfil\n` +
        `2️⃣ Adicione seu número de WhatsApp\n` +
        `3️⃣ Volte aqui e me mande uma foto da sua refeição!\n\n` +
        `✨ *O que posso fazer por você:*\n` +
        `• 🍽️ Analisar fotos de refeições\n` +
        `• 📊 Calcular calorias e macros\n` +
        `• 🩺 Analisar exames laboratoriais\n\n` +
        `Te aguardo! 😊`;
      
      await sendWhatsApp(phone, welcomeMessage);
      
      // Registrar log para análise
      console.log(`[WhatsApp] ✅ Mensagem de boas-vindas enviada para: ${phone}`);
      
      return new Response(JSON.stringify({ 
        ok: true, 
        action: "welcome_sent",
        phone: phone,
        reason: "user_not_registered"
      }), { headers: corsHeaders });
    }
    
    console.log(`[WhatsApp] ✅ Usuário encontrado: ${user.full_name || user.email} (ID: ${user.id})`)

    // Buscar pendências
    const pending = await getPendingConfirmation(supabase, user.id);
    const messageText = extractText(message);

    // Verificar pendência expirada
    if (!pending && messageText) {
      const hasExpired = await checkAndClearExpiredPending(supabase, user.id, phone);
      if (hasExpired && isConfirmationPositive(messageText)) {
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }
    }

    const pendingMedical = await getPendingMedical(supabase, user.id);
    
    // 🔥 AUTO-DETECT: Check for stale batches (inactive for 30+ seconds)
    const INACTIVITY_TIMEOUT_MS = 30 * 1000; // 30 seconds
    const nowTime = new Date();
    
    if (!hasImage(message) && !pendingMedical) {
      const { data: staleBatch } = await supabase
        .from("whatsapp_pending_medical")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "collecting")
        .eq("is_processed", false)
        .lt("last_image_at", new Date(nowTime.getTime() - INACTIVITY_TIMEOUT_MS).toISOString())
        .gt("expires_at", nowTime.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (staleBatch && staleBatch.images_count > 0) {
        const imagesCount = staleBatch.images_count || 1;
        
        // Update to awaiting_confirm status
        await supabase
          .from("whatsapp_pending_medical")
          .update({
            status: "awaiting_confirm",
            waiting_confirmation: true,
          })
          .eq("id", staleBatch.id);
        
        // Send interactive buttons for medical confirmation
        await sendMedicalAnalysisPrompt(phone, imagesCount);
        
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }
    }

    // 🔘 ROTEAMENTO DE BOTÕES - ANTES DO TEXTO
    const buttonId = extractButtonId(message);
    if (buttonId) {
      console.log(`[WhatsApp] 🔘 Botão clicado: ${buttonId}`);
      const handled = await handleButtonClick(supabase, user, phone, buttonId, pending, pendingMedical);
      if (handled) {
        return new Response(JSON.stringify({ ok: true, buttonHandled: buttonId }), { headers: corsHeaders });
      }
    }

    // ROTEAMENTO DE MENSAGENS DE TEXTO

    // 1. Modo edição ativo
    if (pending?.waiting_edit && messageText) {
      await handleEdit(supabase, user, pending, messageText, phone);
    }
    // 2. Aguardando confirmação nutricional
    else if (pending?.waiting_confirmation && messageText) {
      const analysis = pending.analysis_result || {};
      const pendingFoods = analysis.detectedFoods || analysis.foods || [];
      const lower = messageText.toLowerCase().trim();

      // Verificar respostas diretas
      const directConfirm = ["1", "sim", "s", "ok", "confirmo", "confirma", "certo", "isso"].includes(lower);
      const directCancel = ["2", "não", "nao", "n", "cancela", "cancelar", "nope"].includes(lower);
      const directEdit = ["3", "editar", "edita", "corrigir", "mudar", "alterar"].includes(lower);
      const directClear = ["4", "finalizar", "limpar", "clear", "descartar"].includes(lower);

      if (directConfirm || directCancel || directEdit || directClear) {
        await handleConfirmation(supabase, user, pending, messageText, phone);
      } else {
        // Para mensagens complexas, usar IA
        const intent = await interpretUserIntent(supabase, messageText, "awaiting_confirmation", pendingFoods);

        if (["confirm", "cancel", "edit", "add_food", "remove_food", "replace_food", "clear_pending"].includes(intent.intent)) {
          await handleConfirmation(supabase, user, pending, messageText, phone);
        } else {
          await handleSmartResponseWithPending(user, phone, messageText, pendingFoods);
        }
      }
    }
    // 3. Pendência médica ativa
    else if (pendingMedical && messageText) {
      const isExpired = pendingMedical.expires_at && new Date(pendingMedical.expires_at) < new Date();

      if (isExpired) {
        await supabase
          .from("whatsapp_pending_medical")
          .update({ is_processed: true, status: "expired" })
          .eq("id", pendingMedical.id);

        await handleTextMessage(supabase, user, phone, messageText);
      } else if (pendingMedical.status === "processing") {
        const lower = messageText.toLowerCase().trim();
        
        // VERIFICAR SE JÁ FOI CONCLUÍDO (tem medical_document_id ou public_link_token)
        if (pendingMedical.medical_document_id || pendingMedical.public_link_token) {
          // Já está pronto! Marcar como completed e oferecer link
          await supabase
            .from("whatsapp_pending_medical")
            .update({ status: "completed", is_processed: true })
            .eq("id", pendingMedical.id);
          
          if (pendingMedical.public_link_token) {
            const reportLink = `${Deno.env.get("SITE_URL") || "https://app.oficialmaxnutrition.com.br"}/relatorio/${pendingMedical.public_link_token}`;
            await sendWhatsApp(phone,
              `✅ *Seu relatório já está pronto!*\n\n` +
              `📋 Acesse aqui: ${reportLink}\n\n` +
              `Quer enviar novos exames? Basta me mandar as fotos!\n\n` +
              `_Dr. Vital 🩺_`
            );
          } else {
            await sendWhatsApp(phone,
              `✅ *Análise concluída!*\n\n` +
              `Quer enviar novos exames? Basta me mandar as fotos!\n\n` +
              `_Dr. Vital 🩺_`
            );
          }
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }
        
        // Calcular tempo desde início
        const startTime = new Date(pendingMedical.last_image_at || pendingMedical.created_at);
        const elapsedMinutes = Math.floor((Date.now() - startTime.getTime()) / 60000);
        
        // Cancelar
        if (isMedicalCancel(lower)) {
          await supabase
            .from("whatsapp_pending_medical")
            .update({ status: "cancelled", is_processed: true })
            .eq("id", pendingMedical.id);
          
          await sendWhatsApp(phone, 
            `❌ *Análise cancelada*\n\n` +
            `Quando quiser, envie novas fotos de exame!\n\n` +
            `_Dr. Vital 🩺_`
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }
        
        // Retentar
        if (isMedicalRetry(lower)) {
          await supabase
            .from("whatsapp_pending_medical")
            .update({ status: "collecting", confirmed: false })
            .eq("id", pendingMedical.id);
          
          await sendWhatsApp(phone,
            `🔄 *Ok! Vou reiniciar a análise.*\n\n` +
            `Quando estiver pronto, digite *PRONTO* ou *ANALISAR*.\n\n` +
            `_Dr. Vital 🩺_`
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }
        
        // Se está demorando muito (>10 min), oferecer opções
        if (elapsedMinutes > 10) {
          await sendInteractiveMessage(phone, {
            headerText: '⏳ Análise demorando',
            bodyText: `Já se passaram ${elapsedMinutes} minutos.\n\n*O que deseja fazer?*`,
            footerText: 'Dr. Vital 🩺',
            buttons: [
              { id: 'vital_wait', title: '⏳ Aguardar' },
              { id: 'vital_retry', title: '🔄 Retentar' },
              { id: 'vital_cancel', title: '❌ Cancelar' },
            ],
          });
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }
        
        // Perguntas sobre status
        if (/quanto|demora|pronto|acabou|status|cad[eê]/i.test(lower)) {
          const remaining = Math.max(1, 5 - elapsedMinutes);
          await sendWhatsApp(phone,
            `⏳ *Analisando seus exames...*\n\n` +
            `📊 ${pendingMedical.images_count} imagens em processamento\n` +
            `⏱️ Tempo decorrido: ${elapsedMinutes} min\n` +
            `📈 Previsão: ~${remaining} min restantes\n\n` +
            `_Dr. Vital 🩺_`
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }
        
        // Qualquer outra mensagem: NÃO REPETIR mensagem de processamento
        // Isso evita spam de mensagens repetitivas
        return new Response(JSON.stringify({ ok: true, note: "processing_in_progress" }), { headers: corsHeaders });
      } else {
        await handleMedicalResponse(supabase, user, pendingMedical, messageText, phone);
      }
    }
    // 4. Imagem ou documento recebido
    else if (hasImage(message) || hasDocument(message)) {
      const isDocument = hasDocument(message);
      console.log(`[WhatsApp] ${isDocument ? 'Documento' : 'Imagem'} recebido, processando...`);
      await processImage(user, phone, message, webhook, isDocument);
    }
    // 5. Texto sem pendência
    else if (messageText) {
      const lower = messageText.toLowerCase().trim();
      const isConfirmResponse = ["1", "2", "3", "4", "sim", "não", "nao", "s", "n", "ok", "pronto", "confirmo", "cancela"].includes(lower);

      if (isConfirmResponse) {
        await sendInteractiveMessage(phone, {
          headerText: '✅ Entendi!',
          bodyText: 'Envie uma foto para eu analisar:',
          footerText: 'Sofia 🥗 | Dr. Vital 🩺',
          buttons: [
            { id: 'sofia_new_photo', title: '📸 Enviar Foto' },
            { id: 'help', title: '❓ Ajuda' },
          ],
        });
      } else {
        await handleTextMessage(supabase, user, phone, messageText);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (error) {
    console.error("[WhatsApp] Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// Funções auxiliares

async function processImage(user: UserInfo, phone: string, message: any, webhook: any, isDocument: boolean = false): Promise<void> {
  try {
    console.log(`[WhatsApp] 📷 Processando ${isDocument ? 'documento' : 'imagem'} para usuário: ${user.full_name || user.email}`);
    
    // Se é um documento (PDF), encaminhar diretamente para análise médica
    if (isDocument) {
      console.log('[WhatsApp] 📄 Documento detectado, fazendo upload para medical-exams...');
      const imageUrl = await processAndUploadImage(supabase, user.id, message, webhook, 'medical-exams');
      
      if (!imageUrl) {
        console.log(`[WhatsApp] ❌ Falha ao fazer upload do documento`);
        await sendWhatsApp(phone, `❌ Não consegui processar seu documento. Tente enviar novamente!`);
        return;
      }
      
      console.log(`[WhatsApp] ✅ Documento salvo em medical-exams: ${imageUrl.substring(0, 80)}...`);
      await processMedicalImage(supabase, user, phone, imageUrl);
      return;
    }

    // Para imagens, primeiro fazer upload temporário para detectar tipo
    console.log('[WhatsApp] 🔍 Fazendo upload temporário para detectar tipo...');
    const tempImageUrl = await processAndUploadImage(supabase, user.id, message, webhook, 'whatsapp');

    if (!tempImageUrl) {
      console.log(`[WhatsApp] ❌ Falha ao fazer upload da imagem`);
      await sendWhatsApp(phone, `❌ Não consegui processar sua foto. Tente enviar novamente!`);
      return;
    }
    
    console.log(`[WhatsApp] ✅ Upload temporário concluído: ${tempImageUrl.substring(0, 80)}...`);

    // Detectar tipo de imagem
    console.log('[WhatsApp] 🔍 Detectando tipo de imagem...');
    const { data: imageTypeResult, error: detectError } = await supabase.functions.invoke("detect-image-type", {
      body: { imageUrl: tempImageUrl }
    });
    
    if (detectError) {
      console.error('[WhatsApp] ❌ Erro ao detectar tipo de imagem:', detectError);
    }

    const imageType = imageTypeResult?.type || "OTHER";
    console.log(`[WhatsApp] 🏷️ Tipo detectado: ${imageType}`);

    // TODO: Em versão futura, re-upload para pasta correta
    // Por agora, usamos a URL temporária pois MinIO não suporta move
    // Alternativa: fazer novo upload com base64 original na pasta correta

    if (imageType === "FOOD") {
      console.log('[WhatsApp] 🍽️ Encaminhando para Sofia (análise nutricional)...');
      // Imagem já está no MinIO, processar direto
      await processFoodImage(user, phone, tempImageUrl);
    } else if (imageType === "MEDICAL") {
      console.log('[WhatsApp] 🩺 Encaminhando para Dr. Vital (análise médica)...');
      await processMedicalImage(supabase, user, phone, tempImageUrl);
    } else {
      // Verificar se tem lote médico ativo
      const { data: activeMedicalBatch } = await supabase
        .from("whatsapp_pending_medical")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_processed", false)
        .in("status", ["collecting", "awaiting_confirm"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeMedicalBatch) {
        await processMedicalImage(supabase, user, phone, tempImageUrl);
      } else {
        await sendInteractiveMessage(phone, {
          headerText: '📸 Recebi sua foto!',
          bodyText: 'Para análise *nutricional*, envie fotos de refeições 🍽️\nPara análise de *exames*, envie fotos de resultados 🩺',
          footerText: 'Sofia 🥗',
          buttons: [
            { id: 'sofia_new_photo', title: '📸 Nova Foto' },
            { id: 'help', title: '❓ Ajuda' },
          ],
        });
      }
    }
  } catch (error) {
    console.error("[WhatsApp] Erro ao processar imagem:", error);
    await sendWhatsApp(phone, `❌ Erro ao processar ${isDocument ? 'seu documento' : 'sua foto'}. Tente novamente!`);
  }
}

async function processFoodImage(user: UserInfo, phone: string, imageUrl: string): Promise<void> {
  try {
    console.log(`[Sofia] 🍽️ Iniciando análise nutricional para: ${user.full_name || user.email}`);
    console.log(`[Sofia] 📷 URL da imagem: ${imageUrl.substring(0, 80)}...`);
    
    const { data: analysis, error: analysisError } = await supabase.functions.invoke("sofia-image-analysis", {
      body: {
        imageUrl,
        userId: user.id,
        userContext: { currentMeal: detectMealType() },
      },
    });

    if (analysisError) {
      console.error(`[Sofia] ❌ Erro na análise:`, analysisError);
      await sendWhatsApp(phone, "❌ Erro ao analisar sua foto. Tente novamente!");
      return;
    }
    
    if (!analysis) {
      console.log(`[Sofia] ⚠️ Análise retornou vazio`);
      await sendWhatsApp(phone, "❌ Erro ao analisar sua foto. Tente novamente!");
      return;
    }
    
    console.log(`[Sofia] ✅ Análise concluída:`, JSON.stringify(analysis).substring(0, 300));

    const normalizedFoods =
      analysis?.detectedFoods ??
      analysis?.foods ??
      analysis?.foods_detected ??
      analysis?.sofia_analysis?.foods_detected ??
      [];

    const detectedFoods = Array.isArray(normalizedFoods) ? normalizedFoods : [];
    console.log(`[Sofia] 🍴 Alimentos detectados: ${detectedFoods.length}`);

    if (detectedFoods.length === 0) {
      console.log(`[Sofia] ⚠️ Nenhum alimento detectado na imagem`);
      await sendWhatsApp(phone, "🤔 Não consegui identificar alimentos na foto. Tente enviar uma foto mais clara!");
      return;
    }

    // Extrair dados de nutrição de múltiplas fontes possíveis
    const nutritionTotals = 
      analysis?.nutrition_totals?.totals ||
      analysis?.nutrition_data ||
      analysis?.sofia_analysis?.nutrition_totals?.totals ||
      {};

    const totalCalories =
      nutritionTotals?.kcal ??
      nutritionTotals?.total_kcal ??
      analysis?.totalCalories ??
      analysis?.total_kcal ??
      analysis?.nutrition_data?.total_kcal ??
      0;

    const totalProteins =
      nutritionTotals?.protein ??
      nutritionTotals?.total_proteina ??
      analysis?.proteins ??
      analysis?.total_proteina ??
      0;

    const totalCarbs =
      nutritionTotals?.carbs ??
      nutritionTotals?.total_carbo ??
      analysis?.carbs ??
      analysis?.total_carbo ??
      0;

    const totalFats =
      nutritionTotals?.fat ??
      nutritionTotals?.total_gordura ??
      analysis?.fats ??
      analysis?.total_gordura ??
      0;

    const totalFiber =
      nutritionTotals?.fiber ??
      nutritionTotals?.total_fibra ??
      analysis?.fiber ??
      analysis?.total_fibra ??
      0;

    const mealType = detectMealType();

    // Dados de nutrição consolidados
    const consolidatedNutrition = {
      total_kcal: Number(totalCalories) || 0,
      total_proteina: Number(totalProteins) || 0,
      total_carbo: Number(totalCarbs) || 0,
      total_gordura: Number(totalFats) || 0,
      total_fibra: Number(totalFiber) || 0,
      confidence: analysis?.confidence || 0.8,
    };

    console.log(`[Sofia] 📊 Nutrição extraída:`, JSON.stringify(consolidatedNutrition));

    // Salvar em food_history com dados completos
    const foodHistoryId = await saveToFoodHistory(
      user.id,
      mealType,
      imageUrl,
      detectedFoods,
      consolidatedNutrition,
      JSON.stringify(analysis).slice(0, 5000),
      false,
      "whatsapp"
    );

    // Salvar automaticamente em nutrition_tracking com status 'pending'
    const today = new Date().toISOString().split("T")[0];
    const { data: pendingTracking, error: trackingError } = await supabase
      .from("nutrition_tracking")
      .insert({
        user_id: user.id,
        date: today,
        meal_type: mealType,
        total_calories: consolidatedNutrition.total_kcal,
        total_proteins: consolidatedNutrition.total_proteina,
        total_carbs: consolidatedNutrition.total_carbo,
        total_fats: consolidatedNutrition.total_gordura,
        total_fiber: consolidatedNutrition.total_fibra,
        food_items: detectedFoods,
        photo_url: imageUrl,
        notes: "Aguardando confirmação via WhatsApp",
        status: "pending",
      })
      .select("id")
      .single();

    if (trackingError) {
      console.error("[Sofia] ⚠️ Erro ao salvar nutrition_tracking pendente:", trackingError);
    } else {
      console.log("[Sofia] ✅ Salvo em nutrition_tracking (pendente):", pendingTracking?.id);
    }

    // Formatar mensagem
    const foodsList = detectedFoods
      .map((f: any) => {
        const name = f.nome || f.name || f.alimento || "(alimento)";
        const grams = f.quantidade ?? f.grams ?? f.g ?? "?";
        return `• ${name} (${grams}g)`;
      })
      .join("\n");

    const kcalLine = totalCalories && Number(totalCalories) > 0
      ? `\n📊 *Total: ~${Math.round(Number(totalCalories))} kcal*`
      : "";

    // Send interactive buttons for food confirmation
    await sendFoodAnalysisConfirmation(phone, detectedFoods, Number(totalCalories) || 0);

    // Limpar pendentes antigos e criar novo
    await supabase
      .from("whatsapp_pending_nutrition")
      .delete()
      .eq("user_id", user.id)
      .eq("waiting_confirmation", true);

    await supabase.from("whatsapp_pending_nutrition").insert({
      user_id: user.id,
      phone: phone,
      meal_type: mealType,
      image_url: imageUrl,
      analysis_result: {
        detectedFoods,
        totalCalories: consolidatedNutrition.total_kcal,
        totalProteins: consolidatedNutrition.total_proteina,
        totalCarbs: consolidatedNutrition.total_carbo,
        totalFats: consolidatedNutrition.total_gordura,
        totalFiber: consolidatedNutrition.total_fibra,
        raw: analysis,
        food_history_id: foodHistoryId,
        nutrition_tracking_id: pendingTracking?.id || null,
      },
      waiting_confirmation: true,
      waiting_edit: false,
      confirmed: null,
      is_processed: false,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

  } catch (error) {
    console.error("[WhatsApp] Erro ao processar imagem de comida:", error);
    await sendWhatsApp(phone, "❌ Erro ao analisar sua foto. Tente novamente!");
  }
}

async function saveToFoodHistory(
  userId: string,
  mealType: string,
  photoUrl: string | null,
  foodItems: any[],
  nutritionData: any,
  aiAnalysis: string | null,
  confirmed: boolean = false,
  source: string = "whatsapp"
): Promise<string | null> {
  try {
    const now = new Date();
    const mealDate = now.toISOString().split("T")[0];
    const mealTime = now.toTimeString().split(" ")[0];

    const { data, error } = await supabase
      .from("food_history")
      .insert({
        user_id: userId,
        meal_date: mealDate,
        meal_time: mealTime,
        meal_type: mealType,
        photo_url: photoUrl,
        food_items: foodItems,
        total_calories: nutritionData?.total_kcal || nutritionData?.totalCalories || 0,
        total_proteins: nutritionData?.total_proteina || nutritionData?.proteins || 0,
        total_carbs: nutritionData?.total_carbo || nutritionData?.carbs || 0,
        total_fats: nutritionData?.total_gordura || nutritionData?.fats || 0,
        total_fiber: nutritionData?.total_fibra || nutritionData?.fiber || 0,
        source: source,
        confidence_score: nutritionData?.confidence || null,
        user_confirmed: confirmed,
        ai_analysis: aiAnalysis,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[WhatsApp] Erro ao salvar food_history:", error);
      return null;
    }

    return data.id;
  } catch (e) {
    console.error("[WhatsApp] Erro ao salvar food_history:", e);
    return null;
  }
}

async function handleSmartResponse(user: UserInfo, phone: string, text: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: todayMessages } = await supabase
      .from("whatsapp_message_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("message_type", "outbound")
      .gte("sent_at", today)
      .limit(1);

    const isFirstMessageToday = !todayMessages || todayMessages.length === 0;

    const { data: aiResponse, error } = await supabase.functions.invoke("whatsapp-ai-assistant", {
      body: {
        userId: user.id,
        message: text,
        conversationHistory: [],
        isFirstMessage: isFirstMessageToday,
      },
    });

    if (error) {
      console.error("[WhatsApp] Erro na IA:", error);
      await sendWhatsApp(phone,
        `Oi! 👋 Tive um probleminha técnico, mas estou aqui!\n\n` +
        `Como posso te ajudar?\n\n` +
        `📸 *Foto de refeição* → analiso calorias\n` +
        `🩺 *Foto de exame* → analiso resultados\n` +
        `💬 *Me conta o que comeu* → registro pra você\n\n` +
        `_Sofia 💚_`
      );
      return;
    }

    const responseText = aiResponse?.response || "Estou aqui para ajudar! 💚";
    const hasSignature = responseText.includes("_Sofia") || responseText.includes("_Dr. Vital");
    const personality = aiResponse?.personality || 'sofia';
    const signature = hasSignature ? "" : (personality === 'drvital'
      ? "\n\n_Dr. Vital 🩺_"
      : "\n\n_Sofia 🥗_");

    await sendWhatsApp(phone, responseText + signature);

  } catch (error) {
    console.error("[WhatsApp] Erro na resposta inteligente:", error);
    await sendWhatsApp(phone,
      "Oi! 👋 Estou aqui para ajudar com sua nutrição!\n\n" +
      "📸 Envie uma foto da refeição\n" +
      "✍️ Ou descreva o que comeu\n\n" +
      "_Sofia 🥗_"
    );
  }
}

async function handleSmartResponseWithPending(
  user: UserInfo,
  phone: string,
  text: string,
  pendingFoods: any[]
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: todayMessages } = await supabase
      .from("whatsapp_message_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("message_type", "outbound")
      .gte("sent_at", today)
      .limit(1);

    const isFirstMessageToday = !todayMessages || todayMessages.length === 0;

    const { data: aiResponse } = await supabase.functions.invoke("whatsapp-ai-assistant", {
      body: {
        userId: user.id,
        message: text,
        conversationHistory: [],
        isFirstMessage: isFirstMessageToday,
      },
    });

    let responseText = aiResponse?.response || "Estou aqui para ajudar! 💚";
    responseText = responseText.replace(/\n*_Sofia 🥗_\s*$/g, '').replace(/\n*_Dr\. Vital 🩺_\s*$/g, '');

    const foodsList = pendingFoods.slice(0, 4).map((f: any) => f.nome || f.name).join(", ");
    
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

  } catch (error) {
    console.error("[WhatsApp] Erro na resposta com pendência:", error);
    await handleSmartResponse(user, phone, text);
  }
}
