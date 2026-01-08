import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhook = await req.json();
    console.log("[WhatsApp Nutrition] Webhook recebido:", JSON.stringify(webhook).slice(0, 500));

    const event = String(webhook.event || "").toLowerCase();
    const isUpsert = event === "messages.upsert" || event === "messages_upsert";
    if (!isUpsert) {
      console.log("[WhatsApp Nutrition] Evento ignorado:", webhook.event);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    if (webhook.data?.key?.fromMe) {
      console.log("[WhatsApp Nutrition] Mensagem própria ignorada");
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    const key = webhook.data?.key || {};
    const jid = key.remoteJidAlt || key.remoteJid || "";

    if (jid.includes("@g.us")) {
      console.log("[WhatsApp Nutrition] Mensagem de grupo ignorada:", jid);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    const phone = String(jid)
      .replace("@s.whatsapp.net", "")
      .replace("@lid", "")
      .replace(/\D/g, "");

    const message = webhook.data?.message || {};
    const pushName = webhook.data?.pushName || "Usuário";
    const instanceName = String(webhook.instance || EVOLUTION_INSTANCE || "");

    console.log(`[WhatsApp Nutrition] Mensagem de ${phone} (${pushName})`);
    console.log(`[WhatsApp Nutrition] Instância: ${instanceName || "(vazia)"}`);

    const user = await findUserByPhone(phone);
    if (!user) {
      console.log("[WhatsApp Nutrition] Usuário não encontrado para telefone:", phone);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    console.log(`[WhatsApp Nutrition] Usuário encontrado: ${user.id}`);

    const pending = await getPendingConfirmation(user.id);
    const messageText = extractText(message);

    if (!pending && messageText) {
      const hasExpired = await checkAndClearExpiredPending(user.id, phone);
      if (hasExpired && isConfirmationPositive(messageText)) {
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }
    }

    const pendingMedical = await getPendingMedical(user.id);

    if (pending?.waiting_edit && messageText) {
      console.log("[WhatsApp Nutrition] Processando edição:", messageText);
      await handleEdit(user, pending, messageText, phone);
    } else if (pending?.waiting_confirmation && messageText) {
      // 🔥 INTELIGÊNCIA: Verificar intenção ANTES de forçar confirmação
      const analysis = pending.analysis_result || {};
      const pendingFoods = analysis.detectedFoods || analysis.foods || [];
      const intent = await interpretUserIntent(messageText, "awaiting_confirmation", pendingFoods);
      
      console.log("[WhatsApp Nutrition] Intenção detectada com pendência:", intent.intent);
      
      // Se for confirmação/edição, processa normalmente
      if (["confirm", "cancel", "edit", "add_food", "remove_food", "replace_food"].includes(intent.intent)) {
        console.log("[WhatsApp Nutrition] Processando confirmação:", messageText);
        await handleConfirmation(user, pending, messageText, phone);
      } else {
        // 🔥 Se for pergunta/saudação/outro, deixa a IA responder e lembra da pendência
        console.log("[WhatsApp Nutrition] Permitindo conversa livre com pendência ativa");
        await handleSmartResponse(user, phone, messageText);
        
        // Enviar lembrete gentil da pendência
        const foodsList = pendingFoods.slice(0, 3).map((f: any) => f.nome || f.name).join(", ");
        const reminder = pendingFoods.length > 0 
          ? `\n\n💡 _Ah, você ainda tem uma refeição pendente (${foodsList}${pendingFoods.length > 3 ? '...' : ''}). Responda *1 (SIM)*, *2 (NÃO)* ou *3 (EDITAR)* quando quiser finalizar!_`
          : "";
        
        if (reminder) {
          await sendWhatsApp(phone, reminder);
        }
      }
    } else if (pendingMedical && messageText) {
      console.log("[WhatsApp Nutrition] Processando resposta exame médico:", messageText);
      await handleMedicalResponse(user, pendingMedical, messageText, phone);
    } else if (hasImage(message)) {
      console.log("[WhatsApp Nutrition] Processando imagem...");
      await processImage(user, phone, message, webhook);
    } else if (messageText) {
      console.log("[WhatsApp Nutrition] Processando texto:", messageText);
      await processText(user, phone, messageText);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// =============== FUNÇÕES AUXILIARES ===============

async function findUserByPhone(phone: string): Promise<{ id: string; email: string } | null> {
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("55")) {
    cleanPhone = cleanPhone.substring(2);
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, email, phone")
    .or(`phone.ilike.%${cleanPhone}%,phone.ilike.%${phone}%`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[WhatsApp Nutrition] Erro ao buscar usuário:", error);
    return null;
  }

  if (data) {
    return { id: data.user_id, email: data.email };
  }

  return null;
}

async function getPendingConfirmation(userId: string): Promise<any | null> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("whatsapp_pending_nutrition")
    .select("*")
    .eq("user_id", userId)
    .eq("is_processed", false)
    .or("waiting_confirmation.eq.true,waiting_edit.eq.true")
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[WhatsApp Nutrition] Erro ao buscar pendente:", error);
    return null;
  }

  return data;
}

async function getPendingMedical(userId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("whatsapp_pending_medical")
    .select("*")
    .eq("user_id", userId)
    .eq("is_processed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

async function checkAndClearExpiredPending(userId: string, phone: string): Promise<boolean> {
  const { data: expired, error } = await supabase
    .from("whatsapp_pending_nutrition")
    .select("*")
    .eq("user_id", userId)
    .eq("is_processed", false)
    .or("waiting_confirmation.eq.true,waiting_edit.eq.true")
    .lt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !expired || expired.length === 0) {
    return false;
  }

  console.log("[WhatsApp Nutrition] Análise expirada encontrada, notificando usuário");
  
  await supabase
    .from("whatsapp_pending_nutrition")
    .delete()
    .eq("user_id", userId)
    .lt("expires_at", new Date().toISOString());

  await sendWhatsApp(phone, 
    "⏰ Sua análise anterior expirou.\n\n" +
    "📸 Envie a foto novamente para registrar sua refeição!"
  );

  return true;
}

function extractText(message: any): string {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    ""
  ).trim();
}

function hasImage(message: any): boolean {
  return !!message.imageMessage;
}

function isConfirmationPositive(text: string): boolean {
  const positive = ["sim", "s", "yes", "y", "ok", "1", "✅", "confirmo", "confirma", "certo", "isso"];
  return positive.includes(text.toLowerCase().trim());
}

function isConfirmationNegative(text: string): boolean {
  const negative = ["não", "nao", "n", "no", "2", "❌", "errado", "incorreto", "0", "cancelar"];
  return negative.includes(text.toLowerCase().trim());
}

function isConfirmationEdit(text: string): boolean {
  const edit = ["editar", "edit", "3", "✏️", "corrigir", "mudar", "alterar", "edita"];
  return edit.includes(text.toLowerCase().trim());
}

function isEditDone(text: string): boolean {
  const done = ["pronto", "done", "finalizar", "ok", "confirmar", "confirma", "terminar", "terminei"];
  return done.includes(text.toLowerCase().trim());
}

function parseEditCommand(text: string, foods: any[]): { action: string; index?: number; newFood?: { name: string; grams: number } } | null {
  const lower = text.toLowerCase().trim();
  
  const replaceMatch = lower.match(/(?:trocar|substituir|mudar)\s+(\d+)\s+(?:por|para)\s+(.+)/i);
  if (replaceMatch) {
    const index = parseInt(replaceMatch[1]) - 1;
    const foodPart = replaceMatch[2].trim();
    const gramsMatch = foodPart.match(/(\d+)\s*g?$/);
    const grams = gramsMatch ? parseInt(gramsMatch[1]) : 100;
    const name = foodPart.replace(/\d+\s*g?$/, '').trim() || foodPart;
    if (index >= 0 && index < foods.length) {
      return { action: 'replace', index, newFood: { name, grams } };
    }
  }
  
  const removeMatch = lower.match(/(?:remover|tirar|excluir|deletar)\s+(\d+)/i);
  if (removeMatch) {
    const index = parseInt(removeMatch[1]) - 1;
    if (index >= 0 && index < foods.length) {
      return { action: 'remove', index };
    }
  }
  
  const addMatch = lower.match(/(?:adicionar|incluir|acrescentar|add)\s+(.+)/i);
  if (addMatch) {
    const foodPart = addMatch[1].trim();
    const gramsMatch = foodPart.match(/(\d+)\s*g?$/);
    const grams = gramsMatch ? parseInt(gramsMatch[1]) : 100;
    const name = foodPart.replace(/\d+\s*g?$/, '').trim() || foodPart;
    return { action: 'add', newFood: { name, grams } };
  }
  
  return null;
}

function detectMealType(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "cafe_da_manha";
  if (hour >= 10 && hour < 12) return "lanche_manha";
  if (hour >= 12 && hour < 15) return "almoco";
  if (hour >= 15 && hour < 18) return "lanche_tarde";
  if (hour >= 18 && hour < 21) return "jantar";
  return "ceia";
}

function formatMealType(mealType: string): string {
  const types: Record<string, string> = {
    cafe_da_manha: "☕ Café da Manhã",
    lanche_manha: "🍎 Lanche da Manhã",
    almoco: "🍽️ Almoço",
    lanche_tarde: "🥤 Lanche da Tarde",
    jantar: "🌙 Jantar",
    ceia: "🌃 Ceia",
  };
  return types[mealType] || mealType;
}

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.error("[WhatsApp Nutrition] Evolution API não configurada");
    return;
  }

  let formattedPhone = phone.replace(/\D/g, "");
  if (!formattedPhone.startsWith("55")) {
    formattedPhone = "55" + formattedPhone;
  }

  try {
    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
        delay: 1200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[WhatsApp Nutrition] Erro ao enviar mensagem:", errorData);
    } else {
      console.log("[WhatsApp Nutrition] Mensagem enviada com sucesso");
    }
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao enviar WhatsApp:", error);
  }
}

async function getDailyTotal(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  // Buscar de food_history (fonte principal)
  const { data: foodHistory } = await supabase
    .from("food_history")
    .select("total_calories")
    .eq("user_id", userId)
    .eq("meal_date", today);

  const foodHistoryTotal = foodHistory?.reduce((sum, item) => sum + (Number(item.total_calories) || 0), 0) || 0;

  // Também buscar de nutrition_tracking (legado)
  const { data: nutritionTracking } = await supabase
    .from("nutrition_tracking")
    .select("total_calories")
    .eq("user_id", userId)
    .eq("date", today);

  const nutritionTotal = nutritionTracking?.reduce((sum, item) => sum + (Number(item.total_calories) || 0), 0) || 0;

  return Math.max(foodHistoryTotal, nutritionTotal);
}

// =============== SALVAR EM FOOD_HISTORY (PERMANENTE) ===============

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
      console.error("[WhatsApp Nutrition] Erro ao salvar food_history:", error);
      return null;
    }

    console.log("[WhatsApp Nutrition] ✅ Salvo em food_history:", data.id);
    return data.id;
  } catch (e) {
    console.error("[WhatsApp Nutrition] Erro ao salvar food_history:", e);
    return null;
  }
}

async function updateFoodHistoryConfirmation(foodHistoryId: string, confirmed: boolean, updatedFoods?: any[], updatedNutrition?: any): Promise<void> {
  try {
    const updateData: any = {
      user_confirmed: confirmed,
      updated_at: new Date().toISOString(),
    };

    if (updatedFoods) {
      updateData.food_items = updatedFoods;
    }

    if (updatedNutrition) {
      updateData.total_calories = updatedNutrition.total_kcal || updatedNutrition.totalCalories || 0;
      updateData.total_proteins = updatedNutrition.total_proteina || 0;
      updateData.total_carbs = updatedNutrition.total_carbo || 0;
      updateData.total_fats = updatedNutrition.total_gordura || 0;
      updateData.total_fiber = updatedNutrition.total_fibra || 0;
    }

    await supabase
      .from("food_history")
      .update(updateData)
      .eq("id", foodHistoryId);

    console.log("[WhatsApp Nutrition] ✅ food_history atualizado:", foodHistoryId);
  } catch (e) {
    console.error("[WhatsApp Nutrition] Erro ao atualizar food_history:", e);
  }
}

// =============== PROCESSAMENTO DE EXAME MÉDICO ===============

async function processMedicalImage(user: { id: string }, phone: string, imageUrl: string): Promise<void> {
  try {
    console.log("[WhatsApp Medical] Processando exame médico para", user.id);

    // Mensagem de recebimento imediata
    await sendWhatsApp(phone,
      "🩺 *Recebi seu exame!*\n\n" +
      "Estou analisando os resultados...\n" +
      "⏳ Isso pode levar alguns segundos.\n\n" +
      "_Dr. Vital 🩺_"
    );

    // Chamar analyze-medical-exam
    const { data: analysisResult, error: analysisError } = await supabase.functions.invoke("analyze-medical-exam", {
      body: { 
        imageUrl, 
        userId: user.id,
        source: "whatsapp"
      },
    });

    if (analysisError) {
      console.error("[WhatsApp Medical] Erro na análise:", analysisError);
      await sendWhatsApp(phone,
        "❌ Não consegui analisar seu exame.\n\n" +
        "Por favor, tente enviar uma foto mais clara.\n\n" +
        "_Dr. Vital 🩺_"
      );
      return;
    }

    console.log("[WhatsApp Medical] Análise concluída:", JSON.stringify(analysisResult).slice(0, 300));

    // Extrair resumo da análise
    const summary = analysisResult?.summary || analysisResult?.analysis?.summary || "Análise concluída";
    const documentId = analysisResult?.documentId || analysisResult?.document_id;
    const findings = analysisResult?.findings || analysisResult?.analysis?.findings || [];

    // Formatar achados principais
    let findingsText = "";
    if (findings.length > 0) {
      findingsText = "\n\n📋 *Principais achados:*\n";
      for (const finding of findings.slice(0, 5)) {
        const status = finding.status === "normal" ? "🟢" : finding.status === "attention" ? "🟡" : "🔴";
        findingsText += `${status} ${finding.name || finding.test}: ${finding.value || finding.result}\n`;
      }
    }

    // Tentar gerar relatório se tiver documentId
    let reportLink = "";
    if (documentId) {
      try {
        const { data: reportResult } = await supabase.functions.invoke("generate-medical-report", {
          body: { documentId, userId: user.id }
        });

        if (reportResult?.publicUrl || reportResult?.token) {
          const token = reportResult.token || documentId.slice(0, 8);
          reportLink = `\n\n📊 *Relatório completo:*\n👉 institutodossonhos.com.br/relatorio/${token}`;
        }
      } catch (e) {
        console.log("[WhatsApp Medical] Relatório não disponível");
      }
    }

    // Responder com análise
    await sendWhatsApp(phone,
      `🩺 *Análise Concluída!*\n\n` +
      `${summary}${findingsText}${reportLink}\n\n` +
      `Qualquer dúvida, estou aqui para ajudar!\n\n` +
      `_Dr. Vital 🩺_`
    );

    // Salvar em pending medical para acompanhamento
    await supabase.from("whatsapp_pending_medical").insert({
      user_id: user.id,
      phone: phone,
      image_url: imageUrl,
      analysis_result: analysisResult,
      is_processed: false,
      created_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error("[WhatsApp Medical] Erro:", error);
    await sendWhatsApp(phone,
      "❌ Ocorreu um erro ao processar seu exame.\n\n" +
      "Por favor, tente novamente.\n\n" +
      "_Dr. Vital 🩺_"
    );
  }
}

// =============== PROCESSAMENTO DE IMAGEM ===============

async function processImage(user: { id: string }, phone: string, message: any, webhook: any): Promise<void> {
  try {
    const contentTypeHint = message?.imageMessage?.mimetype || "image/jpeg";

    const uploadBytesToStorage = async (bytes: Uint8Array, contentType: string): Promise<string | null> => {
      const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      const fileName = `whatsapp/${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(fileName, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), { contentType, upsert: true });

      if (uploadError) {
        console.error("[WhatsApp Nutrition] Erro no upload:", uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(fileName);
      return urlData.publicUrl || null;
    };

    const base64ToBytes = (base64: string): Uint8Array => {
      const clean = base64.includes(",") ? base64.split(",")[1] : base64;
      const bin = atob(clean);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    };

    const uploadBase64ToStorage = async (base64: string, contentType: string): Promise<string | null> => {
      const ct = base64.startsWith("data:") ? base64.slice(5, base64.indexOf(";")) : contentType;
      return uploadBytesToStorage(base64ToBytes(base64), ct || contentType);
    };

    const tryGetBase64FromEvolution = async (): Promise<string | null> => {
      if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
        return null;
      }

      const messageKey = webhook.data?.key || {};
      const messageContent = webhook.data?.message || {};

      const payload = {
        message: {
          key: {
            remoteJid: messageKey.remoteJid,
            fromMe: messageKey.fromMe || false,
            id: messageKey.id,
          },
          message: messageContent,
        },
        convertToMp4: false,
      };

      try {
        const base64Response = await fetch(
          `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${EVOLUTION_INSTANCE}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: EVOLUTION_API_KEY,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!base64Response.ok) {
          return null;
        }

        const responseData = await base64Response.json();
        return responseData?.base64 || responseData?.data?.base64 || responseData?.media || null;
      } catch (e) {
        return null;
      }
    };

    let imageUrl: string | null = null;

    // 1) Base64 direto do webhook
    const directBase64 =
      webhook?.data?.message?.imageMessage?.base64 ??
      webhook?.data?.message?.base64 ??
      message?.imageMessage?.base64 ??
      message?.base64;

    if (directBase64) {
      imageUrl = await uploadBase64ToStorage(directBase64, contentTypeHint);
    }

    // 2) Buscar base64 via Evolution
    if (!imageUrl) {
      const evoBase64 = await tryGetBase64FromEvolution();
      if (evoBase64) {
        imageUrl = await uploadBase64ToStorage(evoBase64, contentTypeHint);
      }
    }

    if (!imageUrl) {
      console.error("[WhatsApp Nutrition] ❌ Não foi possível obter a imagem");
      await sendWhatsApp(phone, "❌ Não consegui processar sua foto. Tente enviar novamente!");
      return;
    }

    console.log("[WhatsApp Nutrition] ✅ Upload concluído! URL:", imageUrl);

    // 🔥 DETECÇÃO INTELIGENTE DO TIPO DE IMAGEM
    // Obter base64 para passar ao detector (mais robusto que URL)
    let imageBase64ForDetection: string | null = null;
    const directBase64Check = directBase64 || await tryGetBase64FromEvolution();
    if (directBase64Check) {
      imageBase64ForDetection = directBase64Check.startsWith("data:") 
        ? directBase64Check 
        : `data:image/jpeg;base64,${directBase64Check}`;
    }
    
    console.log("[WhatsApp Nutrition] Detectando tipo de imagem...");
    
    const { data: imageTypeResult, error: typeError } = await supabase.functions.invoke("detect-image-type", {
      body: { 
        imageUrl,
        imageBase64: imageBase64ForDetection // 🔥 Passa base64 para evitar timeout
      }
    });

    const imageType = imageTypeResult?.type || "OTHER";
    const typeConfidence = imageTypeResult?.confidence || 0;
    
    console.log(`[WhatsApp Nutrition] Tipo detectado: ${imageType} (confiança: ${typeConfidence})`);

    // 🔥 ROTEAMENTO BASEADO NO TIPO
    if (imageType === "MEDICAL") {
      console.log("[WhatsApp Nutrition] Redirecionando para processamento médico...");
      await processMedicalImage(user, phone, imageUrl);
      return;
    }

    if (imageType === "OTHER") {
      console.log("[WhatsApp Nutrition] Imagem não reconhecida como comida ou exame");
      await sendWhatsApp(phone,
        "📸 Recebi sua foto!\n\n" +
        "Para análise *nutricional*, envie fotos de refeições 🍽️\n" +
        "Para análise de *exames*, envie fotos de resultados 🩺\n\n" +
        "_Sofia 🥗_"
      );
      return;
    }

    // Continuar com análise de COMIDA
    console.log("[WhatsApp Nutrition] Processando como imagem de comida...");

    // Chamar sofia-image-analysis
    const { data: analysis, error: analysisError } = await supabase.functions.invoke("sofia-image-analysis", {
      body: {
        imageUrl,
        userId: user.id,
        userContext: { currentMeal: detectMealType() },
      },
    });

    if (analysisError || !analysis) {
      console.error("[WhatsApp Nutrition] Erro na análise:", analysisError);
      await sendWhatsApp(phone, "❌ Erro ao analisar sua foto. Tente novamente!");
      return;
    }

    console.log("[WhatsApp Nutrition] Análise completa:", JSON.stringify(analysis).slice(0, 500));

    // Normalizar alimentos detectados
    const normalizedFoods =
      analysis?.detectedFoods ??
      analysis?.foods ??
      analysis?.foods_detected ??
      analysis?.sofia_analysis?.foods_detected ??
      analysis?.sofia_analysis?.foods ??
      [];

    const detectedFoods = Array.isArray(normalizedFoods) ? normalizedFoods : [];

    if (detectedFoods.length === 0) {
      await sendWhatsApp(phone, "🤔 Não consegui identificar alimentos na foto. Tente enviar uma foto mais clara do prato!");
      return;
    }

    const totalCalories =
      analysis?.totalCalories ??
      analysis?.total_kcal ??
      analysis?.nutrition_data?.total_kcal ??
      analysis?.sofia_analysis?.totalCalories ??
      0;

    const mealType = detectMealType();

    // 🔥 SALVAR IMEDIATAMENTE EM FOOD_HISTORY (antes de pedir confirmação)
    const foodHistoryId = await saveToFoodHistory(
      user.id,
      mealType,
      imageUrl,
      detectedFoods,
      { total_kcal: totalCalories, confidence: analysis?.confidence || 0.8 },
      JSON.stringify(analysis).slice(0, 5000),
      false, // não confirmado ainda
      "whatsapp"
    );

    console.log("[WhatsApp Nutrition] 🔥 Refeição salva IMEDIATAMENTE em food_history:", foodHistoryId);

    // Formatar lista de alimentos
    const foodsList = detectedFoods
      .map((f: any) => {
        const name = f.nome || f.name || f.alimento || "(alimento)";
        const grams = f.quantidade ?? f.grams ?? f.g ?? "?";
        return `• ${name} (${grams}g)`;
      })
      .join("\n");

    const kcalLine = totalCalories && Number(totalCalories) > 0
      ? `📊 *Total estimado: ~${Math.round(Number(totalCalories))} kcal*\n\n`
      : "";

    const confirmMessage =
      `🍽️ *Analisei sua refeição!*\n\n` +
      `${foodsList}\n\n` +
      kcalLine +
      `Está correto? Responda:\n` +
      `✅ *1* ou *SIM* - Confirmar\n` +
      `❌ *2* ou *NÃO* - Cancelar\n` +
      `✏️ *3* ou *EDITAR* - Corrigir itens`;

    await sendWhatsApp(phone, confirmMessage);

    // Salvar análise pendente (com referência ao food_history)
    const pendingPayload = {
      detectedFoods,
      totalCalories: Number(totalCalories) || null,
      raw: analysis,
      food_history_id: foodHistoryId, // 🔥 Referência ao registro permanente
    };

    // Limpar pendentes antigos
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
      analysis_result: pendingPayload,
      waiting_confirmation: true,
      waiting_edit: false,
      confirmed: null,
      is_processed: false,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao processar imagem:", error);
    await sendWhatsApp(phone, "❌ Ocorreu um erro. Tente novamente!");
  }
}

// =============== PROCESSAMENTO DE TEXTO ===============

async function processText(user: { id: string }, phone: string, text: string): Promise<void> {
  try {
    const foodKeywords = ["comi", "almocei", "jantei", "tomei", "bebi", "arroz", "feijão", "carne", "frango", "salada", "pão", "café", "leite", "ovo", "fruta", "suco", "vitamina", "banana", "maçã", "laranja", "batata", "macarrão", "pizza", "hamburguer", "sanduiche", "lanche"];
    const isFood = foodKeywords.some((k) => text.toLowerCase().includes(k));

    if (!isFood) {
      console.log("[WhatsApp Nutrition] Usando IA inteligente para responder:", text);
      await handleSmartResponse(user, phone, text);
      return;
    }

    // Chamar sofia-deterministic para extrair alimentos do texto
    const { data: analysis, error: analysisError } = await supabase.functions.invoke("sofia-deterministic", {
      body: {
        user_input: text,
        user_id: user.id,
        analysis_type: "text_extraction",
      },
    });

    if (analysisError || !analysis) {
      console.error("[WhatsApp Nutrition] Erro na análise de texto:", analysisError);
      await handleSmartResponse(user, phone, text);
      return;
    }

    const foods = analysis.detected_foods || analysis.foods || [];
    if (foods.length === 0) {
      await handleSmartResponse(user, phone, text);
      return;
    }

    const totalCalories = analysis.nutrition_data?.total_kcal || analysis.total_kcal || 0;
    const mealType = detectMealType();

    // 🔥 SALVAR IMEDIATAMENTE EM FOOD_HISTORY
    const foodHistoryId = await saveToFoodHistory(
      user.id,
      mealType,
      null, // sem foto
      foods,
      { total_kcal: totalCalories },
      JSON.stringify(analysis).slice(0, 5000),
      false,
      "whatsapp_text"
    );

    console.log("[WhatsApp Nutrition] 🔥 Refeição (texto) salva IMEDIATAMENTE:", foodHistoryId);

    const foodsList = foods
      .map((f: any) => `• ${f.name || f.nome} (${f.grams || f.quantidade || "?"}g)`)
      .join("\n");

    const confirmMessage = 
      `🍽️ *Entendi! Você comeu:*\n\n` +
      `${foodsList}\n\n` +
      `📊 *Total estimado: ~${Math.round(totalCalories)} kcal*\n\n` +
      `Está correto? Responda:\n` +
      `✅ *1* ou *SIM* - Confirmar\n` +
      `❌ *2* ou *NÃO* - Cancelar\n` +
      `✏️ *3* ou *EDITAR* - Corrigir itens`;

    await sendWhatsApp(phone, confirmMessage);

    // Limpar pendentes antigos
    await supabase
      .from("whatsapp_pending_nutrition")
      .delete()
      .eq("user_id", user.id)
      .eq("waiting_confirmation", true);

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

  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao processar texto:", error);
    try {
      await handleSmartResponse(user, phone, text);
    } catch {}
  }
}

// =============== RESPOSTA INTELIGENTE COM IA ===============

async function handleSmartResponse(user: { id: string }, phone: string, text: string): Promise<void> {
  try {
    console.log("[WhatsApp Nutrition] Chamando IA inteligente...");
    
    const { data: aiResponse, error } = await supabase.functions.invoke("whatsapp-ai-assistant", {
      body: {
        userId: user.id,
        message: text,
        conversationHistory: [],
      },
    });

    if (error) {
      console.error("[WhatsApp Nutrition] Erro na IA:", error);
      await sendWhatsApp(phone, 
        "🤔 Hmm, não entendi muito bem. Pode reformular?\n\n" +
        "💡 *Dica:* Envie uma foto da sua refeição ou me conte o que comeu!"
      );
      return;
    }

    const responseText = aiResponse?.response || "Estou aqui para ajudar! 💚";
    
    const personality = aiResponse?.personality || 'sofia';
    const signature = personality === 'drvital' 
      ? "\n\n_Dr. Vital 🩺_"
      : "\n\n_Sofia 🥗_";
    
    await sendWhatsApp(phone, responseText + signature);
    
    console.log("[WhatsApp Nutrition] Resposta IA enviada:", responseText.slice(0, 100));

  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro na resposta inteligente:", error);
    await sendWhatsApp(phone, 
      "Oi! 👋 Estou aqui para ajudar com sua nutrição!\n\n" +
      "📸 Envie uma foto da refeição\n" +
      "✍️ Ou descreva o que comeu"
    );
  }
}

// =============== INTERPRETAÇÃO DE INTENÇÃO COM IA ===============

async function interpretUserIntent(text: string, context: string, pendingFoods?: any[]): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke("interpret-user-intent", {
      body: {
        text,
        context,
        pendingFoods: pendingFoods || []
      }
    });

    if (error || !data) {
      return fallbackIntentInterpretation(text);
    }

    return data;
  } catch (e) {
    return fallbackIntentInterpretation(text);
  }
}

function fallbackIntentInterpretation(text: string): any {
  const lower = text.toLowerCase().trim();
  
  if (isConfirmationPositive(lower)) return { intent: "confirm", confidence: 0.8, details: {} };
  if (isConfirmationNegative(lower)) return { intent: "cancel", confidence: 0.8, details: {} };
  if (isConfirmationEdit(lower)) return { intent: "edit", confidence: 0.8, details: {} };
  if (isEditDone(lower)) return { intent: "confirm", confidence: 0.8, details: {} };
  
  return { intent: "unknown", confidence: 0, details: {} };
}

// =============== PROCESSAMENTO DE CONFIRMAÇÃO ===============

async function handleConfirmation(
  user: { id: string },
  pending: any,
  messageText: string,
  phone: string
): Promise<void> {
  try {
    const analysis = pending.analysis_result || {};
    const pendingFoods = analysis.detectedFoods || analysis.foods || analysis.foods_detected || [];
    const foodHistoryId = analysis.food_history_id; // Referência ao registro permanente
    
    const intent = await interpretUserIntent(messageText, "awaiting_confirmation", pendingFoods);
    
    console.log("[WhatsApp Nutrition] Intenção interpretada:", intent.intent);
    
    if (intent.intent === "confirm") {
      console.log("[WhatsApp Nutrition] Confirmação positiva recebida");

      const detectedFoods =
        analysis.detectedFoods ||
        analysis.foods ||
        analysis.foods_detected ||
        analysis.raw?.sofia_analysis?.foods_detected ||
        [];

      // Chamar sofia-deterministic para cálculo exato
      const { data: deterministicResult, error: deterministicError } = await supabase.functions.invoke(
        "sofia-deterministic",
        {
          body: {
            detected_foods: detectedFoods.map((f: any) => ({
              name: f.nome || f.name,
              grams: f.quantidade || f.grams || 100,
            })),
            user_id: user.id,
            analysis_type: "nutritional_sum",
          },
        }
      );

      const nutritionData = deterministicResult?.nutrition_data || {
        total_kcal: analysis.totalCalories || 0,
        total_proteina: 0,
        total_carbo: 0,
        total_gordura: 0,
      };

      // 🔥 Atualizar food_history como CONFIRMADO
      if (foodHistoryId) {
        await updateFoodHistoryConfirmation(foodHistoryId, true, detectedFoods, nutritionData);
      }

      // Também salvar em nutrition_tracking (legado)
      const today = new Date().toISOString().split("T")[0];
      const { data: tracking, error: trackingError } = await supabase
        .from("nutrition_tracking")
        .insert({
          user_id: user.id,
          date: today,
          meal_type: pending.meal_type || detectMealType(),
          total_calories: nutritionData.total_kcal || 0,
          total_proteins: nutritionData.total_proteina || 0,
          total_carbs: nutritionData.total_carbo || 0,
          total_fats: nutritionData.total_gordura || 0,
          total_fiber: nutritionData.total_fibra || 0,
          food_items: detectedFoods,
          photo_url: pending.image_url,
          notes: "Registrado via WhatsApp",
        })
        .select()
        .single();

      if (trackingError) {
        console.error("[WhatsApp Nutrition] Erro ao salvar tracking:", trackingError);
      }

      // Atualizar pendente como processado
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({
          waiting_confirmation: false,
          confirmed: true,
          is_processed: true,
          nutrition_tracking_id: tracking?.id,
        })
        .eq("id", pending.id);

      const dailyTotal = await getDailyTotal(user.id);

      const successMessage =
        `✅ *Refeição registrada!*\n\n` +
        `${formatMealType(pending.meal_type || detectMealType())}: ${Math.round(nutritionData.total_kcal)} kcal\n` +
        `📊 Total do dia: ${Math.round(dailyTotal)} kcal\n\n` +
        `Continue assim! 💪`;

      await sendWhatsApp(phone, successMessage);

    } else if (intent.intent === "cancel") {
      console.log("[WhatsApp Nutrition] Cancelamento recebido");

      // Mesmo cancelando, mantemos no food_history (apenas não confirmado)
      if (foodHistoryId) {
        await supabase
          .from("food_history")
          .update({ user_notes: "Cancelado pelo usuário" })
          .eq("id", foodHistoryId);
      }

      await supabase
        .from("whatsapp_pending_nutrition")
        .update({
          waiting_confirmation: false,
          confirmed: false,
          is_processed: true,
        })
        .eq("id", pending.id);

      await sendWhatsApp(phone, "❌ Registro cancelado.\n\n📸 Envie uma nova foto quando quiser!");

    } else if (intent.intent === "edit") {
      console.log("[WhatsApp Nutrition] Modo edição ativado");

      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ waiting_edit: true })
        .eq("id", pending.id);

      const numberedList = pendingFoods
        .map((f: any, i: number) => {
          const name = f.nome || f.name || f.alimento || "(alimento)";
          const grams = f.quantidade ?? f.grams ?? f.g ?? "?";
          return `${i + 1}. ${name} (${grams}g)`;
        })
        .join("\n");

      await sendWhatsApp(
        phone,
        `✏️ *Modo edição*\n\n` +
        `Itens detectados:\n${numberedList}\n\n` +
        `Agora você pode me dizer naturalmente:\n` +
        `• "Adiciona uma banana"\n` +
        `• "Tira o arroz"\n` +
        `• "Na verdade era macarrão, não arroz"\n\n` +
        `Responda *PRONTO* quando terminar`
      );

    } else if (intent.intent === "add_food" && intent.details?.newFood) {
      const newFood = {
        nome: intent.details.newFood.name,
        quantidade: intent.details.newFood.grams || 100,
        name: intent.details.newFood.name,
        grams: intent.details.newFood.grams || 100
      };
      
      const updatedFoods = [...pendingFoods, newFood];
      const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
      
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ analysis_result: updatedAnalysis })
        .eq("id", pending.id);

      // Atualizar food_history também
      if (foodHistoryId) {
        await supabase
          .from("food_history")
          .update({ food_items: updatedFoods })
          .eq("id", foodHistoryId);
      }
      
      const foodsList = updatedFoods
        .map((f: any) => `• ${f.nome || f.name} (${f.quantidade ?? f.grams ?? "?"}g)`)
        .join("\n");
      
      await sendWhatsApp(
        phone,
        `✅ *Adicionado!*\n\n` +
        `Lista atualizada:\n${foodsList}\n\n` +
        `✅ *SIM* para confirmar\n` +
        `❌ *NÃO* para cancelar\n` +
        `✏️ *EDITAR* para mais alterações`
      );

    } else if (intent.intent === "remove_food") {
      let updatedFoods = [...pendingFoods];
      
      if (intent.details?.foodIndex !== undefined && intent.details.foodIndex >= 0 && intent.details.foodIndex < updatedFoods.length) {
        updatedFoods.splice(intent.details.foodIndex, 1);
      } else if (intent.details?.newFood?.name) {
        const nameToRemove = intent.details.newFood.name.toLowerCase();
        updatedFoods = updatedFoods.filter((f: any) => {
          const foodName = (f.nome || f.name || "").toLowerCase();
          return !foodName.includes(nameToRemove);
        });
      }
      
      const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
      
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ analysis_result: updatedAnalysis })
        .eq("id", pending.id);

      if (foodHistoryId) {
        await supabase
          .from("food_history")
          .update({ food_items: updatedFoods })
          .eq("id", foodHistoryId);
      }
      
      const foodsList = updatedFoods
        .map((f: any) => `• ${f.nome || f.name} (${f.quantidade ?? f.grams ?? "?"}g)`)
        .join("\n");
      
      await sendWhatsApp(
        phone,
        `✅ *Removido!*\n\n` +
        `Lista atualizada:\n${foodsList || "(lista vazia)"}\n\n` +
        `✅ *SIM* para confirmar\n` +
        `❌ *NÃO* para cancelar\n` +
        `✏️ *EDITAR* para mais alterações`
      );

    } else if (intent.intent === "replace_food" && intent.details?.newFood) {
      let updatedFoods = [...pendingFoods];
      const indexToReplace = intent.details.foodIndex ?? 0;
      
      if (indexToReplace >= 0 && indexToReplace < updatedFoods.length) {
        updatedFoods[indexToReplace] = {
          nome: intent.details.newFood.name,
          quantidade: intent.details.newFood.grams || 100,
          name: intent.details.newFood.name,
          grams: intent.details.newFood.grams || 100
        };
      }
      
      const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
      
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ analysis_result: updatedAnalysis })
        .eq("id", pending.id);

      if (foodHistoryId) {
        await supabase
          .from("food_history")
          .update({ food_items: updatedFoods })
          .eq("id", foodHistoryId);
      }
      
      const foodsList = updatedFoods
        .map((f: any) => `• ${f.nome || f.name} (${f.quantidade ?? f.grams ?? "?"}g)`)
        .join("\n");
      
      await sendWhatsApp(
        phone,
        `✅ *Substituído!*\n\n` +
        `Lista atualizada:\n${foodsList}\n\n` +
        `✅ *SIM* para confirmar\n` +
        `❌ *NÃO* para cancelar\n` +
        `✏️ *EDITAR* para mais alterações`
      );

    } else {
      // 🔥 INTELIGÊNCIA: Se não entendeu como confirmação, tenta responder com IA
      const lowerText = messageText.toLowerCase().trim();
      const almostConfirmation = ["s", "si", "sim", "smi", "n", "na", "nao", "não", "e", "ed", "edi", "edt", "1", "2", "3"].includes(lowerText);
      
      if (almostConfirmation) {
        // Parece tentativa de confirmação mas ambígua
        await sendWhatsApp(
          phone,
          `🤔 Não entendi. Responda:\n` +
          `✅ *1* ou *SIM* para confirmar\n` +
          `❌ *2* ou *NÃO* para cancelar\n` +
          `✏️ *3* ou *EDITAR* para corrigir`
        );
      } else {
        // É outra coisa - deixar a IA responder
        console.log("[WhatsApp Nutrition] Fallback para IA no handleConfirmation");
        await handleSmartResponse(user, phone, messageText);
        
        // Lembrete da pendência
        const foodsList = pendingFoods.slice(0, 3).map((f: any) => f.nome || f.name).join(", ");
        await sendWhatsApp(
          phone,
          `\n💡 _Só pra lembrar: você tem uma refeição pendente (${foodsList}). Responda *1*, *2* ou *3* quando quiser finalizar!_`
        );
      }
    }

  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro na confirmação:", error);
    await sendWhatsApp(phone, "❌ Erro ao processar. Tente novamente!");
  }
}

// =============== PROCESSAMENTO DE EDIÇÃO ===============

async function handleEdit(
  user: { id: string },
  pending: any,
  messageText: string,
  phone: string
): Promise<void> {
  try {
    const analysis = pending.analysis_result || {};
    const pendingFoods = analysis.detectedFoods || analysis.foods || [];
    const foodHistoryId = analysis.food_history_id;

    // Verificar se quer finalizar edição
    if (isEditDone(messageText)) {
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ waiting_edit: false })
        .eq("id", pending.id);

      const foodsList = pendingFoods
        .map((f: any) => `• ${f.nome || f.name} (${f.quantidade ?? f.grams ?? "?"}g)`)
        .join("\n");

      await sendWhatsApp(
        phone,
        `✅ *Edição finalizada!*\n\n` +
        `Lista final:\n${foodsList}\n\n` +
        `Confirmar registro?\n` +
        `✅ *SIM* para confirmar\n` +
        `❌ *NÃO* para cancelar`
      );
      return;
    }

    // Usar IA para interpretar edição
    const intent = await interpretUserIntent(messageText, "editing_foods", pendingFoods);

    let updatedFoods = [...pendingFoods];
    let actionMessage = "";

    if (intent.intent === "add_food" && intent.details?.newFood) {
      const newFood = {
        nome: intent.details.newFood.name,
        quantidade: intent.details.newFood.grams || 100,
        name: intent.details.newFood.name,
        grams: intent.details.newFood.grams || 100
      };
      updatedFoods.push(newFood);
      actionMessage = `✅ Adicionado: ${newFood.nome} (${newFood.quantidade}g)`;
    } else if (intent.intent === "remove_food") {
      if (intent.details?.foodIndex !== undefined) {
        const removed = updatedFoods.splice(intent.details.foodIndex, 1)[0];
        actionMessage = `✅ Removido: ${removed?.nome || removed?.name || "item"}`;
      } else if (intent.details?.newFood?.name) {
        const nameToRemove = intent.details.newFood.name.toLowerCase();
        const before = updatedFoods.length;
        updatedFoods = updatedFoods.filter((f: any) => {
          const foodName = (f.nome || f.name || "").toLowerCase();
          return !foodName.includes(nameToRemove);
        });
        if (updatedFoods.length < before) {
          actionMessage = `✅ Removido: ${intent.details.newFood.name}`;
        }
      }
    } else if (intent.intent === "replace_food" && intent.details?.newFood) {
      const indexToReplace = intent.details.foodIndex ?? 0;
      if (indexToReplace >= 0 && indexToReplace < updatedFoods.length) {
        const oldFood = updatedFoods[indexToReplace];
        updatedFoods[indexToReplace] = {
          nome: intent.details.newFood.name,
          quantidade: intent.details.newFood.grams || 100,
          name: intent.details.newFood.name,
          grams: intent.details.newFood.grams || 100
        };
        actionMessage = `✅ Substituído: ${oldFood?.nome || oldFood?.name} → ${intent.details.newFood.name}`;
      }
    } else {
      // Tentar comando de texto manual
      const command = parseEditCommand(messageText, pendingFoods);
      if (command) {
        if (command.action === 'add' && command.newFood) {
          updatedFoods.push({
            nome: command.newFood.name,
            quantidade: command.newFood.grams,
            name: command.newFood.name,
            grams: command.newFood.grams
          });
          actionMessage = `✅ Adicionado: ${command.newFood.name} (${command.newFood.grams}g)`;
        } else if (command.action === 'remove' && command.index !== undefined) {
          const removed = updatedFoods.splice(command.index, 1)[0];
          actionMessage = `✅ Removido: ${removed?.nome || removed?.name}`;
        } else if (command.action === 'replace' && command.index !== undefined && command.newFood) {
          updatedFoods[command.index] = {
            nome: command.newFood.name,
            quantidade: command.newFood.grams,
            name: command.newFood.name,
            grams: command.newFood.grams
          };
          actionMessage = `✅ Substituído para: ${command.newFood.name} (${command.newFood.grams}g)`;
        }
      }
    }

    if (actionMessage) {
      const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ analysis_result: updatedAnalysis })
        .eq("id", pending.id);

      // Atualizar food_history também
      if (foodHistoryId) {
        await supabase
          .from("food_history")
          .update({ food_items: updatedFoods })
          .eq("id", foodHistoryId);
      }

      const numberedList = updatedFoods
        .map((f: any, i: number) => `${i + 1}. ${f.nome || f.name} (${f.quantidade ?? f.grams}g)`)
        .join("\n");

      await sendWhatsApp(
        phone,
        `${actionMessage}\n\n` +
        `Lista atualizada:\n${numberedList}\n\n` +
        `Continue editando ou responda *PRONTO*`
      );
    } else {
      await sendWhatsApp(
        phone,
        `🤔 Não entendi. Tente:\n` +
        `• "Adiciona banana 100g"\n` +
        `• "Tira o arroz"\n` +
        `• "Trocar 1 por macarrão 200g"\n\n` +
        `Ou responda *PRONTO* para finalizar`
      );
    }

  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro na edição:", error);
    await sendWhatsApp(phone, "❌ Erro ao editar. Tente novamente!");
  }
}

// =============== PROCESSAMENTO DE EXAME MÉDICO ===============

async function handleMedicalResponse(
  user: { id: string },
  pending: any,
  messageText: string,
  phone: string
): Promise<void> {
  try {
    // Implementação simplificada para exames médicos
    if (isConfirmationPositive(messageText)) {
      await supabase
        .from("whatsapp_pending_medical")
        .update({ is_processed: true, confirmed: true })
        .eq("id", pending.id);

      await sendWhatsApp(phone, "✅ Exame registrado com sucesso!\n\n🩺 Dr. Vital está analisando seus resultados.");
    } else if (isConfirmationNegative(messageText)) {
      await supabase
        .from("whatsapp_pending_medical")
        .update({ is_processed: true, confirmed: false })
        .eq("id", pending.id);

      await sendWhatsApp(phone, "❌ Exame não registrado.\n\n📸 Envie novamente se precisar!");
    }
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro no exame médico:", error);
  }
}
